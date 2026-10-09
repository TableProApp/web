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
        "unavailable": "Dettagli del rilascio non disponibili. Entrambi i pulsanti aprono l’ultima versione su GitHub; scegli lì la build."
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
        "summary": "Quale Mac ho?",
        "body": "Scegli Informazioni su questo Mac dal menu Apple. La voce Chip indica Apple silicon; una voce Processore con Intel indica Intel."
    },
    "checksum": {
        "summary": "Verifica il download",
        "body": "Esegui <code>shasum -a 256</code> sul file nel Terminale. Il risultato deve corrispondere al checksum SHA-256 qui sotto."
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
