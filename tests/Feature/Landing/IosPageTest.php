<?php

use App\Http\Controllers\Landing\IosController;
use App\Support\Assets\AssetManifest;
use App\Support\Content\Slugs\CompareSlugs;
use App\Support\Content\Slugs\DatabaseSlugs;
use App\Support\Content\Slugs\FeatureSlugs;
use App\Support\Seo\PageRegistry;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Http;
use Inertia\Testing\AssertableInertia;
use PHPUnit\Framework\Assert;

use function Pest\Laravel\get;
use function Pest\Laravel\withoutVite;

/**
 * The iPhone and iPad page, `/ios` and `/vi/ios` (sitemap §A.1, §E.5).
 *
 * The page describes the App Store release in platforms.json (1.0, build 22)
 * and nothing merged after it. What this file pins is the class of mistake
 * the page has actually shipped: a count where a list belongs ("Seven engines
 * on device"), a Mac sentence reused on the phone (six Safe Mode levels, jump
 * hosts), a feature only the unreleased source has (the iPad table list beside
 * the browser, Redis key browsing, "nothing connects before Face ID"), and the
 * TestFlight beta the App Store launch replaced.
 */
beforeEach(function (): void {
    withoutVite();
    // Every host but the SSR gateway: faking `*` would also answer the
    // gateway, and the server-rendered cases would read the client-only shell.
    Http::fake(['api.github.com/*' => Http::response([], 500), 'github.com/*' => Http::response([], 500), 'apps.apple.com/*' => Http::response([], 500), 'itunes.apple.com/*' => Http::response([], 500)]);
});

/**
 * @return array<string, mixed>
 */
function iosPageContent(string $locale): array
{
    return json_decode((string) file_get_contents(resource_path("data/content/{$locale}/ios.json")), true, 512, JSON_THROW_ON_ERROR);
}

/**
 * @return array<string, mixed>
 */
function iosPagePlatform(): array
{
    $platforms = json_decode((string) file_get_contents(resource_path('data/platforms.json')), true, 512, JSON_THROW_ON_ERROR)['platforms'];

    return collect($platforms)->firstWhere('id', 'ios');
}

/**
 * Every visible string of the page in one locale: its content file and the
 * page component's own source.
 */
function iosPageText(string $locale): string
{
    return implode("\n", array_filter(Arr::dot(iosPageContent($locale)), 'is_string'));
}

it('renders in both languages from its content and the data files', function (string $path, string $locale, string $title): void {
    $ios = iosPagePlatform();
    $engines = collect(json_decode((string) file_get_contents(resource_path('data/engines.json')), true))->keyBy('id');
    // The iPad capture under the header is preloaded exactly while it is supplied.
    $assets = app(AssetManifest::class);
    $lcp = $assets->lcpDescriptor('ipad-table-browse', $locale, priority: true, sizes: IosController::IPAD_SIZES);

    expect($lcp === null)->toBe(! $assets->isSupplied('ipad-table-browse'));

    get($path)
        ->assertOk()
        ->assertInertia(fn(AssertableInertia $page) => $page
            ->component('Ios')
            ->where('locale', $locale)
            ->where('content.hero.title', $title)
            ->where('ios.version', $ios['release']['version'])
            ->where('ios.publishedAt', $ios['release']['publishedAt'])
            ->where('ios.appStoreUrl', $ios['destinations'][0]['url'])
            ->where('ios.requirements.systems', ['iOS', 'iPadOS'])
            ->where('ios.free', true)
            ->where('ios.inAppPurchases', false)
            ->where('engines.picker', fn($picker): bool => collect($picker)->pluck('name')->all() === collect($ios['iosEngines'])->map(fn(string $id): string => $engines[$id]['name'])->all())
            ->where('engines.syncedOnly', fn($synced): bool => collect($synced)->pluck('id')->all() === ['redshift'])
            ->where('safeModeLevels', ['Off', 'Confirm Writes', 'Read-Only'])
            ->where('limits.history', fn(int $value): bool => $value > 0)
            ->where('limits.results', fn(int $value): bool => $value > 0)
            ->has('links.license')
            ->has('organizationProfiles')
            ->where('lcpAsset', $lcp));
})->with([
    'English' => ['/ios', 'en', 'TablePro for iPhone and iPad'],
    'Vietnamese' => ['/vi/ios', 'vi', 'TablePro cho iPhone và iPad'],
]);

it('formats the release date in PHP for each language', function (): void {
    get('/ios')->assertInertia(fn(AssertableInertia $page) => $page->where('ios.publishedAtFormatted', 'September 22, 2026'));
    get('/vi/ios')->assertInertia(fn(AssertableInertia $page) => $page->where('ios.publishedAtFormatted', '22 tháng 9 năm 2026'));
});

it('is a translated pair, indexed in both languages', function (): void {
    $entry = app(PageRegistry::class)->find('landing.ios', []);

    expect($entry)->not->toBeNull();
    expect($entry->renderLocales)->toBe(['en', 'vi']);
    expect($entry->hreflangCluster())->toBe(['en', 'vi']);
});

