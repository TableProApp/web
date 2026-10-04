<?php

namespace App\Services\Blog;

use App\Support\Content\MarkdownRenderer;
use App\Support\Localization\Locales;
use App\Support\Seo\BlogPosts;
use Carbon\CarbonImmutable;
use DateTimeInterface;
use Illuminate\Support\Facades\File;
use Spatie\YamlFrontMatter\YamlFrontMatter;

/**
 * Reads the blog's markdown: `resources/blog/{slug}.md` in the default
 * language, `resources/blog/{locale}/{slug}.md` for a translation with the
 * same slug.
 *
 * Each locale's glob is non-recursive, so a translation never leaks into the
 * English list. A post renders in exactly the languages it has a file in;
 * there is no fallback to another language's body. Whether a URL is a page at
 * all (a merged post that now redirects is not) is the page registry's
 * decision, which `BlogController` asks before it lists anything.
 *
 * Listing reads front matter only. The markdown body is rendered once, for
 * the post being shown, through the shared `MarkdownRenderer`.
 */
class BlogService
{
    /**
     * Posts parsed this request, by "{locale}/{slug}". Null for a missing file.
     *
     * @var array<string, Post|null>
     */
    private array $parsed = [];

    /**
     * Raw markdown bodies, by "{locale}/{slug}".
     *
     * @var array<string, string>
     */
    private array $bodies = [];

    public function __construct(
        private readonly string $blogDirectory,
        private readonly MarkdownRenderer $renderer = new MarkdownRenderer(),
    ) {}

    /**
     * Every post written in a locale, newest first.
     *
     * @return list<Post>
     */
    public function all(string $locale): array
    {
        if (! Locales::isSupported($locale)) {
            return [];
        }

        $posts = [];

        foreach (File::glob($this->localeDirectory($locale) . '/*.md') ?: [] as $file) {
            $post = $this->find(pathinfo($file, PATHINFO_FILENAME), $locale);

            if ($post !== null) {
                $posts[] = $post;
            }
        }

        return self::newestFirst($posts);
    }

    /**
     * What a locale's blog index lists, newest first: the posts written in
     * that locale, plus every default-locale post that has no translation in
     * it. On `/vi/blog` that is the English release posts, which the page
     * labels as English and links at their English URLs.
     *
     * @return list<Post>
     */
    public function listing(string $locale): array
    {
        $posts = $this->all($locale);

        if ($locale === Locales::default()) {
            return $posts;
        }

        $translated = array_map(static fn(Post $post): string => $post->slug, $posts);

        foreach ($this->all(Locales::default()) as $original) {
            if (! in_array($original->slug, $translated, true)) {
                $posts[] = $original;
            }
        }

        return self::newestFirst($posts);
    }

    /**
     * One post in one language, or null when it was not written in it.
     */
    public function find(string $slug, string $locale): ?Post
    {
        if (! BlogPosts::isSlug($slug) || ! Locales::isSupported($locale)) {
            return null;
        }

        $key = $locale . '/' . $slug;

        if (! array_key_exists($key, $this->parsed)) {
            $this->parsed[$key] = $this->parse($slug, $locale);
        }

        return $this->parsed[$key];
    }

    /**
     * The languages a post is written in, default first.
     *
     * @return list<string>
     */
    public function locales(string $slug): array
    {
        return array_values(array_filter(
            Locales::codes(),
            fn(string $locale): bool => $this->find($slug, $locale) !== null,
        ));
    }

    /**
     * The post's body as HTML.
     *
     * - Headings without an explicit `{#id}` keep the `content-…` ids the
     *   blog has always had, because links to `/blog/{slug}#content-…` are out
     *   in the world and a fragment cannot be redirected.
     * - Each h2 and h3 gets a `#` permalink after it, with an empty
     *   `aria-label`. The page fills the label from the `a11y.permalink`
     *   catalog entry in the post's language (`labelPermalinks()` in
     *   resources/js/components/blog/article-body.ts), so the words live in
     *   one place.
     * - `<asset-slot id="…"></asset-slot>` blocks pass through for the page to
     *   replace with `AssetSlot`.
     */
    public function html(Post $post): string
    {
        $body = $this->bodies[$post->locale . '/' . $post->slug] ?? '';

        return $this->renderer->render($body, '', MarkdownRenderer::BLOG_ID_PREFIX);
    }

    private function parse(string $slug, string $locale): ?Post
    {
        $path = $this->localeDirectory($locale) . '/' . $slug . '.md';

        if (! File::isFile($path)) {
            return null;
        }

        $document = YamlFrontMatter::parseFile($path);
        $release = $document->matter('release');

        $this->bodies[$locale . '/' . $slug] = $document->body();

        return new Post(
            slug: $slug,
            locale: $locale,
            title: (string) $document->matter('title'),
            description: (string) $document->matter('description'),
            date: $this->parseDate($document->matter('date')),
            tags: $this->normalizeTags($document->matter('tags')),
            release: is_string($release) && trim($release) !== '' ? trim($release) : null,
        );
    }

    private function localeDirectory(string $locale): string
    {
        return $locale === Locales::default() ? $this->blogDirectory : $this->blogDirectory . '/' . $locale;
    }

    private function parseDate(mixed $value): CarbonImmutable
    {
        if ($value instanceof DateTimeInterface) {
            return CarbonImmutable::instance($value)->startOfDay();
        }

        if (is_int($value)) {
            return CarbonImmutable::createFromTimestamp($value)->startOfDay();
        }

        return CarbonImmutable::parse((string) $value)->startOfDay();
    }

    /**
     * @return list<string>
     */
    private function normalizeTags(mixed $tags): array
    {
        if (! is_array($tags)) {
            return [];
        }

        return array_values(array_filter(
            array_map(static fn(mixed $tag): ?string => is_string($tag) ? trim($tag) : null, $tags),
            static fn(?string $tag): bool => $tag !== null && $tag !== '',
        ));
    }

    /**
     * Newest first; posts from the same day by slug, so the order is stable.
     *
     * @param  list<Post>  $posts
     * @return list<Post>
     */
    private static function newestFirst(array $posts): array
    {
        usort($posts, static fn(Post $a, Post $b): int => [$b->date->getTimestamp(), $a->slug] <=> [$a->date->getTimestamp(), $b->slug]);

        return $posts;
    }
}
