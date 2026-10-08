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
        "yearlyByTier": "解約するまで毎年更新されます。月払い 12 回分と比べ、Starter は {starterPercent}%、Team は {teamPercent}% 安くなります。",
        "lifetime": "一度のお支払いで、有効期限はありません。"
    },
    "tiers": {
        "free": {
            "name": "無料",
            "description": "有料機能を除く Mac アプリと、iPhone・iPad アプリ。",
            "activation": "登録なしでアプリを使えます。",
            "includesTitle": "含まれる機能",
            "includes": [
                "すべての対応エンジンへの接続",
                "SQL エディターとデータグリッド",
                "AI アシスタントと MCP サーバー",
                "セーフモード",
                "iPhone・iPad アプリ"
            ]
        },
        "starter": {
            "name": "Starter",
            "description": "Mac アプリに Starter の機能を追加します。",
            "activation": {
                "one": "1 ライセンスで Mac {count} 台。",
                "other": "1 ライセンスで Mac 最大 {count} 台。"
            },
            "includesTitle": "無料プランの全機能に加えて",
            "cta": "Starter を購入"
        },
        "team": {
            "name": "Team",
            "description": "Starter に加え、接続とクエリをチームで共有できます。",
            "activation": "1 シートにつき、1 台の Mac を有効化できます。",
            "includesTitle": "Starter の全機能に加えて",
            "cta": "Team を購入"
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
            "yearly": "1 シートあたりの年額",
            "lifetime": "1 シートあたり、一度のお支払い"
        }
    },
    "seats": {
        "label": "シート数",
        "noun": "シート数",
        "bounds": "最小 {min} シート、最大 {max} シート。",
        "total": {
            "monthly": {
                "one": "{count} シート：月額 {total}",
                "other": "{count} シート：月額 {total}"
            },
            "yearly": {
                "one": "{count} シート：年額 {total}",
                "other": "{count} シート：年額 {total}"
            },
            "lifetime": {
                "one": "{count} シート：{total}、一度のお支払い",
                "other": "{count} シート：{total}、一度のお支払い"
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
    "finePrint": "価格は米ドルです。{merchant} が merchant of record として支払いを受け取り、チェックアウト時に売上税や VAT を計算します。",
    "finePrintCurrency": "価格は米ドルです。",
    "comparePlans": "プランを比較",
    "section": {
        "title": "料金",
        "lead": "TablePro はオープンソースで、無料で使えます。有料プランで Mac アプリに任意の機能を追加できます。"
    },
    "matrix": {
        "caption": "Mac アプリで各プランに含まれる機能",
        "feature": "機能",
        "macs": "Mac 台数",
        "macsFree": "ライセンス不要",
        "macsStarter": {
            "one": "{count}",
            "other": "最大 {count}"
        },
        "macsTeam": "1 シートにつき 1 台",
        "everythingElse": "アプリのその他すべての機能",
        "everythingElseDetail": "すべての対応エンジン、SQL エディター、AI アシスタント、MCP サーバー、セーフモード",
        "iphoneNote": "iPhone・iPad アプリに有料機能はありません。iCloud 同期は無料です。Mac と同期するには、Mac 側に Starter または Team が必要です。"
    },
    "discount": {
        "atCheckout": "割引コードをお持ちですか？チェックアウト時に入力してください。",
        "summary": "割引コードをお持ちですか？",
        "label": "割引コード",
        "apply": "コードを適用",
        "checking": "コードを確認中…",
        "percent": "コードを確認しました。チェックアウト時に {amount}% 割引になります。",
        "fixed": "コードを確認しました。チェックアウト時に {amount} 割引になります。",
        "invalid": "この割引コードは無効か、期限が切れています。"
    },
    "checkout": {
        "failed": "チェックアウトを開始できませんでした。もう一度お試しください。"
    },
    "offers": {
        "name": "{plan}（{cycle}）",
        "seat": "シート"
    }
} satisfies Messages['pricing'];
