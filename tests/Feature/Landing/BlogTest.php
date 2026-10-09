<?php

use App\Services\Blog\BlogService;
use App\Services\Blog\Post;
use App\Services\Blog\PostRelease;
use App\Services\Blog\PostTopics;
use App\Support\Assets\AssetManifest;
use App\Support\Content\ContentRepository;
use App\Support\Localization\Locales;
use App\Support\Seo\PageRegistry;
use App\Support\Seo\RedirectMap;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\File;
use Inertia\Testing\AssertableInertia;
use Spatie\YamlFrontMatter\YamlFrontMatter;

use function Pest\Laravel\withoutVite;

require_once __DIR__ . '/../Seo/helpers.php';
require_once __DIR__ . '/../Releases/ReleaseFixtures.php';

/*
 * The blog (sitemap §A.5, §C.5, §E.6; architecture §1.1, §1.9, §1.17).
 *
 * - `/blog` lists exactly the posts on disk, newest first, the guides apart
 *   from the release posts. The four old guides merged into other pages are
 *   gone, and their URLs redirect.
 * - A guide is written in English and Vietnamese, with no archive note and no
 *   release notes, and relates to other guides only.
 * - Release posts are an English-only archive: the date and title as
 *   published, each figure a `blog-{slug}-{n}` slot whose
 *   manifest entry keeps the original image as its source, the `content-…`
 *   heading ids that links out in the world point at, and a dated correction
 *   only where a post said something that was never true.
 * - `/vi/blog` is indexed, paired with `/blog`, and lists the Vietnamese
 *   guides and the English posts as English, at their English URLs.
 *   `/vi/blog/{slug}` is a 404 that links the English post by its title, never
 *   an English body under Vietnamese chrome.
 * - Related posts stay in the post's language.
 * - The template adds what the archive cannot: the byline, the archive note
 *   once a newer release is out, the pages that cover the post's tags today,
 *   and the release's changelog entry and GitHub release.
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

/** The guides, each in English and Vietnamese, with their published dates. */
const BLOG_GUIDES = [
    'claude-code-cursor-database-mcp' => '2026-10-08',
    'connect-amazon-rds-mac' => '2026-10-08',
    'connect-postgresql-mysql-docker-mac' => '2026-10-08',
    'import-csv-postgresql-mysql' => '2026-10-08',
    'open-sqlite-file-mac' => '2026-10-08',
    'postgresql-ssh-tunnel-mac' => '2026-10-08',
];

/** Tags no page covers: the one every release post carries, and a claim the site does not make. */
const BLOG_TAGS_WITHOUT_A_PAGE = ['release', 'performance'];

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
 * A post's front matter, in English or in a translation.
 *
 * @return array<string, mixed>
 */
function blogMatter(string $slug, string $locale = 'en'): array
{
    return YamlFrontMatter::parseFile(resource_path($locale === 'en' ? "blog/{$slug}.md" : "blog/{$locale}/{$slug}.md"))->matter();
}

/**
 * Every post's slug in index order: the newest first, a day's posts by slug.
 *
 * @return list<string>
 */
function blogIndexOrder(): array
{
    $dates = [...BLOG_GUIDES, ...BLOG_PUBLISHED];
    $slugs = array_keys($dates);
    usort($slugs, fn(string $a, string $b): int => [$dates[$b], $a] <=> [$dates[$a], $b]);

    return $slugs;
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
    $expected = blogIndexOrder();

    expect(blogFiles())->toBe(collect($expected)->sort()->values()->all());

    $this->get('/blog')
        ->assertOk()
        ->assertInertia(fn(AssertableInertia $page) => $page
            ->component('Blog/Index')
            ->where('locale', 'en')
            ->where('seo.robots', 'index, follow')
            ->where('seo.canonical', 'https://localhost/blog')
            ->where('seo.alternates', fn($alternates): bool => collect($alternates)->pluck('hreflang')->all() === ['en', 'vi'])
            ->where('content.header.title', 'Blog')
            ->where('content.header.lead', fn(string $lead): bool => str_contains($lead, 'Posts about TablePro releases.') && str_contains($lead, '<changelog>'))
            ->missing('content.corrections')
            ->missing('content.newsletter')
            ->has('posts', count($expected))
            ->where('posts', fn($posts): bool => collect($posts)->pluck('slug')->all() === $expected)
            ->where('posts.0.url', '/blog/' . $expected[0])
            ->where('posts.0.locale', 'en')
            ->where('posts.0.date', BLOG_GUIDES[$expected[0]])
            ->where('posts.0.dateFormatted', 'October 8, 2026')
            ->where('posts', fn($posts): bool => collect($posts)->every(
                fn(array $post): bool => $post['kind'] === (array_key_exists($post['slug'], BLOG_GUIDES) ? 'guide' : 'release'),
            )));
});

