<?php

namespace App\Support\Seo;

use App\Support\Content\ContentRepository;
use App\Support\Localization\Locales;

/**
 * The one-off pages: home, download, iOS, pricing, FAQ, about, security and the blog index.
 *
 * Each renders in a locale when `resources/data/content/{locale}/{page}.json`
 * exists, and is indexable there unless that file sets `seo.indexable` to
 * false. That flag is how `/vi/blog` renders without being indexed: it lives in
 * the content file, not in code, so the owner can flip it once Vietnamese
 * summaries exist.
 *
 * A page with no content file in any locale is not a page: `find()` returns
 * null, the registry knows no such page, and the route answers 404.
 */
final class StaticPages implements PageFamily
{
    /**
     * Base route name => content file name.
     */
    public const PAGES = [
        'landing.home' => 'home',
        'landing.download' => 'download',
        'landing.ios' => 'ios',
        'landing.pricing' => 'pricing',
        'landing.faq' => 'faq',
        'landing.about' => 'about',
        'landing.security' => 'security',
        'landing.blog.index' => 'blog',
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

        foreach (array_keys(self::PAGES) as $route) {
            $entry = $this->find($route, []);

            if ($entry !== null) {
                $entries[] = $entry;
            }
        }

        return $entries;
    }

    /**
     * @param  array<string, string>  $params
     */
    public function find(string $route, array $params): ?PageEntry
    {
        $name = self::PAGES[$route] ?? null;

        if ($name === null || $params !== []) {
            return null;
        }

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
        }

        if ($render === []) {
            return null;
        }

        return new PageEntry(
            route: $route,
            params: [],
            renderLocales: $render,
            indexableLocales: $indexable,
            sources: $sources,
            ogFamily: 'site',
            ogSlug: null,
        );
    }
}
