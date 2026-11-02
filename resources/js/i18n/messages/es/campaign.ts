import type { Messages } from '../../types.ts';

export default {
    "name": "Black Friday",
    "banner": {
        "label": "Oferta de Black Friday",
        "message": "−{percent}% en Pro, pago único y anual.",
        "short": "−{percent}% en Pro",
        "cta": "Ver la oferta",
        "close": "Cerrar el aviso de Black Friday"
    },
    "band": {
        "title": "{percent}% de descuento en TablePro Pro",
        "lead": "Pro de pago único cuesta {lifetime} en lugar de {lifetimeList}, y Pro anual cuesta {yearly} en lugar de {yearlyList} el primer año.",
        "cta": "Ver la oferta",
        "onPricing": "Los precios de Pro que ves abajo ya incluyen el descuento."
    },
    "offer": {
        "tag": "Black Friday: −{percent}%",
        "firstYear": "Durante el primer año; después, {price} al año.",
        "listPrice": "Precio de lista {price}"
    },
    "code": {
        "label": "Código",
        "applied": "Se aplica automáticamente al comprar en este sitio.",
        "copyLabel": "el código de descuento"
    },
    "countdown": {
        "endsIn": "Termina en",
        "startsIn": "Empieza en",
        "until": "Hasta el {date} a las {time} UTC",
        "from": "Desde el {date} a las {time} UTC",
        "units": {
            "days": {
                "one": "día",
                "other": "días"
            },
            "hours": "horas",
            "minutes": "min",
            "seconds": "s"
        }
    }
} satisfies Messages['campaign'];
