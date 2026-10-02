<?php

namespace App\Providers;

use App\Support\Content\ContentRepository;
use App\Support\Seo\BlogPosts;
use App\Support\Seo\ContentCollection;
use App\Support\Seo\LastModified;
use App\Support\Seo\LegacyPages;
use App\Support\Seo\LegalPages;
use App\Support\Seo\OgFonts;
use App\Support\Seo\OgImages;
use App\Support\Seo\PageFamily;
use App\Support\Seo\PageRegistry;
use App\Support\Seo\RedirectMap;
use App\Support\Seo\StaticPages;
use App\Support\Seo\WithoutRetiredPaths;
use Illuminate\Contracts\Foundation\Application;
use Illuminate\Support\ServiceProvider;

/**
 * Binds the page registry that every SEO surface reads, and the redirect map
 * that answers retired URLs before routing.
 *
 * Family order is precedence: the first family that knows a page answers for
 * it. The content-driven families come first and `LegacyPages` last, so a page
 * leaves its pre-rebuild component the moment its content lands:
 *
 * 1. `StaticPages`: home, download, iOS, pricing, FAQ, the blog index.
 * 2. `ContentCollection`: features, databases and comparisons, with their hubs.
 * 3. `LegalPages`: privacy, terms, refund policy.
 * 4. `BlogPosts`: one page per post, per language it is written in.
 * 5. `LegacyPages`: whatever has no content yet, in English only.
 *
 * Every family is wrapped in `WithoutRetiredPaths`, so a URL the redirect map
 * answers is never a page, whichever family still lists it.
 *
 * Each collaborator is resolved from the container when the registry is first
 * asked for, so a test can swap the content repository, the blog or legal
 * directory, or the redirect map before it does.
 */
class SeoServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(RedirectMap::class, fn(): RedirectMap => new RedirectMap(
            mapPath: resource_path('data/redirects.json'),
            enginesPath: resource_path('data/engines.json'),
        ));

        $this->app->bind(BlogPosts::class, fn(): BlogPosts => new BlogPosts(resource_path('blog')));

        $this->app->bind(LegalPages::class, fn(): LegalPages => new LegalPages(resource_path('data/legal')));

        $this->app->bind(LastModified::class, fn(): LastModified => new LastModified(base_path()));

        /*
         * Built with no manifest, so it asks the container for the scoped
         * `AssetManifest` on each call rather than holding one past its request.
         */
        $this->app->singleton(OgImages::class, fn(): OgImages => new OgImages());

        $this->app->bind(OgFonts::class, fn(): OgFonts => new OgFonts(resource_path('css/fonts.css')));

        $this->app->singleton(PageRegistry::class, function (Application $app): PageRegistry {
            $content = $app->make(ContentRepository::class);
            $redirects = $app->make(RedirectMap::class);

            $families = [
                new StaticPages($content),
                new ContentCollection($content),
                $app->make(LegalPages::class),
                $app->make(BlogPosts::class),
                new LegacyPages(),
            ];

            return new PageRegistry(array_map(
                static fn(PageFamily $family): PageFamily => new WithoutRetiredPaths($family, $redirects),
                $families,
            ));
        });
    }
}
