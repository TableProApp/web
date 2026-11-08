import type { Messages } from '../../types.ts';

export default {
    "macCta": "Mac용 다운로드",
    "linuxCta": "Linux에 설치",
    "release": {
        "notes": "릴리스 노트 (영어)"
    },
    "file": {
        "number": {
            "decimal": ".",
            "group": ","
        }
    },
    "homebrew": {
        "label": "Homebrew 명령어",
        "terminal": "터미널"
    },
    "ios": {
        "badge": "App Store에서 다운로드"
    },
    "orList": {
        "separator": ", ",
        "last": " 또는 "
    },
    "panel": {
        "beta": "베타"
    },
    "linux": {
        "floor": "{name} {version}+",
        "anyDistribution": "Flatpak으로 모든 배포판",
        "commands": "{method} 명령어"
    }
} satisfies Messages['download'];
