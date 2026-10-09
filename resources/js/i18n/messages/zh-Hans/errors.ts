import type { Messages } from '../../types.ts';

export default {
    "status": "错误 {status}",
    "notFound": {
        "title": "找不到页面",
        "body": "请检查地址，或使用下方链接。"
    },
    "gone": {
        "title": "此页面已移除",
        "body": "此页面已不再属于 tablepro.app，也没有替代页面。"
    },
    "serverError": {
        "title": "出了点问题",
        "body": "问题出在我们这边。请稍后重试。如问题持续，请发送邮件至 {email}。"
    },
    "unavailable": {
        "title": "维护中",
        "body": "tablepro.app 将很快恢复。"
    },
    "translation": {
        "title": "此页面仅提供{language}版本",
        "body": "尚未翻译。",
        "link": "阅读{language}版本"
    },
    "account": {
        "body": "您的账户在所有语言中使用同一地址。在此以您所选的语言打开。",
        "link": "打开账户"
    },
    "languages": {
        "en": "英语",
        "vi": "越南语",
        "es": "西班牙语",
        "de": "德语",
        "fr": "法语",
        "ja": "日语",
        "pt-BR": "葡萄牙语（巴西）",
        "zh-Hans": "简体中文",
        "ko": "韩语",
        "zh-Hant": "繁体中文",
        "it": "意大利语",
        "id": "印度尼西亚语"
    },
    "linksLabel": "可从这些页面开始",
    "links": {
        "home": "首页",
        "features": "功能",
        "databases": "数据库",
        "download": "下载",
        "blog": "博客"
    }
} satisfies Messages['errors'];
