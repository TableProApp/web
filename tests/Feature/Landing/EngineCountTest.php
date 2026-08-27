<?php

/**
 * The engine count is one derived value. These tests are what keep it that way.
 *
 * It was written out as "25" in seven rendered places and roughly forty fields
 * of `comparisons.json`, and it had gone stale everywhere at once: the app had
 * reached 28 registered types, the docs said 27, the site said 25. Nothing
 * failed, because every copy agreed with every other copy and none of them
 * agreed with the app.
 *
 * `resources/js/data/engines.ts` derives the number from `database-grid.json`,
 * which is the dataset the homepage actually renders, so a claim that disagrees
 * with it is a claim the page disproves two rows down. JSON cannot import a
 * constant, so `comparisons.json` still holds literals — those are checked here
 * instead.
 */
$readSource = static function (string $relative): string {
    $path = base_path($relative);

    expect($path)->toBeReadableFile("Missing source: {$relative}");

    return (string) file_get_contents($path);
};

/**
 * Sources whose rendered copy quotes the engine count.
 *
 * @var list<string>
 */
$claimSources = [
    'resources/js/data/faqs.ts',
    'resources/js/pages/Home.tsx',
    'resources/js/lib/structured-data.ts',
    'resources/js/components/landing/hero.tsx',
    'resources/js/components/landing/database-grid.tsx',
    'resources/js/components/landing/spec-strip.tsx',
    'resources/js/components/landing/license.tsx',
];

/**
 * Comments are history, not copy. `license.tsx` still quotes the retired
 * "25 databases, SQL editor, data grid…" row it replaced, and `database-grid`
 * explains itself in terms of "twenty six tiles". Both are accurate records of
 * what the file used to say and neither reaches a reader, so the scan reads what
 * ships rather than what is remembered.
 */
function renderedCopy(string $contents): string
{
    return (string) preg_replace(
        ['#/\*.*?\*/#s', '#//[^\n]*#'],
        '',
        $contents,
    );
}

it('pins the engine count every marketing claim derives from', function (): void {
    /*
     * 29 is the number of keys in the app's `allRegisteredTypeIds()`: 7 curated,
     * 15 registry, 3 cloud, one each for Elasticsearch, Kafka and SurrealDB, and
     * a snapshot of its own for Turso.
     *
     * Turso was the alias that made this ambiguous — it had a `DatabaseType` and
     * a `/turso-client` page but resolved to libSQL, so the app counted 28 while
     * the site showed one `libSQL / Turso` tile. It now carries an entry of its
     * own on the ScyllaDB precedent, so libSQL and Turso are two tiles sharing
     * one driver and the two repositories agree on 29.
     */
    $tiles = json_decode(file_get_contents(base_path('resources/data/database-grid.json')), true);

    expect($tiles)->toHaveCount(29);
});

it('states the engine count in one module and never as a literal', function () use ($claimSources, $readSource): void {
    /*
     * Any digit standing next to "databases", "engines" or "drivers" in rendered
     * copy is a second copy of the figure, which is how the site came to publish
     * a number the app had not used in three releases. The count is interpolated
     * from `engines.ts` or it is not stated.
     */
    $offenders = [];

    foreach ($claimSources as $source) {
        $copy = renderedCopy($readSource($source));

        if (preg_match_all('/\b\d+\s+(?:database engines?|driver plugins?|databases?|engines?|drivers?)\b/i', $copy, $matches) === 0) {
            continue;
        }

        foreach ($matches[0] as $match) {
            $offenders[] = "{$source}: \"{$match}\"";
        }
    }

    expect($offenders)->toBe([], "Hardcoded engine counts, import from @/data/engines instead:\n  " . implode("\n  ", $offenders));
});

it('derives the count and its split from the grid rather than restating them', function () use ($readSource): void {
    $engines = $readSource('resources/js/data/engines.ts');

    expect($engines)
        ->toContain("import gridData from '../../data/database-grid.json'")
        ->toContain('export const ENGINE_COUNT: number = tiles.length;');

    /*
     * The lede reads "9 drivers ship inside the app. The other 20 download…".
     * Spelling either half out is how it last drifted: the grid gained a tile,
     * "nine and sixteen" stayed, and the two halves stopped summing to the
     * headline directly above them.
     */
    expect($engines)->toContain('export const ON_DEMAND_ENGINE_COUNT: number = ENGINE_COUNT - BUNDLED_ENGINE_COUNT;');
});

it('quotes one engine count across every comparison page', function (): void {
    /*
     * `comparisons.json` cannot import the constant, so its literals are pinned
     * against it here — every "Databases" row, and the OG card figures, which are
     * generated from their own fields and so drift silently from the table they
     * advertise.
     */
    $entries = json_decode(file_get_contents(base_path('resources/data/comparisons.json')), true);

    $offenders = [];

    foreach ($entries as $entry) {
        foreach ($entry['rows'] ?? [] as $row) {
            if (($row['label'] ?? null) !== 'Databases') {
                continue;
            }

            if (! str_starts_with((string) $row['tablePro'], '29')) {
                $offenders[] = "{$entry['slug']}: Databases row says \"{$row['tablePro']}\"";
            }
        }

        /*
         * Only the cards whose stat *is* the engine count. Most quote RAM or a
         * price instead, and "$0 PER DEVICE" is not a number that moves with the
         * driver list.
         */
        if (($entry['ogStatLabel'] ?? null) === 'DATABASES' && ($entry['ogStatValue'] ?? null) !== '29') {
            $offenders[] = "{$entry['slug']}: ogStatValue says \"{$entry['ogStatValue']}\"";
        }
    }

    expect($offenders)->toBe([], "Comparison pages disagreeing with ENGINE_COUNT:\n  " . implode("\n  ", $offenders));
});
