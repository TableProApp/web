<?php

use App\Support\Content\ContentMissingException;
use App\Support\Content\ContentRepository;
use App\Support\Content\MarkdownRenderer;
use Illuminate\Support\Facades\File;
use League\CommonMark\Environment\Environment;
use League\CommonMark\Extension\CommonMark\CommonMarkCoreExtension;
use League\CommonMark\Extension\GithubFlavoredMarkdownExtension;
use League\CommonMark\Extension\HeadingPermalink\HeadingPermalinkExtension;
use League\CommonMark\MarkdownConverter;
use Spatie\YamlFrontMatter\YamlFrontMatter;

/**
 * Loading page copy and rendering markdown, the two readers every localized
 * page goes through.
 */
beforeEach(function (): void {
    $this->contentDir = storage_path('framework/testing/content-' . uniqid());
    File::ensureDirectoryExists("{$this->contentDir}/en/databases");
    File::ensureDirectoryExists("{$this->contentDir}/vi/databases");
    File::put("{$this->contentDir}/en/home.json", '{"seo": {"title": "Home"}}');
    File::put("{$this->contentDir}/en/databases/index.json", '{"seo": {"title": "Databases"}}');
    File::put("{$this->contentDir}/en/databases/mysql-client.json", '{"seo": {"title": "MySQL"}}');
    File::put("{$this->contentDir}/en/databases/redis-gui.json", '{"seo": {"title": "Redis"}}');
    File::put("{$this->contentDir}/vi/databases/redis-gui.json", '{"seo": {"title": "Redis"}}');
    File::put("{$this->contentDir}/vi/broken.json", '{"seo": ');

    $this->content = new ContentRepository($this->contentDir);
});

afterEach(function (): void {
    File::deleteDirectory($this->contentDir);
});

it('reads one locale per call and never falls back to English', function (): void {
    expect($this->content->page('home', 'en'))->toBe(['seo' => ['title' => 'Home']]);
    expect($this->content->has('home', 'en'))->toBeTrue();
    expect($this->content->has('home', 'vi'))->toBeFalse();

    expect(fn() => $this->content->page('home', 'vi'))
        ->toThrow(ContentMissingException::class, 'resources/data/content/vi/home.json');
});

it('reads family entries and lists slugs without the index', function (): void {
    expect($this->content->entry('databases', 'mysql-client', 'en'))->toBe(['seo' => ['title' => 'MySQL']]);
    expect($this->content->entry('databases', 'mysql-client', 'vi'))->toBeNull();
    expect($this->content->slugs('databases', 'en'))->toBe(['mysql-client', 'redis-gui']);
    expect($this->content->slugs('databases', 'vi'))->toBe(['redis-gui']);
    expect($this->content->slugs('features', 'en'))->toBe([]);
});

it('reads regional and script locale directories without changing page slugs', function (string $locale): void {
    File::ensureDirectoryExists("{$this->contentDir}/{$locale}/databases");
    File::put("{$this->contentDir}/{$locale}/databases/mysql-client.json", '{"seo":{"title":"MySQL"}}');

    expect($this->content->entry('databases', 'mysql-client', $locale))->toBe(['seo' => ['title' => 'MySQL']]);
    expect($this->content->slugs('databases', $locale))->toBe(['mysql-client']);
})->with(['pt-BR', 'zh-Hans', 'zh-Hant']);

it('reports a malformed file instead of rendering half a page', function (): void {
    $this->content->page('broken', 'vi');
})->throws(ContentMissingException::class, 'not valid JSON');

it('refuses names that could leave the content directory', function (string $name, string $locale): void {
    $this->content->has($name, $locale);
})->with([
    ['../secrets', 'en'],
    ['home', '../en'],
    ['databases/../../x', 'en'],
    ['Home', 'en'],
    ['a/b/c', 'en'],
    ['home', 'pt-BR/../en'],
    ['home', 'EN'],
    ['home', 'zh-hans'],
])->throws(InvalidArgumentException::class);

it('gives headings locale-stable ids, explicit ones first', function (): void {
    $html = app(MarkdownRenderer::class)->render(<<<'MD'
        ## Cookies {#cookies}

        ## Quyền riêng tư {#rights}

        ## Cookies

        ### Data we keep
        MD);

    expect($html)
        ->toContain('<h2 id="cookies">Cookies</h2>')
        ->toContain('<h2 id="rights">Quyền riêng tư</h2>')
        ->toContain('<h2 id="cookies-1">Cookies</h2>')
        ->toContain('<h3 id="data-we-keep">Data we keep</h3>')
        ->not->toContain('{#');
});

it('places a labelled permalink after h2 and h3, outside the heading', function (): void {
    $html = app(MarkdownRenderer::class)->render("## Cookies {#cookies}\n\n#### Small print", 'Liên kết tới mục này');

    expect($html)->toContain('<h2 id="cookies">Cookies</h2>' . "\n" . '<a class="heading-permalink" href="#cookies" aria-label="Liên kết tới mục này">#</a>');
    expect(substr_count($html, 'heading-permalink'))->toBe(1);
    expect(app(MarkdownRenderer::class)->render('## Cookies'))->not->toContain('heading-permalink');
});

