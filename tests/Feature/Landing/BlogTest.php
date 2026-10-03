<?php

use App\Services\Blog\BlogService;
use App\Support\Assets\AssetManifest;
use App\Support\Content\ContentRepository;
use App\Support\Seo\PageRegistry;
use App\Support\Seo\RedirectMap;
use Illuminate\Support\Facades\File;
use Inertia\Testing\AssertableInertia;
use Spatie\YamlFrontMatter\YamlFrontMatter;

use function Pest\Laravel\withoutVite;

require_once __DIR__ . '/../Seo/helpers.php';

/*
 * The blog (sitemap §A.5, §C.5, §E.6; architecture §1.1, §1.9, §1.17).
 *
 * - `/blog` lists exactly the posts on disk, newest first. The four guides
 *   merged into other pages are gone, and their URLs redirect.
 * - Release posts are an English-only archive: the date and title as
 *   published, each figure a `blog-{slug}-{n}` placeholder slot whose
 *   manifest entry keeps the original image as its source, the `content-…`
 *   heading ids that links out in the world point at, and a dated correction
 *   only where a post said something that was never true.
 * - `/vi/blog` renders in Vietnamese without being indexed and lists the
 *   English posts as English, at their English URLs. `/vi/blog/{slug}` is a
 *   404 that links the English post by its title, never an English body under
 *   Vietnamese chrome.
 * - Related posts stay in the post's language.
 */

beforeEach(function (): void {
    withoutVite();
});

/**
 * The published dates of the release posts. A post is dated as it was
 * published and never re-dated by an edit (sitemap §E.6).
 */
const BLOG_PUBLISHED = [
    'tablepro-0-77' => '2026-10-02',
    'tablepro-0-76' => '2026-09-28',
    'tablepro-for-iphone' => '2026-09-22',
    'tablepro-0-74' => '2026-09-13',
    'tablepro-0-73' => '2026-09-09',
    'tablepro-0-72' => '2026-09-04',
    'tablepro-0-70' => '2026-09-01',
    'tablepro-0-69' => '2026-08-27',
    'tablepro-0-68' => '2026-08-25',
    'tablepro-0-67' => '2026-08-21',
];

/** The guides merged into other pages (sitemap §C.5), with where each one went. */
const BLOG_MERGED = [
    'mcp-database-claude' => '/features/ai-mcp#mcp',
    'cloudflare-d1-mac' => '/cloudflare-d1-client',
    'mongodb-native-vs-compass' => '/mongodb-client#compass',
    'open-source-db-clients-2026' => '/compare#open-source',
];

/**
 * The English posts on disk, by slug.
 *
 * @return list<string>
 */
function blogFiles(): array
{
    $slugs = array_map(fn(string $file): string => pathinfo($file, PATHINFO_FILENAME), glob(resource_path('blog/*.md')) ?: []);
    sort($slugs);

    return $slugs;
}

/**
 * A post's front matter.
 *
 * @return array<string, mixed>
 */
function blogMatter(string $slug): array
{
    return YamlFrontMatter::parseFile(resource_path("blog/{$slug}.md"))->matter();
}

/**
 * The asset ids a post's body places, in document order.
 *
 * @return list<string>
 */
function blogSlotIds(string $html): array
{
    preg_match_all('/<asset-slot id="([^"]+)"><\/asset-slot>/', $html, $matches);

    return $matches[1];
}

it('lists exactly the posts on disk, newest first', function (): void {
    $expected = array_keys(BLOG_PUBLISHED);

    expect(blogFiles())->toBe(collect($expected)->sort()->values()->all());

    $this->get('/blog')
        ->assertOk()
        ->assertInertia(fn(AssertableInertia $page) => $page
            ->component('Blog/Index')
            ->where('locale', 'en')
            ->where('seo.robots', 'index, follow')
            ->where('seo.canonical', 'https://localhost/blog')
            ->where('seo.alternates', [])
            ->where('content.header.title', 'Blog')
            ->missing('content.corrections')
            ->has('posts', count($expected))
            ->where('posts', fn($posts): bool => collect($posts)->pluck('slug')->all() === $expected)
            ->where('posts.0.url', '/blog/' . $expected[0])
            ->where('posts.0.locale', 'en')
            ->where('posts.0.date', BLOG_PUBLISHED[$expected[0]])
            ->where('posts.0.dateFormatted', 'October 2, 2026'));
});

it('removes the merged guides, whose URLs now redirect', function (string $slug, string $target): void {
    expect(File::exists(resource_path("blog/{$slug}.md")))->toBeFalse();

    $this->get("/blog/{$slug}")
        ->assertStatus(301)
        ->assertHeader('Location', 'https://localhost' . $target);
})->with(fn(): array => collect(BLOG_MERGED)->map(fn(string $target, string $slug): array => [$slug, $target])->values()->all());

