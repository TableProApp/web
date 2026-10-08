<?php

use App\Http\Controllers\DatabaseController;
use App\Support\Localization\Locales;
use App\Support\Localization\LocalizedUrl;
use App\Support\Assets\AssetManifest;
use App\Support\Seo\PageRegistry;
use Dom\Element;
use Dom\HTMLDocument;
use Illuminate\Support\Facades\File;
use Inertia\Testing\AssertableInertia;

use function Pest\Laravel\get;
use function Pest\Laravel\withoutVite;

/**
 * The homepage, `/` and `/vi` (sitemap §A.1, §D; positioning §1-§9;
 * architecture §1.17 "HomepageRenderTest").
 *
 * The first half runs on every machine: the controller's props, the copy in
 * both languages, and the facts the page derives from resources/data. The
 * second half asserts on the server-rendered DOM and needs a current SSR
 * bundle (`requireSsr()`): the section order with Sponsors third, the
 * `#pricing` section the Mac app opens, the old anchors, the structured data
 * and the title built from platforms.json.
 *
 * Expectations are read from the data files, never typed: the engines, the
 * iPhone engine picker, the sponsors and the prices are whatever
 * resources/data says today.
 */
beforeEach(function (): void {
    withoutVite();
});

/**
 * @return array<string, mixed>
 */
function homeData(string $file): array
{
    return json_decode(File::get(resource_path("data/{$file}")), true, 512, JSON_THROW_ON_ERROR);
}

/**
 * @return array<string, mixed>
 */
function homeContent(string $locale): array
{
    return homeData("content/{$locale}/home.json");
}

/** The server-rendered homepage in one locale, rendered once per test run. */
function ssrHome(string $path = '/'): string
{
    static $html = [];

    return $html[$path] ??= ssrHtml($path);
}

/**
 * The ids of every `<section>` inside `<main>`, in document order.
 *
 * @return list<string>
 */
function homeSectionIds(string $html): array
{
    $main = substr($html, (int) strpos($html, '<main'), (int) strpos($html, '</main>') - (int) strpos($html, '<main'));

    preg_match_all('/<section\b[^>]*\bid="([^"]+)"/', $main, $matches);

    return $matches[1];
}

/** The ten homepage sections, in sitemap §D's order. Sponsors is third by the owner's decision (spec §0). */
const HOME_SECTIONS = ['top', 'databases', 'sponsors', 'features', 'safety', 'ai', 'platforms', 'switch', 'pricing', 'open-source'];

/** Older ids that land inside the section that replaced them (sitemap §C.2). */
const HOME_ALIASES = ['mcp' => 'ai', 'mobile' => 'platforms', 'compare' => 'switch', 'license' => 'pricing'];

