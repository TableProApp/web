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
    "notice": {
        "headline": "{percent}% オフ",
        "product": "TablePro Pro",
        "window": "Pro 買い切りと Pro 年払い、{endsOn} {endsAtTime} UTC まで。",
        "lifetime": "Pro 買い切り",
        "lifetimeDetail": "一度のお支払い。すべてのアップデートと Pro の新機能。",
        "yearly": "Pro 年払い",
        "buy": "Pro 買い切りを {price} で購入",
        "both": "両方のプランを見る",
        "later": "今はしない",
        "footnote": "Pro 月払いと Team はセールの対象外です。通常価格は {listPriceSince} から適用されています。",
        "card": "Black Friday：Pro {percent}% オフ",
        "cardPrice": "Pro 買い切りが {price}。"
    },
} satisfies Messages['campaign'];
