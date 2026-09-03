import { createInertiaApp } from '@inertiajs/react';
import { hydrateRoot } from 'react-dom/client';
import { captureAttribution } from '@/lib/attribution';

/*
 * Before hydration, so the landing URL is read while it is still the one the
 * reader arrived on. Inertia rewrites the address bar on the first client-side
 * navigation, and a campaign tag read after that has already been stripped.
 */
captureAttribution();

createInertiaApp({
    setup({ el, App, props }) {
        if (!el) {
            throw new Error('Inertia root element is missing. Check @inertia in resources/views/app.blade.php.');
        }

        hydrateRoot(el, <App {...props} />);
    },
});
