<?php

namespace App\Http\Controllers;

use App\Services\Releases\PlatformCatalog;
use App\Support\Assets\AssetManifest;
use App\Support\Content\ContentRepository;
use App\Support\Content\Slugs\FeatureSlugs;
use App\Support\Features\FeatureFacts;
use Illuminate\Support\Facades\App;
use Inertia\Inertia;
use Inertia\Response;

/**
 * The feature hub, `/features`, and the feature pages, `/features/{slug}` (sitemap §A.2, §E.4, §E.8), in every
 * locale their content exists in; `EnsurePageRenders` decides that before this runs.
 *
 * The words every feature page shares are the hub file's `labels`, so the seven pages cannot drift apart. The facts
 * the copy quotes through `{tokens}` and engine lists arrive as `facts`, only the ones the page names.
 * `components/features/README.md` documents the content schema.
 */
class FeatureController extends Controller
{
    // The hero window's real width; Features/Show.tsx renders it with the same string, so the preload picks its image.
    public const HERO_SIZES = '(min-width: 1280px) 1216px, (min-width: 1024px) calc(100vw - 64px), (min-width: 640px) calc(100vw - 48px), calc(100vw - 32px)';

    public function index(ContentRepository $content, FeatureFacts $facts): Response
    {
        $locale = App::getLocale();
        $hub = $content->page('features/index', $locale);

        return Inertia::render('Features/Index', [
            'content' => $hub,
            'areas' => array_map(fn(string $slug): array => $this->area($content, $slug, $locale), $this->pagesIn($content, $locale)),
            'facts' => $facts->for($hub),
        ]);
    }

    public function show(ContentRepository $content, FeatureFacts $facts, AssetManifest $assets, PlatformCatalog $platforms, string $slug): Response
    {
        $locale = App::getLocale();
        $page = $content->page("features/{$slug}", $locale);

        return Inertia::render('Features/Show', [
            'slug' => $slug,
            'content' => $page,
            'labels' => $content->page('features/index', $locale)['labels'] ?? [],
            'facts' => $facts->for($page),
            // Null until Linux ships, so a band names Linux only once it has.
            'linux' => $platforms->linuxSummary(),
            'heroSizes' => self::HERO_SIZES,
            'lcpAsset' => $assets->lcpDescriptor($page['header']['asset'], $locale, priority: true, sizes: self::HERO_SIZES),
        ]);
    }

    /**
     * What the hub shows of a page: its title, its window and its bands.
     *
     * @return array{slug: string, title: string, asset: string, bands: list<array{id: string, title: string, paid: list<string>}>}
     */
    private function area(ContentRepository $content, string $slug, string $locale): array
    {
        $page = $content->page("features/{$slug}", $locale);

        return [
            'slug' => $slug,
            'title' => $page['header']['title'],
            'asset' => $page['header']['asset'],
            'bands' => array_map(fn(array $band): array => [
                'id' => $band['id'],
                'title' => $band['title'],
                'paid' => array_values($band['paid'] ?? []),
            ], $page['bands']),
        ];
    }

    /**
     * The feature pages that render in this locale, in the menu's order, so the hub never links a page that would
     * answer 404.
     *
     * @return list<string>
     */
    private function pagesIn(ContentRepository $content, string $locale): array
    {
        return array_values(array_filter(
            FeatureSlugs::ALL,
            fn(string $slug): bool => $content->has("features/{$slug}", $locale),
        ));
    }
}
