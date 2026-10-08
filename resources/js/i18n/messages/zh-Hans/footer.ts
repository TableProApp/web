import type { Messages } from '../../types.ts';

export default {
    "heading": "网站链接",
    "groups": {
        "product": {
            "title": "产品",
            "features": "功能",
            "databases": "数据库",
            "pricing": "定价",
            "download": "下载",
            "compare": "对比"
        },
        "resources": {
            "title": "资源",
            "docs": "文档（英语）",
            "changelog": "更新日志（英语）",
            "blog": "博客",
            "faq": "常见问题",
            "about": "关于",
            "source": "源代码",
            "reportBug": "报告问题"
        },
        "support": {
            "title": "支持",
            "account": "账户",
            "troubleshooting": "故障排除（英语）",
            "email": "邮件支持",
            "chat": "在线聊天"
        },
        "community": {
            "title": "社区",
            "discussions": "GitHub Discussions",
            "discord": "Discord",
            "x": "X",
            "telegram": "Telegram",
            "sponsor": "赞助 TablePro"
        },
        "legal": {
            "title": "法律信息",
            "privacy": "隐私",
            "terms": "条款",
            "refund": "退款政策",
            "cookies": "Cookie 设置"
        }
    },
    "newsletter": {
        "title": "通过邮件接收发行说明",
        "body": "不定期发送英语发行说明邮件。每封邮件均包含退订链接。",
        "note": "我们会先向您发送确认链接。<link>隐私政策</link>"
    },
    "bottom": {
        "copyright": "© {year} TablePro，由{city}的 {maker} 开发。源代码采用 AGPLv3 许可证。"
    }
} satisfies Messages['footer'];
