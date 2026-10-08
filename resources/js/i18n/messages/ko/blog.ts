import type { Messages } from '../../types.ts';

export default {
    "index": {
        "empty": "아직 게시물이 없습니다."
    },
    "post": {
        "archive": {
            "named": "{date}에 게시된 이 글은 당시의 {release}를 설명합니다. 현재 TablePro의 기능은 <features>기능</features> 및 <changelog>변경 기록</changelog> (영어)을 참고하세요.",
            "unnamed": "{date}에 게시된 이 글은 당시의 TablePro를 설명합니다. 현재 TablePro의 기능은 <features>기능</features> 및 <changelog>변경 기록</changelog> (영어)을 참고하세요."
        },
        "brandedTitle": "{title} – TablePro 블로그",
        "correction": "정정, {date}",
        "toc": "이 페이지의 내용",
        "related": "관련 글"
    }
} satisfies Messages['blog'];
