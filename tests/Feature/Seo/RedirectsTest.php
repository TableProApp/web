<?php

use App\Http\Middleware\CanonicalizeRequest;
use App\Support\Localization\LocalizedUrl;
use App\Support\Seo\PageRegistry;
use App\Support\Seo\RedirectMap;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Http;
use Inertia\Testing\AssertableInertia;
use Symfony\Component\HttpFoundation\Response;

require_once __DIR__ . '/helpers.php';

/**
 * Retired URLs and URL normalisation (architecture §1.7, sitemap §C).
 *
 * `CanonicalizeRequest` runs first in the global stack, before routing, and
 * answers in one hop: a 301 that keeps the query string and the target's
 * fragment, or the branded 410. It never chains, never invents a destination
 * and never touches anything but `GET` and `HEAD`.
 */
beforeEach(function (): void {
    Http::fake(['api.github.com/*' => Http::response([], 200)]);
});

/**
 * Where a 301 for `$target` must point, with the request's query appended.
 */
function redirectsExpectedLocation(string $target, string $query = ''): string
{
    $fragmentAt = strpos($target, '#');
    $fragment = $fragmentAt === false ? '' : substr($target, $fragmentAt);
    $target = $fragmentAt === false ? $target : substr($target, 0, $fragmentAt);

    $queryAt = strpos($target, '?');
    $own = $queryAt === false ? '' : substr($target, $queryAt + 1);
    $target = $queryAt === false ? $target : substr($target, 0, $queryAt);

    $merged = implode('&', array_filter([$own, $query], static fn(string $part): bool => $part !== ''));
    $base = str_starts_with($target, '/') ? LocalizedUrl::base() . $target : $target;

    return $base . ($merged === '' ? '' : '?' . $merged) . $fragment;
}

/**
 * Runs the middleware alone on a raw request URI, for the shapes the test
 * client cannot send (`Request::create('//blog')` reads `blog` as a host).
 */
function redirectsThroughMiddleware(string $requestUri, string $method = 'GET'): Response
{
    $request = new Request(server: ['REQUEST_URI' => $requestUri, 'REQUEST_METHOD' => $method, 'HTTP_HOST' => 'localhost']);

    return app(CanonicalizeRequest::class)->handle($request, fn(): Response => new Response('passed through', 200));
}

dataset('301 entries', function (): array {
    $rows = [];

    foreach (seoRedirectEntries() as $entry) {
        if ($entry['status'] === 301) {
            $rows[$entry['from']] = [$entry['from'], $entry['to']];
        }
    }

    return $rows;
});

dataset('410 entries', function (): array {
    $rows = [];

    foreach (seoRedirectEntries() as $entry) {
        if ($entry['status'] === 410) {
            $rows[$entry['from']] = [$entry['from']];
        }
    }

    return $rows;
});

it('answers each retired path with one 301 that keeps the query', function (string $from, string $to): void {
    $query = 'ref=app-about&utm_source=x&utm_campaign=y';

    $this->get($from)->assertStatus(301)->assertHeader('Location', redirectsExpectedLocation($to));
    $this->get("{$from}?{$query}")->assertStatus(301)->assertHeader('Location', redirectsExpectedLocation($to, $query));
})->with('301 entries');

it('folds the slash and /index.php variants of a retired path into the same hop', function (string $from, string $to): void {
    $location = redirectsExpectedLocation($to, 'ref=x');

    /*
     * Absolute URLs with a query: the test client sends those verbatim, while
     * it strips the trailing slash from a relative path before sending it.
     */
    $this->get("http://localhost{$from}/?ref=x")->assertStatus(301)->assertHeader('Location', $location);
    $this->get("/index.php{$from}?ref=x")->assertStatus(301)->assertHeader('Location', $location);
    $this->call('HEAD', "http://localhost{$from}/?ref=x")->assertStatus(301)->assertHeader('Location', $location);

    $direct = redirectsThroughMiddleware("{$from}/");

    expect($direct->getStatusCode())->toBe(301);
    expect($direct->headers->get('Location'))->toBe(redirectsExpectedLocation($to));
})->with('301 entries');

