import type { Messages } from '../../types.ts';

export default {
    "requirement": {
        "named": "{systems} {version} {releaseName} 以降",
        "unnamed": "{systems} {version} 以降"
    },
    "requires": "{requirement} が必要です",
    "systemsJoiner": "と",
    "architectures": {
        "arm64": "Apple silicon",
        "x86_64": "Intel",
        "joiner": "または"
    },
    "app": {
        "mac": "Mac アプリ",
        "ios": "iPhone・iPad アプリ"
    },
    "availability": {
        "summary": "{deviceList} に対応しています。"
    },
    "free": "無料、アプリ内課金なし",
    "status": {
        "released": "利用可能",
        "prototype": "プロトタイプのみです。インストールできるものはなく、リリース日も未定です。",
        "none": "提供していません。リリース日も未定です。"
    },
    "names": {
        "linux": "Linux",
        "windows": "Windows"
    },
    "release": {
        "badge": "{version}",
        "badgeLabel": "Mac 版 TablePro {version} で追加。Homebrew では以前のバージョンがインストールされる場合があります。"
    }
} satisfies Messages['platforms'];
