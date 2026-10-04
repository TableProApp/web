<?php

namespace App\Http\Controllers;

use App\Services\Content\SiteFacts;
use App\Services\Releases\PlatformCatalog;
use App\Support\Assets\AssetManifest;
use App\Support\Content\ContentRepository;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\App;
use Inertia\Inertia;
use Inertia\Response;

/**
 * The iPhone and iPad page, `/ios` and `/vi/ios` (sitemap §A.1, §E.5).
 *
 * It describes the App Store release named in `platforms.json` (1.0, build
 * 22) and nothing merged after it. Every fact it states arrives here as a
 * prop: the requirement, price, version and App Store URL from
 * `platforms.json`, the engine names from `engines.json`, the Safe Mode level
 * names and the history and result limits from `facts.json`. The page asks
 * GitHub for nothing: the Mac release does not appear on it.
 *
 * `lcpAsset` preloads the iPad capture under the header, the page's largest
 * image. The page renders it and the iPhone capture beside it with priority
 * (`<AssetSlot priority>`), although their manifest entries load lazily where
 * they appear lower on another page. Null while the capture is a placeholder.
 */
class IosController extends Controller
{
    /**
     * The iPad capture's `sizes` in the header row, beside the iPhone slot. The
     * page renders the slot with it and the preload is built with it, so both
     * pick the same srcset candidate.
     */
    public const IPAD_SIZES = '(min-width: 1280px) 904px, (min-width: 1024px) calc(100vw - 376px), (min-width: 640px) calc(100vw - 48px), calc(100vw - 32px)';

    public function __invoke(ContentRepository $content, PlatformCatalog $platforms, SiteFacts $facts, AssetManifest $assets): Response
    {
        $locale = App::getLocale();
        $ios = $platforms->find('ios');
        $mac = $platforms->summary('mac');

        return Inertia::render('Ios', [
            'content' => $content->page('ios', $locale),
            'ios' => $ios !== null && ($ios['status'] ?? null) === 'released' ? $this->ios($ios, $platforms, $locale) : null,
            'macRequirements' => $mac['requirements'] ?? null,
            'engines' => $facts->iosEngines($this->stringList($ios['iosEngines'] ?? [])),
            'safeModeLevels' => $facts->iosSafeModeLevels(),
            'limits' => [
                'history' => $facts->limit('historyEntriesIos'),
                'results' => $facts->limit('resultBufferIos'),
            ],
            'links' => $facts->links(),
            'organizationProfiles' => $facts->organizationProfiles(),
            'ipadSizes' => self::IPAD_SIZES,
            'lcpAsset' => $assets->lcpDescriptor('ipad-table-browse', $locale, priority: true, sizes: self::IPAD_SIZES),
        ]);
    }

    /**
     * @param  array<string, mixed>  $ios
     * @return array{deviceNames: list<string>, requirements: array{systems: list<string>, minVersion: string, displayVersion: string, releaseName: string|null}|null, appStoreUrl: string|null, free: bool, inAppPurchases: bool, version: string|null, publishedAt: string|null, publishedAtFormatted: string|null}
     */
    private function ios(array $ios, PlatformCatalog $platforms, string $locale): array
    {
        $summary = $platforms->summary('ios');
        $price = is_array($ios['price'] ?? null) ? $ios['price'] : [];
        $store = $platforms->destination('ios', 'app-store')['url'] ?? null;
        $release = is_array($ios['release'] ?? null) ? $ios['release'] : [];
        $published = is_string($release['publishedAt'] ?? null) && preg_match('/^\d{4}-\d{2}-\d{2}$/', $release['publishedAt']) === 1
            ? CarbonImmutable::createFromFormat('Y-m-d', $release['publishedAt'])->startOfDay()
            : null;

        return [
            'deviceNames' => $summary['deviceNames'] ?? [],
            'requirements' => $summary['requirements'] ?? null,
            'appStoreUrl' => is_string($store) && str_starts_with($store, 'https://') ? $store : null,
            'free' => is_numeric($price['amount'] ?? null) && (float) $price['amount'] === 0.0,
            'inAppPurchases' => ($price['inAppPurchases'] ?? false) === true,
            'version' => is_string($release['version'] ?? null) ? $release['version'] : null,
            'publishedAt' => $published?->toDateString(),
            'publishedAtFormatted' => $published?->locale($locale)->isoFormat('LL'),
        ];
    }

    /**
     * @return list<string>
     */
    private function stringList(mixed $value): array
    {
        return is_array($value) ? array_values(array_filter($value, 'is_string')) : [];
    }
}
