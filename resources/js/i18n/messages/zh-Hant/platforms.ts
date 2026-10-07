import type { Messages } from '../../types.ts';

export default {
    "requirement": {
        "named": "{systems} {version} {releaseName} 或更新版本",
        "unnamed": "{systems} {version} 或更新版本"
    },
    "requires": "需要 {requirement}",
    "systemsJoiner": "與",
    "architectures": {
        "arm64": "Apple silicon",
        "x86_64": "Intel",
        "joiner": "或"
    },
    "app": {
        "mac": "Mac App",
        "ios": "iPhone 與 iPad App"
    },
    "availability": {
        "summary": "適用於 {deviceList}。"
    },
    "free": "免費，無 App 內購買",
    "status": {
        "released": "已推出",
        "prototype": "目前僅有原型。暫無可安裝版本，發佈日期未定。",
        "none": "尚未推出，發佈日期未定。"
    },
    "names": {
        "linux": "Linux",
        "windows": "Windows"
    },
    "release": {
        "badge": "{version}",
        "badgeLabel": "在 Mac 版 TablePro {version} 中加入。Homebrew 可能仍會安裝舊版本。"
    }
} satisfies Messages['platforms'];
