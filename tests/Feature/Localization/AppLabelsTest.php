<?php

use Illuminate\Support\Arr;

const APP_LABELS_CONTENT = __DIR__ . '/../../../resources/data/content';

/**
 * @return list<string>
 */
function appLabelsFiles(): array
{
    $root = APP_LABELS_CONTENT . '/en';
    $files = [];

    foreach (new RecursiveIteratorIterator(new RecursiveDirectoryIterator($root, FilesystemIterator::SKIP_DOTS)) as $file) {
        $files[] = substr($file->getPathname(), strlen($root) + 1);
    }

    sort($files);

    return $files;
}

/**
 * @return array<string, mixed>
 */
function appLabelsCopy(string $locale, string $file): array
{
    return Arr::dot(json_decode((string) file_get_contents(APP_LABELS_CONTENT . "/{$locale}/{$file}"), true, 512, JSON_THROW_ON_ERROR));
}

/**
 * Each <ui> label of a string with the text that follows its closing tag.
 *
 * @return list<array{label: string, after: string}>
 */
function appLabelsIn(string $text): array
{
    preg_match_all('#<ui>(.*?)</ui>#u', $text, $matches, PREG_OFFSET_CAPTURE);

    return array_map(
        fn(array $whole, array $label): array => ['label' => $label[0], 'after' => substr($text, $whole[1] + strlen($whole[0]))],
        $matches[0],
        $matches[1],
    );
}

/**
 * Whether the English label follows in parentheses: "(Settings > License)", or "(Preview SQL, ⌘⇧P)".
 */
function appLabelsGlossed(string $after, string $english): bool
{
    return preg_match('/^\s?[(（]' . preg_quote($english, '/') . '[)）,，]/u', $after) === 1;
}

/**
 * @return list<string>
 */
function appLabelsLocales(): array
{
    $locales = json_decode((string) file_get_contents(__DIR__ . '/../../../resources/data/locales.json'), true)['supported'];

    return array_values(array_diff(array_keys($locales), ['en', 'vi']));
}

// Labels the legal pages print inside a sentence. The others are bold spans of their own.
const APP_LABELS_LEGAL_INLINE = ['Share Usage Data', 'Send telemetry to GitHub'];

/**
 * @return list<string>
 */
function appLabelsLegalLines(string $locale, string $document): array
{
    return explode("\n", (string) file_get_contents(__DIR__ . "/../../../resources/data/legal/{$locale}/{$document}.md"));
}

/**
 * The bold spans of a legal line.
 *
 * @return list<string>
 */
function appLabelsLegalBold(string $line): array
{
    preg_match_all('/\*\*(.+?)\*\*/u', $line, $matches);

    return $matches[1];
}

/**
 * The app labels an English legal line names.
 *
 * @param  array<string, array<string, string>>  $known
 * @return list<string>
 */
function appLabelsOnLegalLine(string $line, array $known): array
{
    return [
        ...array_filter(appLabelsLegalBold($line), fn(string $text): bool => array_key_exists($text, $known)),
        ...array_filter(APP_LABELS_LEGAL_INLINE, fn(string $label): bool => str_contains($line, $label)),
    ];
}

it('knows the app’s wording for every label the English copy names', function (): void {
    $known = require base_path('tests/Support/app-ui-labels.php');
    $missing = [];

    foreach (appLabelsFiles() as $file) {
        foreach (appLabelsCopy('en', $file) as $key => $value) {
            foreach (is_string($value) ? appLabelsIn($value) : [] as $found) {
                if (! array_key_exists($found['label'], $known)) {
                    $missing[] = "content/en/{$file} {$key}: <ui>{$found['label']}</ui>";
                }
            }
        }
    }

    expect(count($known))->toBeGreaterThan(50)
        ->and($missing)->toBe([], "Add these labels to tests/Support/app-ui-labels.php with the app's wording, or [] when the app shows English:\n  " . implode("\n  ", $missing));
});

it('shows each label as the app does in that language, with the English label after a translated one', function (string $locale): void {
    $known = require base_path('tests/Support/app-ui-labels.php');
    $offences = [];

    foreach (appLabelsFiles() as $file) {
        $translated = appLabelsCopy($locale, $file);

        foreach (appLabelsCopy('en', $file) as $key => $value) {
            $source = is_string($value) ? appLabelsIn($value) : [];

            if ($source === []) {
                continue;
            }

            $target = appLabelsIn((string) $translated[$key]);

            if (count($target) !== count($source)) {
                $offences[] = "{$file} {$key}: " . count($target) . ' labels, the English has ' . count($source);

                continue;
            }

            foreach ($source as $index => $english) {
                $expected = $known[$english['label']][$locale] ?? $english['label'];
                $shown = $target[$index];

                if ($shown['label'] !== $expected) {
                    $offences[] = "{$file} {$key}: <ui>{$shown['label']}</ui> should be <ui>{$expected}</ui>";
                } elseif ($expected !== $english['label'] && ! appLabelsGlossed($shown['after'], $english['label'])) {
                    $offences[] = "{$file} {$key}: <ui>{$expected}</ui> needs ({$english['label']}) after it";
                }
            }
        }
    }

    expect($offences)->toBe([], "content/{$locale}:\n  " . implode("\n  ", $offences));
})->with(appLabelsLocales());

