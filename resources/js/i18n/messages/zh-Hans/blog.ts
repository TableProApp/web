import type { Messages } from '../../types.ts';

export default {
    "index": {
        "empty": "暂无文章。",
        "guides": "指南",
        "releases": "发行说明"
    },
    "latest": "最新版本文章：<post>{title}</post>。",
    "post": {
        "archive": "发布于 {date}。本文介绍 {release} 发布时的功能。请查看当前<features>功能</features>和<changelog>更新日志</changelog>（英语）。",
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
