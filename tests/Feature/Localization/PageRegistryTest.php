<?php

use App\Support\Content\ContentRepository;
use App\Support\Localization\LocaleSwitcher;
use App\Support\Seo\OgImages;
use App\Support\Seo\PageEntry;
use App\Support\Seo\PageFamily;
use App\Support\Seo\PageRegistry;
use App\Support\Seo\RedirectMap;
use App\Support\Seo\SeoContext;
use App\Support\Seo\StaticPages;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\File;

/**
 * The registry's rules, which every SEO surface inherits.
 *
 * A page renders in the locales it has content for and is indexed in a subset
 * of them. hreflang lists only real translations, canonicals are always
 * self-referencing, and a page that renders but is not indexed (`/vi/blog`)
 * gets `noindex, follow` and nothing else. These run against a scratch content
 * tree, so they hold before any real content exists and keep holding after.
 */
beforeEach(function (): void {
    $this->contentDir = storage_path('framework/testing/content-' . uniqid());
    File::ensureDirectoryExists($this->contentDir);

    $this->app->instance(ContentRepository::class, new ContentRepository($this->contentDir));
    $this->app->forgetInstance(PageRegistry::class);
});

afterEach(function (): void {
    File::deleteDirectory($this->contentDir);
});

/**
 * @param  array<string, mixed>  $data
 */
function writeContent(string $dir, string $locale, string $name, array $data = ['seo' => ['title' => 'x', 'description' => 'y']]): void
{
    File::ensureDirectoryExists(dirname("{$dir}/{$locale}/{$name}.json"));
    File::put("{$dir}/{$locale}/{$name}.json", json_encode($data, JSON_THROW_ON_ERROR));
}

/**
 * A request for `$path`, matched and bound the way the router leaves it.
 */
function matchedRequest(string $path, string $locale): Request
{
    $request = Request::create($path);
    $route = app('router')->getRoutes()->match($request);
    $route->bind($request);
    $request->setRouteResolver(fn() => $route);
    App::setLocale($locale);

    return $request;
}

it('keeps render and index apart on a page entry', function (): void {
    $entry = new PageEntry('landing.blog.index', [], ['en', 'vi'], ['en'], [], 'site', null);

    expect($entry->renders('vi'))->toBeTrue();
    expect($entry->isIndexable('vi'))->toBeFalse();
    expect($entry->robots('vi'))->toBe('noindex, follow');
    expect($entry->robots('en'))->toBe('index, follow');
    expect($entry->hreflangCluster())->toBe([]);

    $pair = new PageEntry('landing.download', [], ['en', 'vi'], ['en', 'vi'], [], 'site', null);
    expect($pair->hreflangCluster())->toBe(['en', 'vi']);

    $claimsTooMuch = new PageEntry('landing.faq', [], ['en'], ['en', 'vi'], [], 'site', null);
    expect($claimsTooMuch->isIndexable('vi'))->toBeFalse();
    expect($claimsTooMuch->hreflangCluster())->toBe([]);
});

it('builds each locale URL from the canonical origin, never from the request', function (): void {
    $entry = new PageEntry('landing.compare', ['slug' => 'tableplus'], ['en', 'vi'], ['en', 'vi'], [], 'compare', 'tableplus');

    expect($entry->url('en'))->toBe('https://localhost/compare/tableplus');
    expect($entry->url('vi'))->toBe('https://localhost/vi/compare/tableplus');
    expect($entry->url('vi', false))->toBe('/vi/compare/tableplus');
    expect((new PageEntry('landing.home', [], ['en', 'vi'], ['en', 'vi'], [], 'site', null))->url('en'))->toBe('https://localhost/');
});

it('knows a static page only once its content lands', function (): void {
    $registry = app(PageRegistry::class);

    expect($registry->find('landing.download', []))->toBeNull();

    writeContent($this->contentDir, 'en', 'download');
    writeContent($this->contentDir, 'vi', 'download');
    $this->app->forgetInstance(PageRegistry::class);

    $entry = app(PageRegistry::class)->find('landing.download', []);

    expect($entry->renderLocales)->toBe(['en', 'vi']);
    expect($entry->indexableLocales)->toBe(['en', 'vi']);
    expect($entry->sources)->toBe([
        'resources/data/content/en/download.json',
        'resources/data/content/vi/download.json',
    ]);
});

it('renders /vi/blog without indexing it when its content says so', function (): void {
    writeContent($this->contentDir, 'en', 'blog');
    writeContent($this->contentDir, 'vi', 'blog', ['seo' => ['title' => 'Blog', 'description' => 'd', 'indexable' => false]]);

    $entry = app(PageRegistry::class)->find('landing.blog.index', []);

    expect($entry->renderLocales)->toBe(['en', 'vi']);
    expect($entry->indexableLocales)->toBe(['en']);

    $vi = app(SeoContext::class)->forRequest(matchedRequest('/vi/blog', 'vi'));

    expect($vi)->toMatchArray([
        'robots' => 'noindex, follow',
        'canonical' => null,
        'alternates' => [],
        'xDefault' => null,
        'ogLocale' => 'vi_VN',
        'ogLocaleAlternates' => [],
    ]);

    $en = app(SeoContext::class)->forRequest(matchedRequest('/blog', 'en'));

    expect($en['robots'])->toBe('index, follow');
    expect($en['canonical'])->toBe('https://localhost/blog');
    expect($en['alternates'])->toBe([]);

    $switcher = app(LocaleSwitcher::class)->forRequest(matchedRequest('/blog', 'en'));

    expect($switcher[1])->toMatchArray(['locale' => 'vi', 'href' => '/vi/blog', 'fallback' => false, 'current' => false]);
});

