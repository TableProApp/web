---
title: Kebijakan privasi
description: Data yang dikumpulkan TablePro, tujuan, penerima, masa penyimpanan, pilihan dan hak Anda.
updatedAt: "2026-11-05"
---

Kebijakan ini mencakup TablePro untuk Mac, Linux, iPhone dan iPad; tablepro.app; docs.tablepro.app; serta layanan akun, pembelian, dukungan dan newsletter. [Inventaris teknis](https://docs.tablepro.app/security/privacy) memuat kolom, tujuan jaringan dan kontrol. Kode ada di [repositori publik]({github}).

## Ringkasan {#summary}

Kueri dan hasil biasa berjalan antara perangkat dan database Anda. Data penggunaan tidak memuat SQL, baris atau kredensial. Konten yang Anda terbitkan ke Team Library, kirim ke dukungan, atau bagikan ke AI dan alat eksternal diterima oleh pihak tersebut.

Data penggunaan Mac dan Linux aktif secara bawaan, dengan sakelar untuk mematikannya. Aplikasi iPhone/iPad yang dirilis hanya mengirim setelah persetujuan. Analitik langsung dapat dikaitkan dengan akun dan pembelian. Mematikannya tidak menghentikan permintaan akun atau analitik server.

Situs mengukur kunjungan dan memuat Crisp di setiap halaman. Cookie Google Analytics memerlukan pilihan Anda. Newsletter mengukur pembukaan dan klik. Menghapus akun menyisakan beberapa catatan, termasuk di PostHog dan Crisp. Baca [penyimpanan](#retention) dan [hak](#rights). [Pengendali](#controller) menangani permintaan meski tanpa akun.

<span id="contact"></span>

## Penanggung jawab {#controller}

{publisherName}, pengembang perorangan di {publisherCity}, {publisherCountry}, adalah pengendali data pribadi yang dijelaskan di sini. Hubungi [{email}](mailto:{email}). Kami tidak memiliki petugas perlindungan data. Untuk tim, kami mengendalikan catatan akun, undangan dan layanan. Konten Team Library diproses menurut instruksi tim; tim menentukan isi dan akses.

<span id="lawful-basis"></span>

## Data dan tujuan {#data-use}

Untuk EEA dan Inggris, dasar hukum disebut per tujuan: kontrak (Pasal 6(1)(b)), kepentingan sah (6(1)(f)), persetujuan (6(1)(a)) atau kewajiban hukum (6(1)(c)). Kami tidak membuat keputusan otomatis dengan dampak hukum atau dampak penting serupa.

<span id="mac-account"></span>

### Akun dan perangkat {#account}

Penggunaan lokal gratis tidak memerlukan akun. Layanan akun memerlukan email. Kami menyimpan nama, bahasa, metode masuk, lisensi, pesanan, perangkat, peran dan seat tim. Pendaftaran perangkat Mac/Linux mengirim ID mesin, nama, platform dan versi aplikasi/sistem. Nama perangkat bisa memuat nama Anda. Ini terpisah dari data penggunaan. Tujuan dan dasarnya ialah menyediakan akun dan paket berdasarkan kontrak.

Masuk menggunakan tautan/kode email, passkey, Apple, GitHub atau Google. Catatan passkey memuat kunci publik, nama, status sinkronisasi dan tanggal penggunaan. Penyedia identitas memberikan ID dan email terverifikasi; Apple juga dapat memberikan nama. Token Apple dienkripsi dan dicabut saat dilepas atau akun dihapus. Perubahan akun dicatat dengan IP dan user agent. Kepentingan sahnya ialah mengamankan akun dan menyelidiki penyalahgunaan.

[Portal akun]({account}) menyediakan perubahan profil/metode masuk, pengelolaan perangkat, ekspor JSON dan penghapusan akun. Anda tidak bisa menghapus akun saat memiliki tim dengan anggota lain. Penghapusan mengakhiri langganan tanpa pengembalian dana. [Penyimpanan](#retention) menjelaskan sisanya.

### Pembelian {#purchases}

{merchant} (Polar Software, Inc.) adalah merchant of record dan penjual kembali. Mereka mengumpulkan nama, email, alamat tagihan dan pembayaran menurut ketentuannya. Mereka menangani pembayaran, pajak, kuitansi dan sengketa. Kami tidak pernah menerima detail kartu lengkap.

Kami mengirim pembelian, bahasa, sumber kunjungan dan IP untuk checkout, pajak dan mata uang. Kami menerima detail pembeli/tagihan, jumlah, ID pesanan/langganan, perpanjangan, pembatalan dan pengembalian dana. Pesanan menyimpan email, negara, jumlah dan atribusi. Pembelian tamu membuat akun belum terverifikasi untuk email itu bila belum ada. Alasan/komentar pembatalan diteruskan ke {merchant} dan disimpan pada langganan. Pemrosesan memenuhi kontrak; catatan pajak/akuntansi memenuhi kewajiban hukum. Tanpa data wajib, checkout tidak selesai. Kelola tagihan di [portal {merchant}]({portal}); baca [ketentuan](/id/terms) dan [pengembalian dana](/id/refund-policy).

### Tim dan konten bersama {#library}

Pengundang memberikan email, peran dan seat. Pemilik/admin melihat nama/email, undangan dan perubahan tim termasuk alamat undangan, tetapi bukan IP atau browser audit. Anggota melihat tim, paket, jumlah seat dan peran sendiri. Catatan digunakan untuk layanan tim berdasarkan kontrak.

Di Mac, menerbitkan ke Team Library mengirim pengaturan koneksi dan kueri tersimpan ke server untuk anggota berizin. Isinya host, port, database, nama pengguna, SSH/SSL, perintah awal, Tunnel Command dan AI. Kueri memuat nama, SQL, kata kunci dan folder. Kolom kata sandi dikecualikan; rahasia dalam SQL atau teks bebas tidak dihapus. Pustaka menunjukkan pengubah terakhir. Keluar dari tim tidak menghapus kontennya. Lihat [waktu penghapusan](#retention). Team Catalog menulis file ke folder bersama pilihan Anda.

### Analitik penggunaan dan layanan {#analytics}

Kepentingan sah kami ialah memahami penggunaan, memperbaiki masalah dan mengukur pembelian. Mac/Linux mengirim data di [Aplikasi](#apps). Server mengirim peristiwa masuk, pembelian, perangkat dan tim ke PostHog dengan ID akun, tanpa nama/email. ID menghubungkan aplikasi dan layanan. Sakelar menghentikan peristiwa aplikasi, bukan permintaan wajib atau peristiwa server. Gunakan [hak](#rights) untuk menolak atau meminta penghapusan.

### Newsletter dan email {#newsletter}

Amazon SES mengirim kode, undangan, pemberitahuan dan newsletter. Email layanan memenuhi layanan yang diminta. Pendaftaran newsletter baru memerlukan konfirmasi dan persetujuan. Kami menyimpan alamat, bahasa, tanggal pendaftaran/konfirmasi, IP, user agent, halaman dan versi persetujuan.

Setiap newsletter mengukur pembukaan/klik setiap penerima melalui gambar dan `links.news.tablepro.app`. Amazon SES menerima waktu, tautan, IP dan user agent lalu meneruskannya ke server untuk menghitung. Memblokir gambar menghentikan pengukuran pembukaan, bukan klik. Tautan berhenti berlangganan dan email tidak dilacak. Tidak ada sakelar pengukuran tersendiri. Berhenti lewat newsletter atau kontrol satu klik aplikasi email; tidak ada email konfirmasi setelahnya. Mendaftar lagi perlu konfirmasi. Pantulan permanen dan laporan spam menghentikan pengiriman. Minta penghapusan alamat lewat [kontak](#controller).

Daftar lama memindahkan semua alamat yang belum berhenti, sudah dikonfirmasi atau belum, termasuk pembeli, pemegang lisensi dan pendaftar beta. Alamat berhenti tetap begitu; pantulan/keluhan masuk daftar penekanan. Lihat [penyimpanan](#retention).

### Dukungan {#support}

Pesan, lampiran dan diagnostik diterima kami dan layanan pilihan Anda. Isinya dapat mencakup data atau rahasia yang Anda sertakan. Crisp menerima IP, browser dan halaman saat chat dimuat di situs/portal. IP disimpan bila Anda memulai percakapan. Kami memberikan bahasa dan, di portal setelah masuk, email/ID akun. Chat pada setiap halaman melayani kepentingan sah untuk dukungan. Percakapan yang Anda mulai berdasarkan persetujuan.

## Aplikasi Anda {#apps}

| Aplikasi dan versi | Data penggunaan | Kontrol |
| --- | --- | --- |
| Mac 0.86.0, mulai 0.86.0-beta.1 | Langsung ke PostHog; aktif | Settings > General > Privacy |
| Linux mulai 0.1.0-beta.1 | Langsung ke PostHog; aktif | Preferences > General > Privacy |
| iPhone/iPad yang dirilis | Laporan lewat server; mati sampai disetujui | Settings > Privacy |

<span id="mac-local"></span>

### Data di perangkat {#local-data}

Daftar koneksi, riwayat, log lokal dan tab tetap di perangkat kecuali Anda memilih berbagi. Lalu lintas database menuju server pilihan. Kata sandi memakai penyimpanan kredensial platform. Mac merujuk kunci SSH di lokasi disk. Analitik tidak memuat host, pengguna, SQL, baris atau kredensial. [Integrasi](#integrations), Team Library dan dukungan memiliki pengecualian yang dijelaskan.

### Mac {#mac-app}

Analitik langsung dan perilaku akun ini dimulai pada 0.86.0, termasuk 0.86.0-beta.1. Masuk mendaftarkan Mac dan mengambil paket. Token akun tetap di Rantai Kunci Mac itu, tidak pernah disinkronkan ke iCloud Rantai Kunci. Kunci lisensi yang ada ditukar menjadi sesi masuk lalu dihapus lokal.

#### Data penggunaan Mac {#mac-usage-report}

Aktif secara bawaan, tanpa bertanya sebelum peristiwa pertama. Matikan **Share usage data** di **Settings > General > Privacy**. Memulai saat mati tidak menjalankan pustaka PostHog. Tidak ada laporan crash otomatis; perekam crash PostHog dinonaktifkan.

Peristiwa mencakup penggunaan harian dengan jenis/jumlah koneksi terbuka, percobaan, keberhasilan dan kueri pertama menurut jenis database, pembatasan fitur berbayar beserta alasan, klik upgrade, metode masuk/keluar dan permintaan pembelian lisensi beserta jawaban. PostHog menambah konteks perangkat, layar, jaringan, sesi, aplikasi dan sistem. IP diterima untuk memperkirakan lokasi. Sebelum masuk, ID instalasi acak tanpa profil orang. Sesudah masuk, ID akun dengan profil versi, arsitektur, bahasa dan lokasi. Keluar membuat ID baru. Lihat [kolom dan tujuan](https://docs.tablepro.app/security/privacy#usage-data).

#### Pembaruan dan plugin {#mac-updates}

Feed pembaruan/katalog berasal dari GitHub melalui updates.tablepro.app. Unduhan dan jumlahnya juga mencapai GitHub. Permintaan memuat IP/user agent. Matikan **Automatically check for updates** di **Settings > General > Software Update** untuk menghentikan pemeriksaan otomatis. Katalog tidak memiliki sakelar. [Detail teknis](https://docs.tablepro.app/security/privacy#update-checks) mencakup feed lama.

#### Mac versi lama {#mac-license}

Sebelum 0.86.0, sakelar aktif yang sama mengontrol laporan ke server. Isinya ID mesin hash, detail sistem/aplikasi, jenis/jumlah koneksi, status lisensi dan tanggal percobaan/keberhasilan pertama. Pengaturan pembaruan yang dikirim dibuang. Server kini meneruskan ke PostHog dengan negara Cloudflare, tanpa IP/kunci atau profil orang. ID dapat menghubungkan perangkat akun. Tidak ada riwayat heartbeat khusus sekarang, tetapi job, log, backup dan arsip lama bisa menyimpan data. Lihat [penyimpanan](#retention).

Versi lama menghubungi lisensi hanya setelah kunci dimasukkan. Pemeriksaan mengirim kunci, ID, nama Mac dan versi. Perangkat milik akun; aktivasi/deaktivasi diaudit dengan IP/user agent. [Inventaris](https://docs.tablepro.app/security/privacy#older-mac-reports) memuat kolom dan jadwal.

### iPhone dan iPad {#ios-app}

Aplikasi yang dirilis tidak melapor sebelum **Share Usage Data** diaktifkan saat awal atau di **Settings > Privacy**. Dasarnya persetujuan. Laporan harian lewat server ke PostHog tanpa IP, dengan negara Cloudflare dan tanpa profil. Isinya ID Apple hash, platform, versi, arsitektur, bahasa, jenis/jumlah koneksi dan tanggal percobaan, keberhasilan serta kueri pertama. Selalu melaporkan tanpa lisensi; tidak ada pengaturan pembaruan. Tidak memeriksa akun, lisensi, pembaruan atau plugin.

Database/SSH, iCloud opsional dan masuk Microsoft Entra untuk SQL Server mengirim ke layanan itu. Kata sandi/kunci ditempel tetap di Rantai Kunci; sertifikat/riwayat lokal. Koneksi masuk indeks Spotlight lokal. Live Activity dapat menampilkan SQL di layar terkunci kecuali Hide Query aktif. Secara terpisah, Share With App Developers Apple bisa memberi kami crash/statistik lewat App Store Connect. Aplikasi tidak punya pelapor crash atau pustaka analitik pihak ketiga. Lihat [iOS](https://docs.tablepro.app/ios#privacy).

### Linux {#linux-app}

Mulai 0.1.0-beta.1, masuk mendaftarkan perangkat menurut [akun](#account). Rahasia memakai keyring desktop. Pembaruan pengelola paket mengikuti distributor pilihan. Tidak ada laporan crash otomatis.

#### Data penggunaan Linux {#linux-usage-data}

Aktif secara bawaan mulai 0.1.0-beta.1. Matikan Share usage data di Preferences > General > Privacy. Langsung ke PostHog EU: penggunaan harian dengan jenis/jumlah koneksi, percobaan/keberhasilan dan kueri pertama menurut jenis, masuk/keluar, klik upgrade, tampilan pertanyaan lisensi/jawaban Buy. Memuat ID instalasi/akun, versi, arsitektur, bahasa dan metadata SDK. PostHog menerima IP dan memperkirakan lokasi. Sebelum masuk ID acak tanpa profil; sesudahnya profil menghubungkan penggunaan/pembelian. Keluar mengatur ulang ID. Tanpa hostname, SQL, baris atau kredensial. Pendaftaran perangkat memuat hostname secara terpisah.

Mematikan menghentikan kiriman baru. Permintaan berjalan bisa selesai. Tidak menghapus peristiwa lama atau menghentikan akun/analitik server. Lihat [penyimpanan](#retention), [hak](#rights) dan [inventaris](https://docs.tablepro.app/security/privacy#linux-usage-data).

<span id="mac-third-parties"></span>

## Layanan pilihan {#integrations}

Penyedia database, SSH dan proxy menerima lalu lintas pilihan langsung. Layanan masuk menerima autentikasi bila diatur. Apple Maps menyediakan peta; DuckDB ekstensi kueri. Helper koneksi/AI yang diunduh menghubungi penyedianya. Ketentuan mereka berlaku.

### iCloud dan Handoff {#icloud}

iCloud Sync opsional menyimpan koneksi, grup, tag, pengaturan, kueri dan profil SSH di CloudKit pribadi. Di Mac, sinkronisasi juga mencakup favorit dan folder tabel/database, serta nama profil kredensial, nama pengguna dan mode kata sandi, bukan kata sandi profil. Apple menghosting; kami tidak bisa membacanya. Sinkronisasi kata sandi terpisah, mati secara bawaan, memakai iCloud Rantai Kunci terenkripsi end-to-end. Di Mac termasuk rahasia lain yang ditulis di sana, misalnya kunci AI/lisensi lama. Token akun tidak pernah sinkron. Mac perlu Pro atau Team; iOS gratis. Handoff meneruskan ID koneksi dan nama tabel, atau nama/host bila tanpa tabel, antarperangkat Apple tanpa kredensial. Lihat [kontrol](https://docs.tablepro.app/features/icloud-sync).

### AI dan alat eksternal {#ai-tools}

AI mengirim langsung ke penyedia atau model lokal pilihan. Prompt, skema, SQL dan percakapan dapat dikirim. Melampirkan baris grid mati secara bawaan. Hasil alat kueri AI berizin juga masuk percakapan dan penyedia, terlepas dari sakelar lampiran. GitHub Copilot mengunduh helper dari npm dan memulai dengan Send telemetry to GitHub aktif.

MCP mati secara bawaan dan tidak dapat berjalan saat mati, termasuk lewat bridge/pemasangan. Saat aktif, klien terautentikasi meminta data sesuai izin Anda. Klien AI bisa mengirim hasil ke layanannya. Server MCP eksternal menerima argumen disetujui. Lihat [kontrol AI/MCP](https://docs.tablepro.app/security/privacy#ai-providers).

## Situs dan penyimpanan browser {#website}

Server dan Cloudflare menerima IP, user agent dan halaman. Cloudflare Web Analytics menghitung kunjungan, perujuk, waktu muat, kategori browser/sistem/perangkat dan negara tanpa penyimpanan browser atau fingerprint. Kepentingan sah ialah memahami dan merawat situs.

Google Analytics memuat dalam Consent Mode. Sebelum Allow, ia mengirim sinyal tanpa cookie/ID tersimpan. Persetujuan mengaktifkan cookie dan pengukuran kunjungan, unduhan serta checkout. Penyimpanan iklan, personalisasi dan data iklan selalu ditolak. Google menyatakan GA4 tidak menyimpan IP.

Crisp memuat di semua situs/portal seperti [dukungan](#support). Menunjuk atau Tab ke Buy memuat skrip {merchant} dari jsDelivr yang menerima IP/browser; klik membuka checkout. Memulai formulir memuat Turnstile untuk mencegah penyalahgunaan, kepentingan sah. Negara/zona waktu membantu saran bahasa/diskon wilayah berdasarkan kepentingan sah; permintaan tanpa cookie dan jawaban tidak disimpan di halaman.

Kunjungan pertama membuat `tablepro:attribution` selama 90 hari: tag/perujuk, halaman masuk dan tanggal. Saat checkout, server memberikan sumber ke {merchant} sebagai metadata, menyimpannya pada pesanan dan mengirim ke PostHog dengan checkout/pembayaran. Halaman/tanggal tidak disimpan. Dasarnya kepentingan sah mengukur sumber pembelian. Permintaan publik newsletter, checkout dan diskon tanpa kredensial serta tidak memasang cookie portal. Portal tanpa skrip analitik, tetapi server mengirim peristiwa.

### Situs dokumentasi {#docs}

Mintlify menghosting docs.tablepro.app. Permintaan halaman, Google Fonts dan jumlah bintang GitHub memberi IP/browser kepada penyedia. Docs meminta persetujuan terpisah. Sebelum Allow, tidak menyimpan cookie analitik/ID. Allow mengaktifkan Google Analytics dan ID Mintlify. Cookie settings di footer docs mencabut pilihan dan menghapusnya. Pilihan situs tidak berlaku pada origin tersebut.

### Cookie dan penyimpanan {#cookies}

Cloudflare Web Analytics tidak menyimpan apa pun di browser. Halaman publik tidak memasang cookie sendiri. Masa berikut terpisah dari penyimpanan penyedia. Penyimpanan wajib menjaga masuk/pilihan; tujuan persetujuan dan kepentingan sah dijelaskan di sini.

| Nama/layanan | Tujuan dan pemicu | Masa dan kontrol |
| --- | --- | --- |
| `_ga`, `_ga_<ID>` | Google Analytics setelah persetujuan | Hingga 2 tahun; menolak menghapus |
| `tablepro:analytics-consent` | Pilihan wajib, terpisah situs/docs | Sampai dihapus |
| `tablepro:attribution` | Sumber awal bersama checkout; kepentingan sah | 90 hari |
| `theme`, `tablepro:language`, `tablepro:campaign-closed`, `tablepro:linux-install` | Tampilan, bahasa dipilih/ditutup, promo ditutup, metode instal Linux dipilih; kepentingan sah | Sampai dihapus; tema portal terpisah |
| `mintlify_anonymous_id` | ID docs setelah persetujuan di sana | Sampai dihapus/ditolak |
| Cookie `crisp-client/` | Kelanjutan chat setelah dimuat tiap halaman; kepentingan sah | 6 bulan, diperbarui saat kembali |
| `__Host-tp_session` | Masuk portal yang diperlukan | 30 hari masuk; paling lama 10 menit saat proses; keluar menghapus |
| `locale`, `context`, `sign-in-return-to` | Bahasa, tampilan Personal/tim, halaman kembali; kepentingan sah | Dua pertama sampai dihapus; kembali 15 menit |

Ubah persetujuan dengan Cookie settings di footer atau di sini:

<cookie-settings></cookie-settings>

## Penerima {#sharing}

| Penerima | Data dan tujuan |
| --- | --- |
| [OVH]({ovhPrivacy}) | Server dan catatan layanan |
| [Cloudflare]({cloudflarePrivacy}) | DNS/proxy, R2/backup, Turnstile, Cloudflare Web Analytics |
| [Amazon Web Services]({awsPrivacy}) | Email Amazon SES, pengiriman dan interaksi; tautan CloudFront, peristiwa SNS/SQS |
| [PostHog EU]({posthogPrivacy}) | Analitik aplikasi/server; ID tanpa nama/email; permintaan langsung memuat IP |
| [{merchant}]({merchantPrivacy}) | Merchant of record independen; checkout, tagihan dan pembelian |
| [Crisp]({crispPrivacy}) | Chat, browser/halaman, identitas akun masuk |
| [Google]({googlePrivacy}) | Analitik situs/docs dan font; masuk opsional |
| [Mintlify]({mintlifyPrivacy}) | Hosting docs dan pengukuran disetujui |
| [GitHub]({githubPrivacy}) | Unduhan, pembaruan, plugin, bintang, issue publik dan masuk opsional |
| [Apple]({applePrivacy}) | Masuk opsional; layanan/diagnostik pada aplikasi/integrasi |
| [jsDelivr]({jsdelivrPrivacy}) | Skrip checkout dengan IP/browser |

Anggota menerima konten/detail sesuai peran. Integrasi menerima data yang Anda arahkan. Kami tidak menjual data atau membagikannya untuk iklan. Pengungkapan lain hanya jika hukum mewajibkan. Kebijakan penyedia juga berlaku.

## Lokasi pemrosesan {#transfers}

OVH dan Amazon SES di Singapura (`ap-southeast-1` untuk SES). PostHog di UE; Crisp berbasis di Prancis. {publisherName} beroperasi dari Vietnam. Penyedia AS termasuk {merchant}, Google, GitHub, Cloudflare, Amazon Web Services dan Mintlify memproses di AS. Penyimpanan/backup dapat melibatkan negara lain. Perlindungan EEA/Inggris memakai klausul kontrak standar atau mekanisme disetujui milik penyedia; Google juga memakai EU-US Data Privacy Framework. Minta informasi melalui [kontak](#controller).

## Masa penyimpanan {#retention}

Kami belum menetapkan batas bila tabel menyatakan demikian. Menghapus akun tidak menghapus PostHog atau Crisp. Email melalui [kontak](#controller) untuk penghapusan di penyedia tersebut atas permintaan.

| Catatan | Penyimpanan dan penghapusan |
| --- | --- |
| Analitik PostHog | Belum ada batas. Mematikan menyisakan peristiwa lama. Minta penghapusan. |
| Job dan log server | Job menyimpan laporan saat kirim/ulang. Log untuk keamanan/diagnosis. Belum ada batas keseluruhan; tidak menjanjikan nol salinan. |
| Perangkat | Termasuk yang dilepas, sampai akun dihapus |
| Akun dan audit | Akun, cara masuk, perangkat, lisensi dan keanggotaan dihapus. Audit tetap tanpa batas; kolom email dan IP/user agent pelaku dihapus, alamat dalam teks bebas bisa tetap. |
| Pesanan dan notifikasi penyedia | Pesanan pajak/akuntansi tanpa batas. Tautan akun/email dihapus. Peristiwa {merchant}, Amazon SES dan Apple tetap; data pribadi pembelian dan penerima/interaksi email dibersihkan untuk akun yang dihapus. |
| Team Library | Item dihapus mempertahankan versi terakhir untuk sync. Penghapusan tim biasa menghapus pustaka setelah 30 hari, dapat dipulihkan sebelumnya. Menghapus akun pemilik tunggal menghapus keduanya segera. Lisensi berakhir tidak menghapus. |
| Autentikasi | Link/kode kedaluwarsa 15 menit, dihapus 7 hari kemudian. Sesi 30 hari. Token kedaluwarsa 90 hari setelah dipakai, dihapus 30 hari kemudian. Job email menyimpan teks biasa sampai pembersihan: sehari setelah kirim atau 7 hari setelah menyerah. |
| Newsletter | Alamat baru belum dikonfirmasi dihapus setelah 30 hari. Terkonfirmasi/migrasi sampai diminta atau akun dengan alamat itu dihapus. Berhenti tetap menyimpan alamat sebagai berhenti. |
| Penekanan kirim | Alamat pantulan/keluhan dan tanggal pertama/terakhir tetap setelah akun/langganan dihapus untuk mencegah kiriman. Tanpa batas. |
| Google Analytics | Data pengguna/peristiwa: 2 bulan; laporan total standar terpisah |
| Cloudflare Web Analytics | Total enam bulan terakhir tersedia |
| Dukungan | Crisp dan kotak surat sampai dihapus, termasuk atas permintaan. Tanpa batas. |
| Backup dan arsip migrasi | Tanpa batas. Penghapusan akun tidak menghapus salinan. Arsip database lama lengkap memuat nama/email, lisensi, pesanan, tim, nama perangkat, pelanggan, beta, email, laporan penggunaan dan log lisensi dengan IP. |

## Pilihan dan hak {#rights}

Gunakan sakelar, Cookie settings situs/docs dan berhenti newsletter. Penarikan persetujuan berlaku ke depan, tidak membatalkan pemrosesan sebelumnya. Sakelar tidak menghapus data lama atau menghentikan analitik server. Di [Settings portal]({account}) ekspor/hapus akun; ini tidak mencakup setiap catatan tersimpan.

Menurut tempat tinggal, minta akses, koreksi, penghapusan, pembatasan, portabilitas atau penolakan kepentingan sah. Tanpa akun pun: email [kontak](#controller). Kami dapat meminta detail untuk menemukan catatan, seperti ID instalasi. Jangan pernah mengirim kunci lisensi teks biasa lewat email. Kami menjawab dalam satu bulan. Anda dapat mengadu ke otoritas perlindungan data. Kewajiban hukum dapat membatasi penghapusan.

### Hak regional {#regional-rights}

**Penduduk California.** California Consumer Privacy Act memberi Anda hak untuk mengetahui informasi pribadi yang kami kumpulkan, meminta penghapusannya, menolak penjualannya, serta tidak diperlakukan berbeda karena menggunakan hak tersebut. Kami tidak menjual informasi pribadi.

## Anak-anak {#children}

TablePro tidak ditujukan bagi anak di bawah 16 tahun dan kami tidak sengaja mengumpulkan datanya. Bila anak memberi kami data, hubungi kami untuk menghapusnya.

## Keamanan {#security}

Layanan memakai HTTPS. Akun tidak memiliki kata sandi. Kredensial masuk/token API tim disimpan sebagai hash, kecuali job email sementara pada [penyimpanan](#retention). Akses terbatas untuk {publisherName} dan [penerima](#sharing). Tidak ada sistem sempurna aman. Laporkan celah lewat [halaman keamanan](/id/security#report).

## Perubahan {#changes}

Halaman menunjukkan tanggal pembaruan. Versi lama tetap di [riwayat repositori web publik]({webGithub}/commits/main/resources/data/legal/en/privacy.md). Kami memperbarui sebelum tujuan baru, memberi tahu langsung bila hukum mewajibkan dan meminta persetujuan baru bila perlu.
