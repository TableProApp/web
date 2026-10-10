<?php

use App\Http\Middleware\CanonicalizeRequest;
use App\Http\Middleware\SecurityHeaders;
use App\Support\Content\Slugs\CompareSlugs;
use App\Support\Content\Slugs\DatabaseSlugs;
use App\Support\Content\Slugs\FeatureSlugs;
use App\Support\Localization\Locales;
use App\Support\Localization\LocalizedUrl;
use App\Support\Seo\PageRegistry;
use Illuminate\Contracts\Http\Kernel;
use Illuminate\Routing\Route;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Route as Router;
use Inertia\Middleware\EnsureDeferredCallbacksRun;
use Inertia\Testing\AssertableInertia;
use PHPUnit\Framework\Assert;

/**
 * The locale contract of the public site.
 *
 * The locale is a function of the URL and nothing else: English at the root,
 * Vietnamese under `/vi`, the same declaration mounted once per locale. No
 * cookie, no session, no `Accept-Language`, no redirect between languages. And
 * a route existing in a locale is never enough for a page to answer there: the
 * registry decides, so a Vietnamese URL can never wrap English copy in
 * Vietnamese chrome.
 */
beforeEach(function (): void {
    Http::fake(['api.github.com/*' => Http::response([], 200)]);
});

/**
 * Every URL the pre-rebuild site served, and what it must answer today.
 *
 * Written down rather than derived, because deriving it from the routes would
 * let a route that disappeared take its URL out of the list with it. A URL
 * the disposition table retires moves to `resources/data/redirects.json` and
 * is expected to answer with that map's 301 or 410 instead.
 *
 * @return list<string>
 */
function preRebuildEnglishUrls(): array
{
    $urls = ['/', '/download', '/ios', '/faq', '/privacy', '/terms', '/refund-policy', '/blog'];

    foreach (glob(resource_path('blog/*.md')) ?: [] as $post) {
        $urls[] = '/blog/' . pathinfo($post, PATHINFO_FILENAME);
    }

    foreach (['tableplus', 'dbeaver', 'datagrip', 'navicat', 'beekeeper-studio', 'sequel-pro', 'postico', 'sequel-ace', 'heidisql', 'azimutt', 'phpmyadmin'] as $slug) {
        $urls[] = '/compare/' . $slug;
    }

    foreach ([
        'mysql-client', 'postgresql-client', 'sqlite-client', 'mongodb-client', 'redis-gui', 'sql-server-client',
        'oracle-client', 'clickhouse-client', 'duckdb-client', 'cassandra-client', 'mariadb-client', 'redshift-client',
        'cloudflare-d1-client', 'turso-client', 'dynamodb-gui', 'bigquery-client', 'etcd-gui', 'snowflake-client',
        'cockroachdb-client', 'elasticsearch-client', 'scylladb-client', 'pglite-client', 'surrealdb-client',
        'teradata-client', 'trino-client', 'beancount-client',
    ] as $slug) {
        $urls[] = '/' . $slug;
    }

    return $urls;
}

/**
 * The status the redirect map gives a path, or null when it does not list it.
 */
function retiredStatus(string $path): ?int
{
    $map = resource_path('data/redirects.json');

    if (! is_file($map)) {
        return null;
    }

    foreach (json_decode((string) file_get_contents($map), true) ?? [] as $entry) {
        if (($entry['from'] ?? null) === $path) {
            return (int) $entry['status'];
        }
    }

    return null;
}

/**
 * Every page the registry knows, as `[path, locale, renders]` for each locale.
 *
 * @return list<array{0: string, 1: string, 2: bool}>
 */
function registryMatrix(): array
{
    $rows = [];

    foreach (app(PageRegistry::class)->all() as $entry) {
        foreach (Locales::codes() as $locale) {
            $rows[] = [$entry->url($locale, false), $locale, $entry->renders($locale)];
        }
    }

    return $rows;
}

it('still answers every URL the pre-rebuild English site served', function (): void {
    foreach (preRebuildEnglishUrls() as $path) {
        $expected = retiredStatus($path) ?? 200;

        Assert::assertSame(
            $expected,
            $this->get($path)->getStatusCode(),
            "{$path} should answer {$expected}",
        );
    }
});

it('renders every registry page in each locale it renders in, and 404s in the others', function (): void {
    $rows = registryMatrix();

    expect($rows)->not->toBeEmpty();

    foreach ($rows as [$path, $locale, $renders]) {
        $response = $this->get($path);

        if ($renders) {
            Assert::assertSame(200, $response->getStatusCode(), "{$path} should render in {$locale}");
            $response->assertInertia(fn(AssertableInertia $page) => $page->where('locale', $locale));
            Assert::assertNotSame('Error', $response->viewData('page')['component'], "{$path} rendered the error page");

            continue;
        }

        Assert::assertSame(404, $response->getStatusCode(), "{$path} must not render in {$locale}");
        $response->assertInertia(fn(AssertableInertia $page) => $page
            ->component('Error')
            ->where('status', 404)
            ->where('locale', $locale)
            ->where('seo.robots', 'noindex, follow'));
    }
});

