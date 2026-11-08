import type { Messages } from '../../types.ts';

export default {
    "macCta": "Baixar para Mac",
    "linuxCta": "Instalar no Linux",
    "release": {
        "notes": "Notas de versão (inglês)"
    },
    "file": {
        "number": {
            "decimal": ",",
            "group": "."
        }
    },
    "homebrew": {
        "label": "Comando do Homebrew",
        "terminal": "Terminal"
    },
    "ios": {
        "badge": "Baixar na App Store"
    },
    "orList": {
        "separator": ", ",
        "last": " ou "
    },
    "panel": {
        "beta": "Beta"
    },
    "linux": {
        "floor": "{name} {version}+",
        "anyDistribution": "qualquer distribuição via Flatpak",
        "commands": "Comandos para {method}"
    }
} satisfies Messages['download'];
