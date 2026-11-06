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
    "card": {
        "yourSystem": "Il tuo sistema",
        "beta": "Beta",
        "dmg": "Scarica il .dmg",
        "linux": "Installa su Linux",
        "updates": {
            "mac": "Si aggiorna in background",
            "ios": "Si aggiorna da App Store",
            "linux": "Si aggiorna con il gestore di pacchetti"
        }
    },
    "linux": {
        "title": "Installa su Linux",
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
    "platforms": {
        "title": "Cosa funziona su ogni piattaforma",
        "lead": "Ogni capacità delle pagine delle funzionalità, fianco a fianco.",
        "databases": {
            "one": "{count} database",
            "other": "{count} database"
        },
        "capability": "Capacità",
        "covers": "{platform} {count} su {total}",
        "available": "Disponibile",
        "page": "Pagina delle funzionalità",
        "pageLabel": "Pagina delle funzionalità {page}"
    },
    "updates": {
        "ios": "L’App Store installa gli aggiornamenti, come per le altre app.",
        "linux": "Il gestore di pacchetti installa gli aggiornamenti insieme al resto del sistema. L’app non li cerca da sola."
    },
    "faq": {
        "title": "Domande",
        "free": {
            "question": "TablePro è gratuito su Linux?",
            "answer": "Sì, è gratuito. I piani a pagamento aggiungono funzionalità all’app per Mac, e nessuna è ancora su Linux."
        },
        "license": {
            "question": "La mia licenza funziona su Linux?",
            "answer": {
                "one": "Sì. Una licenza si attiva su {count} computer, Mac o Linux. Per ora le sue funzionalità a pagamento sono su Mac.",
                "other": "Sì. Una licenza si attiva su un massimo di {count} computer, Mac o Linux. Per ora le sue funzionalità a pagamento sono su Mac."
            }
        },
        "other": {
            "question": "Esiste una versione per {platforms}?"
        },
        "verify": {
            "question": "Come verifico un download?",
            "mac": "Su Mac, apri <ui>Verifica il download</ui> sotto il pulsante di download e confronta il checksum SHA-256.",
            "linux": "Su Linux, apri <ui>Verifica un file</ui> nella scheda File della sezione Linux."
        }
    }
} satisfies Messages['download'];
