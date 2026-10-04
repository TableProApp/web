<?php

use App\Support\Assets\AssetManifest;
use App\Support\Content\ContentRepository;
use App\Support\Localization\Locales;
use App\Support\Seo\BlogPosts;
use App\Support\Seo\ContentCollection;
use App\Support\Seo\LastModified;
use App\Support\Seo\LegalPages;
use App\Support\Seo\OgFonts;
use App\Support\Seo\OgImages;
use App\Support\Seo\PageEntry;
use App\Support\Seo\PageFamily;
use App\Support\Seo\PageRegistry;
use App\Support\Seo\RedirectMap;
use App\Support\Seo\WithoutRetiredPaths;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\File;
use Symfony\Component\Process\Process;

require_once __DIR__ . '/helpers.php';

/**
 * The page families, and the parts every surface shares.
 *
 * A family decides the locales a page **renders** in from the files that
 * exist, and the locales it is **indexed** in from a flag (architecture §1.6).
 * These run against scratch directories, so each rule is proven on pages that
 * exist only for the test and keeps holding as real content lands.
 */
beforeEach(function (): void {
    $this->dirs = seoScratch();
});

afterEach(function (): void {
    File::deleteDirectory($this->dirs['root']);
});

/**
 * The registry over the committed content rather than the scratch
 * directories, for the rules every real page must keep.
 */
function committedPageRegistry(): PageRegistry
{
    foreach ([ContentRepository::class, BlogPosts::class, LegalPages::class, PageRegistry::class] as $abstract) {
        app()->forgetInstance($abstract);
    }

    return app(PageRegistry::class);
}

