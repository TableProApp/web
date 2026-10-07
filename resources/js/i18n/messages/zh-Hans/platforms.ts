import type { Messages } from '../../types.ts';

export default {
    "requirement": {
        "named": "{systems} {version} {releaseName} 或更新版本",
        "unnamed": "{systems} {version} 或更新版本"
    },
    "requires": "需要 {requirement}",
    "systemsJoiner": "和",
    "architectures": {
        "arm64": "Apple silicon",
        "x86_64": "Intel",
        "joiner": "或"
    },
    "app": {
        "mac": "Mac 应用",
        "ios": "iPhone 和 iPad 应用"
    },
    "availability": {
        "summary": "适用于 {deviceList}。"
    },
    "free": "免费，无应用内购买",
    "status": {
        "released": "已推出",
        "prototype": "目前仅有原型。暂无可安装版本，发布日期未定。",
        "none": "尚未推出，发布日期未定。"
    },
    "names": {
        "linux": "Linux",
        "windows": "Windows"
    },
    "release": {
        "badge": "{version}",
        "badgeLabel": "在 Mac 版 TablePro {version} 中加入。Homebrew 可能仍会安装旧版本。"
    }
} satisfies Messages['platforms'];
