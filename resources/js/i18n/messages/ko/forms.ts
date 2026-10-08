import type { Messages } from '../../types.ts';

export default {
    "email": {
        "label": "이메일 주소",
        "placeholder": "name@example.com"
    },
    "subscribe": "구독",
    "invalidEmail": "올바른 이메일 주소를 입력하세요.",
    "tooMany": "시도 횟수가 너무 많습니다. 1분 후 다시 시도하세요.",
    "failed": "문제가 발생했습니다. 다시 시도하세요.",
    "network": "서버에 연결하지 못했습니다. 연결 상태를 확인하고 다시 시도하세요.",
    "subscribed": "받은편지함에서 확인 링크를 확인하세요."
} satisfies Messages['forms'];
