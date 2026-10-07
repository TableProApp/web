import type { Messages } from '../../types.ts';

export default {
    "macCta": "Für Mac herunterladen",
    "builds": {
        "arm64": "Für Apple silicon herunterladen",
        "x86_64": "Für Intel herunterladen"
    },
    "release": {
        "dated": "Version {version}, veröffentlicht am {date}",
        "undated": "Version {version}",
        "badge": "v{version} · {date}",
        "badgeUndated": "v{version}",
        "notes": "Versionshinweise",
        "unavailable": "Die Angaben zur aktuellen Version konnten nicht geladen werden. Beide Schaltflächen öffnen die neueste Version auf GitHub, wo du das Festplatten-Image für deinen Mac auswählen kannst."
    },
    "file": {
        "sized": "{name} · {size} MB",
        "unsized": "{name}",
        "number": {
            "decimal": ",",
            "group": "."
        }
    },
    "detected": "Dein Browser meldet einen Mac mit {chip}.",
    "onAnotherDevice": "Öffne diese Seite auf deinem Mac, um die Mac-App zu installieren.",
    "whichMac": {
        "summary": "Welchen Mac habe ich?",
        "body": "Öffne das Apple-Menü und wähle „Über diesen Mac“. Ein Mac mit Apple silicon zeigt die Zeile „Chip“, zum Beispiel Apple M2. Ein Intel-Mac zeigt die Zeile „Prozessor“ mit der Bezeichnung Intel."
    },
    "afterClick": {
        "title": "Als Nächstes installieren",
        "body": "Öffne {file} aus deinem Downloads-Ordner und ziehe TablePro in den Ordner Programme.",
        "retry": "Falls der Download nicht gestartet ist, <link>lade {file} erneut herunter</link>.",
        "steps": "Installation und erster Start"
    },
    "homebrew": {
        "label": "Homebrew-Befehl",
        "terminal": "Terminal"
    },
    "ios": {
        "badge": "Im App Store laden"
    },
    "otherPlatforms": {
        "joiner": {
            "separator": ", ",
            "last": " oder "
        }
    }
} satisfies Messages['download'];
