import type { Messages } from '../../types.ts';

export default {
    "macCta": "Scarica per Mac",
    "builds": {
        "arm64": "Scarica per Apple silicon",
        "x86_64": "Scarica per Intel"
    },
    "release": {
        "dated": "Versione {version}, rilasciata il {date}",
        "undated": "Versione {version}",
        "badge": "v{version} · {date}",
        "badgeUndated": "v{version}",
        "notes": "Note di rilascio (inglese)",
        "unavailable": "Impossibile caricare i dettagli della versione attuale. Entrambi i pulsanti aprono l’ultima versione su GitHub, dove puoi scegliere l’immagine disco per il tuo Mac."
    },
    "file": {
        "sized": "{name} · {size} MB",
        "unsized": "{name}",
        "number": {
            "decimal": ",",
            "group": "."
        }
    },
    "detected": "Il browser indica un Mac con {chip}.",
    "onAnotherDevice": "Per installare l’app per Mac, apri questa pagina sul tuo Mac.",
    "whichMac": {
        "summary": "Quale Mac possiedo?",
        "body": "Apri il menu Apple e scegli Informazioni su questo Mac. Un Mac con Apple silicon mostra una voce Chip, ad esempio Apple M2. Un Mac Intel mostra una voce Processore che riporta Intel."
    },
    "afterClick": {
        "title": "Ora installa l’app",
        "body": "Apri {file} dalla cartella Download e trascina TablePro in Applicazioni.",
        "retry": "Se il download non è iniziato, <link>scarica di nuovo {file}</link>.",
        "steps": "Installazione e primo avvio"
    },
    "homebrew": {
        "label": "Comando Homebrew",
        "terminal": "Terminale"
    },
    "ios": {
        "badge": "Scarica su App Store"
    },
    "otherPlatforms": {
        "joiner": {
            "separator": ", ",
            "last": " o "
        }
    }
} satisfies Messages['download'];
