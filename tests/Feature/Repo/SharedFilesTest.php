<?php

const SHARED_HEADER = 'Shared by TableProApp/web at %s and TableProApp/cloud at %s. Change both in the same release. See docs/shared-files.md in TableProApp/web.';

function sharedFileRows(): array
{
    preg_match_all('/^\| `([^`]+)` \| `([^`]+)` \| `?([^|`]+?)`? \|/m', (string) file_get_contents(base_path('docs/shared-files.md')), $rows, PREG_SET_ORDER);

    $listed = [];

    foreach ($rows as [, $path, $cloud, $hash]) {
        $listed[$path] = ['cloud' => $cloud, 'hash' => trim($hash)];
    }

    return $listed;
}

// Nothing links the two repositories at build time: a failing hash is the reminder to edit tablepro-cloud too.
it('keeps every shared file headed and unchanged since docs/shared-files.md recorded it', function (): void {
    expect(sharedFileRows())->not->toBeEmpty();

    foreach (sharedFileRows() as $path => $row) {
        $file = base_path($path);

        expect($file)->toBeFile("{$path} is listed as shared but does not exist")
            ->and(substr((string) strtok((string) file_get_contents($file), "\n"), 3, -3))->toBe(sprintf(SHARED_HEADER, $path, $row['cloud']), "{$path} lacks the header naming both copies")
            ->and(hash_file('sha256', $file))->toBe($row['hash'], "{$path} changed. Make the same edit in tablepro-cloud's {$row['cloud']}, then record the new hash in docs/shared-files.md.");
    }
});

it('lists every file that carries the shared header', function (): void {
    $headed = [];
    $iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator(resource_path(), FilesystemIterator::SKIP_DOTS));

    foreach ($iterator as $file) {
        $head = implode("\n", array_slice(file($file->getPathname()) ?: [], 0, 5));

        if (str_contains($head, 'Shared by TableProApp/web at ')) {
            $headed[] = str_replace(base_path() . '/', '', $file->getPathname());
        }
    }

    $listed = array_keys(sharedFileRows());

    sort($headed);
    sort($listed);

    expect($headed)->toBe($listed);
});
