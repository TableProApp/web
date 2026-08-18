<?php

/**
 * Every screenshot on this site is captured by hand and converted to its WebP
 * ladder by hand, and until now nothing checked the result. Three failures are
 * cheap to make and invisible in review: a path that no longer resolves, a
 * `srcSet` descriptor that claims a width the file does not have — which makes
 * the browser pick the wrong candidate and either blur the image or download
 * the largest one on a phone — and a dark variant re-shot at a different window
 * size, which shifts the layout for half the visitors and nobody else.
 *
 * These run on the files themselves rather than on rendered markup, so they
 * cover the paths that are assembled at runtime too.
 */

/**
 * @return list<string>
 */
function frontendSourceFiles(): array
{
    $files = [];
    $tree = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator(resource_path('js'), FilesystemIterator::SKIP_DOTS),
    );

    foreach ($tree as $file) {
        if (in_array($file->getExtension(), ['ts', 'tsx'], true)) {
            $files[] = $file->getPathname();
        }
    }

    return $files;
}

/**
 * @return list<string>
 */
function publicImageFiles(): array
{
    $files = [];
    $tree = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator(public_path('images'), FilesystemIterator::SKIP_DOTS),
    );

    foreach ($tree as $file) {
        if (in_array(strtolower($file->getExtension()), ['png', 'webp', 'jpg', 'jpeg'], true)) {
            $files[] = $file->getPathname();
        }
    }

    sort($files);

    return $files;
}

/**
 * Literal `/images/...` paths only. A path built from a template literal has no
 * extension at the point of reference and is skipped here; the two assertions
 * that walk `public/images` cover those files instead.
 *
 * @return array<string, string> Map of web path to the source file naming it.
 */
function referencedImagePaths(): array
{
    $paths = [];

    foreach (frontendSourceFiles() as $file) {
        preg_match_all('#/images/[A-Za-z0-9@._/-]+\.(?:png|webp|jpe?g|svg|avif)#', (string) file_get_contents($file), $matches);

        foreach ($matches[0] as $path) {
            $paths[$path] ??= str_replace(base_path() . '/', '', $file);
        }
    }

    ksort($paths);

    return $paths;
}

/**
 * @return array{0: int, 1: int}
 */
function imageDimensions(string $absolutePath): array
{
    $size = @getimagesize($absolutePath);

    if ($size === false) {
        return [0, 0];
    }

    return [$size[0], $size[1]];
}

it('serves every image the frontend links to', function (): void {
    $missing = [];
    $referenced = referencedImagePaths();

    expect($referenced)->not->toBeEmpty();

    foreach ($referenced as $path => $source) {
        if (! is_file(public_path(ltrim($path, '/')))) {
            $missing[] = "{$path} referenced by {$source}";
        }
    }

    expect($missing)->toBe([]);
});

it('gives every srcSet candidate the width its descriptor claims', function (): void {
    $wrong = [];
    $checked = 0;

    foreach (frontendSourceFiles() as $file) {
        preg_match_all('#(/images/[A-Za-z0-9@._/-]+\.webp)\s+(\d+)w#', (string) file_get_contents($file), $matches, PREG_SET_ORDER);

        foreach ($matches as $match) {
            [, $path, $declared] = $match;
            $absolute = public_path(ltrim($path, '/'));

            if (! is_file($absolute)) {
                continue;
            }

            [$actual] = imageDimensions($absolute);
            $checked++;

            if ($actual !== (int) $declared) {
                $wrong[] = "{$path} declares {$declared}w but is {$actual}px wide";
            }
        }
    }

    expect($wrong)->toBe([]);
    expect($checked)->toBeGreaterThan(0);
});

/**
 * The ladder is generated from the base shot, so the width lives in the
 * filename. This is the assertion that reaches the derivatives named by a
 * template literal, which the `srcSet` scan above cannot see.
 */
it('gives every ladder derivative the width in its filename', function (): void {
    $wrong = [];
    $checked = 0;

    foreach (publicImageFiles() as $absolute) {
        if (preg_match('#-(\d+)\.webp$#', $absolute, $match) !== 1) {
            continue;
        }

        [$actual] = imageDimensions($absolute);
        $checked++;

        if ($actual !== (int) $match[1]) {
            $name = basename($absolute);
            $wrong[] = "{$name} is {$actual}px wide";
        }
    }

    expect($wrong)->toBe([]);
    expect($checked)->toBeGreaterThan(0);
});

it('shoots both themes of a pair at one size', function (): void {
    $mismatched = [];
    $checked = 0;

    foreach (publicImageFiles() as $absolute) {
        if (! str_contains($absolute, '-light')) {
            continue;
        }

        $dark = str_replace('-light', '-dark', $absolute);

        if (! is_file($dark)) {
            continue;
        }

        $lightSize = imageDimensions($absolute);
        $darkSize = imageDimensions($dark);
        $checked++;

        if ($lightSize !== $darkSize) {
            $name = basename($absolute);
            $mismatched[] = "{$name} is {$lightSize[0]}x{$lightSize[1]} but its dark variant is {$darkSize[0]}x{$darkSize[1]}";
        }
    }

    expect($mismatched)->toBe([]);
    expect($checked)->toBeGreaterThan(0);
});
