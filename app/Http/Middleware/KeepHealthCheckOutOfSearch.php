<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * The health check is the framework's own route and page, public and with no
 * robots meta, so the header is the one place to say it is not a page.
 */
class KeepHealthCheckOutOfSearch
{
    public const PATH = '/up';

    /**
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        if ($request->is(ltrim(self::PATH, '/'))) {
            $response->headers->set('X-Robots-Tag', 'noindex');
        }

        return $response;
    }
}
