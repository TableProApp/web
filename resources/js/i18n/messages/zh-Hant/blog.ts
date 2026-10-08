import type { Messages } from '../../types.ts';

export default {
    "index": {
        "empty": "尚無文章。",
        "guides": "指南",
        "releases": "版本說明"
    },
    "latest": "部分版本也會在部落格發佈文章。最新一篇是<post>{title}</post>。",
    "post": {
        "archive": "此文章發佈於 {date}，介紹的是當時的 {release}。若要了解 TablePro 目前的功能，請查看<features>功能</features>與<changelog>更新紀錄</changelog>（英文）。",
        "correction": "更正，{date}",
        "toc": "本頁內容",
        "pages": "相關頁面",
        "notes": {
            "title": "完整版本說明",
            "changelog": "更新紀錄中的 {release}",
            "github": "GitHub 上的 {release}"
        },
        "related": "相關文章"
    }
} satisfies Messages['blog'];
