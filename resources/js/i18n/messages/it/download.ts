import type { Messages } from '../../types.ts';

export default {
    "macCta": "Scarica per Mac",
    "linuxCta": "Installa su Linux",
    "release": {
        "notes": "Note di rilascio (inglese)"
    },
    "file": {
        "number": {
            "decimal": ",",
            "group": "."
        }
    },
    "homebrew": {
        "label": "Comando Homebrew",
        "terminal": "Terminale"
    },
    "ios": {
        "badge": "Scarica su App Store"
    },
    "orList": {
        "separator": ", ",
        "last": " o "
    },
    "panel": {
        "beta": "Beta"
    },
    "linux": {
        "floor": "{name} {version}+",
        "anyDistribution": "qualsiasi distribuzione con Flatpak",
        "commands": "Comandi per {method}"
    }
} satisfies Messages['download'];
