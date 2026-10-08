import type { Messages } from '../../types.ts';

export default {
    "macCta": "下載 Mac 版",
    "builds": {
        "arm64": "下載 Apple 晶片版",
        "x86_64": "下載 Intel 版"
    },
    "release": {
        "dated": "版本 {version}，發佈於 {date}",
        "undated": "版本 {version}",
        "badge": "v{version} · {date}",
        "badgeUndated": "v{version}",
        "notes": "版本說明（英文）",
        "unavailable": "無法載入目前版本的詳細資訊。兩個按鈕都會開啟 GitHub 上的最新版本，您可在該處選擇適合 Mac 的磁碟映像檔。"
    },
    "file": {
        "sized": "{name} · {size} MB",
        "unsized": "{name}",
        "number": {
            "decimal": ".",
            "group": ","
        }
    },
    "detected": "瀏覽器顯示您的 Mac 使用 {chip}。",
    "onAnotherDevice": "若要安裝 Mac App，請在 Mac 上開啟此頁面。",
    "whichMac": {
        "summary": "我的 Mac 是哪種型號？",
        "body": "開啟 Apple 選單並選擇「關於這台 Mac」。Apple 晶片 Mac 會顯示「晶片」欄位，例如 Apple M2。Intel Mac 則顯示「處理器」欄位，其中標有 Intel。"
    },
    "afterClick": {
        "title": "接下來，安裝 App",
        "body": "從「下載項目」檔案夾開啟 {file}，將 TablePro 拖到「應用程式」。",
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
