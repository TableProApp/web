<?php

/**
 * The homepage comparison table reads the same JSON the /compare/* pages read.
 *
 * It exists so the homepage can make the native-versus-JVM-versus-Electron
 * argument with numbers and links instead of the 84 words of unlinked
 * competitor prose it replaced — prose that named six competitors, put four of
 * them ahead of TablePro's own claim, and closed by recommending two of them.
 *
 * Nothing in the component may be retyped from the data, and that matters most
 * for the price row: a price literal in a component is what CLAUDE.md forbids,
 * because it can silently stop matching what checkout charges.
 */
function compareTableSource(): string
{
    return file_get_contents(base_path('resources/js/components/landing/compare-table.tsx'));
}

function comparisonEntries(): array
{
    return json_decode(file_get_contents(base_path('resources/data/comparisons.json')), true);
}

it('renders three competitors that all exist in the data', function (): void {
    $slugs = array_column(comparisonEntries(), 'slug');

    foreach (['dbeaver', 'datagrip', 'beekeeper-studio'] as $slug) {
        expect($slugs)->toContain($slug);
    }
});

it('reads every value from the data and hardcodes none', function (): void {
    $source = compareTableSource();

    /*
     * The exact figures the table shows, asserted absent from the component.
     * If someone inlines one to "fix" a rendering problem, the homepage and the
     * comparison page start disagreeing the next time the JSON changes.
     */
    $entries = collect(comparisonEntries())
        ->whereIn('slug', ['dbeaver', 'datagrip', 'beekeeper-studio']);

    foreach ($entries as $entry) {
        foreach (['startup', 'memory'] as $metric) {
            expect($source)->not->toContain($entry['benchmarks']['competitor'][$metric]);
        }

        foreach ($entry['rows'] as $row) {
            if (in_array($row['label'], ['Price', 'Technology'], true) && is_string($row['competitor'])) {
                expect($source)->not->toContain($row['competitor']);
            }
        }
    }

    // TablePro's own figures too, including every price.
    expect($source)
        ->not->toContain('$24')
        ->not->toContain('$59')
        ->not->toContain('$2.99')
        ->not->toContain('~80 MB');
});

it('never links the comparison page that returns 410', function (): void {
    /*
     * Anchored to an opening quote, so this catches a link and not a mention —
     * the docblock in the component explains why TablePlus is absent, and that
     * comment is the documentation of this rule. Same anchoring as the guard in
     * StaleClaimsTest, for the same reason.
     */
    PHPUnit\Framework\Assert::assertDoesNotMatchRegularExpression(
        '#["\']/compare/tableplus#',
        compareTableSource(),
        'compare-table.tsx links a URL that returns 410 Gone',
    );
});
