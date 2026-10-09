import type { Messages } from '../../types.ts';

export default {
    "index": {
        "empty": "Noch keine Beiträge.",
        "guides": "Anleitungen",
        "releases": "Versionshinweise"
    },
    "latest": "Neuester Versionsbeitrag: <post>{title}</post>.",
    "post": {
        "archive": "Veröffentlicht am {date}. Dieser Beitrag beschreibt {release} zum Veröffentlichungszeitpunkt. Aktuelle <features>Funktionen</features> und Änderungen stehen im <changelog>Changelog</changelog> (Englisch).",
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
