// The content schema of `/features` and `/features/{slug}` (README.md); relative imports only, so `node --test`
// loads it through model.ts.

export interface EngineItem {
    name: string;
    href: string | null;
    detail: string | null;
    since: string | null;
}

export type FactValue =
    | { kind: 'number'; value: number }
    | { kind: 'text'; value: string }
    | { kind: 'names'; items: string[] }
    | { kind: 'engines'; items: EngineItem[] };

export type Facts = Record<string, FactValue>;

export interface FeatureLink {
    label: string;
    href?: string;
    docs?: string;
    // The account portal, in the page's language.
    account?: boolean;
}

export interface EngineListRef {
    label: string;
    list: string;
}

// A sub-feature. The main ones are bands with a full window below; the rest are items of the closing list. `also`
// holds the ids of the old sections and blocks this one replaced, so links to them still land here.
export interface FeaturePart {
    id: string;
    also?: string[];
    title: string;
    text: string[];
    paid?: string[];
    notes?: string[];
    engines?: EngineListRef[];
    docs?: string;
    links?: FeatureLink[];
}

export interface FeatureBand extends FeaturePart {
    asset?: string;
}

export interface FeaturePageContent {
    seo: { title: string; description: string; indexable?: boolean };
    og: { kicker: string; title: string };
    header: {
        title: string;
        lead: string;
        docs: string;
        asset: string;
    };
    bands: FeatureBand[];
    more: FeaturePart[];
}

export interface FeatureLabels {
    number: { decimal: string; group: string };
    tiers: { free: string; starter: string; team: string };
    docs: string;
    more: string;
    closing: {
        title: string;
        // "{tier} adds {features}."
        tier: string;
        rest: string;
        allFree: string;
        pricing: string;
    };
}

export interface FeatureHubContent {
    seo: { title: string; description: string; indexable?: boolean };
    og: { kicker: string; title: string };
    header: { title: string; lead: string };
    areas: { slug: string; summary: string }[];
    closing: { body: string; ios: string };
    labels: FeatureLabels;
}

// What the hub shows of each page: its title, its bands and its window.
export interface FeatureArea {
    slug: string;
    title: string;
    asset: string;
    bands: { id: string; title: string; paid: string[] }[];
}

export interface FeaturePageProps {
    slug: string;
    content: FeaturePageContent;
    labels: FeatureLabels;
    facts: Facts;
    // The hero window's `sizes`, the same string its preload (`lcpAsset`) was built with.
    heroSizes: string;
}

export interface FeatureHubProps {
    content: FeatureHubContent;
    areas: FeatureArea[];
    facts: Facts;
}
