<?php

use App\Support\Content\ContentRepository;
use App\Support\Localization\Locales;
use App\Support\Localization\LocalizedUrl;
use App\Support\Seo\BlogPosts;
use App\Support\Seo\ContentCollection;
use App\Support\Seo\LegalPages;
use App\Support\Seo\PageEntry;
use App\Support\Seo\PageRegistry;
use App\Support\Seo\RedirectMap;
use App\Support\Seo\StaticPages;
use Illuminate\Http\Request;
use Illuminate\Routing\Route;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Http;
use PHPUnit\Framework\Assert;

require_once __DIR__ . '/../Seo/helpers.php';

/**
 * `resources/data/redirects.json`: every retired public URL and what answers
 * it (architecture §1.7, §1.8; sitemap §C).
 *
 * The map is read per request by `CanonicalizeRequest`, so nothing but these
 * rules stands between a typo in it and a live page answering 301, a redirect
 * chain, or a 410 on a URL that still has a replacement.
 */
beforeEach(function (): void {
    Http::fake(['api.github.com/*' => Http::response([], 200)]);
});

/**
 * The route a root-relative path matches for GET, if any.
 */
function redirectsDataRouteFor(string $path): ?Route
{
    try {
        $request = Request::create($path);
        $route = app('router')->getRoutes()->match($request);
        $route->bind($request);

        return $route;
    } catch (Throwable) {
        return null;
    }
}

/**
 * The path part of a target, without its query or fragment.
 */
function redirectsDataPathOf(string $target): string
{
    return substr($target, 0, strcspn($target, '?#'));
}

dataset('redirect entries', function (): array {
    $rows = [];

    foreach (seoRedirectEntries() as $index => $entry) {
        $rows[is_string($entry['from'] ?? null) ? $entry['from'] : "#{$index}"] = [$entry];
    }

    return $rows;
});

it('is a list of entries, each with a reason', function (): void {
    $entries = seoRedirectEntries();

    expect($entries)->toBeArray()->not->toBeEmpty();
    expect(array_is_list($entries))->toBeTrue('redirects.json must be a JSON array');

    foreach ($entries as $index => $entry) {
        expect(array_diff(array_keys($entry), ['from', 'to', 'status', 'reason']))
            ->toBe([], "entry {$index} has a key the map does not define");
        expect($entry['from'] ?? null)->toBeString();
        expect(trim((string) ($entry['reason'] ?? '')))->not->toBe('', "{$entry['from']} needs a reason");
    }
});

it('retires exactly the URLs the disposition table retires', function (): void {
    /*
     * Sitemap §C.2-§C.6 decide every retired URL from evidence: a 301 only
     * where a genuine replacement exists, a 410 where none does, and nothing
     * for a URL that never existed. This map is that table as data, so an
     * entry added or dropped without the table changing is a decision nobody
     * recorded. The docs-style `/databases/{docsSlug}` paths are derived from
     * engines.json and are not listed (see below).
     */
    $table = [
        '/blog/cloudflare-d1-mac' => [301, '/cloudflare-d1-client'],
        '/blog/mcp-database-claude' => [301, '/features/ai-mcp#mcp'],
        '/blog/mongodb-native-vs-compass' => [301, '/mongodb-client#compass'],
        '/blog/open-source-db-clients-2026' => [301, '/compare#open-source'],
        '/cockroachdb-client' => [301, '/postgresql-client#cockroachdb'],
        '/compare/azimutt' => [410, null],
        '/docs' => [301, 'https://docs.tablepro.app/'],
        '/docs/raycast' => [301, 'https://docs.tablepro.app/external-api/raycast'],
        '/mariadb-client' => [301, '/mysql-client#mariadb'],
        '/pglite-client' => [301, '/postgresql-client#pglite'],
        '/scylladb-client' => [301, '/cassandra-client#scylladb'],
        '/sitemap-index.xml' => [301, '/sitemap.xml'],
    ];

    $map = [];

    foreach (seoRedirectEntries() as $entry) {
        $map[$entry['from']] = [$entry['status'], $entry['to'] ?? null];
    }

    ksort($map);

    expect($map)->toBe($table);
});

