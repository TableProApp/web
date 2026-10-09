<?php

use App\Http\Controllers\IosController;
use App\Console\Commands\GenerateAssetHandoffCommand;
use App\Support\Assets\AssetManifest;
use App\Support\Assets\HandoffDocument;
use PHPUnit\Framework\Assert;

/**
 * The committed owner handoff, `docs/visual-assets.md`, is complete and
 * current (architecture §1.9, spec §9.1).
 *
 * `AssetHandoffCommandTest` proves the generator on fixtures. This file holds
 * the real briefs to the rules the owner relies on: every manifest id, slot or
 * social card, has a brief with all eight headings filled in; each brief ends
 * in a Vietnamese summary for the owner; no manifest change a brief asked for
 * is still waiting; and the committed document is exactly what
 * `php artisan assets:handoff` writes today, so it can never describe an
 * image the pages no longer show.
 */

/**
 * The body of one `## ` section of the committed document, up to the next one.
 */
function handoffDocumentSection(string $document, string $heading): string
{
    $start = strpos($document, "\n## {$heading}\n");

    Assert::assertNotFalse($start, "docs/visual-assets.md has no \"## {$heading}\" section");

    $body = substr($document, $start + strlen("\n## {$heading}\n"));
    $next = strpos($body, "\n## ");

    return $next === false ? $body : substr($body, 0, $next);
}

function handoffCommittedDocument(): string
{
    $path = base_path(GenerateAssetHandoffCommand::DEFAULT_OUTPUT);

    Assert::assertFileExists($path, 'docs/visual-assets.md is missing. Run: php artisan assets:handoff');

    return (string) file_get_contents($path);
}

it('has a complete brief for every manifest entry, in its family\'s fragment', function (): void {
    $document = app(HandoffDocument::class);

    expect($document->problems())->toBe([]);

    $sections = $document->sections();

    foreach ((new AssetManifest())->assets() as $id => $entry) {
        Assert::assertArrayHasKey($id, $sections, "{$id} has no brief in docs/rebuild/assets/{$entry['family']}.md");
        Assert::assertSame($entry['family'], $sections[$id]['family'], "{$id}'s brief is in {$sections[$id]['file']}");

        foreach (HandoffDocument::HEADINGS as $heading) {
            Assert::assertNotSame('', $sections[$id]['headings'][$heading] ?? '', "{$id}: \"### {$heading}\" is missing or empty");
        }
    }
});

it('ends every brief with a Vietnamese summary for the owner, in NFC', function (): void {
    foreach (app(HandoffDocument::class)->sections() as $id => $section) {
        $summary = $section['headings'][HandoffDocument::SUMMARY] ?? '';

        Assert::assertTrue(Normalizer::isNormalized($summary, Normalizer::FORM_C), "{$id}: the Vietnamese summary is not NFC");
        Assert::assertMatchesRegularExpression('/[ăâđêôơưạảấầẩẫậắằẳẵặẹẻẽếềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹ]/iu', $summary, "{$id}: the summary is not Vietnamese");
        Assert::assertDoesNotMatchRegularExpression('/\bW\d[a-z]?\b/', $summary, "{$id}: the summary carries an internal work label, which means nothing to the owner");
    }
});

/*
 * A brief asks for a manifest edit under "Manifest changes"; whoever applies
 * it edits resources/data/assets.json and marks it "Applied". Anything else is
 * a request nobody acted on, so the manifest (and the placeholder text the
 * pages show) would still say what the brief found to be wrong.
 */
it('leaves no requested manifest change unapplied', function (): void {
    $pending = [];

    foreach (app(HandoffDocument::class)->sections() as $id => $section) {
        $request = $section['headings']['Manifest changes'] ?? '';

        if (preg_match('/^(None|Applied)\b/', $request) !== 1) {
            $pending[] = "{$id} ({$section['file']}): " . strtok($request, "\n");
        }
    }

    expect($pending)->toBe([], "Apply these to resources/data/assets.json, then start the request with \"Applied\":\n" . implode("\n", $pending));
});

