import type { Messages } from '../../types.ts';

export default {
    "macCta": "下載 Mac 版",
    "release": {
        "dated": "版本 {version}，發佈於 {date}",
        "undated": "版本 {version}",
        "badge": "v{version} · {date}",
        "badgeUndated": "v{version}",
        "notes": "版本說明（英文）",
        "unavailable": "無法取得版本資訊。按鈕會開啟 GitHub 上的最新版本。"
    },
    "file": {
        "sized": "{name} · {size} MB",
        "unsized": "{name}",
        "number": {
            "decimal": ".",
            "group": ","
        }
    },
    "onAnotherDevice": "若要安裝 Mac App，請在 Mac 上開啟此頁面。",
    "checksum": {
        "summary": "驗證下載的檔案",
        "body": "在終端機中對該檔案執行 <code>shasum -a 256</code>，結果應與下方的 SHA-256 檢查碼一致。"
    },
    "afterClick": {
        "title": "接下來，安裝 App",
        "body": "從「下載項目」資料夾開啟 {file}，將 TablePro 拖到「應用程式」。",
        "retry": "若下載未開始，請<link>重新下載 {file}</link>。",
        "steps": "安裝與首次啟動"
    },
    "homebrew": {
        "label": "Homebrew 指令",
        "terminal": "終端機"
    },
    "ios": {
        "badge": "從 App Store 下載"
    },
    "otherPlatforms": {
        "joiner": {
            "separator": "、",
            "last": " 或 "
        }
    }
} satisfies Messages['download'];
