<?php

use App\Support\Localization\Locales;
use App\Services\Releases\PlatformCatalog;
use App\Support\Seo\PageRegistry;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia;

use function Pest\Laravel\get;
use function Pest\Laravel\withoutVite;

require_once __DIR__ . '/ReleaseFixtures.php';

/**
 * `/download` and `/vi/download` (sitemap §A.1, §E.5; architecture §1.13).
 *
 * The props carry everything the page states and links to: the live release,
 * the platform facts from platforms.json and the outbound links. The rules the
 * page must keep: both builds are server-rendered links, nothing starts a
 * download on its own, no copy claims one started, and a failed release source
 * degrades to GitHub's latest-release page with no version shown.
 */
beforeEach(function (): void {
    withoutVite();
    Cache::flush();
    Storage::fake('local');
    bindReleaseFixturePlatforms();
});

/**
 * A live release, fetched the way the server fetches it: by the scheduled
 * `release:refresh`. Pages only read what it stored.
 */
function fakeLiveRelease(): void
{
    Http::fake([
        RELEASES_FAKE_GITHUB_LATEST => Http::response(githubReleasePayload()),
        RELEASES_FAKE_APPCAST => Http::response(appcastXml()),
    ]);

    Artisan::call('release:refresh');
}

it('renders in English with the live release, the platform facts and the copy', function (): void {
    fakeLiveRelease();

    get('/download')
        ->assertOk()
        ->assertInertia(fn(AssertableInertia $page) => $page
            ->component('Download')
            ->where('locale', 'en')
            ->where('content.header.title', 'Download TablePro')
            ->where('content.seo.title', 'Download TablePro for Mac')
            ->where('release.source', 'github')
            ->where('release.version', '0.77.0')
            ->where('release.publishedAtFormatted', 'October 2, 2026')
            ->where('release.assets.arm64.url', 'https://github.com/TableProApp/TablePro/releases/download/v0.77.0/TablePro-0.77.0-arm64.dmg')
            ->where('release.assets.arm64.bytes', 22_943_352)
            ->where('release.assets.x86_64.url', 'https://github.com/TableProApp/TablePro/releases/download/v0.77.0/TablePro-0.77.0-x86_64.dmg')
            ->where('mac.requirements.minVersion', '13.0')
            ->where('mac.requirements.releaseName', 'Ventura')
            ->where('mac.homebrewCommand', 'brew install --cask tablepro')
            ->where('ios.deviceNames', ['iPhone', 'iPad'])
            ->where('ios.requirements.systems', ['iOS', 'iPadOS'])
            ->where('ios.appStoreUrl', 'https://apps.apple.com/app/tablepro/id6761621829')
            ->where('ios.free', true)
            ->where('ios.inAppPurchases', false)
            ->where('unreleased', ['linux', 'windows'])
            ->where('links.source', fn(string $url): bool => str_starts_with($url, 'https://github.com/'))
            ->where('links.license', fn(string $url): bool => str_starts_with($url, 'https://'))
            ->has('links.docs')
            ->has('links.changelog')
            ->has('featuredEngines'));
});

it('names the featured, published engines from engines.json for the structured data, in data order', function (): void {
    /*
     * The names are read from the live engines.json, so the expectation is
     * derived from that file rather than typed: what the page states can never
     * be a list someone wrote down once.
     */
    fakeLiveRelease();

    $expected = collect(json_decode((string) file_get_contents(resource_path('data/engines.json')), true))
        ->filter(fn(array $engine): bool => ($engine['featured'] ?? false) === true && ($engine['state'] ?? null) === 'published')
        ->pluck('name')
        ->values()
        ->all();

    expect($expected)->not->toBeEmpty();

    get('/download')->assertInertia(fn(AssertableInertia $page) => $page->where('featuredEngines', $expected));
});

it('renders in Vietnamese with Vietnamese copy and a Vietnamese date', function (): void {
    fakeLiveRelease();

    $response = get('/vi/download');

    $response->assertOk()
        ->assertInertia(fn(AssertableInertia $page) => $page
            ->component('Download')
            ->where('locale', 'vi')
            ->where('content.header.title', 'Tải TablePro')
            ->where('content.seo.title', 'Tải TablePro cho Mac')
            ->where('release.publishedAtFormatted', '2 tháng 10 năm 2026'));

    expect($response->getContent())->toContain('<html lang="vi"');
});

