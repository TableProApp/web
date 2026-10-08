import type { Messages } from '../../types.ts';

export default {
    "index": {
        "empty": "尚無文章。"
    },
    "post": {
        "archive": {
            "named": "此文章發佈於 {date}，介紹的是當時的 {release}。若要了解 TablePro 目前的功能，請查看<features>功能</features>與<changelog>更新紀錄</changelog>（英文）。",
            "unnamed": "此文章發佈於 {date}，介紹的是當時的 TablePro。若要了解 TablePro 目前的功能，請查看<features>功能</features>與<changelog>更新紀錄</changelog>（英文）。"
        },
        "brandedTitle": "{title} – TablePro 部落格",
        "correction": "更正，{date}",
        "toc": "本頁內容",
        "related": "相關文章"
    }
} satisfies Messages['blog'];
