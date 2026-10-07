import type { Messages } from '../../types.ts';

export default {
    "types": {
        "screenshot": "스크린샷 자리표시자",
        "detail": "상세 확대 이미지 자리표시자",
        "screenshot-phone": "iPhone 스크린샷 자리표시자",
        "screenshot-ipad": "iPad 스크린샷 자리표시자",
        "diagram": "다이어그램 자리표시자",
        "illustration": "일러스트 자리표시자"
    },
    "accessibleName": "{type}: {description}"
} satisfies Messages['assets'];
