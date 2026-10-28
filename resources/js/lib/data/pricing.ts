// pricing.json, synced by hand with tablepro-cloud's GET /v2/pricing and the Polar products: never change a value here alone.
// The Team seat maximum is not in it: the plan cards read it from GET /v2/pricing.
import data from '@data/pricing.json';

export type BillingCycle = 'monthly' | 'yearly' | 'lifetime';

export type PaidTierId = 'starter' | 'team';

export type TierId = 'free' | PaidTierId;

export type CyclePrices = Record<BillingCycle, number>;

export interface StarterTier {
    unit: 'license';
    prices: CyclePrices;
}

export interface TeamTier {
    unit: 'seat';
    prices: CyclePrices;
    seats: { min: number };
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
    refund: { days: number; scope: 'all-paid-plans' };
    // deviceLimit is per account, across Starter and Team; legacy is for builds that still use /v1.
    license: {
        deviceLimit: number;
        offlineDays: number;
        perpetualFallback: false;
        legacy: { revalidateDays: number; offlineGraceDays: number };
    };
    billingPortalUrl: string;
    syncedWith: string;
}

// TypeScript widens the JSON's string unions to string; tests/Feature/Data/PricingDataTest.php pins every value.
export const PRICING = data as PricingData;

export function tierPrice(tier: PaidTierId, cycle: BillingCycle): number {
    return PRICING.tiers[tier].prices[cycle];
}

// Rounded to cents, because 1.25 × 7 is not exact in binary floating point.
export function teamTotal(seats: number, cycle: BillingCycle): number {
    const count = Math.max(PRICING.tiers.team.seats.min, Math.round(seats));

    return Math.round(tierPrice('team', cycle) * count * 100) / 100;
}

// Rounded down, so the page never overstates the saving.
export function yearlySavingsPercent(tier: PaidTierId): number {
    const twelveMonths = tierPrice(tier, 'monthly') * 12;

    return Math.floor(((twelveMonths - tierPrice(tier, 'yearly')) / twelveMonths) * 100);
}

export function jsonLdPrice(amount: number): string {
    return Number.isInteger(amount) ? String(amount) : amount.toFixed(2);
}