it('puts the query before the target fragment', function (): void {
    $this->get('/mariadb-client/?utm_source=y')
        ->assertStatus(301)
        ->assertHeader('Location', 'https://localhost/mysql-client?utm_source=y#mariadb');
});

it('answers a gone path with the branded 410, in any of its forms', function (string $from): void {
    foreach ([$from, "http://localhost{$from}/?ref=x", "/index.php{$from}", "{$from}?ref=x"] as $path) {
        $response = $this->get($path);

        $response->assertStatus(410)->assertHeaderMissing('Location');
        $response->assertInertia(fn(AssertableInertia $page) => $page
            ->component('Error')
            ->where('status', 410)
            ->where('locale', 'en')
            ->where('seo.robots', 'noindex, follow')
            ->where('seo.canonical', null)
            ->where('seo.alternates', []));

        expect($response->getContent())->toContain('<html lang="en"');
    }
})->with('410 entries');

/*
 * Through the middleware alone, on the raw request URI. The test client trims
 * a trailing slash before it sends anything (`prepareUrlForRequest`), so
 * `$this->get('/blog/')` would request `/blog`; production sends the URI as
 * the visitor typed it.
 */
it('normalises the trailing slash and /index.php of any path in one hop', function (string $uri, string $location): void {
    $response = redirectsThroughMiddleware($uri);

    expect($response->getStatusCode())->toBe(301);
    expect($response->headers->get('Location'))->toBe($location);
})->with([
    'a section' => ['/blog/', 'https://localhost/blog'],
    'the Vietnamese home' => ['/vi/', 'https://localhost/vi'],
    'a Vietnamese page' => ['/vi/download/', 'https://localhost/vi/download'],
    'the front controller' => ['/index.php', 'https://localhost/'],
    'the front controller with a slash' => ['/index.php/', 'https://localhost/'],
    'a page behind the front controller' => ['/index.php/blog?ref=x', 'https://localhost/blog?ref=x'],
    'both at once' => ['/index.php/download/?utm_source=y', 'https://localhost/download?utm_source=y'],
    'several slashes' => ['/download///', 'https://localhost/download'],
    'the query exactly as sent' => ['/blog/?q=a%20b&tag=x&tag=y', 'https://localhost/blog?q=a%20b&tag=x&tag=y'],
]);

/*
 * A shared link loses its capitals easily, and `/en` is the first guess for
 * English. The language is fixed, the rest of the path is not touched.
 */
it('sends a language prefix in another case, or the default language spelled out, to the canonical URL in one hop', function (string $uri, string $location): void {
    $response = redirectsThroughMiddleware($uri);

    expect($response->getStatusCode())->toBe(301);
    expect($response->headers->get('Location'))->toBe($location);
})->with([
    'a lowercase region' => ['/pt-br', 'https://localhost/pt-BR'],
    'a lowercase script, with a page' => ['/zh-hans/pricing', 'https://localhost/zh-Hans/pricing'],
    'uppercase' => ['/ZH-HANT/download', 'https://localhost/zh-Hant/download'],
    'an uppercase two-letter code' => ['/VI', 'https://localhost/vi'],
    'the default language' => ['/en', 'https://localhost/'],
    'a page under the default language' => ['/en/pricing?ref=x', 'https://localhost/pricing?ref=x'],
    'with a trailing slash, still one hop' => ['/pt-br/pricing/?ref=x', 'https://localhost/pt-BR/pricing?ref=x'],
    'a retired path under the default language' => ['/en/mariadb-client', 'https://localhost/mysql-client#mariadb'],
]);

it('lands a corrected language prefix on a page that answers', function (string $path, string $canonical): void {
    $this->get($path)->assertStatus(301)->assertHeader('Location', 'https://localhost' . $canonical);
    $this->get($canonical)->assertOk();
})->with([
    ['/pt-br/pricing', '/pt-BR/pricing'],
    ['/zh-hans', '/zh-Hans'],
    ['/en/download', '/download'],
]);

