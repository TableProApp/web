<?php

use App\Support\Localization\Locales;
use App\Support\Localization\LocalizedUrl;
use App\Support\Seo\PageRegistry;
use Illuminate\Support\Facades\File;

require_once __DIR__ . '/../Seo/helpers.php';

/**
 * `sitemap:generate` (architecture §1.6, sitemap §F.3).
 *
 * The sitemap is the registry's indexable pages and nothing else: one `<url>`
 * per page and indexable locale, each translated page with every translation
 * and `x-default` as `xhtml:link` alternates. It is written to a scratch
 * public directory, so a run never leaves a file in `public/`.
 */
it('writes public/sitemap.xml and nothing else', function (): void {
    /*
     * The real public/sitemap.xml is gitignored, and every deploy that touches
     * content regenerates it, so the production checkout always has one.
     * Asserting it is absent made the suite fail there. What this test means is
     * that the run leaves it alone: still absent if it was absent, the same
     * bytes and modification time if it was there.
     */
    $fingerprint = function (string $path): ?array {
        clearstatcache(true, $path);

        return is_file($path) ? [hash_file('sha256', $path), filemtime($path)] : null;
    };

    $real = base_path('public/sitemap.xml');
    $before = $fingerprint($real);
    $public = seoScratchPublic();

    $this->artisan('sitemap:generate')
        ->expectsOutputToContain('Sitemap generated with')
        ->assertSuccessful();

    expect(File::exists($public . '/sitemap.xml'))->toBeTrue();
    expect($fingerprint($real))->toBe($before, 'sitemap:generate touched the real public/sitemap.xml');
    expect(File::get($public . '/sitemap.xml'))->toContain('xmlns:xhtml="http://www.w3.org/1999/xhtml"');

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

    $urls = array_keys(seoGenerateSitemap());

    sort($expected);
    sort($urls);

    expect($urls)->toBe($expected);
    expect($urls)->toBe(array_values(array_unique($urls)));
});

it('lists the English and Vietnamese blog indexes as each other\'s alternates, and no other language of it', function (): void {
    $urls = seoGenerateSitemap();
    $base = LocalizedUrl::base();

    foreach (['/blog', '/vi/blog'] as $path) {
        expect($urls)->toHaveKey($base . $path);
        expect($urls[$base . $path]['alternates'])->toBe(['en' => "{$base}/blog", 'vi' => "{$base}/vi/blog", 'x-default' => "{$base}/blog"]);
    }

    foreach (array_diff(Locales::codes(), ['en', 'vi']) as $locale) {
        expect($urls)->not->toHaveKey("{$base}/{$locale}/blog");
    }
});

it('lists absolute, clean, canonical URLs only', function (): void {
    foreach (seoGenerateSitemap() as $loc => $url) {
        expect($loc)->toStartWith(LocalizedUrl::base() . '/');
        expect(parse_url($loc, PHP_URL_QUERY))->toBeNull();
        expect(parse_url($loc, PHP_URL_FRAGMENT))->toBeNull();
        expect($loc === LocalizedUrl::base() . '/' || ! str_ends_with($loc, '/'))->toBeTrue("{$loc} has a trailing slash");

        foreach ($url['alternates'] as $href) {
            expect($href)->toStartWith(LocalizedUrl::base() . '/');
        }
    }
});

it('leaves out redirect and 410 sources, platform paths and system files', function (): void {
    $paths = array_map(fn(string $loc): string => seoPathOf($loc), array_keys(seoGenerateSitemap()));

    foreach (seoRedirectEntries() as $entry) {
        expect(in_array($entry['from'], $paths, true))->toBeFalse("{$entry['from']} is retired");
    }

    foreach ($paths as $path) {
        expect(LocalizedUrl::isPlatformPath($path))->toBeFalse("{$path} belongs to the platform app");
        expect(str_starts_with($path, '/databases/'))->toBeFalse("{$path} is a docs-style redirect");
        expect(in_array($path, ['/up', '/robots.txt', '/sitemap.xml', '/sitemap-index.xml'], true))->toBeFalse("{$path} is not a page");
    }
});

it('dates each URL and drops changefreq and priority', function (): void {
    foreach (seoGenerateSitemap() as $loc => $url) {
        expect($url['lastmod'])->not->toBeNull("{$loc} has no lastmod");
        expect(strtotime((string) $url['lastmod']))->toBeInt();
        expect(in_array('changefreq', $url['elements'], true))->toBeFalse();
        expect(in_array('priority', $url['elements'], true))->toBeFalse();
    }
});

describe('on a scratch site with pairs, single-language pages and /vi/blog', function (): void {
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

        expect($urls['https://localhost/features/querying']['alternates'])->toBe($pair);
        expect($urls['https://localhost/vi/features/querying']['alternates'])->toBe($pair);

        expect($urls['https://localhost/']['alternates'])->toBe([
            'en' => 'https://localhost/',
            'vi' => 'https://localhost/vi',
            'x-default' => 'https://localhost/',
        ]);
        expect($urls['https://localhost/vi/privacy']['alternates']['x-default'])->toBe('https://localhost/privacy');
    });

    it('gives an untranslated page no alternates at all', function (): void {
        $urls = seoGenerateSitemap();

        expect($urls['https://localhost/blog/tablepro-0-77']['alternates'])->toBe([]);
        expect($urls['https://localhost/blog']['alternates'])->toBe([]);
    });

    it('leaves out /vi/blog, which renders but is not indexed', function (): void {
        $urls = seoGenerateSitemap();

        expect(array_key_exists('https://localhost/blog', $urls))->toBeTrue();
        expect(array_key_exists('https://localhost/vi/blog', $urls))->toBeFalse();

        foreach ($urls as $url) {
            expect(in_array('https://localhost/vi/blog', $url['alternates'], true))->toBeFalse();
        }
    });

    it('makes every alternate a URL the sitemap itself lists', function (): void {
        $urls = seoGenerateSitemap();

        foreach ($urls as $loc => $url) {
            foreach ($url['alternates'] as $hreflang => $href) {
                expect(array_key_exists($href, $urls))->toBeTrue("{$loc} points {$hreflang} at {$href}, which is not listed");
                expect($urls[$href]['alternates'])->toBe($url['alternates'], "{$href} and {$loc} disagree");
            }
        }
    });
});
