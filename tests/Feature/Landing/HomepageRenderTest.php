<?php

use Illuminate\Support\Facades\Http;

/**
 * Renders the homepage through Inertia SSR and asserts on the real DOM.
 *
 * This is the only coverage that proves the React tree actually renders: a
 * successful Vite build only proves it compiles. Requires `npm run build` plus
 * a running SSR service (`php artisan inertia:start-ssr`), so it skips rather
 * than fails when either is absent.
 */
function ssrHomepageHtml(): string
{
    static $html = null;

    if ($html !== null) {
        return $html;
    }

    if (! file_exists(base_path('bootstrap/ssr/ssr.js'))) {
        test()->markTestSkipped('SSR bundle missing. Run: npm run build');
    }

    $ssrUrl = config('inertia.ssr.url', 'http://127.0.0.1:13715');

    try {
        Http::timeout(2)->get($ssrUrl . '/health');
    } catch (\Throwable) {
        // The health endpoint is optional; only a refused connection matters.
    }

    $probe = @fsockopen(parse_url($ssrUrl, PHP_URL_HOST), (int) parse_url($ssrUrl, PHP_URL_PORT), $errno, $errstr, 2);

    if ($probe === false) {
        test()->markTestSkipped('SSR service not running. Run: php artisan inertia:start-ssr');
    }

    fclose($probe);

    $response = test()->get('http://' . config('app.web_domain') . '/');
    $response->assertOk();

    return $html = $response->getContent();
}

it('server-renders exactly one h1 and one main landmark', function (): void {
    $html = ssrHomepageHtml();

    expect(substr_count($html, '<h1'))->toBe(1, 'The homepage must have exactly one h1');
    // The layout owns the <main>; pages must not nest a second one.
    expect(substr_count($html, '<main'))->toBe(1, 'The homepage must have exactly one main landmark');
});

it('server-renders every section of the running order', function (): void {
    $html = ssrHomepageHtml();

    $sections = [
        'sponsors', 'databases', 'features', 'speed', 'mcp', 'mobile',
        'safety', 'more', 'switch', 'open-source', 'pricing', 'faq', 'footer-cta',
    ];

    foreach ($sections as $id) {
        expect($html)->toContain("id=\"{$id}\"");
    }
});

it('server-renders all 26 database tiles', function (): void {
    $html = ssrHomepageHtml();

    expect(substr_count($html, '/images/databases/'))->toBe(26);

    foreach (['PGlite', 'SurrealDB', 'Teradata', 'Trino', 'Beancount', 'libSQL / Turso', 'etcd'] as $name) {
        expect($html)->toContain($name);
    }
});

it('server-renders the verified claims and none of the retired ones', function (): void {
    $html = ssrHomepageHtml();

    expect($html)
        ->toContain('Every database.')
        ->toContain('One native Mac app.')
        ->toContain('25 databases.')
        ->toContain('Starter');

    foreach (['15+ databases', '21+ supported', 'iOS 17+', 'free forever on one Mac', '9 built-in themes'] as $stale) {
        expect($html)->not->toContain($stale);
    }
});

it('emits structured data without a fabricated rating', function (): void {
    $html = ssrHomepageHtml();

    expect($html)
        ->toContain('"@type":"FAQPage"')
        ->toContain('AggregateOffer')
        ->toContain('macOS 14+, iOS 18+')
        ->not->toContain('aggregateRating')
        ->not->toContain('ratingValue');
});

it('places sponsors above the database grid', function (): void {
    $html = ssrHomepageHtml();

    // Sponsors are credited high on the page on purpose: visible credit is what
    // attracts the next sponsor. Guard the ordering so a later edit cannot
    // quietly demote it back down the page.
    expect(strpos($html, 'id="sponsors"'))->toBeLessThan(strpos($html, 'id="databases"'));
    expect($html)->toContain('Paid for by these companies.');
});
