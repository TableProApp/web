import type { Messages } from '../../types.ts';

export default {
    "index": {
        "empty": "Belum ada artikel."
    },
    "post": {
        "archive": {
            "named": "Diterbitkan pada {date}, artikel ini menjelaskan {release} pada saat itu. Untuk mengetahui fitur TablePro saat ini, lihat <features>Fitur</features> dan <changelog>catatan perubahan</changelog>.",
            "unnamed": "Diterbitkan pada {date}, artikel ini menjelaskan TablePro pada saat itu. Untuk mengetahui fitur TablePro saat ini, lihat <features>Fitur</features> dan <changelog>catatan perubahan</changelog>."
        },
        "brandedTitle": "{title} – Blog TablePro",
        "correction": "Koreksi, {date}",
        "toc": "Di halaman ini",
        "related": "Artikel terkait"
    }
} satisfies Messages['blog'];
