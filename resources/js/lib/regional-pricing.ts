/**
 * The regional discount the platform applies at checkout in some countries,
 * as the pricing cards show it once `GET /discount/region` says it applies to
 * the reader.
 *
 * The price charged is the provider's: the platform attaches its percentage
 * code to the checkout (license `RegionalPricing`). These functions only work
 * out what that checkout will show, in cents: the discount is rounded to the
 * nearest cent, a half cent up, then taken off. The cases a half cent decides
 * are pinned in tests/js/regional-pricing.test.ts; if a checkout observed at
 * the provider rounds them otherwise, change `discountedCents` and those
 * cases together.
 *
 * Pure and with no imports, so `node --test` loads it directly.
 */

export interface Regional {
    /** ISO 3166-1 alpha-2, such as `VN`. */
    country: string;
    /** Whole percent off, 1 to 99. */
    percent: number;
}

/** The platform's answer, or null for `{}`, anything malformed, or a percentage outside 1–99. */
export function parseRegional(body: unknown): Regional | null {
    if (body === null || typeof body !== 'object') {
        return null;
    }

    const { country, percent } = body as Partial<Record<keyof Regional, unknown>>;

    if (typeof country !== 'string' || !/^[A-Z]{2}$/.test(country)) {
        return null;
    }

    if (typeof percent !== 'number' || !Number.isInteger(percent) || percent < 1 || percent > 99) {
        return null;
    }

    return { country, percent };
}

/** What a whole number of cents costs after a whole `percent` off. Integer arithmetic, so a half cent is exact. */
export function discountedCents(listCents: number, percent: number): number {
    return listCents - Math.floor((listCents * percent + 50) / 100);
}

/** The same for a USD amount (`2.99`), the unit `formatUsd()` takes. */
export function discountedAmount(listUsd: number, percent: number): number {
    return discountedCents(Math.round(listUsd * 100), percent) / 100;
}