it('is a translated pair, indexed in both locales', function (): void {
    fakeLiveRelease();

    $entry = app(PageRegistry::class)->find('landing.download', []);

    expect($entry)->not->toBeNull()
        ->and($entry->renderLocales)->toBe(Locales::codes())
        ->and($entry->indexableLocales)->toBe(Locales::codes())
        ->and($entry->hreflangCluster())->toBe(Locales::codes());

    get('/vi/download')->assertInertia(fn(AssertableInertia $page) => $page
        ->where('seo.robots', 'index, follow')
        ->where('seo.canonical', fn(string $url): bool => str_ends_with($url, '/vi/download'))
        ->where('seo.alternates', fn($alternates): bool => collect($alternates)->pluck('hreflang')->sort()->values()->all() === collect(Locales::codes())->sort()->values()->all()));
});

/*
 * A page never waits on GitHub. With nothing stored yet (a fresh server, or
 * the cache just cleared and no last good copy), the page answers at once
 * without a version, and the refresh it leaves for after its response gives
 * the next reader the release.
 */
it('answers without waiting on GitHub when nothing is stored, and the next page has the release', function (): void {
    Http::fake([
        RELEASES_FAKE_GITHUB_LATEST => Http::response(githubReleasePayload()),
        RELEASES_FAKE_APPCAST => Http::response(appcastXml()),
    ]);

    get('/download')
        ->assertOk()
        ->assertInertia(fn(AssertableInertia $page) => $page->where('release.source', 'unavailable'));

    get('/vi/download')
        ->assertOk()
        ->assertInertia(fn(AssertableInertia $page) => $page
            ->where('release.source', 'github')
            ->where('release.version', '0.77.0'));

    expect(Http::recorded(fn(Request $request): bool => str_contains($request->url(), 'api.github.com'))->count())->toBe(1);
});

it('falls back to GitHub’s latest-release page, with no version, when no source answers', function (): void {
    Http::fake([
        RELEASES_FAKE_GITHUB_LATEST => Http::response('', 500),
        RELEASES_FAKE_APPCAST => Http::response('', 500),
    ]);

    get('/download')
        ->assertOk()
        ->assertInertia(fn(AssertableInertia $page) => $page
            ->component('Download')
            ->where('release.source', 'unavailable')
            ->where('release.version', null)
            ->where('release.publishedAtFormatted', null)
            ->where('release.assets.arm64.url', 'https://github.com/TableProApp/TablePro/releases/latest')
            ->where('release.assets.x86_64.url', 'https://github.com/TableProApp/TablePro/releases/latest')
            ->where('release.assets.arm64.name', null)
            ->where('mac.homebrewTrails', false));
});

it('reads only releases/latest, once for both locales, never the crowded releases list', function (): void {
    fakeLiveRelease();

    get('/download')->assertOk();
    get('/vi/download')->assertOk();

    $outbound = Http::recorded(fn(Request $request): bool => ! str_starts_with($request->url(), 'http://127.0.0.1'));

    expect($outbound->map(fn(array $pair): string => $pair[0]->url())->values()->all())
        ->toBe(['https://api.github.com/repos/TableProApp/TablePro/releases/latest']);
    Http::assertNotSent(fn(Request $request): bool => (bool) preg_match('#/releases(\?|$)#', $request->url()));
});

it('flags the Homebrew note while the cask serves an older version than the live release', function (string $floor, bool $trails): void {
    bindReleaseFixturePlatforms(['mac.floorVersion' => $floor]);
    fakeLiveRelease();

    get('/download')->assertInertia(fn(AssertableInertia $page) => $page->where('mac.homebrewTrails', $trails));
})->with([
    'cask behind' => ['0.76.1', true],
    'cask caught up' => ['0.77.0', false],
]);

it('shows no iPhone and iPad card while that app is not released', function (): void {
    bindReleaseFixturePlatforms(['ios.status' => 'prototype']);
    fakeLiveRelease();

    get('/download')->assertInertia(fn(AssertableInertia $page) => $page
        ->where('ios', null)
        ->where('unreleased', ['ios', 'linux', 'windows']));
});

