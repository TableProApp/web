import type { Messages } from '../../types.ts';

export default {
    "macCta": "Mac용 다운로드",
    "linuxCta": "Linux에 설치",
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
    "panel": {
        "legend": "플랫폼",
        "beta": "베타",
        "updates": {
            "mac": "백그라운드에서 자동 업데이트",
            "ios": "App Store에서 업데이트"
        }
    },
    "linux": {
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
    "otherPlatforms": {
        "question": "{platforms} 버전이 있나요?"
    }
} satisfies Messages['download'];
