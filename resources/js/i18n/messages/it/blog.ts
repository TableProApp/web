import type { Messages } from '../../types.ts';

export default {
    "index": {
        "empty": "Ancora nessun articolo."
    },
    "latest": "Alcune versioni hanno anche un articolo sul blog. Il più recente è <post>{title}</post>.",
    "post": {
        "archive": "Pubblicato il {date}, questo articolo descrive {release} com’era allora. Per sapere cosa offre oggi TablePro, consulta le <features>funzionalità</features> e il <changelog>registro delle modifiche</changelog>.",
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
