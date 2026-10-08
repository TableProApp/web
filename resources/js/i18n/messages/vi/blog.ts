import type { Messages } from '../../types.ts';

export default {
    index: {
        empty: 'Chưa có bài viết nào.',
    },
    latest: 'Một số phiên bản còn có bài viết trên blog. Bài mới nhất là <post>{title}</post>.',
    post: {
        archive: 'Bài viết đăng ngày {date}, mô tả {release} tại thời điểm đó. Để biết TablePro hiện có những gì, hãy xem <features>Tính năng</features> và <changelog>changelog</changelog> (tiếng Anh).',
        correction: 'Đính chính ngày {date}',
        toc: 'Trên trang này',
        pages: 'Trang liên quan',
        notes: {
            title: 'Ghi chú phát hành đầy đủ',
            changelog: '{release} trong changelog',
            github: '{release} trên GitHub',
        },
        related: 'Bài viết liên quan',
    },
} satisfies Messages['blog'];