it('is committed exactly as assets:handoff writes it', function (): void {
    Assert::assertSame(
        app(HandoffDocument::class)->render(),
        handoffCommittedDocument(),
        'docs/visual-assets.md is stale. Run: php artisan assets:handoff',
    );
});

it('lists every entry once in the production order, P1 first', function (): void {
    $order = handoffDocumentSection(handoffCommittedDocument(), 'Production order');
    $assets = (new AssetManifest())->assets();

    preg_match_all('/^\| (P[123]) \| \[`([a-z0-9-]+)`\]/m', $order, $rows, PREG_SET_ORDER);

    $ids = array_column($rows, 2);
    $priorities = array_column($rows, 1);

    expect($ids)->toEqualCanonicalizing(array_keys($assets));
    expect($ids)->toBe(array_values(array_unique($ids)));

    $sorted = $priorities;
    sort($sorted);

    expect($priorities)->toBe($sorted);

    foreach ($rows as [, $priority, $id]) {
        Assert::assertSame($assets[$id]['handoffPriority'], $priority, "{$id} is listed at the wrong priority");
    }
});

it('groups the page slots by owning repository, then by page family', function (): void {
    $document = handoffCommittedDocument();
    $public = handoffDocumentSection($document, 'Public site (tablepro-web)');
    $account = handoffDocumentSection($document, 'Account and checkout app (license)');

    foreach ((new AssetManifest())->assets() as $id => $entry) {
        if ($entry['family'] === 'og') {
            continue;
        }

        $own = $entry['ownerRepo'] === 'web' ? $public : $account;
        $other = $entry['ownerRepo'] === 'web' ? $account : $public;

        Assert::assertMatchesRegularExpression('/^##### `' . preg_quote($id, '/') . '`$/m', $own, "{$id} is not under its repository");
        Assert::assertDoesNotMatchRegularExpression('/^##### `' . preg_quote($id, '/') . '`$/m', $other, "{$id} is under the other repository");
    }

    expect($public)->toContain('### Homepage')
        ->toContain('### Feature pages')
        ->toContain('### Database pages')
        ->toContain('### iPhone and iPad page')
        ->toContain('### Release posts');
});

/*
 * Spec §9.1: bespoke social artwork is an owner asset with a 1200 × 630
 * brief, and the handoff records which cards are in use: the bespoke
 * `og-site` files for pages without a card of their own, and the generated
 * cards behind them, so nobody publishes a placeholder as a card.
 */
it('briefs the social card at 1200 × 630 and records the cards in use', function (): void {
    $social = handoffDocumentSection(handoffCommittedDocument(), 'Social cards (Open Graph)');

    expect($social)
        ->toContain('**Current state.**')
        ->toContain('`/og.png` in English and')
        ->toContain('`/og/bespoke/og-site-vi.png` in Vietnamese')
        ->toContain('The generated `/og/vi/default.png` stays committed')
        ->toContain('php artisan og:generate --type=all --locale=all')
        ->toContain('1200 × 630')
        ->toContain('| Export | 1200×630 px (1×) · PNG · opaque · max 320 KB per file |')
        ->toContain('Safe area');

    foreach ((new AssetManifest())->assets() as $id => $entry) {
        if ($entry['kind'] === 'og-card') {
            Assert::assertMatchesRegularExpression('/^### `' . preg_quote($id, '/') . '`$/m', $social, "{$id} is not in the social card section");
        }
    }
});

/*
 * The earlier screenshots stay in public/images as source material for the
 * owner (spec §9.1). The handoff names each one; a name the disk does not
 * have would send the owner looking for a file that is gone.
 */
it('names only source files that exist, and proposes their cleanup instead of deleting them', function (): void {
    $legacy = handoffDocumentSection(handoffCommittedDocument(), 'Existing image files kept as source material');

    expect($legacy)->not->toContain('(missing)')->toContain('**Proposed cleanup:**');

    foreach ((new AssetManifest())->assets() as $id => $entry) {
        foreach ((array) ($entry['legacySource'] ?? []) as $path) {
            Assert::assertFileExists(public_path(ltrim($path, '/')), "{$id} names {$path} as its source, which is not in public/");
        }
    }
});

