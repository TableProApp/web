/**
 * The props the pricing components take from the server, and the copy types
 * of `/pricing`. Copy shapes are the English files': `ContentParityTest` holds
 * every other locale to the same keys.
 */
import type { CheckoutProvider } from '@/lib/checkout-sdk';

export type { CheckoutProvider };

/**
 * How this site hands a purchase to the platform, from
 * `App\Support\Pricing\Checkout::props()`. Every page that renders plan cards
 * receives it under the `checkout` prop.
 */
export interface CheckoutProp {
    /** The overlay to open, from `PAYMENT_PROVIDER`; it must match the platform's own setting. */
    provider: CheckoutProvider;
    /**
     * Whether this site asks for a discount code before checkout. False under
     * Polar, whose checkout has its own field.
     */
    couponField: boolean;
}

export type PricingContent = typeof import('@data/content/en/pricing.json');

/** `content/{locale}/paid-features.json`: per feature id, its one-line detail and what it does when a plan ends. */
export type PaidFeatureCopy = Record<string, { detail: string; lapse: string }>;

export interface PricingPageProps {
    content: PricingContent;
    paidFeatures: PaidFeatureCopy;
    checkout: CheckoutProp;
    /** The featured engines' names, in data order, for the Mac app's structured-data description. */
    featuredEngines: string[];
    /** Comparisons with clients that sell a paid plan, each with its page's H1. */
    comparisons: { path: string; title: string }[];
}
