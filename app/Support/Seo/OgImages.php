<?php

namespace App\Support\Seo;

use App\Support\Assets\AssetManifest;
use App\Support\Localization\Locales;
use App\Support\Localization\LocalizedUrl;
use Illuminate\Support\Facades\File;

/**
 * Picks the Open Graph card for a page, only ever one that exists on disk.
 *
 * Order: the page's own card, then that locale's bespoke site card once the
 * owner has supplied it, then that locale's generated generic card, then
 * nothing. A page without a card emits no image tags, which is better than a
 * reference to a file that 404s on every share.
 *
 * The bespoke card is the `og-site` entry of `resources/data/assets.json`
 * (spec §9.1, docs/rebuild/assets/og.md). Marking it `supplied` and dropping
 * in `og-site-{locale}.png` is all it takes: `AssetManifest::ogCard()` answers
 * only once the entry is supplied and that locale's file exists, so a locale
 * whose file is missing keeps its generated card.
 *
 * The paths are the ones `og:generate` writes, and both sides call the same
 * two methods for them:
 *
 * - A page card is `/og/{family}/{slug}.png` in the default locale, so every
 *   card shared before the rebuild keeps resolving, and
 *   `/og/{locale}/{family}/{slug}.png` in any other.
 * - The generic card is `/og.png` in the default locale (the file is
 *   regenerated in place, so old shares and the platform app's default pick up
 *   the new card) and `/og/{locale}/default.png` in any other (sitemap §C.7).
 */
final class OgImages
{
    /**
     * The manifest id of the bespoke card that replaces the generated generic one.
     */
    public const SITE_CARD = 'og-site';

    /**
     * @param  AssetManifest|null  $assets  the manifest; the container's (scoped) one by default, resolved per call
     * @param  string  $siteCard  the manifest id of the bespoke generic card
     */
    public function __construct(
        private readonly ?AssetManifest $assets = null,
        private readonly string $siteCard = self::SITE_CARD,
    ) {}

    /**
     * @return array{url: string, width: int, height: int, type: string}|null
     */
    public function for(PageEntry $entry, string $locale): ?array
    {
        if ($entry->ogSlug !== null && $entry->ogFamily !== 'site') {
            $own = $this->describe(self::cardPath($entry->ogFamily, $entry->ogSlug, $locale));

            if ($own !== null) {
                return $own;
            }
        }

        return $this->fallback($locale);
    }

    /**
     * The generic card for a locale: the supplied bespoke card, else the
     * generated one, else null.
     *
     * @return array{url: string, width: int, height: int, type: string}|null
     */
    public function fallback(string $locale): ?array
    {
        $bespoke = ($this->assets ?? app(AssetManifest::class))->ogCard($this->siteCard, $locale);

        if ($bespoke !== null) {
            $described = $this->describe($bespoke);

            if ($described !== null) {
                return $described;
            }
        }

        return $this->describe(self::fallbackPath($locale));
    }

    /**
     * The public path of a page's own card, such as `/og/vi/compare/tableplus.png`.
     */
    public static function cardPath(string $family, string $slug, string $locale): string
    {
        return self::localePrefix($locale) . "/{$family}/{$slug}.png";
    }

    /**
     * The public path of a locale's generic card.
     */
    public static function fallbackPath(string $locale): string
    {
        return $locale === Locales::default() ? '/og.png' : "/og/{$locale}/default.png";
    }

    private static function localePrefix(string $locale): string
    {
        return $locale === Locales::default() ? '/og' : "/og/{$locale}";
    }

    /**
     * @return array{url: string, width: int, height: int, type: string}|null
     */
    private function describe(string $path): ?array
    {
        $file = public_path(ltrim($path, '/'));

        if (! File::isFile($file)) {
            return null;
        }

        $size = @getimagesize($file);

        return [
            'url' => LocalizedUrl::base() . $path,
            'width' => is_array($size) ? $size[0] : 1200,
            'height' => is_array($size) ? $size[1] : 630,
            'type' => is_array($size) && isset($size['mime']) ? $size['mime'] : 'image/png',
        ];
    }
}
