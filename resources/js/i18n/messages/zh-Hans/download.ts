import type { Messages } from '../../types.ts';

export default {
    "macCta": "下载 Mac 版",
    "linuxCta": "在 Linux 上安装",
    "release": {
        "notes": "发行说明（英语）"
    },
    "file": {
        "number": {
            "decimal": ".",
            "group": ","
        }
    },
    "homebrew": {
        "label": "Homebrew 命令",
        "terminal": "终端"
    },
    "ios": {
        "badge": "从 App Store 下载"
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
        "anyDistribution": "通过 Flatpak 支持任意发行版",
        "commands": "{method} 命令"
    }
} satisfies Messages['download'];
