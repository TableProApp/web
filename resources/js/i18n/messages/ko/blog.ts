import type { Messages } from '../../types.ts';

export default {
    "index": {
        "empty": "아직 게시물이 없습니다.",
        "guides": "가이드",
        "releases": "릴리스 노트"
    },
    "latest": "최신 릴리스 글: <post>{title}</post>.",
    "post": {
        "archive": "{date} 게시. 이 글은 {release} 출시 당시를 기준으로 합니다. 현재 <features>기능</features>과 <changelog>변경 기록</changelog> (영어)을 확인하세요.",
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
