// Nothing about TablePro is typed into a compare page or comparisons.json (architecture §1.8). The featured engines come from the server so the bundle skips engines.json.
import type { Messages } from '@/i18n';
import { joinList } from '@/i18n/format';
import { connectionImportFor, FACTS } from '@/lib/data/facts';
import { examplesText, PAID_FEATURES } from '@/lib/data/paid-features';
import { deviceList, iosPlatform, isReleased, macPlatform, PLATFORMS, requirementText } from '@/lib/data/platforms';
import { PRICING } from '@/lib/data/pricing';
import type { TableProFacts } from './model';

export function tableproFacts(productId: string | null, featuredEngines: string[], m: Messages): TableProFacts {
    const mac = macPlatform();
    const ios = PLATFORMS.platforms.some((platform) => platform.id === 'ios' && isReleased(platform)) ? iosPlatform() : null;
    const sync = PAID_FEATURES.find((feature) => feature.id === 'icloud-sync') ?? null;
    const importer = productId === null ? null : connectionImportFor(productId);

    return {
        // Joined as the homepage and JSON-LD join them.
        devices: deviceList(m.common.list),
        macRequirement: requirementText(mac, m.platforms),
        iosRequirement: ios !== null ? requirementText(ios, m.platforms) : null,
        macArchitectures: mac.architectures,
        macUniversal: mac.universalBinary,
        starter: { ...PRICING.tiers.starter.prices, activations: PRICING.license.deviceLimit },
        team: { ...PRICING.tiers.team.prices, minSeats: PRICING.tiers.team.seats.min },
        iosFree: ios !== null && ios.price.amount === 0 && !ios.price.inAppPurchases,
        licence: FACTS.openSource.license,
        featuredEngines,
        syncTier: sync?.tier ?? null,
        importer: importer === null ? null : { app: importer.app, passwords: importer.passwords, format: importer.format },
    };
}

// A language the app adds reaches every compare page without a copy edit.
export function macLanguages(names: Record<string, string>, m: Messages): string {
    return joinList(
        macPlatform().appLanguages.map((code) => names[code] ?? code),
        m.common.list,
    );
}

export function paidExamples(m: Messages): { starterExamples: string; teamExamples: string } {
    return {
        starterExamples: examplesText('starter', m.common.list),
        teamExamples: examplesText('team', m.common.list),
    };
}
