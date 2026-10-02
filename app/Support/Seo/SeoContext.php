<?php

namespace App\Support\Seo;

use App\Support\Localization\Locales;
use App\Support\Localization\LocalizedUrl;
use Illuminate\Http\Request;
use Illuminate\Routing\Route;
use Illuminate\Support\Facades\App;
use LogicException;

/**
 * The head metadata of the current request, built from the registry.
 *
 * This is the shared `seo` prop. `SEOHead` renders it as it is, so no page
 * decides its own robots value, canonical or alternates, and nothing a page
 * renders can disagree with the sitemap.
 *
 * A request with no registry entry, or one that is answering with an error
 * page, gets `noindex, follow`, no canonical and no alternates: a crawler that
 * lands on a dead link can still follow the page's links home.
 */
final class SeoContext
{
    /**
     * Request attribute set by the error renderer, so an error page that
     * happens to sit on a known route is never treated as that page.
     */
    public const ERROR_ATTRIBUTE = 'tablepro.error-page';

    /**
     * Request attribute memoising the registry lookup for the current route.
     */
    private const ENTRY_ATTRIBUTE = 'tablepro.page-entry';

    public function __construct(
        private readonly PageRegistry $registry,
        private readonly OgImages $ogImages,
    ) {}

    /**
     * @return array{robots: string, canonical: string|null, alternates: list<array{hreflang: string, href: string}>, xDefault: string|null, ogLocale: string, ogLocaleAlternates: list<string>, ogImage: array{url: string, width: int, height: int, type: string}|null}
     */
    public function forRequest(Request $request): array
    {
        $locale = App::getLocale();
        $entry = $this->isErrorPage($request) ? null : $this->entryFor($request);

        if ($entry === null || ! $entry->renders($locale)) {
            return $this->unlisted($locale);
        }

        $indexable = $entry->isIndexable($locale);
        $cluster = $entry->hreflangCluster();
        $inCluster = in_array($locale, $cluster, true);

        $alternates = [];
        $ogAlternates = [];

        if ($inCluster) {
            foreach ($this->registry->alternates($entry) as $code => $url) {
                $alternates[] = ['hreflang' => Locales::definition($code)['hreflang'], 'href' => $url];

                if ($code !== $locale) {
                    $ogAlternates[] = Locales::definition($code)['og'];
                }
            }
        }

        $default = Locales::default();

        return [
            'robots' => $entry->robots($locale),
            'canonical' => $indexable ? $entry->url($locale) : null,
            'alternates' => $alternates,
            'xDefault' => $inCluster && in_array($default, $cluster, true) ? $entry->url($default) : null,
            'ogLocale' => Locales::definition($locale)['og'],
            'ogLocaleAlternates' => $ogAlternates,
            'ogImage' => $this->ogImages->for($entry, $locale),
        ];
    }

    /**
     * The registry entry for the route the request matched, if it has one.
     */
    public function entryFor(Request $request): ?PageEntry
    {
        if ($request->attributes->has(self::ENTRY_ATTRIBUTE)) {
            return $request->attributes->get(self::ENTRY_ATTRIBUTE);
        }

        $entry = null;
        $route = $request->route();

        if ($route instanceof Route && $route->getName() !== null) {
            $entry = $this->registry->find(
                (string) LocalizedUrl::baseName($route->getName()),
                $this->parameters($route),
            );
        }

        $request->attributes->set(self::ENTRY_ATTRIBUTE, $entry);

        return $entry;
    }

    public function isErrorPage(Request $request): bool
    {
        return $request->attributes->get(self::ERROR_ATTRIBUTE) === true;
    }

    /**
     * @return array{robots: string, canonical: null, alternates: list<array{hreflang: string, href: string}>, xDefault: null, ogLocale: string, ogLocaleAlternates: list<string>, ogImage: null}
     */
    private function unlisted(string $locale): array
    {
        return [
            'robots' => 'noindex, follow',
            'canonical' => null,
            'alternates' => [],
            'xDefault' => null,
            'ogLocale' => Locales::definition(Locales::isSupported($locale) ? $locale : Locales::default())['og'],
            'ogLocaleAlternates' => [],
            'ogImage' => null,
        ];
    }

    /**
     * @return array<string, string>
     */
    private function parameters(Route $route): array
    {
        try {
            $parameters = $route->parameters();
        } catch (LogicException) {
            return [];
        }

        return array_map(static fn(mixed $value): string => (string) $value, $parameters);
    }
}