it('keeps the guides and the release posts apart: a guide announces no release', function (): void {
    foreach (blogFiles() as $slug) {
        expect(array_key_exists('release', blogMatter($slug)))->toBe(array_key_exists($slug, BLOG_PUBLISHED), "{$slug}: a release post names its release, a guide does not");
    }

    expect(array_intersect_key(BLOG_GUIDES, BLOG_PUBLISHED))->toBe([]);
});

it('describes the blog as guides and release posts in every language', function (): void {
    $kinds = [
        'en' => ['guides', 'release'],
        'vi' => ['hướng dẫn', 'phát hành'],
        'es' => ['guías', 'versi'],
        'de' => ['anleitungen', 'versionshinweise'],
        'fr' => ['guides', 'version'],
        'ja' => ['ガイド', 'リリース'],
        'ko' => ['가이드', '릴리스'],
        'zh-Hans' => ['指南', '发行说明'],
        'zh-Hant' => ['指南', '版本說明'],
        'pt-BR' => ['guias', 'versão'],
        'it' => ['guide', 'rilascio'],
        'id' => ['panduan', 'rilis'],
    ];

    expect(array_keys($kinds))->toEqualCanonicalizing(Locales::codes());

    foreach ($kinds as $locale => $words) {
        $copy = app(ContentRepository::class)->page('blog', $locale);

        foreach (['seo.description' => $copy['seo']['description'], 'og.title' => $copy['og']['title']] as $key => $text) {
            foreach ($words as $word) {
                expect(mb_stripos($text, $word))->not->toBeFalse("content/{$locale}/blog.json {$key} does not say \"{$word}\": {$text}");
            }
        }
    }
});

it('renders each guide in English and Vietnamese, as a guide', function (string $slug, string $locale): void {
    $prefix = $locale === 'en' ? '' : "/{$locale}";
    $matter = blogMatter($slug, $locale);

    $this->get("{$prefix}/blog/{$slug}")
        ->assertOk()
        ->assertInertia(fn(AssertableInertia $page) => $page
            ->component('Blog/Post')
            ->where('locale', $locale)
            ->where('seo.robots', 'index, follow')
            ->where('seo.canonical', "https://localhost{$prefix}/blog/{$slug}")
            ->where('seo.alternates', fn($alternates): bool => collect($alternates)->pluck('hreflang')->sort()->values()->all() === ['en', 'vi'])
            ->where('post.slug', $slug)
            ->where('post.locale', $locale)
            ->where('post.kind', 'guide')
            ->where('post.title', $matter['title'])
            ->where('post.date', BLOG_GUIDES[$slug])
            ->where('post.release', null)
            ->where('archived', false)
            ->where('correction', null)
            ->where('notes', null)
            ->where('pages', fn($pages): bool => count($pages) > 0)
            ->has('related', 3)
            ->where('related', fn($related): bool => collect($related)->every(
                fn(array $post): bool => $post['kind'] === 'guide' && $post['locale'] === $locale && $post['slug'] !== $slug,
            )));
})->with(fn(): array => collect(array_keys(BLOG_GUIDES))->crossJoin(['en', 'vi'])->all());

