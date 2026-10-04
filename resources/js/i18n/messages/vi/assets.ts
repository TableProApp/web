import type { Messages } from '../../types.ts';

export default {
    types: {
        screenshot: 'Ảnh chụp màn hình (sẽ bổ sung)',
        detail: 'Ảnh cắt chi tiết (sẽ bổ sung)',
        'screenshot-phone': 'Ảnh chụp iPhone (sẽ bổ sung)',
        'screenshot-ipad': 'Ảnh chụp iPad (sẽ bổ sung)',
        diagram: 'Sơ đồ (sẽ bổ sung)',
        illustration: 'Hình minh họa (sẽ bổ sung)',
    },
    accessibleName: '{type}: {description}',
} satisfies Messages['assets'];