describe('ContentCollection', function (): void {
    it('renders a page in each locale that has its content file', function (): void {
        seoWriteContent($this->dirs['content'], 'en', 'features/querying');
        seoWriteContent($this->dirs['content'], 'vi', 'features/querying');
        seoWriteContent($this->dirs['content'], 'en', 'databases/mysql-client');

        $family = new ContentCollection(app(ContentRepository::class));

        $pair = $family->find('landing.features.show', ['slug' => 'querying']);
        $single = $family->find('landing.databaseClient', ['slug' => 'mysql-client']);

        expect($pair->renderLocales)->toBe(['en', 'vi']);
        expect($pair->indexableLocales)->toBe(['en', 'vi']);
        expect($pair->hreflangCluster())->toBe(['en', 'vi']);
        expect([$pair->ogFamily, $pair->ogSlug])->toBe(['feature', 'querying']);

        expect($single->renderLocales)->toBe(['en']);
        expect($single->hreflangCluster())->toBe([]);
        expect([$single->ogFamily, $single->ogSlug])->toBe(['database', 'mysql-client']);
    });

    it('keeps a page out of the index in a locale whose file says so', function (): void {
        seoWriteContent($this->dirs['content'], 'en', 'compare/tableplus');
        seoWriteContent($this->dirs['content'], 'vi', 'compare/tableplus', ['seo' => ['title' => 'x', 'description' => 'y', 'indexable' => false]]);

        $entry = (new ContentCollection(app(ContentRepository::class)))->find('landing.compare', ['slug' => 'tableplus']);

        expect($entry->renderLocales)->toBe(['en', 'vi']);
        expect($entry->indexableLocales)->toBe(['en']);
        expect($entry->robots('vi'))->toBe('noindex, follow');
        expect($entry->hreflangCluster())->toBe([]);
    });

    it('knows the hubs by their index file and gives them no card of their own', function (): void {
        seoWriteContent($this->dirs['content'], 'en', 'databases/index');
        seoWriteContent($this->dirs['content'], 'vi', 'databases/index');

        $hub = (new ContentCollection(app(ContentRepository::class)))->find('landing.databases.index', []);

        expect($hub->renderLocales)->toBe(['en', 'vi']);
        expect($hub->ogSlug)->toBeNull();
        expect(ContentCollection::contentName($hub))->toBe('databases/index');
    });

    it('ignores a content file whose slug no route accepts', function (): void {
        /*
         * A file with no slug behind it in the route constant would be a
         * sitemap URL that answers 404.
         */
        seoWriteContent($this->dirs['content'], 'en', 'features/not-a-feature');
        seoWriteContent($this->dirs['content'], 'en', 'databases/ios');

        $family = new ContentCollection(app(ContentRepository::class));

        expect($family->find('landing.features.show', ['slug' => 'not-a-feature']))->toBeNull();
        expect($family->find('landing.databaseClient', ['slug' => 'ios']))->toBeNull();
        expect($family->entries())->toBe([]);
    });

    it('answers for nothing it has no content for, so the registry falls through', function (): void {
        $family = new ContentCollection(app(ContentRepository::class));

        expect($family->find('landing.features.show', ['slug' => 'querying']))->toBeNull();
        expect($family->find('landing.compare.index', []))->toBeNull();
        expect($family->find('landing.faq', []))->toBeNull();
        expect($family->find('landing.compare', ['slug' => 'tableplus', 'extra' => 'x']))->toBeNull();
    });

    it('dates a page by its copy in that locale and the data it renders', function (): void {
        seoWriteContent($this->dirs['content'], 'en', 'databases/mysql-client');
        seoWriteContent($this->dirs['content'], 'vi', 'databases/mysql-client');

        $entry = (new ContentCollection(app(ContentRepository::class)))->find('landing.databaseClient', ['slug' => 'mysql-client']);

        expect($entry->sources)->toContain(
            'resources/data/content/en/databases/mysql-client.json',
            'resources/data/content/vi/databases/mysql-client.json',
            'resources/data/content/en/engines.json',
            'resources/data/content/vi/engines.json',
            'resources/data/engines.json',
        );

        expect(LastModified::sourcesFor($entry->sources, 'vi'))->toBe([
            'resources/data/content/vi/databases/mysql-client.json',
            'resources/data/content/vi/engines.json',
            'resources/data/engines.json',
        ]);
    });

    it('dates a feature page by the engine lists, platforms and shared labels it renders', function (): void {
        seoWriteContent($this->dirs['content'], 'en', 'features/querying');

        $family = new ContentCollection(app(ContentRepository::class));

        expect(LastModified::sourcesFor($family->find('landing.features.show', ['slug' => 'querying'])->sources, 'en'))->toBe([
            'resources/data/content/en/features/querying.json',
            'resources/data/content/en/features/index.json',
            'resources/data/facts.json',
            'resources/data/paid-features.json',
            'resources/data/engines.json',
            'resources/data/platforms.json',
        ]);
    });

    it('lists every page once, from either locale', function (): void {
        seoWriteContent($this->dirs['content'], 'en', 'features/index');
        seoWriteContent($this->dirs['content'], 'en', 'features/schema');
        seoWriteContent($this->dirs['content'], 'vi', 'features/querying');

        $keys = array_map(fn(PageEntry $entry): string => $entry->key(), (new ContentCollection(app(ContentRepository::class)))->entries());

        expect($keys)->toBe([
            'landing.features.index?',
            'landing.features.show?slug=querying',
            'landing.features.show?slug=schema',
        ]);
    });
});

