import { createInertiaApp } from '@inertiajs/react';
import createServer from '@inertiajs/react/server';
import ReactDOMServer from 'react-dom/server';

/*
 * Configurable so a host running more than one Inertia application can give
 * each its own port. Two SSR servers sharing a port do not fail loudly — they
 * take turns binding it and restart each other — so this is set explicitly
 * rather than left to the framework default. Keep it in step with
 * INERTIA_SSR_URL in .env.
 */
const port = Number(process.env.INERTIA_SSR_PORT ?? 13715);

createServer(
    (page) =>
        createInertiaApp({
            page,
            render: ReactDOMServer.renderToString,
            setup: ({ App, props }) => <App {...props} />,
        }),
    port,
);
