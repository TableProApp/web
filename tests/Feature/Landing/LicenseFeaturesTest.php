<?php

use PHPUnit\Framework\Assert;

/**
 * @return list<array{id: string, name: string, tier: string}>
 */
function licenseFeatureList(): array
{
    return json_decode((string) file_get_contents(resource_path('data/paid-features.json')), true, 512, JSON_THROW_ON_ERROR);
}

/**
 * @return array<string, array{detail: string, lapse: string}>
 */
function licenseFeatureCopy(string $locale): array
{
    return json_decode((string) file_get_contents(resource_path("data/content/{$locale}/paid-features.json")), true, 512, JSON_THROW_ON_ERROR);
}

it('describes every feature in both languages, and nothing that is not one', function (string $locale): void {
    $ids = array_column(licenseFeatureList(), 'id');
    $copy = licenseFeatureCopy($locale);

    expect(array_keys($copy))->toBe($ids, "content/{$locale}/paid-features.json must follow paid-features.json, in its order");

    foreach ($copy as $id => $lines) {
        expect(array_keys($lines))->toBe(['detail', 'lapse'], "{$locale}: {$id}");
        expect(trim($lines['detail']))->not->toBe('');
        expect(trim($lines['lapse']))->not->toBe('');
    }
})->with(['en', 'vi']);

it('keeps every English line short enough for a table cell', function (): void {
    // Past about eighteen words the first column of the four-column table wraps into a paragraph on a phone.
    foreach (licenseFeatureCopy('en') as $id => $lines) {
        expect(str_word_count($lines['detail']))->toBeLessThanOrEqual(18, "{$id}: {$lines['detail']}");
    }
});

it('never says how many features a license adds', function (): void {
    foreach (['en', 'vi'] as $locale) {
        $sources = [
            resource_path("data/content/{$locale}/pricing.json"),
            resource_path("data/content/{$locale}/paid-features.json"),
            resource_path("js/i18n/messages/{$locale}/pricing.ts"),
        ];

        foreach ($sources as $source) {
            $text = (string) preg_replace(['#/\*.*?\*/#s', '#(?<![:\'"])//[^\n]*#'], '', (string) file_get_contents($source));

            Assert::assertDoesNotMatchRegularExpression(
                '/\b(\d+|four|eight|nine|ten|two|bốn|tám|chín|mười|hai)\s+(paid\s+)?(features|things|tính năng)\b/iu',
                $text,
                basename($source) . " ({$locale}) counts the paid features",
            );
        }
    }
});

it('names every paid feature once in the plan table, with its line, in both languages', function (string $path, string $locale): void {
    // React escapes the ampersand in "Compare & Sync".
    $html = html_entity_decode(ssrHtml($path), ENT_QUOTES | ENT_HTML5);

    $start = strpos($html, '<table');
    $end = strpos($html, '</table>', (int) $start);

    expect($start)->not->toBeFalse('/pricing renders the plan table');

    $table = substr($html, (int) $start, (int) $end - (int) $start);
    $copy = licenseFeatureCopy($locale);

    foreach (licenseFeatureList() as $feature) {
        expect(substr_count($table, '>' . $feature['name'] . '<'))->toBe(1, "\"{$feature['name']}\" should be named exactly once in the table");
        expect($table)->toContain($copy[$feature['id']]['detail']);
    }

    // "Included" and "Not included" in words, never a mark alone.
    expect($table)->toContain($locale === 'vi' ? 'Không có' : 'Not included');
})->with([
    'English' => ['/pricing', 'en'],
    'Vietnamese' => ['/vi/pricing', 'vi'],
])->group('ssr');
