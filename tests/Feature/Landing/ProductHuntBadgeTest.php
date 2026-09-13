<?php

/**
 * The Product Hunt badge in the hero's fine print.
 *
 * Asserted on rendered markup, because the three ways it breaks all type-check:
 * a badge outside the hero, a theme variant that is never offered, and an image
 * with no intrinsic size that shifts the hero once the SVG arrives.
 */
function productHuntBadgeMarkup(): string
{
    $html = ssrHtml('/');

    $heroStart = strpos($html, 'id="top"');
    $heroEnd = strpos($html, 'id="specs"');

    expect($heroStart)->not->toBeFalse();
    expect($heroEnd)->not->toBeFalse();

    $hero = substr($html, $heroStart, $heroEnd - $heroStart);

    expect(preg_match('#<a[^>]*producthunt\.com/products/tablepro[^>]*>.*?</a>#s', $hero, $match))
        ->toBe(1, 'The hero must link to the TablePro page on Product Hunt');

    return $match[0];
}

it('links to Product Hunt in a new tab without handing it the opener', function (): void {
    $badge = productHuntBadgeMarkup();

    expect($badge)->toContain('target="_blank"');
    expect($badge)->toContain('rel="noopener noreferrer"');
    expect($badge)->toContain('utm_campaign=badge-tablepro-2');
});

it('offers the dark badge to a dark OS and the light one to everyone else', function (): void {
    $badge = productHuntBadgeMarkup();

    expect($badge)->toContain('media="(prefers-color-scheme: dark)"');
    expect($badge)->toMatch('#<source[^>]*srcSet="[^"]*post_id=1248464&amp;theme=dark"#');
    expect($badge)->toMatch('#<img[^>]*src="[^"]*post_id=1248464&amp;theme=light"#');
});

it('reserves the badge size before the image loads', function (): void {
    $badge = productHuntBadgeMarkup();

    expect($badge)->toContain('width="250"');
    expect($badge)->toContain('height="54"');
    expect($badge)->toContain('alt="TablePro on Product Hunt"');
});
