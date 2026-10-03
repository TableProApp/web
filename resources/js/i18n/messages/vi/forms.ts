import type { Messages } from '../../types.ts';

export default {
    email: {
        label: 'Địa chỉ email',
        placeholder: 'ban@example.com',
    },
    subscribe: 'Đăng ký nhận tin',
    invalidEmail: 'Hãy nhập một địa chỉ email hợp lệ.',
    tooMany: 'Bạn đã thử quá nhiều lần. Hãy đợi một phút rồi thử lại.',
    failed: 'Đã xảy ra lỗi. Hãy thử lại.',
    network: 'Không kết nối được tới máy chủ. Hãy kiểm tra kết nối rồi thử lại.',
    subscribed: 'Hãy kiểm tra hộp thư để mở liên kết xác nhận.',
} satisfies Messages['forms'];
