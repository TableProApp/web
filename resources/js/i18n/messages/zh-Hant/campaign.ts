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
    "notice": {
        "headline": "{percent}% 折扣",
        "product": "TablePro Pro",
        "window": "Pro 一次性與 Pro 年付，{endsOn} {endsAtTime} UTC 截止。",
        "lifetime": "Pro 一次性",
        "lifetimeDetail": "一次付費。包含所有更新和新增的 Pro 功能。",
        "yearly": "Pro 年付",
        "buy": "以 {price} 購買 Pro 一次性",
        "both": "查看兩種優惠",
        "later": "以後再說",
        "footnote": "Pro 月付與 Team 不在此次優惠範圍內。原價自 {listPriceSince} 起實施。",
        "card": "Black Friday：Pro {percent}% 折扣",
        "cardPrice": "Pro 一次性 {price}。"
    },
} satisfies Messages['campaign'];
