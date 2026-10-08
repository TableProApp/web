<?php

namespace App\Support;

use App\Support\Localization\LocalizedUrl;
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
     * Base route names the banner stays off, in every language: Pricing is
     * where it leads, so asking there repeats the page.
     *
     * @var list<string>
     */
    public const HIDDEN_ON = ['landing.pricing'];

    /**
     * The iPhone and iPad app has no license, so on its page the root
     * template's head script drops the banner for a reader on one.
     *
     * @var list<string>
     */
    public const HIDDEN_ON_IOS_DEVICES = ['landing.ios'];

    public static function shownOn(Request $request): bool
    {
        return (bool) config('banner.enabled') && ! in_array(self::page($request), self::HIDDEN_ON, true);
    }

    public static function hiddenOnIosDevices(Request $request): bool
    {
        return in_array(self::page($request), self::HIDDEN_ON_IOS_DEVICES, true);
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

    private static function page(Request $request): ?string
    {
        return LocalizedUrl::baseName($request->route()?->getName());
    }
}
