<?php

use Illuminate\Http\Middleware\TrustProxies;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use function Pest\Laravel\get;

it('sends the security headers on every kind of response', function (string $path, int $status): void {
    $response = get($path)->assertStatus($status)
        ->assertHeader('X-Content-Type-Options', 'nosniff')
        ->assertHeader('X-Frame-Options', 'DENY')
        ->assertHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    expect((string) $response->headers->get('Permissions-Policy'))->toContain('geolocation=()');
})->with([
    'a page' => ['/pricing', 200],
    'a translated page' => ['/vi', 200],
    'no route' => ['/no-such-page', 404],
    'retired' => ['/compare/azimutt', 410],
    'an unclean path' => ['/index.php/pricing', 301],
    'plain text' => ['/robots.txt', 200],
    'the health check' => ['/up', 200],
]);

// The checkout overlay and the chat need these.
it('leaves payment, passkeys, camera and microphone to the page', function (string $feature): void {
    expect((string) get('/pricing')->headers->get('Permissions-Policy'))->not->toContain($feature);
})->with(['payment', 'publickey-credentials-get', 'camera', 'microphone', 'display-capture']);

it('sends the security headers on a server error', function (): void {
    config(['app.debug' => false]);
    Route::middleware('web')->get('/_test/crash', fn() => throw new RuntimeException('Boom.'));

    get('/_test/crash')->assertStatus(500)
        ->assertHeader('X-Content-Type-Options', 'nosniff')
        ->assertHeader('X-Frame-Options', 'DENY');
});

it('sends Strict-Transport-Security over HTTPS only', function (): void {
    get('https://localhost/pricing')->assertHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    get('https://localhost/index.php/pricing')->assertStatus(301)->assertHeader('Strict-Transport-Security');
    get('http://localhost/pricing')->assertHeaderMissing('Strict-Transport-Security');
});

// Proxies are trusted at *, so a forwarded host or port would let one request poison cached asset URLs.
it('takes the client address and scheme from the proxy, never the host or port', function (): void {
    $request = Request::create('http://localhost/', 'GET', server: [
        'REMOTE_ADDR' => '10.0.0.1',
        'HTTP_X_FORWARDED_FOR' => '203.0.113.9',
        'HTTP_X_FORWARDED_PROTO' => 'https',
        'HTTP_X_FORWARDED_HOST' => 'evil.example',
        'HTTP_X_FORWARDED_PORT' => '8443',
    ]);

    $seen = null;

    app(TrustProxies::class)->handle($request, function (Request $trusted) use (&$seen) {
        $seen = $trusted;

        return response('');
    });

    expect($seen->ip())->toBe('203.0.113.9')
        ->and($seen->isSecure())->toBeTrue()
        ->and($seen->getSchemeAndHttpHost())->toBe('https://localhost');
});

it('points the SSR client at loopback', function (): void {
    expect(parse_url((string) config('inertia.ssr.url'), PHP_URL_HOST))->toBe('127.0.0.1');
});

// Unbound, the SSR server answers /render and /shutdown to anyone who reaches its port.
it('keeps the SSR server off this machine\'s network address', function (): void {
    requireSsr();

    $address = collect(net_get_interfaces() ?: [])
        ->flatMap(fn(array $interface): array => array_column($interface['unicast'] ?? [], 'address'))
        ->first(fn(?string $address): bool => is_string($address)
            && filter_var($address, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4) !== false
            && ! str_starts_with($address, '127.'));

    if ($address === null) {
        $this->markTestSkipped('This machine has no IPv4 address besides loopback.');
    }

    $port = (int) parse_url((string) config('inertia.ssr.url'), PHP_URL_PORT);
    $socket = @fsockopen($address, $port, $errno, $errstr, 1);

    if ($socket !== false) {
        fclose($socket);
    }

    expect($socket)->toBeFalse("The SSR server answers on {$address}:{$port}");
})->group('ssr');
