<?php

use App\Support\Assets\AssetManifest;
use PHPUnit\Framework\Assert;

/**
 * Every screenshot on this site is captured by hand and converted to its
 * responsive ladder by hand, and nothing else checks the result. Three
 * failures are cheap to make and invisible in review: a path that no longer
 * resolves, a `srcSet` descriptor that claims a width the file does not have
 * (which makes the browser pick the wrong candidate and either blur the image
 * or download the largest one on a phone), and a dark variant re-shot at a
 * different window size, which shifts the layout for half the visitors and
 * nobody else.
 *
 * Image paths reach a page two ways: literals in the frontend sources, and
 * resources/data/assets.json, where `<AssetSlot>` builds the srcset of every
 * supplied asset and `legacySource` names the earlier captures kept for the
 * owner. Both are covered here, on the files themselves rather than on
 * rendered markup. The manifest's own rules (every promised width, format and
 * byte budget) are AssetManifestTest's.
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
        if (in_array(strtolower($file->getExtension()), ['png', 'webp', 'avif', 'jpg', 'jpeg'], true)) {
            $files[] = $file->getPathname();
        }
    }

    sort($files);

    return $files;
}

/**
 * Literal `/images/...` paths in the frontend, plus every legacy source the
 * manifest keeps for the owner. A path built from a template literal has no
 * extension at the point of reference and is skipped here; the two
 * assertions that walk `public/images` cover those files instead.
 *
 * @return array<string, string> Map of web path to the source naming it.
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
 * Every `path width` pair a srcset string declares.
 *
 * @return list<array{0: string, 1: int}>
 */
function srcSetCandidates(string $text): array
{
    preg_match_all('#(/images/[A-Za-z0-9@._/-]+\.(?:webp|avif))\s+(\d+)w#', $text, $matches, PREG_SET_ORDER);

    return array_map(fn(array $match): array => [$match[1], (int) $match[2]], $matches);
}

/**
 * The srcset strings of the page: literals in the frontend, and those
 * `<AssetSlot>` builds for each supplied manifest entry.
 *
 * @return array<string, string> Map of a label to its text.
 */
function srcSetSources(): array
{
    $sources = [];

    foreach (frontendSourceFiles() as $file) {
        $sources[str_replace(base_path() . '/', '', $file)] = (string) file_get_contents($file);
    }

    $manifest = new AssetManifest();

    foreach ($manifest->assets() as $id => $entry) {
        if ($entry['status'] !== 'supplied' || $entry['kind'] === 'og-card') {
            continue;
        }

        $sets = $entry['locale'] === 'per-locale' ? array_keys((array) $entry['src']) : [null];

        foreach ($sets as $locale) {
            [$themed, $fileLocale] = $manifest->themedSources($id, $locale ?? 'en') ?? [[], null];

            foreach (array_filter(['light' => $themed['light'] ?? null, 'dark' => $themed['dark'] ?? null]) as $variant => $source) {
                foreach ($source['formats'] as $format) {
                    $sources["assets.json {$id} {$variant} {$format}"] = $manifest->srcset($id, $source, $variant, $fileLocale, $format);
                }
            }
        }
    }

    return $sources;
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

it('reads the width descriptors of a srcset', function (): void {
    expect(srcSetCandidates('/images/a-light-720.avif 720w, /images/b/c-dark-1216.webp 1216w, /images/d.png 2x'))
        ->toBe([['/images/a-light-720.avif', 720], ['/images/b/c-dark-1216.webp', 1216]]);
});

it('gives every srcSet candidate the width its descriptor claims', function (): void {
    $wrong = [];

    foreach (srcSetSources() as $label => $text) {
        foreach (srcSetCandidates($text) as [$path, $declared]) {
            $absolute = public_path(ltrim($path, '/'));

            if (! is_file($absolute)) {
                continue;
            }

            [$actual] = imageDimensions($absolute);

            if ($actual !== $declared) {
                $wrong[] = "{$path} declares {$declared}w in {$label} but is {$actual}px wide";
            }
        }
    }

    expect($wrong)->toBe([]);
});

/**
 * The ladder is generated from the base shot, so the width lives in the
 * filename, for the earlier `name-1216.webp` files and the manifest's
 * `{base}-{light|dark}[-{locale}]-{width}.{avif|webp}` alike. This is the
 * assertion that reaches the derivatives named by a template literal, which
 * the `srcSet` scan above cannot see.
 */
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
