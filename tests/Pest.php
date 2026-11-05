<?php

use Illuminate\Support\Facades\Http;

pest()->extend(Tests\TestCase::class)
    // No test reaches the network except the local SSR service; fake GitHub with Http::fake().
    ->beforeEach(function (): void {
        Http::preventStrayRequests();
        Http::allowStrayRequests([rtrim((string) config('inertia.ssr.url', 'http://127.0.0.1:13715'), '/') . '/*']);
    })
    ->in('Feature');

require_once __DIR__ . '/Support/ssr.php';
require_once __DIR__ . '/Support/asset-slots.php';
require_once __DIR__ . '/Support/seo.php';
require_once __DIR__ . '/Support/releases.php';

dataset('locales', fn(): array => array_keys(json_decode((string) file_get_contents(__DIR__ . '/../resources/data/locales.json'), true)['supported']));

dataset('translated locales', fn(): array => array_values(array_diff(
    array_keys(json_decode((string) file_get_contents(__DIR__ . '/../resources/data/locales.json'), true)['supported']),
    ['en'],
)));
