import type { Messages } from '../../types.ts';

export default {
    "language": {
        "label": "언어",
        "current": "언어: {language}",
        "fallback": "이 페이지의 한국어 버전이 없습니다",
        "fallbackPost": "이 글은 한국어로 제공되지 않습니다",
        "fallbackBlog": "블로그 목록 보기"
    },
    "theme": {
        "label": "테마",
        "current": "테마: {choice}",
        "light": "라이트",
        "dark": "다크",
        "system": "시스템 설정"
    },
    "copy": {
        "copy": "복사",
        "copied": "복사됨",
        "copyNamed": "{label} 복사",
        "failed": "복사하지 못했습니다. 텍스트를 선택해서 복사하세요."
    },
    "stepper": {
        "decrease": "{label} 줄이기",
        "increase": "{label} 늘리기"
    },
    "availability": {
        "included": "포함됨",
        "notIncluded": "포함되지 않음"
    },
    "dismiss": "숨기기",
    "close": "닫기"
} satisfies Messages['controls'];
