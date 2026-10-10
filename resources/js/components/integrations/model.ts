import type { AppPlatform, Category, IntegrationFilters, IntegrationSummary, Tier } from './types.ts';

export const TIERS: readonly Tier[] = ['official', 'partner', 'community'];

export const PLATFORMS: readonly AppPlatform[] = ['mac', 'ios'];

export const NO_FILTERS: IntegrationFilters = { q: null, category: null, platform: null, tier: null };

const FILTER_KEYS = ['q', 'category', 'platform', 'tier'] as const;

export interface FacetOptions {
    categories: Category[];
    platforms: AppPlatform[];
    tiers: Tier[];
}

// NFKD leaves "đ" whole, so it is folded by hand.
export function fold(text: string): string {
    return text.normalize('NFKD').replace(/\p{M}/gu, '').toLowerCase().replace(/đ/g, 'd');
}

export function filterIntegrations(entries: readonly IntegrationSummary[], filters: IntegrationFilters, categoryLabels: Record<Category, string>): IntegrationSummary[] {
    const terms = fold(filters.q ?? '')
        .split(/\s+/)
        .filter((term) => term !== '');

    return entries.filter((entry) => {
        if (filters.category !== null && !entry.categories.includes(filters.category)) {
            return false;
        }

        if (filters.platform !== null && !entry.platforms.includes(filters.platform)) {
            return false;
        }

        if (filters.tier !== null && entry.tier !== filters.tier) {
            return false;
        }

        const text = fold([entry.name, entry.publisher, entry.tagline, ...entry.categories.map((category) => categoryLabels[category]), ...entry.keywords].join('\n'));

        return terms.every((term) => text.includes(term));
    });
}

export function facetOptions(entries: readonly IntegrationSummary[], categoryLabels: Record<Category, string>): FacetOptions {
    return {
        categories: (Object.keys(categoryLabels) as Category[]).filter((category) => entries.some((entry) => entry.categories.includes(category))),
        platforms: PLATFORMS.filter((platform) => entries.some((entry) => entry.platforms.includes(platform))),
        tiers: TIERS.filter((tier) => entries.some((entry) => entry.tier === tier)),
    };
}

export function filtersToSearch(filters: IntegrationFilters): string {
    const params = new URLSearchParams();

    for (const key of FILTER_KEYS) {
        const value = filters[key]?.trim();

        if (value) {
            params.set(key, value);
        }
    }

    const search = params.toString();

    return search === '' ? '' : `?${search}`;
}

export function relFor(tier: Tier): string | undefined {
    return tier === 'community' ? 'ugc nofollow' : undefined;
}

export function reportUrl(registry: string, slug: string): string {
    return `${registry}/issues/new?template=report-integration.yml&slug=${encodeURIComponent(slug)}`;
}