it('gives each guide a Vietnamese version under the same slug and tags', function (): void {
    foreach (array_keys(BLOG_GUIDES) as $slug) {
        expect(File::exists(resource_path("blog/vi/{$slug}.md")))->toBeTrue("{$slug} has no Vietnamese version");
        expect(blogMatter($slug, 'vi')['tags'])->toBe(blogMatter($slug)['tags'], "{$slug}: the translation links other pages than the original");
    }

    expect(glob(resource_path('blog/vi/*.md')))->toHaveCount(count(BLOG_GUIDES));
});

it('links each guide to the database and feature pages it is about', function (string $slug, array $hrefs): void {
    $this->get("/blog/{$slug}")
        ->assertOk()
        ->assertInertia(fn(AssertableInertia $page) => $page->where('pages', fn($pages): bool => collect($pages)->pluck('href')->all() === $hrefs));
})->with([
    'SSH tunnel' => ['postgresql-ssh-tunnel-mac', ['/postgresql-client', '/features/connections#ssh']],
    'Docker' => ['connect-postgresql-mysql-docker-mac', ['/postgresql-client', '/mysql-client', '/features/connections#project-folder']],
    'SQLite' => ['open-sqlite-file-mac', ['/sqlite-client', '/features/import-export#files', '/features/querying#editor']],
    'Amazon RDS' => ['connect-amazon-rds-mac', ['/postgresql-client', '/mysql-client', '/features/connections#cloud-auth', '/features/connections#ssh']],
    'CSV import' => ['import-csv-postgresql-mysql', ['/postgresql-client', '/mysql-client', '/features/import-export#import', '/features/import-export#data-files']],
    'MCP' => ['claude-code-cursor-database-mcp', ['/features/ai-mcp#mcp', '/postgresql-client', '/mysql-client']],
]);

it('relates a release post to other release posts only', function (string $slug): void {
    $this->get("/blog/{$slug}")
        ->assertOk()
        ->assertInertia(fn(AssertableInertia $page) => $page->where('related', fn($related): bool => collect($related)->every(
            fn(array $post): bool => $post['kind'] === 'release',
        )));
})->with(array_keys(BLOG_PUBLISHED));

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
            ->where('post.author', $matter['author'])
            ->where('post.seoTitle', $matter['seoTitle'] ?? null)
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

it('marks a post as an archive only once a newer release than its own is out', function (array $platforms, string $slug, bool $archived): void {
    bindReleaseFixturePlatforms($platforms);

    $this->get("/blog/{$slug}")
        ->assertOk()
        ->assertInertia(fn(AssertableInertia $page) => $page->where('archived', $archived));
})->with([
    'the post about the current release' => [[], 'tablepro-0-77', false],
    'the same release after a patch' => [['mac.release.version' => '0.77.2'], 'tablepro-0-77', false],
    'an older release' => [[], 'tablepro-0-76', true],
    'once the next release is out' => [['mac.release.version' => '0.78.0'], 'tablepro-0-77', true],
    'the iPhone app, whatever the Mac is on' => [['mac.release.version' => '0.78.0'], 'tablepro-for-iphone', false],
    'the iPhone app, after its own next release' => [['ios.release.version' => '1.1'], 'tablepro-for-iphone', true],
    'a platform with no release on record' => [['mac.release' => null], 'tablepro-0-76', false],
]);

it('links a Mac release to its changelog entry and its GitHub release, from the front matter alone', function (?string $release, ?array $notes): void {
    bindReleaseFixturePlatforms();

    $post = new Post('a-post', 'en', 'A post', 'What shipped.', CarbonImmutable::parse('2026-10-02'), [], $release);

    expect(app(PostRelease::class)->notes($post))->toBe($notes);
})->with([
    'a release' => ['TablePro 0.77', ['changelog' => 'https://docs.tablepro.app/changelog#v0-77-0', 'github' => 'https://github.com/TableProApp/TablePro/releases/tag/v0.77.0']],
    'a patch release' => ['TablePro 0.77.1', ['changelog' => 'https://docs.tablepro.app/changelog#v0-77-1', 'github' => 'https://github.com/TableProApp/TablePro/releases/tag/v0.77.1']],
    // The docs changelog and the tagged releases are the Mac app's.
    'the iPhone app' => ['TablePro for iPhone and iPad 1.0', null],
    'a release with no version' => ['TablePro', null],
    'a guide' => [null, null],
]);

