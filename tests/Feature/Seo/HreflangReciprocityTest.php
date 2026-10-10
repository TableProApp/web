<?php

use App\Support\Localization\Locales;
use App\Support\Localization\LocaleSwitcher;
use App\Support\Seo\PageEntry;
use App\Support\Seo\PageRegistry;
use App\Support\Seo\SeoContext;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Http;
use PHPUnit\Framework\Assert;

require_once __DIR__ . '/helpers.php';

beforeEach(function (): void {
    Http::fake(['api.github.com/*' => Http::response([], 200)]);
});

/**
 * @return array{robots: string, canonical: string|null, alternates: list<array{hreflang: string, href: string}>, xDefault: string|null, ogLocale: string, ogLocaleAlternates: list<string>}
 */
function hreflangExpected(PageEntry $entry, string $locale): array
{
    $cluster = $entry->hreflangCluster();
    $paired = in_array($locale, $cluster, true);
    $alternates = [];
    $ogAlternates = [];

    if ($paired) {
        foreach ($cluster as $code) {
            $alternates[] = ['hreflang' => Locales::definition($code)['hreflang'], 'href' => $entry->url($code)];

            if ($code !== $locale) {
                $ogAlternates[] = Locales::definition($code)['og'];
            }
        }
    }

    return [
        'robots' => $entry->isIndexable($locale) ? 'index, follow' : 'noindex, follow',
        'canonical' => $entry->isIndexable($locale) ? $entry->url($locale) : null,
        'alternates' => $alternates,
        'xDefault' => $paired ? $entry->url(Locales::default()) : null,
        'ogLocale' => Locales::definition($locale)['og'],
        'ogLocaleAlternates' => $ogAlternates,
    ];
}

/**
 * @return array<string, mixed>
 */
function hreflangContextFor(string $path, string $locale): array
{
    $context = app(SeoContext::class)->forRequest(seoMatchedRequest($path, $locale));
    unset($context['ogImage']);

    return $context;
}

/**
 * @param  array{content: string, blog: string, legal: string}  $dirs
 */
function hreflangScratchSite(array $dirs): void
{
    foreach (['en', 'vi'] as $locale) {
        seoWriteContent($dirs['content'], $locale, 'home');
        seoWriteContent($dirs['content'], $locale, 'features/index');
        seoWriteContent($dirs['content'], $locale, 'features/querying');
        seoWriteMarkdown("{$dirs['legal']}/{$locale}/privacy.md");
    }

    seoWriteContent($dirs['content'], 'en', 'blog');
    seoWriteContent($dirs['content'], 'vi', 'blog', ['seo' => ['title' => 'Blog', 'description' => 'd', 'indexable' => false]]);
    seoWriteContent($dirs['content'], 'en', 'compare/tableplus');
    seoWriteMarkdown("{$dirs['blog']}/tablepro-0-77.md");
    seoWriteMarkdown("{$dirs['blog']}/a-guide.md");
    seoWriteMarkdown("{$dirs['blog']}/vi/a-guide.md");
    seoWriteMarkdown("{$dirs['legal']}/en/terms.md");

    app()->forgetInstance(PageRegistry::class);
}

