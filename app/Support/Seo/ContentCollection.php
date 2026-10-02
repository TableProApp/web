<?php

namespace App\Support\Seo;

use App\Support\Content\ContentRepository;
use App\Support\Content\Slugs\CompareSlugs;
use App\Support\Content\Slugs\DatabaseSlugs;
use App\Support\Content\Slugs\FeatureSlugs;
use App\Support\Localization\Locales;

/**
 * The page families built from content collections: features, databases and
 * comparisons, each with its hub.
 *
 * A page renders in a locale when `resources/data/content/{locale}/{family}/{slug}.json`
 * exists (`index.json` for a hub), and is indexable there unless that file
 * sets `seo.indexable` to false: the same rule as `StaticPages`.
 *
 * A slug must also be in its family's slug constant. The constant is what the
 * route accepts, so a content file with no slug behind it would be a sitemap
 * URL that answers 404. `LocaleRoutingTest` pins the two lists together.
 *
 * A page with no content in any locale is not this family's yet, and `find()`
 * returns null so the registry falls through to `LegacyPages`.
 */
final class ContentCollection implements PageFamily
{
    /**
     * Hub route => [content family, OG family, data files the page renders].
     *
     * Hubs have no card of their own; their OG family only tells the language
     * switcher which section they belong to.
     *
     * @var array<string, array{0: string, 1: string, 2: list<string>}>
     */
    private const HUBS = [
        'landing.features.index' => ['features', 'feature', ['resources/data/paid-features.json']],
        'landing.databases.index' => ['databases', 'database', ['resources/data/engines.json']],
        'landing.compare.index' => ['compare', 'compare', ['resources/data/comparisons.json']],
    ];

    /**
     * Page route => [content family, OG family, data files the page renders].
     *
     * The data files join the content file in `sources`, so a page's lastmod
     * moves when the facts it renders change, not only its copy.
     * `content/{locale}/engines.json` holds each engine's limit sentences.
     *
     * @var array<string, array{0: string, 1: string, 2: list<string>}>
     */
    private const PAGES = [
        'landing.features.show' => ['features', 'feature', ['resources/data/facts.json', 'resources/data/paid-features.json']],
        'landing.databaseClient' => ['databases', 'database', ['resources/data/engines.json', 'resources/data/content/{locale}/engines.json']],
        'landing.compare' => ['compare', 'compare', ['resources/data/comparisons.json']],
    ];

    public function __construct(
        private readonly ContentRepository $content,
    ) {}

    /**
     * @return list<PageEntry>
     */
    public function entries(): array
    {
        $entries = [];

        foreach (array_keys(self::HUBS) as $route) {
            $hub = $this->find($route, []);

            if ($hub !== null) {
                $entries[] = $hub;
            }
        }

        foreach (self::PAGES as $route => [$family]) {
            $slugs = [];

            foreach (Locales::codes() as $locale) {
                array_push($slugs, ...$this->content->slugs($family, $locale));
            }

            $slugs = array_values(array_unique($slugs));
            sort($slugs);

            foreach ($slugs as $slug) {
                $page = $this->find($route, ['slug' => $slug]);

                if ($page !== null) {
                    $entries[] = $page;
                }
            }
        }

        return $entries;
    }

    /**
     * @param  array<string, string>  $params
     */
    public function find(string $route, array $params): ?PageEntry
    {
        if (array_key_exists($route, self::HUBS)) {
            [$family, $ogFamily, $data] = self::HUBS[$route];

            return $params === [] ? $this->entry($route, [], "{$family}/index", $data, $ogFamily, null) : null;
        }

        if (! array_key_exists($route, self::PAGES)) {
            return null;
        }

        $slug = $params['slug'] ?? null;

        if (! is_string($slug) || count($params) !== 1 || ! in_array($slug, self::slugs($route), true)) {
            return null;
        }

        [$family, $ogFamily, $data] = self::PAGES[$route];

        return $this->entry($route, $params, "{$family}/{$slug}", $data, $ogFamily, $slug);
    }

    /**
     * The content file that holds a page's copy, such as `databases/mysql-client`.
     */
    public static function contentName(PageEntry $entry): ?string
    {
        if (array_key_exists($entry->route, self::HUBS)) {
            return self::HUBS[$entry->route][0] . '/index';
        }

        if (array_key_exists($entry->route, self::PAGES) && isset($entry->params['slug'])) {
            return self::PAGES[$entry->route][0] . '/' . $entry->params['slug'];
        }

        return null;
    }

    /**
     * @return list<string>
     */
    private static function slugs(string $route): array
    {
        return match ($route) {
            'landing.features.show' => FeatureSlugs::ALL,
            'landing.databaseClient' => DatabaseSlugs::ALL,
            'landing.compare' => CompareSlugs::ALL,
            default => [],
        };
    }

    /**
     * @param  array<string, string>  $params
     * @param  list<string>  $data
     */
    private function entry(string $route, array $params, string $name, array $data, string $ogFamily, ?string $ogSlug): ?PageEntry
    {
        $render = [];
        $indexable = [];
        $sources = [];

        foreach (Locales::codes() as $locale) {
            if (! $this->content->has($name, $locale)) {
                continue;
            }

            $render[] = $locale;
            $sources[] = "resources/data/content/{$locale}/{$name}.json";

            $seo = $this->content->page($name, $locale)['seo'] ?? [];

            if (! is_array($seo) || ($seo['indexable'] ?? true) !== false) {
                $indexable[] = $locale;
            }

            foreach ($data as $file) {
                if (str_contains($file, '{locale}')) {
                    $sources[] = str_replace('{locale}', $locale, $file);
                }
            }
        }

        if ($render === []) {
            return null;
        }

        foreach ($data as $file) {
            if (! str_contains($file, '{locale}')) {
                $sources[] = $file;
            }
        }

        return new PageEntry(
            route: $route,
            params: $params,
            renderLocales: $render,
            indexableLocales: $indexable,
            sources: $sources,
            ogFamily: $ogFamily,
            ogSlug: $ogSlug,
        );
    }
}
