<?php

namespace App\Support\Seo;

use App\Support\Localization\Locales;
use Illuminate\Support\Facades\File;

/**
 * Privacy, terms and the refund policy.
 *
 * Each renders in a locale when `resources/data/legal/{locale}/{document}.md`
 * exists, and is indexed wherever it renders. A Vietnamese legal page is a
 * full translation (spec §0, with the English version prevailing), so it is a
 * real pair with the English page, not a duplicate.
 *
 * A document with no markdown in any locale is not a page: `find()` returns
 * null, the registry knows no such page, and the route answers 404.
 */
final class LegalPages implements PageFamily
{
    /**
     * Base route name => markdown file name.
     */
    public const DOCUMENTS = [
        'landing.privacy' => 'privacy',
        'landing.terms' => 'terms',
        'landing.refundPolicy' => 'refund-policy',
    ];

    public function __construct(
        private readonly string $directory,
    ) {}

    /**
     * @return list<PageEntry>
     */
    public function entries(): array
    {
        $entries = [];

        foreach (array_keys(self::DOCUMENTS) as $route) {
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
        $document = self::DOCUMENTS[$route] ?? null;

        if ($document === null || $params !== []) {
            return null;
        }

        $locales = [];
        $sources = [];

        foreach (Locales::codes() as $locale) {
            $path = $this->path($document, $locale);

            if (File::isFile($path)) {
                $locales[] = $locale;
                $sources[] = $this->relative($path);
            }
        }

        if ($locales === []) {
            return null;
        }

        return new PageEntry(
            route: $route,
            params: [],
            renderLocales: $locales,
            indexableLocales: $locales,
            sources: $sources,
            ogFamily: 'site',
            ogSlug: null,
        );
    }

    /**
     * The markdown file of a document in a locale, whether or not it exists.
     */
    public function path(string $document, string $locale): string
    {
        return $this->directory . '/' . $locale . '/' . $document . '.md';
    }

    private function relative(string $path): string
    {
        $root = base_path() . DIRECTORY_SEPARATOR;

        return str_starts_with($path, $root) ? substr($path, strlen($root)) : $path;
    }
}
