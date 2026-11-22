// The props DownloadController sends. The copy's shape is the English file's; TranslationsTest holds the other locales to it.
import type { MacArchitecture, Requirements } from '@/lib/data/platforms';

export type { MacArchitecture, Requirements };

export type DownloadContent = typeof import('@data/content/en/download.json');

export interface ReleaseAsset {
    name: string;
    url: string;
    bytes: number | null;
    sha256: string | null;
}

export interface ReleaseProp {
    version: string | null;
    // "0.85" for 0.85.0, the H1's version.
    shortVersion: string | null;
    publishedAt: string | null;
    // Formatted in PHP, so SSR and the browser agree.
    publishedAtFormatted: string | null;
    // A DMG per architecture, or `universal` alone for a release that shipped one DMG for both. Empty when no release
    // source answered, and the button opens `releaseUrl`, GitHub's latest-release page.
    assets: Partial<Record<MacArchitecture | 'universal', ReleaseAsset>>;
    releaseUrl: string;
    releasesUrl: string;
    source: 'github' | 'appcast' | 'unavailable';
}

export interface MacProp {
    deviceNames: string[];
    requirements: Requirements | null;
    homebrewCommand: string | null;
}

export interface IosProp {
    deviceNames: string[];
    requirements: Requirements;
    appStoreUrl: string | null;
    free: boolean;
    inAppPurchases: boolean;
    version: string | null;
    shortVersion: string | null;
    publishedAtFormatted: string | null;
}

export type LinuxMethodKind = 'ppa' | 'copr' | 'flatpak';

export interface LinuxDistributionProp {
    id: string;
    name: string | null;
    versions: string[];
    via: LinuxMethodKind;
}

export interface LinuxMethod {
    kind: LinuxMethodKind;
    commands: string[];
}

export interface LinuxProp {
    deviceNames: string[];
    channel: 'beta' | 'stable';
    distributions: LinuxDistributionProp[];
    architectures: string[];
    methods: LinuxMethod[];
    release: { version: string; shortVersion: string; publishedOn: string | null; releaseUrl: string; releasesUrl: string } | null;
}

// What a page outside /download says about Linux: `PlatformCatalog::linuxSummary`, null until Linux is released.
export type LinuxSummary = Pick<LinuxProp, 'deviceNames' | 'channel' | 'distributions'>;

export interface LinksProp {
    changelog: string | null;
    source: string | null;
    license: string | null;
}

// What the head script in app.blade.php calls the reader's machine; a Mac carries no class.
export type DeviceKey = 'mac' | 'linux' | 'ios' | 'other';

export interface DownloadPageProps {
    content: DownloadContent;
    release: ReleaseProp;
    mac: MacProp;
    ios: IosProp | null;
    linux: LinuxProp | null;
    // Platform ids with nothing to install.
    unreleased: string[];
    links: LinksProp;
    featuredEngines: string[];
}
