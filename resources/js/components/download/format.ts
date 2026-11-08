import { interpolate } from '@/i18n/core';
import type { PlatformStrings } from '@/lib/data/platforms';
import type { Requirements } from './types';

// "macOS 13 Ventura or later" from the server's platforms.json props, so the page and its tests read the same file.
export function requirementLine(requirements: Requirements, strings: Pick<PlatformStrings, 'requirement' | 'systemsJoiner'>): string {
    const { systems, displayVersion, releaseName } = requirements;
    const template = releaseName === null ? strings.requirement.unnamed : strings.requirement.named;

    return interpolate(template, {
        systems: systems.join(strings.systemsJoiner),
        version: displayVersion,
        releaseName: releaseName ?? '',
    });
}
