import { createInertiaApp, App as InertiaApp } from '@inertiajs/react';
import type { ComponentProps, ComponentType } from 'react';
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

type SsrSetupOptions = {
    el: null;
    App: ComponentType<ComponentProps<typeof InertiaApp>>;
    props: ComponentProps<typeof InertiaApp>;
};

createServer(
    (page) =>
        // @ts-expect-error -- `resolve` is injected at build time by
        // @inertiajs/vite, so it is absent from this source but present in the
        // bundle. The SSR overload types it as required and cannot know that.
        // Using @ts-expect-error rather than @ts-ignore on purpose: if Inertia
        // ever relaxes the type, this line starts failing and gets removed.
        createInertiaApp({
            page,
            render: ReactDOMServer.renderToString,
            // Typed explicitly: the SSR overload passes a null element, and
            // without the annotation inference picks the browser variant, whose
            // setup signature expects an HTMLElement and so does not match.
            // Inertia does not re-export SetupOptions, so the shape is built
            // here from the App component it does export.
            setup: ({ App, props }: SsrSetupOptions) => <App {...props} />,
        }),
    port,
);
