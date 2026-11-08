import type { Messages } from '../../types.ts';

export default {
    index: {
        empty: 'Chưa có bài viết nào.',
        tabs: {
            label: 'Bài viết theo loại',
            all: 'Tất cả',
            release: 'Bản phát hành',
            guide: 'Hướng dẫn',
            news: 'Tin tức',
        },
        kind: {
            release: 'Bản phát hành',
            guide: 'Hướng dẫn',
            news: 'Tin tức',
        },
        pages: {
            label: 'Phân trang',
            newer: 'Bài mới hơn',
            older: 'Bài cũ hơn',
            page: 'Trang {page} trên {pages}',
        },
    },
    latest: 'Bài phát hành mới nhất: <post>{title}</post>.',
    post: {
        archive: 'Đăng ngày {date}. Bài viết mô tả {release} lúc phát hành. Xem <features>tính năng hiện tại</features> và <changelog>changelog</changelog> (tiếng Anh).',
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
