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
    },
    "notice": {
        "headline": "−{percent}%",
        "product": "TablePro Pro",
        "window": "Pro de pagamento único e Pro anual, até {endsOn}, às {endsAtTime} UTC.",
        "lifetime": "Pro de pagamento único",
        "lifetimeDetail": "Pagamento único. Todas as atualizações e novos recursos do Pro.",
        "yearly": "Pro anual",
        "buy": "Comprar Pro de pagamento único por {price}",
        "both": "Ver as duas ofertas",
        "later": "Agora não",
        "footnote": "O Pro mensal e o Team não estão em promoção. Preços normais desde {listPriceSince}.",
        "card": "Black Friday: −{percent}% no Pro",
        "cardPrice": "Pro de pagamento único por {price}."
    }
} satisfies Messages['campaign'];
