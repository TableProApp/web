import type { Messages } from '../../types.ts';

export default {
    "heading": "Links do site",
    "groups": {
        "product": {
            "title": "Produto",
            "features": "Recursos",
            "databases": "Bancos de dados",
            "pricing": "Preços",
            "download": "Baixar",
            "compare": "Comparar"
        },
        "resources": {
            "title": "Recursos úteis",
            "docs": "Documentação",
            "changelog": "Histórico de alterações",
            "blog": "Blog",
            "faq": "Perguntas frequentes",
            "source": "Código-fonte",
            "reportBug": "Relatar um erro"
        },
        "support": {
            "title": "Suporte",
            "account": "Conta",
            "email": "Suporte por email",
            "chat": "Chat ao vivo"
        },
        "community": {
            "title": "Comunidade",
            "github": "GitHub",
            "discord": "Discord",
            "x": "X",
            "facebook": "Facebook",
            "telegram": "Telegram",
            "sponsor": "Patrocinar TablePro"
        },
        "legal": {
            "title": "Informações legais",
            "privacy": "Privacidade",
            "terms": "Termos",
            "refund": "Política de reembolso",
            "cookies": "Configurações de cookies"
        }
    },
    "newsletter": {
        "title": "Notas de versão por email",
        "body": "Emails ocasionais com notas de versão. Todos os emails têm um link para cancelar a inscrição.",
        "note": "Primeiro enviamos um link de confirmação por email. <link>Política de privacidade</link>"
    },
    "bottom": {
        "copyright": "© {year} TablePro. Código-fonte sob a AGPLv3."
    }
} satisfies Messages['footer'];