it('renders each release post as the archive it is', function (string $slug): void {
    $matter = blogMatter($slug);
    $manifest = (new AssetManifest())->assets();
    $slots = array_values(array_filter(array_keys($manifest), fn(string $id): bool => preg_match('/^blog-' . preg_quote($slug, '/') . '-\d+$/', $id) === 1));
    natsort($slots);

    $this->get("/blog/{$slug}")
        ->assertOk()
        ->assertInertia(fn(AssertableInertia $page) => $page
            ->component('Blog/Post')
            ->where('locale', 'en')
            ->where('seo.robots', 'index, follow')
            ->where('seo.canonical', "https://localhost/blog/{$slug}")
            ->where('seo.alternates', [])
            ->where('post.slug', $slug)
            ->where('post.locale', 'en')
            ->where('post.url', "/blog/{$slug}")
            ->where('post.title', $matter['title'])
            ->where('post.description', $matter['description'])
            ->where('post.date', BLOG_PUBLISHED[$slug])
            ->where('post.release', fn(?string $release): bool => is_string($release) && str_starts_with($release, 'TablePro '))
            ->where('post.bodyHtml', function (string $html) use ($slots): bool {
                expect($html)
                    ->not->toContain('<img')
                    ->not->toContain('<figure')
                    ->not->toContain('/images/blog/');
                expect(blogSlotIds($html))->toBe(array_values($slots));

                return true;
            })
            ->has('related', 3)
            ->where('related', fn($related): bool => collect($related)->every(
                fn(array $post): bool => $post['slug'] !== $slug && $post['locale'] === 'en' && str_starts_with($post['url'], '/blog/'),
            )));
})->with(array_keys(BLOG_PUBLISHED));

it('gives every figure a placeholder that keeps the original image as its source', function (): void {
    $manifest = (new AssetManifest())->assets();
    $placed = [];

    foreach (blogFiles() as $slug) {
        foreach (blogSlotIds((string) file_get_contents(resource_path("blog/{$slug}.md"))) as $id) {
            $placed[] = $id;
            $entry = $manifest[$id] ?? null;

            expect($entry)->not->toBeNull("{$slug} places {$id}, which the manifest does not have");
            expect($entry['family'])->toBe('blog');
            expect($entry['slot'])->toBeTrue();
            expect($entry['usedOn'][0]['path'])->toBe("/blog/{$slug}");

            foreach ((array) $entry['legacySource'] as $source) {
                expect(File::exists(public_path(ltrim($source, '/'))))->toBeTrue("{$id}'s original image {$source} is missing");
            }
        }
    }

    $blogSlots = array_keys(array_filter($manifest, fn(array $entry): bool => $entry['family'] === 'blog' && $entry['slot']));
    sort($blogSlots);
    sort($placed);

    expect($placed)->toBe($blogSlots);
});

it('keeps the fragment ids links out in the world point at, with a permalink after each h2 and h3', function (): void {
    $this->get('/blog/tablepro-0-77')
        ->assertOk()
        ->assertInertia(fn(AssertableInertia $page) => $page->where('post.bodyHtml', function (string $html): bool {
            expect($html)
                ->toContain('<h2 id="content-folders-in-the-sidebar">Folders in the sidebar</h2>')
                ->toContain('<a class="heading-permalink" href="#content-folders-in-the-sidebar" aria-label="">#</a>');

            return true;
        }));
});

it('dates a correction on each post that said something never true, and on no other', function (string $slug): void {
    $this->get("/blog/{$slug}")
        ->assertOk()
        ->assertInertia(fn(AssertableInertia $page) => match ($slug) {
            'tablepro-0-74' => $page
                ->where('correction.date', '2026-10-02')
                ->where('correction.dateFormatted', 'October 2, 2026')
                ->where('correction.text', fn(string $text): bool => str_contains($text, 'Apple serves the map tiles')
                    && ! str_contains(strtolower($text), 'nothing leav')),
            /*
             * App Store 1.0 (build 22) never refused a jump host, wraps only
             * multi-statement saves on Oracle, and runs only DuckDB in memory.
             * The correction says "not supported" and never how 1.0 dials.
             */
            'tablepro-for-iphone' => $page
                ->where('correction.date', '2026-10-02')
                ->where('correction.text', fn(string $text): bool => str_contains($text, 'Jump hosts are not supported on iPhone and iPad')
                    && str_contains($text, 'On Oracle')
                    && str_contains($text, 'Only DuckDB can run in memory')
                    && ! str_contains($text, 'final host')),
            default => $page->where('correction', null),
        });
})->with(array_keys(BLOG_PUBLISHED));

