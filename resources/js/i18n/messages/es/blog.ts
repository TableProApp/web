import type { Messages } from '../../types.ts';

export default {
    "index": {
        "empty": "Todavía no hay publicaciones.",
        "guides": "Guías",
        "releases": "Notas de versión"
    },
    "latest": "Último artículo de versión: <post>{title}</post>.",
    "post": {
        "archive": "Publicado el {date}. Este artículo describe {release} en el momento de su lanzamiento. Consulta las <features>funciones actuales</features> y el <changelog>changelog</changelog> (inglés).",
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
