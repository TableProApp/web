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
        "notes": "Versionshinweise (Englisch)",
        "unavailable": "Die Versionsdetails sind nicht verfügbar. Beide Schaltflächen öffnen die neueste Version auf GitHub; wähle dort einen Build."
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
        "body": "Wähle im Apple-Menü „Über diesen Mac“. Die Zeile „Chip“ bedeutet Apple silicon; eine Zeile „Prozessor“ mit Intel bedeutet Intel."
    },
    "checksum": {
        "summary": "Download überprüfen",
        "body": "Führe im Terminal <code>shasum -a 256</code> für die Datei aus. Das Ergebnis muss mit der SHA-256-Prüfsumme unten übereinstimmen."
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
        "badge": "Laden im App Store"
    },
    "otherPlatforms": {
        "joiner": {
            "separator": ", ",
            "last": " oder "
        }
    }
} satisfies Messages['download'];
