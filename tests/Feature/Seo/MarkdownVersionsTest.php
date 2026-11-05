<?php

use App\Services\Blog\BlogService;
use App\Support\Assets\AssetManifest;
use App\Support\Content\ContentRepository;
use App\Support\Content\MarkdownExport;
use App\Support\Seo\PageRegistry;
use Illuminate\Support\Facades\Http;
use Inertia\Testing\AssertableInertia;

beforeEach(function (): void {
    config(['app.web_domain' => 'tablepro.app']);
    Http::fake(['api.github.com/*' => Http::response([], 200)]);
});

it('serves a post as markdown, pointing back at its page', function (): void {
    $post = app(BlogService::class)->all('en')[0];
    $response = $this->get("/blog/{$post->slug}.md")->assertOk();

    expect($response->headers->get('Content-Type'))->toBe('text/markdown; charset=utf-8')
        ->and($response->headers->get('Link'))->toBe("<https://tablepro.app/blog/{$post->slug}>; rel=\"canonical\"")
        ->and($response->headers->get('Cache-Control'))->toContain('s-maxage=600')
        ->and($response->headers->getCookies())->toBe([])
        ->and($response->getContent())->toStartWith("# {$post->title}\n\n")
        ->not->toContain('{#')
        ->not->toContain('<asset-slot');
});

it('carries each dated correction the page shows', function (): void {
    $corrections = app(ContentRepository::class)->page('blog', 'en')['corrections'] ?? [];

    foreach ($corrections as $slug => $correction) {
        expect($this->get("/blog/{$slug}.md")->assertOk()->getContent())->toContain($correction['text']);
    }
});

it('serves a translated legal page with its facts filled and its controls dropped', function (): void {
    $response = $this->get('/vi/privacy.md')->assertOk();

    expect($response->headers->get('Link'))->toBe('<https://tablepro.app/vi/privacy>; rel="canonical"')
        ->and($response->getContent())->toStartWith('# ')
        ->toContain('(https://tablepro.app/privacy.md)')
        ->not->toContain('<english>')
        ->not->toContain('<cookie-settings>')
        ->not->toMatch('/\{[a-zA-Z]+\}/');
});

it('serves every markdown version in every locale its page renders in', function (): void {
    foreach (app(PageRegistry::class)->all() as $entry) {
        foreach ($entry->markdown ? $entry->renderLocales : [] as $locale) {
            $path = (string) $entry->markdownUrl($locale, false);

            $this->get($path)->assertOk()->assertHeader('Link', '<' . $entry->url($locale) . '>; rel="canonical"');
        }
    }
});

it('answers 404 where the page does not render', function (string $path): void {
    $this->get($path)->assertNotFound();
})->with([
    'an English-only post in Vietnamese' => ['/vi/blog/tablepro-0-74.md'],
    'the English-only brand page in Vietnamese' => ['/vi/brand.md'],
    'a post that does not exist' => ['/blog/no-such-post.md'],
    'a page with no markdown version' => ['/pricing.md'],
]);

it('links the markdown version from the page head, and only where there is one', function (): void {
    $post = app(BlogService::class)->all('en')[0];

    $this->get("/blog/{$post->slug}")->assertInertia(fn(AssertableInertia $page) => $page->where('seo.markdown', "https://tablepro.app/blog/{$post->slug}.md"));
    $this->get('/vi/terms')->assertInertia(fn(AssertableInertia $page) => $page->where('seo.markdown', 'https://tablepro.app/vi/terms.md'));
    $this->get('/pricing')->assertInertia(fn(AssertableInertia $page) => $page->where('seo.markdown', null));
});

it('leaves code blocks as written', function (): void {
    $markdown = "## Setup {#setup}\n\n```markdown\n## Kept {#kept}\n<asset-slot id=\"x\"></asset-slot>\n```\n\n    <cookie-settings></cookie-settings>\n";

    expect(app(MarkdownExport::class)->body($markdown, 'en', ['<cookie-settings></cookie-settings>']))
        ->toBe("## Setup\n\n```markdown\n## Kept {#kept}\n<asset-slot id=\"x\"></asset-slot>\n```\n\n    <cookie-settings></cookie-settings>\n");
});

it('renders a supplied image as an image and drops a placeholder', function (): void {
    $manifest = app(AssetManifest::class);
    $slots = collect(array_keys($manifest->assets()))->filter(fn(string $id): bool => $manifest->entry($id)['slot']);
    $supplied = $slots->first(fn(string $id): bool => $manifest->isSupplied($id));
    $placeholder = $slots->first(fn(string $id): bool => ! $manifest->isSupplied($id));

    $body = app(MarkdownExport::class)->body(
        "Before.\n\n<asset-slot id=\"{$supplied}\"></asset-slot>\n\nMiddle.\n\n<asset-slot id=\"{$placeholder}\"></asset-slot>\n\nAfter.",
        'en',
    );

    expect($body)->toMatch('#^Before\.\n\n!\[[^\n]+\]\(https://tablepro\.app/images/[^)]+\)\n\n(?:[^\n]+\n\n)?Middle\.\n\nAfter\.$#');
});

it('advertises the markdown version in the head', function (): void {
    $post = app(BlogService::class)->all('en')[0];

    expect(ssrHtml("/blog/{$post->slug}"))->toContain("<link rel=\"alternate\" type=\"text/markdown\" href=\"https://tablepro.app/blog/{$post->slug}.md\"")
        ->and(ssrHtml('/pricing'))->not->toContain('text/markdown');
})->group('ssr');
