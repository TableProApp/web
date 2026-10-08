/**
 * The props `App\Http\Controllers\DownloadController` sends, and the
 * page copy's type. The copy's shape is the English file's: `ContentParityTest`
 * holds every other locale to the same keys.
 */
import type { MacArch } from '@/lib/device';
import type { Requirements } from '@/lib/data/platforms';

export type { Requirements };

export type DownloadContent = typeof import('@data/content/en/download.json');

export interface ReleaseAsset {
    /** The DMG's file name, or null when the release is unavailable. */
    name: string | null;
    /** The DMG, or GitHub's latest-release page when the release is unavailable. */
    url: string;
    /** From the GitHub API only; the appcast fallback has no sizes. */
    bytes: number | null;
    // Lowercase hex, from the GitHub API's asset digest; null from the appcast.
    sha256: string | null;
}

export interface ReleaseProp {
    version: string | null;
    publishedAt: string | null;
    /** Formatted in PHP for the page's locale, so SSR and the browser agree. */
    publishedAtFormatted: string | null;
    assets: Record<MacArch, ReleaseAsset>;
    releaseUrl: string;
    releasesUrl: string;
    source: 'github' | 'appcast' | 'unavailable';
}

export interface MacProp {
    deviceNames: string[];
    requirements: Requirements | null;
    homebrewCommand: string | null;
    /** platforms.json says Homebrew still serves an older version than this release. */
    homebrewTrails: boolean;
}

export interface IosProp {
    deviceNames: string[];
    requirements: Requirements;
    appStoreUrl: string | null;
    free: boolean;
    inAppPurchases: boolean;
}

export interface LinksProp {
    docs: string | null;
    changelog: string | null;
    source: string | null;
    /** The AGPL licence, for the structured data. */
    license: string | null;
}

export interface DownloadPageProps {
    content: DownloadContent;
    release: ReleaseProp;
    mac: MacProp;
    ios: IosProp | null;
    /** Platform ids from platforms.json with nothing to install, such as `linux`. */
    unreleased: string[];
    links: LinksProp;
    /** The featured engines' names, in data order, for the Mac app's structured-data description. */
    featuredEngines: string[];
}
