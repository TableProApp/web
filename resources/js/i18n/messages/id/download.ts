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
    "panel": {
        "legend": "Platform",
        "beta": "Beta",
        "updates": {
            "mac": "Memperbarui sendiri di latar belakang",
            "ios": "Diperbarui lewat App Store"
        }
    },
    "linux": {
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
    "otherPlatforms": {
        "question": "Apakah ada versi untuk {platforms}?"
    }
} satisfies Messages['download'];
