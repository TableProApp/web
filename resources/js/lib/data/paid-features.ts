/**
 * resources/data/paid-features.json, typed: the ten features a Starter or
 * Team plan adds to the Mac app, in display order.
 *
 * The names are byte-identical to `ProFeature.displayName` in the app, and
 * stay English in every locale. The one-line descriptions live in
 * `content/{locale}/paid-features.json`, keyed by `id`. Everything not listed
 * here is free, including every engine, the AI assistant, the MCP server and
 * Safe Mode; the iPhone and iPad app gates nothing.
 */
import data from '@data/paid-features.json';
import { joinList, type ListStyle } from '../../i18n/format.ts';
import type { PaidTierId } from './pricing.ts';
import type { PlatformId } from './platforms.ts';

/**
 * What the app does when the plan ends, as the reader sees it:
 * - `overlay`: the view stays, covered by a license prompt;
 * - `alert`: the action is refused with an alert;
 * - `hidden`: the items it brought in disappear;
 * - `disabled`: its settings are dimmed with a badge;
 * - `silent`: it stops working with no message.
 */
export type LapseBehaviour = 'overlay' | 'alert' | 'hidden' | 'disabled' | 'silent';

export interface PaidFeature {
    id: string;
    /** The `ProFeature` case in the app. */
    proFeature: string;
    /** `ProFeature.displayName`, never translated. */
    name: string;
    /** The lowest plan that includes it. Team includes everything in Starter. */
    tier: PaidTierId;
    platforms: PlatformId[];
    sinceAppVersion: string;
    /**
     * Every way the feature lapses, most visible first. Always a list, never a
     * string: this departs from the scalar architecture §1.8 shows
     * (`"lapse": "locks"`), because one feature can lapse differently in
     * different places. Data Rewind refuses a restore with an alert, dims its
     * settings and stops capturing silently (its three `ProFeature` call sites
     * in the TablePro app), so it is `["alert", "disabled", "silent"]`. Read
     * `lapse[0]` for the one a reader meets first, or the whole list to
     * describe all of them.
     */
    lapse: LapseBehaviour[];
    /** One of the examples behind positioning's `{starterExamples}` and `{teamExamples}`. */
    highlight: boolean;
    /** Where a feature page describes it. */
    page: { path: string; anchor: string };
}

/**
 * The single cast from the JSON import, whose string unions TypeScript widens
 * to `string`. `tests/Feature/Data/PaidFeaturesDataTest.php` validates the
 * file and pins the names against the app.
 */
export const PAID_FEATURES = data as PaidFeature[];

export function paidFeaturesForTier(tier: PaidTierId): PaidFeature[] {
    return PAID_FEATURES.filter((feature) => feature.tier === tier);
}

/** The examples a tier's summary names, in display order. */
export function highlightedFeatures(tier: PaidTierId): PaidFeature[] {
    return paidFeaturesForTier(tier).filter((feature) => feature.highlight);
}

/** `{starterExamples}` / `{teamExamples}`: highlighted names joined with the locale's list style. */
export function examplesText(tier: PaidTierId, style: ListStyle): string {
    return joinList(
        highlightedFeatures(tier).map((feature) => feature.name),
        style,
    );
}

/** The platforms any paid feature applies to, in data order: `{paidPlatformApps}` is built from these. */
export function paidPlatformIds(): PlatformId[] {
    return [...new Set(PAID_FEATURES.flatMap((feature) => feature.platforms))];
}

/** The page fragment a feature links to: `/features/schema#compare-sync`. */
export function featureHref(feature: PaidFeature): string {
    return `${feature.page.path}#${feature.page.anchor}`;
}
