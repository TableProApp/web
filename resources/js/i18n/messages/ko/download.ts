import type { Messages } from '../../types.ts';

export default {
    "macCta": "Mac용 다운로드",
    "builds": {
        "arm64": "Apple silicon용 다운로드",
        "x86_64": "Intel용 다운로드"
    },
    "release": {
        "dated": "버전 {version}, {date} 출시",
        "undated": "버전 {version}",
        "badge": "v{version} · {date}",
        "badgeUndated": "v{version}",
        "notes": "릴리스 노트",
        "unavailable": "현재 릴리스 정보를 불러오지 못했습니다. 두 버튼 모두 GitHub의 최신 릴리스를 열며, 거기서 Mac에 맞는 디스크 이미지를 선택할 수 있습니다."
    },
    "file": {
        "sized": "{name} · {size} MB",
        "unsized": "{name}",
        "number": {
            "decimal": ".",
            "group": ","
        }
    },
    "detected": "브라우저 정보에 따르면 {chip} 탑재 Mac을 사용 중입니다.",
    "onAnotherDevice": "Mac 앱을 설치하려면 Mac에서 이 페이지를 여세요.",
    "whichMac": {
        "summary": "내 Mac은 어떤 모델인가요?",
        "body": "Apple 메뉴에서 이 Mac에 관하여를 선택하세요. Apple silicon Mac에는 Apple M2와 같은 칩 항목이 표시됩니다. Intel Mac에는 Intel 이름이 표시된 프로세서 항목이 있습니다."
    },
    "afterClick": {
        "title": "이제 설치하세요",
        "body": "다운로드 폴더에서 {file}을 열고 TablePro를 응용 프로그램 폴더로 드래그하세요.",
        "retry": "다운로드가 시작되지 않았다면 <link>{file}을 다시 다운로드</link>하세요.",
        "steps": "설치 및 첫 실행"
    },
    "homebrew": {
        "label": "Homebrew 명령어",
        "terminal": "터미널"
    },
    "ios": {
        "badge": "App Store에서 다운로드"
    },
    "otherPlatforms": {
        "joiner": {
            "separator": ", ",
            "last": " 또는 "
        }
    }
} satisfies Messages['download'];