it('chooses related posts by shared topic first, then by closeness in time, and lists them newest first', function (): void {
    $this->get('/blog/tablepro-0-76')
        ->assertOk()
        ->assertInertia(fn(AssertableInertia $page) => $page
            ->where('related.0.slug', 'tablepro-0-77')
            ->where('related.1.slug', 'tablepro-0-70')
            ->where('related.2.slug', 'tablepro-0-67'));

    /*
     * A dated list out of order reads as a sorting bug (0.74 listed Sep 9,
     * Sep 22, Sep 4 in ranking order).
     */
    foreach (array_keys(BLOG_PUBLISHED) as $slug) {
        $this->get("/blog/{$slug}")->assertInertia(function (AssertableInertia $page): void {
            $dates = array_column($page->toArray()['props']['related'], 'date');
            $sorted = $dates;
            rsort($sorted);

            expect($dates)->toBe($sorted);
        });
    }
});

it('renders /vi/blog in Vietnamese, unindexed, listing the English posts as English', function (): void {
    $response = $this->get('/vi/blog');

    $response
        ->assertOk()
        ->assertInertia(fn(AssertableInertia $page) => $page
            ->component('Blog/Index')
            ->where('locale', 'vi')
            ->where('seo.robots', 'noindex, follow')
            ->where('seo.canonical', null)
            ->where('seo.alternates', [])
            ->where('content.seo.indexable', false)
            ->has('posts', count(BLOG_PUBLISHED))
            ->where('posts.0.slug', 'tablepro-0-77')
            ->where('posts.0.locale', 'en')
            ->where('posts.0.url', '/blog/tablepro-0-77')
            ->where('posts.0.title', blogMatter('tablepro-0-77')['title'])
            ->where('posts.0.dateFormatted', '2 tháng 10 năm 2026')
            ->where('localization.switcher.0.href', '/blog'));

    expect($response->getContent())->toContain('<html lang="vi"');
});

it('answers /vi/blog/{slug} with a 404 that links the English post by its title', function (string $slug): void {
    $this->get("/vi/blog/{$slug}")
        ->assertNotFound()
        ->assertInertia(fn(AssertableInertia $page) => $page
            ->component('Error')
            ->where('locale', 'vi')
            ->where('seo.robots', 'noindex, follow')
            ->where('suggestion.href', "/blog/{$slug}")
            ->where('suggestion.title', blogMatter($slug)['title'])
            ->where('suggestion.hreflang', 'en')
            ->where('suggestion.locale', 'en'));
})->with(['tablepro-0-77', 'tablepro-for-iphone']);

it('returns 404 for a post that does not exist, in either language', function (string $path): void {
    $this->get($path)->assertNotFound();
})->with(['/blog/unknown-post-slug', '/blog/tablepro-0-75', '/vi/blog/unknown-post-slug', '/blog/Some.Invalid.Slug']);

