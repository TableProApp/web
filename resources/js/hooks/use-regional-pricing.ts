import { useEffect, useState } from 'react';
import { parseRegional, type Regional } from '@/lib/regional-pricing';

let pending: Promise<Regional | null> | null = null;

/**
 * Asks the platform once per document whether its regional discount applies
 * to this reader.
 *
 * `GET /discount/region` answers from the country Cloudflare names for the
 * request, the same answer checkout acts on. It starts no session there, and
 * `credentials: 'omit'` keeps any platform cookie off this page all the same.
 * Any failure, a throttled answer included, means no regional price.
 */
function fetchRegional(): Promise<Regional | null> {
    pending ??= fetch('/discount/region', { credentials: 'omit', headers: { Accept: 'application/json' } })
        .then((res) => (res.ok ? res.json() : null))
        .then(parseRegional)
        .catch(() => null);

    return pending;
}

/**
 * The regional discount for this reader, or null.
 *
 * Null on the server and on the first render, so the cached HTML, the
 * structured data and hydration all carry the list prices; the cards change
 * once the platform has answered.
 */
export function useRegionalPricing(): Regional | null {
    const [regional, setRegional] = useState<Regional | null>(null);

    useEffect(() => {
        let active = true;

        void fetchRegional().then((answer) => {
            if (active) {
                setRegional(answer);
            }
        });

        return () => {
            active = false;
        };
    }, []);

    return regional;
}
