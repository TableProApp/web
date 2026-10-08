import type { Messages } from '../../types.ts';

export default {
    "heading": "Enlaces del sitio",
    "groups": {
        "product": {
            "title": "Producto",
            "features": "Funciones",
            "databases": "Bases de datos",
            "pricing": "Precios",
            "download": "Descargar",
            "compare": "Comparar"
        },
        "resources": {
            "title": "Recursos",
            "docs": "Documentación",
            "changelog": "Historial de cambios",
            "blog": "Blog",
            "faq": "Preguntas frecuentes",
            "source": "Código fuente",
            "reportBug": "Informar de un error"
        },
        "support": {
            "title": "Soporte",
            "account": "Cuenta",
            "email": "Soporte por correo",
            "chat": "Chat en directo"
        },
        "community": {
            "title": "Comunidad",
            "discord": "Discord",
            "x": "X",
            "facebook": "Facebook",
            "telegram": "Telegram",
            "sponsor": "Patrocinar TablePro"
        },
        "legal": {
            "title": "Legal",
            "privacy": "Privacidad",
            "terms": "Condiciones",
            "refund": "Política de reembolso",
            "cookies": "Configuración de cookies"
        }
    },
    "newsletter": {
        "title": "Notas de versión por correo",
        "body": "Correos ocasionales con notas de versión. Todos incluyen un enlace para darse de baja.",
        "note": "Primero te enviamos un enlace de confirmación. <link>Política de privacidad</link>"
    },
    "bottom": {
        "copyright": "© {year} TablePro. Código fuente bajo AGPLv3."
    }
} satisfies Messages['footer'];
