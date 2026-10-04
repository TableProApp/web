import type { Messages } from '../../types.ts';

export default {
    titleTemplate: '{title} – TablePro',
    product: {
        short: 'TablePro là database client native, mã nguồn mở, dành cho lập trình viên.',
        long: 'TablePro là database client native, mã nguồn mở, dành cho lập trình viên. Chạy query, xem và chỉnh sửa dữ liệu trên {featuredEngines} và nhiều cơ sở dữ liệu khác, với ứng dụng cho {deviceList}.',
    },
    macApp: {
        alternateName: 'TablePro cho Mac',
        subCategory: 'Database client',
    },
    iosApp: {
        alternateName: 'TablePro cho iPhone và iPad',
    },
    breadcrumbs: {
        features: 'Tính năng',
        databases: 'Cơ sở dữ liệu',
        compare: 'So sánh',
        blog: 'Blog',
    },
} satisfies Messages['seo'];
