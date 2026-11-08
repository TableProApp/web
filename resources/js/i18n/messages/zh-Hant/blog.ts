import type { Messages } from '../../types.ts';

export default {
    "index": {
        "empty": "尚無文章。",
        "tabs": {
            "label": "依類型瀏覽文章",
            "all": "全部",
            "release": "版本發佈",
            "guide": "指南",
            "news": "公告"
        },
        "kind": {
            "release": "版本發佈",
            "guide": "指南",
            "news": "公告"
        },
        "pages": {
            "label": "分頁",
            "newer": "較新的文章",
            "older": "較早的文章",
            "page": "第 {page} 頁，共 {pages} 頁"
        }
    },
    "latest": "最新版本文章：<post>{title}</post>。",
    "post": {
        "archive": "發佈於 {date}。本文介紹 {release} 發佈時的功能。請查看目前<features>功能</features>與<changelog>更新紀錄</changelog>（英文）。",
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
