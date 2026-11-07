import type { Messages } from '../../types.ts';

export default {
    "macCta": "Scarica per Mac",
    "release": {
        "dated": "Versione {version}, rilasciata il {date}",
        "undated": "Versione {version}",
        "notes": "Note di rilascio (inglese)",
        "unavailable": "Dettagli del rilascio non disponibili. Il pulsante apre l’ultima versione su GitHub."
    },
    "file": {
        "size": "{size} MB",
        "number": {
            "decimal": ",",
            "group": "."
        }
    },
    "checksum": {
        "summary": "Verifica il download",
        "body": "Esegui <code>shasum -a 256</code> sul file nel Terminale. Il risultato deve corrispondere al checksum SHA-256 qui sotto."
    },
    "afterClick": {
        "title": "Ora installa l’app",
        "body": "Apri {file} dalla cartella Download e trascina TablePro in Applicazioni.",
        "retry": "Se il download non è iniziato, <link>scarica di nuovo {file}</link>."
    },
    "homebrew": {
        "label": "Comando Homebrew",
        "terminal": "Terminale"
    },
    "ios": {
        "badge": "Scarica su App Store"
    },
    "orList": {
        "separator": ", ",
        "last": " o "
    },
    "panel": {
        "legend": "Piattaforma",
        "beta": "Beta",
        "updates": {
            "mac": "Si aggiorna in background",
            "ios": "Si aggiorna da App Store"
        }
    },
    "linux": {
        "beta": "L’app per Linux è in beta: è agli inizi e può cambiare da una versione all’altra, quindi <link>segnala i bug su GitHub</link>.",
        "methods": "Installa con",
        "floor": "{name} {version}+",
        "anyDistribution": "qualsiasi distribuzione con Flatpak",
        "flatpak": "Flatpak",
        "files": "File",
        "commands": "Comandi per {method}",
        "requirement": "{name} {versions} · {architectures}",
        "flatpakRequirement": "Qualsiasi distribuzione con Flatpak · {architectures} · include il proprio runtime GNOME {version}",
        "update": "Gli aggiornamenti arrivano con <code>{command}</code>",
        "table": {
            "caption": "Pacchetti di TablePro {version} per Linux",
            "package": "Pacchetto",
            "bundle": "Bundle Flatpak"
        },
        "checksums": "Checksum di tutti i file: <link>{file}</link>",
        "release": "TablePro {version} per Linux su GitHub",
        "verify": {
            "summary": "Verifica un file",
            "body": "Esegui uno dei due comandi nella cartella che contiene il file. Il primo verifica l’attestazione di build di GitHub e richiede GitHub CLI; il secondo confronta il file con {file}.",
            "label": "comandi di verifica"
        }
    },
    "otherPlatforms": {
        "question": "Esiste una versione per {platforms}?"
    }
} satisfies Messages['download'];