describe('props and copy', function (): void {
    it('renders in English with the page copy, the engine slice and the checkout contract', function (): void {
        get('/')
            ->assertOk()
            ->assertInertia(fn(AssertableInertia $page) => $page
                ->component('Home')
                ->where('locale', 'en')
                ->where('content.hero.title', 'A native database client for developers.')
                ->where('content.seo.title', 'TablePro: native database client for {deviceList}')
                ->where('checkout.provider', fn(string $provider): bool => in_array($provider, ['polar', 'lemonsqueezy'], true))
                ->has('checkout.couponField')
                ->has('engines')
                ->has('categories')
                ->has('iosEngines.picker')
                ->has('iosEngines.syncedOnly')
                ->missing('productHunt')
                ->missing('downloadUrls')
                ->missing('githubStars')
                ->missing('teamMinSeats'));
    });

    it('renders in Vietnamese with Vietnamese copy at /vi', function (): void {
        $response = get('/vi');

        $response->assertOk()
            ->assertInertia(fn(AssertableInertia $page) => $page
                ->component('Home')
                ->where('locale', 'vi')
                ->where('content.hero.title', 'Database client native dành cho lập trình viên.')
                ->where('content.seo.title', 'TablePro: database client native cho {deviceList}'));

        expect($response->getContent())->toContain('<html lang="vi"');
    });

    it('indexes every complete translation with its own canonical', function (): void {
        $entry = app(PageRegistry::class)->find('landing.home', []);

        expect($entry)->not->toBeNull()
            ->and($entry->renderLocales)->toBe(Locales::codes())
            ->and($entry->indexableLocales)->toBe(Locales::codes())
            ->and($entry->hreflangCluster())->toBe(Locales::codes());

        get('/vi')->assertInertia(fn(AssertableInertia $page) => $page
            ->where('seo.robots', 'index, follow')
            ->where('seo.canonical', fn(string $url): bool => str_ends_with($url, '/vi'))
            ->where('seo.alternates', fn($alternates): bool => collect($alternates)->pluck('hreflang')->sort()->values()->all() === collect(Locales::codes())->sort()->values()->all()));
    });

    it('preloads the hero only once it is supplied', function (): void {
        $expected = app(AssetManifest::class)->lcpDescriptor('mac-hero-window', 'en');

        get('/')->assertInertia(fn(AssertableInertia $page) => $page->where('lcpAsset', $expected));

        if (! app(AssetManifest::class)->isSupplied('mac-hero-window')) {
            $html = (string) get('/')->getContent();
            preg_match_all('#<link rel="preload" as="image" href="([^"]+)"#', $html, $preloads);

            expect($expected)->toBeNull();
            // The Blade block that preloads the hero writes `imagesrcset`.
            expect($html)->not->toContain('imagesrcset');
            // React preloads the header logo it renders on every page; nothing else may be preloaded.
            expect(array_values(array_diff($preloads[1], ['/images/logo.png'])))->toBe([]);
        }
    });

    it('sends every published engine once, linked to where the site describes it', function (): void {
        $engines = collect(homeData('engines.json'))->where('state', 'published')->values();
        $slugs = $engines->pluck('slug', 'id');

        $expected = $engines->map(fn(array $engine): array => [
            'id' => $engine['id'],
            'name' => $engine['name'],
            'path' => match ($engine['page']) {
                'own' => '/' . $engine['slug'],
                'section' => '/' . $slugs[$engine['parent']] . '#' . $engine['anchor'],
                'hub' => '/databases#' . $engine['anchor'],
            },
            'featured' => $engine['featured'],
        ])->all();

        get('/')->assertInertia(fn(AssertableInertia $page) => $page->where('engines', function ($engines) use ($expected): bool {
            $actual = collect($engines)->map(fn($engine): array => [
                'id' => $engine['id'],
                'name' => $engine['name'],
                'path' => $engine['path'],
                'featured' => $engine['featured'],
            ])->all();

            expect($actual)->toBe($expected);

            return true;
        }));
    });

    it('names the featured engines in data order, and only published ones', function (): void {
        $featured = collect(homeData('engines.json'))
            ->filter(fn(array $engine): bool => $engine['featured'] === true && $engine['state'] === 'published')
            ->pluck('name')
            ->values()
            ->all();

        expect($featured)->not->toBeEmpty();

        get('/')->assertInertia(fn(AssertableInertia $page) => $page->where(
            'engines',
            fn($engines): bool => collect($engines)->where('featured', true)->pluck('name')->values()->all() === $featured,
        ));
    });

    it('names the database categories as /databases does, in its order, in every language', function (): void {
        $used = collect(homeData('engines.json'))->where('state', 'published')->pluck('category')->unique()->all();

        foreach (Locales::codes() as $locale) {
            $hub = homeData("content/{$locale}/databases/index.json")['categories'];
            $expected = collect(DatabaseController::CATEGORIES)
                ->filter(fn(string $id): bool => in_array($id, $used, true))
                ->map(fn(string $id): array => ['id' => $id, 'title' => $hub[$id]['title']])
                ->values()
                ->all();

            expect($expected)->not->toBeEmpty();

            get(LocalizedUrl::path('/', $locale))->assertInertia(fn(AssertableInertia $page) => $page->where('categories', $expected));

            // One set of labels: the homepage copy keeps no category names of its own, and no second engine list.
            expect(array_keys(homeContent($locale)['databases']))->toBe(['title', 'lead', 'count', 'ios', 'iosSynced', 'link'], "content/{$locale}/home.json databases");
            expect(homeContent($locale)['databases']['count'])->toContain('{count}');
        }
    });

    it('names the iPhone engines from the picker in platforms.json, plus those that open only when synced', function (): void {
        $engines = collect(homeData('engines.json'))->where('state', 'published')->keyBy('id');
        $ios = collect(homeData('platforms.json')['platforms'])->firstWhere('id', 'ios');

        $picker = collect($ios['iosEngines'])->map(fn(string $id): string => $engines[$id]['name'])->all();
        $syncedOnly = $engines
            ->filter(fn(array $engine): bool => $engine['ios']['openable'] && ! $engine['ios']['inPicker'])
            ->pluck('name')
            ->values()
            ->all();

        get('/')->assertInertia(fn(AssertableInertia $page) => $page
            ->where('iosEngines.picker', $picker)
            ->where('iosEngines.syncedOnly', $syncedOnly));
    });

    it('names Product Hunt as a plain text link from facts.json, with no badge', function (): void {
        /*
         * The owner's decision (spec §0): "TablePro on Product Hunt" as text,
         * no badge image, no hotlink, no third-party request. The badge
         * component design-system §5 removed stays removed, and the URL lives
         * in facts.json like every other outbound link.
         */
        expect(File::exists(resource_path('js/components/home/product-hunt-badge.tsx')))->toBeFalse();
        expect(homeData('facts.json')['links']['productHunt'])->toBe('https://www.producthunt.com/products/tablepro');
        expect(homeContent('en')['openSource']['productHunt'])->toBe('TablePro on Product Hunt');
        expect(homeContent('vi')['openSource']['productHunt'])->toBe('TablePro trên Product Hunt');

        $section = (string) File::get(resource_path('js/components/home/open-source-section.tsx'));

        expect($section)->toContain('FACTS.links.productHunt')->not->toContain('<img')->not->toContain('producthunt.com');
    });

    it('keeps titles and descriptions within their lengths, names the category and scopes "free"', function (string $locale): void {
        $seo = homeContent($locale)['seo'];

        // The title names the platforms from platforms.json; the fallback is what renders when that passes 60 characters.
        expect($seo['title'])->toContain('{deviceList}');
        expect(mb_strlen($seo['titleFallback']))->toBeLessThanOrEqual(60);
        expect($seo['titleFallback'])->not->toContain('{');
        expect(mb_strlen($seo['description']))->toBeLessThanOrEqual(160);
        expect($seo['title'])->toContain('database client');
        expect($seo['titleFallback'])->toContain('database client');
        expect($seo['description'])->toContain($locale === 'vi' ? 'trả phí' : 'paid');
        expect(homeContent($locale)['og']['title'])->not->toBe('');
    })->with(['en', 'vi']);

    it('scopes the Mac-only guardrails and importers to the Mac, and states the iPhone and iPad levels', function (): void {
        $en = homeContent('en');
        $vi = homeContent('vi');

        // Connection colours, Touch ID and the always-ask rule are Mac behaviour; iOS 1.0 at Off runs a DROP without asking.
        expect($en['safety']['body'][0])->toStartWith('On the Mac,')->toContain('On iPhone and iPad, Confirm Writes');
        expect($vi['safety']['body'][0])->toStartWith('Trên Mac,')->toContain('Trên iPhone và iPad, Confirm Writes');

        // The Agent mode floor applies to the connection open in Agent mode, not to every connection.
        expect($en['safety']['body'][1])->toContain('While a connection is open in Agent mode')->not->toContain('every connection');
        expect($vi['safety']['body'][1])->not->toContain('mọi connection');

        // Read-Only refuses AI writes instead of waiting for Run.
        expect($en['ai']['body'][1])->toContain('Read-Only refuses');
        expect($vi['ai']['body'][1])->toContain('Read-Only từ chối');

        expect($en['switch']['lead'])->toContain('{macApp} only');
        expect($vi['switch']['lead'])->toContain('chỉ có trong {macApp}');
    });

    it('says what native means under the hero actions, with no platform claim it cannot keep and no figure', function (): void {
        $en = homeContent('en')['hero'];

        // The app is Swift with AppKit and SwiftUI on the Mac; it ships no Electron shell and no Java runtime.
        expect($en['native'])->toContain('written in Swift')->toContain('AppKit and SwiftUI on the Mac')->toContain('No Electron, no Java runtime');
        expect(preg_match('/\b(Windows|Linux)\b|\d/', $en['native']))->toBe(0, 'The native line names an unreleased platform or a number');
        // The subtitle stays one sentence about what the app does.
        expect(substr_count($en['subtitle'], '. '))->toBe(0, 'The subtitle grew a second sentence');

        foreach (Locales::codes() as $locale) {
            $hero = homeContent($locale)['hero'];

            foreach (['Swift', 'AppKit', 'SwiftUI', 'Electron', 'Java'] as $name) {
                expect($hero['native'])->toContain($name);
            }

            expect($hero['subtitle'])->not->toContain('{deviceList}')->toContain('{featuredEngines}');
        }
    });

    it('explains Safe Mode levels and Agent mode where they first appear, and spells out MCP once', function (): void {
        $en = homeContent('en');

        // The level names are the app's; the sentence says what each kind does before any later section relies on them.
        foreach (['Silent runs statements as written', 'Alert asks before a write', 'Read-Only refuses writes'] as $gloss) {
            expect($en['safety']['body'][0])->toContain($gloss);
        }

        $agent = $en['safety']['body'][1];
        $explained = strpos($agent, 'In Agent mode the AI assistant can run statements');
        $used = strpos($agent, 'While a connection is open in Agent mode');

        expect($explained)->not->toBeFalse('Agent mode is used without saying what it is');
        expect($used)->not->toBeFalse();
        expect($explained)->toBeLessThan($used);

        foreach (Locales::codes() as $locale) {
            expect(implode(' ', homeContent($locale)['ai']['body']))->toContain('Model Context Protocol');
        }
    });

    it('marks paid features with the plan first, the same way the features hub does', function (): void {
        foreach (Locales::codes() as $locale) {
            $home = homeContent($locale)['workflows']['paid'];
            $hub = homeData("content/{$locale}/features/index.json")['areas']['paid'];

            expect($home)->toContain('{tier}')->toContain('{features}');
            // The homepage line is a sentence, the hub's a chip: the same words, with a full stop on the sentence.
            expect(preg_replace('/[.。]$/u', '', $home))->toBe($hub, "content/{$locale}: the homepage and the features hub mark paid features differently");
        }

        expect(homeContent('en')['workflows']['paid'])->toBe('{tier} plan: {features}.');
    });

    it('names the paid $VAR references next to the free password sources, and does not say every dump tool needs installing', function (string $locale): void {
        $rows = collect(homeContent($locale)['workflows']['rows'])->keyBy('id');

        // The `env` password source is free; only `$VAR` references are Starter (PasswordSourceResolver and EnvVarResolver at v0.77.0).
        expect($rows['connect']['body'])->toContain('<code>$VAR</code>');
        // macOS ships sqlite3, so "which you install yourself" was false for SQLite.
        expect($rows['files']['body'])->toContain('{dumpTools}')->not->toContain($locale === 'vi' ? 'bạn tự cài các công cụ này' : 'which you install yourself');
        // SQL files run as statements; they are not imported "into a table".
        expect($rows['files']['body'])->not->toContain($locale === 'vi' ? 'Import {importFormats} vào table' : 'Import {importFormats} into a table');
    })->with(['en', 'vi']);

    it('keeps the identity copy free of platform names, versions and numbers', function (string $locale): void {
        /*
         * Positioning §13: the H1, the subtitle and the pillar headings hold
         * when a platform ships. Platforms reach the page only through the
         * captions and cards built from platforms.json.
         */
        $content = homeContent($locale);
        $identity = [
            'hero.title' => $content['hero']['title'],
            'hero.subtitle' => $content['hero']['subtitle'],
            'databases.title' => $content['databases']['title'],
            'safety.title' => $content['safety']['title'],
        ];

        foreach ($content['workflows']['rows'] as $row) {
            $identity["workflows.rows.{$row['id']}.title"] = $row['title'];
        }

        foreach ($identity as $key => $text) {
            expect(preg_match('/\b(Mac|macOS|iPhone|iPad|iOS|iPadOS|Windows|Linux)\b|\d/u', $text))->toBe(0, "{$locale} {$key} names a platform or a number: {$text}");
        }
    })->with(['en', 'vi']);

    it('places each workflow image through the manifest, the same in both languages', function (): void {
        $manifest = app(AssetManifest::class);

        foreach (['en', 'vi'] as $locale) {
            foreach (homeContent($locale)['workflows']['rows'] as $row) {
                expect($manifest->has($row['asset']))->toBeTrue("{$locale}: {$row['asset']} is not in the manifest");
                expect(collect($manifest->entry($row['asset'])['usedOn'])->contains(fn(array $use): bool => $use['path'] === '/'))
                    ->toBeTrue("{$row['asset']}'s brief does not list the homepage");
            }
        }

        expect(array_column(homeContent('vi')['workflows']['rows'], 'id'))->toBe(array_column(homeContent('en')['workflows']['rows'], 'id'));
    });
});