describe('on a scratch site with every kind of page', function (): void {
    beforeEach(function (): void {
        $this->dirs = seoScratch();
        hreflangScratchSite($this->dirs);
    });

    afterEach(function (): void {
        File::deleteDirectory($this->dirs['root']);
    });

    it('gives every page exactly the head the registry implies', function (): void {
        $checked = 0;

        foreach (app(PageRegistry::class)->all() as $entry) {
            foreach ($entry->renderLocales as $locale) {
                expect(hreflangContextFor($entry->url($locale, false), $locale))
                    ->toBe(hreflangExpected($entry, $locale), "{$entry->key()} ({$locale})");
                $checked++;
            }
        }

        expect($checked)->toBeGreaterThan(10);
    });

    it('declares the same alternates on both sides of every pair', function (): void {
        $pairs = 0;

        foreach (app(PageRegistry::class)->all() as $entry) {
            foreach ($entry->renderLocales as $locale) {
                $source = $entry->url($locale);
                $context = hreflangContextFor($entry->url($locale, false), $locale);

                foreach ($context['alternates'] as $alternate) {
                    expect($alternate['href'])->toStartWith('https://localhost/');

                    $code = array_search($alternate['hreflang'], array_map(fn(array $l): string => $l['hreflang'], Locales::all()), true);
                    $back = hreflangContextFor(seoPathOf($alternate['href']), (string) $code);

                    expect($back['alternates'])->toBe($context['alternates'], "{$alternate['href']} does not list {$source} back");
                    expect(array_column($back['alternates'], 'href'))->toContain($source);
                    $pairs++;
                }
            }
        }

        // home, features hub, querying, privacy and the translated guide, both sides.
        expect($pairs)->toBe(5 * 2 * 2);
    });

    it('keeps a self canonical in its own locale, never one in another', function (): void {
        expect(hreflangContextFor('/', 'en')['canonical'])->toBe('https://localhost/');
        expect(hreflangContextFor('/vi', 'vi')['canonical'])->toBe('https://localhost/vi');
        expect(hreflangContextFor('/vi/features/querying', 'vi')['canonical'])->toBe('https://localhost/vi/features/querying');
        expect(hreflangContextFor('/vi/privacy', 'vi')['canonical'])->toBe('https://localhost/vi/privacy');
        expect(hreflangContextFor('/vi/blog/a-guide', 'vi')['xDefault'])->toBe('https://localhost/blog/a-guide');
    });

    it('declares no alternates for an untranslated page', function (string $path): void {
        $context = hreflangContextFor($path, 'en');

        expect($context['robots'])->toBe('index, follow');
        expect($context['canonical'])->toBe('https://localhost' . $path);
        expect($context['alternates'])->toBe([]);
        expect($context['xDefault'])->toBeNull();
        expect($context['ogLocaleAlternates'])->toBe([]);
    })->with([
        'an English-only release post' => ['/blog/tablepro-0-77'],
        'an English-only comparison' => ['/compare/tableplus'],
        'an English-only legal page' => ['/terms'],
        'the blog index, whose Vietnamese twin is not indexed' => ['/blog'],
    ]);

    it('renders /vi/blog without indexing it or pairing it', function (): void {
        $context = hreflangContextFor('/vi/blog', 'vi');

        expect($context)->toBe([
            'robots' => 'noindex, follow',
            'canonical' => null,
            'alternates' => [],
            'xDefault' => null,
            'ogLocale' => 'vi_VN',
            'ogLocaleAlternates' => [],
        ]);

        $switcher = app(LocaleSwitcher::class)->forRequest(seoMatchedRequest('/vi/blog', 'vi'));

        expect($switcher[0])->toMatchArray(['locale' => 'en', 'href' => '/blog', 'fallback' => false]);
    });

    it('never points at a translation that does not exist', function (): void {
        foreach (app(PageRegistry::class)->all() as $entry) {
            foreach ($entry->renderLocales as $locale) {
                $context = hreflangContextFor($entry->url($locale, false), $locale);

                foreach ($context['alternates'] as $alternate) {
                    $code = array_search($alternate['hreflang'], array_map(fn(array $l): string => $l['hreflang'], Locales::all()), true);

                    expect($entry->isIndexable((string) $code))->toBeTrue("{$entry->key()} points at {$alternate['href']}, which is not an indexed page");
                }
            }
        }

        expect(app(PageRegistry::class)->find('landing.compare', ['slug' => 'tableplus'])->renders('vi'))->toBeFalse();
    });
});

it('shares the registry head on every real page, in every locale it renders in', function (): void {
    $crawl = seoCrawlProps();
    $checked = 0;

    foreach (app(PageRegistry::class)->all() as $entry) {
        foreach ($entry->renderLocales as $locale) {
            $path = $entry->url($locale, false);
            $seo = $crawl[$path]['props']['seo'] ?? null;

            Assert::assertIsArray($seo, "{$path} shares no seo prop");
            unset($seo['ogImage']);

            expect($seo)->toBe(hreflangExpected($entry, $locale), "{$path}: the shared seo prop disagrees with the registry");

            foreach ($seo['alternates'] as $alternate) {
                $back = $crawl[seoPathOf($alternate['href'])]['props']['seo']['alternates'] ?? null;

                expect($back)->toBe($seo['alternates'], "{$alternate['href']} does not list {$path} back");
            }

            $checked++;
        }
    }

    expect($checked)->toBeGreaterThan(0);
});
