import type { Messages } from '../../types.ts';

export default {
    "email": {
        "label": "Alamat email",
        "placeholder": "anda@example.com"
    },
    "subscribe": "Berlangganan",
    "invalidEmail": "Masukkan alamat email yang valid.",
    "tooMany": "Terlalu banyak percobaan. Tunggu satu menit lalu coba lagi.",
    "failed": "Terjadi kesalahan. Coba lagi.",
    "network": "Tidak dapat menghubungi server. Periksa koneksi Anda lalu coba lagi.",
    "subscribed": "Periksa kotak masuk Anda untuk tautan konfirmasi."
} satisfies Messages['forms'];
