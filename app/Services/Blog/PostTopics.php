<?php

namespace App\Services\Blog;

use App\Support\Content\ContentRepository;
use App\Support\Content\EnginePaths;
use Illuminate\Support\Facades\File;

/**
 * The pages that cover a post's tags today: a feature page or a section of
 * one, an engine's page, and Pricing when a linked section is a paid feature
 * on the platform the post is about. Every label is the target's own title in
 * the reader's language, so nothing is typed here but the map.
 */
final class PostTopics
{
    /**
     * Tag → content page, with the id of a section or block on it.
     *
     * @var array<string, string>
     */
    private const PAGES = [
        'sql-editor' => 'features/querying#editor',
        'charts' => 'features/querying#result-charts',
        'spatial' => 'features/querying#map',
        'json' => 'features/data-editing#foreign-keys',
        'highlight-rules' => 'features/data-editing#filters',
        'data-rewind' => 'features/data-editing#data-rewind',
        'constraints' => 'features/schema#structure',
        'column-reorder' => 'features/schema#structure',
        'stored-procedures' => 'features/schema#objects',
        'sidebar' => 'features/schema#table-folders',
        'compare-sync' => 'features/schema#compare-sync',
        'copy' => 'features/schema#copy',
        'import' => 'features/import-export#import',
        'export' => 'features/import-export#export',
        'data-files' => 'features/import-export#data-files',
        'backup' => 'features/import-export#backup',
        'agent-mode' => 'features/ai-mcp#agent-mode',
        'mcp' => 'features/ai-mcp#mcp',
        'applescript' => 'features/ai-mcp#automation',
        'connections' => 'features/connections',
        'ssh' => 'features/connections#ssh',
        'icloud-sync' => 'features/sync-and-teams#icloud-sync',
        'licensing' => self::PRICING,
        'ios' => 'ios',
        'ipados' => 'ios',
    ];

    /**
     * Tags that name an engine by another word than its id in engines.json.
     *
     * @var array<string, string>
     */
    private const ENGINES = ['postgis' => 'postgresql'];

    private const PRICING = 'pricing';

    /**
     * @var array<string, array<array-key, mixed>>
     */
    private array $decoded = [];

    public function __construct(
        private readonly ContentRepository $content,
        private readonly PostRelease $releases,
        private readonly ?string $dataPath = null,
    ) {}

    /**
     * In tag order, one link per page or section, Pricing last.
     *
     * @return list<array{label: string, href: string}>
     */
    public function pages(Post $post, string $locale): array
    {
        $labels = [];
        $paid = [];

        foreach ($post->tags as $tag) {
            $link = $this->link($tag, $locale);

            if ($link !== null) {
                $labels[$link['href']] = $link['label'];
                array_push($paid, ...$link['paid']);
            }
        }

        $pricing = $this->sold($paid, $post) ? $this->page(self::PRICING, $locale) : null;

        if ($pricing !== null) {
            unset($labels[$pricing['href']]);
            $labels[$pricing['href']] = $pricing['label'];
        }

        return array_map(
            static fn(string $href, string $label): array => ['label' => $label, 'href' => $href],
            array_keys($labels),
            array_values($labels),
        );
    }

    /**
     * The page one tag names, or null for a tag no page covers.
     *
     * @return array{label: string, href: string, paid: list<string>}|null
     */
    public function link(string $tag, string $locale): ?array
    {
        $engines = EnginePaths::byId($this->json('engines.json'));
        $engine = $engines[self::ENGINES[$tag] ?? $tag] ?? null;

        if ($engine !== null) {
            $href = ($engine['state'] ?? null) === 'published' ? EnginePaths::pathFor($engine, $engines) : null;

            return $href !== null && is_string($engine['name'] ?? null) ? ['label' => $engine['name'], 'href' => $href, 'paid' => []] : null;
        }

        return isset(self::PAGES[$tag]) ? $this->page(self::PAGES[$tag], $locale) : null;
    }

    /**
     * @return array{label: string, href: string, paid: list<string>}|null
     */
    private function page(string $target, string $locale): ?array
    {
        [$name, $anchor] = array_pad(explode('#', $target, 2), 2, null);

        if (! $this->content->has($name, $locale)) {
            return null;
        }

        $copy = $this->content->page($name, $locale);

        if ($anchor === null) {
            $title = $copy['header']['title'] ?? $copy['seo']['title'] ?? null;

            return is_string($title) ? ['label' => $title, 'href' => '/' . $name, 'paid' => []] : null;
        }

        foreach ($copy['sections'] ?? [] as $section) {
            foreach ([$section, ...($section['blocks'] ?? [])] as $part) {
                if (($part['id'] ?? null) === $anchor && is_string($part['title'] ?? null)) {
                    return [
                        'label' => $part['title'],
                        'href' => '/' . $name . '#' . $anchor,
                        'paid' => array_values(array_filter((array) ($part['paid'] ?? []), 'is_string')),
                    ];
                }
            }
        }

        return null;
    }

    /**
     * A post about the iPhone app links iCloud Sync without Pricing: the
     * feature is paid on the Mac only.
     *
     * @param  list<string>  $ids  paid-features.json ids
     */
    private function sold(array $ids, Post $post): bool
    {
        $platform = $this->releases->of($post)['platform'] ?? null;

        foreach ($this->json('paid-features.json') as $feature) {
            if (is_array($feature)
                && in_array($feature['id'] ?? null, $ids, true)
                && ($platform === null || in_array($platform, (array) ($feature['platforms'] ?? []), true))) {
                return true;
            }
        }

        return false;
    }

    /**
     * @return array<array-key, mixed>
     */
    private function json(string $file): array
    {
        if (! array_key_exists($file, $this->decoded)) {
            $path = rtrim($this->dataPath ?? resource_path('data'), '/') . '/' . $file;
            $decoded = File::isFile($path) ? json_decode((string) File::get($path), true) : null;

            $this->decoded[$file] = is_array($decoded) ? $decoded : [];
        }

        return $this->decoded[$file];
    }
}
