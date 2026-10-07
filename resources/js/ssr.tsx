import { createInertiaApp } from '@inertiajs/react';
import createServer from '@inertiajs/react/server';
import ReactDOMServer from 'react-dom/server';
import { resolvePage } from '@/resolve-page';

/*
 * Configurable so a host running more than one Inertia application can give
 * each its own port. Two SSR servers sharing a port do not fail loudly — they
 * take turns binding it and restart each other — so this is set explicitly
 * rather than left to the framework default. Keep it in step with
 * INERTIA_SSR_URL in .env.
 */
const port = Number(process.env.INERTIA_SSR_PORT ?? 13715);

/*
 * Loopback only. Inertia's server listens on every interface by default, and
 * it answers `/render` and `/shutdown` to anyone who reaches the port: on a
 * host without a firewall in front of 13715, anyone could stop it, and every
 * page would then ship without its server-rendered HTML. Only PHP on this host
 * talks to it, at INERTIA_SSR_URL (http://127.0.0.1:…).
 */
const host = process.env.INERTIA_SSR_HOST ?? '127.0.0.1';

createServer(
    (page) =>
        createInertiaApp({
            page,
            resolve: resolvePage,
            render: ReactDOMServer.renderToString,
            setup: ({ App, props }) => <App {...props} />,
        }),
    { port, host },
);
