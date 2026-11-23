import type { Messages } from '../../types.ts';

export default {
    "name": "Black Friday",
    "banner": {
        "label": "Promoção de Black Friday",
        "message": "−{percent}% no Pro, pagamento único e anual.",
        "short": "−{percent}% no Pro",
        "cta": "Veja a oferta",
        "close": "Fechar o aviso da Black Friday"
    },
    "offer": {
        "tag": "Black Friday: −{percent}%",
        "firstYear": "No primeiro ano; depois, {price} por ano.",
        "listPrice": "Preço de tabela {price}"
    },
    "code": {
        "label": "Código",
        "applied": "Aplicado automaticamente quando você compra neste site.",
        "copyLabel": "o código de desconto"
    },
    "countdown": {
        "endsIn": "Termina em",
        "startsIn": "Começa em",
        "until": "Até {date}, às {time} UTC",
        "from": "A partir de {date}, às {time} UTC",
        "units": {
            "days": {
                "one": "dia",
                "other": "dias"
            },
            "hours": "horas",
            "minutes": "min",
            "seconds": "seg"
        }
    }
} satisfies Messages['campaign'];
