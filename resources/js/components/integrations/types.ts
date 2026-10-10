export type IntegrationsContent = Omit<typeof import('@data/content/en/integrations/index.json'), 'taglines'>;

export type IntegrationLabels = IntegrationsContent['labels'];

export type IntegrationPageLabels = IntegrationsContent['show'];

export type Tier = keyof IntegrationLabels['tiers'];

export type Category = keyof IntegrationLabels['categories'];

export type AppPlatform = 'mac' | 'ios';

export type InstallType = keyof IntegrationPageLabels['install'];

export type Surface = keyof IntegrationPageLabels['uses']['surface'];

export type DataAccess = keyof IntegrationPageLabels['uses']['data'];

export type ArchiveReason = keyof IntegrationPageLabels['archived']['reasons'];

export interface IntegrationImage {
    src: string;
    width: number;
    height: number;
}

export interface IntegrationSummary {
    slug: string;
    name: string;
    publisher: string;
    tier: Tier;
    categories: Category[];
    platforms: AppPlatform[];
    closedSource: boolean;
    tagline: string;
    keywords: string[];
    icon: IntegrationImage | null;
}

export interface IntegrationFilters {
    q: string | null;
    category: Category | null;
    platform: AppPlatform | null;
    tier: Tier | null;
}

export interface IntegrationDetail {
    slug: string;
    name: string;
    summary: string;
    description: string[];
    tier: Tier;
    archived: { reason: ArchiveReason | null; note: string | null; replacement: { slug: string; name: string } | null } | null;
    publisher: { name: string; url: string | null };
    categories: Category[];
    platforms: AppPlatform[];
    versions: Record<AppPlatform, string | null>;
    host: { name: string; url: string | null; minVersion: string | null; note: string | null } | null;
    closedSource: boolean;
    license: string | null;
    source: string | null;
    install: { type: InstallType; url: string | null; command: string | null };
    surfaces: Surface[];
    reads: DataAccess[];
    writes: DataAccess[];
    accessNote: string | null;
    lowersSafeMode: boolean;
    safeModeNote: string | null;
    network: 'none' | 'local' | 'internet' | null;
    networkNote: string | null;
    account: boolean;
    payment: 'free' | 'optional' | 'paid' | null;
    paymentNote: string | null;
    links: { docs: string | null; issues: string | null; privacy: string | null };
    icon: IntegrationImage | null;
    screenshots: (IntegrationImage & { alt: string })[];
}

export type IntegrationsHubContent = Omit<IntegrationsContent, 'show'>;

export interface IntegrationsHubProps {
    content: IntegrationsHubContent;
    integrations: IntegrationSummary[];
    filters: IntegrationFilters;
}

export interface IntegrationPageProps {
    content: Pick<IntegrationsContent, 'labels' | 'show'>;
    integration: IntegrationDetail;
    dates: { added: string | null; verified: string | null; archived: string | null };
}
