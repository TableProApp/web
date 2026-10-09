<?php

use App\Support\Localization\Locales;
use App\Support\Seo\OgImages;
use App\Support\Seo\SeoContext;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Http;
use Illuminate\Testing\TestResponse;
use PHPUnit\Framework\Assert;

use function Pest\Laravel\get;
use function Pest\Laravel\withoutVite;

require_once __DIR__ . '/../Seo/helpers.php';

/**
 * The head every public page server-renders, one page per family, in each
 * language (architecture §1.6, §1.17; sitemap §F.2).
 *
 * The registry decides every value, and `Seo/HreflangReciprocityTest` proves
 * the shared `seo` prop equals it on every page. These cases check what
 * reaches the HTML: one robots meta, a self canonical only where the page is
 * indexed, hreflang only for real pairs, `og:locale`, an `og:image` that is a
 * file on disk, and JSON-LD that states the page's language.
 *
 * Head tags come from a React component, so the cases that read them are
 * gated on the SSR service (`requireSsr()`, through `ssrHtml()` or
 * `landingSeoDocument()`). Without it the response is the Blade shell: an
 * ungated first version of the robots check counted zero tags on every page
 * and failed for a reason that had nothing to do with robots.
 */
beforeEach(function (): void {
    withoutVite();
    Http::fake(['api.github.com/*' => Http::response([], 200)]);
});

/**
 * The schema.org types that are CreativeWorks and so carry the page's
 * `inLanguage` (lib/structured-data.ts). `WebSite` lists every language
 * instead; `Organization`, `BreadcrumbList`, `ItemList` and `Offer` take none.
 *
 * @return list<string>
 */
function landingSeoCreativeWorks(): array
{
    return ['WebPage', 'CollectionPage', 'ItemPage', 'AboutPage', 'BlogPosting', 'Article', 'SoftwareApplication', 'MobileApplication', 'WebApplication'];
}

/**
 * A GET on the public site's own host.
 */
function getOnWebDomainSeo(string $path): TestResponse
{
    return test()->get('http://' . config('app.web_domain') . $path);
}

/**
 * The server-rendered document for a path, after checking its status.
 */
function landingSeoDocument(string $path, int $status = 200): Dom\HTMLDocument
{
    requireSsr();

    $response = getOnWebDomainSeo($path);
    $response->assertStatus($status);

    return Dom\HTMLDocument::createFromString((string) $response->getContent(), LIBXML_NOERROR);
}

/**
 * One attribute of every element a selector matches, in document order.
 *
 * @return list<string>
 */
function landingSeoValues(Dom\HTMLDocument $document, string $selector, string $attribute): array
{
    return array_map(
        static fn(Dom\Element $element): string => (string) $element->getAttribute($attribute),
        iterator_to_array($document->querySelectorAll($selector)),
    );
}

/**
 * Every top-level JSON-LD node on the page, taken out of its `@graph`.
 *
 * @return list<array<string, mixed>>
 */
function landingSeoJsonLdNodes(Dom\HTMLDocument $document): array
{
    $nodes = [];

    foreach ($document->querySelectorAll('script[type="application/ld+json"]') as $script) {
        $data = json_decode((string) $script->textContent, true, 512, JSON_THROW_ON_ERROR);

        foreach (array_is_list($data) ? $data : [$data] as $block) {
            foreach ($block['@graph'] ?? [$block] as $node) {
                $nodes[] = $node;
            }
        }
    }

    return $nodes;
}

it('keeps the health check out of search results, and marks no page that way', function (): void {
    $this->get('/up')->assertOk()->assertHeader('X-Robots-Tag', 'noindex');
    $this->get('/pricing')->assertOk()->assertHeaderMissing('X-Robots-Tag');
});

