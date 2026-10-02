<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    /**
     * Feature tests render server-side, so they must not require a built Vite
     * manifest: CI does not compile front-end assets before running Pest.
     *
     * Each test request also ends the way a production request does, with no
     * scoped binding carried into the next. Inertia keeps the SSR response in
     * `Inertia\Ssr\SsrState`, a scoped binding that caches the first render it
     * receives. Production builds a fresh application per request, but a test
     * keeps one application for every request it makes, and the test client
     * never flushes scoped bindings. The second SSR request in a test therefore
     * received the first page's markup: `/vi/download` after `/download` came
     * back in English while `<html lang>` said `vi`, and a crawl over many
     * paths checked the first page again and again. The test client terminates
     * the kernel after every request, which runs the callback below.
     */
    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();

        $this->app->terminating(fn() => $this->app->forgetScopedInstances());
    }
}
