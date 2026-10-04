/**
 * The shape of resources/data/engines.json: every engine the Mac app's picker
 * offers, with where the site describes it and what it can do.
 *
 * Types only. The pages receive the engines they show as props from the
 * controllers (`App\Services\Content\SiteFacts`, `DatabaseController`), so the
 * bundle never carries the whole file; the runtime helpers that once read it
 * here had no caller left. Sentences about an engine live in
 * `content/{locale}/engines.json` and the database pages.
 */

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
