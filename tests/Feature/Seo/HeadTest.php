<?php

use App\Services\Blog\BlogService;
use App\Support\Localization\Locales;
use App\Support\Localization\LocaleSwitcher;
use App\Support\Seo\OgImages;
use App\Support\Seo\PageEntry;
use App\Support\Seo\PageRegistry;
use App\Support\Seo\SeoContext;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Http;

use function Pest\Laravel\get;

beforeEach(function (): void {
    Http::fake(['api.github.com/*' => Http::response([], 200)]);
});

function headDocument(string $path, int $status = 200): Dom\HTMLDocument
{
    requireSsr();

    $response = test()->get('http://' . config('app.web_domain') . $path)->assertStatus($status);

    return Dom\HTMLDocument::createFromString((string) $response->getContent(), LIBXML_NOERROR);
}

function headValues(Dom\HTMLDocument $document, string $selector, string $attribute): array
{
    return array_map(
        fn(Dom\Element $element): string => (string) $element->getAttribute($attribute),
        iterator_to_array($document->querySelectorAll($selector)),
    );
}

function headExpected(PageEntry $entry, string $locale): array
{
    $paired = in_array($locale, $entry->hreflangCluster(), true);
    $alternates = [];
    $ogAlternates = [];

    foreach ($paired ? $entry->hreflangCluster() : [] as $code) {
        $alternates[] = ['hreflang' => Locales::definition($code)['hreflang'], 'href' => $entry->url($code)];

        if ($code !== $locale) {
            $ogAlternates[] = Locales::definition($code)['og'];
        }
    }

    return [
        'robots' => $entry->isIndexable($locale) ? 'index, follow' : 'noindex, follow',
        'canonical' => $entry->isIndexable($locale) ? $entry->url($locale) : null,
        'alternates' => $alternates,
        'xDefault' => $paired ? $entry->url(Locales::default()) : null,
        'ogLocale' => Locales::definition($locale)['og'],
        'ogLocaleAlternates' => $ogAlternates,
        'markdown' => $entry->markdownUrl($locale),
    ];
}

function headContext(string $path, string $locale): array
{
    $context = app(SeoContext::class)->forRequest(seoMatchedRequest($path, $locale));
    unset($context['ogImage']);

    return $context;
}

it('keeps the health check out of search results, and no page', function (): void {
    get('/up')->assertOk()->assertHeader('X-Robots-Tag', 'noindex');
    get('/pricing')->assertOk()->assertHeaderMissing('X-Robots-Tag');
});

it('serves a robots.txt that allows everything and lists the sitemaps', function (): void {
    $response = get(route('web.robots'))
        ->assertOk()
        ->assertHeader('Content-Type', 'text/plain; charset=UTF-8')
        ->assertSee('Allow: /')
        ->assertSee('Sitemap: https://tablepro.app/sitemap.xml');

    expect($response->getContent())->not->toContain('Disallow');
});

it('shares the registry head on every page, the same on both sides of every pair', function (): void {
    $crawl = seoCrawlProps();

    foreach (app(PageRegistry::class)->all() as $entry) {
        foreach ($entry->renderLocales as $locale) {
            $path = $entry->url($locale, false);
            $seo = $crawl[$path]['props']['seo'] ?? null;

            expect($seo)->toBeArray("{$path} shares no seo prop");
            unset($seo['ogImage']);

            expect($seo)->toBe(headExpected($entry, $locale), "{$path}: the seo prop disagrees with the registry");

            foreach ($seo['alternates'] as $alternate) {
                expect($crawl[seoPathOf($alternate['href'])]['props']['seo']['alternates'] ?? null)
                    ->toBe($seo['alternates'], "{$alternate['href']} does not list {$path} back");
            }
        }
    }
});

describe('on a scratch site with every kind of page', function (): void {
    beforeEach(function (): void {
        $this->dirs = seoScratch();

        foreach (['en', 'vi'] as $locale) {
            seoWriteContent($this->dirs['content'], $locale, 'home');
            seoWriteContent($this->dirs['content'], $locale, 'features/index');
            seoWriteContent($this->dirs['content'], $locale, 'features/querying');
            seoWriteMarkdown("{$this->dirs['legal']}/{$locale}/privacy.md");
        }

        seoWriteContent($this->dirs['content'], 'en', 'blog');
        seoWriteContent($this->dirs['content'], 'vi', 'blog', ['seo' => ['title' => 'Blog', 'description' => 'd', 'indexable' => false]]);
        seoWriteContent($this->dirs['content'], 'en', 'compare/tableplus');
        seoWriteMarkdown("{$this->dirs['blog']}/tablepro-0-77.md");
        seoWriteMarkdown("{$this->dirs['blog']}/a-guide.md");
        seoWriteMarkdown("{$this->dirs['blog']}/vi/a-guide.md");
        seoWriteMarkdown("{$this->dirs['legal']}/en/terms.md");

        app()->forgetInstance(PageRegistry::class);
    });

    afterEach(function (): void {
        File::deleteDirectory($this->dirs['root']);
    });

    it('gives every page the head the registry implies, pointing only at indexed translations', function (): void {
        $hreflangs = array_flip(array_column(Locales::all(), 'hreflang'));
        $codes = array_keys(Locales::all());

        foreach (app(PageRegistry::class)->all() as $entry) {
            foreach ($entry->renderLocales as $locale) {
                $context = headContext($entry->url($locale, false), $locale);

                expect($context)->toBe(headExpected($entry, $locale), "{$entry->key()} ({$locale})");

                foreach ($context['alternates'] as $alternate) {
                    expect($entry->isIndexable($codes[$hreflangs[$alternate['hreflang']]]))->toBeTrue("{$entry->key()} points at {$alternate['href']}");
                }
            }
        }
    });

    it('declares no alternates for an untranslated page', function (string $path): void {
        $context = headContext($path, 'en');

        expect($context['canonical'])->toBe('https://localhost' . $path)
            ->and($context['alternates'])->toBe([])
            ->and($context['xDefault'])->toBeNull()
            ->and($context['ogLocaleAlternates'])->toBe([]);
    })->with([
        'an English-only post' => ['/blog/tablepro-0-77'],
        'an English-only comparison' => ['/compare/tableplus'],
        'an English-only legal page' => ['/terms'],
        'a page whose translation is not indexed' => ['/blog'],
    ]);

    it('renders a page that is not indexed without pairing it, and switches to the indexed one', function (): void {
        expect(headContext('/vi/blog', 'vi'))->toMatchArray([
            'robots' => 'noindex, follow',
            'canonical' => null,
            'alternates' => [],
            'xDefault' => null,
        ]);

        expect(app(LocaleSwitcher::class)->forRequest(seoMatchedRequest('/vi/blog', 'vi'))[0])
            ->toMatchArray(['locale' => 'en', 'href' => '/blog', 'fallback' => false]);
    });
});

