import type { Messages } from '../../types.ts';

export default {
    "currency": {
        "pattern": "${amount}",
        "decimal": ".",
        "group": ","
    },
    "cycles": {
        "legend": "請求サイクル",
        "monthly": "月払い",
        "yearly": "年払い",
        "lifetime": "買い切り"
    },
    "captions": {
        "monthly": "解約するまで毎月更新されます。",
        "yearly": "解約するまで毎年更新されます。月払い 12 回分より {percent}% 安くなります。",
        "yearlyByTier": "解約するまで毎年更新されます。月払い 12 回分と比べ、Pro は {starterPercent}%、Team は {teamPercent}% 安くなります。",
        "lifetime": "一度のお支払いで、有効期限はありません。"
    },
    "tiers": {
        "free": {
            "name": "無料",
            "description": "試用期間なしで使える基本のデータベースツール。",
            "activation": "登録なしでアプリを使えます。",
            "includesTitle": "含まれる機能",
            "includes": [
                "すべての対応エンジン",
                "SQL エディターとデータグリッド",
                "AI アシスタントと MCP サーバー",
                "Safe Mode",
                "iPhone・iPad アプリ"
            ]
        },
        "starter": {
            "name": "Pro",
            "description": "1 人で使う有料機能。",
            "activation": {
                "one": "1 人、Mac または Linux のコンピューター {count} 台。",
                "other": "1 人、Mac または Linux のコンピューター最大 {count} 台。"
            },
            "includesTitle": "無料プランの全機能に加えて",
            "cta": "Pro を購入"
        },
        "team": {
            "name": "Team",
            "description": "全員に Pro、さらに接続の共有。",
            "activation": {
                "one": "1 シートにつき 1 人、Mac または Linux のコンピューター {count} 台。",
                "other": "1 シートにつき 1 人、Mac または Linux のコンピューター最大 {count} 台。"
            },
            "includesTitle": "Pro の全機能に加えて",
            "cta": "Team を購入",
            "subscriptionOnly": "Team は月額または年額でのご提供です。"
        },
        "enterprise": {
            "name": "Enterprise",
            "description": "会社アカウントでのサインイン、ポリシーの適用、監査ログ、MDM、発注書。",
            "cta": "お問い合わせ"
        }
    },
    "units": {
        "starter": {
            "monthly": "月額",
            "yearly": "年額",
            "lifetime": "一度のお支払い"
        },
        "team": {
            "monthly": "1 シートあたりの月額",
            "yearly": "1 シートあたりの月額（年払い）"
        }
    },
    "seats": {
        "label": "シート数",
        "noun": "シート数",
        "minimum": "最小 {min} シート。",
        "bounds": "最小 {min} シート、最大 {max} シート。",
        "clamped": {
            "min": "最小の {min} シートに変更しました。",
            "max": "最大の {max} シートに変更しました。"
        },
        "total": {
            "monthly": {
                "one": "{count} シート：月額 {total}",
                "other": "{count} シート：月額 {total}"
            },
            "yearly": {
                "one": "{count} シート：年額 {total}",
                "other": "{count} シート：年額 {total}"
            }
        }
    },
    "prioritySupport": {
        "name": "優先サポート",
        "detail": {
            "one": "Team のお客様からのメールを優先し、1 営業日以内に返信します。",
            "other": "Team のお客様からのメールを優先し、{count} 営業日以内に返信します。"
        }
    },
    "allFeatures": "すべての有料機能",
    "refund": {
        "one": "購入または更新から {count} 日以内に返金できます（<link>返金ポリシー</link>）。",
        "other": "購入または更新から {count} 日以内に返金できます（<link>返金ポリシー</link>）。"
    },
    "finePrint": "価格は米ドルで、{merchant} が購入時に売上税または VAT を加算します。",
    "comparePlans": "プランを比較",
    "section": {
        "title": "料金",
        "lead": "TablePro はオープンソースで、無料で使えます。有料プランでオプション機能を追加できます。"
    },
    "matrix": {
        "caption": "各プランに含まれる機能",
        "feature": "機能",
        "groups": {
            "starter": "Pro と Team に含まれる",
            "team": "Team に含まれる",
            "all": "すべてのプランに含まれる"
        },
        "macs": "コンピューター台数",
        "macsFree": "ライセンス不要",
        "macsStarter": {
            "one": "{count} 台（Mac または Linux）",
            "other": "最大 {count} 台（Mac または Linux）"
        },
        "macsTeam": {
            "one": "1 シートにつき {count} 台（Mac または Linux）",
            "other": "1 シートにつき最大 {count} 台（Mac または Linux）"
        },
        "everythingElse": "アプリのその他すべての機能",
        "everythingElseDetail": "すべての対応エンジン、SQL エディター、AI アシスタント、MCP サーバー、Safe Mode",
        "iphoneNote": "iPhone・iPad アプリに有料機能はありません。iCloud Sync は無料です。Mac と同期するには、Mac 側に Pro または Team が必要です。"
    },
    "regional": {
        "note": "アクセス元の国（{country}）向けの価格：チェックアウト時に {percent}% 割引になります。",
        "listPrice": "通常価格 {price}"
    },
    "discount": {
        "summary": "割引コードをお持ちですか？",
        "label": "割引コード",
        "apply": "コードを適用",
        "checking": "コードを確認中…",
        "percent": "コードを確認しました。チェックアウト時に {amount}% 割引になります。",
        "fixed": "コードを確認しました。チェックアウト時に {amount} 割引になります。",
        "accepted": "コードを確認しました。チェックアウト時に適用されます。",
        "invalid": "このコードは無効か、有効期限が切れています。"
    },
    "checkout": {
        "failed": "購入手続きを開けませんでした。もう一度お試しください。",
        "planUnavailable": "このプランは現在販売していません。別の請求サイクルを選ぶか、しばらくしてからもう一度お試しください。",
        "seats": "{min}〜{max} シートの範囲で選び、もう一度お試しください。",
        "seatsFewer": "シート数を減らして、もう一度お試しください。"
    },
    "offers": {
        "name": "{plan}（{cycle}）",
        "seat": "シート"
    }
} satisfies Messages['pricing'];