it('hands each release post its notes links', function (string $slug): void {
    $version = preg_match('/^tablepro-(\d+)-(\d+)$/', $slug, $match) === 1 ? "{$match[1]}.{$match[2]}.0" : null;

    $this->get("/blog/{$slug}")
        ->assertOk()
        ->assertInertia(fn(AssertableInertia $page) => $version === null
            ? $page->where('notes', null)
            : $page
                ->where('notes.changelog', 'https://docs.tablepro.app/changelog#v' . str_replace('.', '-', $version))
                ->where('notes.github', "https://github.com/TableProApp/TablePro/releases/tag/v{$version}"));
})->with(array_keys(BLOG_PUBLISHED));

it('links the pages that cover a post today, from its tags', function (): void {
    $this->get('/blog/tablepro-0-77')
        ->assertOk()
        ->assertInertia(fn(AssertableInertia $page) => $page
            ->where('pages', fn($pages): bool => collect($pages)->pluck('href')->all() === [
                '/databases#sap-hana',
                '/features/schema#table-folders',
                '/features/import-export#import',
                '/features/connections',
            ])
            // Each label is the target's own title: an engine's name, a section's heading.
            ->where('pages.0.label', collect(json_decode(File::get(resource_path('data/engines.json')), true))->firstWhere('id', 'sap-hana')['name'])
            ->where('pages.1.label', collect(app(ContentRepository::class)->page('features/schema', 'en')['sections'])
                ->flatMap(fn(array $section): array => $section['blocks'] ?? [])
                ->firstWhere('id', 'table-folders')['title']));
});

it('closes the pages with Pricing where a linked feature is paid on the post’s platform', function (string $slug, bool $pricing): void {
    $this->get("/blog/{$slug}")
        ->assertOk()
        ->assertInertia(function (AssertableInertia $page) use ($pricing): void {
            $hrefs = array_column($page->toArray()['props']['pages'], 'href');

            expect(in_array('/pricing', $hrefs, true))->toBe($pricing);
            expect(count($hrefs))->toBe(count(array_unique($hrefs)));

            if ($pricing) {
                expect(end($hrefs))->toBe('/pricing');
            }
        });
})->with([
    'Result Charts' => ['tablepro-0-67', true],
    'Compare & Sync' => ['tablepro-0-68', true],
    'Data Rewind' => ['tablepro-0-69', true],
    'no paid feature' => ['tablepro-0-77', false],
    // iCloud Sync is paid on the Mac and free on iPhone and iPad.
    'iCloud Sync on the iPhone app' => ['tablepro-for-iphone', false],
]);

it('resolves every tag of every post to a page in every language, or to none on purpose', function (): void {
    $topics = app(PostTopics::class);
    $seen = [];

    foreach (blogFiles() as $slug) {
        foreach (blogMatter($slug)['tags'] as $tag) {
            $seen[] = $tag;

            foreach (Locales::codes() as $locale) {
                $link = $topics->link($tag, $locale);

                if (in_array($tag, BLOG_TAGS_WITHOUT_A_PAGE, true)) {
                    expect($link)->toBeNull("{$tag} is listed as having no page, and has one");

                    continue;
                }

                expect($link)->not->toBeNull("{$slug}: the tag {$tag} names no page in {$locale}");
                expect($link['href'])->toMatch('#^/[a-z0-9/-]+(\#[a-z0-9-]+)?$#');
                expect($link['label'])->not->toBe('')->not->toMatch('/[{}<>]/', "{$tag} ({$locale}) takes a label with a slot or markup in it");
            }
        }
    }

    expect(array_diff(BLOG_TAGS_WITHOUT_A_PAGE, $seen))->toBe([]);
});

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

