---
title: Kebijakan privasi
description: Data yang dikumpulkan aplikasi, situs web, dan portal akun TablePro, tujuan pengirimannya, lama penyimpanannya, serta cara mengubah atau menghapusnya.
updatedAt: "2026-10-09"
---

Kebijakan ini mencakup TablePro untuk Mac, TablePro untuk iPhone dan iPad, situs web di tablepro.app, dokumentasi di docs.tablepro.app, dan portal akun di tablepro.app/account. Kebijakan ini menjelaskan data yang benar-benar dikirim dan disimpan oleh masing-masing layanan saat ini. Kedua aplikasi bersifat sumber terbuka dengan lisensi AGPLv3, sehingga Anda dapat membaca kode yang mengirim data di bawah ini dalam [repositori TablePro]({github}).

## Ringkasan {#summary}

- Aplikasi Mac mengirim laporan penggunaan ke TablePro sekali sehari. Fitur ini aktif secara bawaan dan dapat Anda nonaktifkan. Aplikasi iPhone dan iPad hanya mengirim laporan jika Anda mengaktifkannya.
- Jika Anda mengaktifkan lisensi, aplikasi Mac memeriksanya melalui server kami setiap {revalidateDays} hari. Pemeriksaan ini mencakup nama Mac Anda.
- Kueri yang Anda jalankan, hasilnya, dan kata sandi Anda tidak dikirim ke TablePro. Pengecualiannya adalah data yang Anda pilih untuk dipublikasikan ke Team Library: pengaturan koneksi (tanpa kata sandi) dan kueri tersimpan.
- Permintaan AI dikirim langsung dari aplikasi Mac ke penyedia AI yang Anda konfigurasikan, bukan kepada kami.
- Server kami menyimpan alamat IP setiap laporan penggunaan dan pemeriksaan lisensi, serta mencari negara untuk setiap laporan penggunaan. Kami belum menetapkan batas waktu penyimpanan data ini.
- Situs web menghitung tampilan halaman menggunakan Cloudflare Web Analytics, yang tidak memasang cookie. Situs juga memuat Google Analytics, yang hanya memasang cookie jika Anda mengizinkannya. Setiap halaman juga memuat layanan chat langsung kami, Crisp, yang memasang cookie sendiri.
- Pembelian dijual oleh {merchant}, merchant of record kami.

## Penanggung jawab {#controller}

{publisherName}, pengembang perorangan di {publisherCity}, {publisherCountry}, menerbitkan aplikasi TablePro dan situs web ini, serta bertanggung jawab atas data pribadi yang dijelaskan di sini (pengendali data). Untuk pertanyaan tentang kebijakan ini atau data Anda, kirim email ke [{email}](mailto:{email}).

## TablePro untuk Mac {#mac-app}

### Laporan penggunaan {#mac-usage-report}

Aplikasi Mac mengirim laporan penggunaan ke `api.tablepro.app` sekitar sepuluh detik setelah dimulai, lalu sekali sehari selama aplikasi berjalan. **Fitur ini aktif secara bawaan, dan aplikasi tidak meminta izin sebelum mengirim laporan pertama.** Untuk menonaktifkannya, buka **Settings > General > Privacy** dan hapus centang **Share anonymous usage data**.

Laporan berisi:

- ID mesin: hash SHA-256 dari UUID perangkat keras Mac Anda (UUID itu sendiri tidak pernah dikirim);
- platform, versi aplikasi, versi macOS, arsitektur prosesor, dan bahasa aplikasi;
- nama jenis database dari koneksi yang sedang terbuka (misalnya "PostgreSQL") dan jumlah koneksi yang terbuka;
- status aktivasi lisensi;
- tanggal dan waktu percobaan koneksi pertama serta koneksi pertama yang berhasil;
- pengaturan pembaruan Anda (cara pembaruan dipasang dan frekuensi pemeriksaan aplikasi). Server kami membuang data ini saat laporan diterima.

Laporan tidak pernah berisi nama host, nama pengguna, kata sandi, kueri, atau baris data.

