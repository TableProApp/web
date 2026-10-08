/**
 * The feature pages' props and the shape of their content files.
 *
 * `App\Http\Controllers\FeatureController` sends these props.
 * README.md in this directory documents the content schema for authors, and
 * `tests/Feature/Features/FeatureContentTest.php` validates every file in
 * `resources/data/content/{locale}/features/` against it, so the page can
 * trust the shape without checking it at runtime.
 */

/** One published engine in a list the page shows, from `engines.json`. */
export interface EngineItem {
    name: string;
    /** Its page, family section or `/databases` row, as a root-relative English path; null when none describes it (`EnginePaths`). */
    href: string | null;
    /** The query language or dump tool, when the list carries one. */
    detail: string | null;
    /** The app version that added it, only while some channel still serves an older one. */
    since: string | null;
}

/**
 * A fact the copy quotes, computed on the server by
 * `App\Support\Features\FeatureFacts` from the data files.
 */
export type FactValue =
    | { kind: 'number'; value: number }
    | { kind: 'text'; value: string }
    | { kind: 'names'; items: string[] }
    | { kind: 'engines'; items: EngineItem[] };

export type Facts = Record<string, FactValue>;

/** A link: `href` for a page on this site (root-relative, English form), or `docs` for a docs.tablepro.app path. */
export interface FeatureLink {
    label: string;
    href?: string;
    docs?: string;
}

/** A linked engine list from `facts`, shown as a labelled row. */
export interface EngineListRef {
    label: string;
    /** The name of an `engines` fact, such as `explainDiagram`. */
    list: string;
}

/** A section, or a sub-block inside one (an H3). At most one slot each. */
export interface FeatureBlock {
    /** Optional on a block; a section's id is required and fixed by the sitemap. */
    id?: string;
    title: string;
    paragraphs: string[];
    points?: string[];
    /** The `paid-features.json` ids this block describes. Each one shows its plan. */
    paid?: string[];
    /** The app version that added what the block describes; labelled while an older one is still served. */
    since?: string | null;
    /** An `assets.json` id. */
    asset?: string;
    engines?: EngineListRef[];
    links?: FeatureLink[];
}

export interface FeatureSection extends FeatureBlock {
    id: string;
    blocks?: FeatureBlock[];
}

export type IosAvailability = 'yes' | 'no' | 'partial';

/** A row of "Where it works": one capability, its plan on the Mac and its state on iPhone and iPad. */
export interface AvailabilityRow {
    label: string;
    /** The `paid-features.json` id when the capability needs a plan on the Mac. */
    paid?: string;
    /** Defaults to `yes`. */
    mac?: 'yes' | 'no';
    ios: IosAvailability;
    /** Required when `ios` is `partial`: what exists there. */
    iosNote?: string;
}

export interface FeaturePageContent {
    seo: { title: string; description: string; indexable?: boolean };
    og: { kicker: string; title: string };
    header: {
        title: string;
        lead: string;
        /** The docs path the header's "Read the docs" opens. */
        docs: string;
    };
    sections: FeatureSection[];
    availability: AvailabilityRow[];
    limits: string[];
    docs: FeatureLink[];
    related: FeatureLink[];
}

/** The words every feature page shares: the hub file's `labels` block. */
export interface FeatureLabels {
    number: { decimal: string; group: string };
    tiers: { free: string; starter: string; team: string };
    /** A paid feature's marker where it is described: `{name}`, `{tier}`. */
    paidBadge: string;
    header: {
        /** `{features}`: the page's paid features, each written with `paidItem`. */
        paid: string;
        /** `{name}`, `{tier}`. */
        paidItem: string;
        allFree: string;
        docs: string;
    };
    sections: {
        availability: string;
        limits: string;
        docs: string;
        related: string;
    };
    availability: {
        caption: string;
        capability: string;
        free: string;
        notAvailable: string;
        /** `{tier}`. */
        plan: string;
    };
    download: {
        title: string;
        body: string;
        pricing: string;
    };
}

export interface FeatureHubContent {
    seo: { title: string; description: string; indexable?: boolean };
    og: { kicker: string; title: string };
    header: { title: string; lead: string };
    areas: {
        title: string;
        /** `{tier}`, `{features}`. */
        paid: string;
        noPaid: string;
        items: { slug: string; summary: string }[];
    };
    ios: { title: string; body: string; link: string };
    paid: {
        title: string;
        lead: string;
        caption: string;
        columns: { feature: string; plan: string; page: string };
        pricing: string;
    };
    docs: { title: string; body: string; link: string; path: string };
    labels: FeatureLabels;
}

export interface FeaturePageProps {
    slug: string;
    content: FeaturePageContent;
    labels: FeatureLabels;
    facts: Facts;
}

export interface FeatureHubProps {
    content: FeatureHubContent;
    /** The feature slugs that render in this locale, in the menu's order. */
    pages: string[];
    facts: Facts;
}
