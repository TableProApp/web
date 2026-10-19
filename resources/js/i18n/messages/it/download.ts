import type { Messages } from '../../types.ts';

export default {
    "macCta": "Scarica per Mac",
    "release": {
        "dated": "Versione {version}, rilasciata il {date}",
        "undated": "Versione {version}",
        "badge": "v{version} · {date}",
        "badgeUndated": "v{version}",
        "notes": "Note di rilascio (inglese)",
        "unavailable": "Dettagli del rilascio non disponibili. Il pulsante apre l’ultima versione su GitHub."
    },
    "file": {
        "sized": "{name} · {size} MB",
        "unsized": "{name}",
        "number": {
            "decimal": ",",
            "group": "."
        }
    },
    "onAnotherDevice": "Per installare l’app per Mac, apri questa pagina sul tuo Mac.",
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
