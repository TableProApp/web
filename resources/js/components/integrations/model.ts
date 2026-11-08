import type { Category, IntegrationSummary, Tier } from './types.ts';

export const TIERS: readonly Tier[] = ['official', 'partner', 'community'];

export interface IntegrationGroup {
    category: Category;
    integrations: IntegrationSummary[];
}

// One band per category, in the order the sorted list first reaches it, so the band of the first entry leads.
export function groupIntegrations(entries: readonly IntegrationSummary[]): IntegrationGroup[] {
    const groups = new Map<Category, IntegrationSummary[]>();

    for (const entry of entries) {
        groups.set(entry.group, [...(groups.get(entry.group) ?? []), entry]);
    }

    return [...groups].map(([category, integrations]) => ({ category, integrations }));
}

export function relFor(tier: Tier): string | undefined {
    return tier === 'community' ? 'ugc nofollow' : undefined;
}

export function reportUrl(registry: string, slug: string): string {
    return `${registry}/issues/new?template=report-integration.yml&slug=${encodeURIComponent(slug)}`;
}
