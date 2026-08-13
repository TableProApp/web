import { createInertiaApp } from '@inertiajs/react';
import { hydrateRoot } from 'react-dom/client';

createInertiaApp({
    setup({ el, App, props }) {
        if (!el) {
            throw new Error('Inertia root element is missing. Check @inertia in resources/views/app.blade.php.');
        }

        hydrateRoot(el, <App {...props} />);
    },
});
