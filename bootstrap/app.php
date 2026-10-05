<?php

use App\Exceptions\RenderErrorPage;
use App\Http\Middleware\CacheHtmlAtEdge;
use App\Http\Middleware\CanonicalizeRequest;
use App\Http\Middleware\EnsurePageRenders;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\SetLocale;
use Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Foundation\Http\Middleware\PreventRequestForgery;
use Illuminate\Session\Middleware\StartSession;
use Illuminate\View\Middleware\ShareErrorsFromSession;
use Inertia\Inertia;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        /*
         * The client address, scheme and port from the proxy in front, but
         * never the host. The proxies are trusted at `*`, and a client can
         * send its own `X-Forwarded-Host`, so trusting it would let a request
         * choose the origin of the page's script, stylesheet and font preload
         * URLs, which a shared cache could then serve to every reader. The
         * host comes from `Host`, which the request is routed on.
         */
        $middleware->trustProxies(
            at: '*',
            headers: \Illuminate\Http\Request::HEADER_X_FORWARDED_FOR
                | \Illuminate\Http\Request::HEADER_X_FORWARDED_PORT
                | \Illuminate\Http\Request::HEADER_X_FORWARDED_PROTO,
        );

        /*
         * Global, not in the `web` group: a retired path such as
         * `/mariadb-client` matches no route, and group middleware only runs
         * once a route has matched. It answers redirects and 410s before
         * routing. See the class for what it normalises.
         */
        $middleware->prepend(CanonicalizeRequest::class);

        /*
         * This app is entirely read-only, so it runs without a session and
         * emits no cookies.
         *
         * Everything it renders is public and identical for every visitor,
         * which makes the whole site cacheable at the edge and removes an
         * entire class of state from a codebase that has no business holding
         * any. See docs/architecture.md for what this rules out.
         *
         * The locale is no exception: it comes from the URL, through the
         * `locale:{code}` middleware on each route group, never from a cookie.
         */
        $middleware->web(remove: [
            StartSession::class,
            ShareErrorsFromSession::class,
            PreventRequestForgery::class,
            AddQueuedCookiesToResponse::class,
        ]);

        $middleware->web(append: [
            HandleInertiaRequests::class,
        ]);

        /*
         * First in the group, so it sees the response last: after Inertia has
         * set `Vary: X-Inertia` and after a route middleware's 404 has been
         * rendered. Pages that match no route never reach the group;
         * `RenderErrorPage` marks those itself.
         */
        $middleware->web(prepend: [
            CacheHtmlAtEdge::class,
        ]);

        $middleware->alias([
            'locale' => SetLocale::class,
            'page' => EnsurePageRenders::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        /*
         * 404, 410, and with debug off 500 and 503, render the branded
         * `Error` page in the locale of the path. The static Blade pages in
         * resources/views/errors cover a failure inside that page, and are
         * rendered in the path's locale too.
         */
        $exceptions->render(RenderErrorPage::useLocaleOfPath(...));

        Inertia::handleExceptionsUsing(new RenderErrorPage());
    })->create();
