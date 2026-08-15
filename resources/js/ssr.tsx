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
            /*
             * `resolve` is absent on purpose: @inertiajs/vite only injects it
             * into a createInertiaApp() call that has neither `pages` nor
             * `resolve`, so writing one here would suppress the injection and
             * leave the bundle with no page map at all.
             *
             * That absence is also why this line needs suppressing. Of the
             * three published overloads, the two that accept `render` both
             * require `resolve`, so resolution falls through to the third,
             * which declares `render?: undefined`. The suppression is
             * @ts-expect-error rather than @ts-ignore so that the day Inertia
             * types the injected form, this stops compiling and gets deleted.
             */
            // @ts-expect-error -- see above
            render: ReactDOMServer.renderToString,
            setup: ({ App, props }) => <App {...props} />,
        }),
    port,
);
