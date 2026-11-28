import type { Messages } from '../../types.ts';

export default {
    "name": "Black Friday",
    "banner": {
        "label": "Black Friday 优惠",
        "message": "Pro 一次性和年付方案享 {percent}% 折扣。",
        "short": "Pro {percent}% 折扣",
        "cta": "查看优惠",
        "close": "关闭 Black Friday 通知",
    },
    "offer": {
        "tag": "Black Friday：{percent}% 折扣",
        "firstYear": "此为首年价格，之后每年 {price}。",
        "listPrice": "原价 {price}",
    },
    "code": {
        "label": "优惠码",
        "applied": "在本网站购买时会自动应用。",
        "copyLabel": "优惠码",
    },
    "countdown": {
        "endsIn": "距结束还有",
        "startsIn": "距开始还有",
        "until": "{date} {time} UTC 截止",
        "from": "{date} {time} UTC 开始",
        "units": {
            "days": {
                "other": "天",
            },
            "hours": "小时",
            "minutes": "分钟",
            "seconds": "秒",
        },
    },
    "notice": {
        "headline": "{percent}% 折扣",
        "product": "TablePro Pro",
        "window": "Pro 一次性和 Pro 年付，{endsOn} {endsAtTime} UTC 截止。",
        "lifetime": "Pro 一次性",
        "lifetimeDetail": "一次付费。包含所有更新和新增的 Pro 功能。",
        "yearly": "Pro 年付",
        "buy": "以 {price} 购买 Pro 一次性",
        "both": "查看两种优惠",
        "later": "以后再说",
        "footnote": "Pro 月付和 Team 不参加此次优惠。原价自 {listPriceSince} 起执行。",
        "card": "Black Friday：Pro {percent}% 折扣",
        "cardPrice": "Pro 一次性 {price}。"
    },
} satisfies Messages['campaign'];
