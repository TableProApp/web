import { useEffect, useState } from 'react';
import { useApi, type ApiPath } from '@/hooks/use-api';
import { PRICING, type BillingCycle } from '@/lib/data/pricing';
import { parseRegional, parseSeatMaximums, type ListCents, type Regional } from '@/lib/regional-pricing';

interface PricingAnswer {
    regional: Regional | null;
    teamMaxSeats: Partial<Record<BillingCycle, number>>;
}

const NO_ANSWER: PricingAnswer = { regional: null, teamMaxSeats: {} };

let pending: Promise<PricingAnswer> | null = null;

const LIST_CENTS: ListCents = {
    starter: centsOf(PRICING.tiers.starter.prices),
    team: centsOf(PRICING.tiers.team.prices),
};

function centsOf(prices: Record<string, number>): Record<string, number> {
    return Object.fromEntries(Object.entries(prices).map(([cycle, usd]) => [cycle, Math.round(usd * 100)]));
}

// Once per document. Any failure, a throttled answer included, means no regional price and no seat maximum.
function fetchPricing(api: (path: ApiPath) => string): Promise<PricingAnswer> {
    pending ??= fetch(api('/v2/pricing'), { credentials: 'omit', headers: { Accept: 'application/json' } })
        .then((res) => (res.ok ? res.json() : null))
        .then((body: unknown) => ({
            regional: parseRegional(body, LIST_CENTS),
            teamMaxSeats: parseSeatMaximums(body, 'team', PRICING.tiers.team.seats.min),
        }))
        .catch(() => NO_ANSWER);

    return pending;
}

function usePricingAnswer(): PricingAnswer {
    const api = useApi();
    const [answer, setAnswer] = useState<PricingAnswer>(NO_ANSWER);

    useEffect(() => {
        let active = true;

        void fetchPricing(api).then((next) => {
            if (active) {
                setAnswer(next);
            }
        });

        return () => {
            active = false;
        };
    }, [api]);

    return answer;
}

// Null on the server and the first render, so the cached HTML, the structured data and hydration carry the list prices.
export function useRegionalPricing(): Regional | null {
    return usePricingAnswer().regional;
}

// Empty until GET /v2/pricing answers, and for a cycle Polar sets no limit for: the seat field then has no maximum.
export function useTeamMaxSeats(): Partial<Record<BillingCycle, number>> {
    return usePricingAnswer().teamMaxSeats;
}
