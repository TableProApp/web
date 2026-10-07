import type { Messages } from '../../types.ts';

export default {
    "requirement": {
        "named": "{systems} {version} {releaseName} oder neuer",
        "unnamed": "{systems} {version} oder neuer"
    },
    "requires": "Erfordert {requirement}",
    "systemsJoiner": " und ",
    "architectures": {
        "arm64": "Apple silicon",
        "x86_64": "Intel",
        "joiner": " oder "
    },
    "app": {
        "mac": "Mac-App",
        "ios": "iPhone- und iPad-App"
    },
    "availability": {
        "summary": "Verfügbar für {deviceList}."
    },
    "free": "Kostenlos, ohne In-App-Käufe",
    "status": {
        "released": "Verfügbar",
        "prototype": "Nur ein Prototyp. Nichts zum Installieren und kein Erscheinungstermin.",
        "none": "Nicht verfügbar, kein Erscheinungstermin."
    },
    "names": {
        "linux": "Linux",
        "windows": "Windows"
    },
    "release": {
        "badge": "{version}",
        "badgeLabel": "In TablePro {version} für Mac hinzugefügt. Homebrew installiert möglicherweise noch eine ältere Version."
    }
} satisfies Messages['platforms'];
