import type { Messages } from '../../types.ts';

export default {
    "macCta": "Unduh untuk Mac",
    "linuxCta": "Instal di Linux",
    "release": {
        "notes": "Catatan rilis (bahasa Inggris)"
    },
    "file": {
        "number": {
            "decimal": ",",
            "group": "."
        }
    },
    "homebrew": {
        "label": "Perintah Homebrew",
        "terminal": "Terminal"
    },
    "ios": {
        "badge": "Unduh di App Store"
    },
    "orList": {
        "separator": ", ",
        "last": " atau "
    },
    "panel": {
        "beta": "Beta"
    },
    "linux": {
        "floor": "{name} {version}+",
        "anyDistribution": "distribusi apa pun lewat Flatpak",
        "commands": "Perintah {method}"
    }
} satisfies Messages['download'];
