import type { Messages } from '../../types.ts';

export default {
    "name": "Black Friday",
    "banner": {
        "label": "Promozione Black Friday",
        "message": "−{percent}% su Pro, una tantum e annuale.",
        "short": "−{percent}% su Pro",
        "cta": "Vedi l’offerta",
        "close": "Chiudi l’avviso del Black Friday"
    },
    "offer": {
        "tag": "Black Friday: −{percent}%",
        "firstYear": "Per il primo anno, poi {price} all’anno.",
        "listPrice": "Prezzo di listino {price}"
    },
    "code": {
        "label": "Codice",
        "applied": "Applicato automaticamente quando acquisti da questo sito.",
        "copyLabel": "il codice sconto"
    },
    "countdown": {
        "endsIn": "Termina tra",
        "startsIn": "Inizia tra",
        "until": "Fino al {date} alle {time} UTC",
        "from": "Dal {date} alle {time} UTC",
        "units": {
            "days": {
                "one": "giorno",
                "other": "giorni"
            },
            "hours": "ore",
            "minutes": "min",
            "seconds": "sec"
        }
    }
} satisfies Messages['campaign'];
