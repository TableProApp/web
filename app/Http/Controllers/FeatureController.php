<?php

namespace App\Http\Controllers;

use App\Support\Content\ContentRepository;
use App\Support\Content\Slugs\FeatureSlugs;
use App\Support\Features\FeatureFacts;
use Illuminate\Support\Facades\App;
use Inertia\Inertia;
use Inertia\Response;

/**
 * The feature hub, `/features`, and the feature pages, `/features/{slug}`
 * (sitemap §A.2, §E.4, §E.8), in every locale their content exists in.
 *
 * Whether a page answers at all is the registry's decision
 * (`EnsurePageRenders`), made before this runs: a page renders in a locale
 * when `resources/data/content/{locale}/features/{slug}.json` exists.
 *
 * The copy is the page's content file. The words every feature page shares
 * (tier names, the "Where it works" table, the closing band) are the hub
 * file's `labels` block, so the seven pages cannot drift apart. The facts the
 * copy quotes through `{tokens}` and engine lists arrive as `facts`, computed
 * from the data files by `FeatureFacts`, and only the ones the page names.
 * `components/features/README.md` documents the content schema.
 */
class FeatureController extends Controller
{
    public function index(ContentRepository $content, FeatureFacts $facts): Response
    {
        $locale = App::getLocale();
        $hub = $content->page('features/index', $locale);

        return Inertia::render('Features/Index', [
            'content' => $hub,
            'pages' => $this->pagesIn($content, $locale),
            'facts' => $facts->for($hub),
        ]);
    }

    public function show(ContentRepository $content, FeatureFacts $facts, string $slug): Response
    {
        $locale = App::getLocale();
        $page = $content->page("features/{$slug}", $locale);
        $labels = $content->page('features/index', $locale)['labels'] ?? [];

        return Inertia::render('Features/Show', [
            'slug' => $slug,
            'content' => $page,
            'labels' => $labels,
            'facts' => $facts->for($page),
        ]);
    }

    /**
     * The feature pages that render in this locale, in the menu's order, so
     * the hub never links a page that would answer 404.
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
