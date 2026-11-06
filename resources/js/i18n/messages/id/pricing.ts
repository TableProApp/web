import type { Messages } from '../../types.ts';

export default {
    "currency": {
        "pattern": "US$ {amount}",
        "decimal": ",",
        "group": "."
    },
    "cycles": {
        "legend": "Siklus penagihan",
        "monthly": "Bulanan",
        "yearly": "Tahunan",
        "lifetime": "Sekali bayar"
    },
    "captions": {
        "monthly": "Diperpanjang setiap bulan hingga Anda membatalkannya.",
        "yearly": "Diperpanjang setiap tahun hingga Anda membatalkannya. {percent}% lebih murah daripada dua belas pembayaran bulanan.",
        "yearlyByTier": "Diperpanjang setiap tahun hingga Anda membatalkannya. Pro {starterPercent}% lebih murah daripada dua belas pembayaran bulanan, Team {teamPercent}% lebih murah.",
        "lifetime": "Dibayar sekali, tanpa tanggal kedaluwarsa."
    },
    "tiers": {
        "free": {
            "name": "Gratis",
            "description": "Alat database inti, tanpa masa uji coba.",
            "activation": "Tidak perlu mendaftar untuk menggunakan aplikasi.",
            "includesTitle": "Termasuk",
            "includes": [
                "Semua mesin database yang didukung",
                "Editor SQL dan grid data",
                "Asisten AI dan server MCP",
                "Safe Mode",
                "Aplikasi iPhone dan iPad"
            ]
        },
        "starter": {
            "name": "Pro",
            "description": "Fitur berbayar, untuk satu orang.",
            "activation": {
                "one": "Satu orang, {count} Mac.",
                "other": "Satu orang, hingga {count} Mac."
            },
            "includesTitle": "Semua fitur Gratis, ditambah",
            "cta": "Beli Pro"
        },
        "team": {
            "name": "Team",
            "description": "Pro untuk semua orang, plus koneksi bersama.",
            "activation": {
                "one": "Satu orang per seat, {count} Mac.",
                "other": "Satu orang per seat, hingga {count} Mac."
            },
            "includesTitle": "Semua fitur Pro, ditambah",
            "cta": "Beli Team",
            "subscriptionOnly": "Team dijual bulanan atau tahunan."
        },
        "enterprise": {
            "name": "Enterprise",
            "description": "Masuk dengan akun perusahaan, kebijakan wajib, log audit, MDM, purchase order.",
            "cta": "Hubungi kami"
        }
    },
    "units": {
        "starter": {
            "monthly": "per bulan",
            "yearly": "per tahun",
            "lifetime": "sekali bayar"
        },
        "team": {
            "monthly": "per seat, per bulan",
            "yearly": "per seat, per bulan, ditagih tahunan"
        }
    },
    "seats": {
        "label": "Seat",
        "noun": "seat",
        "minimum": "Minimum {min} seat.",
        "bounds": "Minimum {min} seat, maksimum {max}.",
        "clamped": {
            "min": "Diubah ke minimum, {min} seat.",
            "max": "Diubah ke maksimum, {max} seat."
        },
        "total": {
            "monthly": {
                "one": "{count} seat: {total} per bulan",
                "other": "{count} seat: {total} per bulan"
            },
            "yearly": {
                "one": "{count} seat: {total} per tahun",
                "other": "{count} seat: {total} per tahun"
            }
        }
    },
    "prioritySupport": {
        "name": "Dukungan prioritas",
        "detail": {
            "one": "Email pelanggan Team dijawab terlebih dahulu, dalam satu hari kerja.",
            "other": "Email pelanggan Team dijawab terlebih dahulu, dalam {count} hari kerja."
        }
    },
    "allFeatures": "Semua fitur berbayar",
    "refund": {
        "one": "Pengembalian dana dalam {count} hari setelah pembelian atau perpanjangan (<link>kebijakan pengembalian dana</link>).",
        "other": "Pengembalian dana dalam {count} hari setelah pembelian atau perpanjangan (<link>kebijakan pengembalian dana</link>)."
    },
    "finePrint": "Harga dalam dolar AS; {merchant} menambahkan pajak penjualan atau PPN saat checkout.",
    "comparePlans": "Bandingkan paket",
    "section": {
        "title": "Harga",
        "lead": "TablePro bersumber terbuka dan gratis digunakan. Paket berbayar menambahkan fitur opsional ke aplikasi Mac."
    },
    "matrix": {
        "caption": "Fitur setiap paket di aplikasi Mac",
        "feature": "Fitur",
        "groups": {
            "starter": "Di Pro dan Team",
            "team": "Di Team",
            "all": "Di semua paket"
        },
        "macs": "Mac",
        "macsFree": "Tanpa lisensi",
        "macsStarter": {
            "one": "{count}",
            "other": "Hingga {count}"
        },
        "macsTeam": {
            "one": "{count} per seat",
            "other": "Hingga {count} per seat"
        },
        "everythingElse": "Semua fitur lain dalam aplikasi",
        "everythingElseDetail": "Semua mesin database yang didukung, editor SQL, asisten AI, server MCP, dan Safe Mode",
        "iphoneNote": "Aplikasi iPhone dan iPad tidak memiliki fitur berbayar. iCloud Sync gratis di sana; untuk sinkronisasi dengan Mac, Mac memerlukan Pro atau Team."
    },
    "regional": {
        "note": "Harga untuk negara Anda ({country}): diskon {percent}%, diterapkan saat checkout.",
        "listPrice": "Harga normal {price}"
    },
    "discount": {
        "summary": "Punya kode diskon?",
        "label": "Kode diskon",
        "apply": "Terapkan kode",
        "checking": "Memeriksa kode…",
        "percent": "Kode diterima: diskon {amount}%, diterapkan saat checkout.",
        "fixed": "Kode diterima: potongan {amount}, diterapkan saat checkout.",
        "accepted": "Kode diterima, diterapkan saat checkout.",
        "invalid": "Kode ini tidak valid atau telah kedaluwarsa."
    },
    "checkout": {
        "failed": "Tidak dapat membuka checkout. Coba lagi.",
        "planUnavailable": "Paket ini sedang tidak dijual. Pilih siklus penagihan lain atau coba lagi nanti.",
        "seats": "Pilih antara {min} dan {max} seat, lalu coba lagi.",
        "seatsFewer": "Pilih lebih sedikit seat, lalu coba lagi."
    },
    "offers": {
        "name": "{plan}, {cycle}",
        "seat": "seat"
    }
} satisfies Messages['pricing'];
