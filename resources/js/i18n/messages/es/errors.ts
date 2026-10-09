import type { Messages } from '../../types.ts';

export default {
    "status": "Error {status}",
    "notFound": {
        "title": "Página no encontrada",
        "body": "Comprueba la dirección o usa uno de los enlaces siguientes."
    },
    "gone": {
        "title": "Esta página se ha eliminado",
        "body": "Ya no forma parte de tablepro.app y ninguna otra página la sustituye."
    },
    "serverError": {
        "title": "Algo ha fallado",
        "body": "El problema está de nuestro lado. Vuelve a intentarlo en un momento. Si persiste, escribe a {email}."
    },
    "unavailable": {
        "title": "En mantenimiento",
        "body": "tablepro.app volverá en breve."
    },
    "translation": {
        "title": "Esta página solo está disponible en {language}",
        "body": "Todavía no se ha traducido.",
        "link": "Leer en {language}"
    },
    "account": {
        "body": "Tu cuenta tiene una única dirección para todos los idiomas. Ábrela aquí; se mostrará en el idioma seleccionado.",
        "link": "Abrir tu cuenta"
    },
    "languages": {
        "en": "inglés",
        "vi": "vietnamita",
        "es": "español",
        "de": "alemán",
        "fr": "francés",
        "ja": "japonés",
        "pt-BR": "portugués de Brasil",
        "zh-Hans": "chino simplificado",
        "ko": "coreano",
        "zh-Hant": "chino tradicional",
        "it": "italiano",
        "id": "indonesio"
    },
    "linksLabel": "Páginas para empezar",
    "links": {
        "home": "Inicio",
        "features": "Funciones",
        "databases": "Bases de datos",
        "download": "Descargar",
        "blog": "Blog"
    }
} satisfies Messages['errors'];
