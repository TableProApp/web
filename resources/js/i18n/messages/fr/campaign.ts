import type { Messages } from '../../types.ts';

export default {
    "name": "Black Friday",
    "banner": {
        "label": "Promotion Black Friday",
        "message": "Pro à −{percent} % : paiement unique et annuel.",
        "short": "−{percent} % sur Pro",
        "cta": "Voir l’offre",
        "close": "Fermer l’annonce Black Friday"
    },
    "band": {
        "title": "{percent} % de réduction sur TablePro Pro",
        "lead": "Pro en paiement unique coûte {lifetime} au lieu de {lifetimeList}, et Pro annuel {yearly} au lieu de {yearlyList} la première année.",
        "cta": "Voir l’offre",
        "onPricing": "Les prix de Pro ci-dessous en tiennent déjà compte."
    },
    "offer": {
        "tag": "Black Friday : −{percent} %",
        "firstYear": "La première année, puis {price} par an.",
        "listPrice": "Prix catalogue {price}"
    },
    "code": {
        "label": "Code",
        "applied": "Appliqué automatiquement quand vous achetez sur ce site.",
        "copyLabel": "le code de réduction"
    },
    "countdown": {
        "endsIn": "Fin dans",
        "startsIn": "Début dans",
        "until": "Jusqu’au {date} à {time} UTC",
        "from": "À partir du {date} à {time} UTC",
        "units": {
            "days": {
                "one": "jour",
                "other": "jours"
            },
            "hours": "heures",
            "minutes": "min",
            "seconds": "s"
        }
    }
} satisfies Messages['campaign'];
