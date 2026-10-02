<?php

use App\Services\Releases\MacRelease;
use App\Services\Releases\MacReleaseService;
use App\Services\Releases\SparkleAppcast;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

require_once __DIR__ . '/ReleaseFixtures.php';

/**
 * Where the download buttons point (architecture §1.13).
 *
 * GitHub `releases/latest` first, the Sparkle appcast second, never the first
 * entry of the full releases list (plugin releases crowd it). A fresh copy for
 * 15 minutes, a last-good copy on disk that outlives `cache:clear`, a
 * 15-minute failure marker, and an honest `unavailable` when nothing ever
 * answered. Every response is faked; nothing here reaches the network, and
 * the disk is a fake.
 */
beforeEach(function (): void {
    Cache::flush();
    Storage::fake(MacReleaseService::LAST_GOOD_DISK);
    bindReleaseFixturePlatforms();
});

function macRelease(): MacRelease
{
    return app(MacReleaseService::class)->latest();
}

function githubApiCalls(): int
{
    return Http::recorded(fn(Request $request): bool => str_contains($request->url(), 'api.github.com'))->count();
}

it('reads the app release from releases/latest, with both DMGs and their sizes', function (): void {
    Http::fake([RELEASES_FAKE_GITHUB_LATEST => Http::response(githubReleasePayload())]);

    $release = macRelease();

    expect($release->source)->toBe(MacRelease::SOURCE_GITHUB)
        ->and($release->version)->toBe('0.77.0')
        ->and($release->publishedAt)->toBe('2026-10-02')
        ->and($release->assets['arm64'])->toBe([
            'name' => 'TablePro-0.77.0-arm64.dmg',
            'url' => 'https://github.com/TableProApp/TablePro/releases/download/v0.77.0/TablePro-0.77.0-arm64.dmg',
            'bytes' => 22_943_352,
        ])
        ->and($release->assets['x86_64']['name'])->toBe('TablePro-0.77.0-x86_64.dmg')
        ->and($release->assets['x86_64']['bytes'])->toBe(26_202_607)
        ->and($release->releaseUrl)->toBe('https://github.com/TableProApp/TablePro/releases/tag/v0.77.0')
        ->and($release->releasesUrl)->toBe('https://github.com/TableProApp/TablePro/releases');

    Http::assertSentCount(1);
    Http::assertNotSent(fn(Request $request): bool => str_contains($request->url(), '/releases?') || str_ends_with($request->url(), '/releases'));
});

it('formats the release date for the reader in PHP, in each locale', function (): void {
    Http::fake([RELEASES_FAKE_GITHUB_LATEST => Http::response(githubReleasePayload())]);

    $release = macRelease();

    expect($release->toProps('en')['publishedAtFormatted'])->toBe('October 2, 2026')
        ->and($release->toProps('vi')['publishedAtFormatted'])->toBe('2 tháng 10 năm 2026')
        ->and($release->toArray())->not->toHaveKey('publishedAtFormatted');
});

it('rejects a plugin release reported as latest and falls back to the appcast', function (): void {
    Http::fake([
        RELEASES_FAKE_GITHUB_LATEST => Http::response(githubReleasePayload('plugin-etcd-v1.0.39', assets: [
            ['name' => 'EtcdDriverPlugin-arm64.zip', 'size' => 1000, 'state' => 'uploaded', 'browser_download_url' => 'https://github.com/x/p.zip'],
        ])),
        RELEASES_FAKE_APPCAST => Http::response(appcastXml('0.77.0')),
    ]);

    $release = macRelease();

    expect($release->source)->toBe(MacRelease::SOURCE_APPCAST)
        ->and($release->version)->toBe('0.77.0');
});

it('rejects an app release missing one architecture', function (): void {
    Http::fake([
        RELEASES_FAKE_GITHUB_LATEST => Http::response(githubReleasePayload(assets: [
            githubAsset('TablePro-0.77.0-arm64.dmg', 22_943_352),
        ])),
        RELEASES_FAKE_APPCAST => Http::response(appcastXml('0.76.1')),
    ]);

    expect(macRelease())->source->toBe(MacRelease::SOURCE_APPCAST)->version->toBe('0.76.1');
});

it('rejects an asset still uploading, a draft and a prerelease', function (array $payload): void {
    Http::fake([
        RELEASES_FAKE_GITHUB_LATEST => Http::response($payload),
        RELEASES_FAKE_APPCAST => Http::response(appcastXml('0.76.1')),
    ]);

    expect(macRelease()->source)->toBe(MacRelease::SOURCE_APPCAST);
})->with([
    'uploading' => [githubReleasePayload(assets: [
        githubAsset('TablePro-0.77.0-arm64.dmg', 22_943_352),
        [...githubAsset('TablePro-0.77.0-x86_64.dmg', 0), 'state' => 'new'],
    ])],
    'draft' => [githubReleasePayload(overrides: ['draft' => true])],
    'prerelease' => [githubReleasePayload(overrides: ['prerelease' => true])],
    'not a version tag' => [githubReleasePayload('nightly')],
]);

