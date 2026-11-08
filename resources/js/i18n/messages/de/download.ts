import type { Messages } from '../../types.ts';

export default {
    "macCta": "Für Mac herunterladen",
    "linuxCta": "Unter Linux installieren",
    "release": {
        "notes": "Versionshinweise (Englisch)"
    },
    "file": {
        "number": {
            "decimal": ",",
            "group": "."
        }
    },
    "homebrew": {
        "label": "Homebrew-Befehl",
        "terminal": "Terminal"
    },
    "ios": {
        "badge": "Laden im App Store"
    },
    "orList": {
        "separator": ", ",
        "last": " oder "
    },
    "panel": {
        "beta": "Beta"
    },
    "linux": {
        "floor": "{name} {version}+",
        "anyDistribution": "jede Distribution per Flatpak",
        "commands": "Befehle für {method}"
    }
} satisfies Messages['download'];