Server kami menyimpan setiap laporan beserta alamat IP asalnya. Server kemudian mencari negara untuk alamat IP tersebut dengan mengirimkannya ke ip-api.com, dan jika gagal, ke ipinfo.io lalu geoplugin.net. Pencarian ini dilakukan melalui HTTP tanpa enkripsi. Negara disimpan bersama laporan. Karena pemeriksaan lisensi di bawah mengirim ID mesin yang sama, laporan dari Mac dengan lisensi aktif dapat dihubungkan ke lisensi tersebut.

### Pemeriksaan lisensi {#mac-license}

Aplikasi Mac hanya menghubungi server lisensi kami setelah Anda memasukkan kunci lisensi. Aplikasi melakukannya saat lisensi diaktifkan, saat dimulai jika sudah berlalu {revalidateDays} hari atau lebih sejak pemeriksaan terakhir, dan setiap {revalidateDays} hari setelahnya. Setiap pemeriksaan mengirim:

- kunci lisensi Anda;
- ID mesin yang dijelaskan di atas;
- nama Mac Anda, sebagaimana diatur di macOS (sering kali memuat nama Anda sendiri);
- versi aplikasi dan versi macOS.

Penonaktifan Mac hanya mengirim kunci lisensi dan ID mesin.

Server kami mencatat setiap permintaan lisensi beserta alamat IP dan isinya, serta menyimpan ID mesin dan nama setiap Mac yang diaktifkan bersama lisensi Anda. Portal akun menampilkan Mac tersebut berdasarkan nama. Jika server kami tidak dapat dihubungi, fitur berbayar tetap berfungsi selama {graceDays} hari setelah pemeriksaan terakhir yang berhasil.

### Team Library {#library}

Team Library merupakan bagian dari lisensi Team. Saat Anda memilih **Share > Publish to Team Library…** pada koneksi atau **Publish Saved Queries to Team…** di sidebar Favorites, aplikasi Mac mengunggah data yang Anda publikasikan ke server kami:

- pengaturan koneksi: host, port, nama database, nama pengguna, pengaturan SSH dan SSL, opsi driver, perintah awal, pengaturan Tunnel Command, tingkat Safe Mode, dan pengaturan AI, tetapi tidak pernah kata sandi;
- kueri tersimpan: nama, teks SQL, kata kunci, dan foldernya.

Mac dengan lisensi Team yang sama mengunduh pustaka saat dimulai, paling sering sekali seminggu, dan Mac yang memublikasikannya mengunduh ulang segera setelahnya. Publikasi baru menggantikan publikasi Anda sebelumnya. Menghapus anggota dari tim menghapus semua data yang dipublikasikan anggota tersebut. Jika lisensi kedaluwarsa atau ditangguhkan, pustaka tetap berada di server kami sampai Anda meminta penghapusannya.

Team Catalog, fitur Team lainnya, menulis file koneksi tanpa kata sandi ke folder bersama yang Anda pilih. Data ini tidak melewati server kami.

### Pembaruan dan plugin {#mac-updates}

- **Pemeriksaan pembaruan.** Sekali sehari aplikasi Mac mengunduh feed pembaruan dari GitHub (`raw.githubusercontent.com`). Permintaan tidak mengirim informasi tentang Mac selain data yang dibawa setiap permintaan web: alamat IP Anda dan user agent dengan versi aplikasi. Untuk menonaktifkannya, buka **Settings > General > Software Update** dan hapus centang **Automatically check for updates**. Pembaruan itu sendiri diunduh dari GitHub.
- **Katalog plugin.** Saat aplikasi dimulai dan saat Anda membuka pengaturan plugin, aplikasi mengunduh daftar driver dan tema yang tersedia dari GitHub. Tidak ada pengaturan untuk menonaktifkannya. Driver dan tema yang Anda pasang diunduh dari GitHub, dan peramban plugin membaca jumlah unduhan dari API GitHub.

GitHub menerima alamat IP Anda bersama permintaan ini. Pernyataan privasi GitHub berlaku untuk permintaan tersebut.

### Layanan yang Anda pilih untuk digunakan {#mac-third-parties}

Aplikasi Mac hanya mengirim data ke layanan berikut saat Anda mengonfigurasikannya, secara langsung dan tidak pernah melalui TablePro:

