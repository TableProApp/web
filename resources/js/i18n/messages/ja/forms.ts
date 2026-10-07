import type { Messages } from '../../types.ts';

export default {
    "email": {
        "label": "メールアドレス",
        "placeholder": "you@example.com"
    },
    "subscribe": "登録する",
    "invalidEmail": "有効なメールアドレスを入力してください。",
    "tooMany": "試行回数が多すぎます。1 分待ってからもう一度お試しください。",
    "failed": "問題が発生しました。もう一度お試しください。",
    "network": "サーバーに接続できませんでした。接続を確認してもう一度お試しください。",
    "subscribed": "受信トレイの確認リンクをご確認ください。"
} satisfies Messages['forms'];
