import type { Messages } from '../../types.ts';

export default {
    "index": {
        "empty": "아직 게시물이 없습니다.",
        "tabs": {
            "label": "종류별 게시물",
            "all": "전체",
            "release": "릴리스",
            "guide": "가이드",
            "news": "소식"
        },
        "kind": {
            "release": "릴리스",
            "guide": "가이드",
            "news": "소식"
        },
        "pages": {
            "label": "페이지",
            "newer": "최근 게시물",
            "older": "이전 게시물",
            "page": "{pages}페이지 중 {page}페이지"
        }
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
