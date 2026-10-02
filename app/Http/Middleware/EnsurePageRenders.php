<?php

namespace App\Http\Middleware;

use App\Exceptions\MissingTranslationException;
use App\Support\Seo\SeoContext;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Symfony\Component\HttpFoundation\Response;

/**
 * Lets a localized route answer only in the locales its page renders in.
 *
 * Every route in `routes/localized.php` is mounted once per locale, so
 * `/vi/download` matches as soon as `/download` exists. Whether it may answer
 * is the registry's decision, made here once for every page rather than
 * remembered in each controller: a page with no registry entry is a 404, and a
 * page that exists only in another locale is a 404 that offers that version.
 *
 * Runs after `SetLocale`, so the locale is the route group's.
 */
class EnsurePageRenders
{
    public function __construct(
        private readonly SeoContext $seo,
    ) {}

    /**
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $locale = App::getLocale();
        $entry = $this->seo->entryFor($request);

        if ($entry === null) {
            abort(404);
        }

        if (! $entry->renders($locale)) {
            throw MissingTranslationException::forEntry($entry);
        }

        return $next($request);
    }
}
