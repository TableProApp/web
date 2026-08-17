/**
 * Every price literal on the site, in one place.
 *
 * These must match what `/checkout` actually charges. That endpoint is served
 * by the TablePro backend, not by this repository, so nothing here can verify
 * it — which is exactly why the numbers must exist once. Never edit one without
 * confirming the other.
 *
 * `pricing.tsx` held them inside `buildTiers()` and a second copy in a
 * fine-print line that read "$24 a year, or $59 once". Home.tsx's JSON-LD held
 * a third, as `highPrice: '59'`. Three copies of a figure that must agree with
 * a system this repo cannot see.
 */
export interface TierPrice {
    monthly: number;
    yearly: number;
    lifetime: number;
}

/** Per person. */
export const STARTER_PRICE: TierPrice = { monthly: 2.99, yearly: 24, lifetime: 59 };

/** Per seat. The minimum seat count comes from config, via the `teamMinSeats` prop. */
export const TEAM_SEAT_PRICE: TierPrice = { monthly: 1.25, yearly: 10, lifetime: 25 };
