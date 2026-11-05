<?php

use App\Http\Middleware\CanonicalizeRequest;
use App\Support\Content\ContentRepository;
use App\Support\Localization\Locales;
use App\Support\Localization\LocalizedUrl;
use App\Support\Seo\BlogPosts;
use App\Support\Seo\ContentCollection;
use App\Support\Seo\LegalPages;
use App\Support\Seo\RedirectMap;
use App\Support\Seo\StaticPages;
use Illuminate\Http\Request;
use Illuminate\Routing\Route;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Http;
use Inertia\Testing\AssertableInertia;
use Symfony\Component\HttpFoundation\Response;

beforeEach(function (): void {
    Http::fake(['api.github.com/*' => Http::response([], 200)]);
});

dataset('301 entries', fn(): array => collect(seoRedirectEntries())
    ->where('status', 301)
    ->mapWithKeys(fn(array $entry): array => [$entry['from'] => [$entry['from'], $entry['to']]])
    ->all());

dataset('410 entries', fn(): array => collect(seoRedirectEntries())
    ->where('status', 410)
    ->mapWithKeys(fn(array $entry): array => [$entry['from'] => [$entry['from']]])
    ->all());

function redirectsLocation(string $target, string $query = ''): string
{
    [$target, $fragment] = str_contains($target, '#') ? explode('#', $target, 2) : [$target, null];
    [$path, $own] = str_contains($target, '?') ? explode('?', $target, 2) : [$target, ''];
    $merged = implode('&', array_filter([$own, $query], fn(string $part): bool => $part !== ''));

    return (str_starts_with($path, '/') ? LocalizedUrl::base() . $path : $path)
        . ($merged === '' ? '' : "?{$merged}")
        . ($fragment === null ? '' : "#{$fragment}");
}

function redirectsThroughMiddleware(string $uri, string $method = 'GET'): Response
{
    $request = new Request(server: ['REQUEST_URI' => $uri, 'REQUEST_METHOD' => $method, 'HTTP_HOST' => 'localhost']);

    return app(CanonicalizeRequest::class)->handle($request, fn(): Response => new Response('passed through', 200));
}

function redirectsRouteFor(string $path): ?Route
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

function redirectsInternalTargets(): array
{
    $targets = collect(seoRedirectEntries())
        ->filter(fn(array $entry): bool => $entry['status'] === 301 && str_starts_with($entry['to'], '/'))
        ->mapWithKeys(fn(array $entry): array => [$entry['from'] => $entry['to']])
        ->all();

    foreach (app(RedirectMap::class)->docsSlugTargets() as $docsSlug => $target) {
        $targets["/databases/{$docsSlug}"] = $target;
    }

    return $targets;
}

function redirectsScratchMap(array $entries): void
{
    $path = storage_path('framework/testing/redirects-' . uniqid() . '.json');
    File::put($path, json_encode($entries, JSON_THROW_ON_ERROR));
    app()->instance(RedirectMap::class, new RedirectMap($path, resource_path('data/engines.json')));
}

afterEach(function (): void {
    File::delete(File::glob(storage_path('framework/testing/redirects-*.json')));
});

describe('redirects.json', function (): void {
    it('gives every entry a clean source, a status, a target where it has one and a reason', function (): void {
        $froms = array_column(seoRedirectEntries(), 'from');

        expect($froms)->toBe(array_values(array_unique($froms)));

        foreach (seoRedirectEntries() as $entry) {
            expect(array_diff(array_keys($entry), ['from', 'to', 'status', 'reason']))->toBe([], "{$entry['from']} has an unknown key")
                ->and($entry['from'])->toMatch('#^/[a-z0-9][a-z0-9./-]*[a-z0-9]$#')
                ->and(trim($entry['reason'] ?? ''))->not->toBeEmpty("{$entry['from']} needs a reason")
                ->and($entry['status'])->toBeIn([301, 410])
                ->and(array_key_exists('to', $entry))->toBe($entry['status'] === 301);
        }
    });

    it('retires no localized, platform or docs-style path', function (): void {
        $prefixes = array_filter(array_map(Locales::prefixFor(...), Locales::codes()));

        foreach (array_column(seoRedirectEntries(), 'from') as $from) {
            expect(explode('/', trim($from, '/'))[0])->not->toBeIn($prefixes)
                ->and(LocalizedUrl::isPlatformPath($from))->toBeFalse("{$from} belongs to the platform app")
                ->and($from)->not->toStartWith('/databases/');
        }
    });

    it('never retires a page that exists', function (): void {
        $content = app(ContentRepository::class);
        $families = [new StaticPages($content), new ContentCollection($content), app(LegalPages::class)];
        $fixed = collect(app('router')->getRoutes())
            ->filter(fn(Route $route): bool => in_array('GET', $route->methods(), true) && $route->parameterNames() === [])
            ->map(fn(Route $route): string => '/' . ltrim($route->uri(), '/'))
            ->all();

        foreach (array_column(seoRedirectEntries(), 'from') as $from) {
            expect($fixed)->not->toContain($from);

            $route = redirectsRouteFor($from);

            if ($route?->getName() === null) {
                continue;
            }

            $name = (string) LocalizedUrl::baseName($route->getName());
            $params = array_map(strval(...), $route->parameters());

            foreach ($families as $family) {
                expect($family->find($name, $params))->toBeNull("{$from} has content of its own");
            }

            $post = app(BlogPosts::class)->find($name, $params);

            expect($post === null || $post->renderLocales === [Locales::default()])->toBeTrue("{$from} has a translation");
        }
    });

    it('points external targets off this site over HTTPS', function (): void {
        foreach (seoRedirectEntries() as $entry) {
            if (($entry['status'] === 301) && ! str_starts_with($entry['to'], '/')) {
                expect($entry['to'])->toStartWith('https://')
                    ->and(parse_url($entry['to'], PHP_URL_HOST))->not->toBeIn(['tablepro.app', 'www.tablepro.app', config('app.web_domain')]);
            }
        }
    });

    it('sends every internal target to a clean path that answers, with no chain', function (): void {
        $map = app(RedirectMap::class);

        foreach (redirectsInternalTargets() as $from => $to) {
            $path = substr($to, 0, strcspn($to, '?#'));

            expect($path === '/' || ! str_ends_with($path, '/'))->toBeTrue("{$to} would be normalised again")
                ->and($map->find($path))->toBeNull("{$from} → {$to} lands on another retired path");

            if (pathinfo($path, PATHINFO_EXTENSION) !== '') {
                continue;
            }

            $this->get($path)->assertOk();
        }
    });
});

