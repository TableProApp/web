import { usePage } from '@inertiajs/react';
import { useCallback } from 'react';

export type ApiPath = `/v2/${string}`;

// tablepro-cloud's API is another origin, so every call names it in full and omits credentials.
export function useApi(): (path: ApiPath) => string {
    const origin = usePage().props.apiOrigin;

    return useCallback((path: ApiPath) => `${origin}${path}`, [origin]);
}
