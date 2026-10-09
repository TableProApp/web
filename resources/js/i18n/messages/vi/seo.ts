import type { Messages } from '../../types.ts';

export default {
    titleTemplate: '{title} – TablePro',
    product: {
        short: 'TablePro là database client native, mã nguồn mở.',
        long: 'TablePro là database client native, mã nguồn mở. Chạy query, xem và sửa dữ liệu trên {featuredEngines} và nhiều engine khác. Có cho {deviceList}.',
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
