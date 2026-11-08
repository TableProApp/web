import type { Messages } from '../../types.ts';

export default {
    "index": {
        "empty": "Ancora nessun articolo.",
        "tabs": {
            "label": "Articoli per tipo",
            "all": "Tutti",
            "release": "Versioni",
            "guide": "Guide",
            "news": "Novità"
        },
        "kind": {
            "release": "Versione",
            "guide": "Guida",
            "news": "Novità"
        },
        "pages": {
            "label": "Pagine",
            "newer": "Articoli più recenti",
            "older": "Articoli meno recenti",
            "page": "Pagina {page} di {pages}"
        }
    },
    "latest": "Ultimo post di rilascio: <post>{title}</post>.",
    "post": {
        "archive": "Pubblicato il {date}. Questo post descrive {release} al momento del rilascio. Vedi le <features>funzionalità attuali</features> e il <changelog>changelog</changelog> (inglese).",
        "correction": "Correzione, {date}",
        "toc": "In questa pagina",
        "pages": "Pagine correlate",
        "notes": {
            "title": "Note di rilascio complete",
            "changelog": "{release} nel registro delle modifiche",
            "github": "{release} su GitHub"
        },
        "related": "Articoli correlati"
    }
} satisfies Messages['blog'];
