import type { Messages } from '../../types.ts';

export default {
    "macCta": "Télécharger pour Mac",
    "linuxCta": "Installer sur Linux",
    "release": {
        "notes": "Notes de version (anglais)"
    },
    "file": {
        "number": {
            "decimal": ",",
            "group": " "
        }
    },
    "homebrew": {
        "label": "Commande Homebrew",
        "terminal": "Terminal"
    },
    "ios": {
        "badge": "Télécharger dans l’App Store"
    },
    "orList": {
        "separator": ", ",
        "last": " ou "
    },
    "panel": {
        "beta": "Bêta"
    },
    "linux": {
        "floor": "{name} {version}+",
        "anyDistribution": "toute distribution via Flatpak",
        "commands": "Commandes pour {method}"
    }
} satisfies Messages['download'];
