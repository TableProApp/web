/**
 * The compare pages' props and copy (schema documented in ./README.md).
 *
 * `App\Http\Controllers\Landing\CompareController` sends these. Facts about
 * other products arrive as their `resources/data/comparisons.json` entry;
 * TablePro's own column is never stored there and is derived on the page from
 * pricing, platforms, paid features and facts (./model.ts).
 */
import type { ComparisonProduct } from '@/lib/data/comparisons';

/**
 * The template's labels, shared by the hub and every comparison. They live in
 * `content/{locale}/compare/index.json` → `labels`, so they are scanned by
 * every content guard and keep the same keys in both languages.
 */
export type CompareLabels = (typeof import('@data/content/en/compare/index.json'))['labels'];

export type CompareHubContent = typeof import('@data/content/en/compare/index.json');

/** `{one, other}`: a plural node in content, as `plural()` takes it. */
export interface ContentPlural {
    one: string;
    other: string;
}

/**
 * One sentence in a list section (`stronger`, `differs`, `limits`).
 *
 * - `cite`: facts in the product's data the sentence rests on (`platforms`,
 *   `licence`, `status`, `mac`, `technology`, `prices`, `cells.{key}`); each
 *   becomes a source marker.
 * - `feature`: a `paid-features.json` id. Shows its plan as a badge, and is
 *   the `<link>` target when `href` is null.
 * - `href`: a root-relative path for the `<link>…</link>` in `text`.
 */
export interface CompareItem {
    text: string;
    cite: string[];
    feature: string | null;
    href: string | null;
}

export interface CompareList {
    /** A paragraph above the list, or an empty string. */
    intro: string;
    items: CompareItem[];
}

export interface CompareFaq {
    /** Stable and locale-neutral: `/compare/tableplus#speed`. */
    id: string;
    question: string;
    answer: string;
    /** The target of a `<link>…</link>` in `answer`. */
    href: string | null;
}

/** One product-specific fact row: a cell key in the product's data that is not a standard row. */
export interface CompareExtraRow {
    label: string;
    /** TablePro's side of the row, in words. */
    tablepro: string;
}

/** `content/{locale}/compare/{slug}.json`. */
export interface ComparePageContent {
    seo: { title: string; description: string; indexable?: boolean };
    og: { kicker: string; title: string };
    header: { title: string; lead: string };
    shortAnswer: {
        tablepro: string[];
        competitor: string[];
        /** Replaces "Choose {name} if" where that heading would mislead (Sequel Pro: "Choose Sequel Ace if"). */
        competitorTitle?: string;
    };
    glance: { intro: string };
    rows: Record<string, CompareExtraRow>;
    stronger: CompareList;
    differs: CompareList;
    limits: CompareList;
    switching: {
        intro: string;
        /** Verified importer steps; empty when TablePro has no importer for the product. */
        steps: string[];
        after: string[];
        /** A docs.tablepro.app path, or null. */
        docs: string | null;
    };
    faq: CompareFaq[];
    /** The text behind every `note` id in the product's data, keyed by that id. */
    notes: Record<string, string>;
}

/** TablePro facts the server reads for the page, so the bundle does not carry engines.json. */
export interface TableProProp {
    /** Featured, published engines in data order: the `{engines} and more` cell. */
    featuredEngines: string[];
    mac: { version: string; date: string } | null;
    ios: { version: string; date: string } | null;
}

/** ISO date (`2026-10-02`) → the same date formatted in PHP for the page's locale. */
export type DateLabels = Record<string, string>;

export interface ComparePageProps {
    slug: string;
    content: ComparePageContent;
    labels: CompareLabels;
    product: ComparisonProduct;
    /** `comparisons.json` → `rows`: the order of the "At a glance" rows. */
    rows: string[];
    dates: DateLabels;
    tablepro: TableProProp;
}

/** A compared product on the hub: its data entry without the per-page cells. */
export type HubProduct = Omit<ComparisonProduct, 'cells'>;

export interface CompareHubProps {
    content: CompareHubContent;
    products: HubProduct[];
    /** For each slug, the text of its free tier's note, when that page's copy exists. */
    freeNotes: Record<string, string | null>;
    checkedAt: string;
    dates: DateLabels;
    tablepro: TableProProp;
}
