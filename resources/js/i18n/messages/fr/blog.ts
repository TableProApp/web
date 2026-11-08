import type { Messages } from '../../types.ts';

export default {
    "index": {
        "empty": "Aucun article pour le moment.",
        "tabs": {
            "label": "Articles par type",
            "all": "Tous",
            "release": "Versions",
            "guide": "Guides",
            "news": "Actualités"
        },
        "kind": {
            "release": "Version",
            "guide": "Guide",
            "news": "Actualité"
        },
        "pages": {
            "label": "Pages",
            "newer": "Articles plus récents",
            "older": "Articles plus anciens",
            "page": "Page {page} sur {pages}"
        }
    },
    "latest": "Dernier article de version : <post>{title}</post>.",
    "post": {
        "archive": "Publié le {date}. Cet article décrit {release} à sa sortie. Consultez les <features>fonctions actuelles</features> et le <changelog>changelog</changelog> (anglais).",
        "correction": "Correction, {date}",
        "toc": "Sur cette page",
        "pages": "Pages associées",
        "notes": {
            "title": "Notes de version complètes",
            "changelog": "{release} dans le journal des modifications",
            "github": "{release} sur GitHub"
        },
        "related": "Articles associés"
    }
} satisfies Messages['blog'];