it('reads everything the page needs from the live platforms.json', function (): void {
    /*
     * The shape only, never the values: those move with every release and
     * belong to `Data/PlatformsDataTest`. This holds the download page and
     * the data file to the same contract (architecture §1.8).
     */
    $catalog = new PlatformCatalog();
    $mac = $catalog->summary('mac');

    expect($mac)->not->toBeNull()
        ->and($mac['deviceNames'])->not->toBeEmpty()
        ->and($mac['requirements']['systems'])->not->toBeEmpty()
        ->and($mac['requirements']['displayVersion'])->not->toBe('')
        ->and($catalog->destination('mac', 'homebrew')['command'] ?? null)->toBeString()
        ->and($catalog->destination('mac', 'releases')['url'] ?? '')->toStartWith('https://')
        ->and($catalog->macAssetName('arm64', '1.2.3'))->toContain('1.2.3')
        ->and($catalog->macAssetName('x86_64', '1.2.3'))->toContain('1.2.3')
        ->and($catalog->macFloorVersion())->toMatch('/^\d+(\.\d+)*$/');

    if ($catalog->isReleased('ios')) {
        expect($catalog->summary('ios')['requirements']['systems'])->not->toBeEmpty()
            ->and($catalog->destination('ios', 'app-store')['url'] ?? '')->toStartWith('https://');
    }
});

it('keeps both page copies free of auto-start claims, URLs and retired wording', function (): void {
    $sources = [
        resource_path('data/content/en/download.json'),
        resource_path('data/content/vi/download.json'),
        resource_path('js/i18n/messages/en/download.ts'),
        resource_path('js/i18n/messages/vi/download.ts'),
    ];

    $banned = [
        '/download is starting/i', '/download started/i', '/starting\.\.\./i', '/đang tải/iu', '/bắt đầu tải/iu',
        '/https?:\/\//i', '/macOS 14/i', '/Sonoma/i', '/Tải xuống/iu', '/\bunlock/i', '/mở khóa/iu',
        '/universal/i', '/\d+(\.\d+)? ?MB/i',
    ];

    foreach ($sources as $source) {
        $text = (string) file_get_contents($source);

        foreach ($banned as $pattern) {
            expect(preg_match($pattern, $text))->toBe(0, basename(dirname($source)) . '/' . basename($source) . " matches {$pattern}");
        }

        expect(Normalizer::isNormalized($text, Normalizer::FORM_C))->toBeTrue("{$source} is not NFC");
    }
});

/*
 * Positioning §11.2: a Vietnamese click path gives the English path in full
 * after it, "**Cài đặt > Tích hợp** (Settings > Integrations)", so a reader
 * whose app is in English can follow it. And "chậm hơn" reads as "slower
 * than", a speed comparison, where the copy means that Homebrew lags.
 */
it('writes Vietnamese click paths with their full English path, and no speed comparison', function (): void {
    $text = (string) file_get_contents(resource_path('data/content/vi/download.json'))
        . (string) file_get_contents(resource_path('js/i18n/messages/vi/download.ts'));

    preg_match_all('#<ui>([^<]*>[^<]*)</ui> \(([^)]*)\)#u', $text, $paths, PREG_SET_ORDER);

    expect($paths)->not->toBeEmpty();

    foreach ($paths as [$whole, $vietnamese, $english]) {
        expect(substr_count($english, ' > '))->toBe(substr_count($vietnamese, ' > '), "{$whole}: the English path is not complete");
    }

    expect(preg_match('/chậm hơn|dòng Chip|nơi bạn chọn/u', $text))->toBe(0);
});

it('types no URL into the page or its components', function (): void {
    $files = [resource_path('js/pages/Download.tsx'), ...glob(resource_path('js/components/download/*'))];

    foreach ($files as $file) {
        $source = (string) file_get_contents($file);
        preg_match_all('#https?://[^\'"`\s]+#', $source, $matches);

        expect(array_values(array_diff($matches[0], ['https://schema.org'])))->toBe([], basename($file) . ' types a URL');
    }
});

