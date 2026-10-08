import type { Messages } from '../../types.ts';

export default {
    "index": {
        "empty": "Todavía no hay publicaciones."
    },
    "post": {
        "archive": {
            "named": "Publicada el {date}, esta entrada describe {release} tal como era entonces. Para conocer TablePro hoy, consulta las <features>funciones</features> y el <changelog>historial de cambios</changelog> (inglés).",
            "unnamed": "Publicada el {date}, esta entrada describe TablePro tal como era entonces. Para conocer TablePro hoy, consulta las <features>funciones</features> y el <changelog>historial de cambios</changelog> (inglés)."
        },
        "brandedTitle": "{title} – Blog de TablePro",
        "correction": "Corrección, {date}",
        "toc": "En esta página",
        "related": "Publicaciones relacionadas"
    }
} satisfies Messages['blog'];
