import type { Messages } from '../../types.ts';

export default {
    "macCta": "Unduh untuk Mac",
    "builds": {
        "arm64": "Unduh untuk Apple silicon",
        "x86_64": "Unduh untuk Intel"
    },
    "release": {
        "dated": "Versi {version}, dirilis {date}",
        "undated": "Versi {version}",
        "badge": "v{version} · {date}",
        "badgeUndated": "v{version}",
        "notes": "Catatan rilis (bahasa Inggris)",
        "unavailable": "Detail rilis tidak tersedia. Kedua tombol membuka rilis terbaru di GitHub; pilih build di sana."
    },
    "file": {
        "sized": "{name} · {size} MB",
        "unsized": "{name}",
        "number": {
            "decimal": ",",
            "group": "."
        }
    },
    "detected": "Browser Anda melaporkan Mac dengan {chip}.",
    "onAnotherDevice": "Untuk menginstal aplikasi Mac, buka halaman ini di Mac Anda.",
    "whichMac": {
        "summary": "Mac apa yang saya miliki?",
        "body": "Pilih Mengenai Mac Ini di menu Apple. Baris Chip menunjukkan Apple silicon; baris Prosesor yang menyebut Intel menunjukkan Intel."
    },
    "checksum": {
        "summary": "Verifikasi unduhan Anda",
        "body": "Jalankan <code>shasum -a 256</code> pada file tersebut di Terminal. Hasilnya harus sama dengan checksum SHA-256 di bawah."
    },
    "afterClick": {
        "title": "Selanjutnya, instal aplikasi",
        "body": "Buka {file} dari folder Unduhan lalu seret TablePro ke Aplikasi.",
        "retry": "Jika unduhan belum dimulai, <link>unduh {file} lagi</link>.",
        "steps": "Instalasi dan penggunaan pertama"
    },
    "homebrew": {
        "label": "Perintah Homebrew",
        "terminal": "Terminal"
    },
    "ios": {
        "badge": "Unduh di App Store"
    },
    "otherPlatforms": {
        "joiner": {
            "separator": ", ",
            "last": " atau "
        }
    }
} satisfies Messages['download'];