it('declares reciprocal alternates and a self canonical on a real pair', function (): void {
    writeContent($this->contentDir, 'en', 'faq');
    writeContent($this->contentDir, 'vi', 'faq');

    $en = app(SeoContext::class)->forRequest(matchedRequest('/faq', 'en'));
    $vi = app(SeoContext::class)->forRequest(matchedRequest('/vi/faq', 'vi'));

    $alternates = [
        ['hreflang' => 'en', 'href' => 'https://localhost/faq'],
        ['hreflang' => 'vi', 'href' => 'https://localhost/vi/faq'],
    ];

    expect($en['canonical'])->toBe('https://localhost/faq');
    expect($vi['canonical'])->toBe('https://localhost/vi/faq');
    expect($en['alternates'])->toBe($alternates);
    expect($vi['alternates'])->toBe($alternates);
    expect($en['xDefault'])->toBe('https://localhost/faq');
    expect($vi['xDefault'])->toBe('https://localhost/faq');
    expect($en['ogLocaleAlternates'])->toBe(['vi_VN']);
    expect($vi['ogLocaleAlternates'])->toBe(['en_US']);
});

it('sends the switcher to the nearest index when a page has no translation', function (): void {
    // A post that is still a page: a post merged elsewhere answers 301 and has no registry entry (sitemap §C.5).
    $slug = pathinfo((string) collect(glob(resource_path('blog/*.md')))->first(
        fn(string $post): bool => ! app(RedirectMap::class)->retires('/blog/' . pathinfo($post, PATHINFO_FILENAME)),
    ), PATHINFO_FILENAME);

    $before = app(LocaleSwitcher::class)->forRequest(matchedRequest("/blog/{$slug}", 'en'));

    expect($before[0])->toMatchArray(['locale' => 'en', 'href' => "/blog/{$slug}", 'current' => true]);
    expect($before[1])->toMatchArray(['locale' => 'vi', 'native' => 'Tiếng Việt', 'hreflang' => 'vi', 'href' => '/vi', 'fallback' => true]);

    writeContent($this->contentDir, 'en', 'blog');
    writeContent($this->contentDir, 'vi', 'blog', ['seo' => ['indexable' => false]]);
    $this->app->forgetInstance(PageRegistry::class);

    $after = app(LocaleSwitcher::class)->forRequest(matchedRequest("/blog/{$slug}", 'en'));

    expect($after[1])->toMatchArray(['href' => '/vi/blog', 'fallback' => true]);
});

it('asks families in order and lists each page once', function (): void {
    $first = new class implements PageFamily {
        public function entries(): array
        {
            return [new PageEntry('landing.faq', [], ['en', 'vi'], ['en', 'vi'], [], 'site', null)];
        }

        public function find(string $route, array $params): ?PageEntry
        {
            return $route === 'landing.faq' ? $this->entries()[0] : null;
        }
    };

    $second = new class implements PageFamily {
        public function entries(): array
        {
            return [
                new PageEntry('landing.faq', [], ['en'], ['en'], [], 'site', null),
                new PageEntry('landing.terms', [], ['en'], ['en'], [], 'site', null),
            ];
        }

        public function find(string $route, array $params): ?PageEntry
        {
            return collect($this->entries())->first(fn(PageEntry $entry): bool => $entry->route === $route && $params === []);
        }
    };

    $registry = new PageRegistry([$first, $second]);

    expect($registry->find('landing.faq', [])->renderLocales)->toBe(['en', 'vi']);
    expect($registry->find('landing.terms', [])->renderLocales)->toBe(['en']);
    expect($registry->find('landing.privacy', []))->toBeNull();

    $keys = array_map(fn(PageEntry $entry): string => $entry->key(), $registry->all());

    expect($keys)->toBe(array_values(array_unique($keys)));
    expect(collect($registry->all())->first(fn(PageEntry $entry): bool => $entry->route === 'landing.faq')->renderLocales)
        ->toBe(['en', 'vi']);
});

it('only ever points at an OG card that exists', function (): void {
    $og = new OgImages();
    $database = new PageEntry('landing.databaseClient', ['slug' => 'mysql-client'], ['en'], ['en'], [], 'database', 'mysql-client');

    expect($og->for($database, 'en'))->toMatchArray([
        'url' => 'https://localhost/og/database/mysql-client.png',
        'type' => 'image/png',
    ]);

    $missing = new PageEntry('landing.databaseClient', ['slug' => 'nope'], ['en'], ['en'], [], 'database', 'nope');
    expect($og->for($missing, 'en')['url'])->toBe('https://localhost/og.png');

    $vi = is_file(public_path('og/vi/default.png')) ? 'https://localhost/og/vi/default.png' : null;
    expect($og->for($database, 'vi')['url'] ?? null)->toBe(
        is_file(public_path('og/vi/database/mysql-client.png')) ? 'https://localhost/og/vi/database/mysql-client.png' : $vi,
    );
});

it('keeps the static pages to the routes that exist', function (): void {
    $names = collect(app('router')->getRoutes()->getRoutes())->map->getName()->filter()->all();

    foreach (array_keys(StaticPages::PAGES) as $route) {
        expect($names)->toContain($route);
    }
});

it('points a missing translation at the language the page does exist in', function (): void {
    writeContent($this->contentDir, 'vi', 'faq');

    $this->get('/faq')
        ->assertNotFound()
        ->assertInertia(fn(Inertia\Testing\AssertableInertia $page) => $page
            ->component('Error')
            ->where('locale', 'en')
            ->where('suggestion.href', '/vi/faq')
            ->where('suggestion.locale', 'vi')
            ->where('suggestion.hreflang', 'vi')
            ->where('localization.switcher.1.href', '/vi/faq'));
});
