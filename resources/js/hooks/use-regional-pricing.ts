import { useEffect, useState } from 'react';
import { useApi, type ApiPath } from '@/hooks/use-api';
import { PRICING, type BillingCycle } from '@/lib/data/pricing';
import { parseEducationOpen, parseRegional, parseSeatMaximums, type ListCents, type Regional } from '@/lib/regional-pricing';

interface PricingAnswer {
    regional: Regional | null;
    teamMaxSeats: Partial<Record<BillingCycle, number>>;
    educationOpen: boolean;
}

const NO_ANSWER: PricingAnswer = { regional: null, teamMaxSeats: {}, educationOpen: false };

let pending: Promise<PricingAnswer> | null = null;

const LIST_CENTS: ListCents = {
    starter: centsOf(PRICING.tiers.starter.prices),
    team: centsOf(PRICING.tiers.team.prices),
};

function centsOf(prices: Record<string, number>): Record<string, number> {
    return Object.fromEntries(Object.entries(prices).map(([cycle, usd]) => [cycle, Math.round(usd * 100)]));
}

// Once per document. Any failure, a throttled answer included, means no regional price, no seat maximum and no education program.
function fetchPricing(api: (path: ApiPath) => string): Promise<PricingAnswer> {
    pending ??= fetch(api('/v2/pricing'), { credentials: 'omit', headers: { Accept: 'application/json' } })
        .then((res) => (res.ok ? res.json() : null))
        .then((body: unknown) => ({
            regional: parseRegional(body, LIST_CENTS),
            teamMaxSeats: parseSeatMaximums(body, 'team', PRICING.tiers.team.seats.min),
            educationOpen: parseEducationOpen(body),
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

// False on the server and until GET /v2/pricing answers, so cached HTML never offers a program the admin has closed.
export function useEducationOpen(): boolean {
    return usePricingAnswer().educationOpen;
}