- **Database, server SSH, dan proxy Anda**, yang menerima apa pun yang dikirim oleh koneksi Anda.
- **Penyedia AI.** Saat Anda menambahkan penyedia dan menggunakan asisten AI atau saran inline, permintaan dikirim ke penyedia tersebut atau ke model yang berjalan di Mac Anda. Secara bawaan, permintaan mencakup jenis dan nama database, definisi tabel dan kolom dari skema, serta kueri saat ini. Baris hasil hanya dikirim jika Anda mengaktifkan opsi tersebut. Ketentuan penyedia berlaku. Menambahkan GitHub Copilot akan mengunduh server bahasanya dari npm, dan pengaturan "Send telemetry to GitHub" aktif pada awalnya.
- **Layanan masuk**: Microsoft Entra ID, Google, Amazon Web Services, dan Cloudflare Access, saat koneksi menggunakannya.
- **Apple Maps**, yang menyediakan ubin peta saat Anda menampilkan hasil pada peta.
- **DuckDB**, yang menyediakan ekstensi DuckDB saat kueri pertama kali menggunakannya.
- **Klien MCP.** Server MCP nonaktif secara bawaan. Server dimulai saat Anda mengaktifkannya atau saat klien MCP yang Anda konfigurasikan menjalankan bridge TablePro atau memasangkannya, dan hanya mendengarkan pada Mac Anda (127.0.0.1). Klien AI yang Anda hubungkan, seperti Claude atau Cursor, menerima hasil yang dimintanya dan mengirimkannya ke layanannya sendiri berdasarkan ketentuannya sendiri.
- **Server MCP yang Anda tambahkan.** Sesi AI mengirim panggilan alat yang Anda setujui, beserta argumennya, ke server tersebut.

### Data yang tetap berada di Mac Anda {#mac-local}

Kata sandi disimpan di Rantai Kunci macOS. Daftar koneksi, riwayat kueri, Query Insights, snapshot Data Rewind, pengaturan, dan tab terbuka disimpan di Mac Anda. Aplikasi merujuk kunci SSH di lokasi aslinya pada disk dan tidak menyalinnya. Aplikasi tidak berisi pelapor kerusakan atau pustaka analitik pihak ketiga.

## TablePro untuk iPhone dan iPad {#ios-app}

**Tidak ada data yang dikirim ke TablePro kecuali Anda mengaktifkan Share Usage Data**, saat aplikasi pertama kali dimulai atau kemudian di **Settings > Privacy**. Jika diaktifkan, aplikasi mengirim laporan sekali sehari ke server yang sama dengan aplikasi Mac, dan server kami menyimpan serta mencari alamat IP-nya dengan cara yang sama. Laporan berisi hash SHA-256 dari pengenal yang diberikan Apple kepada aplikasi di perangkat Anda, platform, versi aplikasi dan iOS, arsitektur prosesor, bahasa aplikasi, nama jenis database dari koneksi yang sedang terbuka, jumlah koneksi yang terbuka, serta tanggal dan waktu percobaan koneksi pertama, koneksi pertama yang berhasil, dan kueri pertama. Laporan tidak berisi pengaturan pembaruan dan selalu menyatakan tidak ada lisensi yang diaktifkan karena aplikasi tidak memiliki keduanya.

Aplikasi tidak melakukan pemeriksaan lisensi, pemeriksaan pembaruan, atau permintaan plugin. Selain laporan opsional tersebut, aplikasi hanya terhubung ke database dan server SSH Anda, iCloud Apple jika Anda mengaktifkan iCloud Sync, serta Microsoft saat koneksi SQL Server masuk menggunakan Microsoft Entra ID.

Di perangkat, kata sandi dan kunci SSH yang ditempel disimpan di Rantai Kunci, dan sertifikat tidak pernah disinkronkan. Riwayat kueri tetap berada di perangkat. Koneksi Anda ditambahkan ke indeks Spotlight di perangkat agar dapat dicari. Saat kueri berjalan, Live Activity menampilkan SQL pada Layar Terkunci dan Dynamic Island yang diperluas, kecuali Anda mengaktifkan **Settings > Live Activities > Hide Query**.

