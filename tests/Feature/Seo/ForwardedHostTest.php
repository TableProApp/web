<?php

/*
 * A client-sent `X-Forwarded-Host` or `X-Forwarded-Port` must never reach the
 * request's origin. The proxies are trusted at `*`, so trusting either header
 * would let a request pick the origin of the page's script, stylesheet and
 * font preload URLs, which a shared cache could then serve to everyone (cache
 * poisoning). Checked on the request the configured `TrustProxies` hands on,
 * because the page tests fake Vite and render no asset URLs to look at.
 */
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