it('gives a 301 a target and a 410 none', function (array $entry): void {
    expect($entry['status'])->toBeIn([301, 410]);

    if ($entry['status'] === 301) {
        expect($entry['to'] ?? null)->toBeString()->not->toBe('');
    } else {
        expect(array_key_exists('to', $entry))->toBeFalse("{$entry['from']} answers 410, so it has nowhere to go");
    }
})->with('redirect entries');

it('lists each retired path once, in its clean form', function (): void {
    $froms = array_column(seoRedirectEntries(), 'from');

    expect($froms)->toBe(array_values(array_unique($froms)));

    foreach ($froms as $from) {
        /*
         * `CanonicalizeRequest` looks the path up after it strips a trailing
         * slash and `/index.php`, with the case and the query as sent. An entry
         * written any other way could never match.
         */
        expect($from)->toMatch('#^/[a-z0-9][a-z0-9./-]*$#', "{$from} is not a clean, lowercase path");
        expect($from)->not->toEndWith('/');
        expect($from)->not->toContain('//');
        expect($from)->not->toStartWith('/index.php');
    }
});

it('retires no Vietnamese and no platform URL', function (): void {
    /*
     * No `/vi/…` URL existed before the rebuild, so none can be retired. The
     * platform paths never reach this app: nginx routes them first.
     */
    $prefixes = array_filter(array_map(fn(string $code): ?string => Locales::prefixFor($code), Locales::codes()));

    foreach (array_column(seoRedirectEntries(), 'from') as $from) {
        $segment = explode('/', trim($from, '/'))[0];

        expect(in_array($segment, $prefixes, true))->toBeFalse("{$from} is under a locale prefix");
        expect(LocalizedUrl::isPlatformPath($from))->toBeFalse("{$from} belongs to the platform app");
    }
});

it('never retires a page that exists', function (): void {
    /*
     * A path with a route of its own (`/pricing`, `/compare`, `/vi/blog`) is a
     * page; a slug route is a page once its family has content for that slug.
     * The families are asked directly, not through the registry: the registry
     * already hides whatever the map retires, which is the point of this test.
     */
    $content = app(ContentRepository::class);
    $families = [new StaticPages($content), new ContentCollection($content), app(LegalPages::class)];
    $blog = app(BlogPosts::class);

    $fixed = [];

    foreach (app('router')->getRoutes() as $route) {
        if (in_array('GET', $route->methods(), true) && $route->parameterNames() === []) {
            $fixed[] = '/' . ltrim($route->uri(), '/');
        }
    }

    foreach (array_column(seoRedirectEntries(), 'from') as $from) {
        expect(in_array($from, $fixed, true))->toBeFalse("{$from} is a live route");

        $route = redirectsDataRouteFor($from);

        if ($route === null || $route->getName() === null) {
            continue;
        }

        $name = (string) LocalizedUrl::baseName($route->getName());
        $params = array_map(strval(...), $route->parameters());

        foreach ($families as $family) {
            expect($family->find($name, $params))->toBeNull("{$from} has content of its own and would stop answering");
        }

        /*
         * A merged guide's English markdown may still be on disk until cleanup;
         * the map shadows it. A translation would mean the guide was kept.
         */
        $post = $blog->find($name, $params);

        expect($post === null || $post->renderLocales === [Locales::default()])
            ->toBeTrue("{$from} has a translation, so it is a retained guide, not a retired one");
    }
});

it('points internal targets at clean paths and external ones off this site', function (array $entry): void {
    if ($entry['status'] !== 301) {
        expect(true)->toBeTrue();

        return;
    }

    $to = $entry['to'];

    if (str_starts_with($to, '/')) {
        $path = redirectsDataPathOf($to);

        expect($to)->not->toStartWith('//');
        expect($path === '/' || ! str_ends_with($path, '/'))->toBeTrue("{$to} would be normalised again");
        expect($path)->not->toStartWith('/index.php');
        expect(LocalizedUrl::isPlatformPath($path))->toBeFalse("{$to} belongs to the platform app");

        return;
    }

    $host = (string) parse_url($to, PHP_URL_HOST);

    expect($to)->toStartWith('https://');
    expect($host)->not->toBe('');

    /*
     * The canonical origin is prepended at request time, so a target on this
     * site is written as a path. A full URL to it would pin one host forever.
     */
    expect(in_array($host, ['tablepro.app', 'www.tablepro.app', (string) config('app.web_domain')], true))
        ->toBeFalse("{$to} is on this site; write it as a path");
})->with('redirect entries');

