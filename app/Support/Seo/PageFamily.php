<?php

namespace App\Support\Seo;

/**
 * A group of pages that decide their locales the same way.
 *
 * `find()` runs on every request, so it must stay cheap: `is_file` checks and a
 * memoised read, never a directory glob. `entries()` feeds the sitemap and the
 * tests, and may glob.
 *
 * A family returns null from `find()` for a page that renders in no locale, so
 * the registry can fall through to the next family.
 */
interface PageFamily
{
    /**
     * @return list<PageEntry>
     */
    public function entries(): array;

    /**
     * @param  array<string, string>  $params
     */
    public function find(string $route, array $params): ?PageEntry;
}