it('builds the DMG links from platforms.json when it falls back to the appcast', function (): void {
    Http::fake([
        RELEASES_FAKE_GITHUB_LATEST => Http::response(['message' => 'API rate limit exceeded'], 403),
        RELEASES_FAKE_APPCAST => Http::response(appcastXml('0.77.0', 'Fri, 02 Oct 2026 04:15:25 +0000')),
    ]);

    $release = macRelease();

    expect($release->source)->toBe(MacRelease::SOURCE_APPCAST)
        ->and($release->publishedAt)->toBe('2026-10-02')
        ->and($release->assets['arm64'])->toBe([
            'name' => 'TablePro-0.77.0-arm64.dmg',
            'url' => 'https://github.com/TableProApp/TablePro/releases/download/v0.77.0/TablePro-0.77.0-arm64.dmg',
            'bytes' => null,
        ])
        ->and($release->assets['x86_64']['url'])->toBe('https://github.com/TableProApp/TablePro/releases/download/v0.77.0/TablePro-0.77.0-x86_64.dmg')
        ->and($release->releaseUrl)->toBe('https://github.com/TableProApp/TablePro/releases/tag/v0.77.0');
});

it('takes the fallback DMG links from the dmg destination’s urlTemplate when platforms.json has one', function (): void {
    bindReleaseFixturePlatforms(['mac.destinations' => [
        ['kind' => 'dmg', 'urlTemplate' => 'https://mirror.example/tablepro/v{version}/TablePro-{version}-{arch}.dmg'],
        ['kind' => 'releases', 'url' => 'https://github.com/TableProApp/TablePro/releases'],
    ]]);
    Http::fake([
        RELEASES_FAKE_GITHUB_LATEST => Http::response('', 502),
        RELEASES_FAKE_APPCAST => Http::response(appcastXml('0.77.0')),
    ]);

    $release = macRelease();

    expect($release->source)->toBe(MacRelease::SOURCE_APPCAST)
        ->and($release->assets['arm64']['url'])->toBe('https://mirror.example/tablepro/v0.77.0/TablePro-0.77.0-arm64.dmg')
        ->and($release->assets['x86_64']['url'])->toBe('https://mirror.example/tablepro/v0.77.0/TablePro-0.77.0-x86_64.dmg');
});

it('serves a fresh copy for 15 minutes without calling GitHub again', function (): void {
    Http::fake([RELEASES_FAKE_GITHUB_LATEST => Http::response(githubReleasePayload())]);

    macRelease();
    $this->travel(14)->minutes();
    macRelease();

    expect(githubApiCalls())->toBe(1);

    $this->travel(2)->minutes();
    macRelease();

    expect(githubApiCalls())->toBe(2);
});

/*
 * Architecture §1.13 "Rate": at most four calls an hour against an
 * unauthenticated limit of 60 per IP, on a host shared with other sites. It
 * has to hold while GitHub is down too, which is when a retry loop would
 * spend the limit fastest.
 */
it('calls the GitHub API at most four times an hour, healthy or not', function (callable $fake): void {
    $fake();

    for ($minute = 0; $minute < 60; $minute++) {
        macRelease();
        $this->travel(1)->minutes();
    }

    expect(githubApiCalls())->toBeLessThanOrEqual(4);
})->with([
    'healthy' => [fn() => Http::fake([RELEASES_FAKE_GITHUB_LATEST => Http::response(githubReleasePayload())])],
    'GitHub and the appcast both down' => [fn() => Http::fake([
        RELEASES_FAKE_GITHUB_LATEST => Http::response('', 502),
        RELEASES_FAKE_APPCAST => Http::response('', 503),
    ])],
    'GitHub down, the appcast answering' => [fn() => Http::fake([
        RELEASES_FAKE_GITHUB_LATEST => Http::response('', 502),
        RELEASES_FAKE_APPCAST => Http::response(appcastXml('0.77.0', 'Fri, 02 Oct 2026 04:15:25 +0000', '13.0')),
    ])],
    'no connection at all' => [fn() => Http::fake([
        RELEASES_FAKE_GITHUB_LATEST => Http::failedConnection(),
        RELEASES_FAKE_APPCAST => Http::failedConnection(),
    ])],
]);

