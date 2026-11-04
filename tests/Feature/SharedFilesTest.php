<?php

use PHPUnit\Framework\Assert;

const SHARED_HEADER = 'Shared by TableProApp/web at %s and TableProApp/cloud at %s. Change both in the same release. See docs/shared-files.md in TableProApp/web.';

/**
 * @return array<string, array{cloud: string, hash: string}>
 */
function sharedFileRows(): array
{
    $document = (string) file_get_contents(base_path('docs/shared-files.md'));

    preg_match_all('/^\| `([^`]+)` \| `([^`]+)` \| `?([^|`]+?)`? \|/m', $document, $rows, PREG_SET_ORDER);

    $listed = [];

    foreach ($rows as $row) {
        $listed[$row[1]] = ['cloud' => $row[2], 'hash' => trim($row[3])];
    }

    return $listed;
}

/**
 * @return array<string, string>
 */
function sharedFileHeads(): array
{
    $heads = [];

    foreach (['resources', 'tests/Support'] as $directory) {
        $iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator(base_path($directory), FilesystemIterator::SKIP_DOTS));

        foreach ($iterator as $file) {
            $heads[str_replace(base_path() . '/', '', $file->getPathname())] = implode("\n", array_slice(file($file->getPathname()) ?: [], 0, 5));
        }
    }

    ksort($heads);

    return $heads;
}

it('lists tokens, the CJK font stacks and the chat loader, each with its tablepro-cloud path and a real hash', function (): void {
    expect(sharedFileRows())->toHaveKeys(['resources/css/tokens.css', 'resources/css/international.css', 'resources/js/lib/crisp.ts']);

    foreach (sharedFileRows() as $path => $row) {
        Assert::assertMatchesRegularExpression('#^web/(apps|packages)/[a-z0-9./-]+$#', $row['cloud'], "{$path} has no tablepro-cloud path");
        Assert::assertMatchesRegularExpression('/^[0-9a-f]{64}$/', $row['hash'], "{$path} has no recorded hash (\"{$row['hash']}\")");
    }

    // tablepro-cloud's CI has diffed this copy against main since M12.2.
    expect(sharedFileRows()['resources/css/tokens.css']['cloud'])->toBe('web/packages/ui/src/styles/tokens.css');
});

// Nothing links the two repositories at build time: a failing hash is the reminder to edit tablepro-cloud too.
it('keeps every listed file present, headed and unchanged', function (): void {
    foreach (sharedFileRows() as $path => $row) {
        $file = base_path($path);

        Assert::assertFileExists($file, "{$path} is listed as shared but does not exist");
        Assert::assertSame(sprintf(SHARED_HEADER, $path, $row['cloud']), substr((string) strtok((string) file_get_contents($file), "\n"), 3, -3), "{$path} lacks the one-line header naming both copies");

        Assert::assertSame(
            $row['hash'],
            hash_file('sha256', $file),
            "{$path} changed. Make the same edit in tablepro-cloud's {$row['cloud']}, then record the new hash in docs/shared-files.md.",
        );
    }
});

it('lists every file that says it is shared, and nothing still names the retired account app', function (): void {
    $listed = array_keys(sharedFileRows());
    sort($listed);

    $headed = array_keys(array_filter(sharedFileHeads(), fn(string $head): bool => str_contains($head, 'Shared by TableProApp/web at ')));

    Assert::assertSame($listed, $headed, 'A file carries the shared header without being listed in docs/shared-files.md, or the other way round');

    foreach (sharedFileHeads() as $path => $head) {
        Assert::assertStringNotContainsString('TableProApp/license', $head, "{$path} still names the account app this site shared files with before the cutover");
    }
});

it('names its tablepro-cloud counterpart in each file kept to one specification', function (): void {
    expect((string) strtok((string) file_get_contents(resource_path('css/fonts.css')), "\n"))
        ->toContain('web/packages/ui/src/styles/fonts.css')
        ->not->toContain('Shared by');
    expect((string) file_get_contents(base_path('tests/Support/vi-forbidden-variants.php')))
        ->toContain('Ported to TableProApp/cloud at web/packages/i18n/test/vi-forbidden-variants.ts');
});

it('imports nothing in a shared file', function (): void {
    foreach (array_keys(sharedFileRows()) as $path) {
        $source = (string) file_get_contents(base_path($path));

        Assert::assertDoesNotMatchRegularExpression('/^\s*(import\s|@import\s)/m', $source, "{$path} imports a module, which tablepro-cloud resolves differently");
        Assert::assertStringNotContainsString('useI18n', $source, "{$path} reads this app's catalogs");
        Assert::assertStringNotContainsString('usePage', $source, "{$path} reads this app's page props");
    }
});

it('keeps the site chrome out of the shared set', function (): void {
    $listed = array_keys(sharedFileRows());

    foreach (glob(resource_path('js/components/site/*')) ?: [] as $file) {
        $path = str_replace(base_path() . '/', '', $file);

        Assert::assertNotContains($path, $listed, "{$path} holds this app's links and strings and must not be shared");
    }
});

it('keeps the diff script reading the same list', function (): void {
    $script = (string) file_get_contents(base_path('scripts/check-shared-files.sh'));

    expect($script)->toContain('docs/shared-files.md')->toContain('../tablepro-cloud');

    expect((string) file_get_contents(base_path('package.json')))->toContain('"check:shared": "bash scripts/check-shared-files.sh"');
});
