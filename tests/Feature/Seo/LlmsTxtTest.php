<?php

use App\Services\Blog\BlogService;
use App\Services\Blog\Post;
use App\Support\Seo\PageRegistry;

beforeEach(function (): void {
    config(['app.web_domain' => 'tablepro.app']);
});

function llmsTxtSections(): array
{
    $sections = [];
    $current = null;

    foreach (explode("\n", (string) test()->get('/llms.txt')->getContent()) as $line) {
        if (str_starts_with($line, '## ')) {
            $current = substr($line, 3);
            $sections[$current] = [];
        } elseif ($current !== null && $line !== '') {
            $sections[$current][] = $line;
        }
    }

    return $sections;
}

function llmsTxtUrl(string $line): string
{
    preg_match('/^- \[[^\]]+\]\(([^)]+)\)/', $line, $match);

    return $match[1] ?? '';
}

it('follows the llmstxt.org layout', function (): void {
    $response = $this->get('/llms.txt')->assertOk()->assertHeader('Content-Type', 'text/plain; charset=utf-8');

    expect($response->getContent())->toStartWith("# TablePro\n\n> ")
        ->not->toContain('{')
        ->and(llmsTxtSections())->toHaveKey('Docs');

    foreach (llmsTxtSections() as $section => $lines) {
        foreach ($lines as $line) {
            expect($line)->toMatch('/^- \[[^\]\n]+\]\(https:\/\/[^)\s]+\)(: \S.*)?$/', "{$section}: {$line}");
        }
    }
});

it('lists every indexed English page once, with posts and legal pages as markdown', function (): void {
    $sections = llmsTxtSections();
    unset($sections['Docs']);

    $listed = array_map(llmsTxtUrl(...), array_merge(...array_values($sections)));
    $skipped = ['landing.home', 'landing.blog.index', 'landing.integrations.show', 'landing.black-friday'];
    $expected = [];

    foreach (app(PageRegistry::class)->all() as $entry) {
        if ($entry->isIndexable('en') && ! in_array($entry->route, $skipped, true)) {
            $expected[] = $entry->markdownUrl('en') ?? $entry->url('en');
        }
    }

    expect($listed)->toBe(array_values(array_unique($listed)))
        ->and($listed)->toEqualCanonicalizing($expected);
});

it('lists guides apart from release posts and news, newest first', function (): void {
    $guides = array_values(array_filter(app(BlogService::class)->all('en'), fn(Post $post): bool => $post->kind() === Post::KIND_GUIDE));

    expect(array_map(llmsTxtUrl(...), llmsTxtSections()['Guides']))
        ->toBe(array_map(fn(Post $post): string => "https://tablepro.app/blog/{$post->slug}.md", $guides));
});
