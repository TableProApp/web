<?php

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

    return $html ??= ssrHtml('/');
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
        'specs', 'databases', 'features', 'switch',
        'mcp', 'safety', 'license', 'pricing', 'mobile', 'footer-cta',
    ];

    foreach ($sections as $id) {
        expect($html)->toContain("id=\"{$id}\"");
    }

    /*
     * `compare` is an anchor, not a section, since Migration absorbed the
     * comparison table: two header stacks for one argument. It still has to
     * resolve, and it has to land inside Migration rather than after it.
     */
    expect($html)->toContain('id="compare"');
    expect($html)->not->toContain('id="compare-heading"');
    expect(strpos($html, 'id="switch"'))->toBeLessThan(strpos($html, 'id="compare"'));

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

it('server-renders all 29 database tiles', function (): void {
    $html = ssrHomepageHtml();

    /*
     * Counted on the tile, not on the icon. Dameng and Kafka render through
     * `DatabaseMark`'s monogram fallback because they have no artwork yet, so
     * counting `/images/databases/` returns 26 whether the grid holds 26 tiles
     * or 29 — an assertion that would have kept passing, under this name, while
     * three engines were missing from the page.
     */
    $tiles = json_decode(file_get_contents(base_path('resources/data/database-grid.json')), true);

    expect($tiles)->toHaveCount(29);

    /*
     * Collected, not asserted in the loop. `toContain()` is `(mixed ...$needles)`
     * with no message parameter, so a message passed there becomes a second
     * needle and the failure reports the message as the missing string.
     */
    $missing = array_values(array_filter(
        array_column($tiles, 'name'),
        static fn(string $name): bool => ! str_contains($html, $name),
    ));

    expect($missing)->toBe([], 'Grid tiles missing from SSR output: ' . implode(', ', $missing));

    expect(substr_count($html, '/images/databases/'))->toBe(26);
});

it('server-renders the verified claims and none of the retired ones', function (): void {
    $html = ssrHomepageHtml();

    expect($html)
        ->toContain('Every database.')
        // "client", not "app": the head noun of every query this page targets.
        ->toContain('One native Mac client.')
        ->toContain('29 databases.')
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
