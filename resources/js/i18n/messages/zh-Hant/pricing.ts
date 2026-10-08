import type { Messages } from '../../types.ts';

export default {
    "currency": {
        "pattern": "${amount}",
        "decimal": ".",
        "group": ","
    },
    "cycles": {
        "legend": "計費週期",
        "monthly": "按月",
        "yearly": "按年",
        "lifetime": "一次性"
    },
    "captions": {
        "monthly": "取消前每月自動續訂。",
        "yearly": "取消前每年自動續訂。比按月支付十二次低 {percent}%。",
        "yearlyByTier": "取消前每年自動續訂。相較於按月支付十二次，Starter 低 {starterPercent}%，Team 低 {teamPercent}%。",
        "lifetime": "一次付費，無到期日。"
    },
    "tiers": {
        "free": {
            "name": "免費",
            "description": "不含付費功能的 Mac App，以及 iPhone 與 iPad App。",
            "activation": "無需註冊即可使用 App。",
            "includesTitle": "包含",
            "includes": [
                "連線至任何支援的引擎",
                "SQL 編輯器與資料表格",
                "AI 助理與 MCP 伺服器",
                "安全模式",
                "iPhone 與 iPad App"
            ]
        },
        "starter": {
            "name": "Starter",
            "description": "為 Mac App 加入 Starter 功能。",
            "activation": {
                "one": "一份授權可用於 {count} 台 Mac。",
                "other": "一份授權最多可用於 {count} 台 Mac。"
            },
            "includesTitle": "免費版的所有功能，另加",
            "cta": "購買 Starter"
        },
        "team": {
            "name": "Team",
            "description": "在 Starter 的基礎上，增加與團隊共用連線和查詢的功能。",
            "activation": "每個席位對應一台已啟用的 Mac。",
            "includesTitle": "Starter 的所有功能，另加",
            "cta": "購買 Team"
        }
    },
    "units": {
        "starter": {
            "monthly": "每月",
            "yearly": "每年",
            "lifetime": "一次付費"
        },
        "team": {
            "monthly": "每席位每月",
            "yearly": "每席位每年",
            "lifetime": "每席位一次付費"
        }
    },
    "seats": {
        "label": "席位數",
        "noun": "席位數",
        "bounds": "最少 {min} 個席位，最多 {max} 個。",
        "total": {
            "monthly": {
                "one": "{count} 個席位：每月 {total}",
                "other": "{count} 個席位：每月 {total}"
            },
            "yearly": {
                "one": "{count} 個席位：每年 {total}",
                "other": "{count} 個席位：每年 {total}"
            },
            "lifetime": {
                "one": "{count} 個席位：{total}，一次付費",
                "other": "{count} 個席位：{total}，一次付費"
            }
        }
    },
    "prioritySupport": {
        "name": "優先支援",
        "detail": {
            "one": "優先回覆 Team 客戶的郵件，並在一個工作天內答覆。",
            "other": "優先回覆 Team 客戶的郵件，並在 {count} 個工作天內答覆。"
        }
    },
    "allFeatures": "所有付費功能",
    "finePrint": "價格以美元計。{merchant} 為 merchant of record，負責收款，並在結帳時計算銷售稅或加值稅。",
    "finePrintCurrency": "價格以美元計。",
    "comparePlans": "比較方案",
    "section": {
        "title": "價格方案",
        "lead": "TablePro 開放原始碼且可免費使用。付費方案為 Mac App 增加選用功能。"
    },
    "matrix": {
        "caption": "各方案在 Mac App 中包含的功能",
        "feature": "功能",
        "macs": "Mac 台數",
        "macsFree": "無需授權",
        "macsStarter": {
            "one": "{count}",
            "other": "最多 {count}"
        },
        "macsTeam": "每席位一台",
        "everythingElse": "App 中的其他所有功能",
        "everythingElseDetail": "所有支援的引擎、SQL 編輯器、AI 助理、MCP 伺服器與安全模式",
        "iphoneNote": "iPhone 與 iPad App 沒有付費功能，iCloud 同步在這兩款裝置上免費。若要與 Mac 同步，Mac 需要 Starter 或 Team。"
    },
    "discount": {
        "atCheckout": "有折扣碼？請在結帳時輸入。",
        "summary": "有折扣碼？",
        "label": "折扣碼",
        "apply": "套用折扣碼",
        "checking": "正在驗證折扣碼…",
        "percent": "折扣碼有效：結帳時享有 {amount}% 折扣。",
        "fixed": "折扣碼有效：結帳時減免 {amount}。",
        "invalid": "此折扣碼無效或已過期。"
    },
    "checkout": {
        "failed": "無法開始結帳。請再試一次。"
    },
    "offers": {
        "name": "{plan}，{cycle}",
        "seat": "席位"
    }
} satisfies Messages['pricing'];
