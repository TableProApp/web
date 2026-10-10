import type { Messages } from '../../types.ts';

export default {
    "language": {
        "label": "言語",
        "current": "言語：{language}",
        "fallback": "このページの日本語版はありません",
        "fallbackPost": "この記事の日本語訳はありません",
        "fallbackBlog": "ブログ一覧を見る",
        "suggest": {
            "label": "言語の提案",
            "action": "このページを日本語で読む",
            "dismiss": "日本語を今後提案しない"
        }
    },
    "theme": {
        "label": "テーマ",
        "current": "テーマ：{choice}",
        "light": "ライト",
        "dark": "ダーク",
        "system": "システム設定に従う"
    },
    "copy": {
        "copy": "コピー",
        "copied": "コピーしました",
        "copyNamed": "{label}をコピー",
        "failed": "コピーできませんでした。テキストを選択してコピーしてください。"
    },
    "stepper": {
        "decrease": "{label}を減らす",
        "increase": "{label}を増やす"
    },
    "availability": {
        "included": "含まれます",
        "notIncluded": "含まれません"
    },
    "dismiss": "非表示",
    "close": "閉じる"
} satisfies Messages['controls'];