Jika Anda membagikan analitik kepada pengembang aplikasi melalui pengaturan iPhone atau iPad, Apple dapat mengirim laporan kerusakan dan statistik penggunaan kepada kami melalui App Store Connect. Aplikasi tidak memiliki pelapor kerusakan atau pustaka analitik pihak ketiga sendiri.

## iCloud Sync dan Handoff {#icloud}

iCloud Sync nonaktif sampai Anda mengaktifkannya, baik di Mac maupun iPhone dan iPad. Saat aktif, data dikirim ke database pribadi dalam akun iCloud Anda sendiri (kontainer `iCloud.com.TablePro`). TablePro tidak dapat membacanya.

- Di Mac, Anda memilih data yang disinkronkan: koneksi, grup dan tag, pengaturan, profil SSH, profil kredensial (nama dan nama penggunanya, tanpa kata sandi), tabel dan database favorit, kueri tersimpan (termasuk teks SQL), serta folder tabel. Data koneksi mencakup host, port, nama pengguna, nama database, pengaturan SSH dan SSL, perintah awal, skrip sebelum koneksi, dan aturan AI. Riwayat kueri, snapshot Data Rewind, dan sumber kata sandi tidak pernah disinkronkan.
- iPhone dan iPad menyinkronkan koneksi, grup, dan tag.
- Kata sandi hanya disinkronkan jika Anda juga mengaktifkan **Passwords** di Sync Categories pada Mac atau **Sync Passwords** pada iPhone dan iPad, menggunakan iCloud Keychain. Di Mac, opsi ini juga menyinkronkan rahasia lain yang disimpan TablePro di Rantai Kunci, seperti kunci penyedia AI dan kunci lisensi.

Di Mac, iCloud Sync merupakan bagian dari lisensi Starter atau Team. Di iPhone dan iPad, fitur ini gratis.

Handoff mengirim ID koneksi yang terbuka dan nama tabel yang terbuka antarperangkat Anda sendiri melalui Apple. Jika tidak ada tabel terbuka, Handoff mengirim nama koneksi, atau host-nya jika koneksi tidak memiliki nama. Handoff tidak mengirim pengaturan atau kredensial.

## Situs web {#website}

**Hosting.** Situs web dan portal akun berjalan di server kami, di belakang Cloudflare. Seperti server web lainnya, keduanya menerima alamat IP Anda, user agent peramban, dan alamat setiap halaman yang Anda minta.

**Cloudflare Web Analytics.** Cloudflare menambahkan skrip Web Analytics ke halaman situs web dan portal akun. Peramban Anda memuatnya dari `static.cloudflareinsights.com`, dan skrip melaporkan setiap tampilan halaman ke Cloudflare: halaman, situs yang menautkannya, waktu pemuatan halaman, serta peramban, sistem operasi, dan jenis perangkat Anda. Cloudflare menambahkan negara asal koneksi Anda. Skrip tidak memasang cookie atau menyimpan apa pun di peramban, dan Cloudflare menyatakan tidak menggunakan alamat IP atau detail peramban untuk mengidentifikasi Anda melalui fingerprinting. Cloudflare menampilkan jumlah keseluruhan kepada kami, seperti tampilan per halaman atau per negara, bukan catatan setiap pengunjung. Dasar hukum: kepentingan yang sah.

**Google Analytics.** Situs memuat Google Analytics pada setiap halaman dalam Consent Mode. Sampai Anda memilih **Izinkan** pada pertanyaan cookie, Google Analytics tidak memasang cookie dan hanya mengirim sinyal tanpa cookie ke Google untuk setiap halaman, tanpa pengenal yang disimpan di perangkat Anda. Jika diizinkan, Google Analytics memasang cookie `_ga` dan `_ga_<ID>` serta mengukur kunjungan Anda, seperti halaman yang dilihat, klik unduhan, dan awal proses pembelian. Penyimpanan iklan, personalisasi iklan, dan data pengguna iklan selalu ditolak. Google menyatakan bahwa Google Analytics 4 tidak mencatat atau menyimpan alamat IP. Properti Google Analytics kami menggunakan masa retensi bawaan Google: Google menghapus data tingkat pengguna dan tingkat peristiwa yang dikumpulkannya setelah 2 bulan. Laporan standar Google, yang berisi jumlah keseluruhan alih-alih pengenal, tidak terpengaruh. Dasar hukum: persetujuan Anda untuk cookie.