describe('BlogPosts', function (): void {
    it('renders a post in each language it was written in, and indexes it there', function (): void {
        seoWriteMarkdown($this->dirs['blog'] . '/tablepro-0-77.md');
        seoWriteMarkdown($this->dirs['blog'] . '/a-guide.md');
        seoWriteMarkdown($this->dirs['blog'] . '/vi/a-guide.md');

        $family = app(BlogPosts::class);
        $release = $family->find('landing.blog.show', ['slug' => 'tablepro-0-77']);
        $guide = $family->find('landing.blog.show', ['slug' => 'a-guide']);

        expect($release->renderLocales)->toBe(['en']);
        expect($release->hreflangCluster())->toBe([], 'an English-only post has no alternates');
        expect([$release->ogFamily, $release->ogSlug])->toBe(['blog', 'tablepro-0-77']);

        expect($guide->renderLocales)->toBe(['en', 'vi']);
        expect($guide->hreflangCluster())->toBe(['en', 'vi']);
        expect($guide->sources)->toBe([
            str_replace(base_path() . '/', '', $this->dirs['blog']) . '/a-guide.md',
            str_replace(base_path() . '/', '', $this->dirs['blog']) . '/vi/a-guide.md',
        ]);
    });

    it('never lets a slug reach outside the blog directory', function (string $slug): void {
        seoWriteMarkdown($this->dirs['root'] . '/secret.md');

        expect(app(BlogPosts::class)->find('landing.blog.show', ['slug' => $slug]))->toBeNull();
    })->with(['../secret', 'Tablepro-0-77', 'a/b', '', '-x', 'x-', 'a--b']);

    it('lists a translation-only slug too, and nothing else', function (): void {
        seoWriteMarkdown($this->dirs['blog'] . '/vi/only-in-vietnamese.md');
        File::put($this->dirs['blog'] . '/notes.txt', 'not a post');

        $entries = app(BlogPosts::class)->entries();

        expect($entries)->toHaveCount(1);
        expect($entries[0]->renderLocales)->toBe(['vi']);
        expect($entries[0]->hreflangCluster())->toBe([]);
    });

    it('answers only for the post route', function (): void {
        seoWriteMarkdown($this->dirs['blog'] . '/a-post.md');

        expect(app(BlogPosts::class)->find('landing.blog.index', ['slug' => 'a-post']))->toBeNull();
        expect(app(BlogPosts::class)->find('landing.blog.show', ['slug' => 'a-post', 'page' => '2']))->toBeNull();
    });
});

describe('LegalPages', function (): void {
    it('pairs a document with its translation and indexes both', function (): void {
        seoWriteMarkdown($this->dirs['legal'] . '/en/privacy.md');
        seoWriteMarkdown($this->dirs['legal'] . '/vi/privacy.md');
        seoWriteMarkdown($this->dirs['legal'] . '/en/terms.md');

        $family = app(LegalPages::class);

        expect($family->find('landing.privacy', [])->hreflangCluster())->toBe(['en', 'vi']);
        expect($family->find('landing.terms', [])->renderLocales)->toBe(['en']);
        expect($family->find('landing.refundPolicy', []))->toBeNull();
        expect($family->find('landing.privacy', [])->ogFamily)->toBe('site');
        expect(array_map(fn(PageEntry $entry): string => $entry->route, $family->entries()))->toBe(['landing.privacy', 'landing.terms']);
    });
});

