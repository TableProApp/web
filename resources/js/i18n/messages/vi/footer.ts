import type { Messages } from '../../types.ts';

export default {
    heading: 'Liên kết',
    groups: {
        product: {
            title: 'Sản phẩm',
            features: 'Tính năng',
            databases: 'Cơ sở dữ liệu',
            pricing: 'Bảng giá',
            download: 'Tải về',
            compare: 'So sánh',
        },
        resources: {
            title: 'Tài nguyên',
            docs: 'Tài liệu (tiếng Anh)',
            changelog: 'Changelog (tiếng Anh)',
            blog: 'Blog',
            faq: 'Câu hỏi thường gặp',
            about: 'Giới thiệu',
            source: 'Mã nguồn',
            reportBug: 'Báo lỗi',
        },
        support: {
            title: 'Hỗ trợ',
            account: 'Tài khoản',
            troubleshooting: 'Khắc phục sự cố (tiếng Anh)',
            email: 'Gửi email hỗ trợ',
            chat: 'Chat trực tuyến',
        },
        community: {
            title: 'Cộng đồng',
            discussions: 'GitHub Discussions',
            discord: 'Discord',
            x: 'X',
            telegram: 'Telegram',
            sponsor: 'Tài trợ TablePro',
        },
        legal: {
            title: 'Pháp lý',
            privacy: 'Quyền riêng tư',
            security: 'Bảo mật',
            terms: 'Điều khoản sử dụng',
            refund: 'Chính sách hoàn tiền',
            cookies: 'Cài đặt cookie',
        },
    },
    newsletter: {
        title: 'Ghi chú phát hành qua email',
        body: 'Thỉnh thoảng một email, viết bằng tiếng Anh, về các bản phát hành. Email nào cũng có liên kết hủy đăng ký.',
        note: 'Chúng tôi sẽ gửi cho bạn một liên kết xác nhận trước. <link>Chính sách quyền riêng tư</link>',
    },
    bottom: {
        copyright: '© {year} TablePro, do {maker} phát triển tại {city}. Mã nguồn theo giấy phép AGPLv3.',
    },
} satisfies Messages['footer'];