it('serves the last good copy when both sources fail, and stops retrying for 15 minutes', function (): void {
    Http::fakeSequence(RELEASES_FAKE_GITHUB_LATEST)
        ->push(githubReleasePayload('v0.76.1', assets: [
            githubAsset('TablePro-0.76.1-arm64.dmg', 1, 'v0.76.1'),
            githubAsset('TablePro-0.76.1-x86_64.dmg', 2, 'v0.76.1'),
        ]))
        ->whenEmpty(Http::response('', 502));
    Http::fake([RELEASES_FAKE_APPCAST => Http::response('', 503)]);

    expect(macRelease()->version)->toBe('0.76.1');

    $this->travel(16)->minutes();

    $stale = macRelease();

    expect($stale->version)->toBe('0.76.1')
        ->and($stale->assets['arm64']['url'])->toEndWith('/TablePro-0.76.1-arm64.dmg')
        ->and(Cache::has(MacReleaseService::FAILURE_KEY))->toBeTrue();

    $calls = githubApiCalls();

    $this->travel(14)->minutes();
    macRelease();

    expect(githubApiCalls())->toBe($calls);

    $this->travel(2)->minutes();
    macRelease();

    expect(githubApiCalls())->toBe($calls + 1);
});

/*
 * The deploy runs `optimize:clear` on every PHP change, and that runs
 * `cache:clear`. A last good copy kept in the cache store was gone after
 * every such deploy, so a GitHub outage on the first request afterwards
 * left both buttons without a version.
 */
it('keeps the last good copy through cache:clear', function (): void {
    Http::fakeSequence(RELEASES_FAKE_GITHUB_LATEST)
        ->push(githubReleasePayload())
        ->whenEmpty(Http::response('', 502));
    Http::fake([RELEASES_FAKE_APPCAST => Http::response('', 503)]);

    expect(macRelease()->version)->toBe('0.77.0');

    Artisan::call('cache:clear');

    $release = macRelease();

    expect($release->source)->toBe(MacRelease::SOURCE_GITHUB)
        ->and($release->version)->toBe('0.77.0')
        ->and($release->assets['arm64']['url'])->toEndWith('/TablePro-0.77.0-arm64.dmg')
        ->and(Storage::disk(MacReleaseService::LAST_GOOD_DISK)->exists(MacReleaseService::LAST_GOOD_FILE))->toBeTrue();
});

it('ignores a last good copy it cannot read', function (): void {
    Storage::disk(MacReleaseService::LAST_GOOD_DISK)->put(MacReleaseService::LAST_GOOD_FILE, '{"version":');
    Http::fake([
        RELEASES_FAKE_GITHUB_LATEST => Http::response('', 502),
        RELEASES_FAKE_APPCAST => Http::response('', 503),
    ]);

    expect(macRelease()->source)->toBe(MacRelease::SOURCE_UNAVAILABLE);
});

it('is unavailable when nothing ever answered: no version, and both buttons open the latest release page', function (): void {
    Http::fake([
        RELEASES_FAKE_GITHUB_LATEST => Http::failedConnection(),
        RELEASES_FAKE_APPCAST => Http::failedConnection(),
    ]);

    $release = macRelease();

    expect($release->source)->toBe(MacRelease::SOURCE_UNAVAILABLE)
        ->and($release->isAvailable())->toBeFalse()
        ->and($release->version)->toBeNull()
        ->and($release->publishedAt)->toBeNull()
        ->and($release->assets['arm64'])->toBe(['name' => null, 'url' => 'https://github.com/TableProApp/TablePro/releases/latest', 'bytes' => null])
        ->and($release->assets['x86_64']['url'])->toBe('https://github.com/TableProApp/TablePro/releases/latest')
        ->and($release->toProps('en')['publishedAtFormatted'])->toBeNull();
});

it('caches the failure, so a broken API is not called on every request', function (): void {
    Http::fake([
        RELEASES_FAKE_GITHUB_LATEST => Http::response('', 500),
        RELEASES_FAKE_APPCAST => Http::response('', 500),
    ]);

    for ($i = 0; $i < 10; $i++) {
        expect(macRelease()->source)->toBe(MacRelease::SOURCE_UNAVAILABLE);
    }

    expect(githubApiCalls())->toBe(1);
    Http::assertSentCount(2);
});

it('reads only the top appcast item, and ignores a feed it cannot parse', function (): void {
    expect(SparkleAppcast::parse(appcastXml('0.77.0', 'Fri, 02 Oct 2026 04:15:25 +0000', '13.0')))->toBe([
        'version' => '0.77.0',
        'publishedAt' => '2026-10-02',
        'minimumSystemVersion' => '13.0',
    ]);

    expect(SparkleAppcast::parse(''))->toBeNull()
        ->and(SparkleAppcast::parse('<html>rate limited</html>'))->toBeNull()
        ->and(SparkleAppcast::parse('<rss><channel></channel></rss>'))->toBeNull()
        ->and(SparkleAppcast::parse('<rss><channel><item><title>latest</title></item></channel></rss>'))->toBeNull();
});

it('reads the appcast from the feed the app itself uses', function (): void {
    expect(app(SparkleAppcast::class)->feedUrl())
        ->toBe('https://raw.githubusercontent.com/TableProApp/TablePro/main/appcast.xml');
});
