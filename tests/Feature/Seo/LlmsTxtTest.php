<?php

use App\Services\Blog\BlogService;
use App\Services\Blog\Post;
use App\Services\Content\SiteFacts;
use App\Support\Content\ContentRepository;
use App\Support\Seo\PageRegistry;

beforeEach(function (): void {
    config(['app.web_domain' => 'tablepro.app']);
});

/**
 * @return array<string, list<string>>
 */
function llmsTxtSections(string $body): array
{
    $sections = [];
    $current = null;

    foreach (explode("\n", $body) as $line) {
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
    $response = $this->get('/llms.txt')->assertOk();
    $body = (string) $response->getContent();
    $summary = app(ContentRepository::class)->page('home', 'en')['seo']['description'];

    expect($response->headers->get('Content-Type'))->toBe('text/plain; charset=utf-8')
        ->and($response->headers->get('Cache-Control'))->toContain('s-maxage=600');

    expect($body)->toStartWith("# TablePro\n\n> {$summary}\n\n## ")
        ->toEndWith("\n")
        ->not->toContain('{');

    expect(array_keys(llmsTxtSections($body)))->toBe(['Docs', 'Product', 'Databases', 'Comparisons', 'Guides', 'Optional']);

    foreach (llmsTxtSections($body) as $section => $lines) {
        foreach ($lines as $line) {
            expect($line)->toMatch('/^- \[[^\]\n]+\]\(https:\/\/[^)\s]+\)(: \S.*)?$/', "{$section}: {$line}");
        }
    }
});

it('points at the documentation index', function (): void {
    $docs = rtrim((string) app(SiteFacts::class)->links()['docs'], '/');

    expect(llmsTxtSections((string) $this->get('/llms.txt')->getContent())['Docs'])->toBe(["- [Documentation]({$docs}/llms.txt)"]);
});

it('lists every indexed English page once, with posts and legal pages as markdown', function (): void {
    $sections = llmsTxtSections((string) $this->get('/llms.txt')->getContent());
    unset($sections['Docs']);

    $listed = array_map('llmsTxtUrl', array_merge(...array_values($sections)));
    $skipped = ['landing.home', 'landing.blog.index', 'landing.integrations.show'];
    $expected = [];

    foreach (app(PageRegistry::class)->all() as $entry) {
        if ($entry->isIndexable('en') && ! in_array($entry->route, $skipped, true)) {
            $expected[] = $entry->markdownUrl('en') ?? $entry->url('en');
        }
    }

    sort($expected);
    $sorted = $listed;
    sort($sorted);

    expect($listed)->toBe(array_values(array_unique($listed)))
        ->and($sorted)->toBe($expected);

});

it('lists guides apart from release posts, newest first', function (): void {
    $sections = llmsTxtSections((string) $this->get('/llms.txt')->getContent());
    $posts = app(BlogService::class)->all('en');

    $guides = array_values(array_filter($posts, fn(Post $post): bool => $post->kind() === Post::KIND_GUIDE));
    $releases = array_values(array_filter($posts, fn(Post $post): bool => $post->kind() === Post::KIND_RELEASE));

    expect($guides)->not->toBeEmpty()
        ->and($releases)->not->toBeEmpty();

    expect(array_map('llmsTxtUrl', $sections['Guides']))
        ->toBe(array_map(fn(Post $post): string => "https://tablepro.app/blog/{$post->slug}.md", $guides));

    expect(array_slice(array_map('llmsTxtUrl', $sections['Optional']), 0, count($releases)))
        ->toBe(array_map(fn(Post $post): string => "https://tablepro.app/blog/{$post->slug}.md", $releases));
});

it('names a page by its title, and by its card title where the title has a slot', function (): void {
    $body = (string) $this->get('/llms.txt')->getContent();
    $postgres = app(ContentRepository::class)->page('databases/postgresql-client', 'en');
    $pricing = app(ContentRepository::class)->page('pricing', 'en');

    expect($postgres['seo']['title'])->toContain('{')
        ->and($body)->toContain("- [{$postgres['og']['title']}](https://tablepro.app/postgresql-client): {$postgres['seo']['description']}\n")
        ->and($body)->toContain("- [{$pricing['seo']['title']}](https://tablepro.app/pricing): {$pricing['seo']['description']}\n");
});
