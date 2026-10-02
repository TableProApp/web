<?php

namespace App\Support\Seo;

/**
 * Every public page, and the one place each SEO surface asks about them.
 *
 * Families are consulted in the order they were registered, and the first one
 * that knows a page wins. The `SeoServiceProvider` registers the content
 * families before `LegacyPages`, so a page moves off its pre-rebuild component
 * the moment its content file lands, with no edit here.
 */
final class PageRegistry
{
    /**
     * @var list<PageFamily>
     */
    private array $families;

    /**
     * @param  iterable<PageFamily>  $families
     */
    public function __construct(iterable $families)
    {
        $this->families = [];

        foreach ($families as $family) {
            $this->families[] = $family;
        }
    }

    /**
     * Every page, deduplicated by route and parameters, first family first.
     *
     * @return list<PageEntry>
     */
    public function all(): array
    {
        $entries = [];

        foreach ($this->families as $family) {
            foreach ($family->entries() as $entry) {
                $entries[$entry->key()] ??= $entry;
            }
        }

        return array_values($entries);
    }

    /**
     * @param  array<string, string>  $params
     */
    public function find(string $route, array $params): ?PageEntry
    {
        foreach ($this->families as $family) {
            $entry = $family->find($route, $params);

            if ($entry !== null) {
                return $entry;
            }
        }

        return null;
    }

    /**
     * The absolute URL of each real translation of a page, keyed by locale.
     *
     * @return array<string, string>
     */
    public function alternates(PageEntry $entry): array
    {
        $urls = [];

        foreach ($entry->hreflangCluster() as $locale) {
            $urls[$locale] = $entry->url($locale);
        }

        return $urls;
    }
}
