import type { Messages } from '../../types.ts';

export default {
    "language": {
        "label": "Idioma",
        "current": "Idioma: {language}",
        "fallback": "Esta página não está disponível em português",
        "fallbackPost": "Este artigo não está em português",
        "fallbackBlog": "Ver a lista de artigos"
    },
    "theme": {
        "label": "Tema",
        "current": "Tema: {choice}",
        "light": "Claro",
        "dark": "Escuro",
        "system": "Sistema"
    },
    "copy": {
        "copy": "Copiar",
        "copied": "Copiado",
        "copyNamed": "Copiar {label}",
        "failed": "Não foi possível copiar. Selecione o texto e copie."
    },
    "stepper": {
        "decrease": "Diminuir {label}",
        "increase": "Aumentar {label}"
    },
    "availability": {
        "included": "Incluído",
        "notIncluded": "Não incluído"
    },
    "dismiss": "Dispensar",
    "close": "Fechar"
} satisfies Messages['controls'];
