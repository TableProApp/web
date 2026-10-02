<?php

namespace App\Http\Middleware;

use App\Support\Localization\Locales;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Symfony\Component\HttpFoundation\Response;

/**
 * Sets the application locale from the route group a request matched.
 *
 * Registered as `locale:{code}` on each group `routes/web.php` mounts, so the
 * value comes from the route definition and never from input: no cookie, no
 * session, no `Accept-Language`, no IP. Carbon follows through `LocaleUpdated`,
 * so `isoFormat()` comes out in the page's language.
 */
class SetLocale
{
    /**
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next, string $locale): Response
    {
        if (! Locales::isSupported($locale)) {
            abort(404);
        }

        App::setLocale($locale);

        return $next($request);
    }
}
