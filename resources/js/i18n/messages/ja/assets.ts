import type { Messages } from '../../types.ts';

export default {
    "types": {
        "screenshot": "スクリーンショットの仮表示",
        "detail": "詳細拡大画像の仮表示",
        "screenshot-phone": "iPhone スクリーンショットの仮表示",
        "screenshot-ipad": "iPad スクリーンショットの仮表示",
        "diagram": "図の仮表示",
        "illustration": "イラストの仮表示"
    },
    "accessibleName": "{type}：{description}"
} satisfies Messages['assets'];
