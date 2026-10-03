import type { Messages } from '../../types.ts';

export default {
    status: 'Lỗi {status}',
    notFound: {
        title: 'Không tìm thấy trang',
        body: 'Địa chỉ có thể bị gõ sai, hoặc trang đã được chuyển đi. Bạn có thể bắt đầu từ một trong các trang dưới đây.',
    },
    gone: {
        title: 'Trang này đã bị gỡ',
        body: 'Trang này không còn trên tablepro.app, và không có trang nào thay thế.',
    },
    serverError: {
        title: 'Đã xảy ra lỗi',
        body: 'Lỗi từ phía chúng tôi. Hãy thử lại sau ít phút. Nếu lỗi vẫn tiếp diễn, hãy gửi email tới {email}.',
    },
    unavailable: {
        title: 'Đang bảo trì',
        body: 'tablepro.app sẽ sớm hoạt động trở lại.',
    },
    translation: {
        title: 'Trang này chỉ có bằng {language}',
        body: 'Trang này chưa được dịch.',
        link: 'Đọc bản {language}',
    },
    account: {
        body: 'Tài khoản có cùng một địa chỉ cho mọi ngôn ngữ. Bạn mở tài khoản tại đây, giao diện sẽ bằng tiếng Việt.',
        link: 'Mở tài khoản',
    },
    languages: {
        en: 'tiếng Anh',
        vi: 'tiếng Việt',
    },
    linksLabel: 'Các trang để bắt đầu',
    links: {
        home: 'Trang chủ',
        features: 'Tính năng',
        databases: 'Cơ sở dữ liệu',
        download: 'Tải về',
        blog: 'Blog',
    },
} satisfies Messages['errors'];
