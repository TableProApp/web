<?php

use App\Services\Blog\AtomFeed;
use App\Services\Blog\BlogService;
use App\Services\Blog\Post;
use App\Services\Blog\PostRelease;
use App\Services\Blog\PostTopics;
use App\Support\Content\ContentRepository;
use App\Support\Localization\Locales;
use App\Support\Seo\PageRegistry;
use App\Support\Seo\RedirectMap;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\File;
use Inertia\Testing\AssertableInertia;
use Spatie\YamlFrontMatter\YamlFrontMatter;

use function Pest\Laravel\get;

function blogPostsOnDisk(): array
{
    $posts = [];

    foreach (glob(resource_path('blog/*.md')) ?: [] as $file) {
        $posts[pathinfo($file, PATHINFO_FILENAME)] = YamlFrontMatter::parseFile($file)->matter();
    }

    uksort($posts, fn(string $a, string $b): int => [(string) $posts[$b]['date'], $a] <=> [(string) $posts[$a]['date'], $b]);

    return $posts;
}

function blogPost(array $tags, ?string $release = null, string $date = '2026-10-02'): Post
{
    return new Post('a-post', 'en', 'A post', 'What shipped.', CarbonImmutable::parse($date), $tags, $release);
}

function blogKind(array $matter): string
{
    return match (true) {
        isset($matter['release']) => 'release',
        ($matter['kind'] ?? null) === 'news' => 'news',
        default => 'guide',
    };
}

it('lists every post on disk, newest first, 20 to a page, by its kind', function (): void {
    $posts = blogPostsOnDisk();
    $pages = array_chunk(array_keys($posts), 20);

    foreach ($pages as $index => $slugs) {
        get('/blog' . ($index === 0 ? '' : '?page=' . ($index + 1)))
            ->assertOk()
            ->assertInertia(fn(AssertableInertia $page) => $page
                ->component('Blog/Index')
                ->where('filter', ['kind' => null, 'page' => $index + 1, 'pages' => count($pages)])
                ->where('posts', fn($listed): bool => collect($listed)->pluck('slug')->all() === $slugs)
                ->where('posts', fn($listed): bool => collect($listed)->every(fn(array $post): bool => $post['kind'] === blogKind($posts[$post['slug']]))));
    }
});

it('narrows the list to one kind, and offers only the kinds that have a post', function (): void {
    $posts = blogPostsOnDisk();
    $kinds = array_values(array_intersect(['release', 'guide', 'news'], array_map('blogKind', $posts)));

    get('/blog')->assertInertia(fn(AssertableInertia $page) => $page->where('kinds', $kinds));

    foreach ($kinds as $kind) {
        $slugs = array_keys(array_filter($posts, fn(array $matter): bool => blogKind($matter) === $kind));

        get("/blog?kind={$kind}")->assertOk()->assertInertia(fn(AssertableInertia $page) => $page
            ->where('filter.kind', $kind)
            ->where('posts', fn($listed): bool => collect($listed)->pluck('slug')->all() === array_slice($slugs, 0, 20)));
    }

    get('/blog?kind=nonsense')->assertOk()->assertInertia(fn(AssertableInertia $page) => $page->where('filter.kind', null));
});

it('answers a page past the last, or one that is not a whole number, with a 404', function (string $query): void {
    get("/blog?{$query}")->assertNotFound();
})->with(['page=0', 'page=-1', 'page=abc', 'page=1.5', 'page=99']);

it('files the Linux beta post under news, not releases', function (): void {
    expect(blogKind(blogPostsOnDisk()['tablepro-for-linux-beta']))->toBe('news');
});

it('lists a translated post in its own language and every other post in English', function (): void {
    get('/vi/blog')
        ->assertOk()
        ->assertInertia(fn(AssertableInertia $page) => $page
            ->has('posts', min(20, count(blogPostsOnDisk())))
            ->where('posts', fn($listed): bool => collect($listed)->every(function (array $post): bool {
                $locale = is_file(resource_path("blog/vi/{$post['slug']}.md")) ? 'vi' : 'en';

                return $post['locale'] === $locale && $post['url'] === ($locale === 'vi' ? '/vi' : '') . "/blog/{$post['slug']}";
            })));
});

it('keeps a Vietnamese post on the tags and sections of its English original', function (): void {
    $anchors = fn(string $path): array => preg_match_all('/^#{2,6} .*\{#([\w-]+)\}\s*$/m', File::get($path), $matches) > 0 ? $matches[1] : [];

    foreach (glob(resource_path('blog/vi/*.md')) ?: [] as $translated) {
        $original = resource_path('blog/' . basename($translated));

        expect(YamlFrontMatter::parseFile($translated)->matter('tags'))->toBe(YamlFrontMatter::parseFile($original)->matter('tags'), basename($translated))
            ->and($anchors($translated))->toBe($anchors($original), basename($translated));
    }
});

