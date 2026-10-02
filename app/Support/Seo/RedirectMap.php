<?php

namespace App\Support\Seo;

use JsonException;
use RuntimeException;

/**
 * Every retired public URL and what answers it: a 301 to its replacement, or
 * a 410.
 *
 * Two sources, both read at request time so a change never waits for a route
 * cache rebuild:
 *
 * - `resources/data/redirects.json`, the explicit map that sitemap §C's
 *   disposition table owns. Each entry is `{from, to?, status, reason}`.
 * - The `/databases/{docsSlug}` rule. The docs site keeps one page per engine
 *   at `docs.tablepro.app/databases/{docsSlug}`, and that shape has leaked onto
 *   this domain (the plugin registry linked `/databases/oracle` for months).
 *   Each engine's `docsSlug` in `resources/data/engines.json` answers with the
 *   engine's own page, its section on a family page, or its row on the
 *   `/databases` hub. `engines.json` is only parsed for a path of that shape.
 *
 * The explicit map wins over the rule. `CanonicalizeRequest` consults this
 * class before routing; `WithoutRetiredPaths` consults it so the page registry,
 * and with it the sitemap and hreflang, never lists a URL that this map
 * answers instead.
 */
final class RedirectMap
{
    /**
     * @var array<string, array{from: string, to: string|null, status: int, reason: string}>|null
     */
    private ?array $entries = null;

    /**
     * @var array<string, string>|null
     */
    private ?array $docsTargets = null;

    public function __construct(
        private readonly string $mapPath,
        private readonly string $enginesPath,
    ) {}

    /**
     * What answers a normalised path, or null for a path that is not retired.
     *
     * @return array{status: int, to: string|null}|null
     */
    public function find(string $path): ?array
    {
        $entry = $this->entries()[$path] ?? null;

        if ($entry !== null) {
            return ['status' => $entry['status'], 'to' => $entry['to']];
        }

        if (preg_match('#^/databases/([a-z0-9-]+)$#', $path, $matches) === 1) {
            $target = $this->docsSlugTargets()[$matches[1]] ?? null;

            return $target === null ? null : ['status' => 301, 'to' => $target];
        }

        return null;
    }

    public function retires(string $path): bool
    {
        return $this->find($path) !== null;
    }

    /**
     * The explicit map, keyed by `from`.
     *
     * @return array<string, array{from: string, to: string|null, status: int, reason: string}>
     */
    public function entries(): array
    {
        if ($this->entries !== null) {
            return $this->entries;
        }

        $entries = [];

        foreach ($this->decode($this->mapPath, required: true) as $index => $entry) {
            if (! is_array($entry) || ! is_string($entry['from'] ?? null) || ! is_int($entry['status'] ?? null)) {
                throw new RuntimeException("{$this->mapPath} entry {$index} needs a string `from` and an integer `status`.");
            }

            $entries[$entry['from']] = [
                'from' => $entry['from'],
                'to' => is_string($entry['to'] ?? null) ? $entry['to'] : null,
                'status' => $entry['status'],
                'reason' => is_string($entry['reason'] ?? null) ? $entry['reason'] : '',
            ];
        }

        return $this->entries = $entries;
    }

    /**
     * Where each engine's docs-style path goes: `docsSlug` => target path.
     *
     * An engine with its own page goes there; a merged engine goes to its
     * section on the parent's page; a hub-only engine goes to its row on
     * `/databases`. An engine whose placement is incomplete gets no rule, so
     * its path stays a 404 rather than a redirect to a guess.
     *
     * @return array<string, string>
     */
    public function docsSlugTargets(): array
    {
        if ($this->docsTargets !== null) {
            return $this->docsTargets;
        }

        $data = $this->decode($this->enginesPath, required: false);
        $engines = array_is_list($data) ? $data : ($data['engines'] ?? []);
        $byId = [];

        foreach (is_array($engines) ? $engines : [] as $engine) {
            if (is_array($engine) && is_string($engine['id'] ?? null)) {
                $byId[$engine['id']] = $engine;
            }
        }

        $targets = [];

        foreach ($byId as $engine) {
            $docsSlug = $engine['docsSlug'] ?? null;

            if (! is_string($docsSlug) || preg_match('/^[a-z0-9-]+$/', $docsSlug) !== 1) {
                continue;
            }

            $target = $this->engineTarget($engine, $byId);

            if ($target !== null) {
                $targets[$docsSlug] = $target;
            }
        }

        return $this->docsTargets = $targets;
    }

    /**
     * @param  array<string, mixed>  $engine
     * @param  array<string, array<string, mixed>>  $byId
     */
    private function engineTarget(array $engine, array $byId): ?string
    {
        $anchor = is_string($engine['anchor'] ?? null) && preg_match('/^[a-z0-9-]+$/', $engine['anchor']) === 1
            ? $engine['anchor']
            : null;

        if ($anchor === null && ($engine['page'] ?? null) !== 'own') {
            return null;
        }

        return match ($engine['page'] ?? null) {
            'own' => $this->ownPage($engine),
            'section' => $this->sectionPage($engine, $byId, (string) $anchor),
            'hub' => '/databases#' . $anchor,
            default => null,
        };
    }

    /**
     * @param  array<string, mixed>  $engine
     * @param  array<string, array<string, mixed>>  $byId
     */
    private function sectionPage(array $engine, array $byId, string $anchor): ?string
    {
        $parentId = $engine['parent'] ?? null;
        $parent = is_string($parentId) ? $this->ownPage($byId[$parentId] ?? []) : null;

        return $parent === null ? null : $parent . '#' . $anchor;
    }

    /**
     * @param  array<string, mixed>  $engine
     */
    private function ownPage(array $engine): ?string
    {
        $slug = $engine['slug'] ?? null;

        if (($engine['page'] ?? null) !== 'own' || ! is_string($slug) || preg_match('/^[a-z0-9-]+$/', $slug) !== 1) {
            return null;
        }

        return '/' . $slug;
    }

    /**
     * @return array<int|string, mixed>
     */
    private function decode(string $path, bool $required): array
    {
        if (! is_file($path)) {
            if ($required) {
                throw new RuntimeException("{$path} is missing.");
            }

            return [];
        }

        try {
            $data = json_decode((string) file_get_contents($path), true, 512, JSON_THROW_ON_ERROR);
        } catch (JsonException $e) {
            throw new RuntimeException("{$path} is not valid JSON: {$e->getMessage()}", previous: $e);
        }

        if (! is_array($data)) {
            throw new RuntimeException("{$path} must hold a JSON array or object.");
        }

        return $data;
    }
}
