<?php

namespace App\Http\Controllers;

use App\Services\Content\SiteFacts;
use App\Services\Releases\PlatformCatalog;
use App\Support\Assets\AssetManifest;
use App\Support\Content\ContentRepository;
use Illuminate\Support\Facades\App;
use Inertia\Inertia;
use Inertia\Response;

// The App Store release named in platforms.json (sitemap §E.5). The page asks GitHub for nothing.
class IosController extends Controller
{
    // The hero iPad, 75.54% of the content width beside the iPhone; the page renders it with this and the preload is
    // built with it, so both pick the same candidate.
    public const HERO_SIZES = '(min-width: 1280px) 919px, (min-width: 1024px) calc(75.5vw - 48px), calc(75.5vw - 36px)';

    public function __invoke(ContentRepository $content, PlatformCatalog $platforms, SiteFacts $facts, AssetManifest $assets): Response
    {
        $locale = App::getLocale();
        $ios = $platforms->find('ios');

        return Inertia::render('Ios', [
            'content' => $content->page('ios', $locale),
            'ios' => $ios !== null && ($ios['status'] ?? null) === 'released' ? $this->ios($ios, $platforms) : null,
            'engines' => $facts->iosEngines($this->stringList($ios['iosEngines'] ?? [])),
            'safeModeLevels' => $facts->iosSafeModeLevels(),
            'limits' => [
                'history' => $facts->limit('historyEntriesIos'),
                'results' => $facts->limit('resultBufferIos'),
            ],
            'links' => $facts->links(),
            'organizationProfiles' => $facts->organizationProfiles(),
            'heroSizes' => self::HERO_SIZES,
            // A phone hides the iPad, so only a wider screen preloads it.
            'lcpAsset' => $assets->lcpDescriptor('ios-hero-ipad', $locale, priority: true, sizes: self::HERO_SIZES, media: AssetManifest::WIDE_MEDIA),
        ]);
    }

    /**
     * @param  array<string, mixed>  $ios
     * @return array{requirements: array{systems: list<string>, minVersion: string, displayVersion: string, releaseName: string|null}|null, appStoreUrl: string|null, free: bool, inAppPurchases: bool}
     */
    private function ios(array $ios, PlatformCatalog $platforms): array
    {
        $price = is_array($ios['price'] ?? null) ? $ios['price'] : [];
        $store = $platforms->destination('ios', 'app-store')['url'] ?? null;

        return [
            'requirements' => $platforms->summary('ios')['requirements'] ?? null,
            'appStoreUrl' => is_string($store) && str_starts_with($store, 'https://') ? $store : null,
            'free' => is_numeric($price['amount'] ?? null) && (float) $price['amount'] === 0.0,
            'inAppPurchases' => ($price['inAppPurchases'] ?? false) === true,
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
