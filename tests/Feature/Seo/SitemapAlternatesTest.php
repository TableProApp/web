<?php

use App\Support\Localization\Locales;
use App\Support\Seo\PageRegistry;
use App\Support\Seo\SeoContext;
use Illuminate\Support\Facades\File;

require_once __DIR__ . '/helpers.php';

/**
 * The sitemap and the head say the same thing about every URL (sitemap §F.1).
 *
 * Both are built from the registry, the head by `SeoContext` and the sitemap
 * by `sitemap:generate`. This compares the two outputs directly, so a change
 * to either side that breaks the agreement fails here even if each side still
 * passes its own tests.
 */

/**
 * The head's alternates for a sitemap URL, keyed by hreflang, `x-default` last.
 *
 * @return array<string, string>
 */
function sitemapAlternatesFromHead(string $loc): array
{
    $path = seoPathOf($loc);
    $prefix = explode('/', trim($path, '/'))[0];
    $locale = Locales::default();

    foreach (Locales::codes() as $code) {
        if (Locales::prefixFor($code) !== null && Locales::prefixFor($code) === $prefix) {
            $locale = $code;
        }
    }

    $seo = app(SeoContext::class)->forRequest(seoMatchedRequest($path, $locale));
    $alternates = [];

    foreach ($seo['alternates'] as $alternate) {
        $alternates[$alternate['hreflang']] = $alternate['href'];
    }

    if ($seo['xDefault'] !== null) {
        $alternates['x-default'] = $seo['xDefault'];
    }

    expect($seo['robots'])->toBe('index, follow', "{$loc} is in the sitemap but not indexed");
    expect($seo['canonical'])->toBe($loc, "{$loc} is in the sitemap but canonicalises elsewhere");

    return $alternates;
}

it('lists the same alternates as the head, for every real URL', function (): void {
    $urls = seoGenerateSitemap();

    expect($urls)->not->toBeEmpty();

    foreach ($urls as $loc => $url) {
        expect($url['alternates'])->toBe(sitemapAlternatesFromHead($loc), "{$loc}: sitemap and head disagree");
    }
});

it('lists the same alternates as the head on a site with pairs', function (): void {
    $dirs = seoScratch();

    foreach (['en', 'vi'] as $locale) {
        seoWriteContent($dirs['content'], $locale, 'home');
        seoWriteContent($dirs['content'], $locale, 'faq');
        seoWriteContent($dirs['content'], $locale, 'compare/index');
        seoWriteContent($dirs['content'], $locale, 'compare/dbeaver');
        seoWriteMarkdown("{$dirs['legal']}/{$locale}/refund-policy.md");
    }

    seoWriteContent($dirs['content'], 'en', 'blog');
    seoWriteContent($dirs['content'], 'vi', 'blog', ['seo' => ['title' => 'Blog', 'description' => 'd', 'indexable' => false]]);
    seoWriteContent($dirs['content'], 'en', 'databases/mysql-client');
    seoWriteMarkdown("{$dirs['blog']}/tablepro-0-77.md");
    $this->app->forgetInstance(PageRegistry::class);

    $urls = seoGenerateSitemap();
    $paired = 0;

    foreach ($urls as $loc => $url) {
        expect($url['alternates'])->toBe(sitemapAlternatesFromHead($loc), "{$loc}: sitemap and head disagree");
        $paired += $url['alternates'] === [] ? 0 : 1;
    }

    // home, faq, compare hub, dbeaver and the refund policy, both sides.
    expect($paired)->toBe(10);

    File::deleteDirectory($dirs['root']);
});