it('offers the existing language on a page that is missing in this one', function (): void {
    $entry = collect(app(PageRegistry::class)->all())
        ->first(fn($entry): bool => $entry->renders('en') && ! $entry->renders('vi'));

    if ($entry === null) {
        $this->markTestSkipped('Every page renders in both locales.');
    }

    $this->get($entry->url('vi', false))
        ->assertNotFound()
        ->assertInertia(fn(AssertableInertia $page) => $page
            ->component('Error')
            ->where('suggestion.href', $entry->url('en', false))
            ->where('suggestion.hreflang', 'en')
            ->where('suggestion.locale', 'en'));
});

it('answers /vi as the registry says, never with English copy', function (): void {
    $home = app(PageRegistry::class)->find('landing.home', []);
    $response = $this->get('/vi');

    expect($response->getContent())->toContain('<html lang="vi"');

    if ($home !== null && $home->renders('vi')) {
        $response->assertOk()->assertInertia(fn(AssertableInertia $page) => $page
            ->component('Home')
            ->where('locale', 'vi'));

        return;
    }

    $response->assertNotFound()->assertInertia(fn(AssertableInertia $page) => $page
        ->component('Error')
        ->where('locale', 'vi')
        ->where('suggestion.href', '/')
        ->where('seo.robots', 'noindex, follow')
        ->where('seo.canonical', null));
});

it('keeps /?ref=…#pricing working for shipped Mac builds', function (): void {
    $this->get('/?ref=app-about')
        ->assertOk()
        ->assertInertia(fn(AssertableInertia $page) => $page->component('Home')->where('locale', 'en'));
});

it('renders the pricing anchor shipped Mac builds open', function (): void {
    /*
     * The fragment never reaches the server, so this is the half a test can
     * hold: the page those links open still has the section they scroll to.
     */
    expect(ssrHtml('/?ref=app-about'))->toContain('id="pricing"');
})->group('ssr');

it('sets <html lang> from the URL on every Vietnamese path, whatever it answers', function (string $path): void {
    expect($this->get($path)->getContent())->toContain('<html lang="vi"');
})->with(['/vi', '/vi/download', '/vi/blog', '/vi/mysql-client', '/vi/compare/tableplus', '/vi/nope', '/vi/features/querying']);

it('ignores Accept-Language: English at the root, with no redirect', function (): void {
    $response = $this->withHeader('Accept-Language', 'vi-VN,vi;q=0.9')->get('/');

    $response->assertOk();
    expect($response->headers->has('Location'))->toBeFalse();
    expect($response->getContent())->toContain('<html lang="en"');
    $response->assertInertia(fn(AssertableInertia $page) => $page->where('locale', 'en'));
});

it('sets no cookie and never varies on language', function (): void {
    $paths = ['/', '/vi', '/download', '/vi/download', '/blog', '/vi/blog', '/mysql-client', '/vi/mysql-client', '/compare/tableplus', '/nope', '/vi/nope', '/robots.txt', '/up'];

    foreach (registryMatrix() as [$path]) {
        $paths[] = $path;
    }

    foreach (array_unique($paths) as $path) {
        $response = $this->get($path);

        Assert::assertSame([], $response->headers->getCookies(), "{$path} set a cookie");
        Assert::assertFalse($response->headers->has('Set-Cookie'), "{$path} sent Set-Cookie");
        Assert::assertStringNotContainsStringIgnoringCase(
            'accept-language',
            (string) $response->headers->get('Vary'),
            "{$path} varies on Accept-Language",
        );
    }
});

it('serves no locale outside the allowlist', function (string $path): void {
    $this->get($path)->assertNotFound();
})->with(['/xx', '/xx/download', '/vi/vi', '/vi/vi/download', '/vi/en', '/vi/en/download']);

it('redirects a supported locale written another way, and never serves a page there', function (string $path, string $canonical): void {
    $this->get($path)->assertStatus(301)->assertHeader('Location', 'https://localhost' . $canonical);
})->with([
    ['/en', '/'],
    ['/en/download', '/download'],
    ['/VI', '/vi'],
    ['/Vi/download', '/vi/download'],
]);

