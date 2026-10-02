<?php

namespace App\Exceptions;

use App\Support\Localization\Locales;
use App\Support\Localization\LocaleSwitcher;
use App\Support\Seo\SeoContext;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Inertia\ExceptionResponse;
use Symfony\Component\HttpFoundation\Response;
use Throwable;

/**
 * Renders 404, 410, 500 and 503 as the branded `Error` page.
 *
 * Registered with `Inertia::handleExceptionsUsing()` in `bootstrap/app.php`.
 *
 * - The locale comes from the path, because a 404 for an unknown URL matched no
 *   route and `SetLocale` never ran. `/vi/…` errors render in Vietnamese.
 * - The page carries `noindex, follow` through the shared `seo` prop, so a
 *   crawler that lands on a dead link can still follow it home.
 * - With `app.debug` on, 500 and 503 keep Laravel's own page and its trace.
 * - JSON requests keep their JSON.
 * - If rendering the page fails, the default response stands, which for 500
 *   and 503 is the static `resources/views/errors/{status}.blade.php`.
 */
final class RenderErrorPage
{
    /**
     * @var list<int>
     */
    public const STATUSES = [404, 410, 500, 503];

    /**
     * Sets the locale from the path before Laravel renders anything.
     *
     * Registered as an exception `render` callback, which runs before the
     * framework builds its default response. That default is what the Blade
     * fallbacks become (with debug on, or if the Inertia page fails), and it is
     * built before `__invoke()` ever runs, so the locale has to be right by
     * then. Returns null, so rendering carries on as usual.
     */
    public static function useLocaleOfPath(Throwable $exception, Request $request): null
    {
        App::setLocale(Locales::fromPath($request->path()));

        return null;
    }

    public function __invoke(ExceptionResponse $response): ?Response
    {
        $request = $response->request;
        $status = $response->statusCode();

        App::setLocale(Locales::fromPath($request->path()));

        if (! in_array($status, self::STATUSES, true)) {
            return null;
        }

        if ($status >= 500 && config('app.debug')) {
            return null;
        }

        if ($request->expectsJson() && ! $request->hasHeader('X-Inertia')) {
            return null;
        }

        $props = ['status' => $status];

        if ($response->exception instanceof MissingTranslationException) {
            $suggestion = $response->exception->suggestion();
            $props['suggestion'] = $suggestion;

            $request->attributes->set(LocaleSwitcher::SUGGESTION_ATTRIBUTE, [
                'locale' => $suggestion['locale'],
                'href' => $suggestion['href'],
            ]);
        }

        $request->attributes->set(SeoContext::ERROR_ATTRIBUTE, true);

        try {
            return $response->render('Error', $props)->withSharedData()->toResponse($request);
        } catch (Throwable $e) {
            report($e);

            return null;
        }
    }
}