it('rejects unknown slugs in every family and language', function (string $path): void {
    getOnWebDomainSeo($path)->assertNotFound();
})->with([
    'a comparison' => ['/compare/unknown-tool'],
    'a comparison, in Vietnamese' => ['/vi/compare/unknown-tool'],
    'an engine page' => ['/some-bogus-slug'],
    'an engine page, in Vietnamese' => ['/vi/some-bogus-slug'],
    'a feature' => ['/features/unknown-feature'],
    'a feature, in Vietnamese' => ['/vi/features/unknown-feature'],
    'a post' => ['/blog/unknown-post'],
    'a post, in Vietnamese' => ['/vi/blog/unknown-post'],
    'an English-only post, in Vietnamese' => ['/vi/blog/tablepro-0-77'],
]);

it('serves robots.txt that allows everything and lists both sitemaps', function (): void {
    /*
     * robots.txt is not access control (spec §10): private pages carry their
     * own noindex, and nothing here may hide a public one.
     */
    $response = get(route('web.robots'));

    $response->assertOk()
        ->assertHeader('Content-Type', 'text/plain; charset=UTF-8')
        ->assertSee('Allow: /')
        ->assertSee('Sitemap: https://tablepro.app/sitemap.xml')
        ->assertSee('Sitemap: https://docs.tablepro.app/sitemap.xml');

    expect($response->getContent())->not->toContain('Disallow');
});

