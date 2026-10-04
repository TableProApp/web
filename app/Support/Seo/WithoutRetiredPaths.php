<?php

namespace App\Support\Seo;

/**
 * A page family with every URL the redirect map answers taken out.
 *
 * `CanonicalizeRequest` answers a retired path before routing, so no page can
 * render there whatever a family still lists: a merged database slug still in
 * its slug constant, or a retired post whose markdown file is still on disk.
 * The registry has to agree, or the sitemap, hreflang and the language
 * switcher would advertise a URL that answers 301 or 410. Wrapping each family
 * makes "the map wins" true by construction.
 *
 * Only the retired locale is removed. If every locale is retired, the page is
 * not a page at all and the family is asked as if it did not know it.
 */
final class WithoutRetiredPaths implements PageFamily
{
    public function __construct(
        private readonly PageFamily $family,
        private readonly RedirectMap $redirects,
    ) {}

    /**
     * @return list<PageEntry>
     */
    public function entries(): array
    {
        $entries = [];

        foreach ($this->family->entries() as $entry) {
            $kept = $this->withoutRetired($entry);

            if ($kept !== null) {
                $entries[] = $kept;
            }
        }

        return $entries;
    }

    /**
     * @param  array<string, string>  $params
     */
    public function find(string $route, array $params): ?PageEntry
    {
        $entry = $this->family->find($route, $params);

        return $entry === null ? null : $this->withoutRetired($entry);
    }

    private function withoutRetired(PageEntry $entry): ?PageEntry
    {
        $render = array_values(array_filter(
            $entry->renderLocales,
            fn(string $locale): bool => ! $this->redirects->retires($entry->url($locale, false)),
        ));

        if ($render === $entry->renderLocales) {
            return $entry;
        }

        if ($render === []) {
            return null;
        }

        return new PageEntry(
            route: $entry->route,
            params: $entry->params,
            renderLocales: $render,
            indexableLocales: array_values(array_intersect($entry->indexableLocales, $render)),
            sources: $entry->sources,
            ogFamily: $entry->ogFamily,
            ogSlug: $entry->ogSlug,
        );
    }
}
