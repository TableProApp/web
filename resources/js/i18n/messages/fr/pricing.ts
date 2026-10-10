import type { Messages } from '../../types.ts';

export default {
    "currency": {
        "pattern": "{amount} $US",
        "decimal": ",",
        "group": " "
    },
    "cycles": {
        "legend": "Périodicité de facturation",
        "monthly": "Mensuelle",
        "yearly": "Annuelle",
        "lifetime": "Paiement unique"
    },
    "captions": {
        "monthly": "Renouvellement chaque mois jusqu’à résiliation.",
        "yearly": "Renouvellement chaque année jusqu’à résiliation. {percent} % de moins que douze paiements mensuels.",
        "yearlyByTier": "Renouvellement chaque année jusqu’à résiliation. Starter coûte {starterPercent} % de moins que douze paiements mensuels, Team {teamPercent} % de moins.",
        "lifetime": "Un seul paiement, sans date d’expiration."
    },
    "tiers": {
        "free": {
            "name": "Gratuit",
            "description": "Les outils essentiels pour vos bases, sans période d’essai.",
            "activation": "Aucune inscription nécessaire pour utiliser l’application.",
            "includesTitle": "Comprend",
            "includes": [
                "Connexions à tous les moteurs pris en charge",
                "L’éditeur SQL et la grille de données",
                "L’assistant IA et le serveur MCP",
                "Safe Mode",
                "L’application iPhone et iPad"
            ]
        },
        "starter": {
            "name": "Starter",
            "description": "Ajoute à l’application Mac des fonctionnalités comme {examples}.",
            "activation": {
                "one": "Une personne, {count} Mac.",
                "other": "Une personne, jusqu’à {count} Mac."
            },
            "includesTitle": "Tout ce qui est gratuit, plus",
            "cta": "Acheter Starter"
        },
        "team": {
            "name": "Team",
            "description": "Partagez connexions et requêtes enregistrées avec votre équipe.",
            "activation": "Un Mac activé par poste.",
            "includesTitle": "Tout ce que contient Starter, plus",
            "cta": "Acheter Team"
        }
    },
    "units": {
        "starter": {
            "monthly": "par mois",
            "yearly": "par an",
            "lifetime": "paiement unique"
        },
        "team": {
            "monthly": "par poste et par mois",
            "yearly": "par poste et par an",
            "lifetime": "par poste, paiement unique"
        }
    },
    "seats": {
        "label": "Postes",
        "noun": "postes",
        "bounds": "Minimum {min} postes, maximum {max}.",
        "clamped": {
            "min": "Nombre ajusté au minimum de {min} postes.",
            "max": "Nombre ajusté au maximum de {max} postes."
        },
        "total": {
            "monthly": {
                "one": "{count} poste : {total} par mois",
                "other": "{count} postes : {total} par mois"
            },
            "yearly": {
                "one": "{count} poste : {total} par an",
                "other": "{count} postes : {total} par an"
            },
            "lifetime": {
                "one": "{count} poste : {total}, paiement unique",
                "other": "{count} postes : {total}, paiement unique"
            }
        }
    },
    "prioritySupport": {
        "name": "Assistance prioritaire",
        "detail": {
            "one": "Les e-mails des clients Team sont traités en priorité, sous un jour ouvré.",
            "other": "Les e-mails des clients Team sont traités en priorité, sous {count} jours ouvrés."
        }
    },
    "allFeatures": "Toutes les fonctionnalités payantes",
    "refund": {
        "one": "Toutes les offres payantes peuvent être remboursées dans un délai de {count} jour suivant l’achat, et chaque renouvellement mensuel ou annuel dans un délai de {count} jour suivant son paiement. Voir la <link>politique de remboursement</link>.",
        "other": "Toutes les offres payantes peuvent être remboursées dans les {count} jours suivant l’achat, et chaque renouvellement mensuel ou annuel dans les {count} jours suivant son paiement. Voir la <link>politique de remboursement</link>."
    },
    "finePrint": "Prix en dollars américains. {merchant} gère le paiement et calcule la taxe de vente ou la TVA au paiement en tant que merchant of record.",
    "finePrintCurrency": "Prix en dollars américains.",
    "comparePlans": "Comparer les offres",
    "section": {
        "title": "Tarifs",
        "lead": "TablePro est open source et s’utilise gratuitement. Les offres payantes ajoutent des fonctionnalités facultatives à l’application Mac."
    },
    "matrix": {
        "caption": "Ce que chaque offre comprend dans l’application Mac",
        "feature": "Fonctionnalité",
        "macs": "Mac",
        "macsFree": "Sans licence",
        "macsStarter": {
            "one": "{count}",
            "other": "Jusqu’à {count}"
        },
        "macsTeam": "Un par poste",
        "everythingElse": "Tout le reste de l’application",
        "everythingElseDetail": "Tous les moteurs pris en charge, l’éditeur SQL, l’assistant IA, le serveur MCP et Safe Mode",
        "iphoneNote": "L’application iPhone et iPad n’a aucune fonctionnalité payante. iCloud Sync y est gratuit ; pour synchroniser avec un Mac, celui-ci doit disposer de Starter ou Team."
    },
    "regional": {
        "note": "Prix pour votre pays ({country}) : {percent} % de réduction, appliquée lors du règlement.",
        "listPrice": "Prix catalogue {price}"
    },
    "discount": {
        "atCheckout": "Vous avez un code de réduction ? Saisissez-le lors du règlement.",
        "summary": "Vous avez un code de réduction ?",
        "label": "Code de réduction",
        "apply": "Appliquer le code",
        "checking": "Vérification du code…",
        "percent": "Code accepté : {amount} % de réduction, appliquée lors du règlement.",
        "fixed": "Code accepté : {amount} de réduction, appliquée lors du règlement.",
        "invalid": "Ce code est invalide ou a expiré."
    },
    "checkout": {
        "failed": "Impossible d’ouvrir le paiement. Réessayez."
    },
    "offers": {
        "name": "{plan}, {cycle}",
        "seat": "poste"
    }
} satisfies Messages['pricing'];
