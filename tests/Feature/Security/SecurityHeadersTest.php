<?php

use Illuminate\Support\Facades\Route;

it('sends the security headers on every kind of response', function (string $path, int $status): void {
    $response = $this->get($path)->assertStatus($status);

    $response->assertHeader('X-Content-Type-Options', 'nosniff')
        ->assertHeader('X-Frame-Options', 'DENY')
        ->assertHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    expect($response->headers->get('Permissions-Policy'))->toContain('geolocation=()');
})->with([
    'a page' => ['/pricing', 200],
    'a translated page' => ['/vi', 200],
    'no route' => ['/no-such-page', 404],
    'retired' => ['/compare/azimutt', 410],
    'an unclean path' => ['/index.php/pricing', 301],
    'a retired path' => ['/mariadb-client', 301],
    'plain text' => ['/robots.txt', 200],
    'the health check' => ['/up', 200],
]);

it('sends them on a server error too', function (): void {
    config(['app.debug' => false]);
    Route::middleware('web')->get('/_test/crash', fn() => throw new RuntimeException('Boom.'));

    $this->get('/_test/crash')->assertStatus(500)->assertHeader('X-Content-Type-Options', 'nosniff')->assertHeader('X-Frame-Options', 'DENY');
});

it('leaves the checkout overlay and chat calls the browser features they use', function (): void {
    $policy = $this->get('/pricing')->headers->get('Permissions-Policy');

    foreach (['payment', 'publickey-credentials-get', 'camera', 'microphone', 'display-capture'] as $feature) {
        expect($policy)->not->toContain($feature);
    }
});

it('sends Strict-Transport-Security over HTTPS only', function (): void {
    $this->get('https://localhost/pricing')->assertHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    $this->get('https://localhost/index.php/pricing')->assertStatus(301)->assertHeader('Strict-Transport-Security');
    $this->get('http://localhost/pricing')->assertHeaderMissing('Strict-Transport-Security');
});

it('leaves the shared-cache header of a page as it was', function (): void {
    $headers = $this->get('/pricing')->assertHeader('Content-Security-Policy')->headers;

    expect($headers->getCacheControlDirective('s-maxage'))->toBe('600')
        ->and($headers->hasCacheControlDirective('public'))->toBeTrue();
});
