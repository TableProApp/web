import type { Messages } from '../../types.ts';

/**
 * `ios.badge` stays English on purpose: it is the accessible name of Apple's
 * badge artwork, which is English until the owner supplies Apple's Vietnamese
 * badge, and an accessible name must match the visible text. The page marks
 * it `lang="en"`. Change both together.
 */
export default {
    macCta: 'Tải về cho Mac',
    builds: {
        arm64: 'Tải bản cho Apple silicon',
        x86_64: 'Tải bản cho Intel',
    },
    release: {
        dated: 'Phiên bản {version}, phát hành ngày {date}',
        undated: 'Phiên bản {version}',
        badge: 'v{version} · {date}',
        badgeUndated: 'v{version}',
        notes: 'Ghi chú phát hành (tiếng Anh)',
        unavailable:
            'Hiện chưa tải được thông tin bản phát hành. Cả hai nút đều mở bản phát hành mới nhất trên GitHub; tại đó bạn có thể chọn file DMG phù hợp với máy Mac của mình.',
    },
    file: {
        sized: '{name} · {size} MB',
        unsized: '{name}',
        number: {
            decimal: ',',
            group: '.',
        },
    },
    detected: 'Trình duyệt cho biết máy Mac của bạn dùng {chip}.',
    onAnotherDevice: 'Để cài ứng dụng Mac, hãy mở trang này trên máy Mac của bạn.',
    whichMac: {
        summary: 'Máy Mac của bạn dùng chip nào?',
        body: 'Mở menu Apple và chọn Giới thiệu về máy Mac này (About This Mac). Máy Mac dùng Apple silicon có mục Chip, ví dụ Apple M2. Máy Mac dùng Intel có mục Bộ xử lý (Processor) ghi tên Intel.',
    },
    afterClick: {
        title: 'Tiếp theo, cài đặt ứng dụng',
        body: 'Mở {file} trong thư mục Tải về (Downloads), rồi kéo TablePro vào thư mục Ứng dụng (Applications).',
        retry: 'Nếu file chưa được tải về, hãy <link>tải lại {file}</link>.',
        steps: 'Cài đặt và mở lần đầu',
    },
    homebrew: {
        label: 'lệnh Homebrew',
        terminal: 'Terminal',
    },
    ios: {
        badge: 'Download on the App Store',
    },
    otherPlatforms: {
        joiner: {
            separator: ', ',
            last: ' hoặc ',
        },
    },
} satisfies Messages['download'];