it('resolves every tag of every post to a page in every language', function (): void {
    $topics = app(PostTopics::class);

    foreach (blogPostsOnDisk() as $slug => $matter) {
        // `release` is on every release post; `performance` has no page on purpose.
        foreach (array_diff($matter['tags'], ['release', 'performance']) as $tag) {
            foreach (Locales::codes() as $locale) {
                $link = $topics->link($tag, $locale);

                expect($link)->not->toBeNull("{$slug}: the tag {$tag} names no page in {$locale}")
                    ->and($link['href'])->toMatch('#^/[a-z0-9/-]+(\#[a-z0-9-]+)?$#');
            }
        }
    }
});

it('closes the linked pages with Pricing when a linked feature is paid on the post’s platform', function (array $tags, ?string $release, bool $pricing): void {
    $hrefs = array_column(app(PostTopics::class)->pages(blogPost($tags, $release), 'en'), 'href');

    expect(in_array('/pricing', $hrefs, true))->toBe($pricing)
        ->and($hrefs)->toBe(array_values(array_unique($hrefs)));

    if ($pricing) {
        expect(end($hrefs))->toBe('/pricing');
    }
})->with([
    'a paid Mac feature' => [['release', 'charts', 'sql-editor'], 'TablePro 0.67', true],
    'no paid feature' => [['release', 'sql-editor'], 'TablePro 0.77', false],
    'a feature free on iPhone and iPad' => [['ios', 'icloud-sync'], 'TablePro for iPhone and iPad 1.0', false],
]);

it('marks a post as an archive only once a newer release than its own is out', function (array $platforms, string $slug, bool $archived): void {
    bindReleaseFixturePlatforms($platforms);

    get("/blog/{$slug}")
        ->assertOk()
        ->assertInertia(fn(AssertableInertia $page) => $page->where('archived', $archived));
})->with([
    'the current release' => [[], 'tablepro-0-77', false],
    'the same release after a patch' => [['mac.release.version' => '0.77.2'], 'tablepro-0-77', false],
    'an older release' => [[], 'tablepro-0-76', true],
    'once the next release is out' => [['mac.release.version' => '0.78.0'], 'tablepro-0-77', true],
    'the iPhone app, whatever the Mac is on' => [['mac.release.version' => '0.78.0'], 'tablepro-for-iphone', false],
    'the iPhone app, after its own next release' => [['ios.release.version' => '1.1'], 'tablepro-for-iphone', true],
    'a platform with no release on record' => [['mac.release' => null], 'tablepro-0-76', false],
]);

it('links a Mac release to its changelog entry and its GitHub release', function (?string $release, ?array $notes): void {
    bindReleaseFixturePlatforms();

    expect(app(PostRelease::class)->notes(blogPost([], $release)))->toBe($notes);
})->with([
    'a release' => ['TablePro 0.77', ['changelog' => 'https://docs.tablepro.app/changelog#v0-77-0', 'github' => 'https://github.com/TableProApp/TablePro/releases/tag/v0.77.0']],
    'a patch release' => ['TablePro 0.77.1', ['changelog' => 'https://docs.tablepro.app/changelog#v0-77-1', 'github' => 'https://github.com/TableProApp/TablePro/releases/tag/v0.77.1']],
    'the iPhone app' => ['TablePro for iPhone and iPad 1.0', null],
    'a release with no version' => ['TablePro', null],
    'a guide' => [null, null],
]);

describe('on a scratch blog', function (): void {
    beforeEach(function (): void {
        $this->dirs = seoScratch();

        foreach (['en', 'vi'] as $locale) {
            File::ensureDirectoryExists($this->dirs['content'] . "/{$locale}");
            File::copy(resource_path("data/content/{$locale}/blog.json"), $this->dirs['content'] . "/{$locale}/blog.json");
        }

        $posts = [
            'a-release' => ['date' => '2026-09-01', 'release' => 'TablePro 0.70', 'tags' => ['release', 'sync']],
            'b-release' => ['date' => '2026-08-01', 'release' => 'TablePro 0.69', 'tags' => ['release', 'sync']],
            'c-release' => ['date' => '2026-09-05', 'release' => 'TablePro 0.71', 'tags' => ['release']],
            'd-release' => ['date' => '2026-09-02', 'release' => 'TablePro 0.70.1', 'tags' => ['release']],
            'e-release' => ['date' => '2026-06-01', 'release' => 'TablePro 0.60', 'tags' => ['release']],
            'a-guide' => ['date' => '2026-09-10'],
            'merged-guide' => ['date' => '2026-09-20'],
        ];

        foreach ($posts as $slug => $matter) {
            seoWriteMarkdown($this->dirs['blog'] . "/{$slug}.md", ['title' => $slug, 'description' => 'About it.', ...$matter]);
        }

        seoWriteMarkdown($this->dirs['blog'] . '/vi/a-guide.md', ['title' => 'Một hướng dẫn', 'description' => 'Cách làm.', 'date' => '2026-09-10']);

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
        get('/blog')->assertInertia(fn(AssertableInertia $page) => $page
            ->where('posts', fn($posts): bool => ! collect($posts)->pluck('slug')->contains('merged-guide')));
    });

    it('relates posts of its kind by shared topic, then by closeness in time, and shows them newest first', function (): void {
        get('/blog/a-release')
            ->assertOk()
            ->assertInertia(fn(AssertableInertia $page) => $page
                ->where('related', fn($related): bool => collect($related)->pluck('slug')->all() === ['c-release', 'd-release', 'b-release']));
    });

    it('relates a translation only to posts in its language', function (): void {
        get('/vi/blog/a-guide')
            ->assertOk()
            ->assertInertia(fn(AssertableInertia $page) => $page
                ->where('locale', 'vi')
                ->where('post.title', 'Một hướng dẫn')
                ->where('related', []));
    });

    it('shows the dated correction the blog copy holds for a post, and none without the copy', function (): void {
        $copy = json_decode(File::get($this->dirs['content'] . '/en/blog.json'), true);
        $copy['corrections'] = ['a-release' => ['date' => '2026-10-02', 'text' => 'It was wrong.']];
        File::put($this->dirs['content'] . '/en/blog.json', json_encode($copy));

        get('/blog/a-release')->assertInertia(fn(AssertableInertia $page) => $page
            ->where('correction', ['date' => '2026-10-02', 'dateFormatted' => 'October 2, 2026', 'text' => 'It was wrong.']));

        File::delete($this->dirs['content'] . '/en/blog.json');
        $this->app->instance(ContentRepository::class, new ContentRepository($this->dirs['content']));
        $this->app->forgetInstance(PageRegistry::class);

        get('/blog/a-release')
            ->assertOk()
            ->assertInertia(fn(AssertableInertia $page) => $page->where('correction', null));
    });
});

