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
        'resources/js/data/home-faqs.ts',
        'resources/js/pages/Home.tsx',
        'resources/js/components/landing/hero.tsx',
        'resources/js/components/landing/database-grid.tsx',
        'resources/js/components/landing/pricing.tsx',
    ];

    $banned = [
        // Not bare '18+': that also matches 'macOS 14+, iOS 18+', which is the
        // correct deployment target. The stale claim was always '18+ databases'.
        '18+ databases' => 'the database count is 25',
        '15+ databases' => 'the database count is 25',
        '21+' => 'the database count is 25',
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
    foreach (['resources/js/pages/Home.tsx', 'resources/js/pages/Compare.tsx'] as $source) {
        $contents = $readSource($source);

        // A rating derived from star counts, and a constant score applied to
        // every competitor, are both inventions. Neither may come back.
        expect($contents)
            ->not->toContain("'aggregateRating'")
            ->not->toContain('AggregateRating')
            ->not->toContain('ratingValue');
    }
});

it('keeps the FAQ sets at the sizes the page and schema expect', function () use ($readSource): void {
    // Count only populated entries, so the `question:` field on FaqItem is not tallied.
    expect(substr_count($readSource('resources/js/data/home-faqs.ts'), "question: '"))->toBe(8);
    // The /faq page spreads the homepage set and adds six of its own.
    expect(substr_count($readSource('resources/js/data/faqs.ts'), "question: '"))->toBe(6);
});

it('quotes TablePro download size and engine count consistently on the compare pages', function (): void {
    $entries = json_decode(file_get_contents(base_path('resources/data/comparisons.json')), true);

    foreach ($entries as $entry) {
        expect($entry['benchmarks']['tablePro']['download'])
            ->toBe('~20 MB', "{$entry['slug']} still quotes the old download size");
    }

    $raw = file_get_contents(base_path('resources/data/comparisons.json'));
    expect($raw)->not->toContain('18+ databases');
});

it('never links the retired TablePlus comparison page', function () use ($readSource): void {
    $sources = array_merge(
        glob(base_path('resources/js/components/landing/*.tsx')),
        [base_path('resources/js/pages/Home.tsx')],
    );

    foreach ($sources as $source) {
        // Anchored to an opening quote so this catches a *link*
        // (href="/compare/tableplus") and not a *mention*. Two components carry
        // the slug in a comment explaining precisely why it is never linked,
        // and those comments are the documentation of this rule — failing on
        // them would delete the reason the rule exists. Backticks are excluded
        // for the same reason: architecture.tsx quotes the path in a docblock.
        Assert::assertDoesNotMatchRegularExpression(
            '#["\']/compare/tableplus#',
            file_get_contents($source),
            basename($source) . ' links a URL that returns 410 Gone',
        );
    }
});
