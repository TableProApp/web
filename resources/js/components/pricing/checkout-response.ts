// What the plan cards show for each answer of POST /v2/checkouts and POST /v2/discounts/preview.
// No path aliases, so `node --test` loads it directly (tests/js/checkout.test.ts).
import { problemOf } from '../../lib/problem.ts';

export interface CheckoutStrings {
    failed: string;
    tooMany: string;
    planUnavailable: string;
    seats: string;
}

export type CheckoutOutcome = { kind: 'open'; url: string } | { kind: 'error'; message: string };

export function checkoutOutcome(status: number, data: unknown, strings: CheckoutStrings): CheckoutOutcome {
    if (status >= 200 && status < 300) {
        const url = typeof data === 'object' && data !== null ? (data as Record<string, unknown>).url : null;

        return typeof url === 'string' && url.startsWith('https://') ? { kind: 'open', url } : { kind: 'error', message: strings.failed };
    }

    if (status === 429) {
        return { kind: 'error', message: strings.tooMany };
    }

    const problem = problemOf(data);

    if (status === 422 && problem.code === 'plan_unavailable') {
        return { kind: 'error', message: strings.planUnavailable };
    }

    if (status === 422 && problem.code === 'validation_failed' && problem.locations.includes('body.seats')) {
        return { kind: 'error', message: strings.seats };
    }

    return { kind: 'error', message: strings.failed };
}

// The seat field never sends fewer than the minimum, so without a known maximum a 422 on body.seats means too many.
export function seatsMessage(maxSeats: number | null | undefined, range: (max: number) => string, fewer: string): string {
    return typeof maxSeats === 'number' ? range(maxSeats) : fewer;
}

export type DiscountOutcome =
    | { kind: 'percent'; amount: number }
    | { kind: 'fixed'; cents: number }
    // A fixed amount in a currency other than the site's USD: accepted, but not restated.
    | { kind: 'accepted' }
    | { kind: 'invalid' }
    | { kind: 'tooMany' }
    | { kind: 'failed' };

export function discountOutcome(status: number, data: unknown): DiscountOutcome {
    if (status === 429) {
        return { kind: 'tooMany' };
    }

    // A malformed code, such as one over 64 characters, is a code checkout would not apply.
    if (status === 422) {
        return { kind: 'invalid' };
    }

    if (status < 200 || status >= 300) {
        return { kind: 'failed' };
    }

    const body = typeof data === 'object' && data !== null ? (data as Record<string, unknown>) : {};
    const amount = typeof body.amount === 'number' && Number.isFinite(body.amount) && body.amount > 0 ? body.amount : null;

    if (body.valid !== true || amount === null) {
        return { kind: 'invalid' };
    }

    if (body.amount_type === 'percent') {
        return { kind: 'percent', amount };
    }

    if (body.amount_type === 'fixed') {
        const currency = typeof body.currency === 'string' ? body.currency.toUpperCase() : 'USD';

        return currency === 'USD' ? { kind: 'fixed', cents: amount } : { kind: 'accepted' };
    }

    return { kind: 'invalid' };
}
