/**
 * resources/data/engines.json, typed: every engine the Mac app's picker
 * offers, with where the site describes it and what it can do.
 *
 * Counts are derived from this list, never typed into copy. Feature pages ask
 * the capability fields which engines to name (the EXPLAIN engines, the
 * dashboard engines, the engines without import), so no page keeps a list of
 * its own. Sentences about an engine live in `content/{locale}/engines.json`
 * and the database pages; this file holds names, ids and evidence.
 */
import data from '@data/engines.json';
import { needsReleaseLabel } from './platforms.ts';

export type EnginePage = 'own' | 'section' | 'hub';

export type EngineCategory =
    | 'relational'
    | 'analytical'
    | 'cloud'
    | 'document'
    | 'key-value'
    | 'wide-column'
    | 'search'
    | 'streaming'
    | 'coordination'
    | 'files';

export type SchemaEditing = 'full' | 'partial' | 'read-only';

/** How the app draws a plan: as a diagram and tree, as raw text, or as a dry-run cost. */
export type ExplainView = 'diagram' | 'text' | 'cost';

export interface EngineCapabilities {
    /** SSH tunnels, and with them SOCKS and Tunnel Command. */
    ssh: boolean;
    /**
     * The connection form's SSL/TLS modes. False for engines reached over a
     * vendor's HTTPS API (BigQuery, D1, …), for local files, and where the
     * driver has its own TLS fields instead (etcd).
     */
    ssl: boolean;
    import: boolean;
    export: boolean;
    /** What the Structure tab can change. */
    schemaEditing: SchemaEditing;
    /** The app's EXPLAIN variant labels; empty means no EXPLAIN on this engine. */
    explain: string[];
    explainView: ExplainView | null;
    /** Server Dashboard (sessions or metrics). */
    dashboard: boolean;
    /** Users & Roles, where it is documented and verified. */
    usersRoles: boolean;
    /** AWS IAM database authentication for RDS and Aurora (not the other AWS sign-ins). */
    awsIam: boolean;
    /**
     * Any AWS IAM sign-in the connection form offers: RDS IAM, MongoDB's
     * MONGODB-AWS, ElastiCache IAM or Amazon Keyspaces SigV4. A superset of
     * `awsIam`, which the "AWS IAM on RDS and Aurora" lists keep reading.
     */
    awsSignIn: boolean;
    cloudSqlProxy: boolean;
    /** A tool id from `facts.backup.tools`, or null when Backup Dump is not offered. */
    nativeDump: string | null;
    /** False: Safe Mode counts every statement as a write on this engine. */
    readOnlyMode: boolean;
    /** True: the engine never writes, whatever the connection's settings. */
    alwaysReadOnly: boolean;
}

export interface VersionFloor {
    /** As copy writes it: `9.1`, `10.x`, `2012`. */
    text: string;
    /** True only where the app refuses an older server. Otherwise the floor is documented. */
    enforced: boolean;
    evidence: string;
}

export interface EngineLimit {
    /** Key of the sentence in `content/{locale}/engines.json` → `limits`. */
    id: string;
    /** The number the sentence carries as `{value}`, when it has one. */
    value: number | null;
    evidence: string;
}

export interface EngineIos {
    /** Offered when creating a connection on iPhone or iPad. */
    inPicker: boolean;
    /** The iOS app has a driver for it. */
    openable: boolean;
    /** A connection synced from a Mac shows up in the iOS list. */
    appearsAfterSync: boolean;
}

export interface Engine {
    id: string;
    /** The app's `DatabaseType` raw value, spaces included. */
    appTypeId: string;
    name: string;
    page: EnginePage;
    /** The page's slug (`postgresql-client`) when `page` is `own`, else null. */
    slug: string | null;
    /** For a `section`: the id of the engine whose page holds it. */
    parent: string | null;
    /** For a `section` or `hub` engine: the fragment on its parent page or on `/databases`. */
    anchor: string | null;
    category: EngineCategory;
    /** In the homepage subtitle's engine list, in data order. */
    featured: boolean;
    /** In the homepage meta description (a subset of `featured`). */
    meta: boolean;
    distribution: 'bundled' | 'registry';
    driverPlugin: string;
    sinceAppVersion: string;
    /** The registry entry's minimum app version; null for bundled drivers. */
    minAppVersion: string | null;
    state: 'published' | 'head_only';
    /** The editor's language name as the app shows it. */
    queryLanguage: string;
    defaultPort: number | null;
    /** `api`: the app reaches a service's API and the form has no host or port (`ConnectionMode.apiOnly` in the app). */
    connectionMode: 'network' | 'file' | 'api';
    icon: string | null;
    monogram: string;
    /** `docs.tablepro.app/databases/{docsSlug}`; null when another engine's docs page covers this one. */
    docsSlug: string | null;
    capabilities: EngineCapabilities;
    versionFloor: VersionFloor | null;
    /** The engine library the app embeds (SQLite, DuckDB). */
    bundledVersion: string | null;
    limits: EngineLimit[];
    ios: EngineIos;
    verified: { macTag: string; iosCommit: string; date: string };
}

