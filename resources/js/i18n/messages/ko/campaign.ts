import type { Messages } from '../../types.ts';

export default {
    "name": "Black Friday",
    "banner": {
        "label": "Black Friday 할인",
        "message": "Pro 일회성과 연간 플랜 {percent}% 할인.",
        "short": "Pro {percent}% 할인",
        "cta": "자세히 보기",
        "close": "Black Friday 알림 닫기",
    },
    "offer": {
        "tag": "Black Friday: {percent}% 할인",
        "firstYear": "첫해 가격입니다. 이후에는 연 {price}입니다.",
        "listPrice": "정가 {price}",
    },
    "code": {
        "label": "코드",
        "applied": "이 사이트에서 구매하면 자동으로 적용됩니다.",
        "copyLabel": "할인 코드",
    },
    "countdown": {
        "endsIn": "종료까지",
        "startsIn": "시작까지",
        "until": "{date} {time} UTC까지",
        "from": "{date} {time} UTC부터",
        "units": {
            "days": {
                "other": "일",
            },
            "hours": "시간",
            "minutes": "분",
            "seconds": "초",
        },
    },
    "notice": {
        "headline": "{percent}% 할인",
        "product": "TablePro Pro",
        "window": "Pro 일회성과 Pro 연간, {endsOn} {endsAtTime} UTC까지.",
        "lifetime": "Pro 일회성",
        "lifetimeDetail": "일회 결제. 모든 업데이트와 새로운 Pro 기능.",
        "yearly": "Pro 연간",
        "buy": "Pro 일회성을 {price}에 구매",
        "both": "두 가지 혜택 보기",
        "later": "나중에",
        "footnote": "Pro 월간과 Team은 할인 대상이 아닙니다. 정가는 {listPriceSince}부터 적용되었습니다.",
        "card": "Black Friday: Pro {percent}% 할인",
        "cardPrice": "Pro 일회성 {price}."
    },
} satisfies Messages['campaign'];
