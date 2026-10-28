<?php

namespace App\Support\Localization;

use Illuminate\Support\Facades\File;

/**
 * Builds public URLs in a given locale.
 *
 * The routes in `routes/localized.php` are mounted once per locale. The default
 * locale keeps today's names (`landing.compare`); every other locale gets the
 * same names behind its code (`vi.landing.compare`). This class translates
 * between the two, so callers think in base names and locales.
 *
 * Absolute URLs are built from `https://{app.web_domain}`, the same base as the
 * shared `canonicalBaseUrl` prop, never from `url()`, which would reflect the
 * request's own host and scheme into canonicals and sitemaps.
 */
final class LocalizedUrl
{
    /**
     * The paths nginx answers on this origin without this app, never prefixed
     * (docs/deploy/tablepro.app.nginx.conf). The same pattern as
     * `PLATFORM_PATHS` in resources/js/i18n/paths.ts.
     */
    public const PLATFORM_PATHS = '~^/(account|checkout|thank-you|newsletter/unsubscribe|webhooks/polar)(/|\?|#|$)~';

    /**
     * The canonical origin, with no trailing slash.
     */
    public static function base(): string
    {
        return rtrim('https://' . config('app.web_domain'), '/');
    }

    /**
     * The route name a base name has in a locale.
     */
    public static function routeName(string $name, string $locale): string
    {
        if ($locale === Locales::default()) {
            return $name;
        }

        return $locale . '.' . $name;
    }

    /**
     * The URL of a named page in a locale.
     *
     * @param  array<string, string>  $params
     */
    public static function route(string $name, array $params, string $locale, bool $absolute = true): string
    {
        $path = route(self::routeName($name, $locale), $params, false);

        return $absolute ? self::base() . $path : $path;
    }

    /**
     * The account portal in a locale, which it takes from the query: it has no
     * locale prefix.
     */
    public static function account(string $locale): string
    {
        $facts = json_decode((string) File::get(resource_path('data/facts.json')), true);
        $origin = $facts['links']['account'] ?? 'https://account.tablepro.app';

        return rtrim((string) $origin, '/') . '/?locale=' . rawurlencode($locale);
    }

    /**
     * Whether nginx answers a path without this app.
     */
    public static function isPlatformPath(string $path): bool
    {
        return preg_match(self::PLATFORM_PATHS, $path) === 1;
    }

    /**
     * Prefixes a root-relative path with a locale, keeping its query and fragment.
     *
     * `/` becomes `/vi`, not `/vi/`, which is the canonical form. A platform
     * path (`/account?locale=vi`) comes back unchanged in every locale.
     */
    public static function path(string $path, string $locale): string
    {
        if (self::isPlatformPath($path)) {
            return $path;
        }

        $prefix = Locales::prefixFor($locale);

        if ($prefix === null) {
            return $path;
        }

        $cut = strcspn($path, '?#');
        $pathname = substr($path, 0, $cut);
        $suffix = substr($path, $cut);

        if ($pathname === '' || $pathname === '/') {
            return '/' . $prefix . $suffix;
        }

        return '/' . $prefix . '/' . ltrim($pathname, '/') . $suffix;
    }

    /**
     * The base route name, with any locale code removed.
     */
    public static function baseName(?string $routeName): ?string
    {
        if ($routeName === null) {
            return null;
        }

        foreach (Locales::codes() as $code) {
            if ($code !== Locales::default() && str_starts_with($routeName, $code . '.')) {
                return substr($routeName, strlen($code) + 1);
            }
        }

        return $routeName;
    }
}
