/**
 * JSON-LD for the public site: one builder per node, combined per page type
 * (architecture §1.6, positioning §6.3, sitemap §F.2).
 *
 * Every builder is a pure function. Facts (versions, requirements, prices,
 * store and profile URLs) arrive as arguments read from `resources/data` by
 * the caller, and sentences arrive from the catalogs and content, so a node
 * can never state something the page does not. Nothing is typed from memory
 * here, and this module imports nothing but the English catalog, which keeps
 * it loadable by `node --test`.
 *
 * Rules every page follows:
 *
 * - Stable ids: `https://tablepro.app/#organization` (the docs site asserts
 *   it), `#website` for the one site, `#app` for the Mac app and `#ios-app`
 *   for the iPhone and iPad app, the same in every locale. The site is one
 *   `WebSite` in both languages (`inLanguage: ["en", "vi"]`, positioning
 *   §6.3), and every page in either language `isPartOf` it; the page itself
 *   carries its own language.
 * - `inLanguage` on every node that is a schema.org CreativeWork (website,
 *   pages, apps, posts). `Organization`, `BreadcrumbList`, `ItemList` and
 *   `Offer` are not CreativeWorks and do not take it; their text is still in
 *   the page's language.
 * - Visible content only. No `aggregateRating`, `review`, `FAQPage` or `HowTo`
 *   anywhere, and no node for a product that is not TablePro.
 */

export const SCHEMA_ORG = 'https://schema.org';

/** One JSON-LD node. `@type` is required; everything else depends on the type. */
export interface JsonLdNode {
    '@type': string;
    '@id'?: string;
    [property: string]: unknown;
}

/** A reference to a node emitted elsewhere, by its `@id`. */
export interface JsonLdReference {
    '@id': string;
}

export interface JsonLdGraph {
    '@context': typeof SCHEMA_ORG;
    '@graph': JsonLdNode[];
}

/** What every page-level builder needs to know about the page it describes. */
export interface PageContext {
    /** The canonical origin: the shared `canonicalBaseUrl` prop. */
    baseUrl: string;
    /** The page's language: its locale's `hreflang` value (`en`, `vi`). */
    inLanguage: string;
}

export interface Crumb {
    name: string;
    /** A same-locale, root-relative path, such as `/vi/features`. */
    path: string;
}

/** @deprecated Use `Crumb`. Kept for `SEOHead`'s `breadcrumbs` prop. */
export type BreadcrumbCrumb = Crumb;

export type BillingCycle = 'monthly' | 'yearly' | 'lifetime';

export interface OfferInput {
    /** The plan's visible name in the page's language, such as "Starter, yearly". */
    name: string;
    price: number;
    /** ISO 4217, from `pricing.json`. */
    currency: string;
    /** Omitted for a free offer. `lifetime` is paid once and has no billing period. */
    cycle?: BillingCycle;
    /** What one unit of the price buys, such as "seat"; omitted for a whole license. */
    unitText?: string;
}

/** The parts of `resources/data/pricing.json` the offers are built from. */
export interface PricingFacts {
    currency: string;
    tiers: Record<string, { price?: number; unit?: string; prices?: Partial<Record<BillingCycle, number>> }>;
}

const BILLING_DURATION: Record<Exclude<BillingCycle, 'lifetime'>, string> = {
    monthly: 'P1M',
    yearly: 'P1Y',
};

/** The origin with no trailing slash. */
export function origin(baseUrl: string): string {
    return baseUrl.replace(/\/+$/, '');
}

/** An absolute URL for a root-relative path on the canonical origin. */
export function absoluteUrl(baseUrl: string, path: string): string {
    return `${origin(baseUrl)}${path.startsWith('/') ? path : `/${path}`}`;
}

export function organizationId(baseUrl: string): string {
    return `${origin(baseUrl)}/#organization`;
}

export function macAppId(baseUrl: string): string {
    return `${origin(baseUrl)}/#app`;
}

export function iosAppId(baseUrl: string): string {
    return `${origin(baseUrl)}/#ios-app`;
}

/** The one `WebSite`, shared by every locale: `https://tablepro.app/#website`. */
export function websiteId(baseUrl: string): string {
    return `${origin(baseUrl)}/#website`;
}

export function reference(id: string): JsonLdReference {
    return { '@id': id };
}

/**
 * A price as schema.org wants it: a locale-neutral string with a `.` decimal
 * separator and no currency sign. `24` stays `"24"`; `2.99` stays `"2.99"`.
 */
export function priceString(amount: number): string {
    return Number.isInteger(amount) ? String(amount) : amount.toFixed(2);
}

/** The organization's own profiles in `facts.json` → `links`. */
export interface ProfileLinks {
    github: string;
    x: string;
    discord: string;
    facebook: string;
    telegram: string;
}