it('renders the registry head on every page family, in each language', function (string $path, string $locale): void {
    $document = landingSeoDocument($path);
    $entry = app(SeoContext::class)->entryFor(seoMatchedRequest($path, $locale));

    Assert::assertNotNull($entry, "{$path} is not a registry page");

    /*
     * One robots meta, with the registry's value. `app.blade.php` once
     * hard-coded `index,follow` while the head added `noindex, nofollow`, so
     * every page shipped two, and a noindex page two that contradicted each
     * other.
     */
    $canonical = $entry->isIndexable($locale) ? [$entry->url($locale)] : [];

    expect($document->documentElement->getAttribute('lang'))->toBe($locale);
    expect(landingSeoValues($document, 'meta[name="robots"]', 'content'))->toBe([$entry->robots($locale)]);
    expect(landingSeoValues($document, 'link[rel="canonical"]', 'href'))->toBe($canonical);
    expect(landingSeoValues($document, 'meta[property="og:url"]', 'content'))->toBe($canonical);
    expect(landingSeoValues($document, 'meta[property="og:locale"]', 'content'))->toBe([Locales::definition($locale)['og']]);

    $expected = [];

    if (in_array($locale, $entry->hreflangCluster(), true)) {
        foreach ($entry->hreflangCluster() as $code) {
            $expected[Locales::definition($code)['hreflang']] = $entry->url($code);
        }

        $expected['x-default'] = $entry->url(Locales::default());
    }

    $hreflangs = [];

    foreach ($document->querySelectorAll('link[rel="alternate"][hreflang]') as $link) {
        $hreflangs[(string) $link->getAttribute('hreflang')] = (string) $link->getAttribute('href');
    }

    ksort($expected);
    ksort($hreflangs);

    expect($hreflangs)->toBe($expected);
    expect(count($document->querySelectorAll('link[rel="alternate"][hreflang]')))->toBe(count($expected), "{$path} repeats an alternate");

    /*
     * The card a share preview fetches: the page's own card where it has
     * one, its language's generic card otherwise, and always a file that
     * exists, with size tags that match it.
     */
    $images = landingSeoValues($document, 'meta[property="og:image"]', 'content');

    expect($images)->toHaveCount(1, "{$path} shares no card, or more than one");
    expect(seoPathOf($images[0]))->toBe(seoPathOf((string) (app(OgImages::class)->for($entry, $locale)['url'] ?? '')));
    expect(landingSeoValues($document, 'meta[name="twitter:image"]', 'content'))->toBe($images);

    $file = base_path('public' . seoPathOf($images[0]));

    expect(File::isFile($file))->toBeTrue("{$path} shares {$images[0]}, which is not in public/");

    $size = (array) getimagesize($file);

    expect(landingSeoValues($document, 'meta[property="og:image:width"]', 'content'))->toBe([(string) $size[0]]);
    expect(landingSeoValues($document, 'meta[property="og:image:height"]', 'content'))->toBe([(string) $size[1]]);

    $alt = (string) app(OgImages::class)->for($entry, $locale)['alt'];

    expect($alt)->not->toBe('', "{$path} does not say what its card shows");
    expect(landingSeoValues($document, 'meta[property="og:image:alt"]', 'content'))->toBe([$alt]);
    expect(landingSeoValues($document, 'meta[name="twitter:image:alt"]', 'content'))->toBe([$alt]);

    /*
     * Structured data in the page's language, describing visible content
     * only: no ratings, no reviews, no FAQPage or HowTo anywhere.
     */
    $works = 0;

    foreach (landingSeoJsonLdNodes($document) as $node) {
        $type = $node['@type'] ?? null;

        expect($type)->not->toBeIn(['FAQPage', 'HowTo', 'Review', 'AggregateRating']);
        expect(array_intersect(array_keys($node), ['aggregateRating', 'review', 'reviewRating']))->toBe([], "{$path}: a {$type} node carries a rating");

        if ($type === 'Organization') {
            expect((string) ($node['@id'] ?? ''))->toEndWith('/#organization');
        }

        if ($type === 'WebSite') {
            expect($node['inLanguage'] ?? null)->toBe(array_map(fn(string $code): string => Locales::definition($code)['hreflang'], Locales::codes()));

            continue;
        }

        if (in_array($type, landingSeoCreativeWorks(), true)) {
            expect($node['inLanguage'] ?? null)->toBe(Locales::definition($locale)['hreflang'], "{$path}: the {$type} node does not state the page's language");
            $works++;
        }
    }

    expect($works)->toBeGreaterThan(0, "{$path} describes nothing in its own language");
})->with([
    'home' => ['/', 'en'],
    'home, in Vietnamese' => ['/vi', 'vi'],
    'download' => ['/download', 'en'],
    'download, in Vietnamese' => ['/vi/download', 'vi'],
    'pricing' => ['/pricing', 'en'],
    'pricing, in Vietnamese' => ['/vi/pricing', 'vi'],
    'iPhone and iPad' => ['/ios', 'en'],
    'iPhone and iPad, in Vietnamese' => ['/vi/ios', 'vi'],
    'FAQ' => ['/faq', 'en'],
    'FAQ, in Vietnamese' => ['/vi/faq', 'vi'],
    'about' => ['/about', 'en'],
    'about, in Japanese' => ['/ja/about', 'ja'],
    'features hub' => ['/features', 'en'],
    'features hub, in Vietnamese' => ['/vi/features', 'vi'],
    'a feature' => ['/features/querying', 'en'],
    'a feature, in Vietnamese' => ['/vi/features/querying', 'vi'],
    'databases hub' => ['/databases', 'en'],
    'databases hub, in Vietnamese' => ['/vi/databases', 'vi'],
    'an engine' => ['/mysql-client', 'en'],
    'an engine, in Vietnamese' => ['/vi/mysql-client', 'vi'],
    'compare hub' => ['/compare', 'en'],
    'compare hub, in Vietnamese' => ['/vi/compare', 'vi'],
    'a comparison' => ['/compare/dbeaver', 'en'],
    'a comparison, in Vietnamese' => ['/vi/compare/dbeaver', 'vi'],
    'the blog' => ['/blog', 'en'],
    'the blog in Vietnamese' => ['/vi/blog', 'vi'],
    'the blog in German, rendered but not indexed' => ['/de/blog', 'de'],
    'an English-only release post' => ['/blog/tablepro-0-77', 'en'],
    'a legal page' => ['/privacy', 'en'],
    'a legal page, in Vietnamese' => ['/vi/privacy', 'vi'],
    'security' => ['/security', 'en'],
    'security, in Japanese' => ['/ja/security', 'ja'],
]);

