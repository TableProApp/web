import type { Messages } from '../../types.ts';

export default {
    "language": {
        "label": "語言",
        "current": "語言：{language}",
        "fallback": "此頁面沒有繁體中文版",
        "fallbackPost": "此文章沒有繁體中文譯文",
        "fallbackBlog": "查看部落格列表",
        "suggest": {
            "label": "語言建議",
            "action": "以繁體中文閱讀本頁",
            "dismiss": "不再建議繁體中文"
        }
    },
    "theme": {
        "label": "佈景主題",
        "current": "佈景主題：{choice}",
        "light": "淺色",
        "dark": "深色",
        "system": "跟隨系統"
    },
    "copy": {
        "copy": "複製",
        "copied": "已複製",
        "copyNamed": "複製{label}",
        "failed": "無法複製。請選取文字後複製。"
    },
    "stepper": {
        "decrease": "減少{label}",
        "increase": "增加{label}"
    },
    "availability": {
        "included": "包含",
        "notIncluded": "不包含"
    },
    "dismiss": "隱藏",
    "close": "關閉"
} satisfies Messages['controls'];
