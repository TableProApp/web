export default {
    macCta: 'Download for Mac',
    release: {
        dated: 'Version {version}, released {date}',
        undated: 'Version {version}',
        notes: 'Release notes',
        unavailable: 'Release details are unavailable. The button opens the latest release on GitHub.',
    },
    file: {
        size: '{size} MB',
        number: {
            decimal: '.',
            group: ',',
        },
    },
    checksum: {
        summary: 'Verify your download',
        body: 'Run <code>shasum -a 256</code> on the file in Terminal. The result should match the SHA-256 checksum below.',
    },
    afterClick: {
        title: 'Next, install it',
        body: 'Open {file} from your Downloads folder and drag TablePro into Applications.',
        retry: 'If the download didn’t begin, <link>download {file} again</link>.',
    },
    homebrew: {
        label: 'Homebrew command',
        terminal: 'Terminal',
    },
    ios: {
        badge: 'Download on the App Store',
    },
    // Joins names in a sentence that offers a choice: "26.04 or 26.10", "Linux or Windows".
    orList: {
        separator: ', ',
        last: ' or ',
    },
    card: {
        yourSystem: 'Your system',
        beta: 'Beta',
        dmg: 'Download .dmg',
        linux: 'Install on Linux',
        updates: {
            mac: 'Updates itself in the background',
            ios: 'Updates from the App Store',
            linux: 'Updates with your package manager',
        },
    },
    linux: {
        title: 'Install on Linux',
        beta: 'The Linux app is a beta: it is early and may change between releases, so please <link>report bugs on GitHub</link>.',
        methods: 'Install with',
        floor: '{name} {version}+',
        anyDistribution: 'any distribution via Flatpak',
        flatpak: 'Flatpak',
        files: 'Files',
        commands: '{method} commands',
        requirement: '{name} {versions} · {architectures}',
        flatpakRequirement: 'Any distribution with Flatpak · {architectures} · brings its own GNOME {version} runtime',
        update: 'Updates arrive with <code>{command}</code>',
        table: {
            caption: 'Packages of TablePro {version} for Linux',
            package: 'Package',
            bundle: 'Flatpak bundle',
        },
        checksums: 'Checksums for every file: <link>{file}</link>',
        release: 'TablePro {version} for Linux on GitHub',
        verify: {
            summary: 'Verify a file',
            body: 'Run either command in the folder that holds the file. The first checks GitHub’s build attestation and needs the GitHub CLI; the second checks the file against {file}.',
            label: 'verification commands',
        },
    },
    updates: {
        ios: 'The App Store installs updates, as it does for your other apps.',
        linux: 'Your package manager installs updates with the rest of your system. The app does not check for them itself.',
    },
    faq: {
        title: 'Questions',
        other: {
            question: 'Is there a version for {platforms}?',
        },
        verify: {
            question: 'How do I verify a download?',
            mac: 'On a Mac, open <ui>Verify your download</ui> under the download button and compare the SHA-256 checksum.',
            linux: 'On Linux, open <ui>Verify a file</ui> in the Files tab of the Linux section.',
        },
    },
};
