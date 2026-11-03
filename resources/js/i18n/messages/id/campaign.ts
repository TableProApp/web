import type { Messages } from '../../types.ts';

export default {
    "name": "Black Friday",
    "banner": {
        "label": "Promo Black Friday",
        "message": "Diskon {percent}% Pro sekali bayar dan tahunan.",
        "short": "Diskon {percent}% Pro",
        "cta": "Lihat promo",
        "close": "Tutup pemberitahuan Black Friday",
    },
    "band": {
        "title": "Diskon {percent}% TablePro Pro",
        "lead": "Pro sekali bayar seharga {lifetime}, bukan {lifetimeList}, dan Pro tahunan seharga {yearly}, bukan {yearlyList}, untuk tahun pertama.",
        "cta": "Lihat promo",
        "onPricing": "Harga Pro di bawah sudah termasuk diskon ini.",
    },
    "offer": {
        "tag": "Black Friday: diskon {percent}%",
        "firstYear": "Untuk tahun pertama, lalu {price} per tahun.",
        "listPrice": "Harga normal {price}",
    },
    "code": {
        "label": "Kode",
        "applied": "Diterapkan otomatis saat Anda membeli dari situs ini.",
        "copyLabel": "kode diskon",
    },
    "countdown": {
        "endsIn": "Berakhir dalam",
        "startsIn": "Dimulai dalam",
        "until": "Hingga {date}, pukul {time} UTC",
        "from": "Mulai {date}, pukul {time} UTC",
        "units": {
            "days": {
                "other": "hari",
            },
            "hours": "jam",
            "minutes": "menit",
            "seconds": "detik",
        },
    },
} satisfies Messages['campaign'];
