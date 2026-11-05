<?php

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

beforeEach(function (): void {
    Cache::flush();
    Storage::fake('local');
    bindReleaseFixturePlatforms();
});

// Overrides: `github`, `appcast`, `homebrew`, `us`, `de` responses.
function fakeReleaseChannels(array $overrides = []): void
{
    $iosApp = ['version' => '1.0', 'minimumOsVersion' => '18.0', 'price' => 0.0];

    Http::fake([
        RELEASES_FAKE_GITHUB_LATEST => $overrides['github'] ?? Http::response(githubReleasePayload()),
        RELEASES_FAKE_APPCAST => $overrides['appcast'] ?? Http::response(appcastXml('0.77.0')),
        'formulae.brew.sh/api/cask/tablepro.json' => $overrides['homebrew'] ?? Http::response(['token' => 'tablepro', 'version' => '0.76.1']),
        'itunes.apple.com/lookup?id=6761621829&country=us' => $overrides['us'] ?? Http::response(['resultCount' => 1, 'results' => [$iosApp]]),
        'itunes.apple.com/lookup?id=6761621829&country=de' => $overrides['de'] ?? Http::response(['resultCount' => 0, 'results' => []]),
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
    'an excluded storefront that lists the app' => [[], fn(): array => ['de' => Http::response(['resultCount' => 1, 'results' => [['version' => '1.0']]])]],
]);

it('passes once platforms.json follows the channel', function (array $platforms, Closure $channels): void {
    bindReleaseFixturePlatforms($platforms);
    fakeReleaseChannels($channels());

    $this->artisan('release:check')->assertSuccessful();
})->with([
    'floorVersion follows Homebrew' => [['mac.floorVersion' => '0.77.0'], fn(): array => ['homebrew' => Http::response(['token' => 'tablepro', 'version' => '0.77.0'])]],
    'the exclusions are gone' => [['ios.storefrontExclusions' => []], fn(): array => ['de' => Http::response(['resultCount' => 1, 'results' => [['version' => '1.0']]])]],
]);

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
