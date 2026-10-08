import type { Messages } from '../../types.ts';

export default {
    "index": {
        "empty": "記事はまだありません。"
    },
    "latest": "一部のリリースはブログ記事でも紹介しています。最新の記事は<post>{title}</post>です。",
    "post": {
        "archive": "{date} 公開の記事で、当時の {release} について説明しています。現在の TablePro の機能は、<features>機能一覧</features>と<changelog>変更履歴</changelog>をご覧ください。",
        "correction": "訂正：{date}",
        "toc": "このページの内容",
        "pages": "関連ページ",
        "notes": {
            "title": "完全なリリースノート",
            "changelog": "変更履歴の {release}",
            "github": "GitHub の {release}"
        },
        "related": "関連記事"
    }
} satisfies Messages['blog'];
