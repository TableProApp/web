import type { Messages } from '../../types.ts';

export default {
    "index": {
        "empty": "Noch keine Beiträge."
    },
    "post": {
        "archive": {
            "named": "Dieser am {date} veröffentlichte Beitrag beschreibt {release} in seinem damaligen Stand. Was TablePro heute bietet, findest du unter <features>Funktionen</features> und im <changelog>Änderungsprotokoll</changelog> (Englisch).",
            "unnamed": "Dieser am {date} veröffentlichte Beitrag beschreibt TablePro in seinem damaligen Stand. Was TablePro heute bietet, findest du unter <features>Funktionen</features> und im <changelog>Änderungsprotokoll</changelog> (Englisch)."
        },
        "brandedTitle": "{title} – TablePro-Blog",
        "correction": "Korrektur, {date}",
        "toc": "Auf dieser Seite",
        "related": "Ähnliche Beiträge"
    }
} satisfies Messages['blog'];
