/**
 * resources/data/comparisons.json, typed: dated, sourced facts about other
 * database tools.
 *
 * Every competitor price, date, platform, licence and capability is typed
 * once, here, with the source it came from. The prose (short answer,
 * strengths, switching, FAQ, and the text behind each `note` id) lives in
 * `content/{locale}/compare/{slug}.json`. TablePro's own column is never
 * stored here: it is derived from pricing, platforms, engines and facts.
 *
 * A row with no verified fact for a product has no cell, and the page leaves
 * it out for that product rather than guessing. There are no benchmarks.
 */
import data from '@data/comparisons.json';

export type ComparisonPlatform = 'mac' | 'windows' | 'linux' | 'ios' | 'web';

/** `yes` supported · `no` not supported · `qualified` a paid tier, partial support or one edition. */
export type CellState = 'yes' | 'no' | 'qualified';

export interface ComparisonCell {
    state: CellState;
    /** The edition the fact applies to, a proper noun (`Professional`). */
    edition?: string;
    /**
     * Key of the explanation in the citing page's content file → `notes`:
     * `content/{locale}/compare/{slug}.json` for a compared product, the
     * engine page's file for a product cited only there.
     */
    note?: string;
    /** A sourced number the note's sentence carries as `{value}`. */
    value?: number;
    /** The version that introduced it. */
    version?: string;
    /** `YYYY-MM-DD`. */
    date?: string;
    source: string;
}

export interface ComparisonPrice {
    /** A proper edition name, or null when the product has one paid offer or this is its free tier. */
    edition: string | null;
    /** Who the price is for, when the vendor prices by audience rather than by edition. */
    audience?: 'individual' | 'organization' | 'personal' | 'commercial' | 'student' | 'non-commercial';
    amount: number;
    currency: 'USD';
    per: 'device' | 'user' | 'seat' | 'license' | null;
    period: 'once' | 'month' | 'year' | null;
    /** Devices one license covers. */
    units?: number;
    /** The smallest number of seats sold. */
    minUnits?: number;
    /** A renewal of updates rather than a purchase. */
    kind?: 'renewal';
    /** Only for that platform's app (`ios`). */
    platform?: ComparisonPlatform;
    /** Only through that store. */
    channel?: 'mac-app-store';
    /** Which year of continuous subscription the price applies to (3 means the third and later). */
    continuityYear?: number;
    note?: string;
    source: string;
}

export interface ComparisonSource {
    id: string;
    url: string;
    title: string;
    retrievedAt: string;
}

export interface ComparisonProduct {
    id: string;
    name: string;
    /** Its `/compare/{slug}` page, or null for a product only cited elsewhere (engine pages, the hub). */
    slug: string | null;
    checkedAt: string;
    status: {
        state: 'active' | 'discontinued';
        lastRelease: { version: string; date: string; source: string };
    };
    /** Verified platforms; empty when none were verified, in which case the page names none. */
    platforms: ComparisonPlatform[];
    platformsSource: string | null;
    mac: { minVersion: string | null; architectures: ('arm64' | 'x86_64')[]; source: string } | null;
    technology: { name: string; note: string | null; source: string } | null;
    licence: { name: string | null; openSource: boolean; edition: string | null; source: string };
    prices: ComparisonPrice[];
    /** Keyed by row id (`ai`, `mcp`, …), plus product-specific facts (`diagram`, `vim`, …). */
    cells: Record<string, ComparisonCell>;
    sources: ComparisonSource[];
}

export interface ComparisonsData {
    /** The newest product `checkedAt`: the hub's "Facts checked {date}". */
    checkedAt: string;
    /** The at-a-glance rows, in order. `price`, `licence`, `platforms` and `import` read their own fields. */
    rows: string[];
    products: ComparisonProduct[];
}

/**
 * The single cast from the JSON import, whose string unions TypeScript widens
 * to `string`. It goes through `unknown` because TypeScript infers each
 * product's `cells` as a union of differently keyed objects, which it will not
 * compare with a record. `tests/Feature/Data/ComparisonsDataTest.php`
 * validates the file against these types.
 */
export const COMPARISONS = data as unknown as ComparisonsData;

export function comparisonProduct(id: string): ComparisonProduct {
    const found = COMPARISONS.products.find((product) => product.id === id);

    if (!found) {
        throw new Error(`resources/data/comparisons.json has no product "${id}".`);
    }

    return found;
}

/** The products with a `/compare/{slug}` page, in data order. */
export function comparedProducts(): ComparisonProduct[] {
    return COMPARISONS.products.filter((product) => product.slug !== null);
}

export function productBySlug(slug: string): ComparisonProduct | null {
    return COMPARISONS.products.find((product) => product.slug === slug) ?? null;
}

/** The source a fact cites, for its footnote. */
export function sourceOf(product: ComparisonProduct, id: string): ComparisonSource {
    const found = product.sources.find((source) => source.id === id);

    if (!found) {
        throw new Error(`${product.id} cites a source "${id}" it does not list.`);
    }

    return found;
}

export function cellOf(product: ComparisonProduct, key: string): ComparisonCell | null {
    return product.cells[key] ?? null;
}

/** Whether the product can be used without paying, from its prices. */
export function hasFreeTier(product: ComparisonProduct): boolean {
    return product.prices.some((price) => price.amount === 0);
}

/**
 * Open-source products with a comparison page, for the hub's `#open-source`
 * table. Products cited only on engine pages (pgAdmin, Adminer, …) stay out:
 * the hub compares clients a Mac user would choose instead of TablePro.
 */
export function openSourceProducts(): ComparisonProduct[] {
    return comparedProducts().filter((product) => product.licence.openSource);
}

/** Products the engine pages cite in their "Other tools" paragraph, which have no comparison page. */
export function citedOnlyProducts(): ComparisonProduct[] {
    return COMPARISONS.products.filter((product) => product.slug === null);
}
