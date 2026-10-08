import type { Messages } from '../../types.ts';

export default {
    "index": {
        "empty": "Aucun article pour le moment."
    },
    "latest": "Certaines versions font aussi l’objet d’un article sur le blog. Le plus récent est <post>{title}</post>.",
    "post": {
        "archive": "Publié le {date}, cet article décrit {release} tel qu’il était à l’époque. Pour connaître TablePro aujourd’hui, consultez les <features>fonctionnalités</features> et le <changelog>journal des modifications</changelog>.",
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
