import type { Messages } from '../../types.ts';

export default {
    "index": {
        "empty": "Aucun article pour le moment."
    },
    "post": {
        "archive": {
            "named": "Publié le {date}, cet article décrit {release} tel qu’il était à l’époque. Pour connaître TablePro aujourd’hui, consultez les <features>fonctionnalités</features> et le <changelog>journal des modifications</changelog> (anglais).",
            "unnamed": "Publié le {date}, cet article décrit TablePro tel qu’il était à l’époque. Pour connaître TablePro aujourd’hui, consultez les <features>fonctionnalités</features> et le <changelog>journal des modifications</changelog> (anglais)."
        },
        "brandedTitle": "{title} – Blog TablePro",
        "correction": "Correction, {date}",
        "toc": "Sur cette page",
        "related": "Articles associés"
    }
} satisfies Messages['blog'];
