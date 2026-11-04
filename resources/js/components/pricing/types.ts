/**
 * The props the pricing components take from the server, and the copy types
 * of `/pricing`. Copy shapes are the English files': `ContentParityTest` holds
 * every other locale to the same keys.
 */
export type PricingContent = typeof import('@data/content/en/pricing.json');

/** `content/{locale}/paid-features.json`: per feature id, its one-line detail and what it does when a plan ends. */
export type PaidFeatureCopy = Record<string, { detail: string; lapse: string }>;

export interface PricingPageProps {
    content: PricingContent;
    paidFeatures: PaidFeatureCopy;
    /** The featured engines' names, in data order, for the Mac app's structured-data description. */
    featuredEngines: string[];
    /** Comparisons with clients that sell a paid plan, each with its page's H1. */
    comparisons: { path: string; title: string }[];
}
