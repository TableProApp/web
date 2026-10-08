import type { Messages } from '../../types.ts';

export default {
    "requirement": {
        "named": "{systems} {version} {releaseName} atau lebih baru",
        "unnamed": "{systems} {version} atau lebih baru"
    },
    "requires": "Memerlukan {requirement}",
    "systemsJoiner": " dan ",
    "architectures": {
        "arm64": "Apple silicon",
        "x86_64": "Intel",
        "joiner": " atau "
    },
    "app": {
        "mac": "aplikasi Mac",
        "ios": "aplikasi iPhone dan iPad"
    },
    "availability": {
        "summary": "Tersedia untuk {deviceList}."
    },
    "free": "Gratis, tanpa pembelian dalam aplikasi",
    "status": {
        "released": "Tersedia",
        "prototype": "Hanya prototipe. Tidak ada yang dapat diinstal dan tidak ada tanggal rilis.",
        "none": "Tidak tersedia dan tidak ada tanggal rilis."
    },
    "names": {
        "linux": "Linux",
        "windows": "Windows"
    },
    "release": {
        "badge": "{version}",
        "badgeLabel": "Ditambahkan di TablePro {version} untuk Mac. Homebrew mungkin masih menginstal versi sebelumnya."
    }
} satisfies Messages['platforms'];