it('marks an error page noindex, follow and points it at nothing', function (string $path, int $status, string $locale): void {
    /*
     * A crawler that lands on a dead link can follow the page's links home,
     * but nothing on the page claims a URL: no canonical, no alternates, no
     * card and no structured data.
     */
    $document = landingSeoDocument($path, $status);

    expect($document->documentElement->getAttribute('lang'))->toBe($locale);
    expect(landingSeoValues($document, 'meta[name="robots"]', 'content'))->toBe(['noindex, follow']);
    expect(landingSeoValues($document, 'meta[property="og:locale"]', 'content'))->toBe([Locales::definition($locale)['og']]);

    foreach (['link[rel="canonical"]', 'link[rel="alternate"][hreflang]', 'meta[property="og:url"]', 'meta[property="og:image"]', 'meta[property="og:locale:alternate"]', 'script[type="application/ld+json"]'] as $selector) {
        expect(count($document->querySelectorAll($selector)))->toBe(0, "{$path} carries {$selector}");
    }
})->with([
    'a 404' => ['/no-such-page', 404, 'en'],
    'a 404, in Vietnamese' => ['/vi/no-such-page', 404, 'vi'],
    'an English-only post asked for in Vietnamese' => ['/vi/blog/tablepro-0-77', 404, 'vi'],
    'a removed comparison' => ['/compare/azimutt', 410, 'en'],
]);

it('dates a post in its Open Graph tags, and no other page', function (): void {
    $published = fn(string $path): array => landingSeoValues(landingSeoDocument($path), 'meta[property="article:published_time"]', 'content');

    expect($published('/blog/tablepro-0-77'))->toBe(['2026-10-02'])
        ->and($published('/blog'))->toBe([])
        ->and($published('/pricing'))->toBe([]);
});

it('publishes one application entity and no FAQPage on the homepage', function (string $path): void {
    $html = ssrHtml($path);

    expect(substr_count($html, '"@type":"SoftwareApplication"'))->toBe(1);
    // /faq owns the FAQ content for the site. Google retired the rich result
    // on 7 May 2026, and a second copy here competed with a strict superset.
    expect($html)->not->toContain('"@type":"FAQPage"');
})->with(['/', '/vi']);

it('describes every price point it claims to offer', function (string $path): void {
    $html = ssrHtml($path);
    $tiers = json_decode((string) file_get_contents(resource_path('data/pricing.json')), true, 512, JSON_THROW_ON_ERROR)['tiers'];
    $app = null;

    preg_match_all('#<script type="application/ld\+json"[^>]*>(.*?)</script>#s', $html, $blocks);

    foreach ($blocks[1] as $block) {
        $data = json_decode($block, true, 512, JSON_THROW_ON_ERROR);

        foreach ($data['@graph'] ?? [$data] as $node) {
            if (str_ends_with((string) ($node['@id'] ?? ''), '/#app')) {
                $app = $node;
            }
        }
    }

    expect($app)->not->toBeNull();

    // The free tier plus one offer per paid tier and cycle, each priced from pricing.json.
    $prices = collect([$tiers['free']['price']]);

    foreach ($tiers as $tier) {
        $prices = $prices->merge(array_values($tier['prices'] ?? []));
    }

    expect(collect($app['offers'])->pluck('@type')->unique()->all())->toBe(['Offer']);
    expect(collect($app['offers'])->pluck('price')->map(fn(string $price): float => (float) $price)->all())
        ->toBe($prices->map(fn(int|float $price): float => (float) $price)->all());

    /*
     * `datePublished` was set to the *latest* release date, so the markup said
     * the app was first published last week and moved that claim forward on
     * every release.
     */
    expect($html)->not->toContain('"datePublished"');
})->with(['/', '/vi']);
