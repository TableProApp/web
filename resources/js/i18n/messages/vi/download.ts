import type { Messages } from '../../types.ts';

// ios.badge is the visible text of Apple's Vietnamese badge artwork, word for word: an accessible name must match it.
export default {
    "macCta": "Tải về cho Mac",
    "release": {
        "dated": "Phiên bản {version}, phát hành ngày {date}",
        "undated": "Phiên bản {version}",
        "notes": "Ghi chú phát hành (tiếng Anh)",
        "unavailable": "Không tải được thông tin bản phát hành. Nút tải về mở bản mới nhất trên GitHub."
    },
    "file": {
        "size": "{size} MB",
        "number": {
            "decimal": ",",
            "group": "."
        }
    },
    "checksum": {
        "summary": "Kiểm tra file đã tải về",
        "body": "Chạy <code>shasum -a 256</code> với file đó trong Terminal. Kết quả phải khớp với checksum SHA-256 bên dưới."
    },
    "afterClick": {
        "title": "Tiếp theo, cài đặt ứng dụng",
        "body": "Mở {file} trong thư mục Tải về (Downloads), rồi kéo TablePro vào thư mục Ứng dụng (Applications).",
        "retry": "Nếu file chưa được tải về, hãy <link>tải lại {file}</link>."
    },
    "homebrew": {
        "label": "lệnh Homebrew",
        "terminal": "Terminal"
    },
    "ios": {
        "badge": "Tải về trên App Store"
    },
    "orList": {
        "separator": ", ",
        "last": " hoặc "
    },
    "panel": {
        "legend": "Nền tảng",
        "beta": "Beta",
        "updates": {
            "mac": "Tự cập nhật trong nền",
            "ios": "Cập nhật qua App Store"
        }
    },
    "linux": {
        "beta": "Ứng dụng cho Linux đang là bản beta: còn ở giai đoạn đầu và có thể thay đổi giữa các bản phát hành, nên hãy <link>báo lỗi trên GitHub</link>.",
        "methods": "Cài đặt bằng",
        "floor": "{name} {version}+",
        "anyDistribution": "mọi bản phân phối qua Flatpak",
        "flatpak": "Flatpak",
        "files": "File",
        "commands": "Lệnh cho {method}",
        "requirement": "{name} {versions} · {architectures}",
        "flatpakRequirement": "Mọi bản phân phối có Flatpak · {architectures} · kèm runtime GNOME {version} riêng",
        "update": "Cập nhật bằng <code>{command}</code>",
        "table": {
            "caption": "Các package của TablePro {version} cho Linux",
            "package": "Package",
            "bundle": "Bundle Flatpak"
        },
        "checksums": "Checksum của mọi file: <link>{file}</link>",
        "release": "TablePro {version} cho Linux trên GitHub",
        "verify": {
            "summary": "Kiểm tra file",
            "body": "Chạy một trong hai lệnh trong thư mục chứa file. Lệnh đầu kiểm tra build attestation của GitHub và cần GitHub CLI; lệnh sau đối chiếu file với {file}.",
            "label": "lệnh kiểm tra"
        }
    },
    "otherPlatforms": {
        "question": "Có phiên bản cho {platforms} không?"
    }
} satisfies Messages['download'];
