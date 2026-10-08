import type { Messages } from '../../types.ts';

export default {
    "email": {
        "label": "電子郵件地址",
        "placeholder": "name@example.com"
    },
    "subscribe": "訂閱",
    "invalidEmail": "請輸入有效的電子郵件地址。",
    "tooMany": "嘗試次數過多。請等待一分鐘後再試。",
    "failed": "發生問題。請再試一次。",
    "network": "無法連線至伺服器。請檢查網路連線後再試。",
    "subscribed": "請到收件匣查看確認連結。"
} satisfies Messages['forms'];