describe('the registry the provider builds', function (): void {
    it('knows a page only in the locales its content exists in', function (): void {
        /*
         * Every family builds its pages from content files. Before a page's
         * file exists it is no page at all (the route answers 404); the moment
         * it exists, the page renders in every locale it was written in.
         */
        expect(app(PageRegistry::class)->find('landing.privacy', []))->toBeNull();

        seoWriteMarkdown($this->dirs['legal'] . '/en/privacy.md');
        seoWriteMarkdown($this->dirs['legal'] . '/vi/privacy.md');
        seoWriteContent($this->dirs['content'], 'en', 'faq');
        seoWriteContent($this->dirs['content'], 'vi', 'faq');
        seoWriteContent($this->dirs['content'], 'en', 'compare/dbeaver');
        seoWriteContent($this->dirs['content'], 'vi', 'compare/dbeaver');
        $this->app->forgetInstance(PageRegistry::class);

        $registry = app(PageRegistry::class);

        expect($registry->find('landing.privacy', [])->renderLocales)->toBe(['en', 'vi']);
        expect($registry->find('landing.faq', [])->renderLocales)->toBe(['en', 'vi']);
        expect($registry->find('landing.compare', ['slug' => 'dbeaver'])->renderLocales)->toBe(['en', 'vi']);
        expect($registry->find('landing.compare', ['slug' => 'tableplus']))->toBeNull();
    });

    it('drops whatever the redirect map retires, from every family', function (): void {
        seoWriteMarkdown($this->dirs['blog'] . '/merged-guide.md');
        seoWriteMarkdown($this->dirs['blog'] . '/kept-post.md');
        seoWriteContent($this->dirs['content'], 'en', 'compare/azimutt');

        File::put($this->dirs['root'] . '/redirects.json', json_encode([
            ['from' => '/blog/merged-guide', 'to' => '/features/ai-mcp', 'status' => 301, 'reason' => 'test'],
            ['from' => '/compare/azimutt', 'status' => 410, 'reason' => 'test'],
            ['from' => '/mariadb-client', 'to' => '/mysql-client#mariadb', 'status' => 301, 'reason' => 'test'],
        ], JSON_THROW_ON_ERROR));

        $this->app->instance(RedirectMap::class, new RedirectMap($this->dirs['root'] . '/redirects.json', resource_path('data/engines.json')));
        $this->app->forgetInstance(PageRegistry::class);

        $registry = app(PageRegistry::class);
        $paths = array_map(fn(PageEntry $entry): string => $entry->url('en', false), $registry->all());

        expect($registry->find('landing.blog.show', ['slug' => 'merged-guide']))->toBeNull();
        expect($registry->find('landing.compare', ['slug' => 'azimutt']))->toBeNull();
        expect($registry->find('landing.databaseClient', ['slug' => 'mariadb-client']))->toBeNull();
        expect($registry->find('landing.blog.show', ['slug' => 'kept-post']))->not->toBeNull();
        foreach (['/blog/merged-guide', '/compare/azimutt', '/mariadb-client'] as $retired) {
            expect(in_array($retired, $paths, true))->toBeFalse("{$retired} is still listed");
        }

        expect($paths)->toContain('/blog/kept-post');
    });

    it('keeps the untouched locales of a partly retired page', function (): void {
        $family = new class implements PageFamily {
            public function entries(): array
            {
                return [$this->find('landing.download', [])];
            }

            public function find(string $route, array $params): ?PageEntry
            {
                return $route === 'landing.download' ? new PageEntry($route, [], ['en', 'vi'], ['en', 'vi'], ['a.json'], 'site', null) : null;
            }
        };

        File::put($this->dirs['root'] . '/redirects.json', json_encode([
            ['from' => '/download', 'to' => '/elsewhere', 'status' => 301, 'reason' => 'test'],
        ], JSON_THROW_ON_ERROR));

        $wrapped = new WithoutRetiredPaths($family, new RedirectMap($this->dirs['root'] . '/redirects.json', '/nonexistent/engines.json'));
        $entry = $wrapped->find('landing.download', []);

        expect($entry->renderLocales)->toBe(['vi']);
        expect($entry->indexableLocales)->toBe(['vi']);
        expect($entry->hreflangCluster())->toBe([]);
        expect($wrapped->entries())->toHaveCount(1);
    });
});

