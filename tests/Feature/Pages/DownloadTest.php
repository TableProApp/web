<?php

use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia;
use Spatie\YamlFrontMatter\YamlFrontMatter;

use function Pest\Laravel\get;

beforeEach(function (): void {
    Cache::flush();
    Storage::fake('local');
    bindReleaseFixturePlatforms();
});

function downloadFakeRelease(?array $payload = null): void
{
    Http::fake([
        RELEASES_FAKE_GITHUB_LATEST => Http::response($payload ?? githubReleasePayload()),
        RELEASES_FAKE_APPCAST => Http::response(appcastXml()),
    ]);

    Artisan::call('release:refresh');
}

it('renders the stored release with its universal DMG', function (): void {
    downloadFakeRelease();

    get('/download')
        ->assertOk()
        ->assertInertia(fn(AssertableInertia $page) => $page
            ->component('Download')
            ->where('release.source', 'github')
            ->where('release.version', '0.77.0')
            ->where('release.asset.name', 'TablePro-0.77.0.dmg')
            ->where('release.asset.url', 'https://github.com/TableProApp/TablePro/releases/download/v0.77.0/TablePro-0.77.0.dmg')
            ->where('release.asset.sha256', null));
});

it('sends the DMG’s SHA-256 when the release carries one', function (): void {
    $sha256 = str_repeat('a1', 32);

    downloadFakeRelease(githubReleasePayloadWithDigest($sha256));

    get('/download')->assertInertia(fn(AssertableInertia $page) => $page->where('release.asset.sha256', $sha256));
});

it('answers without waiting on GitHub when nothing is stored, and the next page has the release', function (): void {
    Http::fake([
        RELEASES_FAKE_GITHUB_LATEST => Http::response(githubReleasePayload()),
        RELEASES_FAKE_APPCAST => Http::response(appcastXml()),
    ]);

    get('/download')->assertInertia(fn(AssertableInertia $page) => $page->where('release.source', 'unavailable'));
    get('/vi/download')->assertInertia(fn(AssertableInertia $page) => $page->where('release.version', '0.77.0'));

    expect(Http::recorded(fn(Request $request): bool => str_contains($request->url(), 'api.github.com')))->toHaveCount(1);
});

it('falls back to the latest-release page, with no version, when no source answers', function (): void {
    Http::fake([
        RELEASES_FAKE_GITHUB_LATEST => Http::response('', 500),
        RELEASES_FAKE_APPCAST => Http::response('', 500),
    ]);

    get('/download')
        ->assertOk()
        ->assertInertia(fn(AssertableInertia $page) => $page
            ->where('release.source', 'unavailable')
            ->where('release.version', null)
            ->where('release.asset.url', 'https://github.com/TableProApp/TablePro/releases/latest')
            ->where('mac.homebrewTrails', false));
});

it('flags Homebrew while the cask serves an older version than the live release', function (string $floor, bool $trails): void {
    bindReleaseFixturePlatforms(['mac.floorVersion' => $floor]);
    downloadFakeRelease();

    get('/download')->assertInertia(fn(AssertableInertia $page) => $page->where('mac.homebrewTrails', $trails));
})->with([
    'cask behind' => ['0.76.1', true],
    'cask caught up' => ['0.77.0', false],
]);

it('lists a platform as unreleased until it ships', function (): void {
    bindReleaseFixturePlatforms(['ios.status' => 'prototype']);
    downloadFakeRelease();

    get('/download')->assertInertia(fn(AssertableInertia $page) => $page
        ->where('ios', null)
        ->where('unreleased', fn($platforms): bool => in_array('ios', $platforms->all(), true)));
});

it('names the featured, published engines from engines.json', function (): void {
    downloadFakeRelease();

    $expected = collect(json_decode((string) file_get_contents(resource_path('data/engines.json')), true))
        ->filter(fn(array $engine): bool => ($engine['featured'] ?? false) === true && ($engine['state'] ?? null) === 'published')
        ->pluck('name')
        ->values()
        ->all();

    get('/download')->assertInertia(fn(AssertableInertia $page) => $page->where('featuredEngines', $expected));
});

it('links the newest release post, in English on every page', function (string $path): void {
    downloadFakeRelease();

    $newest = collect(glob(resource_path('blog/*.md')) ?: [])
        ->map(fn(string $file): array => ['slug' => pathinfo($file, PATHINFO_FILENAME), ...YamlFrontMatter::parseFile($file)->matter()])
        ->filter(fn(array $post): bool => is_string($post['release'] ?? null))
        ->sortByDesc('date')
        ->first();

    get($path)->assertInertia(fn(AssertableInertia $page) => $page
        ->where('latestPost.slug', $newest['slug'])
        ->where('latestPost.locale', 'en')
        ->where('latestPost.url', "/blog/{$newest['slug']}"));
})->with(['/download', '/vi/download']);
