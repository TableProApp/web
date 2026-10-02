<?php

use PHPUnit\Framework\Assert;

/**
 * Contrast, computed from the tokens `tokens.css` actually declares.
 *
 * Written after the second contrast defect in this project. The first was a
 * helper that applied the sRGB gamma transfer twice and reported
 * `--muted-foreground` at 14:1 when it was 4.73:1, caught only because
 * `--foreground` came out at 14:1 as well, which is impossible. The second was
 * a mark on the brand fill at 6.18:1: it cleared AA, so nothing complained, and
 * it still read flat because the mark and the fill share hue 55.
 *
 * Neither is visible in source. Both are arithmetic, so this file does the
 * arithmetic: it parses the light (`:root`) and dark (`.dark`) blocks of the
 * shared `resources/css/tokens.css`, renders each token to the 8-bit sRGB
 * colour a browser paints, and checks every pair the design system computed
 * (design-system §2.3, method in its Appendix A). The account app keeps a copy
 * of this test against the same, byte-identical file.
 *
 * Each pair is held twice: to its threshold (4.5:1 for text at every size, 3:1
 * for non-text UI and focus), and to the value the design system recorded. The
 * second catches a token that drifts while still passing, which is how a
 * documented ratio quietly stops being true.
 *
 * @see resources/css/tokens.css
 * @see docs/rebuild/design/design-system.md §2.2-§2.5, Appendix A
 */

/**
 * The `--token: oklch(L C H)` declarations in one block of tokens.css, with
 * `var(--other)` aliases resolved within the same block. Alpha tokens (the
 * overlay) are skipped: they carry no text.
 *
 * @return array<string, array{float, float, float}>
 */
function contrastTokens(string $selector): array
{
    $css = file_get_contents(base_path('resources/css/tokens.css'));

    $start = strpos($css, "\n{$selector} {");
    Assert::assertNotFalse($start, "tokens.css has no {$selector} block");

    $block = substr($css, $start, strpos($css, "\n}", $start) - $start);

    preg_match_all('/--([a-z-]+):\s*oklch\(([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\);/', $block, $colours, PREG_SET_ORDER);

    $tokens = [];

    foreach ($colours as $colour) {
        $tokens[$colour[1]] = [(float) $colour[2], (float) $colour[3], (float) $colour[4]];
    }

    preg_match_all('/--([a-z-]+):\s*var\(--([a-z-]+)\);/', $block, $aliases, PREG_SET_ORDER);

    foreach ($aliases as $alias) {
        if (isset($tokens[$alias[2]])) {
            $tokens[$alias[1]] = $tokens[$alias[2]];
        }
    }

    return $tokens;
}

/**
 * oklch to linear-light sRGB, unclipped, so the gamut check can see a channel
 * outside [0, 1].
 *
 * Linear, deliberately. Relative luminance is defined on linear values, and
 * running them through the gamma transfer first is precisely the bug that once
 * reported every colour on this site as high contrast.
 *
 * @param  array{float, float, float}  $oklch
 * @return array{float, float, float}
 */
function contrastOklchToLinear(array $oklch): array
{
    [$lightness, $chroma, $hue] = $oklch;

    $h = deg2rad($hue);
    $a = $chroma * cos($h);
    $b = $chroma * sin($h);

    $l = ($lightness + 0.3963377774 * $a + 0.2158037573 * $b) ** 3;
    $m = ($lightness - 0.1055613458 * $a - 0.0638541728 * $b) ** 3;
    $s = ($lightness - 0.0894841775 * $a - 1.2914855480 * $b) ** 3;

    return [
        4.0767416621 * $l - 3.3077115913 * $m + 0.2309699292 * $s,
        -1.2684380046 * $l + 2.6097574011 * $m - 0.3413193965 * $s,
        -0.0041960863 * $l - 0.7034186147 * $m + 1.7076147010 * $s,
    ];
}

/**
 * The 8-bit sRGB colour a browser paints for a token: clip, encode, round.
 *
 * @param  array{float, float, float}  $oklch
 * @return array{int, int, int}
 */
function contrastSrgb8(array $oklch): array
{
    return array_map(static function (float $channel): int {
        $channel = max(0.0, min(1.0, $channel));
        $encoded = $channel <= 0.0031308 ? 12.92 * $channel : 1.055 * $channel ** (1 / 2.4) - 0.055;

        return (int) round(255 * $encoded);
    }, contrastOklchToLinear($oklch));
}

