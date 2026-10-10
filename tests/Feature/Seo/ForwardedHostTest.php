<?php

// Proxies are trusted at *, so a forwarded host or port would let one request poison cached asset URLs.
it('takes the client address and scheme from the proxy, but never the host or port', function (): void {
    $request = Illuminate\Http\Request::create('http://localhost/', 'GET', server: [
        'REMOTE_ADDR' => '10.0.0.1',
        'HTTP_X_FORWARDED_FOR' => '203.0.113.9',
        'HTTP_X_FORWARDED_PROTO' => 'https',
        'HTTP_X_FORWARDED_HOST' => 'evil.example',
        'HTTP_X_FORWARDED_PORT' => '8443',
    ]);

    $seen = null;

    app(Illuminate\Http\Middleware\TrustProxies::class)->handle($request, function ($trusted) use (&$seen) {
        $seen = $trusted;

        return response('');
    });

    expect($seen->ip())->toBe('203.0.113.9')
        ->and($seen->isSecure())->toBeTrue()
        ->and($seen->getHost())->toBe('localhost')
        ->and($seen->getPort())->toBe(443)
        ->and($seen->getSchemeAndHttpHost())->toBe('https://localhost');
});
