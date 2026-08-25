<?php

/**
 * Contrast, computed from the tokens `app.css` actually declares.
 *
 * Written after the second contrast defect in this project. The first was a
 * helper that applied the sRGB gamma transfer twice and reported
 * `--muted-foreground` at 14:1 when it is 4.73:1 — caught only because
 * `--foreground` came out at 14:1 as well, which is impossible. The second was
 * `--primary-foreground` at 6.18:1 on `--primary`: it cleared AA, so nothing
 * complained, and it still read flat because the mark and the fill share hue 55
 * and a same-hue pair has no hue separation doing any of the work.
 *
 * Neither is visible in source. Both are arithmetic.
 *
 * The values are parsed out of `app.css` rather than copied here, so this fails
 * when a token moves rather than when someone remembers to update a fixture.
 *
 * @see resources/css/app.css
 */

/** Every declared `--token: oklch(L C H)` in one block of `app.css`. */
function cssTokens(string $selector): array
{
    $css = file_get_contents(base_path('resources/css/app.css'));

    $start = strpos($css, $selector . ' {');
    expect($start)->not->toBeFalse("app.css has no {$selector} block");

    $block = substr($css, $start, strpos($css, "\n}", $start) - $start);

    preg_match_all('/--([a-z-]+):\s*oklch\(([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\)/', $block, $m, PREG_SET_ORDER);

    $out = [];
    foreach ($m as $token) {
        $out[$token[1]] = [(float) $token[2], (float) $token[3], (float) $token[4]];
    }

    return $out;
}

/**
 * oklch to *linear-light* sRGB, clipped to the gamut the browser would clip to.
 *
 * Linear, deliberately. Relative luminance is defined on linear values, and
 * running them through the gamma transfer first is precisely the bug that
 * reported every colour on this site as high contrast.
 *
 * @param  array{float, float, float}  $oklch
 * @return array{float, float, float}
 */
function oklchToLinearSrgb(array $oklch): array
{
    [$L, $C, $H] = $oklch;

    $h = deg2rad($H);
    $a = $C * cos($h);
    $b = $C * sin($h);

    $l = ($L + 0.3963377774 * $a + 0.2158037573 * $b) ** 3;
    $m = ($L - 0.1055613458 * $a - 0.0638541728 * $b) ** 3;
    $s = ($L - 0.0894841775 * $a - 1.2914855480 * $b) ** 3;

    return array_map(
        static fn(float $v): float => max(0.0, min(1.0, $v)),
        [
            4.0767416621 * $l - 3.3077115913 * $m + 0.2309699292 * $s,
            -1.2684380046 * $l + 2.6097574011 * $m - 0.3413193965 * $s,
            -0.0041960863 * $l - 0.7034186147 * $m + 1.7076147010 * $s,
        ],
    );
}

/** @param  array{float, float, float}  $linear */
function relativeLuminance(array $linear): float
{
    return 0.2126 * $linear[0] + 0.7152 * $linear[1] + 0.0722 * $linear[2];
}

/**
 * @param  array{float, float, float}  $fg
 * @param  array{float, float, float}  $bg
 */
function contrastRatio(array $fg, array $bg): float
{
    $a = relativeLuminance(oklchToLinearSrgb($fg));
    $b = relativeLuminance(oklchToLinearSrgb($bg));

    return (max($a, $b) + 0.05) / (min($a, $b) + 0.05);
}

it('computes a ratio this project already knows the answer to', function (): void {
    /*
     * The helper is checked before anything is checked with it. Every assertion
     * below is only as good as these three, and the last one is the value the
     * broken helper got wrong: it reported 14:1.
     */
    expect(contrastRatio([0.0, 0.0, 0.0], [1.0, 0.0, 0.0]))->toBeGreaterThan(20.9);
    expect(contrastRatio([0.0, 0.0, 0.0], [1.0, 0.0, 0.0]))->toBeLessThan(21.1);

    $light = cssTokens(':root');

    // app.css records this one in prose: "Raised from L 0.556 (4.73:1) to 0.52
    // (5.51:1)". If the helper cannot reproduce 5.51, it is not measuring
    // contrast.
    $muted = contrastRatio($light['muted-foreground'], $light['background']);
    expect(round($muted, 2))->toBe(5.51);
});

it('clears AAA for the mark on every primary fill', function (): void {
    /*
     * One pairing, four surfaces: the primary Button, the two checkout buttons
     * in Pricing, the skip link, and the top banner. Both tokens are declared
     * identically in the light and dark blocks — one fill, one mark, both
     * grounds — so this is checked in each and required to agree.
     *
     * AAA rather than AA, because every one of the four is `text-sm`, and
     * because a same-hue pair reads flatter than its ratio: at 6.18:1, which
     * clears AA by 1.68, it was reported as hard to read and it was.
     */
    foreach ([':root', '.dark'] as $selector) {
        $tokens = cssTokens($selector);

        $ratio = contrastRatio($tokens['primary-foreground'], $tokens['primary']);

        expect($ratio)->toBeGreaterThanOrEqual(
            7.0,
            "--primary-foreground on --primary is {$ratio}:1 in {$selector}; the mark on a fill needs AAA",
        );
    }
});

it('keeps every body-text token above AA on the ground it sits on', function (): void {
    /*
     * `--muted-foreground` carries the site's body copy and `--foreground` its
     * headings, on two grounds each: the base background and the raised surface
     * that `[data-tone="raised"]` swaps in. The raised pairing is the one
     * nothing was checking — it is a different background, applied by a CSS
     * variable override, and it never appears next to its foreground in source.
     */
    foreach ([':root', '.dark'] as $selector) {
        $tokens = cssTokens($selector);

        foreach (['foreground', 'muted-foreground', 'muted-foreground-subtle'] as $fg) {
            foreach (['background', 'surface-raised'] as $bg) {
                $ratio = contrastRatio($tokens[$fg], $tokens[$bg]);

                expect($ratio)->toBeGreaterThanOrEqual(
                    4.5,
                    "--{$fg} on --{$bg} is {$ratio}:1 in {$selector}",
                );
            }
        }
    }
});

it('keeps the text-only accent legible on both grounds', function (): void {
    /*
     * `--primary-strong` exists because `--primary` is tuned for fills and
     * measures about 2.2:1 as text on white. It is the token every accent
     * heading, eyebrow and inline link uses, so it carries real prose and needs
     * AA on both grounds.
     *
     * It is also why the banner's call to action does not use it: on the
     * primary fill it measures 2.24:1 in light and 1.36:1 in dark, which is the
     * one place on this site where the accent token is the wrong tool.
     */
    foreach ([':root', '.dark'] as $selector) {
        $tokens = cssTokens($selector);

        foreach (['background', 'surface-raised'] as $bg) {
            $ratio = contrastRatio($tokens['primary-strong'], $tokens[$bg]);

            expect($ratio)->toBeGreaterThanOrEqual(
                4.5,
                "--primary-strong on --{$bg} is {$ratio}:1 in {$selector}",
            );
        }

        $onFill = contrastRatio($tokens['primary-strong'], $tokens['primary']);
        expect($onFill)->toBeLessThan(
            4.5,
            'If --primary-strong now clears AA on --primary, the banner comment explaining why it cannot is stale',
        );
    }
});