**Chat langsung.** Setiap halaman situs web dan portal akun menampilkan tombol chat dari penyedia kami, Crisp. Setelah halaman selesai dimuat, peramban memuat skrip Crisp dari `client.crisp.chat`, dan Crisp memasang cookie yang dijelaskan di [Cookie dan penyimpanan peramban](#cookies). Crisp menerima alamat IP Anda, detail peramban, alamat halaman yang Anda lihat, dan pesan yang Anda tulis, serta menyimpan alamat IP jika Anda memulai percakapan. Kami hanya memberi tahu Crisp bahasa halaman, tanpa informasi lain tentang Anda. Crisp berbasis di Prancis.

**Skrip pembayaran.** Saat Anda mengarahkan penunjuk atau berpindah dengan tombol Tab ke tombol Beli, peramban memuat skrip pembayaran {merchant} dari jsDelivr (`cdn.jsdelivr.net`), yang menerima alamat IP dan detail peramban Anda. Halaman pembayaran itu sendiri baru dibuka dari {merchant} saat Anda mengeklik.

**Atribusi pembelian.** Saat Anda tiba di situs, peramban menyimpan catatan kunjungan pertama bernama `tablepro:attribution` dalam penyimpanan lokal selama 90 hari: sumber kunjungan (tag `ref` atau `utm_*` pada tautan yang Anda ikuti, atau situs yang menautkan ke sini), halaman tujuan, dan waktunya. Jika Anda memulai pembelian, catatan dikirim bersama permintaan pembayaran. Server kami membuangnya: catatan tidak divalidasi, dibaca, atau disimpan, dan tidak diteruskan ke {merchant}.

**Dokumentasi.** Dokumentasi di docs.tablepro.app dihosting oleh Mintlify, yang menerima alamat IP dan detail peramban Anda pada setiap halaman, dan halaman memuat fonnya dari Google Fonts. Dokumentasi mengajukan pertanyaan cookie sendiri, karena tidak dapat membaca jawaban Anda di situs ini. Sampai Anda memilih **Allow** di sana, dokumentasi tidak memasang cookie dan tidak menyimpan ID pengunjung. Jika diizinkan, Google Analytics memasang cookie `_ga` dan `_ga_<ID>` serta mengukur kunjungan Anda ke dokumentasi, dan Mintlify menyimpan ID pengunjung acak, `mintlify_anonymous_id`, di penyimpanan lokal untuk menghitungnya. **Cookie settings** di footer dokumentasi mengubah jawaban Anda, dan menolak menghapus keduanya. Dasar hukum: persetujuan Anda.

Membaca situs tidak menetapkan cookie miliknya sendiri. Permintaan pendaftaran newsletter, checkout, dan kode diskon dari situs publik tidak menyertakan kredensial: permintaan tersebut tidak mengirim cookie portal akun maupun menerima cookie dari respons. Membuka halaman portal akun adalah tindakan terpisah yang menetapkan cookie portal di bawah ini. Semua yang disimpan situs di browser tercantum dalam [Cookie dan penyimpanan browser](#cookies).

## Pembelian {#purchases}

Lisensi dijual oleh {merchant} (Polar Software, Inc.), merchant of record dan penjual kembali kami. Anda membeli dari {merchant} berdasarkan ketentuan pembeli dan kebijakan privasinya sendiri. {merchant} menerima pembayaran, menghitung dan membayar pajak penjualan atau PPN, mengirim kuitansi dan faktur, serta menangani masalah dan sengketa pembayaran. Layanan ini mengumpulkan nama, alamat email, alamat penagihan, dan detail pembayaran Anda. Kami tidak pernah melihat detail lengkap kartu Anda.

Dari {merchant}, kami menerima alamat email, nama dan alamat penagihan sesuai yang Anda masukkan, produk yang dibeli, jumlah pembayaran, ID pesanan dan langganan, serta perubahan berikutnya seperti perpanjangan, pembatalan, dan pengembalian dana. Kami memberi tahu {merchant} bahasa halaman tempat Anda membeli agar email kami dikirim dalam bahasa tersebut. Faktur, kuitansi, metode pembayaran, dan langganan Anda tersedia di [portal pelanggan {merchant}]({portal}), yang Anda akses menggunakan alamat email pembelian. Pengembalian dana dijelaskan di [kebijakan pengembalian dana](/id/refund-policy), dan hak penggunaan lisensi dijelaskan di [ketentuan layanan](/id/terms).

## Portal akun {#account}

[Portal akun](/account?locale=id) di tablepro.app/account diperuntukkan bagi pembeli lisensi. Anda masuk melalui tautan yang kami kirim ke alamat email tersebut; tautan hanya dapat digunakan sekali dan kedaluwarsa setelah 15 menit. Portal menampilkan lisensi Anda, Mac yang diaktifkan dengannya (berdasarkan nama), serta untuk lisensi Team, anggota, undangan, seat, dan Team Library.

Kami menyimpan alamat email bersama lisensi dan pesanan Anda, serta bahasa yang Anda gunakan dengan kami agar email dikirim dalam bahasa tersebut. Saat Anda mengundang seseorang ke tim, kami menyimpan alamat email dan perannya, lalu mengirim kode undangan melalui email.

## Buletin {#newsletter}

Jika Anda berlangganan catatan rilis, kami menyimpan alamat email dan bahasa halaman tempat Anda berlangganan. Kami terlebih dahulu mengirim tautan konfirmasi, dan setiap buletin memiliki tautan berhenti berlangganan. Setelah Anda berhenti berlangganan, kami tidak mengirim buletin lagi; untuk sekaligus menghapus alamat email, hubungi kami melalui email.

## Cookie dan penyimpanan peramban {#cookies}

Membaca situs publik serta permintaan newsletter, checkout, dan kode diskonnya tidak menetapkan cookie miliknya sendiri. Membuka halaman portal akun menetapkan dua cookie portal yang benar-benar diperlukan di bawah ini. Cloudflare Web Analytics tidak menetapkan cookie atau menyimpan apa pun di browser. Cookie Google Analytics hanya ditetapkan dengan izin Anda. Crisp menetapkan cookie pada setiap halaman setelah chat dimuat. Tidak ada yang digunakan untuk iklan atau dijual.

- **`_ga` dan `_ga_<ID>`** (cookie Google Analytics, hingga 2 tahun, hanya jika Anda mengizinkan analitik): pengenal acak untuk peramban dan status kunjungan saat ini. Menolak atau mengubah jawaban kemudian akan menghapusnya. Dasar hukum: persetujuan.
- **`tablepro:analytics-consent`** (penyimpanan lokal, sampai Anda menghapusnya): jawaban Anda atas pertanyaan analitik, agar tidak ditanyakan pada setiap halaman. Situs web dan portal akun berbagi data ini. Dasar hukum: benar-benar diperlukan untuk menghormati pilihan Anda.
- **`tablepro:attribution`** (penyimpanan lokal, 90 hari): catatan kunjungan pertama yang dijelaskan di [Situs web](#website). Catatan ini tidak berisi pengenal Anda dan hanya dikirim bersama permintaan pembayaran, lalu dibuang oleh server kami. Dasar hukum: kepentingan yang sah.
- **`theme`** dan **`tablepro:banner-dismissed`** (penyimpanan lokal, sampai Anda menghapusnya): pilihan tampilan terang, gelap, atau sistem, serta banner yang Anda tutup dan batas waktunya: 30 hari, atau satu tahun jika Anda menyatakan sudah memiliki lisensi atau membelinya. Dasar hukum: kepentingan yang sah.
- **`mintlify_anonymous_id`** (penyimpanan lokal di docs.tablepro.app, dipasang oleh Mintlify, hanya jika Anda mengizinkan Google Analytics di sana): ID pengunjung yang dijelaskan di [Situs web](#website). Menolak akan menghapusnya. Dokumentasi menyimpan jawaban `tablepro:analytics-consent` miliknya sendiri. Dasar hukum: persetujuan.
- **Cookie yang diawali `crisp-client/`** (Crisp, misalnya `crisp-client/session/…`; 6 bulan, diperbarui saat Anda kembali; dipasang pada setiap halaman setelah chat dimuat): mempertahankan chat dan percakapan lintas halaman dan kunjungan. Dasar hukum: kepentingan yang sah, untuk menawarkan dukungan di setiap halaman.
- **`tablepro-session` dan `XSRF-TOKEN`** (cookie portal akun, 2 jam): menjaga Anda tetap masuk dan melindungi formulir portal dari pemalsuan permintaan lintas situs (CSRF). Membuka halaman portal lainnya, seperti konfirmasi pembelian dan halaman newsletter, juga menetapkannya. Permintaan newsletter, checkout, dan kode diskon dari situs publik tidak menyertakan kredensial dan tidak menyimpan cookie ini. Dasar hukum: benar-benar diperlukan.

Anda dapat mengubah atau menarik jawaban analitik kapan saja melalui **Pengaturan cookie** di footer setiap halaman, atau di sini:

<cookie-settings></cookie-settings>

## Dasar hukum {#lawful-basis}

Bagi pembaca di Wilayah Ekonomi Eropa dan Britania Raya, dasar hukum berdasarkan GDPR dan UK GDPR adalah:

- **Kontrak** (Art. 6(1)(b)): penjualan dan penyediaan lisensi, pemeriksaan lisensi, portal akun, dan Team Library.
- **Kepentingan yang sah** (Art. 6(1)(f)): laporan penggunaan aplikasi Mac dan pencarian negaranya, log permintaan lisensi, keamanan dan pencegahan penyalahgunaan, log server web, Cloudflare Web Analytics, catatan atribusi pembelian, dan chat langsung di setiap halaman.
- **Persetujuan** (Art. 6(1)(a)): cookie Google Analytics, laporan penggunaan aplikasi iPhone dan iPad, buletin, serta percakapan yang Anda mulai melalui chat langsung.
- **Kewajiban hukum** (Art. 6(1)(c)): catatan pajak dan akuntansi, serta jawaban atas permintaan yang sah menurut hukum.

## Penerima data {#sharing}

Kami hanya membagikan data pribadi kepada layanan yang diperlukan untuk menjalankan TablePro:

- **{merchant}**, merchant of record untuk pembelian.
- **Penyedia pengiriman email**, untuk tautan masuk, kuitansi dari kami, undangan tim, dan buletin.
- **Penyedia hosting kami dan Cloudflare**, untuk situs web, portal akun, dan server yang berkomunikasi dengan aplikasi. Cloudflare juga menghitung tampilan halaman menggunakan Cloudflare Web Analytics.
- **Google**, untuk Google Analytics di situs web, dokumentasi, dan portal akun.
- **Crisp**, untuk chat langsung pada setiap halaman situs web dan portal akun.
- **jsDelivr**, yang menyajikan skrip pembayaran {merchant} ke peramban saat Anda mengarahkan penunjuk ke tombol Beli.
- **Mintlify**, yang menghosting dokumentasi di docs.tablepro.app.
- **ip-api.com, ipinfo.io, dan geoplugin.net**, yang menerima alamat IP dari laporan penggunaan untuk pencarian negara.
- **GitHub**, yang menghosting feed pembaruan, katalog plugin, dan unduhan.

Kami tidak menjual data pribadi atau membagikannya kepada pengiklan.

## Transfer internasional {#transfers}

Layanan di atas beroperasi di beberapa negara, sehingga data Anda dapat diproses di luar negara Anda. {merchant}, Google, GitHub, Cloudflare, dan Mintlify memproses data di Amerika Serikat; Google melakukannya berdasarkan EU-US Data Privacy Framework dan Standard Contractual Clauses. Jika diwajibkan hukum, transfer dari EEA dan Britania Raya menggunakan Standard Contractual Clauses atau mekanisme lain yang disetujui.

## Lama penyimpanan data {#retention}

- **Laporan penggunaan**, beserta alamat IP dan negaranya: belum ditetapkan batas waktu, dan tidak ada penghapusan otomatis.
- **Data lisensi**: ID dan nama Mac yang diaktifkan serta log permintaan lisensi beserta alamat IP disimpan selama lisensi masih ada. Tidak ada penghapusan otomatis.
- **Pesanan**: disimpan untuk pajak dan akuntansi.
- **Team Library**: sampai dipublikasikan ulang, anggota yang memublikasikannya dihapus, atau Anda meminta penghapusannya. Data tetap disimpan setelah lisensi berakhir.
- **Tautan masuk akun**: kedaluwarsa setelah 15 menit lalu dihapus. Sesi portal berlangsung selama 2 jam.
- **Buletin**: sampai Anda berhenti berlangganan atau kami menghapus alamat email atas permintaan Anda.
- **Google Analytics**: data tingkat pengguna dan tingkat peristiwa selama 2 bulan, masa retensi bawaan Google yang digunakan properti kami. Cookie bertahan hingga 2 tahun atau dihapus saat Anda menolak.
- **Cloudflare Web Analytics**: Cloudflare menampilkan jumlah tampilan halaman selama enam bulan terakhir kepada kami. Tidak ada data yang disimpan di peramban.
- **Chat langsung dan email dukungan**: disimpan oleh Crisp dan di kotak email kami sampai dihapus. Mintalah kepada kami untuk menghapus percakapan dan email Anda.
- **Log server web**: disimpan untuk keamanan dan pemecahan masalah. Kami belum menetapkan masa penyimpanan tetap.

## Hak Anda {#rights}

Bergantung pada tempat tinggal Anda, Anda dapat meminta kami untuk:

- memberikan salinan data pribadi Anda yang kami simpan (akses);
- memperbaikinya (koreksi);
- menghapusnya (penghapusan), kecuali data yang wajib disimpan menurut hukum;
- membatasi cara penggunaannya (pembatasan);
- mengirimkannya kepada Anda dalam format terstruktur yang dapat dibaca mesin (portabilitas);
- berhenti menggunakannya atas dasar kepentingan yang sah (keberatan).

Anda dapat menarik persetujuan kapan saja dan mengajukan keluhan kepada otoritas perlindungan data Anda. Untuk menggunakan hak ini, kirim email ke [{email}](mailto:{email}). Kami menjawab dalam 30 hari. Penghapusan data dilakukan secara manual, jadi sebutkan alamat email, kunci lisensi, atau perangkat yang terkait. Data yang disimpan {merchant}, Google, Crisp, atau GitHub juga diatur oleh kebijakan masing-masing.

**Penduduk California.** California Consumer Privacy Act memberi Anda hak untuk mengetahui informasi pribadi yang kami kumpulkan, meminta penghapusannya, menolak penjualannya, serta tidak diperlakukan berbeda karena menggunakan hak tersebut. Kami tidak menjual informasi pribadi.

## Anak-anak {#children}

TablePro tidak ditujukan kepada anak di bawah 16 tahun, dan kami tidak dengan sengaja mengumpulkan data pribadi mereka. Jika Anda yakin seorang anak telah memberikan data pribadi kepada kami, hubungi kami dan kami akan menghapusnya.

## Keamanan {#security}

Lalu lintas antara aplikasi, situs web, portal akun, dan server kami menggunakan HTTPS. Pencarian negara yang dijelaskan di [Laporan penggunaan](#mac-usage-report) adalah pengecualian: pencarian dilakukan melalui HTTP tanpa enkripsi. Tautan masuk akun hanya disimpan sebagai hash, dan akses ke sistem kami dibatasi kepada orang yang menjalankan TablePro. Tidak ada sistem yang sepenuhnya aman. Untuk melaporkan kerentanan, lihat [halaman Keamanan](/id/security#report) atau kirim email ke [{email}](mailto:{email}).

## Perubahan kebijakan ini {#changes}

Saat kebijakan ini berubah, kami memperbaruinya di sini dengan tanggal "Terakhir diperbarui" yang baru dan, jika diwajibkan hukum, memberi tahu Anda secara langsung.

## Kontak {#contact}

Untuk pertanyaan tentang privasi atau kebijakan ini, kirim email ke [{email}](mailto:{email}).
