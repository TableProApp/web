// Facts and sentences arrive as arguments from resources/data and the catalogs, so a node never states what the page does not.
// No aggregateRating, review, FAQPage or HowTo anywhere, and no node for a product that is not TablePro.

export const SCHEMA_ORG = 'https://schema.org';

export interface JsonLdNode {
    '@type': string;
    '@id'?: string;
    [property: string]: unknown;
}

export interface JsonLdReference {
    '@id': string;
}

export interface JsonLdGraph {
    '@context': typeof SCHEMA_ORG;
    '@graph': JsonLdNode[];
}

export interface PageContext {
    baseUrl: string;
    inLanguage: string;
}

export interface Crumb {
    name: string;
    path: string;
}

export type BillingCycle = 'monthly' | 'yearly' | 'lifetime';

export interface OfferInput {
    name: string;
    price: number;
    currency: string;
    cycle?: BillingCycle;
    unitText?: string;
    // A Team plan's seat minimum; the maximum comes from GET /v2/pricing after rendering, so the HTML states none.
    quantity?: { min: number; max?: number };
}

export interface PricingFacts {
    currency: string;
    tiers: Record<string, { price?: number; unit?: string; prices?: Partial<Record<BillingCycle, number>>; seats?: { min: number; max?: number } }>;
}

const BILLING_DURATION: Record<Exclude<BillingCycle, 'lifetime'>, string> = {
    monthly: 'P1M',
    yearly: 'P1Y',
};

export function origin(baseUrl: string): string {
    return baseUrl.replace(/\/+$/, '');
}

export function absoluteUrl(baseUrl: string, path: string): string {
    return `${origin(baseUrl)}${path.startsWith('/') ? path : `/${path}`}`;
}

export function organizationId(baseUrl: string): string {
    return `${origin(baseUrl)}/#organization`;
}

export function macAppId(baseUrl: string): string {
    return `${origin(baseUrl)}/#app`;
}

export function founderId(baseUrl: string): string {
    return `${origin(baseUrl)}/#founder`;
}

export function iosAppId(baseUrl: string): string {
    return `${origin(baseUrl)}/#ios-app`;
}

export function websiteId(baseUrl: string): string {
    return `${origin(baseUrl)}/#website`;
}

export function reference(id: string): JsonLdReference {
    return { '@id': id };
}

export function priceString(amount: number): string {
    return Number.isInteger(amount) ? String(amount) : amount.toFixed(2);
}

export interface ProfileLinks {
    github: string;
    x: string;
    discord: string;
    telegram: string;
}

// Docs, the App Store listing and sponsorship are not profiles of the organization.
export function organizationProfiles(links: ProfileLinks): string[] {
    return [links.github, links.x, links.discord, links.telegram];
}

export interface PublisherInput {
    name: string;
    locality: string;
    countryCode: string;
}

function postalAddress(publisher: PublisherInput): JsonLdNode {
    return { '@type': 'PostalAddress', addressLocality: publisher.locality, addressCountry: publisher.countryCode };
}

export function organizationNode(baseUrl: string, input: { description: string; sameAs: readonly string[]; publisher: PublisherInput }): JsonLdNode {
    return {
        '@type': 'Organization',
        '@id': organizationId(baseUrl),
        name: 'TablePro',
        url: `${origin(baseUrl)}/`,
        logo: {
            '@type': 'ImageObject',
            url: absoluteUrl(baseUrl, '/logo.png'),
            width: 256,
            height: 256,
        },
        description: input.description,
        address: postalAddress(input.publisher),
        founder: {
            '@type': 'Person',
            '@id': founderId(baseUrl),
            name: input.publisher.name,
            address: postalAddress(input.publisher),
        },
        ...(input.sameAs.length > 0 ? { sameAs: [...input.sameAs] } : {}),
    };
}

export function websiteNode(context: PageContext, input: { description: string; languages: readonly string[] }): JsonLdNode {
    return {
        '@type': 'WebSite',
        '@id': websiteId(context.baseUrl),
        url: `${origin(context.baseUrl)}/`,
        name: 'TablePro',
        description: input.description,
        inLanguage: [...input.languages],
        publisher: reference(organizationId(context.baseUrl)),
    };
}

export function offerNode(input: OfferInput): JsonLdNode {
    const price = priceString(input.price);
    const billingDuration =
        input.cycle === 'monthly' || input.cycle === 'yearly' ? BILLING_DURATION[input.cycle] : undefined;

    if (billingDuration === undefined && input.unitText === undefined) {
        return { '@type': 'Offer', name: input.name, price, priceCurrency: input.currency };
    }

    return {
        '@type': 'Offer',
        name: input.name,
        price,
        priceCurrency: input.currency,
        priceSpecification: {
            '@type': 'UnitPriceSpecification',
            price,
            priceCurrency: input.currency,
            ...(billingDuration !== undefined ? { billingDuration } : {}),
            ...(input.unitText !== undefined ? { unitText: input.unitText } : {}),
        },
        ...(input.quantity !== undefined
            ? {
                  eligibleQuantity: {
                      '@type': 'QuantitativeValue',
                      minValue: input.quantity.min,
                      ...(input.quantity.max !== undefined ? { maxValue: input.quantity.max } : {}),
                      ...(input.unitText !== undefined ? { unitText: input.unitText } : {}),
                  },
              }
            : {}),
    };
}

