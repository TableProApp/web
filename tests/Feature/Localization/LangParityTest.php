<?php

use Illuminate\Support\Arr;

/**
 * The PHP strings in lang/ (OG card labels, the static error pages).
 *
 * Every locale has the same files, the same keys and the same `:placeholders`
 * as English, and its text is NFC, so a Vietnamese string never ships with a
 * decomposed diacritic that renders as two glyphs.
 */
function langFiles(string $locale): array
{
    $files = array_map('basename', glob(lang_path("{$locale}/*.php")) ?: []);
    sort($files);

    return $files;
}

/**
 * @return array<string, string>
 */
function langStrings(string $locale, string $file): array
{
    return array_filter(Arr::dot(require lang_path("{$locale}/{$file}")), 'is_string');
}

/**
 * @return list<string>
 */
function langPlaceholders(string $text): array
{
    preg_match_all('/:([a-z_]+)/i', $text, $matches);
    $names = array_values(array_unique($matches[1]));
    sort($names);

    return $names;
}

it('has the same files in every locale', function (): void {
    expect(langFiles('en'))->not->toBeEmpty();

    foreach (array_diff(scandir(lang_path()), ['.', '..']) as $locale) {
        expect(langFiles($locale))->toBe(langFiles('en'), "lang/{$locale} and lang/en hold different files");
    }
});

it('has the same keys and placeholders in every locale', function (): void {
    foreach (array_diff(scandir(lang_path()), ['.', '..', 'en']) as $locale) {
        foreach (langFiles('en') as $file) {
            $english = langStrings('en', $file);
            $translated = langStrings($locale, $file);

            expect(array_keys($translated))->toBe(array_keys($english), "lang/{$locale}/{$file} keys differ");

            foreach ($english as $key => $text) {
                expect(langPlaceholders($translated[$key]))->toBe(
                    langPlaceholders($text),
                    "lang/{$locale}/{$file} {$key} has different placeholders",
                );
                expect(trim($translated[$key]))->not->toBe('', "lang/{$locale}/{$file} {$key} is empty");
            }
        }
    }
});

it('stores every translation in NFC', function (): void {
    foreach (glob(lang_path('*/*.php')) ?: [] as $path) {
        $source = (string) file_get_contents($path);

        expect(Normalizer::isNormalized($source, Normalizer::FORM_C))->toBeTrue("{$path} is not NFC");
    }
});