describe('the feed', function (): void {
    beforeEach(function (): void {
        config(['app.web_domain' => 'tablepro.app']);
    });

    it('serves the English posts as Atom, newest first, from the canonical origin', function (): void {
        $response = get('http://evil.example/blog/feed.xml')->assertOk();
        $feed = simplexml_load_string((string) $response->getContent());
        $posts = app(BlogService::class)->all('en');

        expect($response->headers->get('Content-Type'))->toBe('application/atom+xml; charset=utf-8')
            ->and($feed)->not->toBeFalse()
            ->and((string) $feed->id)->toBe('https://tablepro.app/blog')
            ->and((string) $feed->updated)->toBe($posts[0]->date->toAtomString())
            ->and($feed->entry)->toHaveCount(count($posts))
            ->and((string) $response->getContent())->not->toContain('evil.example');

        foreach ($posts as $index => $post) {
            expect((string) $feed->entry[$index]->id)->toBe('https://tablepro.app/blog/' . $post->slug)
                ->and((string) $feed->entry[$index]->title)->toBe($post->title);
        }
    });

    it('escapes whatever a post’s front matter holds', function (): void {
        $post = new Post('q-and-a', 'en', 'Q&A: <b>"quotes"</b>', 'Less < more & ]]> done', CarbonImmutable::parse('2026-10-02'), [], null);
        $feed = simplexml_load_string((new AtomFeed())->render('TablePro Blog', 'A & B', 'The team', [$post]));

        expect($feed)->not->toBeFalse()
            ->and((string) $feed->entry[0]->title)->toBe('Q&A: <b>"quotes"</b>')
            ->and((string) $feed->entry[0]->summary)->toBe('Less < more & ]]> done');
    });

    it('lives at the root only', function (string $path): void {
        get($path)->assertNotFound();
    })->with(['/vi/blog/feed.xml', '/ja/blog/feed.xml']);

    it('is handed to every blog page, whatever its language', function (string $path): void {
        get($path)->assertOk()->assertInertia(fn(AssertableInertia $page) => $page
            ->where('feed.url', 'https://tablepro.app/blog/feed.xml'));
    })->with(['/blog', '/vi/blog', '/blog/tablepro-0-77']);
});

it('draws the tabs, the pages and the newsletter band', function (): void {
    $document = Dom\HTMLDocument::createFromString(ssrHtml('/blog?kind=release'), LIBXML_NOERROR);
    $current = $document->querySelector('main nav a[aria-current="page"]');

    expect($current?->getAttribute('href'))->toBe('/blog?kind=release')
        ->and($document->querySelector('main nav a[href="/blog"]'))->not->toBeNull()
        ->and($document->querySelector('#newsletter form input[type="email"]'))->not->toBeNull()
        ->and($document->querySelector('#top a[href$="/blog/feed.xml"]'))->not->toBeNull();

    foreach (['posts', 'news', 'guides', 'releases'] as $id) {
        expect($document->getElementById($id))->not->toBeNull("#{$id} is gone from /blog");
    }

    $pages = (int) ceil(count(blogPostsOnDisk()) / 20);

    if ($pages > 1) {
        $first = Dom\HTMLDocument::createFromString(ssrHtml('/blog'), LIBXML_NOERROR);

        expect($first->querySelector('main a[rel="next"]')?->getAttribute('href'))->toBe('/blog?page=2')
            ->and($first->querySelector('main a[rel="prev"]'))->toBeNull();
    }
})->group('ssr');
