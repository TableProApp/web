<?php

namespace App\Support\Assets;

use FilesystemIterator;
use JsonException;
use RecursiveDirectoryIterator;
use RecursiveIteratorIterator;

/**
 * Where each asset id is used, found by reading the sources.
 *
 * Three forms reach `<AssetSlot>` (architecture §1.9):
 *
 * - an `<AssetSlot id="…">` literal in TSX or TS;
 * - an `"asset": "…"` value in page content, `resources/data/content/{locale}/**.json`,
 *   which a component passes on;
 * - an `<asset-slot id="…"></asset-slot>` block in blog or legal markdown,
 *   which `Blog/Post.tsx` splits out of the rendered HTML.
 *
 * `AssetManifestTest` uses this to prove every referenced id exists, and the
 * `assets:handoff` command uses it to name the components that render each id.
 */
final class AssetReferences
{
    /**
     * Ids are lowercase kebab-case, which also keeps prose such as
     * `<AssetSlot id="…">` in a doc comment from counting as a use.
     */
    private const SLOT_LITERAL = '/<AssetSlot\b[^>]*?\bid=(?:"([a-z0-9][a-z0-9-]*)"|\'([a-z0-9][a-z0-9-]*)\'|\{\s*["\']([a-z0-9][a-z0-9-]*)["\']\s*\})/s';

    private const MARKDOWN_BLOCK = '/<asset-slot\s+id="([a-z0-9][a-z0-9-]*)"/';

    /**
     * A whole `<AssetSlot … />` element in TSX, for its attributes. `=>` inside
     * an attribute is skipped so a `>` there does not end the tag early.
     */
    private const SLOT_ELEMENT = '/<AssetSlot\b((?:[^>=]|=>|=(?!>))*?)\/?>/s';

    /**
     * The scan, kept for the life of this instance: the handoff asks once per id.
     *
     * @var array<string, list<string>>|null
     */
    private ?array $all = null;

    public function __construct(
        private readonly ?string $basePath = null,
    ) {}

    /**
     * Every referenced id, with the repository paths that reference it.
     *
     * @return array<string, list<string>>
     */
    public function all(): array
    {
        if ($this->all !== null) {
            return $this->all;
        }

        $references = [];

        foreach ($this->files('resources/js', ['ts', 'tsx']) as $file) {
            preg_match_all(self::SLOT_LITERAL, (string) file_get_contents($file), $matches, PREG_SET_ORDER);

            foreach ($matches as $match) {
                $id = $match[1] ?: ($match[2] ?? '') ?: ($match[3] ?? '');
                $references[$id][] = $this->relative($file);
            }
        }

        foreach ($this->files('resources/data/content', ['json']) as $file) {
            foreach ($this->contentIds($file) as $id) {
                $references[$id][] = $this->relative($file);
            }
        }

        foreach ([...$this->files('resources/blog', ['md']), ...$this->files('resources/data/legal', ['md'])] as $file) {
            preg_match_all(self::MARKDOWN_BLOCK, (string) file_get_contents($file), $matches);

            foreach ($matches[1] as $id) {
                $references[$id][] = $this->relative($file);
            }
        }

        foreach ($references as $id => $paths) {
            $paths = array_values(array_unique($paths));
            sort($paths);
            $references[$id] = $paths;
        }

        ksort($references);

        return $this->all = $references;
    }

    /**
     * The repository paths that reference one id.
     *
     * @return list<string>
     */
    public function for(string $id): array
    {
        return $this->all()[$id] ?? [];
    }

    /**
     * Ids a TSX file places with `<AssetSlot priority>`, with the files that
     * do: a page's first image that loads with priority there although its
     * manifest entry loads lazily elsewhere.
     *
     * @return array<string, list<string>>
     */
    public function priorityPlacements(): array
    {
        $placements = [];

        foreach ($this->files('resources/js', ['tsx']) as $file) {
            preg_match_all(self::SLOT_ELEMENT, (string) file_get_contents($file), $elements);

            foreach ($elements[1] as $attributes) {
                if (preg_match('/(?:^|\s)priority(?:\s|$|=\{true\})/', $attributes) !== 1) {
                    continue;
                }

                if (preg_match('/\bid=(?:"([a-z0-9][a-z0-9-]*)"|\{\s*["\']([a-z0-9][a-z0-9-]*)["\']\s*\})/', $attributes, $match) === 1) {
                    $placements[$match[1] ?: $match[2]][] = $this->relative($file);
                }
            }
        }

        ksort($placements);

        return $placements;
    }

    /**
     * @return list<string>
     */
    private function contentIds(string $file): array
    {
        try {
            $data = json_decode((string) file_get_contents($file), true, 512, JSON_THROW_ON_ERROR);
        } catch (JsonException) {
            return [];
        }

        if (! is_array($data)) {
            return [];
        }

        $ids = [];

        array_walk_recursive($data, function (mixed $value, int|string $key) use (&$ids): void {
            if ($key === 'asset' && is_string($value)) {
                $ids[] = $value;
            }
        });

        return $ids;
    }

    /**
     * @param  list<string>  $extensions
     * @return list<string>
     */
    private function files(string $directory, array $extensions): array
    {
        $root = $this->root() . '/' . $directory;

        if (! is_dir($root)) {
            return [];
        }

        $files = [];
        $tree = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($root, FilesystemIterator::SKIP_DOTS));

        foreach ($tree as $file) {
            if (in_array($file->getExtension(), $extensions, true)) {
                $files[] = $file->getPathname();
            }
        }

        sort($files);

        return $files;
    }

    private function relative(string $file): string
    {
        return ltrim(substr($file, strlen($this->root())), '/');
    }

    private function root(): string
    {
        return rtrim($this->basePath ?? base_path(), '/');
    }
}
