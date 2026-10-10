<?php

use PHPUnit\Framework\Assert;

const SHARED_HEADER = 'Shared with TableProApp/web and TableProApp/license at %s. Change both in the same release. See docs/shared-files.md.';

/**
 * @return array<string, string>
 */
function sharedFileRows(): array
{
    $document = (string) file_get_contents(base_path('docs/shared-files.md'));

    preg_match_all('/^\| `([^`]+)` \| `?([^|`]+?)`? \|/m', $document, $rows, PREG_SET_ORDER);

    $listed = [];

    foreach ($rows as $row) {
        $listed[$row[1]] = trim($row[2]);
    }

    return $listed;
}

/** @return list<string> */
function filesCarryingSharedHeader(): array
{
    $found = [];

    foreach (['resources', 'tests/Support'] as $directory) {
        $iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator(base_path($directory), FilesystemIterator::SKIP_DOTS));

        foreach ($iterator as $file) {
            $head = implode("\n", array_slice(file($file->getPathname()) ?: [], 0, 5));

            if (str_contains($head, 'Shared with TableProApp/web and TableProApp/license at ')) {
                $found[] = str_replace(base_path() . '/', '', $file->getPathname());
            }
        }
    }

    sort($found);

    return $found;
}

it('lists every file architecture §3 requires, each with a real hash', function (): void {
    $listed = sharedFileRows();

    $required = [
        'resources/css/tokens.css',
        'resources/css/fonts.css',
        'resources/views/partials/head-theme.blade.php',
        'resources/js/lib/theme.ts',
        'resources/js/components/shared/theme-control.tsx',
        'resources/js/lib/consent.ts',
        'resources/js/components/shared/consent-bar.tsx',
        'resources/js/lib/crisp.ts',
    ];

    foreach ($required as $path) {
        Assert::assertArrayHasKey($path, $listed, "docs/shared-files.md does not list {$path}");
    }

    foreach ($listed as $path => $hash) {
        Assert::assertMatchesRegularExpression('/^[0-9a-f]{64}$/', $hash, "{$path} has no recorded hash (\"{$hash}\")");
    }
});

// Nothing links the two repositories at build time: a failing hash is the reminder to edit the account app too.
it('keeps every listed file present, headed and unchanged', function (): void {
    foreach (sharedFileRows() as $path => $hash) {
        $file = base_path($path);

        Assert::assertFileExists($file, "{$path} is listed as shared but does not exist");

        $head = implode("\n", array_slice(file($file) ?: [], 0, 5));

        Assert::assertStringContainsString(sprintf(SHARED_HEADER, $path), $head, "{$path} lacks the shared-file header naming its own path");

        Assert::assertSame(
            $hash,
            hash_file('sha256', $file),
            "{$path} changed. Make the same edit in the account app, then record the new hash in docs/shared-files.md in both repositories.",
        );
    }
});

it('lists every file that says it is shared', function (): void {
    $listed = array_keys(sharedFileRows());
    sort($listed);

    Assert::assertSame($listed, filesCarryingSharedHeader(), 'A file carries the shared header without being listed in docs/shared-files.md, or the other way round');
});

it('imports nothing in a shared module that the account app cannot resolve', function (): void {
    $listed = array_keys(sharedFileRows());

    $allowed = ['react', 'lucide-react', '@/lib/utils'];

    foreach ($listed as $path) {
        if (! preg_match('/\.tsx?$/', $path)) {
            continue;
        }

        $source = (string) file_get_contents(base_path($path));

        preg_match_all("/^import\s.*?from '([^']+)';$/m", $source, $imports);

        foreach ($imports[1] as $module) {
            $local = str_starts_with($module, '@/') ? 'resources/js/' . substr($module, 2) : null;
            $resolvesToShared = $local !== null && (in_array("{$local}.ts", $listed, true) || in_array("{$local}.tsx", $listed, true));

            Assert::assertTrue(
                in_array($module, $allowed, true) || $resolvesToShared,
                "{$path} imports {$module}, which is not shared with the account app",
            );
        }

        // Strings arrive as props: a shared component never reads this app's catalogs or page props.
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

    expect($script)->toContain('docs/shared-files.md');

    preg_match_all('/^\| `([^`]+)` \|/m', (string) file_get_contents(base_path('docs/shared-files.md')), $rows);

    expect($rows[1])->toEqualCanonicalizing(array_keys(sharedFileRows()));
});
