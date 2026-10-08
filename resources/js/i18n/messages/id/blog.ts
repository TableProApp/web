import type { Messages } from '../../types.ts';

export default {
    "index": {
        "empty": "Belum ada artikel.",
        "guides": "Panduan",
        "releases": "Catatan rilis"
    },
    "latest": "Sebagian rilis juga dibahas dalam artikel di blog. Yang terbaru adalah <post>{title}</post>.",
    "post": {
        "archive": "Diterbitkan pada {date}, artikel ini menjelaskan {release} pada saat itu. Untuk mengetahui fitur TablePro saat ini, lihat <features>Fitur</features> dan <changelog>catatan perubahan</changelog> (bahasa Inggris).",
        "correction": "Koreksi, {date}",
        "toc": "Di halaman ini",
        "pages": "Halaman terkait",
        "notes": {
            "title": "Catatan rilis lengkap",
            "changelog": "{release} di catatan perubahan",
            "github": "{release} di GitHub"
        },
        "related": "Artikel terkait"
    }
} satisfies Messages['blog'];
