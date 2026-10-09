import type { Messages } from '../../types.ts';

export default {
    "index": {
        "empty": "Belum ada artikel.",
        "guides": "Panduan",
        "releases": "Catatan rilis"
    },
    "latest": "Artikel rilis terbaru: <post>{title}</post>.",
    "post": {
        "archive": "Diterbitkan pada {date}. Artikel ini membahas {release} saat dirilis. Lihat <features>fitur saat ini</features> dan <changelog>changelog</changelog> (bahasa Inggris).",
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
