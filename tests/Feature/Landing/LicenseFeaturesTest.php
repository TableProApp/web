<?php

use PHPUnit\Framework\Assert;

/**
 * The paid surface, and how much reading the homepage asks for.
 *
 * Two failures this file exists to catch. The first is the one that shipped:
 * `ProFeature.swift` in the app gates nine features, seven Starter and two
 * Team, and this site named four of them and said "a license adds four things"
 * in two places. Compare & Sync, Query Insights, Result Charts and Linked
 * Folders appeared nowhere on the domain.
 *
 * The second is the reason that copy grew wrong in the first place: the paid
 * list was written into prose in three files, so keeping it true meant editing
 * three paragraphs. It is a data file rendered by one table now, and the
 * assertions below are what keep it that way.
 */

/** @return list<array{name: string, detail: string, tier: string}> */
function paidFeatures(): array
{
    $source = file_get_contents(base_path('resources/js/data/license.ts'));

    preg_match_all(
        "/name:\s*'((?:[^'\\\\]|\\\\.)*)',\s*\n\s*detail:\s*'((?:[^'\\\\]|\\\\.)*)',\s*\n\s*tier:\s*'(starter|team)'/",
        $source,
        $matches,
        PREG_SET_ORDER,
    );

    return array_map(
        static fn(array $match): array => [
            'name' => stripslashes($match[1]),
            'detail' => stripslashes($match[2]),
            'tier' => $match[3],
        ],
        $matches,
    );
}

it('carries every feature the app gates, split the way the app splits them', function (): void {
    $features = paidFeatures();

    /*
     * Nine, seven, two. Taken from `ProFeature.swift`: `requiredTier` returns
     * `.starter` for iCloudSync, encryptedExport, envVarReferences,
     * linkedFolders, queryInsights, resultCharts and compareSync, and `.team`
     * for teamCatalog and teamLibrary.
     *
     * Nothing in this repository can read that enum, so these counts are the
     * whole guard: adding a case there and forgetting this file fails here.
     */
    expect($features)->toHaveCount(9, 'ProFeature has nine cases; license.ts must list all nine');

    $tiers = array_count_values(array_column($features, 'tier'));

    expect($tiers['starter'] ?? 0)->toBe(7);
    expect($tiers['team'] ?? 0)->toBe(2);

    // Names are `ProFeature.displayName` verbatim, so the app's paywall overlay
    // and this table cannot end up calling one feature two things.
    expect(array_column($features, 'name'))->toBe([
        'Compare & Sync',
        'Query Insights',
        'Result Charts',
        'iCloud Sync',
        'Linked Folders',
        'Encrypted Export',
        'Environment Variables',
        'Team Catalog',
        'Team Library',
    ]);
});

it('keeps every paid feature to one line', function (): void {
    /*
     * The detail renders in a table cell beside three availability columns.
     * Fourteen words is where it stops being a label and starts being prose,
     * and a matrix nobody can scan is worth less than no matrix.
     */
    foreach (paidFeatures() as $feature) {
        expect(str_word_count($feature['detail']))
            ->toBeLessThanOrEqual(14, "\"{$feature['name']}\" needs {$feature['detail']}");
    }
});

it('never revives the claim that a license adds four things', function (): void {
    /*
     * The exact sentence that was live in the pricing lede and in the FAQ.
     * `Assert::assertStringNotContainsString`, not `->not->toContain($needle,
     * $message)`: Pest's toContain is variadic with no message parameter, so
     * the message lands as a second needle and `not` passes the moment either
     * one is absent. Two blocks in StaleClaimsTest were green for their whole
     * lives that way.
     */
    foreach (['resources/js/data/faqs.ts', 'resources/js/components/landing/pricing.tsx'] as $source) {
        $contents = file_get_contents(base_path($source));

        // Comments stripped: both files carry a docblock explaining why the
        // claim was wrong, and a bare needle matches the explanation too.
        $code = preg_replace(['#/\*[\s\S]*?\*/#', '#//.*$#m'], '', $contents);

        Assert::assertStringNotContainsString(
            'adds four things',
            $code,
            "{$source} says a license adds four things; ProFeature gates nine",
        );
    }
});

it('names every paid feature on the homepage, once', function (): void {
    $html = html_entity_decode(ssrHtml('/'), ENT_QUOTES | ENT_HTML5);

    $start = strpos($html, '<main');
    $main = substr($html, $start, strrpos($html, '</main>') - $start);

    foreach (paidFeatures() as $feature) {
        /*
         * Exactly one render site each. Decoded first, because React escapes
         * the ampersand in "Compare & Sync" and a needle carrying a literal `&`
         * matches nothing — which would make this assertion pass for a page
         * that names none of them.
         */
        expect(substr_count($main, $feature['name']))->toBe(
            1,
            "\"{$feature['name']}\" should be named exactly once on the homepage",
        );

        expect($main)->toContain($feature['detail']);
    }
});

it('holds the homepage to a reading budget', function (): void {
    $html = ssrHtml('/');

    $start = strpos($html, '<main');
    $main = substr($html, $start, strrpos($html, '</main>') - $start);
    $main = preg_replace(['#<script[\s\S]*?</script>#', '#<svg[\s\S]*?</svg>#'], ' ', $main);

    /*
     * Prose only: the words inside <p> and <dd>. Table cells, chips and headings
     * are scanned rather than read, and counting them would penalise exactly the
     * artifacts this design leans on.
     *
     * 1,363 words when this was written, in 96 blocks, with one paragraph of 59
     * words and fifteen more over 28. The ceiling is the post-trim figure plus
     * about eight percent of headroom, so a paragraph can grow but a fourth
     * section of prose cannot arrive unnoticed.
     */
    $prose = 0;

    foreach (['p', 'dd'] as $tag) {
        preg_match_all("#<{$tag}\b[^>]*>([\s\S]*?)</{$tag}>#", $main, $blocks);

        foreach ($blocks[1] as $block) {
            $prose += str_word_count(html_entity_decode(strip_tags($block), ENT_QUOTES | ENT_HTML5));
        }
    }

    expect($prose)->toBeLessThanOrEqual(1200, "The homepage is up to {$prose} words of prose");

    /*
     * And no single paragraph over 34 words. A 59-word paragraph is the shape
     * a reader skips, and skipping is how a page ends up saying something
     * untrue for months without anyone noticing.
     */
    preg_match_all('#<p\b[^>]*>([\s\S]*?)</p>#', $main, $paragraphs);

    $long = [];

    foreach ($paragraphs[1] as $paragraph) {
        $text = trim(html_entity_decode(strip_tags($paragraph), ENT_QUOTES | ENT_HTML5));
        $words = str_word_count($text);

        if ($words > 34) {
            $long[] = "{$words} words: " . substr($text, 0, 60);
        }
    }

    expect($long)->toBe([]);
});
