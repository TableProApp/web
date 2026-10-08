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
        "yearlyByTier": "Diperpanjang setiap tahun hingga Anda membatalkannya. Starter {starterPercent}% lebih murah daripada dua belas pembayaran bulanan, Team {teamPercent}% lebih murah.",
        "lifetime": "Dibayar sekali, tanpa tanggal kedaluwarsa."
    },
    "tiers": {
        "free": {
            "name": "Gratis",
            "description": "Aplikasi Mac tanpa fitur berbayar, serta aplikasi iPhone dan iPad.",
            "activation": "Tidak perlu mendaftar untuk menggunakan aplikasi.",
            "includesTitle": "Termasuk",
            "includes": [
                "Koneksi ke semua mesin database yang didukung",
                "Editor SQL dan grid data",
                "Asisten AI dan server MCP",
                "Mode Aman",
                "Aplikasi iPhone dan iPad"
            ]
        },
        "starter": {
            "name": "Starter",
            "description": "Menambahkan fitur seperti {examples} ke aplikasi Mac.",
            "activation": {
                "one": "Satu lisensi untuk satu orang, pada {count} Mac.",
                "other": "Satu lisensi untuk satu orang, pada hingga {count} Mac."
            },
            "includesTitle": "Semua fitur Gratis, ditambah",
            "cta": "Beli Starter"
        },
        "team": {
            "name": "Team",
            "description": "Menambahkan koneksi dan kueri bersama tim Anda, selain fitur Starter.",
            "activation": "Setiap seat adalah satu Mac yang diaktifkan.",
            "includesTitle": "Semua fitur Starter, ditambah",
            "cta": "Beli Team"
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
            "yearly": "per seat, per tahun",
            "lifetime": "per seat, sekali bayar"
        }
    },
    "seats": {
        "label": "Seat",
        "noun": "seat",
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
            },
            "lifetime": {
                "one": "{count} seat: {total}, sekali bayar",
                "other": "{count} seat: {total}, sekali bayar"
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
        "one": "Semua paket berbayar dapat dikembalikan dananya dalam {count} hari setelah pembelian. Lihat <link>kebijakan pengembalian dana</link>.",
        "other": "Semua paket berbayar dapat dikembalikan dananya dalam {count} hari setelah pembelian. Lihat <link>kebijakan pengembalian dana</link>."
    },
    "finePrint": "Harga dalam dolar AS. {merchant} adalah merchant of record: menerima pembayaran dan menghitung pajak penjualan atau PPN saat checkout.",
    "finePrintCurrency": "Harga dalam dolar AS.",
    "comparePlans": "Bandingkan paket",
    "section": {
        "title": "Harga",
        "lead": "TablePro bersumber terbuka dan gratis digunakan. Paket berbayar menambahkan fitur opsional ke aplikasi Mac."
    },
    "matrix": {
        "caption": "Fitur setiap paket di aplikasi Mac",
        "feature": "Fitur",
        "macs": "Mac",
        "macsFree": "Tanpa lisensi",
        "macsStarter": {
            "one": "{count}",
            "other": "Hingga {count}"
        },
        "macsTeam": "Satu per seat",
        "everythingElse": "Semua fitur lain dalam aplikasi",
        "everythingElseDetail": "Semua mesin database yang didukung, editor SQL, asisten AI, server MCP, dan Mode Aman",
        "iphoneNote": "Aplikasi iPhone dan iPad tidak memiliki fitur berbayar. Sinkronisasi iCloud gratis di sana; untuk sinkronisasi dengan Mac, Mac memerlukan Starter atau Team."
    },
    "discount": {
        "atCheckout": "Punya kode diskon? Masukkan saat checkout.",
        "summary": "Punya kode diskon?",
        "label": "Kode diskon",
        "apply": "Terapkan kode",
        "checking": "Memeriksa kode…",
        "percent": "Kode diterima: diskon {amount}%, diterapkan saat checkout.",
        "fixed": "Kode diterima: potongan {amount}, diterapkan saat checkout.",
        "invalid": "Kode diskon tidak valid atau telah kedaluwarsa."
    },
    "checkout": {
        "failed": "Tidak dapat memulai checkout. Coba lagi."
    },
    "offers": {
        "name": "{plan}, {cycle}",
        "seat": "seat"
    }
} satisfies Messages['pricing'];
