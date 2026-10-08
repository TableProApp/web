import type { Messages } from '../../types.ts';

export default {
    "currency": {
        "pattern": "${amount}",
        "decimal": ".",
        "group": ","
    },
    "cycles": {
        "legend": "计费周期",
        "monthly": "按月",
        "yearly": "按年",
        "lifetime": "一次性"
    },
    "captions": {
        "monthly": "取消前每月自动续订。",
        "yearly": "取消前每年自动续订。比按月支付十二次低 {percent}%。",
        "yearlyByTier": "取消前每年自动续订。相比按月支付十二次，Starter 低 {starterPercent}%，Team 低 {teamPercent}%。",
        "lifetime": "一次付费，无到期日。"
    },
    "tiers": {
        "free": {
            "name": "免费",
            "description": "不含付费功能的 Mac 应用，以及 iPhone 和 iPad 应用。",
            "activation": "无需注册即可使用应用。",
            "includesTitle": "包含",
            "includes": [
                "连接任何受支持的引擎",
                "SQL 编辑器和数据网格",
                "AI 助手和 MCP 服务器",
                "安全模式",
                "iPhone 和 iPad 应用"
            ]
        },
        "starter": {
            "name": "Starter",
            "description": "为 Mac 应用添加 Starter 功能。",
            "activation": {
                "one": "一个许可证可用于 {count} 台 Mac。",
                "other": "一个许可证最多可用于 {count} 台 Mac。"
            },
            "includesTitle": "免费版的全部功能，外加",
            "cta": "购买 Starter"
        },
        "team": {
            "name": "Team",
            "description": "在 Starter 的基础上，增加与团队共享连接和查询的功能。",
            "activation": "每个席位对应一台已激活的 Mac。",
            "includesTitle": "Starter 的全部功能，外加",
            "cta": "购买 Team"
        }
    },
    "units": {
        "starter": {
            "monthly": "每月",
            "yearly": "每年",
            "lifetime": "一次付费"
        },
        "team": {
            "monthly": "每席位每月",
            "yearly": "每席位每年",
            "lifetime": "每席位一次付费"
        }
    },
    "seats": {
        "label": "席位数",
        "noun": "席位数",
        "bounds": "最少 {min} 个席位，最多 {max} 个。",
        "total": {
            "monthly": {
                "one": "{count} 个席位：每月 {total}",
                "other": "{count} 个席位：每月 {total}"
            },
            "yearly": {
                "one": "{count} 个席位：每年 {total}",
                "other": "{count} 个席位：每年 {total}"
            },
            "lifetime": {
                "one": "{count} 个席位：{total}，一次付费",
                "other": "{count} 个席位：{total}，一次付费"
            }
        }
    },
    "prioritySupport": {
        "name": "优先支持",
        "detail": {
            "one": "优先回复 Team 客户的邮件，并在一个工作日内答复。",
            "other": "优先回复 Team 客户的邮件，并在 {count} 个工作日内答复。"
        }
    },
    "allFeatures": "所有付费功能",
    "finePrint": "价格以美元计。{merchant} 为 merchant of record，负责收款，并在结账时计算销售税或增值税。",
    "finePrintCurrency": "价格以美元计。",
    "comparePlans": "对比方案",
    "section": {
        "title": "定价",
        "lead": "TablePro 开源且可免费使用。付费方案为 Mac 应用增加可选功能。"
    },
    "matrix": {
        "caption": "各方案在 Mac 应用中包含的功能",
        "feature": "功能",
        "macs": "Mac 台数",
        "macsFree": "无需许可证",
        "macsStarter": {
            "one": "{count}",
            "other": "最多 {count}"
        },
        "macsTeam": "每席位一台",
        "everythingElse": "应用中的其他所有功能",
        "everythingElseDetail": "所有受支持的引擎、SQL 编辑器、AI 助手、MCP 服务器和安全模式",
        "iphoneNote": "iPhone 和 iPad 应用没有付费功能，iCloud 同步在这两款设备上免费。若要与 Mac 同步，Mac 需要 Starter 或 Team。"
    },
    "discount": {
        "atCheckout": "有优惠码？请在结账时输入。",
        "summary": "有优惠码？",
        "label": "优惠码",
        "apply": "应用优惠码",
        "checking": "正在验证优惠码…",
        "percent": "优惠码有效：结账时享受 {amount}% 折扣。",
        "fixed": "优惠码有效：结账时减免 {amount}。",
        "invalid": "此优惠码无效或已过期。"
    },
    "checkout": {
        "failed": "无法开始结账。请重试。"
    },
    "offers": {
        "name": "{plan}，{cycle}",
        "seat": "席位"
    }
} satisfies Messages['pricing'];
