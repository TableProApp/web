/**
 * TablePro's column, read from the site's own data files: prices from
 * `pricing.json`, platforms and requirements from `platforms.json`, the plan
 * that includes iCloud Sync from `paid-features.json`, the license and the
 * connection importers from `facts.json`. Nothing about TablePro is typed into
 * a compare page or stored in `comparisons.json` (architecture §1.8).
 *
 * The featured engine names come from the server (`tablepro.featuredEngines`),
 * so the page bundle does not carry all of `engines.json` for six names.
 */
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
        /* "Mac, iPhone and iPad": each released platform's device names, as the homepage and JSON-LD join them. */
        devices: deviceList(m.common.list),
        macRequirement: requirementText(mac, m.platforms),
        iosRequirement: ios !== null ? requirementText(ios, m.platforms) : null,
        macArchitectures: mac.architectures.map((architecture) => architecture.id),
        starter: { ...PRICING.tiers.starter.prices, activations: PRICING.tiers.starter.activations },
        team: { ...PRICING.tiers.team.prices, minSeats: PRICING.tiers.team.seats.min },
        iosFree: ios !== null && ios.price.amount === 0 && !ios.price.inAppPurchases,
        licence: FACTS.openSource.license,
        featuredEngines,
        syncTier: sync?.tier ?? null,
        importer: importer === null ? null : { app: importer.app, passwords: importer.passwords, format: importer.format },
    };
}

/**
 * `{macLanguages}`: the Mac app's interface languages from `platforms.json`,
 * named in the page's language by the hub's `labels.languages`, so a language
 * the app adds reaches every compare page without a copy edit.
 */
export function macLanguages(names: Record<string, string>, m: Messages): string {
    return joinList(
        macPlatform().appLanguages.map((code) => names[code] ?? code),
        m.common.list,
    );
}

/** `{starterExamples}` and `{teamExamples}`: the highlighted paid features' names, joined for the page's language. */
export function paidExamples(m: Messages): { starterExamples: string; teamExamples: string } {
    return {
        starterExamples: examplesText('starter', m.common.list),
        teamExamples: examplesText('team', m.common.list),
    };
}
