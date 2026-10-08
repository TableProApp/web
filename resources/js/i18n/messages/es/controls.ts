import type { Messages } from '../../types.ts';

export default {
    "language": {
        "label": "Idioma",
        "current": "Idioma: {language}",
        "fallback": "Esta página no está disponible en español",
        "fallbackPost": "Esta publicación no está en español",
        "fallbackBlog": "Ver la lista de publicaciones"
    },
    "theme": {
        "label": "Tema",
        "current": "Tema: {choice}",
        "light": "Claro",
        "dark": "Oscuro",
        "system": "Sistema"
    },
    "copy": {
        "copy": "Copiar",
        "copied": "Copiado",
        "copyNamed": "Copiar {label}",
        "failed": "No se pudo copiar. Selecciona el texto y cópialo."
    },
    "stepper": {
        "decrease": "Reducir {label}",
        "increase": "Aumentar {label}"
    },
    "availability": {
        "included": "Incluido",
        "notIncluded": "No incluido"
    },
    "dismiss": "Descartar",
    "close": "Cerrar"
} satisfies Messages['controls'];
