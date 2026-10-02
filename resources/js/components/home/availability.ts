/**
 * The availability layer of the homepage (positioning §3, §13): every phrase
 * that names a platform, a requirement or a paid tier is built here from
 * resources/data/{platforms,paid-features}.json and the catalogs, never typed
 * into the page copy. When a platform ships, these strings change with the
 * data and the copy does not.
 *
 * Names are joined with the catalog's list separators, not `Intl.ListFormat`,
 * so the server and the browser render the same bytes (architecture §1.5).
 */
import { interpolate } from '@/i18n/core';
import { joinList } from '@/i18n/format';
import type { Messages } from '@/i18n';
import { PAID_FEATURES, paidPlatformIds, type PaidFeature } from '@/lib/data/paid-features';
import type { PaidTierId } from '@/lib/data/pricing';
import {
    appStoreUrl,
    architecturesText,
    deviceList,
    devicesOf,
    isReleased,
    macPlatform,
    PLATFORMS,
    requirementText,
    type IosPlatform,
} from '@/lib/data/platforms';

/** The iPhone and iPad platform while it is released, else null: nothing renders for it. */
export function releasedIos(): IosPlatform | null {
    const ios = PLATFORMS.platforms.find((platform) => platform.id === 'ios');

    return ios !== undefined && isReleased(ios) ? (ios as IosPlatform) : null;
}

export interface Availability {
    /** "macOS 13 Ventura or later · Apple silicon or Intel". */
    macCaption: string;
    /** "iPhone and iPad · iOS and iPadOS 18 or later", or null while that app is not released. */
    iosCaption: string | null;
    /** The App Store listing, or null while that app is not released. */
    appStoreUrl: string | null;
    /** "Mac, iPhone and iPad". */
    deviceList: string;
    /** "iPhone and iPad", or "" while that app is not released. */
    iosDevices: string;
    /** "Mac app": the apps any paid feature applies to. */
    paidPlatformApps: string;
}

/**
 * The captions under the two download actions and the platform phrases the
 * sections share, in the page's language. `captions` are the page's own
 * templates (`{requirement} · {architectures}`).
 */
export function availability(m: Messages, captions: { mac: string; ios: string }): Availability {
    const mac = macPlatform();
    const ios = releasedIos();
    const store = ios !== null ? appStoreUrl() : '';

    return {
        macCaption: interpolate(captions.mac, {
            requirement: requirementText(mac, m.platforms),
            architectures: architecturesText(m.platforms),
        }),
        iosCaption:
            ios !== null
                ? interpolate(captions.ios, {
                      devices: devicesOf(ios, m.common.list),
                      requirement: requirementText(ios, m.platforms),
                  })
                : null,
        appStoreUrl: store !== '' ? store : null,
        deviceList: deviceList(m.common.list),
        iosDevices: ios !== null ? devicesOf(ios, m.common.list) : '',
        paidPlatformApps: joinList(
            paidPlatformIds()
                .filter((id): id is 'mac' | 'ios' => id === 'mac' || id === 'ios')
                .map((id) => m.platforms.app[id]),
            m.common.list,
        ),
    };
}

/** The Mac build architectures as a plain list: "Apple silicon and Intel". */
export function macArchitectureList(m: Messages): string {
    return joinList(
        macPlatform().architectures.map((architecture) => m.platforms.architectures[architecture.id]),
        m.common.list,
    );
}

/**
 * The paid features among `ids`, grouped by the plan that adds them, in data
 * order: one line per plan, such as "Requires a Starter plan: Query Insights
 * and Result Charts." The plan and feature names stay English in every
 * locale; `template` is the page's sentence around them.
 */
export function paidLines(ids: readonly string[], m: Messages, template: string): string[] {
    const features = PAID_FEATURES.filter((feature) => ids.includes(feature.id));
    const tiers = [...new Set(features.map((feature) => feature.tier))];

    return tiers.map((tier: PaidTierId) =>
        interpolate(template, {
            tier: m.pricing.tiers[tier].name,
            features: joinList(
                features.filter((feature: PaidFeature) => feature.tier === tier).map((feature) => feature.name),
                m.common.list,
            ),
        }),
    );
}

/** The plan that adds a paid feature, by name ("Starter"), or "" when the data has no such feature. */
export function tierOf(id: string, m: Messages): string {
    const feature = PAID_FEATURES.find((entry) => entry.id === id);

    return feature !== undefined ? m.pricing.tiers[feature.tier].name : '';
}