it('normalises through the whole stack, before routing', function (): void {
    $this->get('http://localhost/blog/?ref=x')->assertStatus(301)->assertHeader('Location', 'https://localhost/blog?ref=x');
    $this->get('http://localhost/vi/download/?ref=x')->assertStatus(301)->assertHeader('Location', 'https://localhost/vi/download?ref=x');
    $this->get('/index.php/download?ref=x')->assertStatus(301)->assertHeader('Location', 'https://localhost/download?ref=x');
    $this->get('/index.php')->assertStatus(301)->assertHeader('Location', 'https://localhost/');
});

it('lets clean URLs through untouched', function (): void {
    $this->get('/')->assertOk()->assertHeaderMissing('Location');
    $this->get('/download?ref=app-about')->assertOk()->assertHeaderMissing('Location');
    $this->get('/vi/download')->assertOk()->assertHeaderMissing('Location');

    expect(redirectsThroughMiddleware('/')->getContent())->toBe('passed through');
    expect(redirectsThroughMiddleware('/vi')->getContent())->toBe('passed through');
    expect(redirectsThroughMiddleware('/blog?ref=x')->getContent())->toBe('passed through');
});

it('builds the Location from the canonical origin, never from the request host', function (): void {
    $this->get('http://attacker.example/blog/?ref=x')->assertStatus(301)->assertHeader('Location', 'https://localhost/blog?ref=x');
    $this->get('http://attacker.example/mariadb-client')->assertStatus(301)->assertHeader('Location', 'https://localhost/mysql-client#mariadb');
});

it('sends the docs-style database paths to the engine they name', function (string $path, string $location): void {
    $this->get($path)->assertStatus(301)->assertHeader('Location', $location);
})->with([
    /*
     * The four evidenced inbound paths (sitemap §C.6): the plugin registry
     * linked the first two for months, CI the other two.
     */
    'oracle' => ['/databases/oracle', 'https://localhost/oracle-client'],
    'clickhouse' => ['/databases/clickhouse', 'https://localhost/clickhouse-client'],
    'sqlite' => ['/databases/sqlite', 'https://localhost/sqlite-client'],
    'duckdb' => ['/databases/duckdb', 'https://localhost/duckdb-client'],
    'a merged engine, to its section' => ['/databases/mariadb', 'https://localhost/mysql-client#mariadb'],
    'a hub-only engine, to its row' => ['/databases/spanner', 'https://localhost/databases#spanner'],
    'with a slash and a query, still one hop' => ['/databases/oracle/?ref=x', 'https://localhost/oracle-client?ref=x'],
]);

it('derives every docs-style path from engines.json', function (): void {
    $targets = app(RedirectMap::class)->docsSlugTargets();

    expect($targets)->not->toBeEmpty();

    foreach ($targets as $docsSlug => $target) {
        $this->get("/databases/{$docsSlug}")->assertStatus(301)->assertHeader('Location', redirectsExpectedLocation($target));
    }
});

it('never guesses: unknown paths stay 404 and nothing goes to the homepage', function (string $path): void {
    $response = $this->get($path);

    $response->assertNotFound()->assertHeaderMissing('Location');
})->with([
    'an unknown docs-style path' => ['/databases/not-an-engine'],
    'an unknown page' => ['/no-such-page'],
    'a slug that never existed' => ['/compare/sql-workbench'],
    'an uppercase path' => ['/Download'],
    'an uppercase path under a language' => ['/vi/Download'],
    'a language the site does not have' => ['/zh-CN'],
    'a region the site does not have' => ['/pt-PT/pricing'],
    'a word that only starts like a language' => ['/enterprise'],
    'a retired path in Vietnamese, which never existed' => ['/vi/mariadb-client'],
    'a retired post in Vietnamese' => ['/vi/blog/mcp-database-claude'],
]);

