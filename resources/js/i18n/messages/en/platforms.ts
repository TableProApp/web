/**
 * The `platforms` namespace: the phrases around the values in
 * resources/data/platforms.json. The values themselves (versions, release
 * names, device names) stay in the data file and are never typed here.
 *
 * `requirement` takes `{systems}` (the platform's systems joined with
 * `systemsJoiner`), `{version}` and `{releaseName}`; the `unnamed` form is for
 * a platform whose release has no name. `lib/data/platforms.ts` fills them:
 * "macOS 13 Ventura or later", "iOS and iPadOS 18 or later".
 */
export default {
    requirement: {
        named: '{systems} {version} {releaseName} or later',
        unnamed: '{systems} {version} or later',
    },
    requires: 'Requires {requirement}',
    systemsJoiner: ' and ',
    architectures: {
        arm64: 'Apple silicon',
        x86_64: 'Intel',
        joiner: ' or ',
    },
    app: {
        mac: 'Mac app',
        ios: 'iPhone and iPad app',
    },
    availability: {
        summary: 'Available for {deviceList}.',
    },
    free: 'Free, with no in-app purchases',
    status: {
        released: 'Available',
        prototype: 'A prototype only. Nothing to install, and no release date.',
        none: 'Not available, and no release date.',
    },
    names: {
        linux: 'Linux',
        windows: 'Windows',
    },
    release: {
        badge: '{version}',
        badgeLabel: 'Added in TablePro {version} for Mac. Homebrew may still install an earlier version.',
    },
};
