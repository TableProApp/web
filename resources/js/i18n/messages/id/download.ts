import type { Messages } from '../../types.ts';

export default {
    "macCta": "Unduh untuk Mac",
    "release": {
        "dated": "Versi {version}, dirilis {date}",
        "undated": "Versi {version}",
        "badge": "v{version} · {date}",
        "badgeUndated": "v{version}",
        "notes": "Catatan rilis (bahasa Inggris)",
        "unavailable": "Detail rilis tidak tersedia. Tombol ini membuka rilis terbaru di GitHub."
    },
    "file": {
        "sized": "{name} · {size} MB",
        "unsized": "{name}",
        "number": {
            "decimal": ",",
            "group": "."
        }
    },
    "onAnotherDevice": "Untuk menginstal aplikasi Mac, buka halaman ini di Mac Anda.",
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