it('is held current in CI, before the suite runs', function (): void {
    $workflow = (string) file_get_contents(base_path('.github/workflows/tests.yml'));
    $php = substr($workflow, (int) strpos($workflow, "\n  php:\n"), (int) strpos($workflow, "\n  frontend:\n") - (int) strpos($workflow, "\n  php:\n"));

    expect($php)->toContain('run: php artisan assets:handoff --check');
    expect(strpos($php, 'assets:handoff --check'))->toBeLessThan(strpos($php, 'run: ./vendor/bin/pest'));
});

/**
 * The value of one field row under one asset's heading in the committed document.
 */
function handoffAssetRow(string $document, string $id, string $field): string
{
    $start = strpos($document, "`{$id}`\n");

    Assert::assertNotFalse($start, "docs/visual-assets.md has no heading for {$id}");

    $block = substr($document, $start, 4000);

    Assert::assertSame(1, preg_match('/^\| ' . preg_quote($field, '/') . ' \| (.*) \|$/m', $block, $match), "{$id} has no \"{$field}\" row");

    return $match[1];
}

it('names the component that renders each slot, not only the data file that lists it', function (): void {
    /* Spec §9.1: the component decides the column, and so the width the brief is drawn for. */
    $document = handoffCommittedDocument();

    preg_match_all('/^\| Rendered by \| (.*) \|$/m', $document, $rows);

    expect(count($rows[1]))->toBeGreaterThan(100);

    foreach ($rows[1] as $row) {
        Assert::assertMatchesRegularExpression('#^`resources/js/[^`]+\.tsx`#', $row, "A \"Rendered by\" row starts with a data file: {$row}");
    }

    expect(handoffAssetRow($document, 'mac-db-oracle-plsql', 'Rendered by'))->toStartWith('`resources/js/pages/Databases/Show.tsx` (via ');
    expect(handoffAssetRow($document, 'mac-db-mysql-query-mobile', 'Rendered by'))->toStartWith('`resources/js/pages/Databases/Show.tsx` (via ')
        ->toEndWith('(through the `mac-db-mysql-query` slot, below 768 px)');
    expect(handoffAssetRow($document, 'mac-explain-compare', 'Rendered by'))->toStartWith('`resources/js/components/features/feature-section.tsx` (via ');
});

it('gives the /ios iPad capture the size the page renders it at', function (): void {
    /*
     * HandoffDocument::RENDERED_OVERRIDES mirrors the `sizes` the /ios header
     * renders the iPad capture with: `IosController::IPAD_SIZES`, which the
     * page receives as `ipadSizes` and the LCP preload is built with. They
     * change together.
     */
    $ios = (string) file_get_contents(resource_path('js/pages/Ios.tsx'));

    expect(HandoffDocument::RENDERED_OVERRIDES['ipad-table-browse']['desktop'])->toBe([904, 678]);
    expect(IosController::IPAD_SIZES)->toStartWith('(min-width: 1280px) 904px,');
    Assert::assertMatchesRegularExpression('/id="ipad-table-browse"[^>]*sizes=\{ipadSizes\}/s', $ios);
    expect(handoffAssetRow(handoffCommittedDocument(), 'ipad-table-browse', 'Rendered size'))->toStartWith('desktop 904×678 · ');
});

it('never asks for a release-post figure wider than its source', function (string $id, string $export, string $files): void {
    $document = handoffCommittedDocument();

    expect(handoffAssetRow($document, $id, 'Export'))->toStartWith($export);
    expect(handoffAssetRow($document, $id, 'Replace with'))->toContain($files);
})->with([
    'a 964 px source' => ['blog-tablepro-0-72-1', '964×1054 px (the source\'s own width', '-light-{704,964}.'],
    'a 900 px source' => ['blog-tablepro-0-77-3', '900×720 px (the source\'s own width', '-light-{704,900}.'],
]);

it('records where a page loads an image with priority that the manifest loads lazily', function (): void {
    $document = handoffCommittedDocument();

    foreach (['ios-connection-list', 'ipad-table-browse', 'ipad-table-browse-mobile'] as $id) {
        expect(handoffAssetRow($document, $id, 'Loading'))->toStartWith('Priority where `resources/js/pages/Ios.tsx` places it');
    }
});
