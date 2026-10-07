import type { Messages } from '../../types.ts';

export default {
    "types": {
        "screenshot": "截图占位图",
        "detail": "局部截图占位图",
        "screenshot-phone": "iPhone 截图占位图",
        "screenshot-ipad": "iPad 截图占位图",
        "diagram": "图表占位图",
        "illustration": "插图占位图"
    },
    "accessibleName": "{type}：{description}"
} satisfies Messages['assets'];