/** `#rrggbb` to its 8-bit channels. @return array{int, int, int} */
function contrastHex(string $hex): array
{
    return array_map('hexdec', str_split(ltrim($hex, '#'), 2));
}

/** WCAG relative luminance of an 8-bit colour. @param  array{int, int, int}  $rgb */
function contrastLuminance(array $rgb): float
{
    [$r, $g, $b] = array_map(static function (int $channel): float {
        $c = $channel / 255;

        return $c <= 0.04045 ? $c / 12.92 : (($c + 0.055) / 1.055) ** 2.4;
    }, $rgb);

    return 0.2126 * $r + 0.7152 * $g + 0.0722 * $b;
}

/**
 * @param  array{int, int, int}  $a
 * @param  array{int, int, int}  $b
 */
function contrastRatioOf(array $a, array $b): float
{
    $la = contrastLuminance($a);
    $lb = contrastLuminance($b);

    return (max($la, $lb) + 0.05) / (min($la, $lb) + 0.05);
}

/** The ratio between two tokens of one theme block. */
function contrastBetween(string $selector, string $foreground, string $background): float
{
    $tokens = contrastTokens($selector);

    Assert::assertArrayHasKey($foreground, $tokens, "tokens.css {$selector} declares no --{$foreground}");
    Assert::assertArrayHasKey($background, $tokens, "tokens.css {$selector} declares no --{$background}");

    return contrastRatioOf(contrastSrgb8($tokens[$foreground]), contrastSrgb8($tokens[$background]));
}

it('measures ratios this project already knows the answer to', function (): void {
    /*
     * The helper is checked before anything is checked with it. Every
     * assertion below is only as good as these: black on white is 21:1, and
     * #777 on white is the textbook 4.48:1 that just fails AA.
     */
    expect(round(contrastRatioOf([0, 0, 0], [255, 255, 255]), 2))->toBe(21.0);
    expect(round(contrastRatioOf(contrastHex('#777777'), contrastHex('#ffffff')), 2))->toBe(4.48);

    // The old palette's values, reproduced from their oklch: muted at L 0.52
    // was 5.49:1 and the old text accent at hue 45 was 5.86:1 (the old site's
    // measured values; design-system §2.3, Appendix A).
    expect(round(contrastRatioOf(contrastSrgb8([0.52, 0.0, 0.0]), [255, 255, 255]), 2))->toBe(5.49);
    expect(round(contrastRatioOf(contrastSrgb8([0.52, 0.148, 45.0]), [255, 255, 255]), 2))->toBe(5.86);
});

/*
 * Every row of design-system §2.3: foreground token, background token, the
 * threshold it must clear, and the ratio recorded for light and dark.
 */
