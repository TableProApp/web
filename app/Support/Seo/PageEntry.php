<?php

namespace App\Support\Seo;

use App\Support\Localization\LocalizedUrl;

/**
 * One public page, as every SEO surface sees it.
 *
 * A page lists the locales it **renders** in and, separately, the locales it is
 * **indexed** in. They differ on purpose: `/de/blog` answers 200 with
 * German chrome but carries `noindex, follow`, because what it lists is
 * English. The canonical, the robots value, hreflang, the sitemap, the OG card
 * and the language switcher are all derived from these two lists, so none of
 * them can disagree with another.
 */
final readonly class PageEntry
{
    /**
     * @param  string  $route  base route name, e.g. `landing.compare`
     * @param  array<string, string>  $params
     * @param  list<string>  $renderLocales  locales in which the URL answers 200
     * @param  list<string>  $indexableLocales  subset of $renderLocales: index, sitemap, hreflang
     * @param  list<string>  $sources  repository paths whose last change is the page's lastmod
     * @param  string  $ogFamily  site | blog | database | compare | feature
     */
    public function __construct(
        public string $route,
        public array $params,
        public array $renderLocales,
        public array $indexableLocales,
        public array $sources,
        public string $ogFamily,
        public ?string $ogSlug,
    ) {}

    public function renders(string $locale): bool
    {
        return in_array($locale, $this->renderLocales, true);
    }

    public function isIndexable(string $locale): bool
    {
        return $this->renders($locale) && in_array($locale, $this->indexableLocales, true);
    }

    /**
     * The one robots value this page carries in a locale.
     */
    public function robots(string $locale): string
    {
        return $this->isIndexable($locale) ? 'index, follow' : 'noindex, follow';
    }

    /**
     * The locales that are real translations of each other, for hreflang.
     *
     * Empty unless at least two locales are indexable: a page that exists in
     * one language has no alternates to declare.
     *
     * @return list<string>
     */
    public function hreflangCluster(): array
    {
        $cluster = array_values(array_filter(
            $this->indexableLocales,
            fn(string $locale): bool => $this->renders($locale),
        ));

        return count($cluster) >= 2 ? $cluster : [];
    }

    /**
     * The page's URL in a locale.
     */
    public function url(string $locale, bool $absolute = true): string
    {
        return LocalizedUrl::route($this->route, $this->params, $locale, $absolute);
    }

    /**
     * The registry key: the base route name and its sorted parameters.
     */
    public function key(): string
    {
        return self::keyFor($this->route, $this->params);
    }

    /**
     * @param  array<string, string>  $params
     */
    public static function keyFor(string $route, array $params): string
    {
        ksort($params);

        return $route . '?' . http_build_query($params);
    }
}
