<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Normalises a request's URL and answers retired paths in one hop.
 *
 * Prepended to the **global** stack in `bootstrap/app.php`, not to the `web`
 * group: group middleware runs only after a route matched, and a retired path
 * such as `/mariadb-client` has no route.
 *
 * Phase A stub: it passes every request through. The SEO agent owns it from
 * phase B and implements architecture §1.7: strip a trailing slash and a
 * leading `/index.php`, apply `resources/data/redirects.json` (301 and 410)
 * and the `/databases/{docsSlug}` rule, and send at most one 301 that keeps the
 * query string.
 */
class CanonicalizeRequest
{
    /**
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        return $next($request);
    }
}
