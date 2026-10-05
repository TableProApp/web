<?php

namespace App\Support;

use Illuminate\Http\Request;

/**
 * Whether the license banner belongs on a page, and what the page is given.
 *
 * One rule for the shared Inertia prop and for the root template's
 * `has-banner` class, so a page never reserves the band's height without
 * rendering it, or the reverse.
 */
final class Banner
{
    /**
     * Pages the banner stays off: Pricing is where it leads, so asking there
     * repeats the page.
     *
     * @var list<string>
     */
    public const HIDDEN_ON = ['landing.pricing', 'vi.landing.pricing'];

    public static function shownOn(Request $request): bool
    {
        return (bool) config('banner.enabled') && ! $request->routeIs(...self::HIDDEN_ON);
    }

    /**
     * The shared `banner` prop, or null where the banner is off or not on this
     * page. Null rather than a flag, so the component renders nothing at all.
     *
     * @return array{href: string, version: string}|null
     */
    public static function forRequest(Request $request): ?array
    {
        if (! self::shownOn($request)) {
            return null;
        }

        return [
            'href' => (string) config('banner.href'),
            'version' => (string) config('banner.version'),
        ];
    }
}
