<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        // Feature tests render server-side; they must not require a built Vite
        // manifest (CI does not compile front-end assets before running Pest).
        $this->withoutVite();
    }
}
