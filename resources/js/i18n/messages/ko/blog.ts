import type { Messages } from '../../types.ts';

export default {
    "index": {
        "empty": "아직 게시물이 없습니다."
    },
    "latest": "일부 릴리스는 블로그 글로도 소개합니다. 최신 글은 <post>{title}</post>입니다.",
    "post": {
        "archive": "{date}에 게시된 이 글은 당시의 {release}를 설명합니다. 현재 TablePro의 기능은 <features>기능</features> 및 <changelog>변경 기록</changelog>을 참고하세요.",
        "correction": "정정, {date}",
        "toc": "이 페이지의 내용",
        "pages": "관련 페이지",
        "notes": {
            "title": "전체 릴리스 노트",
            "changelog": "변경 기록의 {release}",
            "github": "GitHub의 {release}"
        },
        "related": "관련 글"
    }
} satisfies Messages['blog'];
