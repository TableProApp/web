<?php

namespace App\Services\Blog;

use Carbon\CarbonImmutable;

class Post
{
    /**
     * @param  list<string>  $tags
     */
    public function __construct(
        public readonly string $slug,
        public readonly string $title,
        public readonly string $description,
        public readonly CarbonImmutable $date,
        public readonly string $author,
        public readonly array $tags,
        public readonly string $body,
        public readonly string $bodyHtml,
        public readonly int $readingMinutes,
        public readonly int $wordCount,
        public readonly ?string $ogPunchline = null,
    ) {}

    public function url(): string
    {
        return '/blog/' . $this->slug;
    }

    public function ogImagePath(): string
    {
        return '/og/blog/' . $this->slug . '.png';
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        return [
            'slug' => $this->slug,
            'title' => $this->title,
            'description' => $this->description,
            'date' => $this->date->toIso8601String(),
            'dateFormatted' => $this->date->format('F j, Y'),
            'author' => $this->author,
            'tags' => $this->tags,
            'bodyHtml' => $this->bodyHtml,
            'readingMinutes' => $this->readingMinutes,
            'wordCount' => $this->wordCount,
            'url' => $this->url(),
            'ogImage' => $this->ogImagePath(),
            'ogPunchline' => $this->ogPunchline,
        ];
    }
}
