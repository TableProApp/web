<?php

use App\Services\Releases\MacRelease;
use App\Services\Releases\MacReleaseService;
use App\Services\Releases\SparkleAppcast;
use Illuminate\Console\Scheduling\Event;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Defer\DeferredCallbackCollection;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

require_once __DIR__ . '/ReleaseFixtures.php';

/**
 * Where the download buttons point (architecture §1.13).
 *
 * GitHub `releases/latest` first, the Sparkle appcast second, never the first
 * entry of the full releases list (plugin releases crowd it). The scheduled
 * `release:refresh` calls them every 15 minutes; a page only reads what it
 * stored, a last-good copy on disk that outlives `cache:clear`, or an honest
 * `unavailable` when nothing ever answered. A missing copy is refreshed after
 * the response, never during it. Every response is faked; nothing here reaches
 * the network, and the disk is a fake.
 */
beforeEach(function (): void {
    Cache::flush();
    Storage::fake(MacReleaseService::LAST_GOOD_DISK);
    bindReleaseFixturePlatforms();
});

function releases(): MacReleaseService
{
    return app(MacReleaseService::class);
}

/**
 * What a page shows after one scheduled refresh.
 */
function macRelease(): MacRelease
{
    releases()->refresh();

    return releases()->latest();
}

/**
 * One page request: what it shows, then the work it left for after its response.
 */
function servePage(): MacRelease
{
    $release = releases()->latest();

    app(DeferredCallbackCollection::class)->invoke();

    return $release;
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
            'sha256' => null,
        ])
        ->and($release->assets['x86_64']['name'])->toBe('TablePro-0.77.0-x86_64.dmg')
        ->and($release->assets['x86_64']['bytes'])->toBe(26_202_607)
        ->and($release->releaseUrl)->toBe('https://github.com/TableProApp/TablePro/releases/tag/v0.77.0')
        ->and($release->releasesUrl)->toBe('https://github.com/TableProApp/TablePro/releases');

    Http::assertSentCount(1);
    Http::assertNotSent(fn(Request $request): bool => str_contains($request->url(), '/releases?') || str_ends_with($request->url(), '/releases'));
});

it('keeps each DMG’s SHA-256 when the releases API reports one, in the cache and in the last good copy', function (): void {
    $arm64 = str_repeat('a1', 32);

    Http::fake([RELEASES_FAKE_GITHUB_LATEST => Http::response(githubReleasePayload(assets: [
        githubAsset('TablePro-0.77.0-arm64.dmg', 22_943_352, digest: "sha256:{$arm64}"),
        githubAsset('TablePro-0.77.0-x86_64.dmg', 26_202_607),
    ]))]);

    $release = macRelease();

    expect($release->assets['arm64']['sha256'])->toBe($arm64)
        ->and($release->assets['x86_64']['sha256'])->toBeNull()
        ->and($release->toProps('en')['assets']['arm64']['sha256'])->toBe($arm64)
        ->and(releases()->lastGood()?->assets['arm64']['sha256'])->toBe($arm64);
});

it('states no checksum for a digest that is not a SHA-256', function (mixed $digest): void {
    Http::fake([RELEASES_FAKE_GITHUB_LATEST => Http::response(githubReleasePayload(assets: [
        [...githubAsset('TablePro-0.77.0-arm64.dmg', 22_943_352), 'digest' => $digest],
        githubAsset('TablePro-0.77.0-x86_64.dmg', 26_202_607),
    ]))]);

    expect(macRelease())->source->toBe(MacRelease::SOURCE_GITHUB)
        ->and(macRelease()->assets['arm64']['sha256'])->toBeNull();
})->with([
    'another algorithm' => ['sha512:' . str_repeat('ab', 64)],
    'too short' => ['sha256:abc123'],
    'not hex' => ['sha256:' . str_repeat('zz', 32)],
    'no prefix' => [str_repeat('ab', 32)],
    'not a string' => [42],
]);

