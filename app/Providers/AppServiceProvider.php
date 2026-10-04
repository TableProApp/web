<?php

namespace App\Providers;

use App\Services\Blog\BlogService;
use App\Services\Og\BrowsershotOgImageRenderer;
use App\Services\Og\OgImageRenderer;
use App\Support\Content\ContentRepository;
use App\Support\Content\MarkdownRenderer;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(OgImageRenderer::class, BrowsershotOgImageRenderer::class);

        $this->app->singleton(BlogService::class, fn() => new BlogService(
            blogDirectory: resource_path('blog'),
        ));

        /*
         * Singletons so a request decodes each content file once, however many
         * of the registry, the controller and the head ask for it.
         */
        $this->app->singleton(ContentRepository::class, fn(): ContentRepository => new ContentRepository(
            directory: resource_path('data/content'),
        ));

        $this->app->singleton(MarkdownRenderer::class);
    }
}