it('gives a Vietnamese label its English label in parentheses at least once per page', function (): void {
    $offences = [];

    foreach (appLabelsFiles() as $file) {
        $glossed = [];
        $bare = [];

        foreach (appLabelsCopy('vi', $file) as $key => $value) {
            foreach (is_string($value) ? appLabelsIn($value) : [] as $found) {
                if (preg_match('/[^\x00-\x7F…]/u', $found['label']) !== 1) {
                    continue;
                }

                // "<ui>Nhập</ui> (Import)" and "<ui>Thêm dòng (Add Row)</ui>" both carry the English label.
                $name = preg_replace('/\s*\([^()]*\)$/u', '', $found['label']);

                if (preg_match('/\([A-Za-z][^()]*\)$/u', $found['label']) === 1 || preg_match('/^\s?\([A-Za-z]/u', $found['after']) === 1) {
                    $glossed[$name] = true;
                } else {
                    $bare[$name] = "{$file} {$key}: <ui>{$found['label']}</ui>";
                }
            }
        }

        array_push($offences, ...array_values(array_diff_key($bare, $glossed)));
    }

    expect($offences)->toBe([], "content/vi:\n  " . implode("\n  ", $offences));
});

it('knows the app’s wording for every menu path the English legal pages name', function (string $document): void {
    $known = require base_path('tests/Support/app-ui-labels.php');
    $paths = [];

    foreach (appLabelsLegalLines('en', $document) as $line) {
        array_push($paths, ...array_filter(appLabelsLegalBold($line), fn(string $text): bool => str_contains($text, ' > ')));
    }

    expect(array_values(array_diff($paths, array_keys($known))))->toBe([]);

    foreach (APP_LABELS_LEGAL_INLINE as $label) {
        expect($known)->toHaveKey($label);
    }
})->with(['privacy', 'terms', 'refund-policy']);

it('shows each label on the legal pages as the app does in that language, with the English label after a translated one', function (string $locale): void {
    $known = require base_path('tests/Support/app-ui-labels.php');
    $offences = [];
    $checked = 0;

    foreach (['privacy', 'terms', 'refund-policy'] as $document) {
        $translated = appLabelsLegalLines($locale, $document);

        foreach (appLabelsLegalLines('en', $document) as $index => $line) {
            foreach (appLabelsOnLegalLine($line, $known) as $label) {
                $shown = $translated[$index] ?? '';
                $expected = $known[$label][$locale] ?? $label;
                $where = "{$document}.md:" . ($index + 1);
                $checked++;

                if ($locale === 'vi') {
                    // The fixture has no Vietnamese wording: the page gives the app's label and the English one after it.
                    if (! str_contains($shown, "({$label})")) {
                        $offences[] = "{$where}: ({$label}) should follow the app's label";
                    }
                } elseif ($expected === $label) {
                    if (preg_match('/(?<![(（])' . preg_quote($label, '/') . '/u', $shown) !== 1) {
                        $offences[] = "{$where}: {$label} should stay as the app shows it";
                    }
                } elseif (preg_match('/' . preg_quote($expected, '/') . '(?:\*\*|[»”」"\s\x{00A0}\x{202F}])*[(（]' . preg_quote($label, '/') . '[)）]/u', $shown) !== 1) {
                    $offences[] = "{$where}: should read {$expected} ({$label})";
                }
            }
        }
    }

    expect($checked)->toBeGreaterThan(10)
        ->and($offences)->toBe([], "legal/{$locale}:\n  " . implode("\n  ", $offences));
})->with(array_values(array_diff(array_keys(json_decode((string) file_get_contents(__DIR__ . '/../../../resources/data/locales.json'), true)['supported']), ['en'])));

it('tells a glossed label from a bare one', function (string $after, bool $glossed): void {
    expect(appLabelsGlossed($after, 'Preview SQL'))->toBe($glossed);
})->with([
    [' (Preview SQL) lists the statements', true],
    ['(Preview SQL)를 누르세요', true],
    ['（Preview SQL）列出语句', true],
    ['（Preview SQL，<kbd>⌘⇧P</kbd>）', true],
    [' lists the statements', false],
    [' (<kbd>⌘⇧P</kbd>) lists the statements', false],
    [' (Preview)', false],
]);
