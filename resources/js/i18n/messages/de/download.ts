import type { Messages } from '../../types.ts';

export default {
    "macCta": "Für Mac herunterladen",
    "release": {
        "dated": "Version {version}, veröffentlicht am {date}",
        "undated": "Version {version}",
        "notes": "Versionshinweise (Englisch)",
        "unavailable": "Die Versionsdetails sind nicht verfügbar. Die Schaltfläche öffnet die neueste Version auf GitHub."
    },
    "file": {
        "size": "{size} MB",
        "number": {
            "decimal": ",",
            "group": "."
        }
    },
    "checksum": {
        "summary": "Download überprüfen",
        "body": "Führe im Terminal <code>shasum -a 256</code> für die Datei aus. Das Ergebnis muss mit der SHA-256-Prüfsumme unten übereinstimmen."
    },
    "afterClick": {
        "title": "Als Nächstes installieren",
        "body": "Öffne {file} aus deinem Downloads-Ordner und ziehe TablePro in den Ordner Programme.",
        "retry": "Falls der Download nicht gestartet ist, <link>lade {file} erneut herunter</link>."
    },
    "homebrew": {
        "label": "Homebrew-Befehl",
        "terminal": "Terminal"
    },
    "ios": {
        "badge": "Laden im App Store"
    },
    "orList": {
        "separator": ", ",
        "last": " oder "
    },
    "card": {
        "yourSystem": "Dein System",
        "beta": "Beta",
        "dmg": ".dmg herunterladen",
        "linux": "Unter Linux installieren",
        "updates": {
            "mac": "Aktualisiert sich im Hintergrund",
            "ios": "Updates über den App Store",
            "linux": "Updates über deinen Paketmanager"
        }
    },
    "linux": {
        "title": "Unter Linux installieren",
        "beta": "Die Linux-App ist eine Beta: Sie steht noch am Anfang und kann sich von Version zu Version ändern. Bitte <link>melde Fehler auf GitHub</link>.",
        "methods": "Installieren mit",
        "floor": "{name} {version}+",
        "anyDistribution": "jede Distribution per Flatpak",
        "flatpak": "Flatpak",
        "files": "Dateien",
        "commands": "Befehle für {method}",
        "requirement": "{name} {versions} · {architectures}",
        "flatpakRequirement": "Jede Distribution mit Flatpak · {architectures} · bringt eine eigene GNOME-{version}-Runtime mit",
        "update": "Updates kommen mit <code>{command}</code>",
        "table": {
            "caption": "Pakete von TablePro {version} für Linux",
            "package": "Paket",
            "bundle": "Flatpak-Bundle"
        },
        "checksums": "Prüfsummen für alle Dateien: <link>{file}</link>",
        "release": "TablePro {version} für Linux auf GitHub",
        "verify": {
            "summary": "Datei überprüfen",
            "body": "Führe einen der beiden Befehle in dem Ordner aus, in dem die Datei liegt. Der erste prüft die Build-Attestierung von GitHub und braucht die GitHub CLI; der zweite prüft die Datei anhand von {file}.",
            "label": "Prüfbefehle"
        }
    },
    "platforms": {
        "title": "Was auf welcher Plattform funktioniert",
        "lead": "Jede Funktion der Funktionsseiten im direkten Vergleich.",
        "databases": {
            "one": "{count} Datenbank",
            "other": "{count} Datenbanken"
        },
        "capability": "Funktion",
        "covers": "{platform} {count} von {total}",
        "available": "Verfügbar",
        "page": "Funktionsseite",
        "pageLabel": "Funktionsseite {page}"
    },
    "updates": {
        "ios": "Der App Store installiert Updates wie bei deinen anderen Apps.",
        "linux": "Dein Paketmanager installiert Updates zusammen mit dem restlichen System. Die App sucht nicht selbst danach."
    },
    "faq": {
        "title": "Fragen",
        "free": {
            "question": "Ist TablePro unter Linux kostenlos?",
            "answer": "Ja, die Nutzung ist kostenlos. Kostenpflichtige Tarife ergänzen die Mac-App um Funktionen, und keine davon gibt es bisher unter Linux."
        },
        "license": {
            "question": "Funktioniert meine Lizenz unter Linux?",
            "answer": {
                "one": "Ja. Eine Lizenz lässt sich auf {count} Computer aktivieren, Mac oder Linux. Ihre kostenpflichtigen Funktionen gibt es vorerst nur auf dem Mac.",
                "other": "Ja. Eine Lizenz lässt sich auf bis zu {count} Computern aktivieren, Mac oder Linux. Ihre kostenpflichtigen Funktionen gibt es vorerst nur auf dem Mac."
            }
        },
        "other": {
            "question": "Gibt es eine Version für {platforms}?"
        },
        "verify": {
            "question": "Wie überprüfe ich einen Download?",
            "mac": "Öffne auf dem Mac <ui>Download überprüfen</ui> unter der Download-Schaltfläche und vergleiche die SHA-256-Prüfsumme.",
            "linux": "Öffne unter Linux <ui>Datei überprüfen</ui> im Tab Dateien des Linux-Abschnitts."
        }
    }
} satisfies Messages['download'];