dataset('token pairs', [
    'body text' => ['foreground', 'background', 4.5, 19.80, 17.18],
    'text on a band' => ['foreground', 'surface', 4.5, 18.48, 16.29],
    'text on a card' => ['foreground', 'raised', 4.5, 19.80, 15.29],
    'text on the selected segment' => ['foreground', 'segment-selected', 4.5, 19.80, 10.76],
    'text on the current item' => ['foreground', 'accent-subtle', 4.5, 17.79, 14.33],
    'secondary text' => ['muted-foreground', 'background', 4.5, 6.01, 7.52],
    'secondary text on a band' => ['muted-foreground', 'surface', 4.5, 5.61, 7.12],
    'unselected segment, neutral badge' => ['muted-foreground', 'surface-strong', 4.5, 5.18, 6.38],
    'help text in a card' => ['muted-foreground', 'raised', 4.5, 6.01, 6.69],
    'meta text in a selected row' => ['muted-foreground', 'accent-subtle', 4.5, 5.40, 6.27],
    'standalone link' => ['accent-text', 'background', 4.5, 5.73, 9.70],
    'standalone link on a band' => ['accent-text', 'surface', 4.5, 5.35, 9.19],
    'standalone link in a menu' => ['accent-text', 'raised', 4.5, 5.73, 8.63],
    'accent badge' => ['accent-text', 'accent-subtle', 4.5, 5.15, 8.09],
    'primary button label' => ['accent-foreground', 'accent', 4.5, 7.42, 7.42],
    'primary button, hovered' => ['accent-foreground', 'accent-hover', 4.5, 8.29, 8.29],
    'primary button, pressed' => ['accent-foreground', 'accent-active', 4.5, 6.43, 6.43],
    'danger button' => ['danger-foreground', 'danger-fill', 4.5, 6.10, 6.10],
    'danger button, hovered' => ['danger-foreground', 'danger-fill-hover', 4.5, 7.22, 7.22],
    'success mark' => ['success', 'background', 4.5, 5.64, 9.92],
    'success mark on a band' => ['success', 'surface', 4.5, 5.26, 9.40],
    'success mark in a card' => ['success', 'raised', 4.5, 5.64, 8.83],
    'warning mark' => ['warning', 'background', 4.5, 6.11, 9.93],
    'warning mark on a band' => ['warning', 'surface', 4.5, 5.70, 9.41],
    'warning mark in a card' => ['warning', 'raised', 4.5, 6.11, 8.84],
    'field error' => ['danger', 'background', 4.5, 6.10, 7.05],
    'field error on a band' => ['danger', 'surface', 4.5, 5.69, 6.68],
    'field error in a card' => ['danger', 'raised', 4.5, 6.10, 6.27],
    'focus ring' => ['focus', 'background', 3.0, 5.73, 9.70],
    'focus ring on a band' => ['focus', 'surface', 3.0, 5.35, 9.19],
    'focus ring on a track' => ['focus', 'surface-strong', 3.0, 4.94, 8.23],
    'focus ring in a card' => ['focus', 'raised', 3.0, 5.73, 8.63],
    'control outline' => ['rule-strong', 'background', 3.0, 3.64, 3.84],
    'control outline on a band' => ['rule-strong', 'surface', 3.0, 3.40, 3.64],
    'control outline on a track' => ['rule-strong', 'surface-strong', 3.0, 3.14, 3.26],
    'control outline in a card' => ['rule-strong', 'raised', 3.0, 3.64, 3.42],
    'state indicator' => ['accent-indicator', 'background', 3.0, 3.84, 7.14],
    'state indicator on a band' => ['accent-indicator', 'surface', 3.0, 3.59, 6.77],
    'state indicator on a track' => ['accent-indicator', 'surface-strong', 3.0, 3.31, 6.07],
    'state indicator in a card' => ['accent-indicator', 'raised', 3.0, 3.84, 6.36],
    'state indicator beside the current item' => ['accent-indicator', 'accent-subtle', 3.0, 3.45, 5.96],
]);

it('clears its threshold, in both themes, at the ratio the design system recorded', function (string $foreground, string $background, float $threshold, float $light, float $dark): void {
    foreach ([':root' => $light, '.dark' => $dark] as $selector => $recorded) {
        $ratio = contrastBetween($selector, $foreground, $background);

        Assert::assertGreaterThanOrEqual(
            $threshold,
            $ratio,
            sprintf('--%s on --%s is %.2f:1 in %s; it needs %.1f:1', $foreground, $background, $ratio, $selector, $threshold),
        );

        Assert::assertSame(
            $recorded,
            round($ratio, 2),
            sprintf('--%s on --%s measures %.2f:1 in %s, but design-system §2.3 records %.2f:1. Update the table with the token, or put the token back.', $foreground, $background, $ratio, $selector, $recorded),
        );
    }
})->with('token pairs');

it('lifts the selected segment above its track in both themes', function (): void {
    /*
     * The checked segment of the billing cycle and theme controls is the only
     * thing that says which option is on besides the label colour. In dark,
     * `--raised` (0.235) is darker than the `--surface-strong` track (0.25),
     * so a raised segment read as pressed in: 1.03:1, the wrong way round.
     * `--segment-selected` has to be lighter than the track in both themes,
     * by a step the eye separates without the hairline.
     */
    foreach ([':root', '.dark'] as $selector) {
        $tokens = contrastTokens($selector);

        expect($tokens['segment-selected'][0])->toBeGreaterThan($tokens['surface-strong'][0]);
        expect(contrastBetween($selector, 'segment-selected', 'surface-strong'))->toBeGreaterThanOrEqual(1.05);
    }

    expect(round(contrastBetween('.dark', 'segment-selected', 'surface-strong'), 2))->toBe(1.36);

    // A disabled control sinks below an enabled one (`--raised`) in both themes.
    foreach ([':root', '.dark'] as $selector) {
        $tokens = contrastTokens($selector);

        expect($tokens['control-disabled'][0])->toBeLessThan($tokens['raised'][0]);
    }
});

