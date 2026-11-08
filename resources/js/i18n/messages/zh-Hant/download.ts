import type { Messages } from '../../types.ts';

export default {
    "macCta": "下載 Mac 版",
    "linuxCta": "在 Linux 上安裝",
    "release": {
        "notes": "版本說明（英文）"
    },
    "file": {
        "number": {
            "decimal": ".",
            "group": ","
        }
    },
    "homebrew": {
        "label": "Homebrew 指令",
        "terminal": "終端機"
    },
    "ios": {
        "badge": "從 App Store 下載"
    },
    "orList": {
        "separator": "、",
        "last": " 或 "
    },
    "panel": {
        "beta": "Beta 版"
    },
    "linux": {
        "floor": "{name} {version}+",
        "anyDistribution": "透過 Flatpak 支援任何發行版",
        "commands": "{method} 指令"
    }
} satisfies Messages['download'];