it('answers each retired path with one 301 that keeps the query', function (string $from, string $to): void {
    $this->get($from)->assertStatus(301)->assertHeader('Location', redirectsLocation($to));
    $this->get("{$from}?ref=app&utm_source=x")->assertStatus(301)->assertHeader('Location', redirectsLocation($to, 'ref=app&utm_source=x'));
})->with('301 entries');

it('answers each gone path with the branded 410', function (string $from): void {
    $this->get($from)
        ->assertStatus(410)
        ->assertHeaderMissing('Location')
        ->assertInertia(fn(AssertableInertia $page) => $page
            ->component('Error')
            ->where('status', 410)
            ->where('seo.robots', 'noindex, follow')
            ->where('seo.canonical', null));
})->with('410 entries');

it('redirects the docs-style database paths to the engine they name', function (): void {
    $targets = app(RedirectMap::class)->docsSlugTargets();

    expect($targets)->not->toBeEmpty();

    foreach ($targets as $docsSlug => $target) {
        $this->get("/databases/{$docsSlug}")->assertStatus(301)->assertHeader('Location', redirectsLocation($target));
    }
});

it('folds every spelling of a retired path into one hop, with the query before the fragment', function (): void {
    redirectsScratchMap([
        ['from' => '/old-page', 'to' => '/download?from=old#mac', 'status' => 301, 'reason' => 'test'],
        ['from' => '/gone-page', 'status' => 410, 'reason' => 'test'],
    ]);

    $location = 'https://localhost/download?from=old&ref=x#mac';

    $this->get('/old-page?ref=x')->assertStatus(301)->assertHeader('Location', $location);
    $this->get('http://localhost/old-page/?ref=x')->assertStatus(301)->assertHeader('Location', $location);
    $this->get('/index.php/old-page?ref=x')->assertStatus(301)->assertHeader('Location', $location);
    $this->call('HEAD', 'http://localhost/old-page/?ref=x')->assertStatus(301)->assertHeader('Location', $location);
    $this->get('http://attacker.example/old-page?ref=x')->assertStatus(301)->assertHeader('Location', $location);

    foreach (['/gone-page', 'http://localhost/gone-page/?ref=x', '/index.php/gone-page'] as $path) {
        $this->get($path)->assertStatus(410)->assertHeaderMissing('Location');
    }
});

it('normalises the trailing slash and /index.php of any path in one hop', function (string $uri, string $location): void {
    $response = redirectsThroughMiddleware($uri);

    expect($response->getStatusCode())->toBe(301)
        ->and($response->headers->get('Location'))->toBe($location);
})->with([
    'a section' => ['/blog/', 'https://localhost/blog'],
    'a Vietnamese page' => ['/vi/download/', 'https://localhost/vi/download'],
    'the front controller' => ['/index.php', 'https://localhost/'],
    'a page behind the front controller' => ['/index.php/blog?ref=x', 'https://localhost/blog?ref=x'],
    'several slashes' => ['/download///', 'https://localhost/download'],
    'the query exactly as sent' => ['/blog/?q=a%20b&tag=x&tag=y', 'https://localhost/blog?q=a%20b&tag=x&tag=y'],
]);

it('lets clean URLs and double slashes through untouched', function (string $uri): void {
    expect(redirectsThroughMiddleware($uri)->getContent())->toBe('passed through');
})->with(['/', '/vi', '/blog?ref=x', '//blog', '/blog//post', '/Blog']);

it('never guesses: an unknown path stays 404 with no redirect', function (string $path): void {
    $this->get($path)->assertNotFound()->assertHeaderMissing('Location');
})->with([
    'an unknown docs-style path' => ['/databases/not-an-engine'],
    'an unknown page' => ['/no-such-page'],
    'an unknown comparison' => ['/compare/sql-workbench'],
    'an uppercase path' => ['/Download'],
    'a word that only starts like a language' => ['/enterprise'],
]);

it('touches nothing but GET and HEAD', function (string $method): void {
    redirectsScratchMap([['from' => '/old-page', 'to' => '/download', 'status' => 301, 'reason' => 'test']]);

    foreach (['/old-page', '/blog/', '/index.php/blog'] as $path) {
        expect(redirectsThroughMiddleware($path, $method)->getContent())->toBe('passed through', "{$method} {$path}");
    }
})->with(['POST', 'PUT', 'DELETE']);

it('lands every redirect on an element its fragment names', function (): void {
    $documents = [];

    foreach (redirectsInternalTargets() as $from => $target) {
        if (! str_contains($target, '#')) {
            continue;
        }

        [$path, $fragment] = explode('#', $target, 2);
        $path = substr($path, 0, strcspn($path, '?'));
        $documents[$path] ??= Dom\HTMLDocument::createFromString(ssrHtml($path), LIBXML_NOERROR);

        expect($documents[$path]->getElementById($fragment))->not->toBeNull("{$from} → {$target}: no element with id=\"{$fragment}\"");
    }
})->group('ssr');
