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
        "yearlyByTier": "Se renueva cada año hasta que canceles. Starter cuesta un {starterPercent}% menos que doce pagos mensuales; Team, un {teamPercent}% menos.",
        "lifetime": "Un solo pago, sin fecha de caducidad."
    },
    "tiers": {
        "free": {
            "name": "Gratis",
            "description": "La app para Mac sin las funciones de pago, y la app para iPhone y iPad.",
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
            "name": "Starter",
            "description": "Añade a la app para Mac funciones como {examples}.",
            "activation": {
                "one": "Una licencia para una persona, en {count} Mac.",
                "other": "Una licencia para una persona, en hasta {count} Mac."
            },
            "includesTitle": "Todo lo del plan Gratis, más",
            "cta": "Comprar Starter"
        },
        "team": {
            "name": "Team",
            "description": "Además de Starter, añade conexiones y consultas compartidas con tu equipo.",
            "activation": "Cada puesto corresponde a un Mac activado.",
            "includesTitle": "Todo lo de Starter, más",
            "cta": "Comprar Team"
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
            "yearly": "por puesto, al año",
            "lifetime": "por puesto, pago único"
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
            },
            "lifetime": {
                "one": "{count} puesto: {total}, pago único",
                "other": "{count} puestos: {total}, pago único"
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
    "finePrint": "Precios en dólares estadounidenses. {merchant} es el merchant of record: recibe el pago y calcula los impuestos sobre ventas o el IVA al finalizar la compra.",
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
        "iphoneNote": "La app para iPhone y iPad no tiene funciones de pago. iCloud Sync es gratis en ella; para sincronizar con un Mac, este necesita Starter o Team."
    },
    "discount": {
        "atCheckout": "¿Tienes un código de descuento? Introdúcelo al finalizar la compra.",
        "summary": "¿Tienes un código de descuento?",
        "label": "Código de descuento",
        "apply": "Aplicar código",
        "checking": "Comprobando el código…",
        "percent": "Código aceptado: {amount}% de descuento, aplicado al finalizar la compra.",
        "fixed": "Código aceptado: {amount} de descuento, aplicado al finalizar la compra.",
        "invalid": "Ese código de descuento no es válido o ha caducado."
    },
    "checkout": {
        "failed": "No se pudo iniciar la compra. Vuelve a intentarlo."
    },
    "offers": {
        "name": "{plan}, {cycle}",
        "seat": "puesto"
    }
} satisfies Messages['pricing'];
