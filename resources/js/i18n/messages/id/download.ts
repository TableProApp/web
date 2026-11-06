import type { Messages } from '../../types.ts';

export default {
    "macCta": "Unduh untuk Mac",
    "release": {
        "dated": "Versi {version}, dirilis {date}",
        "undated": "Versi {version}",
        "notes": "Catatan rilis (bahasa Inggris)",
        "unavailable": "Detail rilis tidak tersedia. Tombol ini membuka rilis terbaru di GitHub."
    },
    "file": {
        "size": "{size} MB",
        "number": {
            "decimal": ",",
            "group": "."
        }
    },
    "checksum": {
        "summary": "Verifikasi unduhan Anda",
        "body": "Jalankan <code>shasum -a 256</code> pada file tersebut di Terminal. Hasilnya harus sama dengan checksum SHA-256 di bawah."
    },
    "afterClick": {
        "title": "Selanjutnya, instal aplikasi",
        "body": "Buka {file} dari folder Unduhan lalu seret TablePro ke Aplikasi.",
        "retry": "Jika unduhan belum dimulai, <link>unduh {file} lagi</link>."
    },
    "homebrew": {
        "label": "Perintah Homebrew",
        "terminal": "Terminal"
    },
    "ios": {
        "badge": "Unduh di App Store"
    },
    "orList": {
        "separator": ", ",
        "last": " atau "
    },
    "card": {
        "yourSystem": "Sistem Anda",
        "beta": "Beta",
        "dmg": "Unduh .dmg",
        "linux": "Instal di Linux",
        "updates": {
            "mac": "Memperbarui sendiri di latar belakang",
            "ios": "Diperbarui lewat App Store",
            "linux": "Diperbarui lewat manajer paket Anda"
        }
    },
    "linux": {
        "title": "Instal di Linux",
        "beta": "Aplikasi Linux masih beta: masih tahap awal dan bisa berubah antarrilis, jadi <link>laporkan bug di GitHub</link>.",
        "methods": "Instal dengan",
        "floor": "{name} {version}+",
        "anyDistribution": "distribusi apa pun lewat Flatpak",
        "flatpak": "Flatpak",
        "files": "File",
        "commands": "Perintah {method}",
        "requirement": "{name} {versions} · {architectures}",
        "flatpakRequirement": "Distribusi apa pun dengan Flatpak · {architectures} · membawa runtime GNOME {version} sendiri",
        "update": "Pembaruan datang lewat <code>{command}</code>",
        "table": {
            "caption": "Paket TablePro {version} untuk Linux",
            "package": "Paket",
            "bundle": "Bundle Flatpak"
        },
        "checksums": "Checksum untuk semua file: <link>{file}</link>",
        "release": "TablePro {version} untuk Linux di GitHub",
        "verify": {
            "summary": "Verifikasi file",
            "body": "Jalankan salah satu perintah di folder tempat file berada. Yang pertama memeriksa atestasi build GitHub dan memerlukan GitHub CLI; yang kedua mencocokkan file dengan {file}.",
            "label": "perintah verifikasi"
        }
    },
    "platforms": {
        "title": "Apa yang berjalan di tiap platform",
        "lead": "Semua kemampuan di halaman fitur, berdampingan.",
        "databases": {
            "one": "{count} database",
            "other": "{count} database"
        },
        "capability": "Kemampuan",
        "covers": "{platform} {count} dari {total}",
        "available": "Tersedia",
        "page": "Halaman fitur",
        "pageLabel": "Halaman fitur {page}"
    },
    "updates": {
        "ios": "App Store menginstal pembaruan, seperti untuk aplikasi Anda yang lain.",
        "linux": "Manajer paket Anda menginstal pembaruan bersama bagian sistem lainnya. Aplikasi tidak memeriksa pembaruan sendiri."
    },
    "faq": {
        "title": "Pertanyaan",
        "free": {
            "question": "Apakah TablePro gratis di Linux?",
            "answer": "Ya, gratis digunakan. Paket berbayar menambah fitur di aplikasi Mac, dan belum ada yang tersedia di Linux."
        },
        "license": {
            "question": "Apakah lisensi saya berlaku di Linux?",
            "answer": {
                "one": "Ya. Satu lisensi bisa diaktifkan di {count} komputer, Mac atau Linux. Untuk saat ini, fitur berbayarnya ada di Mac.",
                "other": "Ya. Satu lisensi bisa diaktifkan di hingga {count} komputer, Mac atau Linux. Untuk saat ini, fitur berbayarnya ada di Mac."
            }
        },
        "other": {
            "question": "Apakah ada versi untuk {platforms}?"
        },
        "verify": {
            "question": "Bagaimana cara memverifikasi unduhan?",
            "mac": "Di Mac, buka <ui>Verifikasi unduhan Anda</ui> di bawah tombol unduh dan bandingkan checksum SHA-256.",
            "linux": "Di Linux, buka <ui>Verifikasi file</ui> di tab File pada bagian Linux."
        }
    }
} satisfies Messages['download'];
