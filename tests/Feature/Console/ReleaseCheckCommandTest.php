<?php

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

beforeEach(function (): void {
    Cache::flush();
    Storage::fake('local');
    bindReleaseFixturePlatforms();
});

// Overrides: `github`, `appcast`, `homebrew`, `us`, `fr` responses.
function fakeReleaseChannels(array $overrides = []): void
{
    $iosApp = ['version' => '1.0', 'minimumOsVersion' => '18.0', 'price' => 0.0];

    Http::fake([
        RELEASES_FAKE_GITHUB_LATEST => $overrides['github'] ?? Http::response(githubReleasePayload()),
        RELEASES_FAKE_APPCAST => $overrides['appcast'] ?? Http::response(appcastXml('0.77.0')),
        'formulae.brew.sh/api/cask/tablepro.json' => $overrides['homebrew'] ?? Http::response(['token' => 'tablepro', 'version' => '0.76.1']),
        'itunes.apple.com/lookup?id=6761621829&country=us' => $overrides['us'] ?? Http::response(['resultCount' => 1, 'results' => [$iosApp]]),
        'itunes.apple.com/lookup?id=6761621829&country=fr' => $overrides['fr'] ?? Http::response(['resultCount' => 0, 'results' => []]),
    ]);
}

it('passes when every channel matches platforms.json, with Homebrew trailing as recorded', function (): void {
    fakeReleaseChannels();

    $this->artisan('release:check')
        ->expectsOutputToContain('differs (expected)')
        ->doesntExpectOutputToContain('DRIFT')
        ->assertSuccessful();
});

it('fails when a channel disagrees with platforms.json', function (array $platforms, Closure $channels): void {
    bindReleaseFixturePlatforms($platforms);
    fakeReleaseChannels($channels());

    $this->artisan('release:check')->expectsOutputToContain('DRIFT')->assertFailed();
})->with([
    'a newer GitHub release' => [[], fn(): array => ['github' => Http::response(githubReleasePayload('v0.78.0')), 'appcast' => Http::response(appcastXml('0.78.0'))]],
    'another publish date' => [['mac.release.publishedAt' => '2026-09-28'], fn(): array => []],
    'Homebrew caught up, floorVersion not bumped' => [[], fn(): array => ['homebrew' => Http::response(['token' => 'tablepro', 'version' => '0.77.0'])]],
    'another minimum macOS in the appcast' => [[], fn(): array => ['appcast' => Http::response(appcastXml('0.77.0', minimum: '14.0'))]],
    'a new iOS version on the App Store' => [[], fn(): array => ['us' => Http::response(['resultCount' => 1, 'results' => [['version' => '1.1', 'minimumOsVersion' => '18.0', 'price' => 0.0]]])]],
    'an excluded storefront that lists the app' => [[], fn(): array => ['fr' => Http::response(['resultCount' => 1, 'results' => [['version' => '1.0']]])]],
]);

it('passes once platforms.json follows the channel', function (array $platforms, Closure $channels): void {
    bindReleaseFixturePlatforms($platforms);
    fakeReleaseChannels($channels());

    $this->artisan('release:check')->assertSuccessful();
})->with([
    'floorVersion follows Homebrew' => [['mac.floorVersion' => '0.77.0'], fn(): array => ['homebrew' => Http::response(['token' => 'tablepro', 'version' => '0.77.0'])]],
    'the exclusions are gone' => [['ios.storefrontExclusions' => []], fn(): array => ['fr' => Http::response(['resultCount' => 1, 'results' => [['version' => '1.0']]])]],
]);

it('asks every excluded storefront, and only those', function (): void {
    bindReleaseFixturePlatforms(['ios.storefrontExclusions' => ['fr', 'cn']]);
    fakeReleaseChannels();
    Http::fake(['itunes.apple.com/lookup?id=6761621829&country=cn' => Http::response(['resultCount' => 0, 'results' => []])]);

    $this->artisan('release:check')
        ->expectsOutputToContain('App Store (fr)')
        ->expectsOutputToContain('App Store (cn)')
        ->doesntExpectOutputToContain('App Store (de)')
        ->assertSuccessful();
});

it('fails, rather than passing silently, when a channel cannot be read', function (): void {
    fakeReleaseChannels(['homebrew' => Http::failedConnection()]);

    $this->artisan('release:check')->expectsOutputToContain('UNREADABLE')->assertFailed();
});

it('bypasses the cached release the site serves', function (): void {
    Cache::forever('releases:mac', ['stale' => true]);
    fakeReleaseChannels();

    $this->artisan('release:check')->assertSuccessful();

    Http::assertSent(fn($request): bool => str_contains($request->url(), 'releases/latest'));
});

function releasedLinuxFixture(): array
{
    $linux = collect(json_decode(File::get(resource_path('data/platforms.json')), true)['platforms'])->firstWhere('id', 'linux');

    return ['linux' => [...$linux, 'status' => 'released', 'release' => ['version' => '0.1.0-beta.1', 'build' => null, 'publishedAt' => '2026-11-06']]];
}

function fakeLinuxChannels(string $ppa = '0.1.0~beta.1-0ppa1~26.04', string $copr = '0.1.0~beta.1-1'): void
{
    Http::fake([
        'api.github.com/repos/TableProApp/TablePro/releases?*' => Http::response([[
            'tag_name' => 'linux-v0.1.0-beta.1',
            'draft' => false,
            'prerelease' => true,
            'published_at' => '2026-11-06T10:00:00Z',
            'assets' => [['name' => 'tablepro-0.1.0-beta.1-x86_64.flatpak', 'state' => 'uploaded', 'size' => 1, 'browser_download_url' => 'https://github.com/TableProApp/TablePro/releases/download/linux-v0.1.0-beta.1/tablepro-0.1.0-beta.1-x86_64.flatpak']],
        ]]),
        'api.launchpad.net/1.0/~tablepro/+archive/ubuntu/tablepro-beta*' => Http::response(['entries' => [['source_package_version' => $ppa]]]),
        'copr.fedorainfracloud.org/api_3/package*' => Http::response(['builds' => ['latest_succeeded' => ['source_package' => ['version' => $copr]]]]),
        'flatpak.tablepro.app/*' => Http::response('', 200),
    ]);
    fakeReleaseChannels();
}

it('leaves Linux out until it ships', function (): void {
    fakeReleaseChannels();

    $this->artisan('release:check')->doesntExpectOutputToContain('Launchpad PPA')->assertSuccessful();
});

it('checks the Linux release on GitHub, the PPA, COPR and the Flatpak repository once Linux ships', function (): void {
    bindReleaseFixturePlatforms(releasedLinuxFixture());
    fakeLinuxChannels();

    $this->artisan('release:check')
        ->expectsOutputToContain('GitHub linux-v releases')
        ->expectsOutputToContain('Launchpad PPA')
        ->expectsOutputToContain('COPR')
        ->expectsOutputToContain('Flatpak repository')
        ->doesntExpectOutputToContain('DRIFT')
        ->assertSuccessful();
});

it('reports a Linux channel that has moved past platforms.json', function (): void {
    bindReleaseFixturePlatforms(releasedLinuxFixture());
    fakeLinuxChannels(copr: '0.1.0~beta.2-1');

    $this->artisan('release:check')->expectsOutputToContain('DRIFT')->assertFailed();
});
