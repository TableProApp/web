import type { LogoSponsor, Placement, Sponsor, SponsorsData } from './data/sponsors.ts';

// No JSON import, so `node --test` loads this file directly (tests/js/sponsors.test.ts).

function placed(data: SponsorsData, placements: Placement[]): Sponsor[] {
    return placements.flatMap((placement) => data.sponsors.filter((sponsor) => sponsor.placement === placement));
}

export function onHomepage(data: SponsorsData): LogoSponsor[] {
    return placed(data, ['lead', 'homepage']) as LogoSponsor[];
}

export function byName(data: SponsorsData): Sponsor[] {
    return placed(data, ['name']);
}

// Clamped, so a file with too many homepage sponsors still shows every logo it paid for.
export function openSlots(data: SponsorsData): number {
    return Math.max(0, data.homepageSlots - onHomepage(data).length);
}
