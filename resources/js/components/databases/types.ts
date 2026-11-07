// The props DatabaseController sends and the shape of the database pages' copy (README.md).
import type { Requirements } from '@/lib/data/platforms';

// The hub file: its own copy plus the `labels` every engine page shares.
export type HubContent = typeof import('@data/content/en/databases/index.json');

export type DatabaseLabels = HubContent['labels'];

export type GroupId = keyof HubContent['groups'];

// The bands an engine page may have, in the order they render.
export const BAND_IDS = ['connect', 'work', 'schema', 'operate'] as const;

export type BandId = (typeof BAND_IDS)[number];

export interface EngineBand {
    id: BandId;
    // Ids of the sections this band absorbed, such as `operate` inside `schema`.
    also?: BandId[];
    title: string;
    // Rich text: `<ui>`, `<code>`, the page's link tags and `{tokens}`.
    text: string[];
    // A quiet line under the text: a limit that changes a decision, a hosted service.
    notes?: string[];
}

// A merged engine's band on its family page, such as `#mariadb` on `/mysql-client`. Its anchor, facts and limits
// come from engines.json.
export interface FamilyBand {
    engine: string;
    title: string;
    text: string[];
}

export interface FaqEntry {
    // Locale-neutral, so `/mysql-client#socket` lands in every language.
    id: string;
    question: string;
    answer: string;
}

export interface EnginePageContent {
    seo: { title: string; description: string };
    og: { kicker: string; title: string };
    engine: string;
    // The last breadcrumb, which may name the family: "MySQL and MariaDB".
    breadcrumb: string;
    header: { title: string; lead: string; asset: string };
    // Link tags for rich text: a root-relative path, a same-page `#fragment` or `docs:/path`.
    links: Record<string, string>;
    bands: EngineBand[];
    family: FamilyBand[];
    moveData: string[];
    // What the iPhone and iPad app does with this engine; empty where it does not open it.
    iphone: string[];
    faq: FaqEntry[];
    // One sentence linking the comparisons with the tools a reader of this page weighs, or null.
    otherTools: { text: string; also?: string[] } | null;
}

export interface EngineCapabilities {
    ssh: boolean;
    ssl: boolean;
    // Any AWS IAM sign-in mode, RDS IAM included.
    awsSignIn: boolean;
    cloudSqlProxy: boolean;
    // The backup tool's display name, or null.
    nativeDump: string | null;
}

// What the hub knows about an engine.
export interface EngineSummary {
    id: string;
    name: string;
    page: 'own' | 'section' | 'hub';
    // `/mysql-client`, `/mysql-client#mariadb`, `/databases#spanner`, or null when nothing describes it (`EnginePaths`).
    path: string | null;
    anchor: string | null;
    category: string;
    featured: boolean;
    distribution: 'bundled' | 'registry';
    // `0.77` while some channel still serves a Mac build without this engine; else null.
    release: string | null;
    queryLanguage: string;
    docsSlug: string | null;
    ios: { inPicker: boolean; openable: boolean };
    linux: 'tested' | 'untested' | 'blocked' | 'none';
}

// An engine page's own engine and its family members.
export interface EngineDetail {
    id: string;
    name: string;
    path: string | null;
    anchor: string | null;
    release: string | null;
    queryLanguage: string;
    icon: string | null;
    docsSlug: string | null;
    distribution: 'bundled' | 'registry';
    ios: { inPicker: boolean; openable: boolean };
    limits: { id: string; value: number | null }[];
    defaultPort: number | null;
    connectionMode: 'network' | 'file' | 'api';
    bundledVersion: string | null;
    // `text` is null where the docs say there is no minimum version.
    versionFloor: { text: string | null; enforced: boolean } | null;
    capabilities: EngineCapabilities;
    formats: { import: string[]; export: string[] };
    // The other engines on the same driver.
    sharedWith: string[];
}

export interface EngineCopy {
    tagline: string;
    limits: Record<string, string>;
}

export interface PlatformSummary {
    deviceNames: string[];
    requirements: Requirements;
}

export interface EnginePageProps {
    slug: string;
    content: EnginePageContent;
    labels: DatabaseLabels;
    engine: EngineDetail;
    family: EngineDetail[];
    copy: Record<string, EngineCopy>;
    // Null for an app that is not released.
    platforms: { mac: PlatformSummary | null; ios: PlatformSummary | null };
    heroSizes: string;
}

export interface HubPageProps {
    content: HubContent;
    // The hub's bands in order, each with the engines.json categories it lists.
    groups: { id: GroupId; categories: string[] }[];
    engines: EngineSummary[];
    taglines: Record<string, string>;
    // Engine ids in the iPhone and iPad app's picker, in its order.
    iosEngines: string[];
    platforms: { ios: { deviceNames: string[] } | null; linux: { deviceNames: string[] } | null };
    // The GitHub feature request form.
    request: string | null;
}
