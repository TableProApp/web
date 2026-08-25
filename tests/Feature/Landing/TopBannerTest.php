<?php

use PHPUnit\Framework\Assert;

/**
 * Guards the standing banner above the header.
 *
 * It is the loudest surface on the site — the one element every visitor meets
 * on every page — and it sits four pixels above a headline reading "The app is
 * free." Almost everything that can go wrong with it is invisible to a
 * typecheck: a class that Tailwind never compiled, a height that three of its
 * four dependents stopped agreeing on, a dismissal that flashes the bar on
 * every load, or an `enabled => false` that leaves 44px of nothing behind.
 *
 * The geometry was verified in a real browser before these were written —
 * banner 0..44, header 44..109, `<main>` padded 108, `scroll-padding-top` 124,
 * and every one of those collapsing back to the pre-banner values when
 * dismissed. What a test can hold is that the wiring which produced those
 * numbers is still in place.
 */
it('shows the banner on every kind of page', function (): void {
    /*
     * Shared from `HandleInertiaRequests::share()` rather than passed per page,
     * so this is really asserting that no page bypasses `LandingLayout`. A
     * banner that appears on the homepage alone is worse than none: it reads as
     * a bug to anyone who lands on /faq from search.
     */
    foreach (['/', '/download', '/faq', '/compare/dbeaver', '/mysql-client'] as $path) {
        $html = ssrHtml($path);

        /*
         * `Assert::assertStringContainsString`, not `->toContain($needle,
         * $message)`. Pest's `toContain` is `(mixed ...$needles)` with no
         * message parameter, so a message passed there becomes a second needle
         * — which for the positive form makes the assertion stricter and fails
         * on the message text itself. The negative form is worse: it passes the
         * moment either needle is absent, which is how two blocks in
         * `StaleClaimsTest` stayed green for their whole lives.
         */
        Assert::assertStringContainsString('support-banner', $html, "{$path} is missing the banner");
        Assert::assertStringContainsString('has-banner', $html, "{$path} does not reserve room for the banner");
    }
});

it('drives the header, main and scroll offsets from one token', function (): void {
    $html = ssrHtml('/');

    /*
     * Four measurements have to agree: the banner's own height, the fixed
     * header's top, `<main>`'s padding, and `scroll-padding-top`. Three of them
     * are Tailwind arbitrary values, which is the failure mode this catches —
     * Tailwind silently emits nothing for a class it cannot find in a source
     * scan, and the result is a header sitting under the banner with no error
     * anywhere.
     *
     * `app.css` owns the fourth and the token itself.
     */
    Assert::assertStringContainsString(
        'top-[var(--banner-h)]',
        $html,
        'The header must hang below the banner',
    );
    Assert::assertStringContainsString(
        'pt-[calc(4rem+var(--banner-h))]',
        $html,
        'Main must clear the header and the banner',
    );

    $css = file_get_contents(base_path('resources/css/app.css'));
    Assert::assertStringContainsString('html.has-banner', $css);
    Assert::assertStringContainsString('--banner-h: 0px', $css, 'The token must default to zero');
    Assert::assertStringContainsString('scroll-padding-top: calc(5rem + var(--banner-h))', $css);
});

it('settles the dismissal before the first paint', function (): void {
    $html = ssrHtml('/');

    /*
     * The class is stamped server-side and removed by an inline script in the
     * document head, ahead of any stylesheet or bundle. Deciding it in React
     * state instead would drop the header 44px on every load for every reader
     * who had already closed the bar — the same class of flash the theme script
     * two lines below it exists to prevent.
     *
     * Asserted by position: the dismissal must run before the app's own script
     * tags, or it is not a pre-paint script at all.
     */
    $script = strpos($html, 'tablepro:banner-dismissed');
    $body = strpos($html, '<body');

    expect($script)->not->toBeFalse('The dismissal must be settled by an inline script');
    expect($script)->toBeLessThan($body, 'The dismissal script belongs in the head, before first paint');

    // Version-matched, so bumping `banner.version` re-shows the bar to everyone
    // without touching what any browser has stored.
    Assert::assertStringContainsString((string) config('banner.version'), $html);
});

it('leaves nothing behind when it is switched off', function (): void {
    config(['banner.enabled' => false]);

    $html = ssrHtml('/download');

    /*
     * A disabled banner must not be a hidden banner. If the element still
     * rendered, or the class were still stamped, the header would sit 44px
     * down the page with an invisible bar above it — which is exactly what a
     * `display: none` implementation would ship.
     */
    Assert::assertStringNotContainsString('support-banner', $html, 'A disabled banner must leave no element');

    // Including the pre-paint script, whose only job is to remove that class.
    Assert::assertStringNotContainsString(
        'has-banner',
        $html,
        'A disabled banner must reserve no height and ship no dismissal script',
    );
    Assert::assertStringNotContainsString(
        'tablepro:banner-dismissed',
        $html,
        'A disabled banner must not ship a dismissal script',
    );
});

it('keeps the banner short enough to survive a phone', function (): void {
    /*
     * The bar is one 44px line and the message truncates. On a 390px viewport
     * the CTA and the dismiss control take roughly 150px, so a long message is
     * not wrapped, it is cut — and a funding claim ending in an ellipsis argues
     * against itself.
     *
     * Asserted against config rather than the DOM, because that is where a
     * future edit will happen and the ceiling is what the layout can hold.
     */
    expect(strlen((string) config('banner.message_short')))
        ->toBeLessThanOrEqual(40, 'The narrow message will be truncated on a phone');

    expect(strlen((string) config('banner.cta')))
        ->toBeLessThanOrEqual(20, 'A long call to action squeezes the message out entirely');
});

it('offers a license rather than asking for a donation', function (): void {
    $html = ssrHtml('/');

    /*
     * Beekeeper Studio, the closest peer, says it outright: "the best way to
     * support us is by purchasing a license." A license is worth more to the
     * project than a sponsorship and more to the reader, who gets nine features
     * for it — so the one control on the loudest surface of the site points at
     * the prices.
     *
     * The plea vocabulary is scanned separately, over the whole `<body>`, by
     * `FundingModelTest`.
     */
    expect((string) config('banner.href'))->toContain('#pricing');
    Assert::assertStringContainsString('>' . config('banner.cta'), $html);
});
