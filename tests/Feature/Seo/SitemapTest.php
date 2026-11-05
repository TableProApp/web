<?php

use App\Support\Localization\Locales;
use App\Support\Localization\LocalizedUrl;
use App\Support\Seo\PageRegistry;
use App\Support\Seo\SeoContext;
use Illuminate\Support\Facades\File;

function sitemapHeadAlternates(string $loc): array
{
    $path = seoPathOf($loc);
    $prefix = explode('/', trim($path, '/'))[0];
    $locale = collect(Locales::codes())->first(fn(string $code): bool => Locales::prefixFor($code) === $prefix) ?? Locales::default();

    $seo = app(SeoContext::class)->forRequest(seoMatchedRequest($path, $locale));

    expect($seo['robots'])->toBe('index, follow', "{$loc} is in the sitemap but not indexed")
        ->and($seo['canonical'])->toBe($loc, "{$loc} is in the sitemap but canonicalises elsewhere");

    $alternates = array_column($seo['alternates'], 'href', 'hreflang');

    if ($seo['xDefault'] !== null) {
        $alternates['x-default'] = $seo['xDefault'];
    }

    return $alternates;
}

it('writes public/sitemap.xml and leaves the real one alone', function (): void {
    $real = base_path('public/sitemap.xml');
    $before = is_file($real) ? hash_file('sha256', $real) : null;
    $public = seoScratchPublic();

    $this->artisan('sitemap:generate')->assertSuccessful();

    expect(File::get($public . '/sitemap.xml'))->toContain('xmlns:xhtml="http://www.w3.org/1999/xhtml"')
        ->and(is_file($real) ? hash_file('sha256', $real) : null)->toBe($before);

    File::deleteDirectory($public);
});

it('lists exactly the indexable pages of the registry, once each', function (): void {
    $expected = [];

    foreach (app(PageRegistry::class)->all() as $entry) {
        foreach (Locales::codes() as $locale) {
            if ($entry->isIndexable($locale)) {
                $expected[] = $entry->url($locale);
            }
        }
    }

    expect(array_keys(seoCommittedSitemap()))->toEqualCanonicalizing(array_values(array_unique($expected)));
});

it('lists absolute, clean, dated URLs with no changefreq or priority', function (): void {
    foreach (seoCommittedSitemap() as $loc => $url) {
        expect($loc)->toStartWith(LocalizedUrl::base() . '/')
            ->and(parse_url($loc, PHP_URL_QUERY))->toBeNull()
            ->and(parse_url($loc, PHP_URL_FRAGMENT))->toBeNull()
            ->and($loc === LocalizedUrl::base() . '/' || ! str_ends_with($loc, '/'))->toBeTrue("{$loc} has a trailing slash")
            ->and($url['lastmod'])->not->toBeNull("{$loc} has no lastmod")
            ->and($url['elements'])->not->toContain('changefreq')
            ->and($url['elements'])->not->toContain('priority');
    }
});

it('leaves out retired paths, platform paths and system files', function (): void {
    $paths = array_map(seoPathOf(...), array_keys(seoCommittedSitemap()));

    expect($paths)->not->toContain(...array_column(seoRedirectEntries(), 'from'))
        ->and($paths)->not->toContain('/up', '/robots.txt', '/sitemap.xml');

    foreach ($paths as $path) {
        expect(LocalizedUrl::isPlatformPath($path))->toBeFalse("{$path} belongs to the platform app")
            ->and($path)->not->toStartWith('/databases/');
    }
});

it('lists the same alternates as the head of each page', function (): void {
    foreach (seoCommittedSitemap() as $loc => $url) {
        expect($url['alternates'])->toBe(sitemapHeadAlternates($loc), "{$loc}: sitemap and head disagree");
    }
});

describe('on a scratch site with pairs, single-language pages and an unindexed /vi/blog', function (): void {
    beforeEach(function (): void {
        $this->dirs = seoScratch();

        foreach (['en', 'vi'] as $locale) {
            seoWriteContent($this->dirs['content'], $locale, 'home');
            seoWriteContent($this->dirs['content'], $locale, 'features/querying');
            seoWriteMarkdown("{$this->dirs['legal']}/{$locale}/privacy.md");
        }

        seoWriteContent($this->dirs['content'], 'en', 'blog');
        seoWriteContent($this->dirs['content'], 'vi', 'blog', ['seo' => ['title' => 'Blog', 'description' => 'd', 'indexable' => false]]);
        seoWriteMarkdown("{$this->dirs['blog']}/tablepro-0-77.md");
        $this->app->forgetInstance(PageRegistry::class);
    });

    afterEach(function (): void {
        File::deleteDirectory($this->dirs['root']);
    });

    it('lists both sides of a pair, each with every translation and x-default', function (): void {
        $urls = seoGenerateSitemap();
        $pair = [
            'en' => 'https://localhost/features/querying',
            'vi' => 'https://localhost/vi/features/querying',
            'x-default' => 'https://localhost/features/querying',
        ];

        expect($urls['https://localhost/features/querying']['alternates'])->toBe($pair)
            ->and($urls['https://localhost/vi/features/querying']['alternates'])->toBe($pair)
            ->and($urls['https://localhost/vi/privacy']['alternates']['x-default'])->toBe('https://localhost/privacy');
    });

    it('gives an untranslated page no alternates', function (): void {
        $urls = seoGenerateSitemap();

        expect($urls['https://localhost/blog/tablepro-0-77']['alternates'])->toBe([])
            ->and($urls['https://localhost/blog']['alternates'])->toBe([]);
    });

    it('leaves out a page that renders but is not indexed', function (): void {
        $urls = seoGenerateSitemap();

        expect($urls)->not->toHaveKey('https://localhost/vi/blog');

        foreach ($urls as $url) {
            expect($url['alternates'])->not->toContain('https://localhost/vi/blog');
        }
    });

    it('makes every alternate a URL the sitemap lists, with the same alternates', function (): void {
        $urls = seoGenerateSitemap();

        foreach ($urls as $loc => $url) {
            foreach ($url['alternates'] as $href) {
                expect($urls)->toHaveKey($href)
                    ->and($urls[$href]['alternates'])->toBe($url['alternates'], "{$href} and {$loc} disagree");
            }
        }
    });
});
