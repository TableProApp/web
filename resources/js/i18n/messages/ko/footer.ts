import type { Messages } from '../../types.ts';

export default {
    "heading": "사이트 링크",
    "groups": {
        "product": {
            "title": "제품",
            "features": "기능",
            "databases": "데이터베이스",
            "pricing": "요금",
            "download": "다운로드",
            "compare": "비교"
        },
        "resources": {
            "title": "자료",
            "docs": "문서 (영어)",
            "changelog": "변경 기록 (영어)",
            "blog": "블로그",
            "faq": "자주 묻는 질문",
            "about": "소개",
            "source": "소스 코드",
            "reportBug": "버그 신고"
        },
        "support": {
            "title": "지원",
            "account": "계정",
            "troubleshooting": "문제 해결 (영어)",
            "email": "이메일 지원",
            "chat": "실시간 채팅"
        },
        "community": {
            "title": "커뮤니티",
            "discussions": "GitHub Discussions",
            "discord": "Discord",
            "x": "X",
            "telegram": "Telegram",
            "sponsor": "TablePro 후원"
        },
        "legal": {
            "title": "법률 정보",
            "privacy": "개인정보 보호",
            "terms": "이용약관",
            "refund": "환불 정책",
            "cookies": "쿠키 설정"
        }
    },
    "newsletter": {
        "title": "이메일로 받는 릴리스 노트",
        "body": "릴리스 노트를 가끔 영어로 보내드립니다. 모든 이메일에 구독 해지 링크가 있습니다.",
        "note": "먼저 확인 링크를 이메일로 보내드립니다. <link>개인정보 처리방침</link>"
    },
    "bottom": {
        "copyright": "© {year} TablePro. {city}의 {maker} 제작. 소스 코드는 AGPLv3로 배포됩니다."
    }
} satisfies Messages['footer'];
