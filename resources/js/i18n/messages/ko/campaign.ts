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
} satisfies Messages['campaign'];
