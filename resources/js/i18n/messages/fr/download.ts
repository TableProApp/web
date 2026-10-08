import type { Messages } from '../../types.ts';

export default {
    "macCta": "Télécharger pour Mac",
    "builds": {
        "arm64": "Télécharger pour Apple silicon",
        "x86_64": "Télécharger pour Intel"
    },
    "release": {
        "dated": "Version {version}, publiée le {date}",
        "undated": "Version {version}",
        "badge": "v{version} · {date}",
        "badgeUndated": "v{version}",
        "notes": "Notes de version (anglais)",
        "unavailable": "Impossible de charger les détails de la version actuelle. Les deux boutons ouvrent la dernière version sur GitHub, où vous pouvez choisir l’image disque adaptée à votre Mac."
    },
    "file": {
        "sized": "{name} · {size} Mo",
        "unsized": "{name}",
        "number": {
            "decimal": ",",
            "group": " "
        }
    },
    "detected": "Votre navigateur indique un Mac avec {chip}.",
    "onAnotherDevice": "Pour installer l’application Mac, ouvrez cette page sur votre Mac.",
    "whichMac": {
        "summary": "Quel Mac ai-je ?",
        "body": "Ouvrez le menu Apple et choisissez « À propos de ce Mac ». Un Mac avec Apple silicon affiche une ligne « Puce », par exemple Apple M2. Un Mac Intel affiche une ligne « Processeur » mentionnant Intel."
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
