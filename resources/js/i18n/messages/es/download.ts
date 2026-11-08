import type { Messages } from '../../types.ts';

export default {
    "macCta": "Descargar para Mac",
    "linuxCta": "Instalar en Linux",
    "release": {
        "notes": "Notas de versión (inglés)"
    },
    "file": {
        "number": {
            "decimal": ",",
            "group": "."
        }
    },
    "homebrew": {
        "label": "Comando de Homebrew",
        "terminal": "Terminal"
    },
    "ios": {
        "badge": "Descargar en el App Store"
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
        "anyDistribution": "cualquier distribución con Flatpak",
        "commands": "Comandos para {method}"
    }
} satisfies Messages['download'];
