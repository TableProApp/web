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
    },
    "notice": {
        "headline": "−{percent}%",
        "product": "TablePro Pro",
        "window": "Pro de pago único y Pro anual, hasta las {endsAtTime} UTC del {endsOn}.",
        "lifetime": "Pro de pago único",
        "lifetimeDetail": "Pago único. Todas las actualizaciones y funciones nuevas de Pro.",
        "yearly": "Pro anual",
        "buy": "Comprar Pro de pago único por {price}",
        "both": "Ver las dos ofertas",
        "later": "Ahora no",
        "footnote": "Pro mensual y Team no tienen descuento. Precios habituales desde el {listPriceSince}.",
        "card": "Black Friday: −{percent}% en Pro",
        "cardPrice": "Pro de pago único por {price}."
    }
} satisfies Messages['campaign'];
