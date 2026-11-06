import type { Messages } from '../../types.ts';

export default {
    "macCta": "Mac용 다운로드",
    "release": {
        "dated": "버전 {version}, {date} 출시",
        "undated": "버전 {version}",
        "notes": "릴리스 노트 (영어)",
        "unavailable": "릴리스 정보를 불러올 수 없습니다. 버튼을 누르면 GitHub의 최신 릴리스가 열립니다."
    },
    "file": {
        "size": "{size} MB",
        "number": {
            "decimal": ".",
            "group": ","
        }
    },
    "checksum": {
        "summary": "다운로드 파일 확인",
        "body": "터미널에서 파일에 <code>shasum -a 256</code>을 실행하세요. 결과가 아래 SHA-256 체크섬과 일치해야 합니다."
    },
    "afterClick": {
        "title": "이제 설치하세요",
        "body": "다운로드 폴더에서 {file} 파일을 열고 TablePro를 응용 프로그램 폴더로 드래그하세요.",
        "retry": "다운로드가 시작되지 않았다면 <link>{file} 파일을 다시 다운로드</link>하세요."
    },
    "homebrew": {
        "label": "Homebrew 명령어",
        "terminal": "터미널"
    },
    "ios": {
        "badge": "App Store에서 다운로드"
    },
    "orList": {
        "separator": ", ",
        "last": " 또는 "
    },
    "card": {
        "yourSystem": "사용 중인 시스템",
        "beta": "베타",
        "dmg": ".dmg 다운로드",
        "linux": "Linux에 설치",
        "updates": {
            "mac": "백그라운드에서 자동 업데이트",
            "ios": "App Store에서 업데이트",
            "linux": "패키지 관리자로 업데이트"
        }
    },
    "linux": {
        "title": "Linux에 설치",
        "beta": "Linux 앱은 베타입니다. 아직 초기 단계라 릴리스마다 달라질 수 있으니 <link>GitHub에서 버그를 보고</link>해 주세요.",
        "methods": "설치 방법",
        "floor": "{name} {version}+",
        "anyDistribution": "Flatpak으로 모든 배포판",
        "flatpak": "Flatpak",
        "files": "파일",
        "commands": "{method} 명령어",
        "requirement": "{name} {versions} · {architectures}",
        "flatpakRequirement": "Flatpak이 있는 모든 배포판 · {architectures} · 자체 GNOME {version} 런타임 포함",
        "update": "<code>{command}</code> 명령으로 업데이트됩니다",
        "table": {
            "caption": "Linux용 TablePro {version} 패키지",
            "package": "패키지",
            "bundle": "Flatpak 번들"
        },
        "checksums": "모든 파일의 체크섬: <link>{file}</link>",
        "release": "GitHub의 Linux용 TablePro {version}",
        "verify": {
            "summary": "파일 확인",
            "body": "파일이 있는 폴더에서 두 명령어 중 하나를 실행하세요. 첫 번째는 GitHub의 빌드 증명을 확인하며 GitHub CLI가 필요합니다. 두 번째는 파일을 {file} 파일과 대조합니다.",
            "label": "확인 명령어"
        }
    },
    "platforms": {
        "title": "플랫폼별 지원 기능",
        "lead": "기능 페이지의 모든 기능을 나란히 비교합니다.",
        "databases": {
            "one": "{count}개 데이터베이스",
            "other": "{count}개 데이터베이스"
        },
        "capability": "기능",
        "covers": "{platform} {total}개 중 {count}개",
        "available": "지원됨",
        "page": "기능 페이지",
        "pageLabel": "{page} 기능 페이지"
    },
    "updates": {
        "ios": "다른 앱과 마찬가지로 App Store가 업데이트를 설치합니다.",
        "linux": "패키지 관리자가 시스템의 나머지 부분과 함께 업데이트를 설치합니다. 앱이 직접 업데이트를 확인하지는 않습니다."
    },
    "faq": {
        "title": "자주 묻는 질문",
        "free": {
            "question": "Linux에서 TablePro는 무료인가요?",
            "answer": "네, 무료로 사용할 수 있습니다. 유료 플랜은 Mac 앱에 기능을 추가하며, 아직 Linux에서 제공되는 기능은 없습니다."
        },
        "license": {
            "question": "라이선스를 Linux에서도 쓸 수 있나요?",
            "answer": {
                "one": "네. 라이선스 하나로 Mac 또는 Linux 컴퓨터 {count}대를 활성화할 수 있습니다. 유료 기능은 당분간 Mac에서만 제공됩니다.",
                "other": "네. 라이선스 하나로 Mac 또는 Linux 컴퓨터를 최대 {count}대까지 활성화할 수 있습니다. 유료 기능은 당분간 Mac에서만 제공됩니다."
            }
        },
        "other": {
            "question": "{platforms} 버전이 있나요?"
        },
        "verify": {
            "question": "다운로드 파일은 어떻게 확인하나요?",
            "mac": "Mac에서는 다운로드 버튼 아래의 <ui>다운로드 파일 확인</ui>을 열고 SHA-256 체크섬을 비교하세요.",
            "linux": "Linux에서는 Linux 섹션의 파일 탭에 있는 <ui>파일 확인</ui>을 여세요."
        }
    }
} satisfies Messages['download'];
