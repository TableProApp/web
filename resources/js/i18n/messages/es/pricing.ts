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
                "Todos los motores compatibles",
                "Editor SQL y cuadrícula de datos",
                "Asistente de IA y servidor MCP",
                "Safe Mode",
                "App para iPhone y iPad"
            ]
        },
        "starter": {
            "name": "Pro",
            "description": "Las funciones de pago, para una persona.",
            "activation": {
                "one": "Una persona, {count} ordenador, Mac o Linux.",
                "other": "Una persona, hasta {count} ordenadores, Mac o Linux."
            },
            "includesTitle": "Todo lo del plan Gratis, más",
            "cta": "Comprar Pro"
        },
        "team": {
            "name": "Team",
            "description": "Pro para todos, y conexiones compartidas.",
            "activation": {
                "one": "Una persona por puesto, en {count} ordenador, Mac o Linux.",
                "other": "Una persona por puesto, en hasta {count} ordenadores, Mac o Linux."
            },
            "includesTitle": "Todo lo de Pro, más",
            "cta": "Comprar Team",
            "subscriptionOnly": "Team se vende con pago mensual o anual."
        },
        "enterprise": {
            "name": "Enterprise",
            "description": "Inicio de sesión con las cuentas de tu empresa, políticas obligatorias, registro de auditoría, MDM, órdenes de compra.",
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
        "minimum": "Mínimo {min} puestos.",
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
        "one": "Reembolsos en el plazo de {count} día desde una compra o una renovación (<link>política de reembolso</link>).",
        "other": "Reembolsos en los {count} días siguientes a una compra o una renovación (<link>política de reembolso</link>)."
    },
    "finePrint": "Precios en dólares estadounidenses; {merchant} añade el impuesto sobre ventas o el IVA al pagar.",
    "comparePlans": "Comparar planes",
    "section": {
        "title": "Precios",
        "lead": "TablePro es de código abierto y se puede usar gratis. Los planes de pago añaden funciones opcionales."
    },
    "matrix": {
        "caption": "Qué incluye cada plan",
        "feature": "Función",
        "groups": {
            "starter": "En Pro y Team",
            "team": "En Team",
            "all": "En todos los planes"
        },
        "macs": "Ordenadores",
        "macsFree": "Sin licencia",
        "macsStarter": {
            "one": "{count}, Mac o Linux",
            "other": "Hasta {count}, Mac o Linux"
        },
        "macsTeam": {
            "one": "{count} por puesto, Mac o Linux",
            "other": "Hasta {count} por puesto, Mac o Linux"
        },
        "everythingElse": "Todo lo demás en la app",
        "everythingElseDetail": "Todos los motores compatibles, el editor SQL, el asistente de IA, el servidor MCP y Safe Mode",
        "iphoneNote": "La app para iPhone y iPad no tiene funciones de pago. iCloud Sync es gratis en ella; para sincronizar con un Mac, este necesita Pro o Team."
    },
    "regional": {
        "note": "Precios para tu país ({country}): {percent}% de descuento, aplicado al finalizar la compra.",
        "listPrice": "Precio de lista {price}"
    },
    "discount": {
        "summary": "¿Tienes un código de descuento?",
        "label": "Código de descuento",
        "apply": "Aplicar código",
        "checking": "Comprobando el código…",
        "percent": "Código aceptado: {amount}% de descuento, aplicado al finalizar la compra.",
        "fixed": "Código aceptado: {amount} de descuento, aplicado al finalizar la compra.",
        "accepted": "Código aceptado, aplicado al finalizar la compra.",
        "invalid": "Este código no es válido o ha caducado."
    },
    "checkout": {
        "failed": "No se pudo abrir el pago. Inténtalo de nuevo.",
        "planUnavailable": "Este plan no está a la venta ahora mismo. Elige otro ciclo de facturación o inténtalo más tarde.",
        "seats": "Elige entre {min} y {max} puestos e inténtalo de nuevo.",
        "seatsFewer": "Elige menos puestos e inténtalo de nuevo."
    },
    "offers": {
        "name": "{plan}, {cycle}",
        "seat": "puesto"
    }
} satisfies Messages['pricing'];
