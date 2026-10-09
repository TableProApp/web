import type { Messages } from '../../types.ts';

export default {
    "heading": "サイト内リンク",
    "groups": {
        "product": {
            "title": "製品",
            "features": "機能",
            "databases": "データベース",
            "pricing": "料金",
            "download": "ダウンロード",
            "compare": "比較"
        },
        "resources": {
            "title": "リソース",
            "docs": "ドキュメント（英語）",
            "changelog": "変更履歴（英語）",
            "blog": "ブログ",
            "faq": "よくある質問",
            "about": "TablePro について",
            "source": "ソースコード",
            "reportBug": "不具合を報告"
        },
        "support": {
            "title": "サポート",
            "account": "アカウント",
            "troubleshooting": "トラブルシューティング（英語）",
            "email": "メールサポート",
            "chat": "チャットサポート"
        },
        "community": {
            "title": "コミュニティ",
            "discussions": "GitHub Discussions",
            "discord": "Discord",
            "x": "X",
            "telegram": "Telegram",
            "sponsor": "TablePro を支援"
        },
        "legal": {
            "title": "法的情報",
            "privacy": "プライバシー",
            "security": "セキュリティ",
            "terms": "利用規約",
            "refund": "返金ポリシー",
            "cookies": "Cookie 設定"
        }
    },
    "newsletter": {
        "title": "リリースノートをメールで受け取る",
        "body": "英語のリリースノートを不定期でお送りします。どのメールからでも配信を停止できます。",
        "note": "メールで購読を確認してください。<link>プライバシーポリシー</link>"
    },
    "bottom": {
        "copyright": "© {year} TablePro。{city}の {maker} が開発しています。ソースコードは AGPLv3 で公開しています。"
    }
} satisfies Messages['footer'];
