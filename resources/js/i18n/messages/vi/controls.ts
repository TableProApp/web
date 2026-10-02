import type { Messages } from '../../types.ts';

export default {
    language: {
        label: 'Ngôn ngữ',
        inlineLabel: 'Ngôn ngữ:',
        current: 'Ngôn ngữ: {language}',
        fallback: 'Trang này chưa có bản tiếng Việt',
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
    footnotes: {
        marker: 'Ghi chú',
        list: 'Ghi chú',
        back: 'Quay lại chỗ đánh dấu ghi chú này',
    },
    dismiss: 'Ẩn thông báo',
    close: 'Đóng',
    cancel: 'Hủy',
    working: 'Đang xử lý…',
} satisfies Messages['controls'];
