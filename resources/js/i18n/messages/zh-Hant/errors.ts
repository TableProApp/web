import type { Messages } from '../../types.ts';

export default {
    "status": "錯誤 {status}",
    "notFound": {
        "title": "找不到頁面",
        "body": "請檢查網址，或使用下方連結。"
    },
    "gone": {
        "title": "此頁面已移除",
        "body": "此頁面已不再屬於 tablepro.app，也沒有替代頁面。"
    },
    "serverError": {
        "title": "發生問題",
        "body": "問題出在我們這邊。請稍後再試。如問題持續，請寄送郵件至 {email}。"
    },
    "unavailable": {
        "title": "維護中",
        "body": "tablepro.app 將很快恢復。"
    },
    "translation": {
        "title": "此頁面僅提供{language}版本",
        "body": "尚未翻譯。",
        "link": "閱讀{language}版本"
    },
    "account": {
        "body": "您的帳戶在所有語言中使用同一網址。在此以您所選的語言開啟。",
        "link": "開啟帳戶"
    },
    "languages": {
        "en": "英文",
        "vi": "越南文",
        "es": "西班牙文",
        "de": "德文",
        "fr": "法文",
        "ja": "日文",
        "pt-BR": "葡萄牙文（巴西）",
        "zh-Hans": "簡體中文",
        "ko": "韓文",
        "zh-Hant": "繁體中文",
        "it": "義大利文",
        "id": "印尼文"
    },
    "linksLabel": "可從這些頁面開始",
    "links": {
        "home": "首頁",
        "features": "功能",
        "databases": "資料庫",
        "download": "下載",
        "blog": "部落格"
    }
} satisfies Messages['errors'];