it('server-renders the registry head, in the page language', function (string $path, string $locale): void {
    $document = headDocument($path);
    $entry = app(SeoContext::class)->entryFor(seoMatchedRequest($path, $locale));
    $canonical = $entry->isIndexable($locale) ? [$entry->url($locale)] : [];
    $card = app(OgImages::class)->for($entry, $locale);

    expect($document->documentElement->getAttribute('lang'))->toBe($locale)
        ->and(headValues($document, 'meta[name="robots"]', 'content'))->toBe([$entry->robots($locale)])
        ->and(headValues($document, 'link[rel="canonical"]', 'href'))->toBe($canonical)
        ->and(headValues($document, 'meta[property="og:url"]', 'content'))->toBe($canonical)
        ->and(headValues($document, 'meta[property="og:locale"]', 'content'))->toBe([Locales::definition($locale)['og']])
        ->and(array_map(seoPathOf(...), headValues($document, 'meta[property="og:image"]', 'content')))->toBe([seoPathOf((string) $card['url'])])
        ->and(headValues($document, 'meta[property="og:image:alt"]', 'content'))->toBe([(string) $card['alt']]);

    $expected = [];

    if (in_array($locale, $entry->hreflangCluster(), true)) {
        foreach ($entry->hreflangCluster() as $code) {
            $expected[Locales::definition($code)['hreflang']] = $entry->url($code);
        }

        $expected['x-default'] = $entry->url(Locales::default());
    }

    expect(array_combine(
        headValues($document, 'link[rel="alternate"][hreflang]', 'hreflang'),
        headValues($document, 'link[rel="alternate"][hreflang]', 'href'),
    ))->toEqualCanonicalizing($expected);

    foreach ($document->querySelectorAll('script[type="application/ld+json"]') as $script) {
        $data = json_decode((string) $script->textContent, true, 512, JSON_THROW_ON_ERROR);

        foreach ($data['@graph'] ?? [$data] as $node) {
            if (in_array($node['@type'] ?? null, ['WebPage', 'CollectionPage', 'ItemPage', 'AboutPage', 'BlogPosting', 'Article'], true)) {
                expect($node['inLanguage'] ?? null)->toBe(Locales::definition($locale)['hreflang'], "{$path}: a {$node['@type']} node is in another language");
            }
        }
    }
})->with([
    'home' => ['/', 'en'],
    'download, in Vietnamese' => ['/vi/download', 'vi'],
    'pricing' => ['/pricing', 'en'],
    'about, in Japanese' => ['/ja/about', 'ja'],
    'a feature' => ['/features/querying', 'en'],
    'an engine' => ['/mysql-client', 'en'],
    'a comparison' => ['/compare/dbeaver', 'en'],
    'the blog' => ['/blog', 'en'],
    'the blog in German, rendered but not indexed' => ['/de/blog', 'de'],
    'an English-only release post' => ['/blog/tablepro-0-77', 'en'],
    'a legal page' => ['/privacy', 'en'],
])->group('ssr');

it('server-renders an error page noindex, pointing at nothing', function (string $path, int $status, string $locale): void {
    $document = headDocument($path, $status);

    expect($document->documentElement->getAttribute('lang'))->toBe($locale)
        ->and(headValues($document, 'meta[name="robots"]', 'content'))->toBe(['noindex, follow']);

    foreach (['link[rel="canonical"]', 'link[rel="alternate"][hreflang]', 'meta[property="og:url"]', 'script[type="application/ld+json"]'] as $selector) {
        expect($document->querySelectorAll($selector))->toHaveCount(0, "{$path} carries {$selector}");
    }
})->with([
    'a 404' => ['/no-such-page', 404, 'en'],
    'a 404, in Vietnamese' => ['/vi/no-such-page', 404, 'vi'],
    'an English-only post asked for in Vietnamese' => ['/vi/blog/tablepro-0-77', 404, 'vi'],
    'a removed page' => ['/compare/azimutt', 410, 'en'],
])->group('ssr');

it('dates a post in its Open Graph tags, and no other page', function (): void {
    $published = fn(string $path): array => headValues(headDocument($path), 'meta[property="article:published_time"]', 'content');

    expect($published('/blog/tablepro-0-77'))->toBe([app(BlogService::class)->find('tablepro-0-77', 'en')->date->toDateString()])
        ->and($published('/blog'))->toBe([])
        ->and($published('/pricing'))->toBe([]);
})->group('ssr');
