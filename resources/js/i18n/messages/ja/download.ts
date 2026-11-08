import type { Messages } from '../../types.ts';

export default {
    "macCta": "Mac 版をダウンロード",
    "linuxCta": "Linux にインストール",
    "release": {
        "notes": "リリースノート（英語）"
    },
    "file": {
        "number": {
            "decimal": ".",
            "group": ","
        }
    },
    "homebrew": {
        "label": "Homebrew コマンド",
        "terminal": "ターミナル"
    },
    "ios": {
        "badge": "App Store からダウンロード"
    },
    "orList": {
        "separator": "、",
        "last": " または "
    },
    "panel": {
        "beta": "ベータ版"
    },
    "linux": {
        "floor": "{name} {version}+",
        "anyDistribution": "Flatpak で任意のディストリビューション",
        "commands": "{method} のコマンド"
    }
} satisfies Messages['download'];
