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

require_once __DIR__ . '/../Seo/helpers.php';

beforeEach(function (): void {
    Http::fake(['api.github.com/*' => Http::response([], 200)]);
});

/**
 * @return list<string>
 */
function preRebuildEnglishUrls(): array
{
    // Written down, not derived from the routes: a route that disappears must not take its URL with it.
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

it('still answers every URL the pre-rebuild English site served', function (): void {
    $crawl = seoCrawlProps();

    foreach (preRebuildEnglishUrls() as $path) {
        $expected = retiredStatus($path) ?? 200;

        Assert::assertSame(
            $expected,
            $crawl[$path]['status'] ?? $this->get($path)->getStatusCode(),
            "{$path} should answer {$expected}",
        );
    }
});

it('renders every registry page in each locale it renders in, and 404s in the others', function (): void {
    $crawl = seoCrawlProps();
    $checked = 0;

    foreach (app(PageRegistry::class)->all() as $entry) {
        foreach (Locales::codes() as $locale) {
            $path = $entry->url($locale, false);
            $page = $crawl[$path];

            Assert::assertSame($locale, $page['lang'], "{$path} has the wrong document language");
            Assert::assertSame($locale, $page['props']['locale'] ?? null, "{$path} is not in {$locale}");

            if ($entry->renders($locale)) {
                Assert::assertSame(200, $page['status'], "{$path} should render in {$locale}");
                Assert::assertNotSame('Error', $page['component'], "{$path} rendered the error page");
                $checked++;

                continue;
            }

            Assert::assertSame(404, $page['status'], "{$path} must not render in {$locale}");
            Assert::assertSame('Error', $page['component'], "{$path} must answer with the error page");
            Assert::assertSame(404, $page['props']['status'] ?? null, "{$path} must answer with the 404 page");
            Assert::assertSame('noindex, follow', $page['props']['seo']['robots'] ?? null, "{$path} must not be indexed");
        }
    }

    expect($checked)->toBeGreaterThan(0);
});

it('renders the pricing anchor shipped Mac builds open', function (): void {
    expect(ssrHtml('/?ref=app-about'))->toContain('id="pricing"');
})->group('ssr');

it('ignores Accept-Language: English at the root, with no redirect', function (): void {
    $response = $this->withHeader('Accept-Language', 'vi-VN,vi;q=0.9')->get('/');

    $response->assertOk();
    expect($response->headers->has('Location'))->toBeFalse();
    expect($response->getContent())->toContain('<html lang="en"');
    $response->assertInertia(fn(AssertableInertia $page) => $page->where('locale', 'en'));
});

it('sets no cookie and never varies on language', function (): void {
    foreach (['/', '/vi', '/download', '/vi/download', '/blog', '/vi/blog', '/mysql-client', '/vi/mysql-client', '/compare/tableplus', '/nope', '/vi/nope', '/robots.txt', '/up'] as $path) {
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

    foreach ($slugs as $slug) {
        $path = route($route, ['slug' => $slug], false);
        $entry = app(PageRegistry::class)->find($route, ['slug' => $slug]);
        $response = $this->get($path);

        if ($entry === null) {
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
    // A retired path matches no route, so this cannot be group middleware. The two left out only touch the response.
    $global = array_values(array_diff(
        app(Kernel::class)->getGlobalMiddleware(),
        [EnsureDeferredCallbacksRun::class, SecurityHeaders::class],
    ));

    expect($global[0])->toBe(CanonicalizeRequest::class);
});
