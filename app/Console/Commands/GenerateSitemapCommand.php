<?php

namespace App\Console\Commands;

use App\Support\Localization\Locales;
use App\Support\Seo\LastModified;
use App\Support\Seo\PageEntry;
use App\Support\Seo\PageRegistry;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Spatie\Sitemap\Sitemap;
use Spatie\Sitemap\Tags\Url;

/**
 * Writes `public/sitemap.xml` from the page registry.
 *
 * One `<url>` per page and indexable locale, the same set the head marks
 * `index, follow`, so the sitemap and the pages cannot disagree:
 *
 * - A translated page lists every translation as an `xhtml:link` alternate,
 *   itself included, plus `x-default` pointing at the English URL. These are
 *   exactly the head's alternates (`SitemapAlternatesTest`).
 * - An untranslated page (an English-only release post, `/blog`) has none.
 * - A page that renders but is not indexed (`/vi/blog`) is absent, as are
 *   redirect and 410 sources (the registry never lists them), error pages and
 *   every platform path (the registry never knows them).
 * - `lastmod` is the last change to the files that drive the page in that
 *   locale (`LastModified`); `changefreq` and `priority` are omitted, because
 *   search engines ignore them.
 */
#[Signature('sitemap:generate')]
#[Description('Generate public/sitemap.xml from the page registry, with hreflang alternates')]
class GenerateSitemapCommand extends Command
{
    public function handle(PageRegistry $registry, LastModified $lastModified): int
    {
        $sitemap = Sitemap::create();
        $count = 0;

        foreach ($registry->all() as $entry) {
            foreach (Locales::codes() as $locale) {
                if (! $entry->isIndexable($locale)) {
                    continue;
                }

                $url = Url::create($entry->url($locale));

                foreach (self::alternates($registry, $entry, $locale) as $hreflang => $href) {
                    $url->addAlternate($href, $hreflang);
                }

                $modified = $lastModified->forEntry($entry, $locale);

                if ($modified !== null) {
                    $url->setLastModificationDate($modified);
                }

                $sitemap->add($url);
                $count++;
            }
        }

        $sitemap->writeToFile(public_path('sitemap.xml'));

        $this->components->info("Sitemap generated with {$count} URLs.");

        return self::SUCCESS;
    }

    /**
     * The hreflang alternates of a page in a locale: each translation, itself
     * included, then `x-default`. Empty when the page has no translation.
     *
     * The same rule as `SeoContext`, which builds the head's alternates.
     *
     * @return array<string, string> hreflang => absolute URL
     */
    public static function alternates(PageRegistry $registry, PageEntry $entry, string $locale): array
    {
        $cluster = $entry->hreflangCluster();

        if (! in_array($locale, $cluster, true)) {
            return [];
        }

        $alternates = [];

        foreach ($registry->alternates($entry) as $code => $href) {
            $alternates[Locales::definition($code)['hreflang']] = $href;
        }

        if (in_array(Locales::default(), $cluster, true)) {
            $alternates['x-default'] = $entry->url(Locales::default());
        }

        return $alternates;
    }
}
