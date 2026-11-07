import type { SiteLinks } from '@/components/faq/content-links';
import type { Requirements } from '@/lib/data/platforms';

// `TranslationsTest` holds every other locale to the English file's keys.
export type IosContent = typeof import('@data/content/en/ios.json');

export type IosBandContent = IosContent['bands'][number];

export type IosItemContent = IosContent['more']['items'][number];

export interface IosEngine {
    id: string;
    name: string;
    href: string | null;
}

// The App Store release from platforms.json; null while the app is not released.
export interface IosRelease {
    requirements: Requirements | null;
    appStoreUrl: string | null;
    free: boolean;
    inAppPurchases: boolean;
}

export interface IosPageProps {
    content: IosContent;
    ios: IosRelease | null;
    engines: { picker: IosEngine[]; syncedOnly: IosEngine[] };
    safeModeLevels: string[];
    limits: { history: number | null; results: number | null };
    links: SiteLinks;
    organizationProfiles: string[];
    // The hero iPad's `sizes`, the same string its preload (`lcpAsset`) was built with.
    heroSizes: string;
}