it('reads a copy stored before checksums were kept', function (): void {
    $asset = ['name' => 'TablePro-0.77.0-arm64.dmg', 'url' => 'https://github.com/TableProApp/TablePro/releases/download/v0.77.0/TablePro-0.77.0-arm64.dmg', 'bytes' => 1];

    $release = MacRelease::fromArray([
        'version' => '0.77.0',
        'publishedAt' => '2026-10-02',
        'assets' => ['arm64' => $asset, 'x86_64' => $asset],
        'releaseUrl' => 'https://github.com/TableProApp/TablePro/releases/tag/v0.77.0',
        'releasesUrl' => 'https://github.com/TableProApp/TablePro/releases',
        'source' => MacRelease::SOURCE_GITHUB,
    ]);

    expect($release?->assets['arm64']['sha256'])->toBeNull();
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
            'sha256' => null,
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

it('answers a page from what the last refresh stored, without calling anything', function (): void {
    Http::fake([RELEASES_FAKE_GITHUB_LATEST => Http::response(githubReleasePayload())]);

    expect(releases()->refresh()?->version)->toBe('0.77.0');

    $calls = githubApiCalls();

    for ($minute = 0; $minute < 29; $minute++) {
        expect(releases()->latest()->version)->toBe('0.77.0');
        $this->travel(1)->minutes();
    }

    expect(githubApiCalls())->toBe($calls)
        ->and(app(DeferredCallbackCollection::class)->count())->toBe(0);
});

/*
 * A page used to call GitHub, then the appcast, with 5-second timeouts,
 * whenever its copy had expired: one reader every 15 minutes waited up to ten
 * seconds. Now a page serves the last good copy at once and leaves one refresh
 * for after its response.
 */
it('never calls a source while answering a page, even with no copy at all', function (): void {
    Http::fake([RELEASES_FAKE_GITHUB_LATEST => Http::response(githubReleasePayload())]);

    $release = releases()->latest();

    expect($release->source)->toBe(MacRelease::SOURCE_UNAVAILABLE)
        ->and(githubApiCalls())->toBe(0)
        ->and(app(DeferredCallbackCollection::class)->count())->toBe(1);

    // Asked twice in one request, it still leaves one refresh behind.
    releases()->latest();

    expect(app(DeferredCallbackCollection::class)->count())->toBe(1);

    app(DeferredCallbackCollection::class)->invoke();

    expect(githubApiCalls())->toBe(1)
        ->and(releases()->latest()->version)->toBe('0.77.0');
});

it('serves the last good copy while the stored one is missing, and refreshes after the response', function (): void {
    Http::fakeSequence(RELEASES_FAKE_GITHUB_LATEST)
        ->push(githubReleasePayload('v0.76.1', assets: [
            githubAsset('TablePro-0.76.1-arm64.dmg', 1, 'v0.76.1'),
            githubAsset('TablePro-0.76.1-x86_64.dmg', 2, 'v0.76.1'),
        ]))
        ->push(githubReleasePayload());

    expect(macRelease()->version)->toBe('0.76.1');

    // The scheduler stopped: the stored copy lapses after 30 minutes.
    $this->travel(31)->minutes();

    expect(servePage()->version)->toBe('0.76.1')
        ->and(githubApiCalls())->toBe(2)
        ->and(releases()->latest()->version)->toBe('0.77.0');
});

/*
 * Architecture §1.13 "Rate": at most four calls an hour against an
 * unauthenticated limit of 60 per IP, on a host shared with other sites. It
 * has to hold while GitHub is down too, which is when a retry loop would
 * spend the limit fastest. Simulated as the server runs it: the scheduler
 * every 15 minutes, and a page every minute.
 */
it('calls the GitHub API at most four times an hour, healthy or not', function (callable $fake): void {
    $fake();

    for ($minute = 0; $minute < 60; $minute++) {
        if ($minute % 15 === 0) {
            Artisan::call('release:refresh');
        }

        servePage();
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

it('serves the last good copy when both sources fail, and pages stop asking for 15 minutes', function (): void {
    Http::fakeSequence(RELEASES_FAKE_GITHUB_LATEST)
        ->push(githubReleasePayload('v0.76.1', assets: [
            githubAsset('TablePro-0.76.1-arm64.dmg', 1, 'v0.76.1'),
            githubAsset('TablePro-0.76.1-x86_64.dmg', 2, 'v0.76.1'),
        ]))
        ->whenEmpty(Http::response('', 502));
    Http::fake([RELEASES_FAKE_APPCAST => Http::response('', 503)]);

    expect(macRelease()->version)->toBe('0.76.1');

    $this->travel(31)->minutes();

    $stale = servePage();

    expect($stale->version)->toBe('0.76.1')
        ->and($stale->assets['arm64']['url'])->toEndWith('/TablePro-0.76.1-arm64.dmg')
        ->and(releases()->failing())->toBeTrue();

    $calls = githubApiCalls();

    $this->travel(14)->minutes();
    servePage();

    expect(githubApiCalls())->toBe($calls);

    $this->travel(2)->minutes();
    servePage();

    expect(githubApiCalls())->toBe($calls + 1);
});

/*
 * Concurrent requests that find no copy each leave a refresh behind; the
 * scheduler may be running at the same moment. One refresh runs at a time,
 * under a lock, and any other finds the lock taken and calls nothing.
 */
it('refreshes once at a time: a refresh that finds the lock taken calls nothing', function (): void {
    Http::fake([RELEASES_FAKE_GITHUB_LATEST => Http::response(githubReleasePayload())]);

    $lock = Cache::lock(MacReleaseService::REFRESH_LOCK, MacReleaseService::REFRESH_LOCK_SECONDS);
    expect($lock->get())->toBeTrue();

    expect(releases()->refresh())->toBeNull()
        ->and(servePage()->source)->toBe(MacRelease::SOURCE_UNAVAILABLE)
        ->and(githubApiCalls())->toBe(0)
        ->and(releases()->failing())->toBeFalse();

    $lock->release();

    expect(releases()->refresh()?->version)->toBe('0.77.0')
        ->and(githubApiCalls())->toBe(1)
        ->and(Cache::lock(MacReleaseService::REFRESH_LOCK, 1)->get())->toBeTrue();
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

    $release = servePage();

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
        ->and($release->assets['arm64'])->toBe(['name' => null, 'url' => 'https://github.com/TableProApp/TablePro/releases/latest', 'bytes' => null, 'sha256' => null])
        ->and($release->assets['x86_64']['url'])->toBe('https://github.com/TableProApp/TablePro/releases/latest')
        ->and($release->toProps('en')['publishedAtFormatted'])->toBeNull();
});

it('caches the failure, so pages do not ask a broken API again and again', function (): void {
    Http::fake([
        RELEASES_FAKE_GITHUB_LATEST => Http::response('', 500),
        RELEASES_FAKE_APPCAST => Http::response('', 500),
    ]);

    for ($i = 0; $i < 10; $i++) {
        expect(servePage()->source)->toBe(MacRelease::SOURCE_UNAVAILABLE);
    }

    expect(githubApiCalls())->toBe(1);
    Http::assertSentCount(2);
});

it('refreshes from the scheduler every 15 minutes', function (): void {
    $events = collect(app(Schedule::class)->events())
        ->filter(fn(Event $event): bool => str_contains((string) $event->command, 'release:refresh'));

    expect($events)->toHaveCount(1)
        ->and($events->first()->expression)->toBe('*/15 * * * *');
});

it('reports what the scheduled refresh found', function (): void {
    Http::fake([RELEASES_FAKE_GITHUB_LATEST => Http::response(githubReleasePayload())]);

    $this->artisan('release:refresh')
        ->expectsOutputToContain('Mac release 0.77.0 (github).')
        ->assertSuccessful();

    expect(releases()->latest()->version)->toBe('0.77.0');
});

it('fails the scheduled refresh when no source answers, and keeps serving the last good copy', function (): void {
    Http::fakeSequence(RELEASES_FAKE_GITHUB_LATEST)
        ->push(githubReleasePayload('v0.76.1', assets: [
            githubAsset('TablePro-0.76.1-arm64.dmg', 1, 'v0.76.1'),
            githubAsset('TablePro-0.76.1-x86_64.dmg', 2, 'v0.76.1'),
        ]))
        ->whenEmpty(Http::response('', 502));
    Http::fake([RELEASES_FAKE_APPCAST => Http::response('', 503)]);

    expect(Artisan::call('release:refresh'))->toBe(0);

    $this->travel(31)->minutes();

    $this->artisan('release:refresh')
        ->expectsOutputToContain('Neither GitHub nor the appcast answered')
        ->assertFailed();

    expect(releases()->latest()->version)->toBe('0.76.1');
});

it('runs even while the failure marker stands, because the schedule is the rate limit', function (): void {
    Cache::put(MacReleaseService::FAILURE_KEY, true, MacReleaseService::FAILURE_SECONDS);
    Http::fake([RELEASES_FAKE_GITHUB_LATEST => Http::response(githubReleasePayload())]);

    $this->artisan('release:refresh')->assertSuccessful();

    expect(githubApiCalls())->toBe(1)
        ->and(releases()->failing())->toBeFalse();
});

it('skips quietly when another refresh holds the lock', function (): void {
    Http::fake([RELEASES_FAKE_GITHUB_LATEST => Http::response(githubReleasePayload())]);
    Cache::lock(MacReleaseService::REFRESH_LOCK, MacReleaseService::REFRESH_LOCK_SECONDS)->get();

    $this->artisan('release:refresh')
        ->expectsOutputToContain('Another refresh is running')
        ->assertSuccessful();

    expect(githubApiCalls())->toBe(0);
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