/**
 * The organization's `sameAs`: its own profiles, in a fixed order, from
 * `facts.json` → `links`. Docs, the App Store listing and sponsorship are not
 * profiles of the organization, so they are not in it.
 */
export function organizationProfiles(links: ProfileLinks): string[] {
    return [links.github, links.x, links.discord, links.facebook, links.telegram];
}

/** The publisher: the same node in every locale, with its description in the page's language. */
export function organizationNode(baseUrl: string, input: { description: string; sameAs: readonly string[] }): JsonLdNode {
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
        ...(input.sameAs.length > 0 ? { sameAs: [...input.sameAs] } : {}),
    };
}

/**
 * The site: one node in every locale, with the same id and root URL, listing
 * every language it is written in (the `hreflang` values from
 * `resources/data/locales.json`). Only the description follows the page's
 * language.
 */
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

/** One visible price. A free offer has no cycle; a paid one carries its billing period and unit. */
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
    };
}

/**
 * Every price in `pricing.json`, in its order: the free tier, then each paid
 * tier's cycles. `name` labels each one in the page's language (the `pricing`
 * catalog's tier and cycle names), and `unitText` names a non-license unit
 * such as a seat.
 *
 * Emit these only where the prices are visible on the page.
 */
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
            });
        }
    }

    return offers;
}

export interface MacAppInput {
    /** The long product description, in the page's language. */
    description: string;
    /** `seo.macApp.alternateName`. */
    alternateName: string;
    /** `seo.macApp.subCategory`. */
    subCategory: string;
    /** The systems from `platforms.json`, such as "macOS". */
    operatingSystem: string;
    /** The requirement and architectures sentence, rendered from `platforms.json`. */
    requirements: string;
    /** The AGPL licence URL, from `facts.json`. */
    licenseUrl: string;
    /** Only from a live release source; omitted when the page has none. */
    version?: string | null;
    /** Absolute. Only where the page offers the download. */
    downloadUrl?: string | null;
    /** Only the prices visible on the page. */
    offers?: readonly OfferInput[];
}

/** The Mac app, `#app`. Never `isAccessibleForFree`, `fileSize`, a counted description or a rating. */
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
    /** `seo.iosApp.alternateName`. */
    alternateName: string;
    /** The systems from `platforms.json`, such as "iOS, iPadOS". */
    operatingSystem: string;
    /** The requirement sentence, rendered from `platforms.json`. */
    requirements: string;
    /** The App Store URL, from `platforms.json`, with no country segment. */
    installUrl: string;
    /** The AGPL licence URL, from `facts.json`. */
    licenseUrl: string;
    /** ISO 4217, for the free offer. */
    currency: string;
    description?: string;
    /** Only from a live source (the App Store lookup); omitted otherwise. */
    version?: string | null;
    /** Feature names from data, never a count. */
    featureList?: readonly string[];
}

/** The iPhone and iPad app, `#ios-app`: free, with no in-app purchases, and no rating. */
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

/**
 * The breadcrumb trail of a page, matching its visible breadcrumbs. Names come
 * from `seo.breadcrumbs` and the page's content; paths are same-locale.
 */
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
    /** The page's own canonical URL. */
    url: string;
    name: string;
    description?: string;
    /** What the page is about, by `@id`: `macAppId()` on feature, database and compare pages. */
    about?: string;
    /** The page's `breadcrumbNode()` id, when it has one. */
    breadcrumb?: string;
}

/** A page of its own, in the page's language, part of the one site. Feature, database, compare, FAQ and legal pages. */
export function webPageNode(context: PageContext, input: WebPageInput, type: 'WebPage' | 'CollectionPage' = 'WebPage'): JsonLdNode {
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

/** A hub or index: a `CollectionPage` whose main entity lists its same-locale pages. */
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
    /** The original publication date, ISO 8601. */
    datePublished: string;
    /** Only after a real change to the content. */
    dateModified?: string | null;
    /** The post's card URL, when it has one. */
    image?: string | null;
}

/** A blog post, written and published by the organization rather than an invented person. */
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

/**
 * The page's nodes as one document. Falsy entries are dropped, so a page can
 * write `graph([org, onPricing && offers])`.
 */
export function graph(nodes: readonly (JsonLdNode | null | undefined | false)[]): JsonLdGraph {
    return {
        '@context': SCHEMA_ORG,
        '@graph': nodes.filter((node): node is JsonLdNode => Boolean(node)),
    };
}

/**
 * A standalone breadcrumb document, for `SEOHead`'s `breadcrumbs` prop.
 *
 * @deprecated New pages put `breadcrumbNode()` in their `graph()` instead.
 */
export function buildBreadcrumbJsonLd(crumbs: readonly Crumb[], baseUrl: string): object {
    return {
        '@context': SCHEMA_ORG,
        '@type': 'BreadcrumbList',
        itemListElement: crumbs.map((crumb, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: crumb.name,
            item: absoluteUrl(baseUrl, crumb.path),
        })),
    };
}
