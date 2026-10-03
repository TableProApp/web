<?php

use Illuminate\Support\Facades\Http;

/*
|--------------------------------------------------------------------------
| Test Case
|--------------------------------------------------------------------------
|
| The closure you provide to your test functions is always bound to a specific PHPUnit test
| case class. By default, that class is "PHPUnit\Framework\TestCase". Of course, you may
| need to change it using the "pest()" function to bind a different classes or traits.
|
*/

pest()->extend(Tests\TestCase::class)
    /*
     * No test reaches the network. Several used to call the live GitHub API,
     * which made them slow, rate-limited and dependent on whatever the latest
     * release happened to be. A test that needs a response fakes it with
     * `Http::fake()`; anything unfaked throws instead of leaving the machine.
     *
     * The SSR server is the one exception: it is local, and the SSR-gated tests
     * exist to render through it.
     */
    ->beforeEach(function (): void {
        Http::preventStrayRequests();
        Http::allowStrayRequests([rtrim((string) config('inertia.ssr.url', 'http://127.0.0.1:13715'), '/') . '/*']);
    })
    ->in('Feature');

/*
|--------------------------------------------------------------------------
| Shared helpers
|--------------------------------------------------------------------------
|
| Loaded once, so the three files that assert on server-rendered markup share
| one SSR gate instead of keeping their own copies of the probe.
|
*/

require_once __DIR__ . '/Support/ssr.php';
require_once __DIR__ . '/Support/asset-slots.php';
