import type { Messages } from '../../types.ts';

export default {
    "language": {
        "label": "Lingua",
        "current": "Lingua: {language}",
        "fallback": "Questa pagina non è disponibile in italiano",
        "fallbackPost": "Questo articolo non è in italiano",
        "fallbackBlog": "Vedi gli articoli del blog",
        "suggest": {
            "label": "Suggerimento di lingua",
            "action": "Leggi questa pagina in italiano",
            "dismiss": "Non suggerire più l’italiano"
        }
    },
    "theme": {
        "label": "Tema",
        "current": "Tema: {choice}",
        "light": "Chiaro",
        "dark": "Scuro",
        "system": "Sistema"
    },
    "copy": {
        "copy": "Copia",
        "copied": "Copiato",
        "copyNamed": "Copia {label}",
        "failed": "Impossibile copiare. Seleziona il testo e copialo."
    },
    "stepper": {
        "decrease": "Riduci {label}",
        "increase": "Aumenta {label}"
    },
    "availability": {
        "included": "Incluso",
        "notIncluded": "Non incluso"
    },
    "dismiss": "Ignora",
    "close": "Chiudi"
} satisfies Messages['controls'];
