<?php

namespace App\Http\Middleware;

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
            'banner' => $this->banner(),
            'crispWebsiteId' => config('services.crisp.website_id') ?: null,
        ];
    }

    /**
     * The top banner, or null when it is switched off.
     *
     * Shared rather than passed per page, because every page renders it.
     *
     * Null rather than `['enabled' => false]`: the component renders nothing
     * for null, so a disabled banner leaves no element, no reserved height and
     * no shifted header behind it.
     *
     * The banner's words belong to the `banner` UI catalog in each language;
     * config keeps only the switch, the link and the dismissal version. Until
     * the chrome agent trims `config/banner.php`, the legacy English copy still
     * travels with it for the pre-rebuild `SupportBanner`, and each of those
     * keys disappears from the prop once its config value is gone.
     *
     * @return array{href: string, version: string, message?: string, messageShort?: string, cta?: string}|null
     */
    private function banner(): ?array
    {
        if (! config('banner.enabled')) {
            return null;
        }

        $legacy = array_filter([
            'message' => config('banner.message'),
            'messageShort' => config('banner.message_short'),
            'cta' => config('banner.cta'),
        ], static fn(mixed $value): bool => is_string($value) && $value !== '');

        return [
            'href' => (string) config('banner.href'),
            'version' => (string) config('banner.version'),
            ...$legacy,
        ];
    }
}
