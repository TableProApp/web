import type { Messages } from '../../types.ts';

export default {
    "index": {
        "empty": "記事はまだありません。",
        "guides": "ガイド",
        "releases": "リリースノート"
    },
    "latest": "最新のリリース記事：<post>{title}</post>。",
    "post": {
        "archive": "公開日：{date}。この記事は {release} のリリース時点の内容です。現在の<features>機能</features>と<changelog>変更履歴</changelog>（英語）をご覧ください。",
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
