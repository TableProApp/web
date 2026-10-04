import { test } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import type { AddressInfo } from 'node:net';

import { createProxy, upstreamFor } from '../../scripts/dev-proxy.mjs';

/*
 * The local stand-in for production's nginx split. If it routes a path to the
 * wrong app, a local checkout journey silently tests the wrong thing.
 */
const upstreams = { publicApp: 'http://public', platformApp: 'http://platform' };

test('sends the platform paths to the platform app and nothing else', () => {
    for (const path of ['/account', '/account/login?locale=vi', '/checkout', '/newsletter/subscribe', '/thank-you?order=x', '/discount/preview', '/api/newsletter/stats', '/platform-build/x.js', '/webhooks/polar', '/beta']) {
        assert.equal(upstreamFor(path, upstreams), 'http://platform', path);
    }

    for (const path of ['/', '/vi', '/vi/account', '/accounting', '/download', '/api/other', '/build/app.js', '/blog/checkout-notes']) {
        assert.equal(upstreamFor(path, upstreams), 'http://public', path);
    }
});

function listen(server: http.Server): Promise<number> {
    return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve((server.address() as AddressInfo).port)));
}

test('forwards the request and says where it came from', async () => {
    const seen: { app: string; url?: string; forwardedHost?: string }[] = [];
    const answer = (app: string) =>
        http.createServer((request, response) => {
            seen.push({ app, url: request.url, forwardedHost: request.headers['x-forwarded-host'] as string });
            response.end(app);
        });

    const publicServer = answer('public');
    const platformServer = answer('platform');
    const publicPort = await listen(publicServer);
    const platformPort = await listen(platformServer);

    const proxy = createProxy({
        port: 0,
        publicApp: `http://127.0.0.1:${publicPort}`,
        platformApp: `http://127.0.0.1:${platformPort}`,
    });
    const proxyPort = await listen(proxy);

    try {
        const home = await fetch(`http://127.0.0.1:${proxyPort}/vi?ref=x`);
        const account = await fetch(`http://127.0.0.1:${proxyPort}/account?locale=vi`);

        assert.equal(await home.text(), 'public');
        assert.equal(await account.text(), 'platform');
        assert.deepEqual(seen.map((request) => request.url), ['/vi?ref=x', '/account?locale=vi']);
        assert.equal(seen[0].forwardedHost, `127.0.0.1:${proxyPort}`);
    } finally {
        proxy.close();
        publicServer.close();
        platformServer.close();
    }
});
