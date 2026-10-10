<?php

use App\Support\Assets\AssetManifest;
use PHPUnit\Framework\Assert;

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
        if (in_array(strtolower($file->getExtension()), ['png', 'webp', 'avif', 'jpg', 'jpeg'], true)) {
            $files[] = $file->getPathname();
        }
    }

    sort($files);

    return $files;
}

/**
 * @return array<string, string>
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

    foreach ((new AssetManifest())->assets() as $id => $entry) {
        foreach ((array) ($entry['legacySource'] ?? []) as $path) {
            $paths[$path] ??= "resources/data/assets.json ({$id})";
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

it('serves every image the frontend or the asset manifest names', function (): void {
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

it('gives every ladder derivative the width in its filename', function (): void {
    $wrong = [];
    $checked = 0;

    foreach (publicImageFiles() as $absolute) {
        if (preg_match('#-(\d+)\.(?:webp|avif)$#', $absolute, $match) !== 1) {
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
    Assert::assertGreaterThan(0, $checked, 'No ladder derivative found under public/images: the filename pattern no longer matches anything.');
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
    Assert::assertGreaterThan(0, $checked, 'No light and dark pair found under public/images.');
});
