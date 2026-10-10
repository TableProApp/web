<?php

use Illuminate\Support\Facades\Route;

it('sends the security headers on every kind of response', function (string $path, int $status): void {
    $response = $this->get($path)->assertStatus($status);

    $response->assertHeader('X-Content-Type-Options', 'nosniff')
        ->assertHeader('X-Frame-Options', 'DENY')
        ->assertHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    $policy = (string) $response->headers->get('Permissions-Policy');

    expect($policy)->toContain('geolocation=()');

    // The checkout overlay and the chat use these, so the policy leaves them alone.
    foreach (['payment', 'publickey-credentials-get', 'camera', 'microphone', 'display-capture'] as $feature) {
        expect($policy)->not->toContain($feature);
    }
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

it('sends Strict-Transport-Security over HTTPS only', function (): void {
    $this->get('https://localhost/pricing')->assertHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    $this->get('https://localhost/index.php/pricing')->assertStatus(301)->assertHeader('Strict-Transport-Security');
    $this->get('http://localhost/pricing')->assertHeaderMissing('Strict-Transport-Security');
});
