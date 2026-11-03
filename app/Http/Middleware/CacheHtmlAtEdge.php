<?php

namespace App\Http\Middleware;

use App\Support\Pricing\Campaign;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Lets a shared cache keep a page's HTML for ten minutes.
 *
 * Every page this app renders is a function of its URL alone: the locale is in
 * the path, there is no session, no cookie, no CSRF token, no flash data, and
 * nothing is read from the visitor's headers or location. The same bytes go to
 * every reader, so Cloudflare can answer from its cache instead of crossing to
 * the origin and the SSR process for each visit.
 *
 * Only what is safe to share is marked:
 *
 * - `GET` and `HEAD`, never a write.
 * - Never an Inertia visit. A request carrying `X-Inertia` gets the page as
 *   JSON at the same URL, and a cache that ignores `Vary` (Cloudflare does)
 *   would hand that JSON to the next browser, or the HTML to the next visit.
 *   The response keeps `Vary: X-Inertia` for caches that honour it, and the
 *   Cloudflare cache rule bypasses the cache for requests with the header
 *   (docs/deployment.md, "Caching").
 * - HTML only, with status 200, 404 or 410. Redirects keep Laravel's
 *   `no-cache, private`: a 301 carries the visitor's own query string, and a
 *   500 or 503 must not outlive the fault.
 * - Never a response that sets a cookie.
 *
 * `max-age=0` keeps browsers asking, so a deploy reaches a returning reader
 * on their next visit; `s-maxage=600` lets the edge answer for ten minutes,
 * and `stale-while-revalidate` lets it answer with the previous copy while it
 * fetches the next. The deploy purges the cache once a release is live.
 *
 * A dated sale (`App\Support\Pricing\Campaign`) changes every page at its
 * start and its end, with no deploy to purge the cache. So in the hour and ten
 * minutes before either, both lifetimes shrink to end at it: no copy rendered
 * on one side of the instant is served on the other.
 *
 * Applied to the `web` group, and by `RenderErrorPage` to the error pages,
 * because a URL that matches no route never reaches the group.
 */
class CacheHtmlAtEdge
{
    /**
     * What a shareable page carries.
     */
    public const CACHE_CONTROL = 'public, max-age=0, s-maxage=600, stale-while-revalidate=3600';

    /**
     * How long the edge may answer from a copy, then serve it stale, in seconds.
     */
    public const FRESH_SECONDS = 600;

    public const STALE_SECONDS = 3600;

    /**
     * The statuses a shared cache may keep.
     *
     * @var list<int>
     */
    public const STATUSES = [200, 404, 410];

    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        return self::apply($request, $next($request));
    }

    /**
     * Marks the response shareable when it qualifies, and leaves it alone otherwise.
     */
    public static function apply(Request $request, Response $response): Response
    {
        if (! self::shareable($request, $response)) {
            return $response;
        }

        $response->headers->set('Cache-Control', self::cacheControl(Campaign::current()?->secondsUntilChange()));

        if (! in_array('x-inertia', array_map('strtolower', $response->getVary()), true)) {
            $response->setVary('X-Inertia', false);
        }

        return $response;
    }

    /**
     * The header for a page whose content changes in `$secondsUntilChange`
     * seconds, or null when nothing dated is ahead: the usual lifetimes, or
     * both cut short so that together they end at the change.
     */
    public static function cacheControl(?int $secondsUntilChange): string
    {
        if ($secondsUntilChange === null || $secondsUntilChange >= self::FRESH_SECONDS + self::STALE_SECONDS) {
            return self::CACHE_CONTROL;
        }

        $fresh = max(0, min(self::FRESH_SECONDS, $secondsUntilChange));
        $stale = max(0, min(self::STALE_SECONDS, $secondsUntilChange - $fresh));

        return "public, max-age=0, s-maxage={$fresh}, stale-while-revalidate={$stale}";
    }

    /**
     * Whether every reader may be sent this exact response.
     *
     * A response with no `Content-Type` yet counts as HTML: that is the type
     * Symfony gives it when it is prepared, and the one PHP would send.
     */
    public static function shareable(Request $request, Response $response): bool
    {
        if (! $request->isMethod('GET') && ! $request->isMethod('HEAD')) {
            return false;
        }

        if ($request->headers->has('X-Inertia')) {
            return false;
        }

        if (! in_array($response->getStatusCode(), self::STATUSES, true)) {
            return false;
        }

        $type = strtolower((string) ($response->headers->get('Content-Type') ?? 'text/html'));

        if (! str_starts_with($type, 'text/html')) {
            return false;
        }

        return $response->headers->getCookies() === [] && ! $response->headers->has('Set-Cookie');
    }
}
