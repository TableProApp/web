#!/usr/bin/env node
/**
 * The production path split, on your machine.
 *
 * tablepro.app is two applications behind one nginx: the platform app answers
 * the account, checkout and newsletter paths, and this app answers everything
 * else (docs/deployment.md, "The server is shared"). Locally they run as two
 * `php artisan serve` processes, so a journey that crosses between them (a
 * pricing page posting to /checkout, the header's Account link, the shared
 * theme and consent keys) only works through one origin. This is that origin.
 *
 *   PUBLIC app    php artisan serve --port=8000   (this repository)
 *   PLATFORM app  php artisan serve --port=8001   (the license repository)
 *   proxy         npm run dev:proxy               → http://localhost:8080
 *
 * Set WEB_DOMAIN=localhost in both .env files: the platform's routes are
 * domain-scoped, and domain matching ignores the port. Use built assets
 * (`npm run build`) in both apps. Payments and mail stay mocked or on the
 * `log` driver; never point this at real providers or customer data.
 *
 * Development only. Node built-ins only, so it adds no dependency.
 */
import http from 'node:http';
import { pathToFileURL } from 'node:url';

/**
 * The paths nginx sends to the platform app. Keep in step with the production
 * nginx routing, and with PLATFORM_PATHS in
 * resources/js/i18n/paths.ts, which keeps links to these paths unprefixed
 * (tests/js/paths.test.ts holds the two equal). A request path never carries
 * a `#`; the alternative is there so both copies stay identical.
 */
export const PLATFORM_PATHS = /^\/(account|checkout|webhooks|newsletter|beta|discount|thank-you|api\/newsletter|platform-build)(\/|\?|#|$)/;

/**
 * Which upstream answers a request path.
 *
 * @param {string} path the request target, query included
 * @param {{ publicApp: string, platformApp: string }} upstreams
 * @returns {string}
 */
export function upstreamFor(path, upstreams) {
    return PLATFORM_PATHS.test(path) ? upstreams.platformApp : upstreams.publicApp;
}

/**
 * @param {{ port: number, publicApp: string, platformApp: string }} options
 * @returns {http.Server}
 */
export function createProxy({ port, publicApp, platformApp }) {
    return http.createServer((request, response) => {
        const target = new URL(upstreamFor(request.url ?? '/', { publicApp, platformApp }));
        const forwardedFor = [request.headers['x-forwarded-for'], request.socket.remoteAddress].filter(Boolean).join(', ');

        const upstream = http.request(
            {
                hostname: target.hostname,
                port: target.port,
                method: request.method,
                path: request.url,
                headers: {
                    ...request.headers,
                    'x-forwarded-for': forwardedFor,
                    'x-forwarded-host': request.headers.host ?? `localhost:${port}`,
                    'x-forwarded-port': String(port),
                    'x-forwarded-proto': 'http',
                },
            },
            (upstreamResponse) => {
                response.writeHead(upstreamResponse.statusCode ?? 502, upstreamResponse.headers);
                upstreamResponse.pipe(response);
            },
        );

        upstream.on('error', (error) => {
            response.writeHead(502, { 'content-type': 'text/plain; charset=utf-8' });
            response.end(`${target.origin} is not answering (${error.message}). Is \`php artisan serve\` running there?\n`);
        });

        request.pipe(upstream);
    });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    const port = Number(process.env.PROXY_PORT ?? 8080);
    const publicApp = process.env.PUBLIC_APP_URL ?? 'http://127.0.0.1:8000';
    const platformApp = process.env.PLATFORM_APP_URL ?? 'http://127.0.0.1:8001';

    createProxy({ port, publicApp, platformApp }).listen(port, () => {
        console.log(`tablepro.app on http://localhost:${port}`);
        console.log(`  platform paths → ${platformApp}`);
        console.log(`  everything else → ${publicApp}`);
    });
}
