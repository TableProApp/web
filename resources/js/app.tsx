import { createInertiaApp } from '@inertiajs/react';
import { hydrateRoot } from 'react-dom/client';

createInertiaApp({
    setup({ el, App, props }) {
        hydrateRoot(el, <App {...props} />);
    },
});
