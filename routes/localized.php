<?php

use App\Http\Controllers\BlogController;
use App\Http\Controllers\CompareController;
use App\Http\Controllers\DatabaseController;
use App\Http\Controllers\DownloadController;
use App\Http\Controllers\FaqController;
use App\Http\Controllers\FeatureController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\IosController;
use App\Http\Controllers\LegalController;
use App\Http\Controllers\PricingController;
use App\Support\Content\Slugs\CompareSlugs;
use App\Support\Content\Slugs\DatabaseSlugs;
use App\Support\Content\Slugs\FeatureSlugs;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Localized pages
|--------------------------------------------------------------------------
|
| Every public page, declared once. routes/web.php mounts this file once per
| locale, so `/download` and `/vi/download` are the same declaration. Whether
| a page actually answers in a locale is the registry's decision
| (App\Support\Seo\PageRegistry, enforced by the `page` middleware), not this
| file's: a route existing here is never enough to render a page.
|
| Three rules:
|
| 1. Slug constraints come from the constant classes in
|    app/Support/Content/Slugs, never from a content directory read here.
|    `route:cache` rebuilds only when PHP changes, so a slug that existed only
|    as a file would ship without a route.
| 2. No root-level path may equal a locale prefix (`vi`), and `ios`, `features`,
|    `databases`, `compare` and `pricing` must never join the database slugs.
|    LocaleRoutingTest and LocalesDataTest guard both.
| 3. The blog slug stays a pattern: whether a post exists in the requested
|    locale is the registry's and the controller's decision.
|
| `/` and `/vi` both render a section with id="pricing", because shipped Mac
| builds open `/?ref=…#pricing`.
|
*/

Route::get('/', HomeController::class)->name('landing.home');
Route::get('/download', DownloadController::class)->name('landing.download');
Route::get('/ios', IosController::class)->name('landing.ios');
Route::get('/pricing', PricingController::class)->name('landing.pricing');
Route::get('/faq', FaqController::class)->name('landing.faq');

Route::get('/privacy', [LegalController::class, 'privacy'])->name('landing.privacy');
Route::get('/terms', [LegalController::class, 'terms'])->name('landing.terms');
Route::get('/refund-policy', [LegalController::class, 'refundPolicy'])->name('landing.refundPolicy');

Route::get('/blog', [BlogController::class, 'index'])->name('landing.blog.index');
Route::get('/blog/{slug}', [BlogController::class, 'show'])
    ->where('slug', '[a-z0-9-]+')
    ->name('landing.blog.show');

Route::get('/features', [FeatureController::class, 'index'])->name('landing.features.index');
Route::get('/features/{slug}', [FeatureController::class, 'show'])
    ->whereIn('slug', FeatureSlugs::ALL)
    ->name('landing.features.show');

Route::get('/databases', [DatabaseController::class, 'index'])->name('landing.databases.index');

Route::get('/compare', [CompareController::class, 'index'])->name('landing.compare.index');
Route::get('/compare/{slug}', [CompareController::class, 'show'])
    ->whereIn('slug', CompareSlugs::ALL)
    ->name('landing.compare');

Route::get('/{slug}', [DatabaseController::class, 'show'])
    ->whereIn('slug', DatabaseSlugs::ALL)
    ->name('landing.databaseClient');
