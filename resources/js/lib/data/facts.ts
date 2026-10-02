/**
 * resources/data/facts.json, typed: the product facts that repeat across the
 * site and must agree everywhere.
 *
 * Names, not counts. A number the UI shows is a list's length or a `limits`
 * value, never a literal in copy. External URLs live here (and in the other
 * data files), never in components or content: content joins docs paths to
 * `links.docs` with `docsUrl()`.
 */
import data from '@data/facts.json';
import type { PlatformId } from './platforms.ts';

export interface SafeModeLevel {
    /** The app's raw value. */
    id: string;
    /** The app's label, never translated. */
    name: string;
}

export interface ExportFormat {
    id: string;
    name: string;
    /** Engine ids it is limited to, or null for every engine. */
    engines: string[] | null;
    /** Engine ids it is not offered for. */
    exceptEngines: string[];
    /** `plugin` when it installs from the registry on first use. */
    via: 'plugin' | null;
}

export interface BackupTool {
    id: string;
    name: string;
    engines: string[];
    /** True when the user installs the command-line tool; false when the app does it itself. */
    external: boolean;
}

export interface SyncCategory {
    id: string;
    defaultOn: boolean;
    sinceAppVersion: string | null;
}

export interface Limit {
    value: number;
    max: number | null;
    unit: string;
    platform: PlatformId;
    evidence: string;
}

export interface FactsData {
    verifiedAt: string;
    links: {
        github: string;
        issues: string;
        license: string;
        appStore: string;
        sponsorsProgram: string;
        discord: string;
        x: string;
        facebook: string;
        telegram: string;
        docs: string;
        changelog: string;
        raycast: string;
    };
    support: { email: string };
    openSource: { license: string };
    ai: { platforms: PlatformId[]; providers: string[]; evidence: string };
    mcp: {
        platforms: PlatformId[];
        host: string;
        defaultPort: number;
        enabledByDefault: boolean;
        /** Ids of the tool groups; their names are copy. */
        toolGroups: string[];
        clients: { setupSheet: string[]; bridge: string[] };
        evidence: string;
    };
    safeMode: {
        mac: { levels: SafeModeLevel[]; default: string; evidence: string };
        ios: { levels: SafeModeLevel[]; default: string; evidence: string };
    };
    filterOperators: { mac: string[]; ios: string[]; evidence: string };
    /** Apps whose connections TablePro imports. `id` matches a `comparisons.json` product where one exists. */
    connectionImport: { id: string; app: string; passwords: boolean; format: string | null }[];
    dataImport: { formats: { id: string; name: string }[]; evidence: string };
    export: { formats: ExportFormat[]; evidence: string };
    backup: { tools: BackupTool[]; serverSideExport: string[]; evidence: string };
    sync: {
        mac: { categories: SyncCategory[]; enabledByDefault: boolean; evidence: string };
        ios: { categories: SyncCategory[]; enabledByDefault: boolean; evidence: string };
        /** Ids of what never leaves the device. */
        neverSynced: string[];
    };
    limits: Record<string, Limit>;
}

/**
 * The single cast from the JSON import, whose string unions TypeScript widens
 * to `string`. `tests/Feature/Data/FactsDataTest.php` validates the file.
 */
export const FACTS = data as FactsData;

/** `docsUrl('/features/mcp')` → `https://docs.tablepro.app/features/mcp`. */
export function docsUrl(path = ''): string {
    if (path === '') {
        return FACTS.links.docs;
    }

    return `${FACTS.links.docs.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
}

export function limit(id: string): Limit {
    const found = FACTS.limits[id];

    if (!found) {
        throw new Error(`resources/data/facts.json has no limit "${id}".`);
    }

    return found;
}

export function backupTool(id: string): BackupTool | null {
    return FACTS.backup.tools.find((tool) => tool.id === id) ?? null;
}

/** Whether TablePro imports connections from a product, and with which details. */
export function connectionImportFor(productId: string): FactsData['connectionImport'][number] | null {
    return FACTS.connectionImport.find((entry) => entry.id === productId) ?? null;
}
