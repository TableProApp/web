<?php

namespace App\Support;

use App\Support\Localization\LocalizedUrl;
use App\Support\Pricing\Campaign;
use Illuminate\Http\Request;

/**
 * Which banner a page shows above its header, if any, and what the page is
 * given.
 *
 * Two banners share the slot, never at once:
 *
 * - `campaign`, while a dated sale is live (`App\Support\Pricing\Campaign`):
 *   on every page but the sale's own, which it leads to, Pricing included.
 *   It takes the slot from the license banner, whose ask the sale answers.
 * - `license`, the rest of the time, where `config/banner.php` allows it.
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

    /**
     * The sale's own page, where the campaign banner would lead to itself.
     */
    public const CAMPAIGN_PAGE = 'landing.black-friday';

    public const KIND_CAMPAIGN = 'campaign';

    public const KIND_LICENSE = 'license';

    public static function shownOn(Request $request): bool
    {
        return self::kind($request) !== null;
    }

    /**
     * @return self::KIND_CAMPAIGN|self::KIND_LICENSE|null
     */
    public static function kind(Request $request): ?string
    {
        $page = self::page($request);

        if (Campaign::current()?->isLive()) {
            return $page === self::CAMPAIGN_PAGE ? null : self::KIND_CAMPAIGN;
        }

        return config('banner.enabled') && ! in_array($page, self::HIDDEN_ON, true) ? self::KIND_LICENSE : null;
    }

    public static function hiddenOnIosDevices(Request $request): bool
    {
        return in_array(self::page($request), self::HIDDEN_ON_IOS_DEVICES, true);
    }

    /**
     * The shared `banner` prop, or null where no banner is on this page. Null
     * rather than a flag, so the component renders nothing at all. Only which
     * banner and its link: the words are the `banner` and `campaign` catalogs',
     * and neither banner can be closed, so there is no version to close it at.
     *
     * @return array{kind: string, href: string}|null
     */
    public static function forRequest(Request $request): ?array
    {
        return match (self::kind($request)) {
            self::KIND_CAMPAIGN => ['kind' => self::KIND_CAMPAIGN, 'href' => '/black-friday'],
            self::KIND_LICENSE => ['kind' => self::KIND_LICENSE, 'href' => (string) config('banner.href')],
            default => null,
        };
    }

    private static function page(Request $request): ?string
    {
        return LocalizedUrl::baseName($request->route()?->getName());
    }
}