it('renders and indexes /vi/blog in Vietnamese, listing the guides in Vietnamese and the release posts as English', function (): void {
    $response = $this->get('/vi/blog');
    $first = count(BLOG_GUIDES);

    $response
        ->assertOk()
        ->assertInertia(fn(AssertableInertia $page) => $page
            ->component('Blog/Index')
            ->where('locale', 'vi')
            ->where('seo.robots', 'index, follow')
            ->where('seo.canonical', 'https://localhost/vi/blog')
            ->where('seo.alternates', fn($alternates): bool => collect($alternates)->pluck('hreflang')->all() === ['en', 'vi'])
            ->missing('content.seo.indexable')
            ->has('posts', count(BLOG_GUIDES) + count(BLOG_PUBLISHED))
            ->where('posts', fn($posts): bool => collect($posts)->take($first)->every(
                fn(array $post): bool => $post['kind'] === 'guide' && $post['locale'] === 'vi' && $post['url'] === "/vi/blog/{$post['slug']}",
            ))
            ->where("posts.{$first}.slug", 'tablepro-0-77')
            ->where("posts.{$first}.locale", 'en')
            ->where("posts.{$first}.url", '/blog/tablepro-0-77')
            ->where("posts.{$first}.title", blogMatter('tablepro-0-77')['title'])
            ->where("posts.{$first}.dateFormatted", '2 tháng 10 năm 2026')
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

    it('renders a translation in its language, related only to posts in that language and of its kind', function (): void {
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
                ->where('related', []));
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
        bindReleaseFixturePlatforms(['mac.release.version' => '0.78.0']);

        $html = (string) $this->get('/blog/tablepro-0-77')->getContent();
        $main = Dom\HTMLDocument::createFromString($html, LIBXML_NOERROR)->querySelector('main');

        expect($main)->not->toBeNull();

        foreach (['blog-tablepro-0-77-1', 'blog-tablepro-0-77-3'] as $id) {
            expect($main->querySelector(renderedSlotSelector($id)))->not->toBeNull("{$id} is not rendered");
        }

        expect($html)
            ->toContain('Published October 2, 2026. This post covers TablePro 0.77 at release.')
            ->toContain('aria-label="Link to this section"')
            ->not->toContain('aria-label="">#</a>')
            ->toContain('Download for Mac')
            ->toContain('"@type":"BlogPosting"')
            ->toContain('"datePublished":"2026-10-02"');
    });

    it('opens the post about the current release without the archive note, under its byline', function (): void {
        bindReleaseFixturePlatforms();

        $html = (string) $this->get('/blog/tablepro-0-77')->getContent();
        $header = Dom\HTMLDocument::createFromString($html, LIBXML_NOERROR)->querySelector('main > header');

        expect($html)->not->toContain('This post covers TablePro 0.77 at release.');
        expect($header?->textContent)->toContain('October 2, 2026')->toContain(blogMatter('tablepro-0-77')['author']);
    });

    it('links each figure to its widest file, the pages that cover the post and the release’s own notes', function (): void {
        $main = Dom\HTMLDocument::createFromString((string) $this->get('/blog/tablepro-0-77')->getContent(), LIBXML_NOERROR)->querySelector('main');
        $figures = $main->querySelectorAll('figure[data-asset-status="supplied"]');

        expect($figures->length)->toBe(3);

        foreach ($figures as $figure) {
            $link = $figure->firstElementChild;

            expect($link?->tagName)->toBe('A', 'A figure does not open at full size');
            expect($link->getAttribute('href'))->toStartWith('/images/blog/blog-tablepro-0-77-');
            expect(File::exists(public_path(ltrim($link->getAttribute('href'), '/'))))->toBeTrue();
            // The link's name is the picture's alt text.
            expect($link->querySelector('img')?->getAttribute('alt'))->not->toBeEmpty();
        }

        expect($main->querySelector('#pages a[href="/databases#sap-hana"]'))->not->toBeNull();
        expect($main->querySelector('#pages a[href="/features/schema#table-folders"]'))->not->toBeNull();
        expect($main->querySelector('#notes a[href="https://docs.tablepro.app/changelog#v0-77-0"][hreflang="en"]')?->textContent)->toContain('TablePro 0.77 in the changelog');
        expect($main->querySelector('#notes a[href="https://github.com/TableProApp/TablePro/releases/tag/v0.77.0"]')?->textContent)->toContain('TablePro 0.77 on GitHub');
    });

    it('titles a post without the brand twice, and never as the /ios page is titled', function (): void {
        expect((string) $this->get('/blog/tablepro-0-77')->getContent())
            ->toMatch('#<title[^>]*>TablePro 0\.77: SAP HANA and Folders in the Sidebar</title>#');

        // The launch post's own title is the /ios page's; its `seoTitle` is not.
        expect((string) $this->get('/blog/tablepro-for-iphone')->getContent())
            ->toMatch('#<title[^>]*>TablePro for iPhone and iPad is on the App Store</title>#')
            ->toMatch('#<h1[^>]*>(<span[^>]*>)?TablePro for iPhone and iPad(</span>)?</h1>#')
            ->toContain('Correction, October 2, 2026')
            ->toContain('Jump hosts are not supported on iPhone and iPad');
    });

    it('offers the newsletter on the index in the footer’s words', function (string $path, string $title, string $body): void {
        $main = Dom\HTMLDocument::createFromString((string) $this->get($path)->getContent(), LIBXML_NOERROR)->querySelector('main');
        // The card sits inside the release notes section; the innermost section holding the form is the card.
        $sections = $main->querySelectorAll('section:has(input[type="email"])');
        $card = $sections->item($sections->length - 1);

        /*
         * The footer leaves its own copy out on this page, so both are read
         * from the card. The body is the reviewed one: the list gets an
         * occasional email, not one for each version.
         */
        expect($card?->querySelector('h2')?->textContent)->toBe($title);
        expect($card->textContent)->toContain($body);
    })->with([
        ['/blog', 'Release notes by email', 'Occasional release notes. Unsubscribe in any email.'],
        ['/vi/blog', 'Ghi chú phát hành qua email', 'Thỉnh thoảng gửi ghi chú phát hành bằng tiếng Anh. Hủy đăng ký trong bất kỳ email nào.'],
    ]);

    it('lists the guides, then the release posts under the line that says what they are', function (string $path, string $guides, string $releases, string $lead): void {
        $document = Dom\HTMLDocument::createFromString((string) $this->get($path)->getContent(), LIBXML_NOERROR);
        $main = $document->querySelector('main');
        $sections = array_map(fn($section): string => $section->getAttribute('id'), iterator_to_array($document->querySelectorAll('main > section[id]')));

        expect(array_values($sections))->toBe(['guides', 'releases'])
            ->and($main->querySelector('#guides-title')?->textContent)->toBe($guides)
            ->and($main->querySelector('#releases-title')?->textContent)->toBe($releases)
            ->and($main->querySelector('#releases')?->textContent)->toContain($lead)
            ->and($main->querySelector('h1 + *')?->textContent ?? '')->not->toContain($lead)
            ->and($main->querySelectorAll('#guides ol > li')->length)->toBe(count(BLOG_GUIDES))
            ->and($main->querySelectorAll('#releases ol > li')->length)->toBe(count(BLOG_PUBLISHED));
    })->with([
        ['/blog', 'Guides', 'Release notes', 'Full version notes are in the changelog'],
        ['/vi/blog', 'Hướng dẫn', 'Ghi chú phát hành', 'Ghi chú đầy đủ của từng phiên bản nằm trong changelog'],
    ]);

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

    it('marks every English post on /vi/blog as English, on a page indexed with /blog as its alternate', function (): void {
        $html = (string) $this->get('/vi/blog')->getContent();

        expect($html)
            ->toContain('<html lang="vi"')
            ->toContain('content="index, follow"')
            ->toContain('<link rel="canonical" href="https://localhost/vi/blog"')
            ->toContain('<link rel="alternate" hreflang="en" href="https://localhost/blog"')
            ->toContain('<link rel="alternate" hreflang="vi" href="https://localhost/vi/blog"')
            ->toMatch('#href="/blog/tablepro-0-77" hreflang="en" lang="en"#i')
            ->toContain('(tiếng Anh)')
            ->not->toContain('href="/vi/blog/tablepro-0-77"');
        expect(substr_count($html, '(tiếng Anh)'))->toBeGreaterThanOrEqual(count(BLOG_PUBLISHED));
    });
});
