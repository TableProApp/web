<?php

use App\Http\Middleware\CacheHtmlAtEdge;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Testing\TestResponse;
use Symfony\Component\HttpFoundation\Cookie;

function expectSharedAtEdge(TestResponse $response): void
{
    $headers = $response->baseResponse->headers;

    expect($headers->hasCacheControlDirective('public'))->toBeTrue('Cache-Control: ' . $headers->get('Cache-Control'))
        ->and($headers->getCacheControlDirective('max-age'))->toBe('0')
        ->and($headers->getCacheControlDirective('s-maxage'))->toBe('600')
        ->and($headers->getCacheControlDirective('stale-while-revalidate'))->toBe('3600')
        ->and($headers->hasCacheControlDirective('private'))->toBeFalse()
        ->and($headers->hasCacheControlDirective('no-cache'))->toBeFalse()
        ->and($headers->hasCacheControlDirective('no-store'))->toBeFalse()
        ->and(array_map('strtolower', $response->baseResponse->getVary()))->toContain('x-inertia')
        ->and($headers->getCookies())->toBe([]);
}

function expectNotSharedAtEdge(TestResponse $response): void
{
    $headers = $response->baseResponse->headers;

    expect($headers->hasCacheControlDirective('public'))->toBeFalse('Cache-Control: ' . $headers->get('Cache-Control'))
        ->and($headers->hasCacheControlDirective('s-maxage'))->toBeFalse()
        ->and($headers->hasCacheControlDirective('stale-while-revalidate'))->toBeFalse();
}

function edgeCacheInertiaVersion(): string
{
    $html = (string) test()->get('/pricing')->getContent();
    $json = html_entity_decode((string) preg_replace('/.*<script data-page="app" type="application\/json">(.*?)<\/script>.*/s', '$1', $html));

    return (string) (json_decode($json, true)['version'] ?? '');
}

it('lets the edge keep every page, in both languages', function (string $path): void {
    expectSharedAtEdge($this->get($path)->assertOk());
})->with([
    '/',
    '/vi',
    '/pricing',
    '/vi/pricing',
    '/download',
    '/blog',
    '/blog/tablepro-0-77',
    '/compare/tableplus',
    '/mysql-client',
    '/vi/features',
    '/privacy',
]);

it('lets the edge keep a HEAD request as it keeps the GET', function (): void {
    expectSharedAtEdge($this->call('HEAD', '/pricing')->assertOk());
});

it('lets the edge keep the 404 and 410 pages, whether or not a route matched', function (string $path, int $status): void {
    expectSharedAtEdge($this->get($path)->assertStatus($status));
})->with([
    'no route' => ['/no-such-page', 404],
    'no route, Vietnamese' => ['/vi/khong-co-trang-nay', 404],
    'a route, but no page' => ['/blog/no-such-post', 404],
    'a page, but not in this language' => ['/vi/blog/tablepro-0-77', 404],
    'retired' => ['/compare/azimutt', 410],
]);

// Cloudflare ignores Vary, so its cache rule bypasses any request carrying X-Inertia.
it('never shares an Inertia visit, which is JSON at the same URL', function (string $path, int $status): void {
    $response = $this->withHeaders([
        'X-Inertia' => 'true',
        'X-Inertia-Version' => edgeCacheInertiaVersion(),
        'X-Requested-With' => 'XMLHttpRequest',
    ])->get($path);

    $response->assertStatus($status)->assertHeader('X-Inertia', 'true');

    expectNotSharedAtEdge($response);
    expect($response->baseResponse->headers->hasCacheControlDirective('private'))->toBeTrue();
})->with([
    'a page' => ['/pricing', 200],
    'a missing page' => ['/no-such-page', 404],
]);

it('never shares a redirect, which carries the visitor\'s own query string', function (string $path): void {
    expectNotSharedAtEdge($this->get($path)->assertStatus(301));
})->with(['/mariadb-client?ref=newsletter', '/index.php/pricing']);

it('never shares a response that is not HTML', function (): void {
    expectNotSharedAtEdge($this->getJson('/no-such-page')->assertNotFound());
    expectNotSharedAtEdge($this->get('/robots.txt')->assertOk());
});

it('leaves a write, a server error and a response that sets a cookie alone', function (Request $request, Response $response): void {
    $before = $response->headers->get('Cache-Control');

    CacheHtmlAtEdge::apply($request, $response);

    expect($response->headers->get('Cache-Control'))->toBe($before)
        ->and($response->headers->hasCacheControlDirective('public'))->toBeFalse();
})->with([
    'a POST' => fn(): array => [Request::create('/pricing', 'POST'), new Response('<p>ok</p>', 200, ['Content-Type' => 'text/html; charset=UTF-8'])],
    'a 500' => fn(): array => [Request::create('/pricing'), new Response('<p>error</p>', 500, ['Content-Type' => 'text/html; charset=UTF-8'])],
    'a 503' => fn(): array => [Request::create('/pricing'), new Response('<p>down</p>', 503, ['Content-Type' => 'text/html; charset=UTF-8'])],
    'a cookie' => fn(): array => [Request::create('/pricing'), (new Response('<p>ok</p>', 200, ['Content-Type' => 'text/html; charset=UTF-8']))->withCookie(Cookie::create('tracking', '1'))],
    'JSON' => fn(): array => [Request::create('/pricing'), new Response('{}', 200, ['Content-Type' => 'application/json'])],
    'an Inertia visit' => fn(): array => [Request::create('/pricing', server: ['HTTP_X_INERTIA' => 'true']), new Response('<p>ok</p>', 200, ['Content-Type' => 'text/html; charset=UTF-8'])],
]);

it('adds X-Inertia to an existing Vary instead of replacing it', function (): void {
    $response = new Response('<p>missing</p>', 404, ['Content-Type' => 'text/html; charset=UTF-8', 'Vary' => 'Accept-Encoding']);

    CacheHtmlAtEdge::apply(Request::create('/no-such-page'), $response);

    expect($response->getVary())->toBe(['Accept-Encoding', 'X-Inertia'])
        ->and($response->headers->hasCacheControlDirective('public'))->toBeTrue();
});
