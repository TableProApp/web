// The props DownloadController sends. The copy's shape is the English file's; TranslationsTest holds the other locales to it.
import type { PostSummary } from '@/components/blog/post-list';
import type { Requirements } from '@/lib/data/platforms';

export type { Requirements };

export type DownloadContent = typeof import('@data/content/en/download.json');

export interface ReleaseAsset {
    // Null when no release source answered.
    name: string | null;
    // GitHub's latest-release page when no release source answered.
    url: string;
    // The Sparkle appcast has no sizes or digests, only the GitHub API does.
    bytes: number | null;
    sha256: string | null;
}

export interface ReleaseProp {
    version: string | null;
    publishedAt: string | null;
    // Formatted in PHP, so SSR and the browser agree.
    publishedAtFormatted: string | null;
    asset: ReleaseAsset;
    releaseUrl: string;
    releasesUrl: string;
    source: 'github' | 'appcast' | 'unavailable';
}

export interface MacProp {
    deviceNames: string[];
    requirements: Requirements | null;
    homebrewCommand: string | null;
    // The Homebrew cask still serves an older version than this release.
    homebrewTrails: boolean;
}

export interface IosProp {
    deviceNames: string[];
    requirements: Requirements;
    appStoreUrl: string | null;
    free: boolean;
    inAppPurchases: boolean;
    version: string | null;
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
    update: string | null;
}

export interface LinuxFile {
    name: string;
    url: string;
    bytes: number | null;
}

export interface LinuxPackageRow {
    format: 'deb' | 'rpm' | 'flatpak';
    series: string | null;
    distribution: string | null;
    // Keyed by the architecture as platforms.json names it; null where the release has no such file.
    files: Record<string, LinuxFile | null>;
}

export interface LinuxProp {
    deviceNames: string[];
    channel: 'beta' | 'stable';
    distributions: LinuxDistributionProp[];
    desktop: { name: string; version: string } | null;
    architectures: string[];
    methods: LinuxMethod[];
    packages: LinuxPackageRow[];
    checksums: { name: string; url: string | null } | null;
    // `{file}` stands for the downloaded file.
    verify: string | null;
    release: { version: string; publishedOn: string | null; releaseUrl: string; releasesUrl: string } | null;
}

export interface LinksProp {
    docs: string | null;
    changelog: string | null;
    source: string | null;
    license: string | null;
    issues: string | null;
}

export type PlatformKey = 'mac' | 'ios' | 'linux';

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
    latestPost: PostSummary | null;
}
