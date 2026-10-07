import type { Messages } from '../../types.ts';

export default {
    "language": {
        "label": "Bahasa",
        "current": "Bahasa: {language}",
        "fallback": "Halaman ini tidak tersedia dalam bahasa Indonesia",
        "fallbackPost": "Artikel ini tidak tersedia dalam bahasa Indonesia",
        "fallbackBlog": "Lihat daftar artikel blog"
    },
    "theme": {
        "label": "Tema",
        "current": "Tema: {choice}",
        "light": "Terang",
        "dark": "Gelap",
        "system": "Sistem"
    },
    "copy": {
        "copy": "Salin",
        "copied": "Disalin",
        "copyNamed": "Salin {label}",
        "failed": "Tidak dapat menyalin. Pilih teks lalu salin."
    },
    "stepper": {
        "decrease": "Kurangi {label}",
        "increase": "Tambah {label}"
    },
    "availability": {
        "included": "Termasuk",
        "notIncluded": "Tidak termasuk"
    },
    "dismiss": "Abaikan",
    "close": "Tutup"
} satisfies Messages['controls'];
