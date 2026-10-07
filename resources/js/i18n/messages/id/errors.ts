import type { Messages } from '../../types.ts';

export default {
    "status": "Kesalahan {status}",
    "notFound": {
        "title": "Halaman tidak ditemukan",
        "body": "Alamat mungkin salah ketik atau halaman telah dipindahkan. Halaman berikut dapat menjadi titik awal."
    },
    "gone": {
        "title": "Halaman ini telah dihapus",
        "body": "Halaman ini tidak lagi menjadi bagian dari tablepro.app dan tidak ada halaman penggantinya."
    },
    "serverError": {
        "title": "Terjadi kesalahan",
        "body": "Masalah ada di pihak kami. Coba lagi sebentar lagi. Jika terus terjadi, kirim email ke {email}."
    },
    "unavailable": {
        "title": "Sedang dalam pemeliharaan",
        "body": "tablepro.app akan kembali sebentar lagi."
    },
    "translation": {
        "title": "Halaman ini hanya tersedia dalam {language}",
        "body": "Halaman ini belum diterjemahkan.",
        "link": "Baca dalam {language}"
    },
    "account": {
        "body": "Akun Anda memiliki alamat yang sama untuk semua bahasa. Buka di sini dalam bahasa yang dipilih.",
        "link": "Buka akun Anda"
    },
    "languages": {
        "en": "bahasa Inggris",
        "vi": "bahasa Vietnam",
        "es": "bahasa Spanyol",
        "de": "bahasa Jerman",
        "fr": "bahasa Prancis",
        "ja": "bahasa Jepang",
        "pt-BR": "bahasa Portugis Brasil",
        "zh-Hans": "bahasa Mandarin sederhana",
        "ko": "bahasa Korea",
        "zh-Hant": "bahasa Mandarin tradisional",
        "it": "bahasa Italia",
        "id": "bahasa Indonesia"
    },
    "linksLabel": "Halaman untuk memulai",
    "links": {
        "home": "Beranda",
        "features": "Fitur",
        "databases": "Database",
        "download": "Unduh",
        "blog": "Blog"
    }
} satisfies Messages['errors'];
