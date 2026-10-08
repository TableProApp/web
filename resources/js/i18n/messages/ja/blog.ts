import type { Messages } from '../../types.ts';

export default {
    "index": {
        "empty": "記事はまだありません。"
    },
    "post": {
        "archive": {
            "named": "{date} 公開の記事で、当時の {release} について説明しています。現在の TablePro の機能は、<features>機能一覧</features>と<changelog>変更履歴</changelog>（英語）をご覧ください。",
            "unnamed": "{date} 公開の記事で、当時の TablePro について説明しています。現在の TablePro の機能は、<features>機能一覧</features>と<changelog>変更履歴</changelog>（英語）をご覧ください。"
        },
        "brandedTitle": "{title} – TablePro ブログ",
        "correction": "訂正：{date}",
        "toc": "このページの内容",
        "related": "関連記事"
    }
} satisfies Messages['blog'];
