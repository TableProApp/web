import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import inertia from '@inertiajs/vite';
import path from 'path';

export default defineConfig({
    plugins: [
        tailwindcss(),
        react(),
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            refresh: true,
        }),
        inertia(),
    ],
    resolve: {
        alias: {
            '@': path.resolve(import.meta.dirname, 'resources/js'),
            /*
             * The locale-neutral data files and the per-locale page copy. A
             * page types its `content` prop with
             * `typeof import('@data/content/en/home.json')`, which bundles
             * nothing; a module that imports a data file for its values does
             * bundle it, so keep those imports to small files.
             */
            '@data': path.resolve(import.meta.dirname, 'resources/data'),
        },
    },
});
