<?php

/*
 * Inertia's SSR server listens on every interface unless told otherwise, and
 * answers `/render` and `/shutdown` to anyone who reaches its port. Only PHP on
 * the same host talks to it (INERTIA_SSR_URL is a 127.0.0.1 address), so the
 * entry binds loopback.
 */

it('binds the SSR server to loopback unless INERTIA_SSR_HOST says otherwise', function (): void {
    $entry = (string) file_get_contents(resource_path('js/ssr.tsx'));

    expect($entry)->toContain("const host = process.env.INERTIA_SSR_HOST ?? '127.0.0.1';")
        ->toContain('{ port, host },');

    expect(parse_url((string) config('inertia.ssr.url'), PHP_URL_HOST))->toBe('127.0.0.1');
});

it('cannot be reached on this machine\'s network address', function (): void {
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
});
