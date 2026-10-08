import type { Messages } from '../../types.ts';

export default {
    "index": {
        "empty": "Noch keine Beiträge."
    },
    "latest": "Zu manchen Versionen gibt es auch einen Beitrag im Blog. Der neueste ist <post>{title}</post>.",
    "post": {
        "archive": "Dieser am {date} veröffentlichte Beitrag beschreibt {release} in seinem damaligen Stand. Was TablePro heute bietet, findest du unter <features>Funktionen</features> und im <changelog>Änderungsprotokoll</changelog>.",
        "correction": "Korrektur, {date}",
        "toc": "Auf dieser Seite",
        "pages": "Verwandte Seiten",
        "notes": {
            "title": "Vollständige Versionshinweise",
            "changelog": "{release} im Änderungsprotokoll",
            "github": "{release} auf GitHub"
        },
        "related": "Ähnliche Beiträge"
    }
} satisfies Messages['blog'];
