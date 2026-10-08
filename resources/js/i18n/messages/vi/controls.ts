import type { Messages } from '../../types.ts';

export default {
    language: {
        label: 'Ngôn ngữ',
        current: 'Ngôn ngữ: {language}',
        fallback: 'Trang này không có bản tiếng Việt',
        fallbackPost: 'Bài viết này chỉ có bằng tiếng Anh',
        fallbackBlog: 'Xem danh sách Blog',
    },
    theme: {
        label: 'Giao diện',
        current: 'Giao diện: {choice}',
        light: 'Sáng',
        dark: 'Tối',
        system: 'Theo hệ thống',
    },
    copy: {
        copy: 'Sao chép',
        copied: 'Đã sao chép',
        copyNamed: 'Sao chép {label}',
        failed: 'Không sao chép được. Hãy chọn và sao chép thủ công.',
    },
    stepper: {
        decrease: 'Giảm {label}',
        increase: 'Tăng {label}',
    },
    availability: {
        included: 'Có',
        notIncluded: 'Không có',
    },
    dismiss: 'Ẩn thông báo',
    close: 'Đóng',
} satisfies Messages['controls'];
