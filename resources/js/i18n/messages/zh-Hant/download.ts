import type { Messages } from '../../types.ts';

export default {
    "macCta": "下載 Mac 版",
    "release": {
        "dated": "版本 {version}，發佈於 {date}",
        "undated": "版本 {version}",
        "notes": "版本說明（英文）",
        "unavailable": "無法取得版本資訊。按鈕會開啟 GitHub 上的最新版本。"
    },
    "file": {
        "size": "{size} MB",
        "number": {
            "decimal": ".",
            "group": ","
        }
    },
    "checksum": {
        "summary": "驗證下載的檔案",
        "body": "在終端機中對該檔案執行 <code>shasum -a 256</code>，結果應與下方的 SHA-256 檢查碼一致。"
    },
    "afterClick": {
        "title": "接下來，安裝 App",
        "body": "從「下載項目」資料夾開啟 {file}，將 TablePro 拖到「應用程式」。",
        "retry": "若下載未開始，請<link>重新下載 {file}</link>。"
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
    "card": {
        "yourSystem": "您的系統",
        "beta": "Beta 版",
        "dmg": "下載 .dmg",
        "linux": "在 Linux 上安裝",
        "updates": {
            "mac": "在背景自動更新",
            "ios": "透過 App Store 更新",
            "linux": "透過套件管理器更新"
        }
    },
    "linux": {
        "title": "在 Linux 上安裝",
        "beta": "Linux App 是 Beta 版：仍在早期階段，不同版本之間可能有變化，請<link>在 GitHub 上回報問題</link>。",
        "methods": "安裝方式",
        "floor": "{name} {version}+",
        "anyDistribution": "透過 Flatpak 支援任何發行版",
        "flatpak": "Flatpak",
        "files": "檔案",
        "commands": "{method} 指令",
        "requirement": "{name} {versions} · {architectures}",
        "flatpakRequirement": "任何裝有 Flatpak 的發行版 · {architectures} · 內含 GNOME {version} 執行環境",
        "update": "透過 <code>{command}</code> 取得更新",
        "table": {
            "caption": "Linux 版 TablePro {version} 的套件",
            "package": "套件",
            "bundle": "Flatpak 套件包"
        },
        "checksums": "所有檔案的檢查碼：<link>{file}</link>",
        "release": "GitHub 上的 Linux 版 TablePro {version}",
        "verify": {
            "summary": "驗證檔案",
            "body": "在檔案所在的資料夾中執行任一指令。第一條檢查 GitHub 的建置證明，需要 GitHub CLI；第二條將檔案與 {file} 比對。",
            "label": "驗證指令"
        }
    },
    "platforms": {
        "title": "各平台支援的功能",
        "lead": "功能頁面上的所有能力，並排比較。",
        "databases": {
            "one": "{count} 種資料庫",
            "other": "{count} 種資料庫"
        },
        "capability": "能力",
        "covers": "{platform} {total} 項中 {count} 項",
        "available": "支援",
        "page": "功能頁面",
        "pageLabel": "{page} 功能頁面"
    },
    "updates": {
        "ios": "與您的其他 App 一樣，由 App Store 安裝更新。",
        "linux": "更新由套件管理器隨系統其他部分一起安裝，App 本身不檢查更新。"
    },
    "faq": {
        "title": "常見問題",
        "free": {
            "question": "TablePro 在 Linux 上免費嗎？",
            "answer": "是的，可免費使用。付費方案為 Mac App 增加功能，這些功能目前都還沒有 Linux 版。"
        },
        "license": {
            "question": "我的授權在 Linux 上能用嗎？",
            "answer": {
                "one": "可以。一份授權可在 {count} 台 Mac 或 Linux 電腦上啟用。其付費功能目前僅限 Mac。",
                "other": "可以。一份授權最多可在 {count} 台 Mac 或 Linux 電腦上啟用。其付費功能目前僅限 Mac。"
            }
        },
        "other": {
            "question": "有 {platforms} 版本嗎？"
        },
        "verify": {
            "question": "如何驗證下載的檔案？",
            "mac": "在 Mac 上，打開下載按鈕下方的<ui>驗證下載的檔案</ui>，比對 SHA-256 檢查碼。",
            "linux": "在 Linux 上，打開 Linux 區段「檔案」分頁中的<ui>驗證檔案</ui>。"
        }
    }
} satisfies Messages['download'];