it('answers 404 for every URL the disposition table says never existed or has no replacement', function (string $path): void {
    /*
     * Sitemap §C lists these with their evidence: probed slugs that were
     * never routed, release numbers with no post, feeds that never existed,
     * one-day README assets, the platform's old mail previews, and platform
     * paths under `/vi`. None gets a guessed redirect, and none may quietly
     * start answering.
     */
    $this->get($path)->assertNotFound()->assertHeaderMissing('Location');
})->with([
    '/libsql-client',
    '/sap-hana-client',
    '/hana-client',
    '/mssql-client',
    '/postgres-client',
    '/blog/tablepro-0-66',
    '/blog/tablepro-0-71',
    '/blog/tablepro-0-75',
    '/feed',
    '/blog/feed',
    '/rss',
    '/rss.xml',
    '/atom.xml',
    '/feed.xml',
    '/blog/rss.xml',
    '/sitemap-0.xml',
    '/docs/logo/logo.png',
    '/docs/images/hero-dark.png',
    '/mail-preview',
    '/mail-preview/waitlist-launch',
    '/images/connections-dark.png',
    '/sponsors/nimbus.svg',
    '/vi/checkout',
]);

it('lands every redirect on an element its fragment names', function (): void {
    /*
     * A 301 to `/mysql-client#mariadb` is only a genuine replacement if the
     * page has that section: a missing id drops the reader at the top of a
     * long page with no sign of what they came for.
     */
    $targets = [];

    foreach (seoRedirectEntries() as $entry) {
        if ($entry['status'] === 301 && str_starts_with($entry['to'], '/') && str_contains($entry['to'], '#')) {
            $targets[$entry['to']] = $entry['from'];
        }
    }

    foreach (app(RedirectMap::class)->docsSlugTargets() as $docsSlug => $target) {
        if (str_contains($target, '#')) {
            $targets[$target] = "/databases/{$docsSlug}";
        }
    }

    expect($targets)->not->toBeEmpty();

    $documents = [];

    foreach ($targets as $target => $from) {
        [$path, $fragment] = explode('#', $target, 2);
        $path = substr($path, 0, strcspn($path, '?'));
        $documents[$path] ??= Dom\HTMLDocument::createFromString(ssrHtml($path), LIBXML_NOERROR);

        expect($documents[$path]->getElementById($fragment))->not->toBeNull("{$from} → {$target}: {$path} has no element with id=\"{$fragment}\"");
    }
})->group('ssr');

it('leaves double slashes alone, so they stay 404', function (string $uri): void {
    $response = redirectsThroughMiddleware($uri);

    expect($response->getStatusCode())->toBe(200);
    expect($response->getContent())->toBe('passed through');
})->with([
    '//blog',
    '//blog/',
    '/index.php//blog',
    '/blog//post',
    '/Blog',
]);

it('touches nothing but GET and HEAD', function (string $method): void {
    foreach (['/mariadb-client', '/blog/', '/compare/azimutt', '/index.php/blog'] as $path) {
        $response = redirectsThroughMiddleware($path, $method);

        expect($response->getContent())->toBe('passed through', "{$method} {$path} was answered by the middleware");
    }

    $this->call($method, '/mariadb-client')->assertHeaderMissing('Location');
})->with(['POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']);

it('keeps retired paths out of the registry, so no surface advertises them', function (): void {
    $map = app(RedirectMap::class);
    $retired = array_column(seoRedirectEntries(), 'from');

    foreach (app(PageRegistry::class)->all() as $entry) {
        foreach ($entry->renderLocales as $locale) {
            $path = $entry->url($locale, false);

            expect(in_array($path, $retired, true))->toBeFalse("{$path} is retired but still a page");
            expect($map->retires($path))->toBeFalse("{$path} is retired but still a page");
        }
    }
});

it('reads the map per request, so a change needs no cache rebuild', function (): void {
    $dir = storage_path('framework/testing/redirects-' . uniqid());
    File::ensureDirectoryExists($dir);
    File::put("{$dir}/redirects.json", json_encode([
        ['from' => '/old-page', 'to' => '/download?from=old', 'status' => 301, 'reason' => 'test'],
        ['from' => '/gone-page', 'status' => 410, 'reason' => 'test'],
    ], JSON_THROW_ON_ERROR));

    $this->app->instance(RedirectMap::class, new RedirectMap("{$dir}/redirects.json", resource_path('data/engines.json')));

    $this->get('/old-page/?ref=x')->assertStatus(301)->assertHeader('Location', 'https://localhost/download?from=old&ref=x');
    $this->get('/gone-page')->assertStatus(410);

    File::deleteDirectory($dir);
});
