<?php

use Illuminate\Support\Facades\Http;
use PHPUnit\Framework\Assert;

/**
 * Skips when SSR is unavailable locally, fails when `REQUIRE_SSR` is set.
 *
 * Skipping is right on a developer machine, where not everyone has run
 * `npm run build`. It is wrong in CI: a skipped run is indistinguishable from a
 * passing one, so an SSR job that silently stopped rendering would report green
 * forever. The `ssr` workflow job sets `REQUIRE_SSR=1` for exactly this reason.
 */
function ssrUnavailable(string $reason): never
{
    if (filter_var(env('REQUIRE_SSR', false), FILTER_VALIDATE_BOOL)) {
        Assert::fail($reason);
    }

    test()->markTestSkipped($reason);
}

/**
 * Renders the homepage through Inertia SSR and asserts on the real DOM.
 *
 * This is the only coverage that proves the React tree actually renders: a
 * successful Vite build only proves it compiles. Requires `npm run build` plus
 * a running SSR service (`php artisan inertia:start-ssr`).
 */
function ssrHomepageHtml(): string
{
    static $html = null;

    if ($html !== null) {
        return $html;
    }

    if (! file_exists(base_path('bootstrap/ssr/ssr.js'))) {
        ssrUnavailable('SSR bundle missing. Run: npm run build');
    }

    $ssrUrl = config('inertia.ssr.url', 'http://127.0.0.1:13715');

    try {
        Http::timeout(2)->get($ssrUrl . '/health');
    } catch (\Throwable) {
        // The health endpoint is optional; only a refused connection matters.
    }

    $probe = @fsockopen(parse_url($ssrUrl, PHP_URL_HOST), (int) parse_url($ssrUrl, PHP_URL_PORT), $errno, $errstr, 2);

    if ($probe === false) {
        ssrUnavailable('SSR service not running. Run: php artisan inertia:start-ssr');
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
        'specs', 'databases', 'features', 'switch', 'compare',
        'mcp', 'safety', 'pricing', 'mobile', 'footer-cta',
    ];

    foreach ($sections as $id) {
        expect($html)->toContain("id=\"{$id}\"");
    }

    /*
     * And the retired ones stay retired. `speed`, `more` and `open-source` were
     * sections whose whole content was prose restating a claim made elsewhere;
     * `sponsors` became a headless row inside pricing; `faq` moved to /faq.
     * None of the five had an inbound link anywhere in the repo.
     */
    foreach (['id="speed"', 'id="more"', 'id="open-source"', 'id="sponsors"', 'id="faq"'] as $retired) {
        expect($html)->not->toContain($retired);
    }
});

it('keeps every anchor the navigation points at', function (): void {
    $html = ssrHomepageHtml();

    /*
     * The header, the mobile nav, the hero and the footer link into the page.
     * `#mobile` is the fragile one: the iPhone content is now a cell inside the
     * closing call to action rather than a section, and it carries the id.
     */
    foreach (['features', 'databases', 'pricing', 'mobile', 'footer-cta'] as $anchor) {
        expect($html)->toContain("id=\"{$anchor}\"");
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
        ->toContain('AggregateOffer')
        ->not->toContain('aggregateRating')
        ->not->toContain('ratingValue');

    /*
     * And exactly one FAQPage on the domain, which is /faq's. Google retired
     * the FAQ rich result on 7 May 2026, so the homepage copy earned nothing
     * and competed with a page serving a superset of the same questions.
     */
    expect($html)->not->toContain('"@type":"FAQPage"');
});

it('keeps the sponsor credit, below the prices it explains', function (): void {
    $html = ssrHomepageHtml();

    /*
     * The marks and the solicitation both survive; the H2, the funding lede and
     * the 22-word ask do not. Position three is the adoption-proof slot, and
     * eight unfamiliar grayscale logos under a heading calling them paid
     * placements is not proof. At the foot of pricing the same marks are on
     * topic, because the reader has just been told what a license buys.
     */
    expect($html)->toContain('Become a sponsor');
    expect(strpos($html, 'id="pricing"'))->toBeLessThan(strpos($html, 'Become a sponsor'));
    expect($html)->not->toContain('Paid for by these companies.');
});