it('has no chains: no target is itself retired', function (): void {
    $map = app(RedirectMap::class);

    foreach (seoRedirectEntries() as $entry) {
        if (($entry['status'] ?? null) !== 301 || ! str_starts_with($entry['to'], '/')) {
            continue;
        }

        expect($map->find(redirectsDataPathOf($entry['to'])))
            ->toBeNull("{$entry['from']} → {$entry['to']} lands on another retired path");
    }

    foreach ($map->docsSlugTargets() as $docsSlug => $target) {
        expect($map->find(redirectsDataPathOf($target)))
            ->toBeNull("/databases/{$docsSlug} → {$target} lands on another retired path");
    }
});

it('leaves the docs-style database paths to the engines.json rule', function (): void {
    /*
     * `/databases/{docsSlug}` is derived from `engines.json`, so a renamed or
     * merged engine moves its redirect with it. Listing one here as well would
     * pin a target the data no longer agrees with.
     */
    foreach (array_column(seoRedirectEntries(), 'from') as $from) {
        expect(str_starts_with($from, '/databases/'))->toBeFalse("{$from} is covered by the docsSlug rule");
    }

    foreach (app(RedirectMap::class)->docsSlugTargets() as $docsSlug => $target) {
        $route = redirectsDataRouteFor(redirectsDataPathOf($target));

        expect($route?->getName())->toBeIn(
            ['landing.databaseClient', 'landing.databases.index'],
            "/databases/{$docsSlug} → {$target} is not a database page",
        );
    }
});

it('sends every internal target to a page that answers 200', function (): void {
    $registry = app(PageRegistry::class);
    $content = app(ContentRepository::class);
    $map = app(RedirectMap::class);

    $targets = [];

    foreach (seoRedirectEntries() as $entry) {
        if (($entry['status'] ?? null) === 301 && str_starts_with($entry['to'], '/')) {
            $targets[redirectsDataPathOf($entry['to'])] = $entry['from'];
        }
    }

    foreach ($map->docsSlugTargets() as $docsSlug => $target) {
        $targets[redirectsDataPathOf($target)] = "/databases/{$docsSlug}";
    }

    foreach ($targets as $path => $from) {
        /*
         * The one target that is a file, not a page: nginx serves the sitemap
         * `sitemap:generate` writes, and robots.txt advertises it.
         */
        if ($path === '/sitemap.xml') {
            $public = seoScratchPublic();
            $this->artisan('sitemap:generate')->assertSuccessful();

            expect(File::exists($public . '/sitemap.xml'))->toBeTrue();
            expect($this->get('/robots.txt')->getContent())->toContain('Sitemap: https://tablepro.app/sitemap.xml');

            File::deleteDirectory($public);

            continue;
        }

        $route = redirectsDataRouteFor($path);

        Assert::assertNotNull($route, "{$from} → {$path}: no route answers it");
        Assert::assertNotNull($route->getName(), "{$from} → {$path}: the route has no name");

        $name = (string) LocalizedUrl::baseName($route->getName());
        $params = array_map(strval(...), $route->parameters());
        $entry = $registry->find($name, $params);

        if ($entry === null) {
            /*
             * A target whose page is in the sitemap but whose copy has not
             * landed yet (the AI & MCP feature page, the compare hub). Pending
             * is allowed only while its whole family is still unwritten; once
             * the family has content, a missing target page is a broken
             * redirect.
             */
            $name = ContentCollection::contentName(new PageEntry($name, $params, [], [], [], 'site', null))
                ?? StaticPages::PAGES[$name]
                ?? null;

            Assert::assertNotNull($name, "{$from} → {$path}: not a page any family can render");

            $family = str_contains($name, '/') ? explode('/', $name)[0] : null;
            $written = $family === null
                ? array_filter(Locales::codes(), fn(string $locale): bool => $content->has($name, $locale))
                : array_filter(Locales::codes(), fn(string $locale): bool => $content->slugs($family, $locale) !== [] || $content->has("{$family}/index", $locale));

            Assert::assertSame([], array_values($written), "{$from} → {$path}: the {$name} family has content but not this page");

            continue;
        }

        Assert::assertTrue($entry->renders(Locales::default()), "{$from} → {$path} does not render in English");
        Assert::assertSame(200, $this->get($path)->getStatusCode(), "{$from} → {$path} does not answer 200");
    }
});
