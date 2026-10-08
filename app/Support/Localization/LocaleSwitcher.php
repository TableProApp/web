<?php

namespace App\Support\Localization;

use App\Support\Seo\PageEntry;
use App\Support\Seo\PageRegistry;
use App\Support\Seo\SeoContext;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;

/**
 * Where each option of the language switcher goes from the current page.
 *
 * Every option is a real URL, never a dead item. It is the equivalent page when
 * one renders in that locale (`/blog` and `/vi/blog` switch directly, even
 * though only one is indexed). Otherwise it is that locale's section index,
 * such as `/vi/blog` for an English-only post, or its home page, and the item
 * is flagged `fallback` so the switcher can say so.
 *
 * Query strings are not carried across: `ref` and `utm_*` are captured on the
 * first page view already. The fragment is appended client-side.
 */
final class LocaleSwitcher
{
    /**
     * Request attribute holding `{locale, href}` when an error page suggests
     * the same page in another locale, so the switcher can point there.
     */
    public const SUGGESTION_ATTRIBUTE = 'tablepro.locale-suggestion';

    /**
     * OG family => the base route of that family's index page.
     */
    private const SECTION_INDEX = [
        'blog' => 'landing.blog.index',
        'compare' => 'landing.compare.index',
        'database' => 'landing.databases.index',
        'feature' => 'landing.features.index',
    ];

    public function __construct(
        private readonly SeoContext $seo,
        private readonly PageRegistry $registry,
    ) {}

    /**
     * @return list<array{locale: string, native: string, hreflang: string, href: string, current: bool, fallback: bool}>
     */
    public function forRequest(Request $request): array
    {
        $current = App::getLocale();
        $entry = $this->entryFor($request);

        $items = [];

        foreach (Locales::all() as $code => $definition) {
            [$href, $fallback] = $code === $current
                ? [$this->self($request, $entry, $code), false]
                : $this->target($request, $entry, $code);

            $items[] = [
                'locale' => $code,
                'native' => $definition['native'],
                'hreflang' => $definition['hreflang'],
                'href' => $href,
                'current' => $code === $current,
                'fallback' => $fallback,
            ];
        }

        return $items;
    }

    /**
     * The page the switcher translates. An error page has none, except the
     * 404 for a page missing in this locale: that page still exists in the
     * others, so `/vi/blog/{slug}` switches like the post itself.
     */
    private function entryFor(Request $request): ?PageEntry
    {
        if ($this->seo->isErrorPage($request) && ! $request->attributes->has(self::SUGGESTION_ATTRIBUTE)) {
            return null;
        }

        return $this->seo->entryFor($request);
    }

    private function self(Request $request, ?PageEntry $entry, string $locale): string
    {
        if ($entry !== null && $entry->renders($locale)) {
            return $entry->url($locale, false);
        }

        return '/' . ltrim($request->path(), '/');
    }

    /**
     * @return array{0: string, 1: bool}
     */
    private function target(Request $request, ?PageEntry $entry, string $locale): array
    {
        if ($entry !== null && $entry->renders($locale)) {
            return [$entry->url($locale, false), false];
        }

        $suggestion = $request->attributes->get(self::SUGGESTION_ATTRIBUTE);

        if (is_array($suggestion) && ($suggestion['locale'] ?? null) === $locale && is_string($suggestion['href'] ?? null)) {
            return [$suggestion['href'], false];
        }

        if ($entry === null) {
            return [LocalizedUrl::route('landing.home', [], $locale, false), false];
        }

        $index = self::SECTION_INDEX[$entry->ogFamily] ?? null;

        if ($index !== null && $this->registry->find($index, [])?->renders($locale) === true) {
            return [LocalizedUrl::route($index, [], $locale, false), true];
        }

        return [LocalizedUrl::route('landing.home', [], $locale, false), true];
    }
}