it('asks GitHub for nothing: the Mac release does not appear on this page', function (): void {
    get('/ios')->assertOk();
    get('/vi/ios')->assertOk();

    // The SSR render request is the only one the page may cause.
    Http::assertNotSent(fn(Request $request): bool => str_contains($request->url(), 'github'));
});

it('links engine names only to database pages the site serves', function (): void {
    get('/ios')->assertInertia(fn(AssertableInertia $page) => $page->where('engines.picker', function ($picker): bool {
        foreach ($picker as $engine) {
            if ($engine['href'] === null) {
                continue;
            }

            $slug = ltrim((string) strtok($engine['href'], '#'), '/');

            if (! in_array($slug, DatabaseSlugs::ALL, true)) {
                return false;
            }
        }

        return true;
    }));
});

it('never lets a slug list swallow /ios', function (): void {
    /*
     * `/{slug}` is the database catch-all. `ios` in its constraint would render
     * a database page at /ios, and the compare and feature slugs must not learn
     * it either. The constants are what routes/localized.php reads.
     */
    expect(DatabaseSlugs::ALL)->not->toContain('ios');
    expect(CompareSlugs::ALL)->not->toContain('ios');
    expect(FeatureSlugs::ALL)->not->toContain('ios');

    expect(app('router')->getRoutes()->match(request()->create('/ios'))->getName())->toBe('landing.ios');
    expect(app('router')->getRoutes()->match(request()->create('/vi/ios'))->getName())->toBe('vi.landing.ios');
});

it('points to the App Store, never to the TestFlight beta it replaced', function (): void {
    $sources = [
        'resources/js/pages/Ios.tsx' => (string) file_get_contents(resource_path('js/pages/Ios.tsx')),
        'content/en/ios.json' => iosPageText('en'),
        'content/vi/ios.json' => iosPageText('vi'),
    ];

    foreach ($sources as $file => $text) {
        foreach (['TestFlight', '/beta/signup', 'Join Beta', 'beta'] as $needle) {
            Assert::assertStringNotContainsStringIgnoringCase($needle, $text, "{$file} still mentions \"{$needle}\"; the app is on the App Store");
        }
    }

    // No country segment: Apple sends each reader to their own storefront.
    expect(iosPagePlatform()['destinations'][0]['url'])->toMatch('#^https://apps\.apple\.com/app/[a-z0-9-]+/id\d+$#');
});

it('ships Apple\'s badge artwork unmodified, in both themes and both languages', function (string $suffix, string $language): void {
    /*
     * `-light` is the black badge shown on the light theme, `-dark` the white
     * one. Apple's export names its language and colour in the title, so a
     * swapped pair or the English file saved under the Vietnamese name shows
     * here. A changed viewBox means someone has redrawn or cropped a
     * trademarked badge.
     */
    foreach (['light' => 'blk', 'dark' => 'wht'] as $theme => $colour) {
        $svg = (string) file_get_contents(public_path("images/app-store-{$theme}{$suffix}.svg"));

        expect($svg)->toContain('viewBox="0 0 119.66407 40"')
            ->toMatch("#<title>Download_on_the_App_Store_Badge_{$language}_RGB_{$colour}_[^<]*</title>#");
    }
})->with([
    'English' => ['', 'US-UK'],
    'Vietnamese' => ['-vi', 'VN'],
]);

it('shows the App Store badge in the page\'s language, labelled with its visible text', function (string $path, string $suffix, string $label): void {
    $html = ssrHtml($path);

    preg_match_all('#<a href="https://apps\.apple\.com/[^"]*"[^>]*>\s*<img src="/images/app-store-light([^"]*)\.svg" alt="([^"]*)"[^>]*>\s*<img src="/images/app-store-dark([^"]*)\.svg" alt="([^"]*)"#', $html, $badges, PREG_SET_ORDER);

    // At least the hero and the closing "get" section (the mobile menu adds one), and every badge on the page parsed.
    expect(count($badges))->toBeGreaterThanOrEqual(2)
        ->toBe(substr_count($html, '<img src="/images/app-store-light'));

    foreach ($badges as [$markup, $lightSuffix, $lightAlt, $darkSuffix, $darkAlt]) {
        expect([$lightSuffix, $darkSuffix])->toBe([$suffix, $suffix])
            ->and([$lightAlt, $darkAlt])->toBe([$label, $label]);

        // The label is in the page's language, so the link carries no lang of its own.
        Assert::assertStringNotContainsString(' lang=', $markup, "{$path} marks its App Store badge with a lang attribute");
    }
})->with([
    'English' => ['/ios', '', 'Download on the App Store'],
    'Vietnamese' => ['/vi/ios', '-vi', 'Tải về trên App Store'],
]);

it('names the engines and never counts them', function (string $locale): void {
    $text = iosPageText($locale);

    // The engine names come from the data; the copy states none of their number.
    Assert::assertDoesNotMatchRegularExpression('/\d+\s*(engines?|databases?|drivers?|cơ sở dữ liệu|engine|driver)\b/iu', $text);
    Assert::assertStringNotContainsStringIgnoringCase('seven', $text);
    Assert::assertStringNotContainsStringIgnoringCase('ten databases', $text);

    // The picker's names are not typed into the copy as a list either: the page renders them from data.
    expect((string) file_get_contents(resource_path('js/pages/Ios.tsx')))->toContain('engines.picker.map(');
})->with(['en', 'vi']);

