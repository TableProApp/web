import type { Messages } from '../../types.ts';

export default {
    "name": "Black Friday",
    "banner": {
        "label": "Black Friday 優惠",
        "message": "Pro 一次性與年付方案享 {percent}% 折扣。",
        "short": "Pro {percent}% 折扣",
        "cta": "查看優惠",
        "close": "關閉 Black Friday 通知",
    },
    "band": {
        "title": "TablePro Pro 享 {percent}% 折扣",
        "lead": "Pro 一次性價格為 {lifetime}，原價 {lifetimeList}；Pro 年付首年價格為 {yearly}，原價 {yearlyList}。",
        "cta": "查看優惠",
        "onPricing": "下方 Pro 價格已包含此折扣。",
    },
    "offer": {
        "tag": "Black Friday：{percent}% 折扣",
        "firstYear": "此為首年價格，之後每年 {price}。",
        "listPrice": "原價 {price}",
    },
    "code": {
        "label": "折扣碼",
        "applied": "在本網站購買時會自動套用。",
        "copyLabel": "折扣碼",
    },
    "countdown": {
        "endsIn": "距結束還有",
        "startsIn": "距開始還有",
        "until": "{date} {time} UTC 截止",
        "from": "{date} {time} UTC 開始",
        "units": {
            "days": {
                "other": "天",
            },
            "hours": "小時",
            "minutes": "分鐘",
            "seconds": "秒",
        },
    },
} satisfies Messages['campaign'];
