import type { Messages } from '../../types.ts';

export default {
    "name": "Black Friday",
    "banner": {
        "label": "Black-Friday-Aktion",
        "message": "{percent} % Rabatt: Pro einmalig und jährlich.",
        "short": "{percent} % auf Pro",
        "cta": "Zum Angebot",
        "close": "Black-Friday-Hinweis schließen"
    },
    "offer": {
        "tag": "Black Friday: {percent} % Rabatt",
        "firstYear": "Im ersten Jahr, danach {price} pro Jahr.",
        "listPrice": "Listenpreis {price}"
    },
    "code": {
        "label": "Code",
        "applied": "Wird beim Kauf auf dieser Website automatisch eingelöst.",
        "copyLabel": "Rabattcode"
    },
    "countdown": {
        "endsIn": "Läuft noch",
        "startsIn": "Bis zum Start",
        "until": "Bis zum {date}, {time} UTC",
        "from": "Ab dem {date}, {time} UTC",
        "units": {
            "days": {
                "one": "Tag",
                "other": "Tage"
            },
            "hours": "Stunden",
            "minutes": "Min.",
            "seconds": "Sek."
        }
    },
    "notice": {
        "headline": "{percent} % Rabatt",
        "product": "TablePro Pro",
        "window": "Pro einmalig und Pro jährlich, bis zum {endsOn}, {endsAtTime} UTC.",
        "lifetime": "Pro einmalig",
        "lifetimeDetail": "Einmalige Zahlung. Alle Updates und neuen Pro-Funktionen.",
        "yearly": "Pro jährlich",
        "buy": "Pro einmalig für {price} kaufen",
        "both": "Beide Angebote ansehen",
        "later": "Nicht jetzt",
        "footnote": "Pro monatlich und Team sind nicht reduziert. Reguläre Preise seit dem {listPriceSince}.",
        "card": "Black Friday: {percent} % Rabatt auf Pro",
        "cardPrice": "Pro einmalig für {price}."
    }
} satisfies Messages['campaign'];
