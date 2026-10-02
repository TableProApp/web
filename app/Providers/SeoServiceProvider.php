<?php

namespace App\Providers;

use App\Support\Content\ContentRepository;
use App\Support\Seo\LegacyPages;
use App\Support\Seo\PageRegistry;
use App\Support\Seo\StaticPages;
use Illuminate\Support\ServiceProvider;

/**
 * Binds the page registry that every SEO surface reads.
 *
 * Family order is precedence: the first family that knows a page answers for
 * it. Content families come first and `LegacyPages` last, so a page leaves its
 * pre-rebuild component the moment its content lands.
 *
 * Phase A stub with the two families that exist so far. The SEO agent owns it
 * from phase B and adds `ContentCollection` (features, databases, compare and
 * their hubs), `BlogPosts` and `LegalPages`, each before `LegacyPages`.
 */
class SeoServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(PageRegistry::class, fn(): PageRegistry => new PageRegistry([
            new StaticPages($this->app->make(ContentRepository::class)),
            new LegacyPages(),
        ]));
    }
}
