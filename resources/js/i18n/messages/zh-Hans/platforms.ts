import type { Messages } from '../../types.ts';

export default {
    "requirement": {
        "named": "{systems} {version} {releaseName} 或更新版本",
        "unnamed": "{systems} {version} 或更新版本"
    },
    "requires": "需要 {requirement}",
    "systemsJoiner": " 和 ",
    "architectures": {
        "arm64": "Apple silicon",
        "x86_64": "Intel",
        "joiner": " 或 "
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
        "prototype": "仅有原型。没有可安装的版本，也没有发布日期。",
        "none": "不提供，也没有发布日期。"
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