// Emit these only where the prices are visible on the page.
export function pricingOffers(
    pricing: PricingFacts,
    name: (tier: string, cycle: BillingCycle | null) => string,
    unitText: (unit: string) => string | undefined = () => undefined,
): OfferInput[] {
    const offers: OfferInput[] = [];

    for (const [tier, facts] of Object.entries(pricing.tiers)) {
        if (typeof facts.price === 'number') {
            offers.push({ name: name(tier, null), price: facts.price, currency: pricing.currency });
        }

        for (const [cycle, amount] of Object.entries(facts.prices ?? {}) as [BillingCycle, number | undefined][]) {
            if (typeof amount !== 'number') {
                continue;
            }

            const unit = facts.unit !== undefined && facts.unit !== 'license' ? unitText(facts.unit) : undefined;

            offers.push({
                name: name(tier, cycle),
                price: amount,
                currency: pricing.currency,
                cycle,
                ...(unit !== undefined ? { unitText: unit } : {}),
                ...(unit !== undefined && facts.seats !== undefined ? { quantity: facts.seats } : {}),
            });
        }
    }

    return offers;
}

export interface MacAppInput {
    description: string;
    alternateName: string;
    subCategory: string;
    operatingSystem: string;
    requirements: string;
    licenseUrl: string;
    // Only from a live release source.
    version?: string | null;
    downloadUrl?: string | null;
    offers?: readonly OfferInput[];
}

// Never `isAccessibleForFree`, `fileSize`, a counted description or a rating.
export function macAppNode(context: PageContext, input: MacAppInput): JsonLdNode {
    return {
        '@type': 'SoftwareApplication',
        '@id': macAppId(context.baseUrl),
        name: 'TablePro',
        alternateName: input.alternateName,
        description: input.description,
        applicationCategory: 'DeveloperApplication',
        applicationSubCategory: input.subCategory,
        operatingSystem: input.operatingSystem,
        softwareRequirements: input.requirements,
        license: input.licenseUrl,
        inLanguage: context.inLanguage,
        publisher: reference(organizationId(context.baseUrl)),
        ...(input.version ? { softwareVersion: input.version } : {}),
        ...(input.downloadUrl ? { downloadUrl: input.downloadUrl } : {}),
        ...(input.offers && input.offers.length > 0 ? { offers: input.offers.map(offerNode) } : {}),
    };
}

export interface IosAppInput {
    alternateName: string;
    operatingSystem: string;
    requirements: string;
    installUrl: string;
    licenseUrl: string;
    currency: string;
    description?: string;
    // Only from a live source, the App Store lookup.
    version?: string | null;
    featureList?: readonly string[];
}

export function iosAppNode(context: PageContext, input: IosAppInput): JsonLdNode {
    return {
        '@type': 'MobileApplication',
        '@id': iosAppId(context.baseUrl),
        name: 'TablePro',
        alternateName: input.alternateName,
        ...(input.description ? { description: input.description } : {}),
        applicationCategory: 'DeveloperApplication',
        operatingSystem: input.operatingSystem,
        softwareRequirements: input.requirements,
        installUrl: input.installUrl,
        license: input.licenseUrl,
        isAccessibleForFree: true,
        offers: [offerNode({ name: input.alternateName, price: 0, currency: input.currency })],
        inLanguage: context.inLanguage,
        publisher: reference(organizationId(context.baseUrl)),
        ...(input.version ? { softwareVersion: input.version } : {}),
        ...(input.featureList && input.featureList.length > 0 ? { featureList: [...input.featureList] } : {}),
    };
}

export function breadcrumbNode(context: PageContext, pageUrl: string, crumbs: readonly Crumb[]): JsonLdNode {
    return {
        '@type': 'BreadcrumbList',
        '@id': `${pageUrl}#breadcrumb`,
        itemListElement: crumbs.map((crumb, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: crumb.name,
            item: absoluteUrl(context.baseUrl, crumb.path),
        })),
    };
}

export interface WebPageInput {
    url: string;
    name: string;
    description?: string;
    about?: string;
    breadcrumb?: string;
}

export function webPageNode(context: PageContext, input: WebPageInput, type: 'WebPage' | 'CollectionPage' | 'AboutPage' = 'WebPage'): JsonLdNode {
    return {
        '@type': type,
        '@id': `${input.url}#webpage`,
        url: input.url,
        name: input.name,
        ...(input.description ? { description: input.description } : {}),
        inLanguage: context.inLanguage,
        isPartOf: reference(websiteId(context.baseUrl)),
        ...(input.about ? { about: reference(input.about) } : {}),
        ...(input.breadcrumb ? { breadcrumb: reference(input.breadcrumb) } : {}),
    };
}

export function collectionPageNode(context: PageContext, input: WebPageInput & { items: readonly Crumb[] }): JsonLdNode {
    return {
        ...webPageNode(context, input, 'CollectionPage'),
        mainEntity: {
            '@type': 'ItemList',
            itemListElement: input.items.map((item, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                name: item.name,
                url: absoluteUrl(context.baseUrl, item.path),
            })),
        },
    };
}

export interface BlogPostingInput {
    url: string;
    headline: string;
    description: string;
    datePublished: string;
    // Only after a real change to the content.
    dateModified?: string | null;
    image?: string | null;
}

// Written and published by the organization rather than an invented person.
export function blogPostingNode(context: PageContext, input: BlogPostingInput): JsonLdNode {
    return {
        '@type': 'BlogPosting',
        '@id': `${input.url}#article`,
        url: input.url,
        mainEntityOfPage: input.url,
        headline: input.headline,
        description: input.description,
        datePublished: input.datePublished,
        ...(input.dateModified ? { dateModified: input.dateModified } : {}),
        ...(input.image ? { image: input.image } : {}),
        inLanguage: context.inLanguage,
        author: reference(organizationId(context.baseUrl)),
        publisher: reference(organizationId(context.baseUrl)),
    };
}

export function graph(nodes: readonly (JsonLdNode | null | undefined | false)[]): JsonLdGraph {
    return {
        '@context': SCHEMA_ORG,
        '@graph': nodes.filter((node): node is JsonLdNode => Boolean(node)),
    };
}
