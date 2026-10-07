import type { Messages } from '../../types.ts';

export default {
    "status": "エラー {status}",
    "notFound": {
        "title": "ページが見つかりません",
        "body": "アドレスの入力が間違っているか、ページが移動した可能性があります。以下のページからお探しください。"
    },
    "gone": {
        "title": "このページは削除されました",
        "body": "このページは tablepro.app から削除され、代わりのページもありません。"
    },
    "serverError": {
        "title": "問題が発生しました",
        "body": "当サイト側の問題です。少し待ってからもう一度お試しください。解決しない場合は {email} にご連絡ください。"
    },
    "unavailable": {
        "title": "メンテナンス中",
        "body": "tablepro.app はまもなく再開します。"
    },
    "translation": {
        "title": "このページは{language}のみで提供しています",
        "body": "まだ翻訳されていません。",
        "link": "{language}で読む"
    },
    "account": {
        "body": "アカウントのアドレスはすべての言語で共通です。こちらから選択した言語で開けます。",
        "link": "アカウントを開く"
    },
    "languages": {
        "en": "英語",
        "vi": "ベトナム語",
        "es": "スペイン語",
        "de": "ドイツ語",
        "fr": "フランス語",
        "ja": "日本語",
        "pt-BR": "ポルトガル語（ブラジル）",
        "zh-Hans": "中国語（簡体字）",
        "ko": "韓国語",
        "zh-Hant": "中国語（繁体字）",
        "it": "イタリア語",
        "id": "インドネシア語"
    },
    "linksLabel": "ここから探す",
    "links": {
        "home": "ホーム",
        "features": "機能",
        "databases": "データベース",
        "download": "ダウンロード",
        "blog": "ブログ"
    }
} satisfies Messages['errors'];
