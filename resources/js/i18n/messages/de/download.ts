import type { Messages } from '../../types.ts';

export default {
    "macCta": "Für Mac herunterladen",
    "release": {
        "dated": "Version {version}, veröffentlicht am {date}",
        "undated": "Version {version}",
        "badge": "v{version} · {date}",
        "badgeUndated": "v{version}",
        "notes": "Versionshinweise (Englisch)",
        "unavailable": "Die Versionsdetails sind nicht verfügbar. Die Schaltfläche öffnet die neueste Version auf GitHub."
    },
    "file": {
        "sized": "{name} · {size} MB",
        "unsized": "{name}",
        "number": {
            "decimal": ",",
            "group": "."
        }
    },
    "onAnotherDevice": "Öffne diese Seite auf deinem Mac, um die Mac-App zu installieren.",
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
