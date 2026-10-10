import type { Messages } from '../../types.ts';

export default {
    "language": {
        "label": "Sprache",
        "current": "Sprache: {language}",
        "fallback": "Diese Seite ist nicht auf Deutsch verfügbar",
        "fallbackPost": "Dieser Beitrag ist nicht auf Deutsch",
        "fallbackBlog": "Zur Blogübersicht",
        "suggest": {
            "label": "Sprachvorschlag",
            "action": "Diese Seite auf Deutsch lesen",
            "dismiss": "Deutsch nicht mehr vorschlagen"
        }
    },
    "theme": {
        "label": "Darstellung",
        "current": "Darstellung: {choice}",
        "light": "Hell",
        "dark": "Dunkel",
        "system": "System"
    },
    "copy": {
        "copy": "Kopieren",
        "copied": "Kopiert",
        "copyNamed": "{label} kopieren",
        "failed": "Kopieren fehlgeschlagen. Markiere den Text und kopiere ihn."
    },
    "stepper": {
        "decrease": "{label} verringern",
        "increase": "{label} erhöhen"
    },
    "availability": {
        "included": "Enthalten",
        "notIncluded": "Nicht enthalten"
    },
    "dismiss": "Ausblenden",
    "close": "Schließen"
} satisfies Messages['controls'];
