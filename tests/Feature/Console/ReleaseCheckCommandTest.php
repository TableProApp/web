<?php

use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

require_once __DIR__ . '/../Releases/ReleaseFixtures.php';

/**
 * `php artisan release:check` (architecture §1.13): the live channels against
 * platforms.json. Every channel is faked; nothing reaches the network.
 */
beforeEach(function (): void {
    Cache::flush();
    Storage::fake('local');
    bindReleaseFixturePlatforms();
});

/**
 * Fakes every channel `release:check` reads, as they stood on 2026-10-02:
 * GitHub and Sparkle at 0.77.0, Homebrew at 0.76.1, iOS 1.0 in the US and
 * missing from the German storefront.
 *
 * @param  array<string, mixed>  $overrides  `github`, `appcast`, `homebrew`, `us`, `de` responses
 */
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

it('fails when GitHub has a newer release than platforms.json', function (): void {
    fakeReleaseChannels([
        'github' => Http::response(githubReleasePayload('v0.78.0')),
        'appcast' => Http::response(appcastXml('0.78.0')),
    ]);

    $this->artisan('release:check')
        ->expectsOutputToContain('DRIFT')
        ->assertFailed();
});

it('fails when platforms.json records a different publish date than GitHub', function (): void {
    bindReleaseFixturePlatforms(['mac.release.publishedAt' => '2026-09-28']);
    fakeReleaseChannels();

    expect(Artisan::call('release:check'))->toBe(1)
        ->and(Artisan::output())->toMatch('/published +\\| 2026-09-28 +\\| 2026-10-02 +\\| DRIFT/');
});

it('fails when Homebrew caught up but floorVersion was not bumped', function (): void {
    fakeReleaseChannels(['homebrew' => Http::response(['token' => 'tablepro', 'version' => '0.77.0'])]);

    expect(Artisan::call('release:check'))->toBe(1)
        ->and(Artisan::output())->toMatch('/floorVersion \\(lowest served\\) \\| 0\\.76\\.1 +\\| 0\\.77\\.0 +\\| DRIFT/');
});

it('passes once floorVersion follows Homebrew', function (): void {
    bindReleaseFixturePlatforms(['mac.floorVersion' => '0.77.0']);
    fakeReleaseChannels(['homebrew' => Http::response(['token' => 'tablepro', 'version' => '0.77.0'])]);

    $this->artisan('release:check')->assertSuccessful();
});

it('fails when the minimum macOS in the appcast differs', function (): void {
    fakeReleaseChannels(['appcast' => Http::response(appcastXml('0.77.0', minimum: '14.0'))]);

    $this->artisan('release:check')->assertFailed();
});

it('fails when the App Store has a new iOS version', function (): void {
    fakeReleaseChannels(['us' => Http::response(['resultCount' => 1, 'results' => [['version' => '1.1', 'minimumOsVersion' => '18.0', 'price' => 0.0]]])]);

    $this->artisan('release:check')->assertFailed();
});

it('fails when the German storefront lists the app while platforms.json excludes it', function (): void {
    fakeReleaseChannels(['de' => Http::response(['resultCount' => 1, 'results' => [['version' => '1.0']]])]);

    $this->artisan('release:check')->assertFailed();
});

it('passes when the exclusions are gone and the German storefront lists the app', function (): void {
    bindReleaseFixturePlatforms(['ios.storefrontExclusions' => []]);
    fakeReleaseChannels(['de' => Http::response(['resultCount' => 1, 'results' => [['version' => '1.0']]])]);

    $this->artisan('release:check')->assertSuccessful();
});

it('fails, rather than passing silently, when a channel cannot be read', function (): void {
    fakeReleaseChannels(['homebrew' => Http::failedConnection()]);

    $this->artisan('release:check')
        ->expectsOutputToContain('UNREADABLE')
        ->assertFailed();
});

it('bypasses the cached release the site serves', function (): void {
    Cache::forever('releases:mac', ['stale' => true]);
    fakeReleaseChannels();

    $this->artisan('release:check')->assertSuccessful();

    Http::assertSent(fn($request): bool => str_contains($request->url(), 'releases/latest'));
});
