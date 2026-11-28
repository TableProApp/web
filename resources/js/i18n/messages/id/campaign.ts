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
    "notice": {
        "headline": "Diskon {percent}%",
        "product": "TablePro Pro",
        "window": "Pro sekali bayar dan Pro tahunan, hingga {endsOn}, pukul {endsAtTime} UTC.",
        "lifetime": "Pro sekali bayar",
        "lifetimeDetail": "Sekali bayar. Semua pembaruan dan fitur Pro baru.",
        "yearly": "Pro tahunan",
        "buy": "Beli Pro sekali bayar seharga {price}",
        "both": "Lihat kedua penawaran",
        "later": "Nanti saja",
        "footnote": "Pro bulanan dan Team tidak termasuk promo. Harga normal sejak {listPriceSince}.",
        "card": "Black Friday: diskon {percent}% Pro",
        "cardPrice": "Pro sekali bayar seharga {price}."
    },
} satisfies Messages['campaign'];
