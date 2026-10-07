<?php

namespace App\Exceptions;

use App\Http\Middleware\CacheHtmlAtEdge;
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
 * - A 404 under a prefixed locale for an account or checkout path
 *   (`/vi/account…`, `/vi/checkout…`) links the account in that language,
 *   `/account?locale=vi`: the account has no locale prefix (spec §0), so a
 *   reader who guessed one is sent to the real address (sitemap §A.7, §C.6).
 * - A 404 or 410 page is as public as any other page, so it carries the same
 *   shared-cache header (`CacheHtmlAtEdge`). A URL that matches no route never
 *   reaches the `web` group that sets it, so it is applied here too.
 */
final class RenderErrorPage
{
    /**
     * @var list<int>
     */
    public const STATUSES = [404, 410, 500, 503];

    /**
     * Platform paths a reader might put a locale prefix in front of.
     */
    private const ACCOUNT_PATH = '#^([a-z]{2}(?:-[A-Z][a-z]{3})?(?:-[A-Z]{2})?)/(account|checkout)(/|$)#';

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

        if ($status === 404 && preg_match(self::ACCOUNT_PATH, $request->path(), $matches) === 1 && Locales::isSupported($matches[1])) {
            $props['account'] = '/account?locale=' . $matches[1];
        }

        $request->attributes->set(SeoContext::ERROR_ATTRIBUTE, true);

        try {
            return CacheHtmlAtEdge::apply($request, $response->render('Error', $props)->withSharedData()->toResponse($request));
        } catch (Throwable $e) {
            report($e);

            return null;
        }
    }
}