describe('server-rendered', function (): void {
    it('renders exactly one h1 and one main landmark', function (string $path): void {
        $html = ssrHome($path);

        expect(substr_count($html, '<h1'))->toBe(1, "{$path} must have exactly one h1");
        // The layout owns the <main>; the deploy smoke test also looks for it.
        expect(substr_count($html, '<main'))->toBe(1, "{$path} must have exactly one main landmark");
    })->with(['/', '/vi']);

    it('renders the ten sections in order, with Sponsors third', function (string $path): void {
        $ids = array_values(array_intersect(homeSectionIds(ssrHome($path)), HOME_SECTIONS));

        expect($ids)->toBe(HOME_SECTIONS);

        /*
         * Third among every <section> in <main>, not only among the known
         * ones: nothing may slip in between the databases and the sponsors.
         */
        expect(homeSectionIds(ssrHome($path))[2] ?? null)->toBe('sponsors');
    })->with(['/', '/vi']);

    it('renders the pricing section shipped Mac builds open, and keeps every older anchor inside its new section', function (string $path): void {
        $html = ssrHome($path);

        expect($html)->toContain('id="pricing"');

        foreach (HOME_ALIASES as $alias => $section) {
            $start = strpos($html, "id=\"{$section}\"");
            $next = HOME_SECTIONS[array_search($section, HOME_SECTIONS, true) + 1] ?? null;
            $end = $next !== null ? strpos($html, "id=\"{$next}\"") : strlen($html);
            $anchor = strpos($html, "id=\"{$alias}\"");

            expect($anchor)->not->toBeFalse("{$path} has no #{$alias}");
            expect($anchor > $start && $anchor < $end)->toBeTrue("{$path}: #{$alias} must sit inside #{$section}");
        }
    })->with(['/', '/vi']);

    it('says what Starter adds and whom it is for, every cycle\'s price and the refund window, in the pricing section', function (string $path, string $locale, array $copy, string $pattern, string $decimal): void {
        $html = html_entity_decode(ssrHome($path), ENT_QUOTES | ENT_HTML5);
        $start = (int) strpos($html, 'id="pricing"');
        $section = substr($html, $start, (int) strpos($html, 'id="open-source"') - $start);
        $pricing = homeData('pricing.json');

        $examples = collect(homeData('paid-features.json'))->where('tier', 'starter')->where('highlight', true)->pluck('name');
        $examples = $examples->slice(0, -1)->implode(', ') . $copy['and'] . $examples->last();

        $fill = fn(string $line): string => strtr($line, [
            '{examples}' => $examples,
            '{macs}' => (string) $pricing['tiers']['starter']['activations'],
            '{days}' => (string) $pricing['refund']['days'],
        ]);

        expect($section)
            ->toContain($fill($copy['starter']))
            ->toContain($fill($copy['person']))
            ->toContain($fill($copy['refund']))
            ->toContain('href="' . ($locale === 'en' ? '' : "/{$locale}") . '/refund-policy"');

        foreach (['starter', 'team'] as $tier) {
            foreach ($pricing['tiers'][$tier]['prices'] as $amount) {
                $price = sprintf($pattern, str_replace('.', $decimal, is_int($amount) ? (string) $amount : number_format($amount, 2, '.', '')));

                expect($section)->toContain(">{$price}<");
            }
        }
    })->with([
        'English' => ['/', 'en', [
            'and' => ' and ',
            'starter' => 'Adds features such as {examples} to the Mac app.',
            'person' => 'One license for one person, on up to {macs} Macs.',
            'refund' => 'Every paid plan can be refunded within {days} days of purchase.',
        ], '$%s', '.'],
        'Vietnamese' => ['/vi', 'vi', [
            'and' => ' và ',
            'starter' => 'Bổ sung cho ứng dụng Mac các tính năng như {examples}.',
            'person' => 'Một license cho một người, dùng trên tối đa {macs} máy Mac.',
            'refund' => 'Mọi gói trả phí đều được hoàn tiền trong vòng {days} ngày kể từ ngày mua.',
        ], "%s\u{a0}US$", ','],
    ]);

    it('describes the organization, the site and both apps, with no rating, FAQ or file size', function (string $path): void {
        $html = ssrHome($path);

        preg_match('#<script[^>]*type="application/ld\+json"[^>]*>(.*?)</script>#s', $html, $match);

        expect($match)->not->toBeEmpty("{$path} has no JSON-LD");

        $graph = json_decode(str_replace('<\/script', '</script', $match[1]), true, 512, JSON_THROW_ON_ERROR)['@graph'];
        $nodes = collect($graph)->keyBy('@type');

        expect($nodes->keys()->sort()->values()->all())->toBe(['MobileApplication', 'Organization', 'SoftwareApplication', 'WebSite']);
        expect($nodes['Organization']['@id'])->toEndWith('/#organization');
        expect($nodes['WebSite']['@id'])->toEndWith('/#website');
        expect($nodes['SoftwareApplication']['@id'])->toEndWith('/#app');
        expect($nodes['MobileApplication']['@id'])->toEndWith('/#ios-app');
        expect($nodes['Organization']['sameAs'] ?? [])->not->toBeEmpty();
        expect($nodes['SoftwareApplication'])->not->toHaveKeys(['isAccessibleForFree', 'fileSize', 'aggregateRating']);

        $pricing = homeData('pricing.json');
        $prices = collect($pricing['tiers'])->flatMap(fn(array $tier): array => isset($tier['price']) ? [$tier['price']] : array_values($tier['prices']))->map(fn($amount): string => is_int($amount) || floor($amount) === (float) $amount ? (string) (int) $amount : number_format($amount, 2, '.', ''));

        expect(collect($nodes['SoftwareApplication']['offers'])->pluck('price')->all())->toBe($prices->all());

        expect($html)
            ->not->toContain('aggregateRating')
            ->not->toContain('ratingValue')
            ->not->toContain('"@type":"FAQPage"');
    })->with(['/', '/vi']);

    it('names the platforms only in the availability lines, from data', function (): void {
        // The requirement phrase is held together with no-break spaces ("Apple silicon or Intel"); compare as text.
        $text = static fn(string $path): string => str_replace("\u{00A0}", ' ', ssrHome($path));

        expect($text('/'))
            ->toContain('A native database client for developers.')
            ->toContain('macOS 13 Ventura or later · Apple silicon or Intel')
            ->toContain('iPhone and iPad · iOS and iPadOS 18 or later')
            ->toContain('Download for Mac');

        expect($text('/vi'))
            ->toContain('Database client native dành cho lập trình viên.')
            ->toContain('macOS 13 Ventura trở lên · Apple silicon hoặc Intel')
            ->toContain('iPhone và iPad · iOS và iPadOS 18 trở lên')
            ->toContain('Tải về cho Mac');

        foreach (['/', '/vi'] as $path) {
            foreach (['Every database', 'every database', 'macOS 14', 'Sonoma', 'Universal', 'unlock', 'free forever', 'GitHub Trending'] as $retired) {
                expect(ssrHome($path))->not->toContain($retired);
            }
        }
    });

    it('thanks only the verified sponsors, each as a sponsored link', function (): void {
        $html = ssrHome('/');

        foreach (homeData('sponsors.json')['sponsors'] as $sponsor) {
            expect($html)->toMatch('#<a[^>]*href="' . preg_quote(htmlspecialchars($sponsor['url'], ENT_QUOTES), '#') . '"[^>]*rel="sponsored noopener"#');
        }

        foreach (['getapps', 'Visnalize', 'Unikorn', 'Xermius'] as $former) {
            expect($html)->not->toContain($former);
        }
    });

    it('renders a title built from platforms.json, Product Hunt only as a text link, and wraps the sponsor logos', function (string $path, string $title, string $productHunt): void {
        $html = ssrHome($path);

        expect($html)->toMatch('#<title[^>]*>' . preg_quote($title, '#') . '</title>#u');
        expect(mb_strlen($title))->toBeLessThanOrEqual(60);

        // One anchor in #open-source is the only place Product Hunt appears: no image, no script, no preconnect.
        preg_match('#<section[^>]*id="open-source".*?</section>#s', $html, $openSource);
        preg_match_all('#<a\b[^>]*\bhref="https://www\.producthunt\.com/products/tablepro"[^>]*>(.*?)</a>#s', $openSource[0] ?? '', $anchors);

        expect($anchors[0])->toHaveCount(1);
        expect(strip_tags($anchors[1][0]))->toContain($productHunt);
        expect($anchors[1][0])->not->toContain('<img');
        expect(substr_count($html, 'producthunt.com'))->toBe(1);
        // No toast region: nothing calls toast(), and Sonner's English landmark name showed on /vi.
        expect($html)->not->toContain('aria-label="Notifications');

        /*
         * A wall of cells: two across below 768px, the 2 × 2 of design-system
         * §8.1, and four across from 768 (§4.7). A wide wordmark once
         * overflowed a fixed column at 375px, so each item may shrink
         * (`min-w-0`) and each logo scales down (`max-w-full`). The logos load
         * eagerly at low priority, so a late lazy load never leaves the white
         * dark-mode tile empty, and React does not preload them ahead of the
         * page's own images.
         */
        preg_match('#<section[^>]*id="sponsors".*?</section>#s', $html, $sponsors);

        expect($sponsors[0] ?? '')->toContain('cell-grid grid-cols-2 md:grid-cols-4')->toContain('min-w-0 max-w-full')
            ->toContain('fetchPriority="low"')->not->toContain('loading="lazy"');
    })->with([
        ['/', 'TablePro: native database client for Mac, iPhone and iPad', 'TablePro on Product Hunt'],
        ['/vi', 'TablePro: database client native cho Mac, iPhone và iPad', 'TablePro trên Product Hunt'],
    ]);

    it('links the features hub from the workflows section and scopes the importers to the Mac app', function (string $path, string $lead): void {
        $html = ssrHome($path);
        $start = (int) strpos($html, 'id="features"');
        $workflows = substr($html, $start, (int) strpos($html, 'id="safety"') - $start);
        $prefix = $path === '/vi' ? '/vi' : '';

        expect($workflows)->toMatch('#href="' . $prefix . '/features"#');
        expect($html)->toContain($lead);

        // The row that describes the Structure tab also links the page that covers it.
        $from = strpos($workflows, 'id="features-edit"');
        $to = strpos($workflows, 'id="features-schema"');

        expect($from)->not->toBeFalse();
        expect($to)->not->toBeFalse();

        $edit = substr($workflows, (int) $from, (int) $to - (int) $from);

        expect($edit)->toContain('href="' . $prefix . '/features/data-editing"')->toContain('href="' . $prefix . '/features/schema#structure"');

        // What the reader can bring leads the section; the Mac-only note closes its text.
        $switchStart = strpos($html, 'id="switch"');
        $switch = substr($html, (int) $switchStart, (int) strpos($html, 'id="pricing"') - (int) $switchStart);
        $note = strpos($switch, $lead);
        $project = strpos($switch, 'docker-compose.yml');

        expect($switchStart)->not->toBeFalse();
        expect($note)->not->toBeFalse("{$path}: the Mac-only note is missing from #switch");
        expect($project)->not->toBeFalse();
        expect($project)->toBeLessThan($note);
    })->with([
        ['/', 'Importing from other apps and Open Project Folder are in the Mac app only.'],
        ['/vi', 'Import từ ứng dụng khác và Open Project Folder chỉ có trong ứng dụng Mac.'],
    ]);

    it('sets each workflow beside its capture from 1280px, with one divider down the section', function (string $path, string $locale): void {
        $grid = HTMLDocument::createFromString(ssrHome($path), LIBXML_NOERROR)->querySelector('#features .cell-grid');
        $classes = fn(?Element $element): array => preg_split('/\s+/', trim((string) $element?->getAttribute('class')));
        $manifest = app(AssetManifest::class);
        $rows = homeContent($locale)['workflows']['rows'];

        expect($grid)->not->toBeNull();
        expect($grid->querySelectorAll('h3'))->toHaveCount(count($rows));

        foreach ($rows as $row) {
            $heading = $grid->querySelector("#features-{$row['id']}");
            $cell = $heading;

            while ($cell->parentElement !== $grid) {
                $cell = $cell->parentElement;
            }

            if ($manifest->entry($row['asset'])['kind'] === 'detail') {
                // Two cells, 5 / 7 from 1024px and 4 / 8 from 1280px, so the divider meets the window rows'.
                expect($classes($cell))->toContain('lg:col-span-5', 'xl:col-span-4');
                expect($classes($cell->nextElementSibling))->toContain('lg:col-span-7', 'xl:col-span-8');

                continue;
            }

            // One cell at every width, so the stacked row below 1280px keeps no line between its text and its window.
            [$text, $media] = [$cell->firstElementChild, $cell->lastElementChild];

            expect($classes($cell))->toContain('lg:col-span-12', 'xl:grid', 'xl:grid-cols-12', 'xl:gap-px', 'xl:p-0');
            expect(array_values(array_filter($classes($cell), fn(string $class): bool => str_contains($class, 'grid') && ! str_starts_with($class, 'xl:'))))->toBe([]);
            expect($cell->childElementCount)->toBe(2);
            expect($text->contains($heading))->toBeTrue();
            expect($classes($text))->toContain('xl:col-span-4');
            expect($classes($media))->toContain('xl:col-span-8', 'xl:shadow-[-1px_0_0_var(--rule)]');

            // The desktop sources load the width the window has in its eight columns.
            $sources = $media->querySelectorAll('source[media="(min-width: 768px)"]');

            expect($sources->length)->toBeGreaterThan(0, "{$path}: {$row['asset']} renders no desktop source");

            foreach ($sources as $source) {
                expect($source->getAttribute('sizes'))->toStartWith('(min-width: 1280px) 790px,');
            }
        }

        // 12 columns share the 1278px grid (76rem of content and a 31px bleed each side) with 1px between them; a window spans 8 and pads 31px each side.
        $column = (76 * 16 + 2 * 31 - 11) / 12;

        expect((int) round(8 * $column + 7 - 2 * 31))->toBe(790);
    })->with([['/', 'en'], ['/vi', 'vi']]);

    it('shows each featured engine once, the engine count from data and the hub\'s categories', function (string $path, string $locale): void {
        $html = ssrHome($path);
        preg_match('#<section[^>]*id="databases".*?</section>#s', $html, $match);
        $section = $match[0] ?? '';
        $engines = collect(homeData('engines.json'))->where('state', 'published');
        $categories = array_values(array_intersect(DatabaseController::CATEGORIES, $engines->pluck('category')->all()));
        $prefix = $locale === 'en' ? '' : "/{$locale}";

        expect($section)->not->toBe('');
        expect($categories)->not->toBeEmpty();

        foreach ($engines->where('featured', true) as $engine) {
            expect(substr_count($section, 'href="' . $prefix . '/' . $engine['slug'] . '"'))->toBe(1, "{$path}: {$engine['name']} is not linked exactly once in #databases");
        }

        // Every link in the block is a featured engine or a way into the hub: the full list lives on /databases.
        preg_match_all('#<a\b[^>]*\bhref="([^"]+)"#', $section, $links);

        expect(count($links[1]))->toBe($engines->where('featured', true)->count() + count($categories) + 1);

        foreach ($categories as $category) {
            $title = homeData("content/{$locale}/databases/index.json")['categories'][$category]['title'];

            expect($section)->toMatch('~<a\b[^>]*href="' . preg_quote("{$prefix}/databases#{$category}", '~') . '"[^>]*>' . preg_quote(htmlspecialchars($title, ENT_QUOTES), '~') . '</a>~u');
        }

        expect(strip_tags($section))->toContain((string) $engines->count());
    })->with([['/', 'en'], ['/vi', 'vi']]);

    it('keeps a hyphenated compound of the databases heading on one line', function (): void {
        // "key-" / "value" broke across two lines at 390px.
        expect(ssrHome('/'))->toMatch('#<h2 id="databases-title"[^>]*>[^<]*<span class="whitespace-nowrap">key-value</span>#');
    });

    it('puts what native means under the hero actions, outside the headline', function (string $path, string $locale): void {
        $html = ssrHome($path);
        $copy = homeContent($locale)['hero'];
        $start = strpos($html, 'id="top"');
        $hero = html_entity_decode(strip_tags(substr($html, (int) $start, (int) strpos($html, 'id="databases"') - (int) $start)), ENT_QUOTES | ENT_HTML5);
        preg_match('#<pricing>(.*?)</pricing>#', $copy['business'], $pricingLink);

        $headline = strpos($hero, $copy['title']);
        $pricing = strpos($hero, $pricingLink[1]);
        $native = strpos($hero, $copy['native']);

        expect($start)->not->toBeFalse();
        expect($headline)->not->toBeFalse();
        expect($pricing)->not->toBeFalse("{$path}: the pricing line is not in the hero");
        expect($native)->not->toBeFalse("{$path}: the native line is not in the hero");
        expect($pricing)->toBeGreaterThan($headline);
        expect($native)->toBeGreaterThan($pricing);
    })->with([['/', 'en'], ['/vi', 'vi']]);

    it('shows the hero window as a labelled placeholder until it is supplied', function (): void {
        if (app(AssetManifest::class)->isSupplied('mac-hero-window')) {
            $this->markTestSkipped('The hero is supplied.');
        }

        expect(ssrHome('/'))
            ->toContain('data-asset-id="mac-hero-window"')
            ->toContain('data-asset-id="mac-hero-window-mobile"');
    });
});
