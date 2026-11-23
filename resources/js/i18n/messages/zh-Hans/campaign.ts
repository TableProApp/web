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
} satisfies Messages['campaign'];
