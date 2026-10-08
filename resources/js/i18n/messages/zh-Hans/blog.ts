import type { Messages } from '../../types.ts';

export default {
    "index": {
        "empty": "暂无文章。"
    },
    "post": {
        "archive": {
            "named": "此文章发布于 {date}，介绍的是当时的 {release}。了解 TablePro 当前的功能，请查看<features>功能</features>和<changelog>更新日志</changelog>（英语）。",
            "unnamed": "此文章发布于 {date}，介绍的是当时的 TablePro。了解 TablePro 当前的功能，请查看<features>功能</features>和<changelog>更新日志</changelog>（英语）。"
        },
        "brandedTitle": "{title} – TablePro 博客",
        "correction": "更正，{date}",
        "toc": "本页内容",
        "related": "相关文章"
    }
} satisfies Messages['blog'];