it('describes App Store 1.0, not the Mac app or the unreleased source', function (string $locale): void {
    $text = iosPageText($locale);
    $source = (string) file_get_contents(resource_path('js/pages/Ios.tsx'));

    /*
     * True of the Mac or of source merged after build 22, and false of the
     * App Store app: six Safe Mode levels and the Mac's level names; the iPad
     * table list beside the browser (#3035); "nothing connects until Face ID"
     * (#3014); a native visionOS app; "universal app" (positioning §12.1 says
     * "one app for iPhone and iPad").
     */
    foreach (['six', 'Silent', 'Alert (Full)', 'side by side', 'side-by-side', 'beside the browser', 'visionOS', 'Vision Pro', 'Optic ID', 'universal app', 'nothing connects', 'iPhone Duo'] as $needle) {
        Assert::assertStringNotContainsStringIgnoringCase($needle, $text, "content/{$locale}/ios.json says \"{$needle}\"");
        Assert::assertStringNotContainsStringIgnoringCase($needle, $source, "Ios.tsx says \"{$needle}\"");
    }

    // "unlock" is banned site-wide (positioning §12.1), in both languages.
    Assert::assertDoesNotMatchRegularExpression('/\bunlocks?\b|mở khóa/iu', $text);
})->with(['en', 'vi']);

it('states the limits a phone user would otherwise discover', function (): void {
    $en = iosPageContent('en');
    $limits = implode("\n", $en['limits']['items']);

    // Jump hosts are refused or skipped on the phone, and Redis keys do not open in 1.0.
    expect($limits)->toContain('jump hosts')->toContain('Redis keys')->toContain('AI assistant');
    expect($en['databases']['redis'])->toContain('Query tab');

    // Editing needs a primary key; Read-Only changes nothing.
    expect(implode("\n", $en['browse']['paragraphs']))->toContain('primary key')->toContain('Read-Only');

    // Safe Mode levels come from facts.json, through a slot.
    expect(implode("\n", $en['safeMode']['paragraphs']))->toContain('{levels}');

    // The Mac side of iCloud Sync is paid, the phone side is not.
    expect(implode("\n", $en['mac']['paragraphs']))->toContain('Starter or Team')->toContain('free here');

    // Share Usage Data is off until the reader turns it on.
    expect($en['privacy']['paragraphs'][0])->toStartWith('Nothing goes to TablePro unless you turn on Share Usage Data');

    // The same limits are in the Vietnamese copy, with as many items.
    expect(iosPageContent('vi')['limits']['items'])->toHaveCount(count($en['limits']['items']));
});

it('places every iPhone and iPad slot and only manifest ids', function (): void {
    $source = (string) file_get_contents(resource_path('js/pages/Ios.tsx'));
    $assets = json_decode((string) file_get_contents(resource_path('data/assets.json')), true)['assets'];

    preg_match_all('/<AssetSlot\s+id="([a-z0-9-]+)"/', $source, $matches);

    foreach ($matches[1] as $id) {
        expect($assets)->toHaveKey($id);
    }

    /* A phone crop renders through the slot of the entry that names it. */
    $placed = $matches[1];

    foreach ($matches[1] as $id) {
        if (is_string($assets[$id]['mobile'] ?? null)) {
            $placed[] = $assets[$id]['mobile'];
        }
    }

    foreach ($assets as $id => $entry) {
        $onThisPage = collect($entry['usedOn'])->contains(fn(array $use): bool => $use['path'] === '/ios');

        if ($entry['slot'] && $onThisPage) {
            expect($placed)->toContain($id);
        }
    }
});

it('emits one iPhone and iPad application node, with no rating and no FAQ markup', function (): void {
    $html = ssrHtml('/ios');

    expect(substr_count($html, '"@type":"MobileApplication"'))->toBe(1);
    expect($html)->toContain('"@id":"https://localhost/#ios-app"');
    expect($html)->not->toContain('"FAQPage"');

    foreach (['aggregateRating', 'ratingValue'] as $needle) {
        Assert::assertStringNotContainsString($needle, $html, '/ios published a rating nobody gave');
    }
});

it('server-renders the engine names from the data, in picker order', function (): void {
    $html = ssrHtml('/ios');
    $engines = collect(json_decode((string) file_get_contents(resource_path('data/engines.json')), true))->keyBy('id');

    $start = strpos($html, 'id="databases"');
    $end = strpos($html, 'id="browse"', (int) $start);

    expect($start)->not->toBeFalse();

    $section = substr($html, (int) $start, (int) $end - (int) $start);

    preg_match_all('#<li class="type-body font-medium text-foreground">(?:<a [^>]*>)?([^<]+)#', $section, $cells);

    expect($cells[1])->toBe(collect(iosPagePlatform()['iosEngines'])->map(fn(string $id): string => $engines[$id]['name'])->all());
});