describe('LastModified', function (): void {
    it('dates files by their last commit, not by when they were pulled', function (): void {
        $repo = $this->dirs['root'] . '/repo';
        File::ensureDirectoryExists($repo . '/resources/data/content/vi');
        File::put($repo . '/resources/data/content/vi/faq.json', '{}');
        File::put($repo . '/resources/data/shared.json', '{}');

        $git = static function (array $arguments, string $date = '2026-01-02T03:04:05+00:00') use ($repo): void {
            $process = new Process(['git', '-c', 'user.name=Test', '-c', 'user.email=test@example.test', '-c', 'commit.gpgsign=false', ...$arguments], $repo, [
                'GIT_AUTHOR_DATE' => $date,
                'GIT_COMMITTER_DATE' => $date,
            ]);
            $process->mustRun();
        };

        $git(['init', '--quiet']);
        $git(['add', 'resources/data/shared.json']);
        $git(['commit', '--quiet', '-m', 'shared'], '2026-01-02T03:04:05+00:00');
        $git(['add', 'resources/data/content/vi/faq.json']);
        $git(['commit', '--quiet', '-m', 'faq'], '2026-03-04T05:06:07+00:00');

        touch($repo . '/resources/data/shared.json', strtotime('2030-01-01'));

        $dates = new LastModified($repo);

        expect($dates->forPaths(['resources/data/shared.json'])?->toIso8601String())->toBe('2026-01-02T03:04:05+00:00');
        expect($dates->forPaths(['resources/data/shared.json', 'resources/data/content/vi/faq.json'])?->toIso8601String())
            ->toBe('2026-03-04T05:06:07+00:00');
    });

    it('falls back to the newest modification time outside git, and to nothing without files', function (): void {
        $root = $this->dirs['root'] . '/plain';
        File::ensureDirectoryExists($root);
        File::put($root . '/old.json', '{}');
        File::put($root . '/new.json', '{}');
        touch($root . '/old.json', strtotime('2025-05-05 05:05:05 UTC'));
        touch($root . '/new.json', strtotime('2026-06-06 06:06:06 UTC'));

        $dates = new LastModified($root);

        expect($dates->forPaths(['old.json', 'new.json'])?->getTimestamp())->toBe(strtotime('2026-06-06 06:06:06 UTC'));
        expect($dates->forPaths(['missing.json']))->toBeNull();
        expect($dates->forPaths([]))->toBeNull();
    });

    it('keeps only what drives the page in the locale asked for', function (): void {
        $sources = [
            'resources/data/content/en/home.json',
            'resources/data/content/vi/home.json',
            'resources/data/legal/vi/privacy.md',
            'resources/blog/tablepro-0-77.md',
            'resources/blog/vi/a-guide.md',
            'resources/data/pricing.json',
            'resources/js/pages/Home.tsx',
        ];

        expect(LastModified::sourcesFor($sources, 'en'))->toBe([
            'resources/data/content/en/home.json',
            'resources/blog/tablepro-0-77.md',
            'resources/data/pricing.json',
            'resources/js/pages/Home.tsx',
        ]);

        expect(LastModified::sourcesFor($sources, 'vi'))->toBe([
            'resources/data/content/vi/home.json',
            'resources/data/legal/vi/privacy.md',
            'resources/blog/vi/a-guide.md',
            'resources/data/pricing.json',
            'resources/js/pages/Home.tsx',
        ]);
    });

    it('returns a date for every page the registry lists', function (): void {
        $dates = app(LastModified::class);
        $entries = committedPageRegistry()->all();

        expect($entries)->not->toBeEmpty();

        foreach ($entries as $entry) {
            foreach ($entry->indexableLocales as $locale) {
                expect($dates->forEntry($entry, $locale))->toBeInstanceOf(CarbonImmutable::class, "{$entry->key()} ({$locale}) has no lastmod");
            }
        }
    });
});