it('prefixes generated ids for the blog and leaves explicit ones as written', function (): void {
    $html = app(MarkdownRenderer::class)->render(<<<'MD'
        ## Data we keep

        ### Data we keep

        ## Cookies {#cookies}
        MD, 'Link to this section', MarkdownRenderer::BLOG_ID_PREFIX);

    expect($html)
        ->toContain('<h2 id="content-data-we-keep">Data we keep</h2>' . "\n" . '<a class="heading-permalink" href="#content-data-we-keep" aria-label="Link to this section">#</a>')
        ->toContain('<h3 id="content-data-we-keep-1">Data we keep</h3>')
        ->toContain('<h2 id="cookies">Cookies</h2>');
});

/**
 * The fragment ids the blog's renderer produced before MarkdownRenderer, in
 * document order: `BlogService::renderMarkdown()` as it stood, CommonMark's
 * HeadingPermalink extension with its default `content` prefix. Links to
 * `/blog/{slug}#content-…` are out in the world and must keep resolving.
 *
 * @return list<string>
 */
function legacyBlogFragmentIds(string $markdown): array
{
    $environment = new Environment([
        'html_input' => 'allow',
        'allow_unsafe_links' => false,
        'heading_permalink' => ['symbol' => '#', 'html_class' => 'heading-permalink', 'insert' => 'after'],
    ]);
    $environment->addExtension(new CommonMarkCoreExtension());
    $environment->addExtension(new GithubFlavoredMarkdownExtension());
    $environment->addExtension(new HeadingPermalinkExtension());

    preg_match_all('/<a id="([^"]*)"/', (string) (new MarkdownConverter($environment))->convert($markdown), $matches);

    return $matches[1];
}

/**
 * @return list<string>
 */
function renderedHeadingIds(string $html): array
{
    preg_match_all('/<h[1-6] id="([^"]*)"/', $html, $matches);

    return $matches[1];
}

it('gives blog headings the fragment ids the old blog renderer gave them', function (): void {
    $markdown = <<<'MD'
        # The title

        ## Data we keep

        ### Data we keep

        ## Data we keep 2

        ## Data we keep

        ## Data we keep

        ## What's new in **0.77**?

        ## `SELECT` & `JOIN`: the [basics](https://example.com)

        ## Kết nối an toàn

        ## 🚀

        #### Small print
        MD;

    $ids = renderedHeadingIds(app(MarkdownRenderer::class)->render($markdown, 'Link', MarkdownRenderer::BLOG_ID_PREFIX));

    expect($ids)->toBe(legacyBlogFragmentIds($markdown));
    expect($ids)->toContain('content-data-we-keep-3', 'content-kết-nối-an-toàn', 'content-');
});

it('keeps every fragment id of the English blog posts that use no attribute syntax', function (): void {
    $checked = 0;

    foreach (File::glob(resource_path('blog/*.md')) as $file) {
        $body = YamlFrontMatter::parseFile($file)->body();

        if (preg_match('/^ {0,3}#{1,6}[ \t].*\{[#.][^}]*\}[ \t]*$/m', $body) === 1) {
            continue;
        }

        $expected = legacyBlogFragmentIds($body);
        $checked += count($expected);

        expect(renderedHeadingIds(app(MarkdownRenderer::class)->render($body, null, MarkdownRenderer::BLOG_ID_PREFIX)))
            ->toBe($expected, basename($file) . ': a #content-… link to this post would stop resolving');
    }

    expect($checked)->toBeGreaterThan(0);
});

it('passes asset slots through as blocks for the page to replace', function (): void {
    $html = app(MarkdownRenderer::class)->render("Before.\n\n<asset-slot id=\"blog-tablepro-0-77-1\"></asset-slot>\n\nAfter.");

    expect($html)->toContain("<p>Before.</p>\n<asset-slot id=\"blog-tablepro-0-77-1\"></asset-slot>\n<p>After.</p>");
});

it('keeps the blog renderer\'s tables, highlighting and raw-HTML rules', function (): void {
    $html = app(MarkdownRenderer::class)->render(<<<'MD'
        | Engine | Port |
        |---|---|
        | PostgreSQL | 5432 |

        ```sql
        SELECT 1;
        ```

        <script>alert(1)</script>

        {.lead}
        A lead paragraph.
        MD);

    expect($html)
        ->toContain('<table>')
        ->toContain('<pre class="phiki language-sql')
        ->toContain('&lt;script>')
        ->toContain('<p class="lead">A lead paragraph.</p>');
});

it('allows only id and class through attribute syntax', function (): void {
    $html = app(MarkdownRenderer::class)->render("{onclick=\"alert(1)\" style=\"color:red\" data-x=\"1\" .note}\nText.");

    expect($html)->toContain('<p class="note">Text.</p>');
});
