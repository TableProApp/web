<?php

use PHPUnit\Framework\Assert;

/**
 * A regression guard against the specific untrue claims this site used to make.
 * Every string below was live copy at some point and was wrong; if one comes
 * back, that is a bug, not a style choice.
 */
$readSource = static fn(string $relative): string => file_get_contents(base_path($relative));

it('never revives a stale database count or platform claim', function () use ($readSource): void {
    $sources = [
        'resources/js/data/faqs.ts',
        'resources/js/pages/Home.tsx',
        'resources/js/components/landing/hero.tsx',
        'resources/js/components/landing/database-grid.tsx',
        'resources/js/components/landing/pricing.tsx',
    ];

    $banned = [
        // Not bare '18+': that also matches 'macOS 14+, iOS 18+', which is the
        // correct deployment target. The stale claim was always '18+ databases'.
        '18+ databases' => 'the database count is 29',
        '15+ databases' => 'the database count is 29',
        '21+' => 'the database count is 29',
        '9 built-in themes' => 'there are 4 built-in themes',
        'iOS 17' => 'the iOS deployment target is 18.0',
        'free forever on one Mac' => 'the unlicensed app has no per-Mac limit',
    ];

    foreach ($sources as $source) {
        $contents = $readSource($source);

        foreach ($banned as $needle => $reason) {
            // Not `expect()->not->toContain($needle, $message)`. Pest's
            // toContain() is `(mixed ...$needles)` with no message parameter,
            // so the message is swallowed as a second needle, and `not` passes
            // as soon as *any* needle is absent. Since the message never
            // appears in a source file, that assertion could never fail: this
            // whole block was green while Home.tsx carried a banned string.
            Assert::assertStringNotContainsString(
                $needle,
                $contents,
                "{$source} contains \"{$needle}\" but {$reason}",
            );
        }
    }
});

it('does not describe a Terminal feature that was removed from the app', function () use ($readSource): void {
    // Removed in TablePro 0.43.2. The screenshots went with it.
    expect(glob(public_path('images/features/terminal-*.png')))->toBeEmpty();

    expect($readSource('resources/js/components/landing/workbench.tsx'))
        ->not->toContain('Terminal')
        ->not->toContain('redis-cli')
        ->not->toContain('mongosh');
});

it('never publishes a rating nobody gave', function () use ($readSource): void {
    /*
     * Every page that emits a SoftwareApplication node, not just the two that
     * were listed. DatabaseClient.tsx was absent for as long as it shipped
     * `ratingValue: '4.9'` with `ratingCount` set to the GitHub star count, so
     * this test passed while 26 indexed URLs published a fabricated rating.
     *
     * The list is asserted against the filesystem rather than hardcoded alone:
     * a new page that builds a SoftwareApplication must be added here, and the
     * count below is what forces that.
     */
    $sources = [
        'resources/js/pages/Home.tsx',
        'resources/js/pages/Compare.tsx',
        'resources/js/pages/DatabaseClient.tsx',
        'resources/js/pages/Download.tsx',
    ];

    $emitters = array_values(array_filter(
        glob(base_path('resources/js/pages/*.tsx')),
        static fn(string $path): bool => str_contains(file_get_contents($path), "'SoftwareApplication'"),
    ));

    expect($emitters)->toHaveCount(
        count($sources),
        'A page started emitting a SoftwareApplication node. Add it to $sources above.',
    );

    foreach ($sources as $source) {
        /*
         * Comments stripped first. Two of these files carry a docblock saying
         * why they do not publish a rating, and a bare `aggregateRating` needle
         * matches the explanation as readily as the offence.
         */
        $code = preg_replace(['#/\*[\s\S]*?\*/#', '#//.*$#m'], '', $readSource($source));

        /*
         * A rating derived from star counts, and a constant score applied to
         * every competitor, are both inventions. Neither may come back.
         *
         * `aggregateRating` is matched unquoted because the property-assignment
         * form — `data.aggregateRating = {...}` — is how it actually shipped,
         * and the quoted needle this test used to carry never matched it.
         */
        expect($code)
            ->not->toContain('aggregateRating')
            ->not->toContain('AggregateRating')
            ->not->toContain('ratingValue');
    }
});

