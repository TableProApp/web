import { useEffect, useState } from 'react';
import { subscriberCount } from '@/hooks/email-form-response';
import { useApi, type ApiPath } from '@/hooks/use-api';

let pending: Promise<number | null> | null = null;

// Once per document: the footer and the blog's signup share one request. A failure leaves the count unsaid.
function fetchCount(api: (path: ApiPath) => string): Promise<number | null> {
    pending ??= fetch(api('/v2/newsletter/stats'), { credentials: 'omit', headers: { Accept: 'application/json' } })
        .then((res) => (res.ok ? res.json() : null))
        .then(subscriberCount)
        .catch(() => null);

    return pending;
}

// Null on the server and the first render, so the cached HTML carries no count.
export function useNewsletterStats(): number | null {
    const api = useApi();
    const [count, setCount] = useState<number | null>(null);

    useEffect(() => {
        let active = true;

        void fetchCount(api).then((answer) => {
            if (active) {
                setCount(answer);
            }
        });

        return () => {
            active = false;
        };
    }, [api]);

    return count;
}