/**
 * The single cast from the JSON import, whose string unions TypeScript widens
 * to `string`. `tests/Feature/Data/EnginesDataTest.php` validates the file
 * against these types.
 */
export const ENGINES = data as Engine[];

const BY_ID = new Map(ENGINES.map((entry) => [entry.id, entry]));

export function engine(id: string): Engine {
    const found = BY_ID.get(id);

    if (!found) {
        throw new Error(`resources/data/engines.json has no engine "${id}".`);
    }

    return found;
}

export function publishedEngines(): Engine[] {
    return ENGINES.filter((entry) => entry.state === 'published');
}

/** PostgreSQL, MySQL, SQL Server, SQLite, MongoDB, Redis: `{featuredEngines}` in data order. */
export function featuredEngines(): Engine[] {
    return publishedEngines().filter((entry) => entry.featured);
}

/** The engines the homepage meta description names. */
export function metaEngines(): Engine[] {
    return featuredEngines().filter((entry) => entry.meta);
}

export function ownPageEngines(): Engine[] {
    return publishedEngines().filter((entry) => entry.page === 'own');
}

/** The engines described as sections of `parentId`'s page, in data order. */
export function sectionsOf(parentId: string): Engine[] {
    return publishedEngines().filter((entry) => entry.page === 'section' && entry.parent === parentId);
}

export function enginesInCategory(category: EngineCategory): Engine[] {
    return publishedEngines().filter((entry) => entry.category === category);
}

/** Published engines for which `test` holds, in data order. */
export function enginesWhere(test: (capabilities: EngineCapabilities, entry: Engine) => boolean): Engine[] {
    return publishedEngines().filter((entry) => test(entry.capabilities, entry));
}

/** Engines with EXPLAIN, optionally only those drawn a given way. */
export function explainEngines(view?: ExplainView): Engine[] {
    return enginesWhere(
        (capabilities) => capabilities.explain.length > 0 && (view === undefined || capabilities.explainView === view),
    );
}

/** Engines offered in the iOS picker, in the picker's order (`platforms.ios.iosEngines`). */
export function iosPickerEngines(order: string[]): Engine[] {
    return order.map((id) => engine(id));
}

/** Engines iOS opens only when the connection arrives from a Mac. */
export function iosSyncedOnlyEngines(): Engine[] {
    return publishedEngines().filter((entry) => entry.ios.openable && !entry.ios.inPicker);
}

/** Derived counts. The UI never types these. */
export function engineCounts(): { published: number; bundled: number; registry: number } {
    const published = publishedEngines();

    return {
        published: published.length,
        bundled: published.filter((entry) => entry.distribution === 'bundled').length,
        registry: published.filter((entry) => entry.distribution === 'registry').length,
    };
}

/** Whether the engine needs a version label because some channel still serves an older app. */
export function engineNeedsReleaseLabel(entry: Engine): boolean {
    return needsReleaseLabel(entry.sinceAppVersion);
}

/**
 * Where the site describes the engine, as a locale-neutral path for
 * `localePath()`: its own page, a section of its family page, or its row on
 * `/databases`.
 */
export function enginePath(entry: Engine): string {
    if (entry.page === 'own') {
        return `/${entry.slug}`;
    }

    if (entry.page === 'section') {
        return `/${engine(entry.parent ?? '').slug}#${entry.anchor}`;
    }

    return `/databases#${entry.anchor}`;
}

/**
 * The docs page for an engine. ScyllaDB and Turso have none of their own:
 * the page of the engine they share a driver with covers them.
 */
export function docsSlugFor(entry: Engine): string | null {
    if (entry.docsSlug !== null) {
        return entry.docsSlug;
    }

    const sibling = ENGINES.find(
        (other) => other.driverPlugin === entry.driverPlugin && other.docsSlug !== null && other.id !== entry.id,
    );

    return sibling?.docsSlug ?? null;
}
