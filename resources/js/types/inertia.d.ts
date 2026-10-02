import type { SharedProps } from './shared-props';

/**
 * Types `usePage().props` with the shared props on every page.
 *
 * @see https://inertiajs.com/typescript
 */
declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: SharedProps;
    }
}
