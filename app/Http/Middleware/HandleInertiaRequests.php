<?php

namespace App\Http\Middleware;

use App\Support\Banner;
use App\Support\Localization\LocaleSwitcher;
use App\Support\Localization\LocalizedUrl;
use App\Support\Seo\SeoContext;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * This app runs without a session, so there is no flash bag to share. Pages
     * that need to report the outcome of a write hold that state in React — see
     * `useEmailForm` in resources/js/hooks/use-email-form.ts.
     *
     * Everything that depends on the locale is a closure. This middleware is in
     * the `web` group and runs before the route's `locale:{code}` middleware, so
     * an eager `app()->getLocale()` here would read the default locale on every
     * Vietnamese page. Closures resolve when the page renders, after `SetLocale`
     * (or after the error renderer has set the locale from the path).
     *
     * The method tolerates a request with no route: the error renderer calls it
     * for 404s that matched nothing.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'canonicalBaseUrl' => LocalizedUrl::base(),
            'locale' => fn(): string => App::getLocale(),
            'localization' => fn(): array => [
                'switcher' => app(LocaleSwitcher::class)->forRequest($request),
            ],
            'seo' => fn(): array => app(SeoContext::class)->forRequest($request),
            'banner' => Banner::forRequest($request),
            'crispWebsiteId' => config('services.crisp.website_id') ?: null,
            'assetPlaceholders' => ! App::isProduction(),
        ];
    }
}
