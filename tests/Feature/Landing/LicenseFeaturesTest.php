<?php

use PHPUnit\Framework\Assert;

/**
 * The paid surface, as readers meet it on the pricing page.
 *
 * The failure this file exists to catch is the one that shipped: the app gates
 * ten features, eight Starter and two Team (`ProFeature.swift`), and this site
 * once named four of them and said "a license adds four things". Compare &
 * Sync, Query Insights, Result Charts and Linked Folders appeared nowhere on
 * the domain. Data Rewind went missing the same way in 2026-09.
 *
 * The list is data now (resources/data/paid-features.json, pinned against the
 * app by Data/PaidFeaturesDataTest), with each feature's line in each language
 * (content/{locale}/paid-features.json), rendered by one table. What is left
 * here is that the table renders every feature, once, in both languages, and
 * that each line stays short enough to sit in a table cell.
 */

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

it('carries every feature the app gates, split the way the app splits them', function (): void {
    $features = licenseFeatureList();

    expect($features)->toHaveCount(10, 'ProFeature has ten cases; paid-features.json must list all ten');

    $tiers = array_count_values(array_column($features, 'tier'));

    expect($tiers['starter'] ?? 0)->toBe(8);
    expect($tiers['team'] ?? 0)->toBe(2);

    expect(array_column($features, 'name'))->toBe([
        'Compare & Sync',
        'Query Insights',
        'Result Charts',
        'Data Rewind',
        'iCloud Sync',
        'Linked Folders',
        'Encrypted Export',
        'Environment Variables',
        'Team Catalog',
        'Team Library',
    ]);
});

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
    /*
     * The detail renders under the feature's name in the first column of a
     * four-column table. Past about eighteen words it stops being a label and
     * wraps into a paragraph on a phone; the feature's own page says the rest.
     */
    foreach (licenseFeatureCopy('en') as $id => $lines) {
        expect(str_word_count($lines['detail']))->toBeLessThanOrEqual(18, "{$id}: {$lines['detail']}");
    }
});

it('never says how many features a license adds', function (): void {
    /*
     * A typed count is what went stale twice. The table renders the list; no
     * sentence counts it.
     */
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
    $html = html_entity_decode(ssrHtml($path), ENT_QUOTES | ENT_HTML5);

    $start = strpos($html, '<table');
    $end = strpos($html, '</table>', (int) $start);

    expect($start)->not->toBeFalse('/pricing renders the plan table');

    $table = substr($html, (int) $start, (int) $end - (int) $start);
    $copy = licenseFeatureCopy($locale);

    foreach (licenseFeatureList() as $feature) {
        /*
         * Decoded first, because React escapes the ampersand in "Compare &
         * Sync", and a needle with a literal `&` would match nothing.
         */
        expect(substr_count($table, '>' . $feature['name'] . '<'))->toBe(1, "\"{$feature['name']}\" should be named exactly once in the table");
        expect($table)->toContain($copy[$feature['id']]['detail']);
    }

    // "Included" and "Not included" in words, never a mark alone.
    expect($table)->toContain($locale === 'vi' ? 'Không có' : 'Not included');
})->with([
    'English' => ['/pricing', 'en'],
    'Vietnamese' => ['/vi/pricing', 'vi'],
])->group('ssr');
