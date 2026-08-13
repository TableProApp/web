<?php

namespace App\Services\Blog;

use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\File;
use League\CommonMark\Extension\CommonMark\CommonMarkCoreExtension;
use League\CommonMark\Extension\GithubFlavoredMarkdownExtension;
use League\CommonMark\Extension\HeadingPermalink\HeadingPermalinkExtension;
use League\CommonMark\Extension\Table\TableExtension;
use League\CommonMark\MarkdownConverter;
use League\CommonMark\Environment\Environment;
use Phiki\Adapters\CommonMark\PhikiExtension;
use Phiki\Theme\Theme;
use Spatie\YamlFrontMatter\YamlFrontMatter;

class BlogService
{
    private const WORDS_PER_MINUTE = 200;

    public function __construct(
        private readonly string $blogDirectory,
    ) {}

    /**
     * @return list<Post>
     */
    public function all(): array
    {
        if (! File::isDirectory($this->blogDirectory)) {
            return [];
        }

        $files = File::glob($this->blogDirectory . '/*.md');

        $posts = array_map(fn(string $file): Post => $this->parseFile($file), $files);

        usort($posts, fn(Post $a, Post $b): int => $b->date->getTimestamp() <=> $a->date->getTimestamp());

        return $posts;
    }

    public function find(string $slug): ?Post
    {
        if (! preg_match('/^[a-z0-9-]+$/', $slug)) {
            return null;
        }

        $path = $this->blogDirectory . '/' . $slug . '.md';

        if (! File::isFile($path)) {
            return null;
        }

        return $this->parseFile($path);
    }

    private function parseFile(string $path): Post
    {
        $document = YamlFrontMatter::parseFile($path);

        $slug = (string) ($document->matter('slug') ?? pathinfo($path, PATHINFO_FILENAME));
        $body = $document->body();

        $wordCount = $this->countWords($body);

        return new Post(
            slug: $slug,
            title: (string) $document->matter('title'),
            description: (string) $document->matter('description'),
            date: $this->parseDate($document->matter('date')),
            author: (string) ($document->matter('author') ?? 'TablePro Team'),
            tags: $this->normalizeTags($document->matter('tags')),
            body: $body,
            bodyHtml: $this->renderMarkdown($body),
            readingMinutes: max(1, (int) ceil($wordCount / self::WORDS_PER_MINUTE)),
            wordCount: $wordCount,
            ogPunchline: $document->matter('ogPunchline') ? (string) $document->matter('ogPunchline') : null,
        );
    }

    private function parseDate(mixed $value): CarbonImmutable
    {
        if ($value instanceof \DateTimeInterface) {
            return CarbonImmutable::instance($value);
        }

        if (is_int($value)) {
            return CarbonImmutable::createFromTimestamp($value);
        }

        return CarbonImmutable::parse((string) $value);
    }

    /**
     * @param  mixed  $tags
     * @return list<string>
     */
    private function normalizeTags(mixed $tags): array
    {
        if (! is_array($tags)) {
            return [];
        }

        return array_values(array_filter(
            array_map(static fn(mixed $t): ?string => is_string($t) ? trim($t) : null, $tags),
            static fn(?string $t): bool => $t !== null && $t !== '',
        ));
    }

    private function renderMarkdown(string $body): string
    {
        $environment = new Environment([
            'html_input' => 'allow',
            'allow_unsafe_links' => false,
            'heading_permalink' => [
                'symbol' => '#',
                'html_class' => 'heading-permalink',
                'insert' => 'after',
            ],
        ]);

        $environment->addExtension(new CommonMarkCoreExtension());
        $environment->addExtension(new GithubFlavoredMarkdownExtension());
        $environment->addExtension(new TableExtension());
        $environment->addExtension(new HeadingPermalinkExtension());
        $environment->addExtension(new PhikiExtension(theme: [
            'light' => Theme::GithubLightDefault,
            'dark' => Theme::GithubDarkDefault,
        ]));

        $converter = new MarkdownConverter($environment);

        return (string) $converter->convert($body);
    }

    private function countWords(string $body): int
    {
        $words = preg_split('/\s+/', strip_tags($body), -1, PREG_SPLIT_NO_EMPTY) ?: [];

        return count($words);
    }
}
