import type { Messages } from '../../types.ts';

export default {
    "status": "Erreur {status}",
    "notFound": {
        "title": "Page introuvable",
        "body": "L’adresse est peut-être incorrecte ou la page a été déplacée. Vous pouvez commencer par l’une de ces pages."
    },
    "gone": {
        "title": "Cette page a été supprimée",
        "body": "Elle ne fait plus partie de tablepro.app et aucune autre page ne la remplace."
    },
    "serverError": {
        "title": "Une erreur s’est produite",
        "body": "Le problème vient de notre côté. Réessayez dans un instant. S’il persiste, écrivez à {email}."
    },
    "unavailable": {
        "title": "Maintenance en cours",
        "body": "tablepro.app sera de retour dans quelques instants."
    },
    "translation": {
        "title": "Cette page est uniquement disponible en {language}",
        "body": "Elle n’a pas encore été traduite.",
        "link": "Lire en {language}"
    },
    "account": {
        "body": "Votre compte a une seule adresse pour toutes les langues. Ouvrez-le ici ; il s’affichera dans la langue sélectionnée.",
        "link": "Ouvrir votre compte"
    },
    "languages": {
        "en": "anglais",
        "vi": "vietnamien",
        "es": "espagnol",
        "de": "allemand",
        "fr": "français",
        "ja": "japonais",
        "pt-BR": "portugais du Brésil",
        "zh-Hans": "chinois simplifié",
        "ko": "coréen",
        "zh-Hant": "chinois traditionnel",
        "it": "italien",
        "id": "indonésien"
    },
    "linksLabel": "Pages pour commencer",
    "links": {
        "home": "Accueil",
        "features": "Fonctionnalités",
        "databases": "Bases de données",
        "download": "Télécharger",
        "blog": "Blog"
    }
} satisfies Messages['errors'];
