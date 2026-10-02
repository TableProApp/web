import type { Messages } from '../../types.ts';

export default {
    requirement: {
        named: '{systems} {version} {releaseName} trở lên',
        unnamed: '{systems} {version} trở lên',
    },
    requires: 'Yêu cầu {requirement}',
    systemsJoiner: ' và ',
    architectures: {
        arm64: 'Apple silicon',
        x86_64: 'Intel',
        joiner: ' hoặc ',
    },
    app: {
        mac: 'ứng dụng Mac',
        ios: 'ứng dụng cho iPhone và iPad',
    },
    availability: {
        summary: 'Hiện có trên {deviceList}.',
    },
    free: 'Miễn phí, không có mua hàng trong ứng dụng',
    status: {
        released: 'Đã phát hành',
        prototype: 'Mới chỉ có bản prototype: chưa có gì để cài đặt và chưa có ngày phát hành.',
        none: 'Hiện không có bản cài đặt, cũng không có ngày phát hành dự kiến.',
    },
    names: {
        linux: 'Linux',
        windows: 'Windows',
    },
    release: {
        badge: '{version}',
        badgeLabel: 'Có từ TablePro {version} cho Mac. Homebrew có thể vẫn cài bản cũ hơn.',
    },
} satisfies Messages['platforms'];
