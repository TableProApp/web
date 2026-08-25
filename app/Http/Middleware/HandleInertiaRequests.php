<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
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
     * useEmailForm in resources/js/components/landing/footer-cta.tsx.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'canonicalBaseUrl' => rtrim('https://' . config('app.web_domain'), '/'),
            'banner' => $this->banner(),
        ];
    }

    /**
     * The top banner, or null when it is switched off.
     *
     * Shared rather than passed per page, because it sits in `LandingLayout`
     * and every page uses that layout. Threading it through eight controllers
     * would put the same prop in eight signatures and guarantee that the ninth
     * page forgets it.
     *
     * Null rather than `['enabled' => false]`: the component renders nothing
     * for null, so a disabled banner leaves no element, no reserved height and
     * no shifted header behind it.
     *
     * @return array{message: string, messageShort: string, cta: string, href: string, version: string}|null
     */
    private function banner(): ?array
    {
        if (! config('banner.enabled')) {
            return null;
        }

        return [
            'message' => (string) config('banner.message'),
            'messageShort' => (string) config('banner.message_short'),
            'cta' => (string) config('banner.cta'),
            'href' => (string) config('banner.href'),
            'version' => (string) config('banner.version'),
        ];
    }
}
