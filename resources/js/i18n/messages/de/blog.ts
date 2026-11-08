import type { Messages } from '../../types.ts';

export default {
    "index": {
        "empty": "Noch keine Beiträge.",
        "tabs": {
            "label": "Beiträge nach Art",
            "all": "Alle",
            "release": "Versionen",
            "guide": "Anleitungen",
            "news": "Neuigkeiten"
        },
        "kind": {
            "release": "Version",
            "guide": "Anleitung",
            "news": "Neuigkeit"
        },
        "pages": {
            "label": "Seiten",
            "newer": "Neuere Beiträge",
            "older": "Ältere Beiträge",
            "page": "Seite {page} von {pages}"
        }
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
