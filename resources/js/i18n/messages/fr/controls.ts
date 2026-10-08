import type { Messages } from '../../types.ts';

export default {
    "language": {
        "label": "Langue",
        "current": "Langue : {language}",
        "fallback": "Cette page n’est pas disponible en français",
        "fallbackPost": "Cet article n’est pas en français",
        "fallbackBlog": "Voir la liste des articles"
    },
    "theme": {
        "label": "Thème",
        "current": "Thème : {choice}",
        "light": "Clair",
        "dark": "Sombre",
        "system": "Système"
    },
    "copy": {
        "copy": "Copier",
        "copied": "Copié",
        "copyNamed": "Copier {label}",
        "failed": "Impossible de copier. Sélectionnez le texte et copiez-le."
    },
    "stepper": {
        "decrease": "Diminuer {label}",
        "increase": "Augmenter {label}"
    },
    "availability": {
        "included": "Inclus",
        "notIncluded": "Non inclus"
    },
    "dismiss": "Ignorer",
    "close": "Fermer"
} satisfies Messages['controls'];