it('never uses the brand fill as text in light', function (): void {
    /*
     * `--accent` is a fill. As text on white it is 2.62:1, which is why a
     * separate `--accent-text` exists, and why a coloured mark that signals
     * state alone uses `--accent-indicator` instead (design-system §2.3).
     */
    expect(round(contrastBetween(':root', 'accent', 'background'), 2))->toBe(2.62);
    expect(contrastBetween(':root', 'accent', 'background'))->toBeLessThan(4.5);
});

it('keeps code legible on the ground code blocks use', function (): void {
    /*
     * Phiki's lowest-contrast colours, the comment greys of github-light and
     * github-dark, against `--raised`. On `--surface` the light one fails at
     * 4.24:1, which is why code blocks sit on `--raised`.
     */
    $raisedLight = contrastSrgb8(contrastTokens(':root')['raised']);
    $raisedDark = contrastSrgb8(contrastTokens('.dark')['raised']);
    $surfaceLight = contrastSrgb8(contrastTokens(':root')['surface']);

    expect(round(contrastRatioOf(contrastHex('#6e7781'), $raisedLight), 2))->toBe(4.55);
    expect(round(contrastRatioOf(contrastHex('#8b949e'), $raisedDark), 2))->toBe(5.42);
    expect(contrastRatioOf(contrastHex('#6e7781'), $surfaceLight))->toBeLessThan(4.5);

    $css = file_get_contents(base_path('resources/css/tokens.css'));
    expect($css)->toMatch('/--code-background:\s*var\(--raised\);/');
});

it('keeps every colour token inside the sRGB gamut', function (): void {
    /*
     * A colour outside sRGB is clipped on an sRGB screen and drawn fuller on a
     * P3 one, so the same token becomes two colours and the computed ratio
     * holds for only one of them. The old `--primary-foreground`, oklch(0.16
     * 0.04 55), was outside by a hair (design-system §2.5); the check proves it
     * would be caught.
     */
    $outside = static fn(array $oklch): bool => collect(contrastOklchToLinear($oklch))
        ->contains(static fn(float $channel): bool => $channel < -1e-6 || $channel > 1 + 1e-6);

    expect($outside([0.16, 0.04, 55.0]))->toBeTrue();

    foreach ([':root', '.dark'] as $selector) {
        foreach (contrastTokens($selector) as $name => $oklch) {
            Assert::assertFalse($outside($oklch), "--{$name} in {$selector} is outside the sRGB gamut");
        }
    }
});

it('keeps every brand token on hue 55', function (): void {
    /*
     * The owner's decision (spec §0): keep brand hue 55; only contrast and
     * gamut may be refined. The old text accent had drifted to 45 in light and
     * 58 in dark.
     */
    foreach ([':root', '.dark'] as $selector) {
        foreach (contrastTokens($selector) as $name => [$lightness, $chroma, $hue]) {
            if (str_starts_with($name, 'accent') || $name === 'focus') {
                Assert::assertSame(55.0, $hue, "--{$name} in {$selector} is on hue {$hue}");
            }
        }
    }
});

it('keeps the neutrals achromatic', function (): void {
    foreach ([':root', '.dark'] as $selector) {
        foreach (['background', 'surface', 'surface-strong', 'raised', 'rule', 'rule-strong', 'foreground', 'muted-foreground'] as $name) {
            Assert::assertSame(0.0, contrastTokens($selector)[$name][1], "--{$name} in {$selector} carries chroma");
        }
    }
});

it('paints theme-color with the page background of each theme', function (): void {
    /*
     * The head partial sets one `theme-color` meta to `#ffffff` or `#121212`,
     * the two `--background` values. Changing the ground without the partial
     * leaves the browser's toolbar a different colour from the page.
     */
    $partial = file_get_contents(base_path('resources/views/partials/head-theme.blade.php'));

    foreach ([':root' => 'light', '.dark' => 'dark'] as $selector => $theme) {
        $hex = vsprintf('#%02x%02x%02x', contrastSrgb8(contrastTokens($selector)['background']));

        expect($partial)->toContain($hex);
        expect(file_get_contents(base_path('resources/js/lib/theme.ts')))->toContain("{$theme}: '{$hex}'");
    }
});
