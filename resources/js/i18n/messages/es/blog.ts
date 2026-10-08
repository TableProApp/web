import type { Messages } from '../../types.ts';

export default {
    "index": {
        "empty": "Todavía no hay publicaciones.",
        "guides": "Guías",
        "releases": "Notas de versión"
    },
    "latest": "Algunas versiones también tienen una publicación en el blog. La más reciente es <post>{title}</post>.",
    "post": {
        "archive": "Publicada el {date}, esta entrada describe {release} tal como era entonces. Para conocer TablePro hoy, consulta las <features>funciones</features> y el <changelog>historial de cambios</changelog> (inglés).",
        "correction": "Corrección, {date}",
        "toc": "En esta página",
        "pages": "Páginas relacionadas",
        "notes": {
            "title": "Notas de versión completas",
            "changelog": "{release} en el historial de cambios",
            "github": "{release} en GitHub"
        },
        "related": "Publicaciones relacionadas"
    }
} satisfies Messages['blog'];