describe('with posts that exist only for the test', function (): void {
    beforeEach(function (): void {
        $this->dirs = seoScratch();

        foreach (['en', 'vi'] as $locale) {
            File::ensureDirectoryExists($this->dirs['content'] . "/{$locale}");
            File::copy(resource_path("data/content/{$locale}/blog.json"), $this->dirs['content'] . "/{$locale}/blog.json");
        }

        seoWriteMarkdown($this->dirs['blog'] . '/a-release.md', ['title' => 'A release', 'description' => 'What shipped.', 'date' => '2026-09-01', 'release' => 'TablePro 0.70']);
        seoWriteMarkdown($this->dirs['blog'] . '/a-guide.md', ['title' => 'A guide', 'description' => 'How to.', 'date' => '2026-09-10']);
        seoWriteMarkdown($this->dirs['blog'] . '/vi/a-guide.md', ['title' => 'Một hướng dẫn', 'description' => 'Cách làm.', 'date' => '2026-09-10']);
        seoWriteMarkdown($this->dirs['blog'] . '/merged-guide.md', ['title' => 'Merged', 'description' => 'Gone.', 'date' => '2026-09-20']);

        File::put($this->dirs['root'] . '/redirects.json', json_encode([
            ['from' => '/blog/merged-guide', 'to' => '/features/ai-mcp', 'status' => 301, 'reason' => 'test'],
        ], JSON_THROW_ON_ERROR));

        $this->app->instance(RedirectMap::class, new RedirectMap($this->dirs['root'] . '/redirects.json', resource_path('data/engines.json')));
        $this->app->instance(BlogService::class, new BlogService($this->dirs['blog']));
        $this->app->forgetInstance(PageRegistry::class);
    });

    afterEach(function (): void {
        File::deleteDirectory($this->dirs['root']);
    });

    it('never lists a post whose URL redirects', function (): void {
        $this->get('/blog')
            ->assertOk()
            ->assertInertia(fn(AssertableInertia $page) => $page
                ->where('posts', fn($posts): bool => collect($posts)->pluck('slug')->all() === ['a-guide', 'a-release']));
    });

    it('lists a translated post in its own language and the rest as English', function (): void {
        $this->get('/vi/blog')
            ->assertOk()
            ->assertInertia(fn(AssertableInertia $page) => $page
                ->where('posts.0.slug', 'a-guide')
                ->where('posts.0.locale', 'vi')
                ->where('posts.0.title', 'Một hướng dẫn')
                ->where('posts.0.url', '/vi/blog/a-guide')
                ->where('posts.1.slug', 'a-release')
                ->where('posts.1.locale', 'en')
                ->where('posts.1.url', '/blog/a-release')
                ->has('posts', 2));
    });

    it('renders a translation in its language, related only to posts in that language', function (): void {
        $this->get('/vi/blog/a-guide')
            ->assertOk()
            ->assertInertia(fn(AssertableInertia $page) => $page
                ->component('Blog/Post')
                ->where('locale', 'vi')
                ->where('post.locale', 'vi')
                ->where('post.title', 'Một hướng dẫn')
                ->where('post.dateFormatted', '10 tháng 9 năm 2026')
                ->where('post.release', null)
                ->where('related', []));

        $this->get('/blog/a-guide')
            ->assertOk()
            ->assertInertia(fn(AssertableInertia $page) => $page
                ->where('post.locale', 'en')
                ->where('related', fn($related): bool => collect($related)->pluck('slug')->all() === ['a-release']));
    });

    it('renders a post without the blog copy, with no correction', function (): void {
        File::delete($this->dirs['content'] . '/en/blog.json');
        $this->app->instance(ContentRepository::class, new ContentRepository($this->dirs['content']));
        $this->app->forgetInstance(PageRegistry::class);

        $this->get('/blog/a-release')
            ->assertOk()
            ->assertInertia(fn(AssertableInertia $page) => $page->where('correction', null)->where('post.release', 'TablePro 0.70'));
    });
});

describe('server-rendered', function (): void {
    beforeEach(function (): void {
        // No Http::fake() here: it would also answer the SSR gateway, and
        // the page would arrive as the client-only shell. The blog makes no
        // other request, and tests/Pest.php refuses any stray one.
        requireSsr();
    });

    it('renders a post with its archive note, slots, named permalinks and download line', function (): void {
        $html = (string) $this->get('/blog/tablepro-0-77')->getContent();

        expect($html)
            ->toContain('Published on October 2, 2026, this post describes TablePro 0.77 as it was then.')
            ->toContain('data-asset-id="blog-tablepro-0-77-1"')
            ->toContain('data-asset-id="blog-tablepro-0-77-3"')
            ->toContain('aria-label="Link to this section"')
            ->not->toContain('aria-label="">#</a>')
            ->toContain('Download for Mac')
            ->toContain('"@type":"BlogPosting"')
            ->toContain('"datePublished":"2026-10-02"');
    });

    it('gives a post that leads with the brand its own title, never the /ios page\'s', function (): void {
        expect((string) $this->get('/blog/tablepro-for-iphone')->getContent())
            ->toMatch('#<title[^>]*>TablePro for iPhone and iPad – TablePro Blog</title>#u')
            ->toContain('Correction, October 2, 2026')
            ->toContain('Jump hosts are not supported on iPhone and iPad');
    });

    it('separates an English-only label from the post title with a real space', function (): void {
        $html = (string) $this->get('/vi/blog')->getContent();

        // Without the space the heading's text reads "…Sidebar(tiếng Anh)".
        expect(preg_match('#</a>(<!-- -->)? <span[^>]*>\(tiếng Anh\)</span>#u', $html))->toBe(1);
    });

    it('shows the dated correction on the 0.74 post', function (): void {
        expect((string) $this->get('/blog/tablepro-0-74')->getContent())
            ->toContain('Correction, October 2, 2026')
            ->toContain('Apple serves the map tiles');
    });

    it('marks every English post on /vi/blog as English', function (): void {
        $html = (string) $this->get('/vi/blog')->getContent();

        expect($html)
            ->toContain('<html lang="vi"')
            ->toContain('content="noindex, follow"')
            ->toMatch('#href="/blog/tablepro-0-77" hreflang="en" lang="en"#i')
            ->toContain('(tiếng Anh)')
            ->not->toContain('href="/vi/blog/tablepro-0-77"');
        expect(substr_count($html, '(tiếng Anh)'))->toBeGreaterThanOrEqual(count(BLOG_PUBLISHED));
    });
});
