import type { Messages } from '../../types.ts';

export default {
    "currency": {
        "pattern": "US${amount}",
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
        "yearlyByTier": "取消前每年自動續訂。相較於按月支付十二次，Pro 低 {starterPercent}%，Team 低 {teamPercent}%。",
        "lifetime": "一次付費，無到期日。"
    },
    "tiers": {
        "free": {
            "name": "免費",
            "description": "基本資料庫工具，無試用期限。",
            "activation": "無需註冊即可使用 App。",
            "includesTitle": "包含",
            "includes": [
                "所有支援的引擎",
                "SQL 編輯器與資料格線",
                "AI 助理與 MCP 伺服器",
                "Safe Mode",
                "iPhone 與 iPad App"
            ]
        },
        "starter": {
            "name": "Pro",
            "description": "付費功能，供一人使用。",
            "activation": {
                "one": "1 人，{count} 台 Mac 或 Linux 電腦。",
                "other": "1 人，最多 {count} 台 Mac 或 Linux 電腦。"
            },
            "includesTitle": "免費版的所有功能，另加",
            "cta": "購買 Pro"
        },
        "team": {
            "name": "Team",
            "description": "人人都有 Pro，另加共用連線。",
            "activation": {
                "one": "每個席位 1 人，{count} 台 Mac 或 Linux 電腦。",
                "other": "每個席位 1 人，最多 {count} 台 Mac 或 Linux 電腦。"
            },
            "includesTitle": "Pro 的所有功能，另加",
            "cta": "購買 Team",
            "subscriptionOnly": "Team 按月或按年訂閱。"
        },
        "enterprise": {
            "name": "Enterprise",
            "description": "使用公司帳號登入、強制執行的政策、稽核記錄、MDM、採購單。",
            "cta": "聯絡我們"
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
            "yearly": "每席位每月，按年付費"
        }
    },
    "seats": {
        "label": "席位數",
        "noun": "席位數",
        "minimum": "最少 {min} 個席位。",
        "bounds": "最少 {min} 個席位，最多 {max} 個。",
        "clamped": {
            "min": "已調整為最少的 {min} 個席位。",
            "max": "已調整為最多的 {max} 個席位。"
        },
        "total": {
            "monthly": {
                "one": "{count} 個席位：每月 {total}",
                "other": "{count} 個席位：每月 {total}"
            },
            "yearly": {
                "one": "{count} 個席位：每年 {total}",
                "other": "{count} 個席位：每年 {total}"
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
    "refund": {
        "one": "購買或續訂後 {count} 天內可退款（<link>退款政策</link>）。",
        "other": "購買或續訂後 {count} 天內可退款（<link>退款政策</link>）。"
    },
    "finePrint": "價格以美元計；{merchant} 在結帳時加收銷售稅或加值稅。",
    "comparePlans": "比較方案",
    "section": {
        "title": "價格方案",
        "lead": "TablePro 開放原始碼且可免費使用。付費方案增加選用功能。"
    },
    "matrix": {
        "caption": "各方案包含的功能",
        "feature": "功能",
        "groups": {
            "starter": "Pro 與 Team 包含",
            "team": "Team 包含",
            "all": "所有方案包含"
        },
        "macs": "電腦台數",
        "macsFree": "無需授權",
        "macsStarter": {
            "one": "{count} 台（Mac 或 Linux）",
            "other": "最多 {count} 台（Mac 或 Linux）"
        },
        "macsTeam": {
            "one": "每席位 {count} 台（Mac 或 Linux）",
            "other": "每席位最多 {count} 台（Mac 或 Linux）"
        },
        "everythingElse": "App 中的其他所有功能",
        "everythingElseDetail": "所有支援的引擎、SQL 編輯器、AI 助理、MCP 伺服器與 Safe Mode",
        "iphoneNote": "iPhone 與 iPad App 沒有付費功能，iCloud Sync 在此 App 中免費。若要與 Mac 同步，Mac 需要 Pro 或 Team。"
    },
    "regional": {
        "note": "您所在國家或地區（{country}）的價格：結帳時享有 {percent}% 折扣。",
        "listPrice": "原價 {price}"
    },
    "discount": {
        "summary": "有折扣碼？",
        "label": "折扣碼",
        "apply": "套用折扣碼",
        "checking": "正在驗證折扣碼…",
        "percent": "折扣碼有效：結帳時享有 {amount}% 折扣。",
        "fixed": "折扣碼有效：結帳時減免 {amount}。",
        "accepted": "折扣碼有效，結帳時生效。",
        "invalid": "此折扣碼無效或已過期。"
    },
    "checkout": {
        "failed": "無法開啟結帳頁面。請再試一次。",
        "planUnavailable": "此方案暫未開售。請選擇其他計費週期，或稍後再試一次。",
        "seats": "請選擇 {min} 到 {max} 個席位，然後再試一次。",
        "seatsFewer": "請減少席位數量，然後再試一次。"
    },
    "offers": {
        "name": "{plan}，{cycle}",
        "seat": "席位"
    }
} satisfies Messages['pricing'];
