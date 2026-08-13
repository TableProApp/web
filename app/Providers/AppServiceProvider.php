<?php

namespace App\Providers;

use App\Services\Blog\BlogService;
use App\Services\Og\BrowsershotOgImageRenderer;
use App\Services\Og\OgImageRenderer;
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
    }
}
