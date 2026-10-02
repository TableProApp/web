<?php

namespace App\Support\Seo;

use App\Support\Localization\Locales;
use Illuminate\Support\Facades\File;

/**
 * Blog posts: one page per markdown file, in each language it was written in.
 *
 * The default locale's posts are `resources/blog/{slug}.md`; a translation is
 * `resources/blog/{locale}/{slug}.md` with the same slug. That is the layout
 * `BlogService` reads, so a post renders in exactly the locales whose file
 * exists, and is indexed in each of them. An English-only release post is a
 * page with one locale and no hreflang cluster, which is the honest answer
 * for an untranslated article.
 *
 * `find()` only checks files. The slug pattern is enforced before any path is
 * built, so a request can never make this class look outside the directory.
 */
final class BlogPosts implements PageFamily
{
    public const ROUTE = 'landing.blog.show';

    public function __construct(
        private readonly string $directory,
    ) {}

    /**
     * @return list<PageEntry>
     */
    public function entries(): array
    {
        $slugs = [];

        foreach (Locales::codes() as $locale) {
            foreach (File::glob($this->localeDirectory($locale) . '/*.md') ?: [] as $file) {
                $slugs[] = pathinfo($file, PATHINFO_FILENAME);
            }
        }

        $slugs = array_values(array_unique($slugs));
        sort($slugs);

        $entries = [];

        foreach ($slugs as $slug) {
            $entry = $this->find(self::ROUTE, ['slug' => $slug]);

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
        $slug = $params['slug'] ?? null;

        if ($route !== self::ROUTE || ! is_string($slug) || count($params) !== 1 || ! self::isSlug($slug)) {
            return null;
        }

        $locales = [];
        $sources = [];

        foreach (Locales::codes() as $locale) {
            $path = $this->path($slug, $locale);

            if (File::isFile($path)) {
                $locales[] = $locale;
                $sources[] = $this->relative($path);
            }
        }

        if ($locales === []) {
            return null;
        }

        return new PageEntry(
            route: self::ROUTE,
            params: ['slug' => $slug],
            renderLocales: $locales,
            indexableLocales: $locales,
            sources: $sources,
            ogFamily: 'blog',
            ogSlug: $slug,
        );
    }

    /**
     * The markdown file of a post in a locale, whether or not it exists.
     */
    public function path(string $slug, string $locale): string
    {
        return $this->localeDirectory($locale) . '/' . $slug . '.md';
    }

    public static function isSlug(string $slug): bool
    {
        return preg_match('/^[a-z0-9]+(-[a-z0-9]+)*$/', $slug) === 1;
    }

    private function localeDirectory(string $locale): string
    {
        return $locale === Locales::default() ? $this->directory : $this->directory . '/' . $locale;
    }

    private function relative(string $path): string
    {
        $root = base_path() . DIRECTORY_SEPARATOR;

        return str_starts_with($path, $root) ? substr($path, strlen($root)) : $path;
    }
}
