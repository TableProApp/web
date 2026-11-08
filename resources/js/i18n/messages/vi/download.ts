import type { Messages } from '../../types.ts';

// ios.badge is the visible text of Apple's Vietnamese badge artwork, word for word: an accessible name must match it.
export default {
    "macCta": "Tải về cho Mac",
    "linuxCta": "Cài đặt trên Linux",
    "release": {
        "notes": "Ghi chú phát hành (tiếng Anh)"
    },
    "file": {
        "number": {
            "decimal": ",",
            "group": "."
        }
    },
    "homebrew": {
        "label": "lệnh Homebrew",
        "terminal": "Terminal"
    },
    "ios": {
        "badge": "Tải về trên App Store"
    },
    "orList": {
        "separator": ", ",
        "last": " hoặc "
    },
    "panel": {
        "beta": "Beta"
    },
    "linux": {
        "floor": "{name} {version}+",
        "anyDistribution": "mọi bản phân phối qua Flatpak",
        "commands": "Lệnh cho {method}"
    }
} satisfies Messages['download'];
