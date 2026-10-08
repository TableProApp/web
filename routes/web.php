<?php

use App\Support\Localization\Locales;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Marketing site
|--------------------------------------------------------------------------
|
| Every route here renders content that lives in this repository: markdown
| under resources/blog, JSON under resources/data, and React pages under
| resources/js/pages. Nothing below touches a database or a secret.
|
| The paths this app deliberately does NOT serve — checkout, accounts and the
| newsletter — are handled by the TablePro backend. See docs/architecture.md.
|
| The localized pages are declared once, in routes/localized.php, and mounted
| once per locale in resources/data/locales.json: English at the root with
| today's route names, every other locale under its prefix with the same names
| behind its code (`vi.landing.home` is `/vi`). The locale is a function of the
| URL alone. `locale:{code}` sets it from the group, and `page` lets a route
| answer only in the locales its registry entry renders in.
|
| Redirects and 410s are not routes. The global CanonicalizeRequest middleware
| answers them before routing, because a retired path has no route to match.
|
*/

foreach (Locales::all() as $code => $locale) {
    Route::middleware(['locale:' . $code, 'page'])
        ->prefix($locale['prefix'] ?? '')
        ->name($locale['prefix'] === null ? '' : $code . '.')
        ->group(base_path('routes/localized.php'));
}

// One feed, in the default language, so it is not among the localized routes.
Route::get(\App\Services\Blog\AtomFeed::PATH, [\App\Http\Controllers\BlogController::class, 'feed'])->name('web.blog.feed');

Route::get('/robots.txt', function () {
    $content = "User-agent: *\nAllow: /\n\nSitemap: https://tablepro.app/sitemap.xml\nSitemap: https://docs.tablepro.app/sitemap.xml\n";

    return response($content, 200, ['Content-Type' => 'text/plain']);
})->name('web.robots');
