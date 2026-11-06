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
    "card": {
        "yourSystem": "Hệ thống của bạn",
        "beta": "Beta",
        "dmg": "Tải về file .dmg",
        "linux": "Cài đặt trên Linux",
        "updates": {
            "mac": "Tự cập nhật trong nền",
            "ios": "Cập nhật qua App Store",
            "linux": "Cập nhật qua package manager"
        }
    },
    "linux": {
        "title": "Cài đặt trên Linux",
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
    "platforms": {
        "title": "Dùng được gì trên từng nền tảng",
        "lead": "Mọi tính năng trong mục Tính năng, đặt cạnh nhau.",
        "databases": {
            "one": "{count} cơ sở dữ liệu",
            "other": "{count} cơ sở dữ liệu"
        },
        "capability": "Tính năng",
        "covers": "{platform} {count}/{total}",
        "available": "Có",
        "page": "Trang tính năng",
        "pageLabel": "Trang tính năng {page}"
    },
    "updates": {
        "ios": "App Store tự cài bản cập nhật, như với các ứng dụng khác của bạn.",
        "linux": "Package manager cài bản cập nhật cùng phần còn lại của hệ thống. Ứng dụng không tự kiểm tra cập nhật."
    },
    "faq": {
        "title": "Câu hỏi",
        "free": {
            "question": "TablePro trên Linux có miễn phí không?",
            "answer": "Có, bạn dùng miễn phí. Các gói trả phí thêm tính năng cho ứng dụng Mac, và chưa có tính năng nào trong số đó trên Linux."
        },
        "license": {
            "question": "License của tôi có dùng được trên Linux không?",
            "answer": {
                "one": "Có. Một license kích hoạt được trên {count} máy tính, Mac hoặc Linux. Hiện tại, các tính năng trả phí của license chỉ có trên Mac.",
                "other": "Có. Một license kích hoạt được trên tối đa {count} máy tính, Mac hoặc Linux. Hiện tại, các tính năng trả phí của license chỉ có trên Mac."
            }
        },
        "other": {
            "question": "Có phiên bản cho {platforms} không?"
        },
        "verify": {
            "question": "Làm sao để kiểm tra file đã tải về?",
            "mac": "Trên Mac, mở <ui>Kiểm tra file đã tải về</ui> bên dưới nút tải về và so sánh checksum SHA-256.",
            "linux": "Trên Linux, mở <ui>Kiểm tra file</ui> trong tab File của phần Linux."
        }
    }
} satisfies Messages['download'];
