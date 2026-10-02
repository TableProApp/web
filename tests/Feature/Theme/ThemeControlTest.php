<?php

use PHPUnit\Framework\Assert;

/**
 * The theme control: Light, Dark and System, in the header as a menu and in
 * the footer and mobile menu as a segmented control (design-system §5.3.16).
 *
 * The control is one file shared byte for byte with the account app, so it
 * takes its words as props and imports nothing app-specific. Its server markup
 * must not depend on the theme, which the server cannot know: the icon and the
 * selected segment are drawn from `html[data-theme-choice]`, which the head
 * script sets before paint.
 */

function themeControlSource(): string
{
    return (string) file_get_contents(resource_path('js/components/shared/theme-control.tsx'));
}

/** The `controls.theme` strings of one locale, parsed from its catalog. @return array<string, string> */
function themeLabels(string $locale): array
{
    $source = (string) file_get_contents(resource_path("js/i18n/messages/{$locale}/controls.ts"));

    preg_match('/theme: \{(.*?)\},/s', $source, $block);
    preg_match_all("/(\w+): '([^']+)'/", $block[1] ?? '', $pairs, PREG_SET_ORDER);

    return collect($pairs)->mapWithKeys(static fn(array $pair): array => [$pair[1] => $pair[2]])->all();
}

it('uses the glossary words in both languages', function (): void {
    expect(themeLabels('en'))->toBe([
        'label' => 'Theme',
        'current' => 'Theme: {choice}',
        'light' => 'Light',
        'dark' => 'Dark',
        'system' => 'System',
    ]);

    expect(themeLabels('vi'))->toBe([
        'label' => 'Giao diện',
        'current' => 'Giao diện: {choice}',
        'light' => 'Sáng',
        'dark' => 'Tối',
        'system' => 'Theo hệ thống',
    ]);
});

it('takes every word as a prop and imports only shared modules', function (): void {
    $source = themeControlSource();

    preg_match_all("/from '([^']+)'/", $source, $imports);

    expect($imports[1])->toEqualCanonicalizing(['react', 'lucide-react', '@/lib/theme', '@/lib/utils']);
    expect($source)->not->toContain('useI18n')->not->toContain('usePage');

    // No literal label: everything visible or announced arrives through `labels`.
    foreach (['Light', 'Dark', 'System', 'Theme'] as $word) {
        expect($source)->not->toMatch("/>\s*{$word}\s*</");
    }
});

it('offers three radio choices in the menu and three radios in the segmented form', function (): void {
    $source = themeControlSource();

    expect($source)->toContain('role="menuitemradio"')
        ->toContain('aria-checked={checked}')
        ->toContain('aria-haspopup="menu"')
        ->toContain('type="radio"')
        ->toContain('<legend className="sr-only">{labels.label}</legend>');

    // Escape closes the menu and returns focus to its button.
    expect($source)->toMatch("/event\.key === 'Escape'\) \{\s*event\.preventDefault\(\);\s*setOpen\(false\);\s*trigger\.current\?\.focus\(\);/");
});

it('draws the current choice from the head script\'s attribute, so the first paint is right', function (): void {
    $tokens = (string) file_get_contents(resource_path('css/tokens.css'));

    foreach (['light', 'dark', 'system'] as $choice) {
        expect($tokens)->toContain("[data-theme-choice=\"{$choice}\"] .theme-choice-icon[data-choice=\"{$choice}\"]")
            ->toContain("[data-theme-choice=\"{$choice}\"] .theme-segment[data-theme-option=\"{$choice}\"]");
    }

    // With no attribute at all (no script ran), light is drawn, matching the default.
    expect($tokens)->toContain(':root:not([data-theme-choice]) .theme-choice-icon[data-choice="light"]');
});

it('puts the menu in the header and the segmented form in the footer and the mobile menu', function (): void {
    $read = static fn(string $file): string => (string) file_get_contents(resource_path("js/components/site/{$file}"));

    expect($read('site-header.tsx'))->toContain('<ThemeControl variant="menu" labels={m.controls.theme} />');
    expect($read('site-footer.tsx'))->toContain('<ThemeControl variant="segmented" labels={m.controls.theme} />');
    expect($read('mobile-nav.tsx'))->toContain('<ThemeControl variant="segmented" labels={m.controls.theme} />');
});

it('renders the same markup whatever the theme, named in the page language', function (string $path, string $locale): void {
    $html = ssrHtml($path);
    $labels = themeLabels($locale);

    // The header button: named "Theme" until the choice is known after mount, with all three icons present.
    Assert::assertMatchesRegularExpression(
        '/<button[^>]*aria-label="' . preg_quote($labels['label'], '/') . '"[^>]*aria-haspopup="menu"/u',
        $html,
        "{$path}: the header theme button must be named in the page language",
    );

    foreach (['light', 'dark', 'system'] as $choice) {
        Assert::assertStringContainsString("data-choice=\"{$choice}\"", $html);
        Assert::assertStringContainsString("data-theme-option=\"{$choice}\"", $html);
        Assert::assertStringContainsString('>' . $labels[$choice] . '</label>', $html, "{$path}: the {$choice} segment must be labelled in the page language");
    }

    // The server cannot know the stored theme, so it renders light as checked, like the head script's default.
    // Each radio is read whole, because React places `checked` before `value`.
    preg_match_all('/<input type="radio"[^>]*>/', $html, $radios);

    $checked = array_values(array_filter($radios[0], static fn(string $radio): bool => str_contains($radio, 'checked=""')));

    Assert::assertNotEmpty($checked, "{$path}: no theme option is checked");

    foreach ($checked as $radio) {
        Assert::assertStringContainsString('value="light"', $radio, "{$path}: only light may be checked on the server");
    }
    Assert::assertDoesNotMatchRegularExpression('/<html[^>]*class="[^"]*\bdark\b/', $html, 'The server never paints dark; the head script does');
})->with([
    'English' => ['/download', 'en'],
    'Vietnamese' => ['/vi/download', 'vi'],
]);
