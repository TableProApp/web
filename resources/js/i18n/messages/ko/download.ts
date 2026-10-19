import type { Messages } from '../../types.ts';

export default {
    "macCta": "Mac용 다운로드",
    "release": {
        "dated": "버전 {version}, {date} 출시",
        "undated": "버전 {version}",
        "badge": "v{version} · {date}",
        "badgeUndated": "v{version}",
        "notes": "릴리스 노트 (영어)",
        "unavailable": "릴리스 정보를 불러올 수 없습니다. 버튼을 누르면 GitHub의 최신 릴리스가 열립니다."
    },
    "file": {
        "sized": "{name} · {size} MB",
        "unsized": "{name}",
        "number": {
            "decimal": ".",
            "group": ","
        }
    },
    "onAnotherDevice": "Mac 앱을 설치하려면 Mac에서 이 페이지를 여세요.",
    "checksum": {
        "summary": "다운로드 파일 확인",
        "body": "터미널에서 파일에 <code>shasum -a 256</code>을 실행하세요. 결과가 아래 SHA-256 체크섬과 일치해야 합니다."
    },
    "afterClick": {
        "title": "이제 설치하세요",
        "body": "다운로드 폴더에서 {file} 파일을 열고 TablePro를 응용 프로그램 폴더로 드래그하세요.",
        "retry": "다운로드가 시작되지 않았다면 <link>{file} 파일을 다시 다운로드</link>하세요.",
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
