<?php

namespace App\Http\Middleware;

use App\Support\Localization\Locales;
use App\Support\Localization\LocalizedUrl;
use App\Support\Seo\RedirectMap;
use Closure;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Normalises a request's URL and answers retired paths, in one hop.
 *
 * Prepended to the **global** stack in `bootstrap/app.php`, not to the `web`
 * group: group middleware runs only after a route matched, and a retired path
 * such as `/mariadb-client` has no route. For `GET` and `HEAD` only:
 *
 * 1. A trailing slash is dropped (`/blog/` → `/blog`, `/vi/` → `/vi`), and a
 *    leading `/index.php` too (`/index.php/blog` → `/blog`). Both used to
 *    answer 200 as duplicates of the clean URL.
 * 2. A first segment that names a language in another letter case takes the
 *    prefix as `locales.json` writes it (`/pt-br/pricing` → `/pt-BR/pricing`),
 *    and the default language spelled out is dropped (`/en/pricing` →
 *    `/pricing`). Both used to answer 404 for a page that exists.
 * 3. The clean path is looked up in the redirect map (`RedirectMap`):
 *    `resources/data/redirects.json`, then the `/databases/{docsSlug}` rule.
 * 4. A 410 entry aborts with 410, which the exception handler renders as the
 *    branded Error page. A 301 entry, or a path steps 1 and 2 changed, gets
 *    exactly one 301, so `/mariadb-client/?ref=x` goes straight to
 *    `/mysql-client?ref=x#mariadb`.
 *
 * The `Location` is absolute and built from the canonical origin, never from
 * the request's host. The query string is carried through as the client sent
 * it, after the target's own query: inbound links carry `?ref=` and `utm_*`,
 * which the first-touch attribution reads. That is also why Laravel's
 * `Route::redirect()` is not used, as it drops the query.
 *
 * It never invents a destination: a path goes to its own clean form or to the
 * target the map names, and an unknown path falls through to the router's
 * 404, never to the homepage. It leaves alone uppercase letters after the
 * language and `//x` (both stay 404, with no evidence of inbound links), a
 * language the site does not have (`/zh-CN`), anything under `/vi/` the map
 * does not list (no Vietnamese URL was ever retired), and every method other
 * than `GET` and `HEAD`.
 *
 * Local development: the `Location` uses `https://{WEB_DOMAIN}`, so a retired
 * path opened on `http://localhost:8000` lands on `https://localhost`. Follow
 * the path by hand there; production is the case this is built for.
 */
class CanonicalizeRequest
{
    public function __construct(
        private readonly RedirectMap $redirects,
    ) {}

    /**
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->isMethod('GET') && ! $request->isMethod('HEAD')) {
            return $next($request);
        }

        $uri = $request->getRequestUri();
        $cut = strcspn($uri, '?');
        $path = substr($uri, 0, $cut);
        $query = (string) substr($uri, $cut + 1);

        $clean = $this->normalise($path);
        $retired = $this->redirects->find($clean);

        if ($retired !== null && $retired['status'] === 410) {
            abort(410);
        }

        if ($retired !== null && $retired['to'] !== null) {
            return $this->redirect($retired['to'], $query);
        }

        if ($clean !== $path) {
            return $this->redirect($clean, $query);
        }

        return $next($request);
    }

    /**
     * The clean form of a path: no `/index.php` prefix, no trailing slash, and
     * its language prefix as the site writes it.
     *
     * A path that would come out with a double slash is left as it is, so
     * `/index.php//x` stays a 404 like `//x` instead of turning into a
     * redirect to a protocol-relative URL.
     */
    private function normalise(string $path): string
    {
        $clean = $path;

        if ($clean === '/index.php' || str_starts_with($clean, '/index.php/')) {
            $clean = substr($clean, strlen('/index.php'));
        }

        if ($clean !== '/' && str_ends_with($clean, '/')) {
            $clean = rtrim($clean, '/');
        }

        if ($clean === '') {
            return '/';
        }

        $clean = $this->withCanonicalLocale($clean);

        return str_contains($clean, '//') ? $path : $clean;
    }

    /**
     * `/pt-br/x` as `/pt-BR/x`, and `/en/x` as `/x`. Only the first segment is
     * read, and only against the languages in `locales.json`.
     */
    private function withCanonicalLocale(string $path): string
    {
        [, $first, $rest] = explode('/', $path, 3) + [2 => null];
        $rest = $rest === null ? '' : '/' . $rest;

        foreach (Locales::all() as $code => $locale) {
            if (strcasecmp($first, $locale['prefix'] ?? $code) !== 0) {
                continue;
            }

            if ($locale['prefix'] === null) {
                return $rest === '' ? '/' : $rest;
            }

            return '/' . $locale['prefix'] . $rest;
        }

        return $path;
    }

    /**
     * One 301 to a target path or URL, with the request's query appended.
     */
    private function redirect(string $target, string $query): RedirectResponse
    {
        $fragmentAt = strpos($target, '#');
        $fragment = $fragmentAt === false ? '' : substr($target, $fragmentAt);
        $target = $fragmentAt === false ? $target : substr($target, 0, $fragmentAt);

        $queryAt = strpos($target, '?');
        $ownQuery = $queryAt === false ? '' : substr($target, $queryAt + 1);
        $target = $queryAt === false ? $target : substr($target, 0, $queryAt);

        $merged = implode('&', array_filter([$ownQuery, $query], static fn(string $part): bool => $part !== ''));
        $base = str_starts_with($target, '/') ? LocalizedUrl::base() . $target : $target;

        return new RedirectResponse($base . ($merged === '' ? '' : '?' . $merged) . $fragment, 301);
    }
}