it('keeps every FAQ question, and asks each of them in one place', function () use ($readSource): void {
    /*
     * Fourteen: the eight the homepage used to ask — four in a section of its
     * own and four inline — plus the six that were always only here.
     *
     * The homepage set was redundant twice over. Every one of those eight was
     * already answered in prose elsewhere on the homepage, and `faqs.ts` spread
     * `home-faqs.ts` in wholesale, so /faq answered each of them a third time.
     * The questions all survived the move; only the duplicate render sites went.
     *
     * Counted on the key, not on the quote character. This matched `question: '`
     * until one question began interpolating the engine count and switched to a
     * template literal — at which point a file that still held all fourteen
     * questions reported thirteen.
     */
    expect(preg_match_all("/\bquestion: ['`]/", $readSource('resources/js/data/faqs.ts')))->toBe(14);

    expect(file_exists(base_path('resources/js/data/home-faqs.ts')))
        ->toBeFalse('home-faqs.ts is gone; /faq is the only place a question is asked');
});

it('quotes TablePro download size and engine count consistently on the compare pages', function (): void {
    $entries = json_decode(file_get_contents(base_path('resources/data/comparisons.json')), true);

    /*
     * `benchmarks` is optional. The TablePlus entry ships without one, because
     * it is native like TablePro and no published cold-start or memory figure
     * for either survives scrutiny — so the page states no number rather than
     * an invented one.
     */
    foreach (array_filter($entries, static fn(array $entry): bool => isset($entry['benchmarks'])) as $entry) {
        expect($entry['benchmarks']['tablePro']['download'])
            ->toBe('~20 MB', "{$entry['slug']} still quotes the old download size");
    }

    $raw = file_get_contents(base_path('resources/data/comparisons.json'));

    /*
     * Not `toContain('18+ databases')`. Every occurrence this guard was written
     * to catch was the plus-less "18 databases", so it never fired once while
     * ten entries carried a stale count.
     */
    Assert::assertDoesNotMatchRegularExpression(
        '/\b18\+? databases\b/',
        $raw,
        'comparisons.json still quotes a stale database count',
    );
});

it('states each performance metric in exactly one place', function (): void {
    /*
     * `rows` and `benchmarks` both render on a comparison page — the first as
     * the feature table, the second directly below it under a heading that says
     * "The numbers." Both used to carry startup time and memory, and five of the
     * ten pages disagreed with themselves across roughly 200px: DBeaver started
     * in "~8s" in the table and "5-15s" in the benchmark block.
     *
     * `benchmarks` owns the three performance figures now. `rows` owns features,
     * price and technology. A metric restated in both is the bug.
     */
    $entries = json_decode(file_get_contents(base_path('resources/data/comparisons.json')), true);

    foreach ($entries as $entry) {
        $labels = array_column($entry['rows'], 'label');

        foreach (['Startup Time', 'Memory Usage'] as $perfLabel) {
            expect($labels)->not->toContain(
                $perfLabel,
                "{$entry['slug']} restates {$perfLabel} in rows; benchmarks owns it",
            );
        }
    }

    // And TablePro's own figures are one product, so they are one string —
    // across the entries that quote them at all.
    $measured = array_values(array_filter($entries, static fn(array $entry): bool => isset($entry['benchmarks'])));

    foreach (['startup', 'memory', 'download'] as $metric) {
        $values = array_unique(array_map(
            static fn(array $entry): string => $entry['benchmarks']['tablePro'][$metric],
            $measured,
        ));

        expect($values)->toHaveCount(
            1,
            "TablePro quotes more than one {$metric} across the compare pages: " . implode(', ', $values),
        );
    }
});

