import { interpolate } from '@/i18n/core';
import { formatNumber, type NumberStyle } from '@/i18n/format';
import type { PlatformStrings } from '@/lib/data/platforms';
import type { Requirements } from './types';

/**
 * A platform's requirement from the server's `platforms.json` props, through
 * the `platforms` catalog's templates: "macOS 13 Ventura or later", "iOS and
 * iPadOS 18 trở lên". The same rule as `requirementText()` in
 * lib/data/platforms.ts, which takes a whole platform from the bundled file;
 * the download page reads its facts from the server instead, so the page and
 * its tests see the same `platforms.json`.
 */
export function requirementLine(requirements: Requirements, strings: Pick<PlatformStrings, 'requirement' | 'systemsJoiner'>): string {
    const { systems, displayVersion, releaseName } = requirements;
    const template = releaseName === null ? strings.requirement.unnamed : strings.requirement.named;

    return interpolate(template, {
        systems: systems.join(strings.systemsJoiner),
        version: displayVersion,
        releaseName: releaseName ?? '',
    });
}

/**
 * A file size in decimal megabytes with one decimal, the way Finder counts:
 * 22,943,352 bytes is "22.9" in English and "22,9" in Vietnamese. Deterministic,
 * so the server and the browser render the same string.
 */
export function megabytes(bytes: number, style: NumberStyle): string {
    return formatNumber(bytes / 1_000_000, style, 1);
}
