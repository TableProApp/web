import type { Messages } from '../../types.ts';

export default {
    "currency": {
        "pattern": "{amount} US$",
        "decimal": ",",
        "group": "."
    },
    "cycles": {
        "legend": "Ciclo de facturación",
        "monthly": "Mensual",
        "yearly": "Anual",
        "lifetime": "Pago único"
    },
    "captions": {
        "monthly": "Se renueva cada mes hasta que canceles.",
        "yearly": "Se renueva cada año hasta que canceles. Un {percent}% menos que doce pagos mensuales.",
        "yearlyByTier": "Se renueva cada año hasta que canceles. Pro cuesta un {starterPercent}% menos que doce pagos mensuales; Team, un {teamPercent}% menos.",
        "lifetime": "Un solo pago, sin fecha de caducidad."
    },
    "tiers": {
        "free": {
            "name": "Gratis",
            "description": "Herramientas básicas de bases de datos, sin periodo de prueba.",
            "activation": "No necesitas registrarte para usar la app.",
            "includesTitle": "Incluye",
            "includes": [
                "Conexiones a cualquier motor compatible",
                "El editor SQL y la cuadrícula de datos",
                "El asistente de IA y el servidor MCP",
                "Safe Mode",
                "La app para iPhone y iPad"
            ]
        },
        "starter": {
            "name": "Pro",
            "description": "Añade a la app para Mac funciones como {examples}.",
            "activation": {
                "one": "Una persona, {count} Mac.",
                "other": "Una persona, hasta {count} Mac."
            },
            "includesTitle": "Todo lo del plan Gratis, más",
            "cta": "Comprar Pro"
        },
        "team": {
            "name": "Team",
            "description": "Comparte conexiones y consultas guardadas con tu equipo.",
            "activation": "Un Mac activado por puesto.",
            "includesTitle": "Todo lo de Pro, más",
            "cta": "Comprar Team",
            "subscriptionOnly": "Team se vende con pago mensual o anual."
        },
        "enterprise": {
            "name": "Enterprise",
            "description": "Para empresas que necesitan más control sobre cómo se usa TablePro.",
            "price": "Contáctanos",
            "activation": "Precio por empresa.",
            "includesTitle": "Cuéntanos qué necesitas, por ejemplo",
            "includes": [
                "Inicio de sesión con las cuentas de tu empresa",
                "Políticas obligatorias en las conexiones del equipo",
                "Auditoría de escrituras en producción",
                "Despliegue mediante MDM",
                "Facturas y órdenes de compra"
            ],
            "cta": "Contáctanos"
        }
    },
    "units": {
        "starter": {
            "monthly": "al mes",
            "yearly": "al año",
            "lifetime": "pago único"
        },
        "team": {
            "monthly": "por puesto, al mes",
            "yearly": "por puesto, al mes, facturado anualmente"
        }
    },
    "seats": {
        "label": "Puestos",
        "noun": "puestos",
        "bounds": "Mínimo {min} puestos, máximo {max}.",
        "clamped": {
            "min": "Se ha cambiado al mínimo, {min} puestos.",
            "max": "Se ha cambiado al máximo, {max} puestos."
        },
        "total": {
            "monthly": {
                "one": "{count} puesto: {total} al mes",
                "other": "{count} puestos: {total} al mes"
            },
            "yearly": {
                "one": "{count} puesto: {total} al año",
                "other": "{count} puestos: {total} al año"
            }
        }
    },
    "prioritySupport": {
        "name": "Soporte prioritario",
        "detail": {
            "one": "Los correos de los clientes de Team se responden primero, en el plazo de un día laborable.",
            "other": "Los correos de los clientes de Team se responden primero, en un plazo de {count} días laborables."
        }
    },
    "allFeatures": "Todas las funciones de pago",
    "refund": {
        "one": "Todos los planes de pago se pueden reembolsar en el plazo de {count} día desde la compra, y cada renovación mensual o anual en el plazo de {count} día desde su cobro. Consulta la <link>política de reembolso</link>.",
        "other": "Todos los planes de pago se pueden reembolsar en los {count} días siguientes a la compra, y cada renovación mensual o anual en los {count} días siguientes a su cobro. Consulta la <link>política de reembolso</link>."
    },
    "finePrint": "Precios en dólares estadounidenses. {merchant} gestiona el pago y calcula el impuesto sobre ventas o el IVA al pagar, como merchant of record.",
    "finePrintCurrency": "Precios en dólares estadounidenses.",
    "comparePlans": "Comparar planes",
    "section": {
        "title": "Precios",
        "lead": "TablePro es de código abierto y se puede usar gratis. Los planes de pago añaden funciones opcionales a la app para Mac."
    },
    "matrix": {
        "caption": "Qué incluye cada plan en la app para Mac",
        "feature": "Función",
        "macs": "Mac",
        "macsFree": "Sin licencia",
        "macsStarter": {
            "one": "{count}",
            "other": "Hasta {count}"
        },
        "macsTeam": "Uno por puesto",
        "everythingElse": "Todo lo demás en la app",
        "everythingElseDetail": "Todos los motores compatibles, el editor SQL, el asistente de IA, el servidor MCP y Safe Mode",
        "iphoneNote": "La app para iPhone y iPad no tiene funciones de pago. iCloud Sync es gratis en ella; para sincronizar con un Mac, este necesita Pro o Team."
    },
    "regional": {
        "note": "Precios para tu país ({country}): {percent}% de descuento, aplicado al finalizar la compra.",
        "listPrice": "Precio de lista {price}"
    },
    "discount": {
        "atCheckout": "¿Tienes un código de descuento? Introdúcelo al finalizar la compra.",
        "summary": "¿Tienes un código de descuento?",
        "label": "Código de descuento",
        "apply": "Aplicar código",
        "checking": "Comprobando el código…",
        "percent": "Código aceptado: {amount}% de descuento, aplicado al finalizar la compra.",
        "fixed": "Código aceptado: {amount} de descuento, aplicado al finalizar la compra.",
        "invalid": "Este código no es válido o ha caducado."
    },
    "checkout": {
        "failed": "No se pudo abrir el pago. Inténtalo de nuevo."
    },
    "offers": {
        "name": "{plan}, {cycle}",
        "seat": "puesto"
    }
} satisfies Messages['pricing'];
