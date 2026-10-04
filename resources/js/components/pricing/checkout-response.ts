/**
 * What the plan cards show for the platform's answers to `POST /checkout` and
 * `POST /discount/preview` (architecture §1.14).
 *
 * Pure and free of React and path aliases, so `node --test` loads it directly
 * (tests/js/checkout.test.ts). `useCheckout` and `DiscountField` do the
 * requests and hold the result in state.
 *
 * The platform writes a 422's message in the request's language (the body
 * carries `locale`), so that text is shown as it comes. Everything else is
 * framework text in English, or the throttle's message shared with the
 * license API, so the page's own catalog speaks instead:
 *
 * - 200 with an `https` URL: open it;
 * - 422: the server's `message`, else the catalog's `failed`;
 * - 429: the catalog's `tooMany`;
 * - anything else: the catalog's `failed`.
 */

export interface CheckoutStrings {
    failed: string;
    tooMany: string;
}

export type CheckoutOutcome = { kind: 'open'; url: string } | { kind: 'error'; message: string };

function record(data: unknown): Record<string, unknown> {
    return typeof data === 'object' && data !== null ? (data as Record<string, unknown>) : {};
}

function text(value: unknown): string | null {
    return typeof value === 'string' && value.trim() !== '' ? value : null;
}

export function checkoutOutcome(status: number, data: unknown, strings: CheckoutStrings): CheckoutOutcome {
    const body = record(data);

    if (status >= 200 && status < 300) {
        const url = text(body.url);

        return url !== null && url.startsWith('https://') ? { kind: 'open', url } : { kind: 'error', message: strings.failed };
    }

    if (status === 422) {
        return { kind: 'error', message: text(body.message) ?? strings.failed };
    }

    if (status === 429) {
        return { kind: 'error', message: strings.tooMany };
    }

    return { kind: 'error', message: strings.failed };
}

/**
 * A discount code's preview: `{valid: false}`, or `{valid: true, amount_type,
 * amount}` where a `fixed` amount is in cents and a `percent` one is a whole
 * percentage.
 */
export type DiscountOutcome =
    | { kind: 'percent'; amount: number }
    | { kind: 'fixed'; cents: number }
    | { kind: 'invalid' }
    | { kind: 'tooMany' }
    | { kind: 'failed' };

export function discountOutcome(status: number, data: unknown): DiscountOutcome {
    if (status === 429) {
        return { kind: 'tooMany' };
    }

    if (status === 422) {
        return { kind: 'invalid' };
    }

    if (status < 200 || status >= 300) {
        return { kind: 'failed' };
    }

    const body = record(data);
    const amount = typeof body.amount === 'number' && Number.isFinite(body.amount) && body.amount > 0 ? body.amount : null;

    if (body.valid !== true || amount === null) {
        return { kind: 'invalid' };
    }

    if (body.amount_type === 'percent') {
        return { kind: 'percent', amount };
    }

    if (body.amount_type === 'fixed') {
        return { kind: 'fixed', cents: amount };
    }

    return { kind: 'invalid' };
}
