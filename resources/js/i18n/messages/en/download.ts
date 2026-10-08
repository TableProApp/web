/**
 * The `download` namespace: the labels and states of the download controls,
 * wherever they render. The download page's own prose is in
 * resources/data/content/{locale}/download.json, and the phrases around the
 * platform facts ("… or later", "Apple silicon", "Free, with no in-app
 * purchases", "Linux") are the `platforms` namespace's.
 *
 * - `macCta` is the availability-layer Mac action (positioning §4), for the
 *   hero, the closing band, the mobile menu and the Free plan.
 * - `builds` are the two architecture buttons; the browser may highlight one,
 *   never choose (resources/js/lib/device.ts).
 * - `release.badge` is the version badge on the Mac card; `{date}` arrives
 *   formatted by the server for the page's locale.
 * - `otherPlatforms.joiner` joins the platform names in a negative sentence,
 *   so the last one takes "or": "not available for Linux or Windows".
 * - `checksum` is the disclosure under the builds. It renders only when the
 *   release data carries a SHA-256 for a build.
 * - Nothing here says a download has started. `afterClick` appears only after
 *   the reader clicked a build, and says what to do if nothing arrived.
 */
export default {
    macCta: 'Download for Mac',
    builds: {
        arm64: 'Download for Apple silicon',
        x86_64: 'Download for Intel',
    },
    release: {
        dated: 'Version {version}, released {date}',
        undated: 'Version {version}',
        badge: 'v{version} · {date}',
        badgeUndated: 'v{version}',
        notes: 'Release notes',
        unavailable:
            'The current release details could not be loaded. Both buttons open the latest release on GitHub, where you can choose the disk image for your Mac.',
    },
    file: {
        sized: '{name} · {size} MB',
        unsized: '{name}',
        number: {
            decimal: '.',
            group: ',',
        },
    },
    detected: 'Your browser reports a Mac with {chip}.',
    onAnotherDevice: 'To install the Mac app, open this page on your Mac.',
    whichMac: {
        summary: 'Which Mac do I have?',
        body: 'Open the Apple menu and choose About This Mac. A Mac with Apple silicon shows a Chip line, such as Apple M2. An Intel Mac shows a Processor line that names Intel.',
    },
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
