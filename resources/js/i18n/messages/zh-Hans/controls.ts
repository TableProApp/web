import type { Messages } from '../../types.ts';

export default {
    "language": {
        "label": "语言",
        "current": "语言：{language}",
        "fallback": "此页面没有简体中文版",
        "fallbackPost": "此文章没有简体中文译文",
        "fallbackBlog": "查看博客列表"
    },
    "theme": {
        "label": "主题",
        "current": "主题：{choice}",
        "light": "浅色",
        "dark": "深色",
        "system": "跟随系统"
    },
    "copy": {
        "copy": "复制",
        "copied": "已复制",
        "copyNamed": "复制{label}",
        "failed": "无法复制。请选中文本后复制。"
    },
    "stepper": {
        "decrease": "减少{label}",
        "increase": "增加{label}"
    },
    "availability": {
        "included": "包含",
        "notIncluded": "不包含"
    },
    "dismiss": "隐藏",
    "close": "关闭"
} satisfies Messages['controls'];