describe('OgImages', function (): void {
    beforeEach(function (): void {
        $this->public = seoScratchPublic();
    });

    afterEach(function (): void {
        File::deleteDirectory($this->public);
    });

    it('uses the page card, then the locale card, then nothing', function (): void {
        $entry = new PageEntry('landing.compare', ['slug' => 'tableplus'], ['en', 'vi'], ['en', 'vi'], [], 'compare', 'tableplus');
        $images = new OgImages();

        expect($images->for($entry, 'en'))->toBeNull();
        expect($images->for($entry, 'vi'))->toBeNull();

        File::put($this->public . '/og.png', seoPngBytes());
        File::ensureDirectoryExists($this->public . '/og/vi');
        File::put($this->public . '/og/vi/default.png', seoPngBytes());

        expect($images->for($entry, 'en')['url'])->toBe('https://localhost/og.png');
        expect($images->for($entry, 'vi')['url'])->toBe('https://localhost/og/vi/default.png');

        File::ensureDirectoryExists($this->public . '/og/compare');
        File::ensureDirectoryExists($this->public . '/og/vi/compare');
        File::put($this->public . '/og/compare/tableplus.png', seoPngBytes());
        File::put($this->public . '/og/vi/compare/tableplus.png', seoPngBytes());

        expect($images->for($entry, 'en'))->toBe(['url' => 'https://localhost/og/compare/tableplus.png', 'width' => 1, 'height' => 1, 'type' => 'image/png']);
        expect($images->for($entry, 'vi')['url'])->toBe('https://localhost/og/vi/compare/tableplus.png');
    });

    it('never borrows another locale card', function (): void {
        $entry = new PageEntry('landing.compare', ['slug' => 'tableplus'], ['en', 'vi'], ['en', 'vi'], [], 'compare', 'tableplus');

        File::ensureDirectoryExists($this->public . '/og/compare');
        File::put($this->public . '/og/compare/tableplus.png', seoPngBytes());
        File::put($this->public . '/og.png', seoPngBytes());

        expect((new OgImages())->for($entry, 'vi'))->toBeNull();
    });

    it('gives site pages the locale card only', function (): void {
        File::put($this->public . '/og.png', seoPngBytes());

        $home = new PageEntry('landing.home', [], ['en'], ['en'], [], 'site', null);

        expect((new OgImages())->for($home, 'en')['url'])->toBe('https://localhost/og.png');
    });

    /*
     * Spec §9.1: one manifest update plus the files activates the final art.
     * The fixture manifest's `fixture-og` entry is already `supplied`, so only
     * the files decide, one locale at a time.
     */
    it('puts a supplied bespoke site card in place of the generated one, per locale', function (): void {
        $images = new OgImages(new AssetManifest(base_path('tests/Fixtures/assets/manifest.json')), 'fixture-og');
        $home = new PageEntry('landing.home', [], ['en', 'vi'], ['en', 'vi'], [], 'site', null);
        $compare = new PageEntry('landing.compare', ['slug' => 'tableplus'], ['en', 'vi'], ['en', 'vi'], [], 'compare', 'tableplus');

        File::put($this->public . '/og.png', seoPngBytes());
        File::ensureDirectoryExists($this->public . '/og/vi');
        File::put($this->public . '/og/vi/default.png', seoPngBytes());

        expect($images->for($home, 'en')['url'])->toBe('https://localhost/og.png');

        File::ensureDirectoryExists($this->public . '/og/fixture');
        File::put($this->public . '/og/fixture/fixture-og-en.png', seoPngBytes());

        expect($images->for($home, 'en')['url'])->toBe('https://localhost/og/fixture/fixture-og-en.png');
        expect($images->for($home, 'vi')['url'])->toBe('https://localhost/og/vi/default.png');

        File::put($this->public . '/og/fixture/fixture-og-vi.png', seoPngBytes());

        expect($images->for($home, 'vi')['url'])->toBe('https://localhost/og/fixture/fixture-og-vi.png');

        File::ensureDirectoryExists($this->public . '/og/compare');
        File::put($this->public . '/og/compare/tableplus.png', seoPngBytes());

        expect($images->for($compare, 'en')['url'])->toBe('https://localhost/og/compare/tableplus.png');
        expect($images->for($compare, 'vi')['url'])->toBe('https://localhost/og/fixture/fixture-og-vi.png');
    });

    /*
     * The committed entry, against the committed card files copied into the
     * scratch public directory one locale at a time: a placeholder never
     * displaces the generated card, and a supplied entry does so only in a
     * locale whose file is in place.
     */
    it('reads the real bespoke site card, which takes over a locale only when supplied and on disk', function (): void {
        $manifest = new AssetManifest();

        expect($manifest->entry(OgImages::SITE_CARD)['kind'])->toBe('og-card');

        File::put($this->public . '/og.png', seoPngBytes());
        File::ensureDirectoryExists($this->public . '/og/vi');
        File::put($this->public . '/og/vi/default.png', seoPngBytes());

        $home = new PageEntry('landing.home', [], ['en', 'vi'], ['en', 'vi'], [], 'site', null);
        $images = app(OgImages::class);

        expect($images->for($home, 'en')['url'])->toBe('https://localhost/og.png');
        expect($images->for($home, 'vi')['url'])->toBe('https://localhost/og/vi/default.png');

        $card = $manifest->fileUrl(OgImages::SITE_CARD, 'light', 'en', 1200, 'png');
        File::ensureDirectoryExists(dirname($this->public . $card));
        File::copy(base_path('public' . $card), $this->public . $card);

        expect($images->for($home, 'en')['url'])->toBe('https://localhost' . ($manifest->isSupplied(OgImages::SITE_CARD) ? $card : '/og.png'));
        expect($images->for($home, 'vi')['url'])->toBe('https://localhost/og/vi/default.png');
    });

    it('names the paths og:generate writes', function (): void {
        expect(OgImages::cardPath('database', 'mysql-client', 'en'))->toBe('/og/database/mysql-client.png');
        expect(OgImages::cardPath('database', 'mysql-client', 'vi'))->toBe('/og/vi/database/mysql-client.png');
        expect(OgImages::fallbackPath('en'))->toBe('/og.png');
        expect(OgImages::fallbackPath('vi'))->toBe('/og/vi/default.png');
    });
});

