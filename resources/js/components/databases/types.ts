/**
 * The props `App\Http\Controllers\Landing\DatabaseController` sends, and the
 * shape of the database pages' copy. README.md in this folder documents the
 * content schema; `tests/Feature/Databases/DatabasePagesTest.php` validates
 * every content file against it, so these types and the files cannot drift.
 */
import type { Requirements } from '@/lib/data/platforms';

/** The hub file: its own copy plus the `labels` every engine page shares. */
export type HubContent = typeof import('@data/content/en/databases/index.json');

export type DatabaseLabels = HubContent['labels'];

export type EngineCategory = keyof HubContent['categories'];

/** The body sections an engine page may have, in the order they render (sitemap §E.1). */
export const SECTION_IDS = ['connect', 'work', 'schema', 'operate', 'move-data', 'iphone'] as const;

export type SectionId = (typeof SECTION_IDS)[number];

export interface EngineSection {
    id: SectionId;
    title: string;
    /** Rich text: `<ui>`, `<code>` and the page's link tags. `{token}` slots are filled from data. */
    paragraphs: string[];
    /** An optional list after the paragraphs, for options or steps. */
    points?: string[];
    /** At most one slot per section, an id from resources/data/assets.json. */
    asset?: string;
}

/** A merged engine's section on its family page, such as `#mariadb` on `/mysql-client`. */
export interface FamilySection {
    /** The `section` engine's id; its anchor, facts and limits come from engines.json. */
    engine: string;
    title: string;
    paragraphs: string[];
    points?: string[];
}

export interface OtherToolsContent {
    /**
     * Each tool's own paragraph. Version, date, licence, price and platforms
     * come from comparisons.json. `notes` lists the ids of `notes` sentences
     * that follow the paragraph. `anchor` gives the tool's block an id that a
     * redirect or a link aims at (`/mongodb-client#compass`).
     */
    items: { product: string; text: string; notes?: string[]; anchor?: string }[];
    /** Sentences for the comparison notes of cited-only tools, keyed by note id. */
    notes: Record<string, string>;
}

export interface FaqEntry {
    /** Locale-neutral, so `/mysql-client#socket` lands in both languages. */
    id: string;
    question: string;
    answer: string;
}

export interface RelatedLink {
    label: string;
    /** A root-relative path on this site. Docs links are added from data. */
    href: string;
}

export interface EnginePageContent {
    seo: { title: string; description: string };
    og: { kicker: string; title: string };
    /** The page's engine id in engines.json. The same in every locale. */
    engine: string;
    /** The last breadcrumb, which may name the family: "MySQL and MariaDB". */
    breadcrumb: string;
    /** `title` may hold `{devices}`: the devices this engine opens on, from data. */
    header: { title: string; lead: string };
    /** The lead slot, engine-specific (sitemap §A.3 Slots column). */
    asset: string;
    /**
     * Link tags for rich text: `<network>SSH tunnel</network>` renders the
     * `network` entry. A value is a root-relative path (`/features/connections#network`),
     * a same-page fragment (`#mariadb`) or a docs path (`docs:/databases/mysql`).
     */
    links: Record<string, string>;
    sections: EngineSection[];
    family: FamilySection[];
    otherTools: OtherToolsContent | null;
    faq: FaqEntry[];
    related: RelatedLink[];
}

export interface EngineCapabilities {
    ssh: boolean;
    ssl: boolean;
    import: boolean;
    export: boolean;
    schemaEditing: 'full' | 'partial' | 'read-only';
    explain: string[];
    explainView: 'diagram' | 'text' | 'cost' | null;
    dashboard: boolean;
    usersRoles: boolean;
    awsIam: boolean;
    /** Any AWS IAM sign-in mode, RDS IAM included; the facts card shows "AWS IAM" from this. */
    awsSignIn: boolean;
    cloudSqlProxy: boolean;
    /** The backup tool's display name, or null. */
    nativeDump: string | null;
    readOnlyMode: boolean;
    alwaysReadOnly: boolean;
}

/** What the hub and every page know about an engine. */
export interface EngineSummary {
    id: string;
    name: string;
    page: 'own' | 'section' | 'hub';
    /** Where the site describes it, locale-neutral: `/mysql-client`, `/mysql-client#mariadb`, `/databases#spanner`. */
    path: string;
    anchor: string | null;
    category: EngineCategory;
    featured: boolean;
    distribution: 'bundled' | 'registry';
    /** `0.77` while some channel still serves a Mac build without this engine; else null. */
    release: string | null;
    queryLanguage: string;
    icon: string | null;
    monogram: string;
    /** The docs page, its own or its driver sibling's. */
    docsSlug: string | null;
    ios: { inPicker: boolean; openable: boolean };
    limits: { id: string; value: number | null }[];
}

/** An engine page's own engine and its family sections: the summary plus what the page renders. */
export interface EngineDetail extends EngineSummary {
    defaultPort: number | null;
    connectionMode: 'network' | 'file' | 'api';
    bundledVersion: string | null;
    versionFloor: { text: string; enforced: boolean } | null;
    capabilities: EngineCapabilities;
    /** File formats by name, from facts.json. */
    formats: { import: string[]; export: string[] };
    /** The other engines on the same driver. */
    sharedWith: string[];
}

export interface EngineCopy {
    tagline: string;
    limits: Record<string, string>;
}

export interface CitedTool {
    id: string;
    name: string;
    /** `/compare/{slug}` when the tool has a comparison page. */
    comparePath: string | null;
    state: 'active' | 'discontinued';
    version: string | null;
    /** Formatted on the server in the page's locale. */
    released: string | null;
    platforms: string[];
    licence: { name: string | null; openSource: boolean };
    free: boolean;
    checked: string | null;
    sources: { title: string; url: string }[];
}

export interface PlatformSummary {
    deviceNames: string[];
    requirements: Requirements;
}

export interface DatabaseLinks {
    /** docs.tablepro.app, with no trailing slash. */
    docs: string | null;
    /** The GitHub feature request form. */
    request: string | null;
    appStore: string | null;
}

export interface EnginePageProps {
    slug: string;
    content: EnginePageContent;
    labels: DatabaseLabels;
    engine: EngineDetail;
    family: EngineDetail[];
    copy: Record<string, EngineCopy>;
    tools: CitedTool[];
    platforms: { mac: PlatformSummary | null; ios: PlatformSummary | null };
    links: DatabaseLinks;
}

export interface HubPageProps {
    content: HubContent;
    engines: EngineSummary[];
    copy: Record<string, EngineCopy>;
    /** Engine ids in the iPhone and iPad app's picker, in its order. */
    iosEngines: string[];
    platforms: { mac: PlatformSummary | null; ios: PlatformSummary | null };
    links: DatabaseLinks;
}
