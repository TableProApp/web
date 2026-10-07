import type { Messages } from '../../types.ts';

export default {
    "index": {
        "empty": "Ancora nessun articolo."
    },
    "post": {
        "archive": {
            "named": "Pubblicato il {date}, questo articolo descrive {release} com’era allora. Per sapere cosa offre oggi TablePro, consulta le <features>funzionalità</features> e il <changelog>registro delle modifiche</changelog>.",
            "unnamed": "Pubblicato il {date}, questo articolo descrive TablePro com’era allora. Per sapere cosa offre oggi TablePro, consulta le <features>funzionalità</features> e il <changelog>registro delle modifiche</changelog>."
        },
        "brandedTitle": "{title} – Blog di TablePro",
        "correction": "Correzione, {date}",
        "toc": "In questa pagina",
        "related": "Articoli correlati"
    }
} satisfies Messages['blog'];
