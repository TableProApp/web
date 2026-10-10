<?php

use PHPUnit\Framework\Assert;

// The account app keeps a copy of this test against the same tokens.css.

/**
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
 * @param  array{float, float, float}  $oklch
 * @return array{float, float, float}
 */
function contrastOklchToLinear(array $oklch): array
{
    // Linear and unclipped, deliberately: a gamma transfer here once reported every colour as high contrast.
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

/** @return array{int, int, int} */
function contrastHex(string $hex): array
{
    return array_map('hexdec', str_split(ltrim($hex, '#'), 2));
}

/** @param  array{int, int, int}  $rgb */
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

function contrastBetween(string $selector, string $foreground, string $background): float
{
    $tokens = contrastTokens($selector);

    Assert::assertArrayHasKey($foreground, $tokens, "tokens.css {$selector} declares no --{$foreground}");
    Assert::assertArrayHasKey($background, $tokens, "tokens.css {$selector} declares no --{$background}");

    return contrastRatioOf(contrastSrgb8($tokens[$foreground]), contrastSrgb8($tokens[$background]));
}

it('measures ratios this project already knows the answer to', function (): void {
    expect(round(contrastRatioOf([0, 0, 0], [255, 255, 255]), 2))->toBe(21.0);
    expect(round(contrastRatioOf(contrastHex('#777777'), contrastHex('#ffffff')), 2))->toBe(4.48);

    // The old site's measured values: muted at L 0.52, and the old text accent at hue 45.
    expect(round(contrastRatioOf(contrastSrgb8([0.52, 0.0, 0.0]), [255, 255, 255]), 2))->toBe(5.49);
    expect(round(contrastRatioOf(contrastSrgb8([0.52, 0.148, 45.0]), [255, 255, 255]), 2))->toBe(5.86);
});

// Design-system §2.3: foreground, background, threshold, and the ratio recorded for light and dark.
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
    // In dark, `--raised` is darker than the `--surface-strong` track, so a raised segment once read as pressed in.
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
    // Text uses `--accent-text`, and a mark that signals state alone `--accent-indicator`.
    expect(round(contrastBetween(':root', 'accent', 'background'), 2))->toBe(2.62);
    expect(contrastBetween(':root', 'accent', 'background'))->toBeLessThan(4.5);
});

it('keeps code legible on the ground code blocks use', function (): void {
    // Phiki's comment greys; the light one fails on `--surface`, which is why code blocks sit on `--raised`.
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
    // The old `--primary-foreground` was outside by a hair; the check proves it would be caught.
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
    // The owner's decision; the old text accent had drifted to 45 in light and 58 in dark.
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
    // Changing the ground without the head partial leaves the browser toolbar a different colour from the page.
    $partial = file_get_contents(base_path('resources/views/partials/head-theme.blade.php'));

    foreach ([':root' => 'light', '.dark' => 'dark'] as $selector => $theme) {
        $hex = vsprintf('#%02x%02x%02x', contrastSrgb8(contrastTokens($selector)['background']));

        expect($partial)->toContain($hex);
        expect(file_get_contents(base_path('resources/js/lib/theme.ts')))->toContain("{$theme}: '{$hex}'");
    }
});
