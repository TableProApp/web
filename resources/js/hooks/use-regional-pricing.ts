import { useEffect, useState } from 'react';
import { useApi, type ApiPath } from '@/hooks/use-api';
import { PRICING } from '@/lib/data/pricing';
import { parseRegional, type ListCents, type Regional } from '@/lib/regional-pricing';

let pending: Promise<Regional | null> | null = null;

const LIST_CENTS: ListCents = {
    starter: centsOf(PRICING.tiers.starter.prices),
    team: centsOf(PRICING.tiers.team.prices),
};

function centsOf(prices: Record<string, number>): Record<string, number> {
    return Object.fromEntries(Object.entries(prices).map(([cycle, usd]) => [cycle, Math.round(usd * 100)]));
}

// Once per document. Any failure, a throttled answer included, means no regional price.
function fetchRegional(api: (path: ApiPath) => string): Promise<Regional | null> {
    pending ??= fetch(api('/v2/pricing'), { credentials: 'omit', headers: { Accept: 'application/json' } })
        .then((res) => (res.ok ? res.json() : null))
        .then((body: unknown) => parseRegional(body, LIST_CENTS))
        .catch(() => null);

    return pending;
}

// Null on the server and the first render, so the cached HTML, the structured data and hydration carry the list prices.
export function useRegionalPricing(): Regional | null {
    const api = useApi();
    const [regional, setRegional] = useState<Regional | null>(null);

    useEffect(() => {
        let active = true;

        void fetchRegional(api).then((answer) => {
            if (active) {
                setRegional(answer);
            }
        });

        return () => {
            active = false;
        };
    }, [api]);

    return regional;
}
