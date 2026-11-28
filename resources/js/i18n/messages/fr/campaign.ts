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
    },
    "notice": {
        "headline": "−{percent} %",
        "product": "TablePro Pro",
        "window": "Pro en paiement unique et Pro annuel, jusqu’au {endsOn} à {endsAtTime} UTC.",
        "lifetime": "Pro en paiement unique",
        "lifetimeDetail": "Paiement unique. Toutes les mises à jour et nouvelles fonctions Pro.",
        "yearly": "Pro annuel",
        "buy": "Acheter Pro en paiement unique pour {price}",
        "both": "Voir les deux offres",
        "later": "Pas maintenant",
        "footnote": "Pro mensuel et Team ne sont pas en promotion. Prix habituels depuis le {listPriceSince}.",
        "card": "Black Friday : −{percent} % sur Pro",
        "cardPrice": "Pro en paiement unique pour {price}."
    }
} satisfies Messages['campaign'];
