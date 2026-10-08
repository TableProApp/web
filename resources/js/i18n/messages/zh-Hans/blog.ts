import type { Messages } from '../../types.ts';

export default {
    "index": {
        "empty": "暂无文章。"
    },
    "latest": "部分版本还会在博客上发布文章。最新一篇是<post>{title}</post>。",
    "post": {
        "archive": "此文章发布于 {date}，介绍的是当时的 {release}。了解 TablePro 当前的功能，请查看<features>功能</features>和<changelog>更新日志</changelog>（英语）。",
        "correction": "更正，{date}",
        "toc": "本页内容",
        "pages": "相关页面",
        "notes": {
            "title": "完整发行说明",
            "changelog": "更新日志中的 {release}",
            "github": "GitHub 上的 {release}"
        },
        "related": "相关文章"
    }
} satisfies Messages['blog'];
