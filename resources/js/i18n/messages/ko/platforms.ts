import type { Messages } from '../../types.ts';

export default {
    "requirement": {
        "named": "{systems} {version} {releaseName} 이상",
        "unnamed": "{systems} {version} 이상"
    },
    "requires": "{requirement} 필요",
    "systemsJoiner": " 및 ",
    "architectures": {
        "arm64": "Apple silicon",
        "x86_64": "Intel",
        "joiner": " 또는 "
    },
    "app": {
        "mac": "Mac 앱",
        "ios": "iPhone 및 iPad 앱"
    },
    "availability": {
        "summary": "{deviceList}에서 사용할 수 있습니다."
    },
    "free": "무료, 앱 내 구입 없음",
    "status": {
        "released": "사용 가능",
        "prototype": "프로토타입만 있습니다. 설치할 수 있는 앱과 출시 일정은 없습니다.",
        "none": "제공되지 않으며 출시 일정도 없습니다."
    },
    "names": {
        "linux": "Linux",
        "windows": "Windows"
    },
    "release": {
        "badge": "{version}",
        "badgeLabel": "Mac용 TablePro {version}에 추가되었습니다. Homebrew로는 아직 이전 버전이 설치될 수 있습니다."
    }
} satisfies Messages['platforms'];
