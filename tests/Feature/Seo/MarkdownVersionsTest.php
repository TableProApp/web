<?php

use App\Support\Assets\AssetManifest;
use App\Support\Content\ContentRepository;
use App\Support\Content\MarkdownExport;
use App\Support\Seo\PageEntry;
use App\Support\Seo\PageRegistry;
use Illuminate\Support\Facades\Http;
use Inertia\Testing\AssertableInertia;
use PHPUnit\Framework\Assert;

beforeEach(function (): void {
    config(['app.web_domain' => 'tablepro.app']);
    Http::fake(['api.github.com/*' => Http::response([], 200)]);
});

it('serves a post as markdown, pointing back at its page', function (): void {
    $response = $this->get('/blog/open-sqlite-file-mac.md')->assertOk();
    $body = (string) $response->getContent();

    expect($response->headers->get('Content-Type'))->toBe('text/markdown; charset=utf-8')
        ->and($response->headers->get('Link'))->toBe('<https://tablepro.app/blog/open-sqlite-file-mac>; rel="canonical"')
        ->and($response->headers->get('Cache-Control'))->toContain('s-maxage=600')
        ->and($response->headers->getCookies())->toBe([]);

    expect($body)->toStartWith("# Open and query a SQLite file on a Mac\n\n> Open a SQLite file with sqlite3 or TablePro.")
        ->toContain("\n\nOctober 8, 2026 · TablePro\n\n")
        ->toContain("\n## Check that the file is SQLite\n")
        ->toContain("```bash\nfile ~/Downloads/app.db\n```")
        ->not->toContain('{#')
        ->not->toContain('<asset-slot');
});

it('carries the dated correction the page shows', function (): void {
    $correction = app(ContentRepository::class)->page('blog', 'en')['corrections']['tablepro-0-74'];
    $body = (string) $this->get('/blog/tablepro-0-74.md')->assertOk()->getContent();

    expect($body)->toContain("> **Correction, October 2, 2026**\n>\n> " . $correction['text']);
});

it('serves a translated legal page with its notice, its facts filled and its controls dropped', function (): void {
    $response = $this->get('/vi/privacy.md')->assertOk();
    $body = (string) $response->getContent();

    expect($response->headers->get('Link'))->toBe('<https://tablepro.app/vi/privacy>; rel="canonical"');

    expect($body)->toStartWith('# Chính sách quyền riêng tư')
        ->toContain('Cập nhật lần cuối: ')
        ->toContain("> **Bản dịch**\n>\n> ")
        ->toContain('(https://tablepro.app/privacy.md)')
        ->not->toContain('<english>')
        ->not->toContain('<cookie-settings>')
        ->not->toMatch('/\{[a-zA-Z]+\}/');

    expect((string) $this->get('/privacy.md')->assertOk()->getContent())->not->toContain('> **Translation**');
});

it('answers 404 where the page does not render', function (string $path): void {
    $this->get($path)->assertNotFound();
})->with([
    'an English-only post in Vietnamese' => ['/vi/blog/tablepro-0-74.md'],
    'the English-only brand page in Vietnamese' => ['/vi/brand.md'],
    'a post that does not exist' => ['/blog/no-such-post.md'],
    'a page with no markdown version' => ['/pricing.md'],
]);

it('serves every markdown version in every locale its page renders in', function (): void {
    $checked = 0;

    foreach (app(PageRegistry::class)->all() as $entry) {
        foreach ($entry->markdown ? $entry->renderLocales : [] as $locale) {
            $path = (string) $entry->markdownUrl($locale, false);
            $response = $this->get($path);

            Assert::assertSame(200, $response->getStatusCode(), "{$path} does not answer");
            Assert::assertSame('<' . $entry->url($locale) . '>; rel="canonical"', $response->headers->get('Link'), "{$path} names the wrong page");
            Assert::assertStringStartsWith('# ', (string) $response->getContent(), "{$path} has no title");
            $checked++;
        }
    }

    expect($checked)->toBeGreaterThan(40);
});

it('links the markdown version from the page head, and only where there is one', function (): void {
    $this->get('/blog/open-sqlite-file-mac')
        ->assertInertia(fn(AssertableInertia $page) => $page->where('seo.markdown', 'https://tablepro.app/blog/open-sqlite-file-mac.md'));

    $this->get('/vi/terms')
        ->assertInertia(fn(AssertableInertia $page) => $page->where('seo.markdown', 'https://tablepro.app/vi/terms.md'));

    $this->get('/pricing')
        ->assertInertia(fn(AssertableInertia $page) => $page->where('seo.markdown', null));
});

it('gives only blog posts and legal pages a markdown version', function (): void {
    $routes = collect(app(PageRegistry::class)->all())
        ->filter(fn(PageEntry $entry): bool => $entry->markdown)
        ->map(fn(PageEntry $entry): string => $entry->route)
        ->unique()
        ->sort()
        ->values()
        ->all();

    expect($routes)->toBe(['landing.blog.show', 'landing.brand', 'landing.privacy', 'landing.refundPolicy', 'landing.terms']);
});

it('leaves code blocks as written', function (): void {
    $markdown = "## Setup {#setup}\n\n```markdown\n## Kept {#kept}\n<asset-slot id=\"x\"></asset-slot>\n```\n\n    <cookie-settings></cookie-settings>\n";

    expect(app(MarkdownExport::class)->body($markdown, 'en', ['<cookie-settings></cookie-settings>']))
        ->toBe("## Setup\n\n```markdown\n## Kept {#kept}\n<asset-slot id=\"x\"></asset-slot>\n```\n\n    <cookie-settings></cookie-settings>\n");
});

it('renders a supplied image as the page loads it and drops a placeholder', function (): void {
    $manifest = app(AssetManifest::class);
    $placeholder = collect(array_keys($manifest->assets()))->first(fn(string $id): bool => $manifest->entry($id)['slot'] && ! $manifest->isSupplied($id));

    expect($manifest->isSupplied('blog-tablepro-0-74-1'))->toBeTrue()
        ->and($placeholder)->toBeString();

    $body = app(MarkdownExport::class)->body(
        "Before.\n\n<asset-slot id=\"blog-tablepro-0-74-1\"></asset-slot>\n\nMiddle.\n\n<asset-slot id=\"{$placeholder}\"></asset-slot>\n\nAfter.",
        'en',
    );

    expect($body)->toMatch('#^Before\.\n\n!\[[^\n]+\]\(https://tablepro\.app/images/blog/blog-tablepro-0-74-1-light-\d+\.webp\)\n\n(?:[^\n]+\n\n)?Middle\.\n\nAfter\.$#');
});

it('advertises the markdown version in the head', function (): void {
    expect(ssrHtml('/blog/open-sqlite-file-mac'))->toContain('<link rel="alternate" type="text/markdown" href="https://tablepro.app/blog/open-sqlite-file-mac.md"')
        ->and(ssrHtml('/pricing'))->not->toContain('text/markdown');
})->group('ssr');