describe('OgFonts', function (): void {
    it('inlines every font file the stylesheet names, and leaves data URIs alone', function (): void {
        File::ensureDirectoryExists($this->dirs['root'] . '/css/fonts');
        File::put($this->dirs['root'] . '/css/fonts/face.woff2', 'woff2-bytes');
        File::put($this->dirs['root'] . '/css/fonts.css', <<<'CSS'
            /* A comment with url("ignored.woff2") in it. */
            @font-face { font-family: "A"; src: url("fonts/face.woff2") format("woff2"); }
            @font-face { font-family: "B"; src: url(data:font/woff2;base64,AAAA) format("woff2"); }
            CSS);

        $css = (new OgFonts($this->dirs['root'] . '/css/fonts.css'))->css();

        expect($css)
            ->toContain('url("data:font/woff2;base64,' . base64_encode('woff2-bytes') . '")')
            ->toContain('url("data:font/woff2;base64,AAAA")')
            ->not->toContain('ignored.woff2')
            ->not->toContain('fonts/face.woff2');
    });

    it('fails loudly when a font is missing, rather than rendering a fallback face', function (): void {
        File::ensureDirectoryExists($this->dirs['root'] . '/css');
        File::put($this->dirs['root'] . '/css/fonts.css', '@font-face { src: url("missing.woff2"); }');

        expect(fn() => (new OgFonts($this->dirs['root'] . '/css/fonts.css'))->css())->toThrow(RuntimeException::class, 'npm ci');
        expect(fn() => (new OgFonts($this->dirs['root'] . '/css/none.css'))->css())->toThrow(RuntimeException::class);
    });

    it('reads the site stylesheet, so a card and a page cannot use different faces', function (): void {
        $stylesheet = (new ReflectionProperty(OgFonts::class, 'stylesheet'))->getValue(app(OgFonts::class));

        expect($stylesheet)->toBe(resource_path('css/fonts.css'));
        expect(file_get_contents($stylesheet))->toContain('inter-vietnamese');
    });
});

it('never registers a locale the site does not serve', function (): void {
    $entries = committedPageRegistry()->all();

    expect($entries)->not->toBeEmpty();

    foreach ($entries as $entry) {
        expect(array_diff($entry->renderLocales, Locales::codes()))->toBe([]);
        expect(array_diff($entry->indexableLocales, $entry->renderLocales))->toBe([], "{$entry->key()} is indexed where it does not render");
    }
});
