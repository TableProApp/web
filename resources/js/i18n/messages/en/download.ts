/**
 * The `download` namespace: the labels and states of the download controls,
 * wherever they render. The download page's own prose is in
 * resources/data/content/{locale}/download.json, and the phrases around the
 * platform facts ("… or later", "Apple silicon", "Free, with no in-app
 * purchases", "Linux") are the `platforms` namespace's.
 *
 * - `macCta` is the availability-layer Mac action (positioning §4), for the
 *   hero, the closing band, the mobile menu, the Free plan and the DMG button.
 * - `release.badge` is the version badge on the Mac card; `{date}` arrives
 *   formatted by the server for the page's locale.
 * - `otherPlatforms.joiner` joins the platform names in a negative sentence,
 *   so the last one takes "or": "not available for Linux or Windows".
 * - `checksum` is the disclosure under the DMG button. It renders only when
 *   the release data carries the DMG's SHA-256.
 * - Nothing here says a download has started. `afterClick` appears only after
 *   the reader clicked the DMG button, and says what to do if nothing arrived.
 */
export default {
    macCta: 'Download for Mac',
    release: {
        dated: 'Version {version}, released {date}',
        undated: 'Version {version}',
        badge: 'v{version} · {date}',
        badgeUndated: 'v{version}',
        notes: 'Release notes',
        unavailable: 'Release details are unavailable. The button opens the latest release on GitHub.',
    },
    file: {
        sized: '{name} · {size} MB',
        unsized: '{name}',
        number: {
            decimal: '.',
            group: ',',
        },
    },
    onAnotherDevice: 'To install the Mac app, open this page on your Mac.',
    checksum: {
        summary: 'Verify your download',
        body: 'Run <code>shasum -a 256</code> on the file in Terminal. The result should match the SHA-256 checksum below.',
    },
    afterClick: {
        title: 'Next, install it',
        body: 'Open {file} from your Downloads folder and drag TablePro into Applications.',
        retry: 'If the download didn’t begin, <link>download {file} again</link>.',
        steps: 'Install and first run',
    },
    homebrew: {
        label: 'Homebrew command',
        terminal: 'Terminal',
    },
    ios: {
        badge: 'Download on the App Store',
    },
    otherPlatforms: {
        joiner: {
            separator: ', ',
            last: ' or ',
        },
    },
};
