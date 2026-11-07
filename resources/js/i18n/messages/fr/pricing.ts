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
        "yearlyByTier": "Renouvellement chaque année jusqu’à résiliation. Pro coûte {starterPercent} % de moins que douze paiements mensuels, Team {teamPercent} % de moins.",
        "lifetime": "Un seul paiement, sans date d’expiration."
    },
    "tiers": {
        "free": {
            "name": "Gratuit",
            "description": "Les outils essentiels pour vos bases, sans période d’essai.",
            "activation": "Aucune inscription nécessaire pour utiliser l’application.",
            "includesTitle": "Comprend",
            "includes": [
                "Tous les moteurs pris en charge",
                "Éditeur SQL et grille de données",
                "Assistant IA et serveur MCP",
                "Safe Mode",
                "Application iPhone et iPad"
            ]
        },
        "starter": {
            "name": "Pro",
            "description": "Les fonctionnalités payantes, pour une personne.",
            "activation": {
                "one": "Une personne, {count} ordinateur, Mac ou Linux.",
                "other": "Une personne, jusqu’à {count} ordinateurs, Mac ou Linux."
            },
            "includesTitle": "Tout ce qui est gratuit, plus",
            "cta": "Acheter Pro"
        },
        "team": {
            "name": "Team",
            "description": "Pro pour tous, et des connexions partagées.",
            "activation": {
                "one": "Une personne par poste, {count} ordinateur, Mac ou Linux.",
                "other": "Une personne par poste, jusqu’à {count} ordinateurs, Mac ou Linux."
            },
            "includesTitle": "Tout ce que contient Pro, plus",
            "cta": "Acheter Team",
            "subscriptionOnly": "Team est vendu au mois ou à l’année."
        },
        "enterprise": {
            "name": "Enterprise",
            "description": "Connexion avec les comptes de votre entreprise, règles imposées, journal d’audit, MDM, bons de commande.",
            "cta": "Nous contacter"
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
            "yearly": "par poste et par mois, facturé à l’année"
        }
    },
    "seats": {
        "label": "Postes",
        "noun": "postes",
        "minimum": "Minimum {min} postes.",
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
        "one": "Remboursement dans un délai de {count} jour après un achat ou un renouvellement (<link>politique de remboursement</link>).",
        "other": "Remboursement dans les {count} jours suivant un achat ou un renouvellement (<link>politique de remboursement</link>)."
    },
    "finePrint": "Prix en dollars américains ; {merchant} ajoute la taxe de vente ou la TVA au paiement.",
    "comparePlans": "Comparer les offres",
    "section": {
        "title": "Tarifs",
        "lead": "TablePro est open source et s’utilise gratuitement. Les offres payantes ajoutent des fonctionnalités facultatives à l’application Mac."
    },
    "matrix": {
        "caption": "Ce que chaque offre comprend dans l’application Mac",
        "feature": "Fonctionnalité",
        "groups": {
            "starter": "Dans Pro et Team",
            "team": "Dans Team",
            "all": "Dans toutes les offres"
        },
        "macs": "Ordinateurs",
        "macsFree": "Sans licence",
        "macsStarter": {
            "one": "{count}, Mac ou Linux",
            "other": "Jusqu’à {count}, Mac ou Linux"
        },
        "macsTeam": {
            "one": "{count} par poste, Mac ou Linux",
            "other": "Jusqu’à {count} par poste, Mac ou Linux"
        },
        "everythingElse": "Tout le reste de l’application",
        "everythingElseDetail": "Tous les moteurs pris en charge, l’éditeur SQL, l’assistant IA, le serveur MCP et Safe Mode",
        "iphoneNote": "L’application iPhone et iPad n’a aucune fonctionnalité payante. iCloud Sync y est gratuit ; pour synchroniser avec un Mac, celui-ci doit disposer de Pro ou Team."
    },
    "regional": {
        "note": "Prix pour votre pays ({country}) : {percent} % de réduction, appliquée lors du règlement.",
        "listPrice": "Prix catalogue {price}"
    },
    "discount": {
        "summary": "Vous avez un code de réduction ?",
        "label": "Code de réduction",
        "apply": "Appliquer le code",
        "checking": "Vérification du code…",
        "percent": "Code accepté : {amount} % de réduction, appliquée lors du règlement.",
        "fixed": "Code accepté : {amount} de réduction, appliquée lors du règlement.",
        "accepted": "Code accepté, appliqué lors du règlement.",
        "invalid": "Ce code est invalide ou a expiré."
    },
    "checkout": {
        "failed": "Impossible d’ouvrir le paiement. Réessayez.",
        "planUnavailable": "Cette offre n’est pas en vente pour le moment. Choisissez une autre périodicité de facturation ou réessayez plus tard.",
        "seats": "Choisissez entre {min} et {max} postes, puis réessayez.",
        "seatsFewer": "Choisissez moins de postes, puis réessayez."
    },
    "offers": {
        "name": "{plan}, {cycle}",
        "seat": "poste"
    }
} satisfies Messages['pricing'];
