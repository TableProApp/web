import type { Messages } from '../../types.ts';

export default {
    "macCta": "Télécharger pour Mac",
    "release": {
        "dated": "Version {version}, publiée le {date}",
        "undated": "Version {version}",
        "badge": "v{version} · {date}",
        "badgeUndated": "v{version}",
        "notes": "Notes de version (anglais)",
        "unavailable": "Les détails de version sont indisponibles. Le bouton ouvre la dernière version sur GitHub."
    },
    "file": {
        "sized": "{name} · {size} Mo",
        "unsized": "{name}",
        "number": {
            "decimal": ",",
            "group": " "
        }
    },
    "onAnotherDevice": "Pour installer l’application Mac, ouvrez cette page sur votre Mac.",
    "checksum": {
        "summary": "Vérifier votre téléchargement",
        "body": "Exécutez <code>shasum -a 256</code> sur le fichier dans Terminal. Le résultat doit correspondre à la somme de contrôle SHA-256 ci-dessous."
    },
    "afterClick": {
        "title": "Installez ensuite l’application",
        "body": "Ouvrez {file} depuis votre dossier Téléchargements et faites glisser TablePro dans Applications.",
        "retry": "Si le téléchargement n’a pas commencé, <link>téléchargez à nouveau {file}</link>.",
        "steps": "Installation et premier lancement"
    },
    "homebrew": {
        "label": "Commande Homebrew",
        "terminal": "Terminal"
    },
    "ios": {
        "badge": "Télécharger dans l’App Store"
    },
    "otherPlatforms": {
        "joiner": {
            "separator": ", ",
            "last": " ou "
        }
    }
} satisfies Messages['download'];
