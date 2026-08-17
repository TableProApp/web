<?php

use App\Http\Controllers\Landing\BlogController;
use App\Http\Controllers\Landing\LandingController;
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
| The paths this app deliberately does NOT serve — checkout, accounts, the
| newsletter and beta signup — are handled by the TablePro backend. See
| docs/architecture.md.
|
*/

Route::get('/', [LandingController::class, 'home'])->name('landing.home');
Route::get('/download', [LandingController::class, 'download'])->name('landing.download');
Route::get('/privacy', [LandingController::class, 'privacy'])->name('landing.privacy');
Route::get('/terms', [LandingController::class, 'terms'])->name('landing.terms');
Route::get('/refund-policy', [LandingController::class, 'refundPolicy'])->name('landing.refundPolicy');
Route::get('/faq', [LandingController::class, 'faq'])->name('landing.faq');

Route::get('/blog', [BlogController::class, 'index'])->name('landing.blog.index');
Route::get('/blog/{slug}', [BlogController::class, 'show'])
    ->where('slug', '[a-z0-9-]+')
    ->name('landing.blog.show');

Route::get('/compare/{slug}', [LandingController::class, 'compare'])
    ->where('slug', 'tableplus|dbeaver|datagrip|navicat|beekeeper-studio|sequel-pro|postico|sequel-ace|heidisql|azimutt|phpmyadmin')
    ->name('landing.compare');

Route::get('/{slug}', [LandingController::class, 'databaseClient'])
    ->where('slug', 'mysql-client|postgresql-client|sqlite-client|mongodb-client|redis-gui|sql-server-client|oracle-client|clickhouse-client|duckdb-client|cassandra-client|mariadb-client|redshift-client|cloudflare-d1-client|turso-client|dynamodb-gui|bigquery-client|etcd-gui|snowflake-client|cockroachdb-client|elasticsearch-client|scylladb-client|pglite-client|surrealdb-client|teradata-client|trino-client|beancount-client')
    ->name('landing.databaseClient');

Route::get('/robots.txt', function () {
    $content = "User-agent: *\nAllow: /\n\nSitemap: https://tablepro.app/sitemap.xml\nSitemap: https://docs.tablepro.app/sitemap.xml\n";

    return response($content, 200, ['Content-Type' => 'text/plain']);
})->name('web.robots');
