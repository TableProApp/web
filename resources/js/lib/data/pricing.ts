/**
 * resources/data/pricing.json, typed: the one place the public site states a
 * price, a seat rule, the refund window or a license timing.
 *
 * The values must match what checkout charges. They are synced by hand with
 * the platform's `config/pricing.php` (in cents there) and the Polar products,
 * so never change one here alone. Pricing, the FAQ and structured data all
 * read this module; none of them retypes a number.
 *
 * Prices are USD amounts (`2.99`), the unit `formatUsd()` takes. Billing never
 * changes with the locale; only the way a number is written does.
 */
import data from '@data/pricing.json';

export type BillingCycle = 'monthly' | 'yearly' | 'lifetime';

export type PaidTierId = 'starter' | 'team';

export type TierId = 'free' | PaidTierId;

export type CyclePrices = Record<BillingCycle, number>;

export interface StarterTier {
    /** One license, activated on up to `activations` Macs. */
    unit: 'license';
    prices: CyclePrices;
    activations: number;
}

export interface TeamTier {
    /** Priced per seat; a seat is one activated Mac. */
    unit: 'seat';
    prices: CyclePrices;
    seats: { min: number; max: number };
    activationsPerSeat: number;
    /** Team customers' emails are answered first, within this many business days. */
    prioritySupport: { responseBusinessDays: number };
}

export interface PricingData {
    currency: 'USD';
    merchantOfRecord: { name: string };
    cycles: BillingCycle[];
    tiers: {
        free: { price: 0 };
        starter: StarterTier;
        team: TeamTier;
    };
    /** Refunds within `days` of purchase, on every paid plan. */
    refund: { days: number; scope: 'all-paid-plans' };
    /** Revalidated every `revalidateDays`; works offline for `offlineGraceDays`; no perpetual fallback. */
    license: { revalidateDays: number; offlineGraceDays: number; perpetualFallback: false };
    /** Polar's customer portal: billing and invoices for Polar purchases. */
    billingPortalUrl: string;
    syncedWith: string;
}

/**
 * The single cast from the JSON import, whose string unions TypeScript widens
 * to `string`. `tests/Feature/Data/PricingDataTest.php` pins every value.
 */
export const PRICING = data as PricingData;

export function tierPrice(tier: PaidTierId, cycle: BillingCycle): number {
    return PRICING.tiers[tier].prices[cycle];
}

/**
 * What a Team purchase costs for `seats` seats, clamped to the allowed range.
 * Rounded to cents, because `1.25 × 7` is not exact in binary floating point.
 */
export function teamTotal(seats: number, cycle: BillingCycle): number {
    const { min, max } = PRICING.tiers.team.seats;
    const count = Math.min(max, Math.max(min, Math.round(seats)));

    return Math.round(tierPrice('team', cycle) * count * 100) / 100;
}

/**
 * How much a yearly plan saves against twelve monthly payments, as a whole
 * percentage rounded down, so the page never overstates it. Computed, never
 * typed: Starter and Team both give 33 today.
 */
export function yearlySavingsPercent(tier: PaidTierId): number {
    const twelveMonths = tierPrice(tier, 'monthly') * 12;

    return Math.floor(((twelveMonths - tierPrice(tier, 'yearly')) / twelveMonths) * 100);
}

/** A price as structured data needs it: a locale-neutral decimal string, `"2.99"`, `"24"`. */
export function jsonLdPrice(amount: number): string {
    return Number.isInteger(amount) ? String(amount) : amount.toFixed(2);
}
