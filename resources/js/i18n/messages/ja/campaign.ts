import type { Messages } from '../../types.ts';

export default {
    "name": "Black Friday",
    "banner": {
        "label": "Black Friday セール",
        "message": "Pro の買い切りと年払いが {percent}% オフ。",
        "short": "Pro {percent}% オフ",
        "cta": "セールを見る",
        "close": "Black Friday のお知らせを閉じる",
    },
    "band": {
        "title": "TablePro Pro が {percent}% オフ",
        "lead": "Pro 買い切りは {lifetimeList} から {lifetime} に、Pro 年払いは初年度が {yearlyList} から {yearly} になります。",
        "cta": "セールを見る",
        "onPricing": "下の Pro の価格には、この割引が反映されています。",
    },
    "offer": {
        "tag": "Black Friday：{percent}% オフ",
        "firstYear": "初年度の価格です。その後は年額 {price} です。",
        "listPrice": "通常価格 {price}",
    },
    "code": {
        "label": "コード",
        "applied": "このサイトから購入すると、自動で適用されます。",
        "copyLabel": "割引コード",
    },
    "countdown": {
        "endsIn": "終了まで",
        "startsIn": "開始まで",
        "until": "{date} {time} UTC まで",
        "from": "{date} {time} UTC から",
        "units": {
            "days": {
                "other": "日",
            },
            "hours": "時間",
            "minutes": "分",
            "seconds": "秒",
        },
    },
} satisfies Messages['campaign'];
