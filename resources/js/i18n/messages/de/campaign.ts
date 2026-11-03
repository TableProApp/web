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
    "band": {
        "title": "{percent} % Rabatt auf TablePro Pro",
        "lead": "Pro einmalig kostet {lifetime} statt {lifetimeList}, Pro jährlich im ersten Jahr {yearly} statt {yearlyList}.",
        "cta": "Zum Angebot",
        "onPricing": "Die Pro-Preise unten enthalten den Rabatt bereits."
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
    }
} satisfies Messages['campaign'];
