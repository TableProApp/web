import type { Messages } from '../../types.ts';

export default {
    "email": {
        "label": "邮箱地址",
        "placeholder": "name@example.com"
    },
    "subscribe": "订阅",
    "invalidEmail": "请输入有效的邮箱地址。",
    "tooMany": "尝试次数过多。请等待一分钟后重试。",
    "failed": "出了点问题。请重试。",
    "network": "无法连接服务器。请检查网络连接后重试。",
    "subscribed": "请在收件箱中查收确认链接。"
} satisfies Messages['forms'];
