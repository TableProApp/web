// pricing.json, synced by hand with tablepro-cloud's GET /v2/pricing and the Polar products: never change a value here alone.
// The Team seat maximum is not in it: the plan cards read it from GET /v2/pricing.
import data from '@data/pricing.json';
import type { CampaignData } from '@/lib/campaign';

export type BillingCycle = 'monthly' | 'yearly' | 'lifetime';

export type PaidTierId = 'starter' | 'team';

export type TierId = 'free' | PaidTierId;

export type CyclePrices = Record<BillingCycle, number>;

// Team is a subscription: it has no one-time price.
export type TeamCycle = Exclude<BillingCycle, 'lifetime'>;

export interface StarterTier {
    unit: 'license';
    prices: CyclePrices;
}

export interface TeamTier {
    unit: 'seat';
    prices: Record<TeamCycle, number>;
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
    // deviceLimit is per account, across Pro and Team; legacy is for builds that still use /v1.
    license: {
        deviceLimit: number;
        offlineDays: number;
        perpetualFallback: false;
        legacy: { revalidateDays: number; offlineGraceDays: number };
    };
    // The dated sale, synced by hand with the Polar discount; null when there is none (lib/campaign.ts).
    campaign: CampaignData | null;
    billingPortalUrl: string;
    syncedWith: string;
}

// TypeScript widens the JSON's string unions to string; tests/Feature/Data/PricingDataTest.php validates the file.
export const PRICING = data as PricingData;

// What a plan costs in a cycle, or undefined for a cycle it is not sold in (Team one-time).
export function tierPrice(tier: PaidTierId, cycle: BillingCycle): number | undefined {
    const prices: Partial<CyclePrices> = PRICING.tiers[tier].prices;

    return prices[cycle];
}

// Whether checkout sells the plan in the cycle.
export function sells(tier: PaidTierId, cycle: BillingCycle): boolean {
    return tierPrice(tier, cycle) !== undefined;
}

// Rounded to cents, because 1.25 × 7 is not exact in binary floating point.
export function teamTotal(seats: number, cycle: TeamCycle): number {
    const count = Math.max(PRICING.tiers.team.seats.min, Math.round(seats));

    return Math.round(PRICING.tiers.team.prices[cycle] * count * 100) / 100;
}

// Rounded down, so the page never overstates the saving: Pro gives 34 and Team 16 today.
export function yearlySavingsPercent(tier: PaidTierId): number {
    const { monthly, yearly } = PRICING.tiers[tier].prices;
    const twelveMonths = monthly * 12;

    return Math.floor(((twelveMonths - yearly) / twelveMonths) * 100);
}

export function jsonLdPrice(amount: number): string {
    return Number.isInteger(amount) ? String(amount) : amount.toFixed(2);
}
