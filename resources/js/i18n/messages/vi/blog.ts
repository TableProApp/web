import type { Messages } from '../../types.ts';

export default {
    index: {
        empty: 'Chưa có bài viết nào.',
    },
    post: {
        archive: {
            named: 'Bài viết đăng ngày {date}, mô tả {release} tại thời điểm đó. Để biết TablePro hiện có những gì, hãy xem <features>Tính năng</features> và <changelog>changelog</changelog> (tiếng Anh).',
            unnamed: 'Bài viết đăng ngày {date}, mô tả TablePro tại thời điểm đó. Để biết TablePro hiện có những gì, hãy xem <features>Tính năng</features> và <changelog>changelog</changelog> (tiếng Anh).',
        },
        brandedTitle: '{title} – Blog TablePro',
        correction: 'Đính chính ngày {date}',
        toc: 'Trên trang này',
        related: 'Bài viết liên quan',
    },
} satisfies Messages['blog'];
