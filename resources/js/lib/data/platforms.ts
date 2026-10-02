/**
 * resources/data/platforms.json, typed: where TablePro runs, what each build
 * needs, and where to get it.
 *
 * Only a `released` platform carries requirements, destinations and a
 * release. Linux and Windows are listed with their status and nothing else,
 * so no component can render a requirement, a button or a date for them.
 * Every phrase around these values (the "or later" sentence, "Apple silicon",
 * "Mac app") is a `platforms` catalog entry; this module joins them.
 *
 * Release labels: a feature or engine newer than `mac.floorVersion` (the
 * oldest version any channel still serves; Homebrew lags GitHub) shows a
 * version label. Bumping `floorVersion` removes every label at once.
 */
import data from '@data/platforms.json';
import { interpolate } from '../../i18n/core.ts';
import { joinList, type ListStyle } from '../../i18n/format.ts';

export type PlatformId = 'mac' | 'ios' | 'linux' | 'windows';

export type PlatformStatus = 'released' | 'prototype' | 'none';

export type MacArchitecture = 'arm64' | 'x86_64';

export interface Requirements {
    /** Apple's system names, never translated: `["iOS", "iPadOS"]`. */
    systems: string[];
    /** The exact floor, `13.0`. */
    minVersion: string;
    /** How copy writes it, `13`. */
    displayVersion: string;
    /** `Ventura`; null where Apple gives the release no name. */
    releaseName: string | null;
}

export interface Architecture {
    id: MacArchitecture;
    /** The DMG file name, with `{version}` for the release version. */
    assetTemplate: string;
}

export type Destination =
    | { kind: 'dmg'; urlTemplate: string }
    | { kind: 'homebrew'; command: string; url: string }
    | { kind: 'releases'; url: string }
    | { kind: 'app-store'; url: string; appId: string };

export type DestinationKind = Destination['kind'];

export interface Release {
    version: string;
    build: string;
    /** `YYYY-MM-DD`. Format it in PHP for anything rendered on the server. */
    publishedAt: string;
}

interface ReleasedPlatformBase {
    status: 'released';
    /** Apple product names, never translated: `["iPhone", "iPad"]`. */
    deviceNames: string[];
    /** The platform's own page (`/ios`), or null when `/download` is its page. */
    page: string | null;
    requirements: Requirements;
    destinations: Destination[];
    /** The last verified release. The download page prefers the live one. */
    release: Release;
    /** BCP 47 tags of the app's own UI languages, in the app's order. */
    appLanguages: string[];
}

export interface MacPlatform extends ReleasedPlatformBase {
    id: 'mac';
    architectures: Architecture[];
    /** Two separate builds. Never "Universal". */
    universalBinary: false;
    /** The oldest version any channel still serves. */
    floorVersion: string;
}

export interface IosPlatform extends ReleasedPlatformBase {
    id: 'ios';
    /** Engine ids offered in the iOS connection picker, in its order. Name them; never count them. */
    iosEngines: string[];
    /** Storefront codes the listing is missing from. Read by `release:check` only; never rendered. */
    storefrontExclusions: string[];
    price: { amount: number; inAppPurchases: boolean };
}

export interface UnreleasedPlatform {
    id: 'linux' | 'windows';
    status: 'prototype' | 'none';
}

export type ReleasedPlatform = MacPlatform | IosPlatform;

export type Platform = ReleasedPlatform | UnreleasedPlatform;

export interface PlatformsData {
    verifiedAt: string;
    platforms: Platform[];
}

/**
 * The single cast from the JSON import, whose string unions TypeScript widens
 * to `string`. `tests/Feature/Data/PlatformsDataTest.php` validates the file
 * against these types.
 */
export const PLATFORMS = data as PlatformsData;

/** The phrases of the `platforms` catalog namespace this module needs. */
export interface PlatformStrings {
    requirement: { named: string; unnamed: string };
    systemsJoiner: string;
    architectures: Record<MacArchitecture, string> & { joiner: string };
}

export function isReleased(platform: Platform): platform is ReleasedPlatform {
    return platform.status === 'released';
}

/** Every platform with something to install, in data order. */
export function releasedPlatforms(): ReleasedPlatform[] {
    return PLATFORMS.platforms.filter(isReleased);
}

export function macPlatform(): MacPlatform {
    return find('mac') as MacPlatform;
}

export function iosPlatform(): IosPlatform {
    return find('ios') as IosPlatform;
}

function find(id: PlatformId): Platform {
    const platform = PLATFORMS.platforms.find((entry) => entry.id === id);

    if (!platform) {
        throw new Error(`resources/data/platforms.json has no "${id}" platform.`);
    }

    return platform;
}

export function destination<K extends DestinationKind>(
    platform: ReleasedPlatform,
    kind: K,
): Extract<Destination, { kind: K }> | null {
    const found = platform.destinations.find((entry) => entry.kind === kind);

    return (found as Extract<Destination, { kind: K }> | undefined) ?? null;
}

/** The App Store listing, with no country segment so Apple routes each reader to their storefront. */
export function appStoreUrl(): string {
    return destination(iosPlatform(), 'app-store')?.url ?? '';
}

/** `macOS 13 Ventura or later`, `iOS and iPadOS 18 or later`, from the catalog's templates. */
export function requirementText(platform: ReleasedPlatform, strings: PlatformStrings): string {
    const { systems, displayVersion, releaseName } = platform.requirements;
    const values = {
        systems: systems.join(strings.systemsJoiner),
        version: displayVersion,
        releaseName: releaseName ?? '',
    };

    return interpolate(releaseName === null ? strings.requirement.unnamed : strings.requirement.named, values);
}

/** `Apple silicon or Intel`, in the Mac build order. */
export function architecturesText(strings: PlatformStrings): string {
    return joinList(
        macPlatform().architectures.map((architecture) => strings.architectures[architecture.id]),
        { separator: ', ', last: strings.architectures.joiner },
    );
}

/** `Mac, iPhone and iPad`: every released platform's devices, joined with the locale's list style. */
export function deviceList(style: ListStyle): string {
    return joinList(
        releasedPlatforms().flatMap((platform) => platform.deviceNames),
        style,
    );
}

/** One platform's devices: `iPhone and iPad`, or `iPhone & iPad` with the short list style. */
export function devicesOf(platform: ReleasedPlatform, style: ListStyle): string {
    return joinList(platform.deviceNames, style);
}

/**
 * Compares dotted versions numerically: `0.77.0` > `0.76.1`, `0.100` > `0.99`.
 * A missing part counts as zero.
 */
export function compareVersions(a: string, b: string): number {
    const left = a.split('.').map(Number);
    const right = b.split('.').map(Number);

    for (let index = 0; index < Math.max(left.length, right.length); index++) {
        const difference = (left[index] ?? 0) - (right[index] ?? 0);

        if (difference !== 0) {
            return Math.sign(difference);
        }
    }

    return 0;
}

/**
 * Whether something that first shipped in `sinceAppVersion` is missing from
 * a build some channel still serves, and so needs a version label.
 */
export function needsReleaseLabel(sinceAppVersion: string | null): boolean {
    return sinceAppVersion !== null && compareVersions(sinceAppVersion, macPlatform().floorVersion) > 0;
}

/** The label a release-dependent item shows: `0.77.0` → `0.77`. */
export function releaseLabel(sinceAppVersion: string): string {
    const [major = '0', minor = '0'] = sinceAppVersion.split('.');

    return `${major}.${minor}`;
}
