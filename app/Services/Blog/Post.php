<?php

namespace App\Services\Blog;

use App\Support\Localization\LocalizedUrl;
use Carbon\CarbonImmutable;

/**
 * One blog post in one language.
 *
 * `locale` is the language the post is written in, which is the language of
 * its URL: `resources/blog/{slug}.md` is the English post at `/blog/{slug}`,
 * `resources/blog/vi/{slug}.md` its Vietnamese translation at
 * `/vi/blog/{slug}`. Release posts exist in English only.
 *
 * `date` is the original publication date from the front matter, and never
 * changes. `release` names what a release post announced ("TablePro 0.74"),
 * for the archive note above it; null for a post that announced no release.
 * `tags` only rank related posts; the pages do not print them. The body is
 * not held here: `BlogService::html()` renders it for the one post shown.
 */
final readonly class Post
{
    /**
     * @param  list<string>  $tags
     */
    public function __construct(
        public string $slug,
        public string $locale,
        public string $title,
        public string $description,
        public CarbonImmutable $date,
        public array $tags,
        public ?string $release,
    ) {}

    /**
     * The post's root-relative URL in its own language.
     */
    public function url(): string
    {
        return LocalizedUrl::path('/blog/' . $this->slug, $this->locale);
    }

    /**
     * The publication date as a page in `$locale` writes it: "September 13,
     * 2026", "13 tháng 9 năm 2026". Formatted here, never in the browser, so
     * the server and the client render the same bytes.
     */
    public function dateFormatted(string $locale): string
    {
        return $this->date->locale($locale)->isoFormat('LL');
    }

    /**
     * What a list of posts shows for this one, on a page in `$pageLocale`.
     *
     * @return array{slug: string, locale: string, title: string, description: string, date: string, dateFormatted: string, url: string}
     */
    public function summary(string $pageLocale): array
    {
        return [
            'slug' => $this->slug,
            'locale' => $this->locale,
            'title' => $this->title,
            'description' => $this->description,
            'date' => $this->date->toDateString(),
            'dateFormatted' => $this->dateFormatted($pageLocale),
            'url' => $this->url(),
        ];
    }
}