it('server-renders both builds as links, and says nothing about a download starting', function (): void {
    fakeLiveRelease();

    foreach (['/download', '/vi/download'] as $path) {
        $html = ssrHtml($path);

        expect($html)
            ->toContain('href="https://github.com/TableProApp/TablePro/releases/download/v0.77.0/TablePro-0.77.0-arm64.dmg"')
            ->toContain('href="https://github.com/TableProApp/TablePro/releases/download/v0.77.0/TablePro-0.77.0-x86_64.dmg"')
            ->toContain('href="https://apps.apple.com/app/tablepro/id6761621829"')
            ->toContain('brew install --cask tablepro')
            ->toContain('id="mac"')
            ->toContain('id="ios"')
            ->toContain('id="install"')
            ->toContain('id="updates"')
            ->toContain('id="other-platforms"')
            ->toContain('id="older-versions"')
            ->toContain('"@type":"SoftwareApplication"')
            ->toContain('/#app"')
            ->toContain('"@type":"MobileApplication"')
            ->toContain('/#ios-app"')
            ->toContain('"softwareVersion":"0.77.0"')
            ->not->toContain('BreadcrumbList')
            ->not->toContain('aggregateRating')
            ->not->toContain('fileSize')
            ->not->toContain('is starting')
            ->not->toContain('window.location');
    }

    expect(ssrHtml('/download'))->toContain('Requires macOS 13 Ventura or later')
        ->toContain('Download for Apple silicon')
        ->toContain('Download for Intel')
        ->toContain('Which Mac do I have?')
        ->toContain('v0.77.0 · October 2, 2026')
        ->toContain('<span class="font-mono text-[0.75rem] [overflow-wrap:anywhere]">TablePro-0.77.0-arm64.dmg</span> · <span class="tabular-nums">22.9</span> MB')
        ->toContain('Requires iOS and iPadOS 18 or later')
        ->toContain('Free, with no in-app purchases')
        ->toContain('not available for Linux or Windows');

    expect(ssrHtml('/vi/download'))->toContain('Yêu cầu macOS 13 Ventura trở lên')
        ->toContain('Tải bản cho Apple silicon')
        ->toContain('Tải bản cho Intel')
        ->toContain('v0.77.0 · 2 tháng 10 năm 2026')
        ->toContain('<span class="font-mono text-[0.75rem] [overflow-wrap:anywhere]">TablePro-0.77.0-arm64.dmg</span> · <span class="tabular-nums">22,9</span> MB')
        ->toContain('Yêu cầu iOS và iPadOS 18 trở lên')
        ->toContain('Miễn phí, không có mua hàng trong ứng dụng')
        ->toContain('cho Linux hoặc Windows');
});

it('sends each DMG’s SHA-256 to the page when the release carries one', function (): void {
    $arm64 = str_repeat('a1', 32);
    $x86_64 = str_repeat('b2', 32);

    Http::fake([RELEASES_FAKE_GITHUB_LATEST => Http::response(githubReleasePayloadWithDigests($arm64, $x86_64))]);
    Artisan::call('release:refresh');

    get('/download')->assertInertia(fn(AssertableInertia $page) => $page
        ->where('release.assets.arm64.sha256', $arm64)
        ->where('release.assets.x86_64.sha256', $x86_64));
});

it('sends no checksum when the release came from the appcast', function (): void {
    Http::fake([
        RELEASES_FAKE_GITHUB_LATEST => Http::response('', 500),
        RELEASES_FAKE_APPCAST => Http::response(appcastXml()),
    ]);
    Artisan::call('release:refresh');

    get('/download')->assertInertia(fn(AssertableInertia $page) => $page
        ->where('release.source', 'appcast')
        ->where('release.assets.arm64.sha256', null)
        ->where('release.assets.x86_64.sha256', null));
});

it('server-renders each build’s SHA-256 with the command that checks it, in every language', function (): void {
    $arm64 = str_repeat('a1', 32);
    $x86_64 = str_repeat('b2', 32);

    Http::fake([RELEASES_FAKE_GITHUB_LATEST => Http::response(githubReleasePayloadWithDigests($arm64, $x86_64))]);
    Artisan::call('release:refresh');

    expect(ssrHtml('/download'))->toContain('Verify your download', $arm64, $x86_64, 'shasum -a 256');

    foreach (array_diff(Locales::codes(), ['en']) as $locale) {
        expect(ssrHtml("/{$locale}/download"))->toContain($arm64, $x86_64, 'shasum -a 256')->not->toContain('Verify your download');
    }
});

it('server-renders no checksum block when the release carries none', function (): void {
    fakeLiveRelease();

    expect(ssrHtml('/download'))->toContain('Which Mac do I have?')->not->toContain('Verify your download')->not->toContain('shasum');
});

it('server-renders no version and sends both buttons to the latest release when no source answers', function (): void {
    Http::fake([
        RELEASES_FAKE_GITHUB_LATEST => Http::response('', 500),
        RELEASES_FAKE_APPCAST => Http::response('', 500),
    ]);

    $html = ssrHtml('/download');

    expect(substr_count($html, 'href="https://github.com/TableProApp/TablePro/releases/latest"'))->toBeGreaterThanOrEqual(2)
        ->and($html)->toContain('The current release details could not be loaded.')
        ->not->toContain('softwareVersion')
        ->not->toContain('.dmg"');
});