it('mounts every localized route once per locale, under the same name', function (): void {
    $routes = collect(app('router')->getRoutes()->getRoutes());
    $default = $routes->filter(fn(Route $route): bool => str_starts_with((string) $route->getName(), 'landing.'));

    expect($default)->not->toBeEmpty();

    foreach (Locales::all() as $code => $locale) {
        foreach ($default as $route) {
            $name = LocalizedUrl::routeName((string) $route->getName(), $code);
            $twin = $routes->first(fn(Route $candidate): bool => $candidate->getName() === $name);

            Assert::assertNotNull($twin, "{$name} is not registered");

            $expectedUri = $locale['prefix'] === null
                ? $route->uri()
                : trim($locale['prefix'] . '/' . ($route->uri() === '/' ? '' : $route->uri()), '/');

            Assert::assertSame($expectedUri, $twin->uri(), "{$name} is mounted at the wrong path");
            Assert::assertContains('locale:' . $code, $twin->gatherMiddleware(), "{$name} does not set its locale");
            Assert::assertContains('page', $twin->gatherMiddleware(), "{$name} is not gated by the registry");
        }
    }

    expect(route('vi.landing.home', [], false))->toBe('/vi');
    expect(route('vi.landing.compare', ['slug' => 'tableplus'], false))->toBe('/vi/compare/tableplus');
    expect(route('landing.home', [], false))->toBe('/');
});

it('never lets a slug list swallow a root path or a locale prefix', function (): void {
    $reserved = [
        'ios', 'download', 'pricing', 'faq', 'about', 'security', 'privacy', 'terms', 'refund-policy', 'brand', 'blog', 'features',
        'databases', 'compare', 'integrations', 'robots.txt', 'sitemap.xml', 'up', 'account', 'checkout', 'og', 'images', 'build',
        ...array_filter(array_column(Locales::all(), 'prefix')),
    ];

    foreach ([DatabaseSlugs::ALL, CompareSlugs::ALL, FeatureSlugs::ALL] as $slugs) {
        expect(array_intersect($slugs, $reserved))->toBe([]);
        expect($slugs)->toBe(array_values(array_unique($slugs)));

        foreach ($slugs as $slug) {
            expect($slug)->toMatch('/^[a-z0-9]+(-[a-z0-9]+)*$/');
        }
    }
});

it('pins each slug constant to its content files once the family has them', function (string $family, string $route, array $slugs): void {
    $authored = [];

    foreach (Locales::codes() as $locale) {
        $files = glob(resource_path("data/content/{$locale}/{$family}/*.json")) ?: [];
        $names = array_values(array_diff(array_map(fn(string $file): string => pathinfo($file, PATHINFO_FILENAME), $files), ['index']));
        sort($names);
        $authored[$locale] = $names;
    }

    $sorted = $slugs;
    sort($sorted);

    if (array_filter($authored) !== []) {
        foreach ($authored as $locale => $names) {
            expect($names)->toBe($sorted, "content/{$locale}/{$family} and the slug constant disagree");
        }

        return;
    }

    /*
     * Before the family's content lands, a slug either renders through its
     * pre-rebuild component or answers 404. It never renders a component that
     * has no data for it.
     */
    foreach ($slugs as $slug) {
        $path = route($route, ['slug' => $slug], false);
        $entry = app(PageRegistry::class)->find($route, ['slug' => $slug]);
        $response = $this->get($path);

        if ($entry === null) {
            // A slug the redirect map retires answers its 301 or 410 (sitemap §C.3, §C.4) until its family drops it.
            $expected = retiredStatus($path) ?? 404;

            Assert::assertSame($expected, $response->getStatusCode(), "{$path} has no page yet and must answer {$expected}");

            continue;
        }

        Assert::assertSame(200, $response->getStatusCode(), "{$path} should render");
        $response->assertInertia(fn(AssertableInertia $page) => $page->where('slug', $slug));
    }
})->with([
    'databases' => ['databases', 'landing.databaseClient', DatabaseSlugs::ALL],
    'compare' => ['compare', 'landing.compare', CompareSlugs::ALL],
    'features' => ['features', 'landing.features.show', FeatureSlugs::ALL],
]);

it('refuses a locale outside the allowlist even if a route asks for it', function (): void {
    Router::middleware(['web', 'locale:xx'])->get('/_test/unsupported', fn() => 'bonjour');

    $this->get('/_test/unsupported')->assertNotFound();
});

it('canonicalises every request before routing, matched or not', function (): void {
    /*
     * First in the global stack, not in the `web` group: a retired path such
     * as `/mariadb-client` matches no route, so group middleware never sees it.
     * Its position is the contract.
     *
     * inertia-laravel 3.4 prepends `EnsureDeferredCallbacksRun` once the kernel
     * resolves, ahead of anything the app prepends. It reads only the response
     * (a 409 client redirect) and passes the request through untouched, so it
     * is left out: nothing that looks at the request runs before this one.
     *
     * `SecurityHeaders` sits outside it for the same reason, so the redirects
     * and 410s answered here carry its headers.
     */
    $global = array_values(array_diff(
        app(Kernel::class)->getGlobalMiddleware(),
        [EnsureDeferredCallbacksRun::class, SecurityHeaders::class],
    ));

    expect($global[0])->toBe(CanonicalizeRequest::class);
});
