import type { Messages } from '../../types.ts';

/**
 * `ios.badge` is the accessible name of Apple's Vietnamese badge artwork
 * (public/images/app-store-*-vi.svg), so it is that file's visible text, word
 * for word: an accessible name must match what the badge says.
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
            'Không tải được thông tin bản phát hành. Cả hai nút mở bản mới nhất trên GitHub; chọn bản build tại đó.',
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
        body: 'Chọn Giới thiệu về máy Mac này (About This Mac) trong menu Apple. Mục Chip nghĩa là Apple silicon; mục Bộ xử lý (Processor) ghi Intel nghĩa là Intel.',
    },
    checksum: {
        summary: 'Kiểm tra file đã tải về',
        body: 'Chạy <code>shasum -a 256</code> với file đó trong Terminal. Kết quả phải khớp với checksum SHA-256 bên dưới.',
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
        badge: 'Tải về trên App Store',
    },
    otherPlatforms: {
        joiner: {
            separator: ', ',
            last: ' hoặc ',
        },
    },
} satisfies Messages['download'];
