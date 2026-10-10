<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Foundation\Vite;

abstract class TestCase extends BaseTestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();

        // Inertia caches the first SSR render in a scoped binding, and the test client never flushes them between requests.
        $this->app->terminating(fn() => $this->app->forgetScopedInstances());
    }

    /**
     * @return $this
     */
    protected function withoutVite()
    {
        parent::withoutVite();

        // With `composer dev` running, public/hot would send SSR renders to the Vite dev server.
        $vite = $this->app->make(Vite::class);
        (fn() => $this->hotFile = storage_path('framework/testing/never-hot'))->call($vite);

        return $this;
    }

    protected function withVite()
    {
        parent::withVite();

        $this->app->make(Vite::class)->useHotFile(storage_path('framework/testing/never-hot'));

        return $this;
    }
}