it('serves a comparison page for every slug the route accepts, and vice versa', function (): void {
    /*
     * These two lists drifting apart is how /compare/tableplus spent the
     * project's whole history returning 410 while TablePlus sat in the import
     * grid three sections above, and how sequel-pro and azimutt ended up with
     * no link anywhere on the site.
     *
     * A slug in the route with no entry renders a blank page; an entry with no
     * slug in the route is a page nobody can reach.
     */
    $route = collect(app('router')->getRoutes())->first(
        static fn($candidate): bool => $candidate->getName() === 'landing.compare',
    );

    $routed = explode('|', $route->wheres['slug']);
    $authored = array_column(
        json_decode(file_get_contents(base_path('resources/data/comparisons.json')), true),
        'slug',
    );

    sort($routed);
    sort($authored);

    expect($routed)->toBe($authored);
});

it('never implies a database count other than 29', function (): void {
    /*
     * Four entries carried counts from the era when TablePro shipped 18 —
     * Postico promised "Postgres plus 17 other databases" and named five
     * engines "and 13 more", HeidiSQL the same. Both read as 18, on pages whose
     * own table said 25 two rows below.
     *
     * Relative phrasing is what rots: "plus N more" has to be re-derived every
     * time the driver count moves, and nobody remembers to. This catches the
     * ones that no longer add up — it caught all four when the count went to 28,
     * and all four again at 29.
     */
    $entries = json_decode(file_get_contents(base_path('resources/data/comparisons.json')), true);

    $offenders = [];

    foreach ($entries as $entry) {
        array_walk_recursive($entry, function ($value) use (&$offenders, $entry): void {
            if (! is_string($value)) {
                return;
            }

            // "Postgres plus 24 other databases" / "... and 20 more"
            if (! preg_match('/\b(?:plus|and)\s+(\d{1,3})\s+(?:other|more)\b/i', $value, $m)) {
                return;
            }

            /*
             * Only the engines named in the same sentence count. Postico's
             * verdict reads "excellent for Postgres alone. TablePro covers the
             * same ground for Postgres plus 28 other databases" — counting the
             * whole string sees Postgres twice and makes 29 look like 30.
             */
            $before = substr($value, 0, strpos($value, $m[0]));
            $sentence = preg_split('/(?<=[.!?])\s+/', $before);

            $named = preg_match_all(
                '/\b(PostgreSQL|Postgres|MySQL|MariaDB|MongoDB|Redis|SQLite|SQL Server|Redshift|CockroachDB|Greenplum|Snowflake|Cassandra|DuckDB|Oracle|ClickHouse)\b/i',
                (string) end($sentence),
            );

            if ($named + (int) $m[1] !== 29) {
                $offenders[] = "{$entry['slug']}: \"{$m[0]}\" after {$named} named engines = " . ($named + (int) $m[1]);
            }
        });
    }

    expect($offenders)->toBe([], "Database counts that do not total 29:\n  " . implode("\n  ", $offenders));
});

it('quotes one price per competitor claim, consistently within an entry', function (): void {
    /*
     * The OG card is generated from its own fields, so it drifts silently from
     * the page it advertises: Postico's said $40 against $69/$99 in the entry,
     * DataGrip's said $100 against $99. Nobody sees an OG image until it is
     * already being shared.
     */
    $entries = json_decode(file_get_contents(base_path('resources/data/comparisons.json')), true);

    foreach ($entries as $entry) {
        if (! isset($entry['ogCompetitorMetaHtml'])) {
            continue;
        }

        preg_match_all('/\$[\d,]+(?:\.\d{2})?/', $entry['ogCompetitorMetaHtml'], $onCard);

        if ($onCard[0] === []) {
            continue;
        }

        $inEntry = [];
        array_walk_recursive($entry, function ($value) use (&$inEntry): void {
            if (is_string($value)) {
                preg_match_all('/\$[\d,]+(?:\.\d{2})?/', $value, $found);
                $inEntry = array_merge($inEntry, $found[0]);
            }
        });

        foreach ($onCard[0] as $price) {
            expect(array_count_values($inEntry)[$price] ?? 0)->toBeGreaterThan(
                1,
                "{$entry['slug']}: the OG card quotes {$price}, which appears nowhere else in the entry",
            );
        }
    }
});
