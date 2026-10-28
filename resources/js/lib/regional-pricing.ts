// The regional discount checkout applies in some countries, as GET /v2/pricing answers it for the reader.
// No imports, so `node --test` loads it directly.

export interface Regional {
    // ISO 3166-1 alpha-2, such as `VN`.
    country: string;
    percent: number;
}

export type ListCents = Record<string, Record<string, number>>;

function record(value: unknown): Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

// Rounded half up once, as Polar rounds: tests/js/regional-pricing.test.ts pins the cases a half cent decides.
export function discountedCents(listCents: number, percent: number): number {
    return listCents - Math.floor((listCents * percent + 50) / 100);
}

export function discountedAmount(listUsd: number, percent: number): number {
    return discountedCents(Math.round(listUsd * 100), percent) / 100;
}

// Any plan off its pricing.json price, a second percentage or other rounding keeps the list prices: a card never shows a price checkout would not charge.
export function parseRegional(body: unknown, list: ListCents): Regional | null {
    const { country, plans } = record(body);

    if (typeof country !== 'string' || !/^[A-Z]{2}$/.test(country) || !Array.isArray(plans)) {
        return null;
    }

    let percent: number | null = null;

    for (const [plan, cycles] of Object.entries(list)) {
        for (const [cycle, cents] of Object.entries(cycles)) {
            const answer = plans.map(record).find((each) => each.plan === plan && each.cycle === cycle);

            if (answer === undefined || answer.currency !== 'USD' || answer.amount !== cents) {
                return null;
            }

            const off = answer.discount_percent;

            if (typeof off !== 'number' || !Number.isInteger(off) || off < 1 || off > 99 || (percent !== null && off !== percent)) {
                return null;
            }

            if (answer.discounted_amount !== discountedCents(cents, off)) {
                return null;
            }

            percent = off;
        }
    }

    return percent === null ? null : { country, percent };
}

// Per cycle, the most seats a checkout of the per-seat plan sells; a cycle Polar sets no limit for is left out.
export function parseSeatMaximums(body: unknown, plan: string, min: number): Record<string, number> {
    const { plans } = record(body);
    const maximums: Record<string, number> = {};

    if (!Array.isArray(plans)) {
        return maximums;
    }

    for (const answer of plans.map(record)) {
        const max = answer.max_seats;

        if (answer.plan === plan && answer.per_seat === true && typeof answer.cycle === 'string' && typeof max === 'number' && Number.isInteger(max) && max >= min) {
            maximums[answer.cycle] = max;
        }
    }

    return maximums;
}
