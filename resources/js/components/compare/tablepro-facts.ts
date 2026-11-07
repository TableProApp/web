// Nothing about TablePro is typed into a compare page or comparisons.json (architecture §1.8). The featured engines come from the server so the bundle skips engines.json.
import { linuxRequirement } from '@/components/download/linux-text';
import type { Messages } from '@/i18n';
import { joinList } from '@/i18n/format';
import { connectionImportFor, FACTS } from '@/lib/data/facts';
import { examplesText, PAID_FEATURES } from '@/lib/data/paid-features';
import { iosPlatform, isReleased, macPlatform, PLATFORMS, requirementText } from '@/lib/data/platforms';
import { PRICING } from '@/lib/data/pricing';
import type { TableProFacts } from './model';
import type { TableProProp } from './types';

// Linux comes from the server's prop, like the release versions, so the page and its tests read the same platforms.json.
export function tableproFacts(productId: string | null, tablepro: Pick<TableProProp, 'featuredEngines' | 'linux'>, m: Messages): TableProFacts {
    const mac = macPlatform();
    const ios = PLATFORMS.platforms.some((platform) => platform.id === 'ios' && isReleased(platform)) ? iosPlatform() : null;
    const sync = PAID_FEATURES.find((feature) => feature.id === 'icloud-sync') ?? null;
    const importer = productId === null ? null : connectionImportFor(productId);
    const { featuredEngines, linux } = tablepro;

    return {
        // Joined as the homepage and JSON-LD join them.
        devices: joinList([...mac.deviceNames, ...(linux?.deviceNames ?? []), ...(ios?.deviceNames ?? [])], m.common.list),
        macRequirement: requirementText(mac, m.platforms),
        iosRequirement: ios !== null ? requirementText(ios, m.platforms) : null,
        linuxRequirement: linux !== null ? linuxRequirement(linux, m) : null,
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
