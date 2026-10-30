---
title: Kebijakan privasi
description: Data yang dikumpulkan aplikasi, situs web, dan portal akun TablePro, tujuan pengirimannya, lama penyimpanannya, serta cara mengubah atau menghapusnya.
updatedAt: "2026-10-30"
---

Kebijakan ini mencakup TablePro untuk Mac, TablePro untuk iPhone dan iPad, situs web di tablepro.app, dokumentasi di docs.tablepro.app, dan portal akun di account.tablepro.app. Kebijakan ini menjelaskan data yang benar-benar dikirim dan disimpan oleh masing-masing layanan saat ini. Kedua aplikasi bersifat sumber terbuka dengan lisensi AGPLv3, sehingga Anda dapat membaca kode yang mengirim data di bawah ini dalam [repositori TablePro]({github}).

## Ringkasan {#summary}

- Aplikasi Mac mengirim data penggunaan. Fitur ini aktif secara bawaan dan dapat Anda nonaktifkan. Aplikasi iPhone dan iPad hanya mengirim laporan penggunaan jika Anda mengaktifkannya.
- Jika Anda masuk ke akun TablePro atau mengaktifkan kunci lisensi, aplikasi Mac mendaftarkan Mac Anda di server kami, termasuk namanya, dan memeriksa paket Anda secara berkala.
- Kueri yang Anda jalankan, hasilnya, dan kata sandi Anda tidak dikirim ke TablePro. Pengecualiannya adalah data yang Anda pilih untuk dipublikasikan ke Team Library: pengaturan koneksi (tanpa kata sandi) dan kueri tersimpan.
- Permintaan AI dikirim langsung dari aplikasi Mac ke penyedia AI yang Anda konfigurasikan, bukan kepada kami.
- Mulai versi yang menghadirkan akun TablePro, aplikasi Mac mengirim data penggunaannya langsung ke PostHog, layanan analitik produk kami di UE, yang kemudian menerima alamat IP Mac Anda dan memperkirakan lokasi kasar darinya. Versi sebelumnya serta aplikasi iPhone dan iPad mengirim laporan penggunaan ke server kami, yang meneruskannya ke PostHog tanpa alamat IP-nya. Akun Anda menyimpan log perubahan yang dibuat padanya, seperti proses masuk dan perangkat baru, beserta alamat IP dan browser dari permintaan yang membuat setiap perubahan.
- Situs web menghitung tampilan halaman menggunakan Cloudflare Web Analytics, yang tidak memasang cookie. Situs juga memuat Google Analytics, yang hanya memasang cookie jika Anda mengizinkannya. Setiap halaman juga memuat layanan chat langsung kami, Crisp, yang memasang cookie sendiri.
- Portal akun di account.tablepro.app tidak memuat skrip analitik apa pun. Portal menetapkan satu cookie agar Anda tetap masuk, dan di Pengaturannya Anda dapat mengunduh data akun atau menghapus akun.
- Pembelian dijual oleh {merchant}, merchant of record kami.

## Penanggung jawab {#controller}

{publisherName}, pengembang perorangan di {publisherCity}, {publisherCountry}, menerbitkan aplikasi TablePro dan situs web ini, serta bertanggung jawab atas data pribadi yang dijelaskan di sini (pengendali data). Untuk pertanyaan tentang kebijakan ini atau data Anda, kirim email ke [{email}](mailto:{email}).

## TablePro untuk Mac {#mac-app}

### Data penggunaan {#mac-usage-report}

Mulai versi yang menghadirkan akun TablePro, aplikasi Mac mengirim data penggunaan langsung ke PostHog, layanan analitik produk kami, di `eu.i.posthog.com` di UE. **Fitur ini aktif secara bawaan, dan aplikasi tidak meminta izin sebelum mengirim peristiwa pertama.** Untuk menonaktifkannya, buka **Settings > General > Privacy** dan hapus centang **Share usage data**. Selama pengaturan itu nonaktif, aplikasi tidak mengirim apa pun ke PostHog, dan jika aplikasi dimulai saat pengaturan itu nonaktif, pustaka PostHog sama sekali tidak dijalankan.

Aplikasi mengirim peristiwa:

- sekali sehari selama aplikasi berjalan, beserta nama jenis database dari koneksi yang sedang terbuka (misalnya "PostgreSQL") dan jumlah koneksi yang terbuka;
- untuk percobaan koneksi pertama, koneksi pertama yang berhasil, dan kueri pertama Anda, masing-masing beserta jenis database-nya;
- saat aplikasi menunjukkan bahwa fitur berbayar tidak tersedia, sekali per fitur setiap kali aplikasi dijalankan, beserta fitur dan alasannya, misalnya Anda belum masuk;
- saat Anda mengklik untuk upgrade, beserta tempat di aplikasi yang Anda klik;
- saat Anda masuk, beserta caranya (di aplikasi, dengan kunci lisensi, atau dengan menukar kunci yang sudah ada di Mac Anda), dan saat Anda keluar.

Pustaka PostHog menambahkan ke setiap peristiwa model Mac Anda, ukuran layar, zona waktu dan bahasa, apakah Mac terhubung lewat Wi-Fi, versi, build, dan bundle ID aplikasi, versi macOS, versi pustaka, serta ID sesi acak. PostHog menerima alamat IP Mac Anda pada setiap permintaan dan memperkirakan lokasi kasar darinya, seperti negara dan kota. Selama pengaturan itu aktif, pustaka juga mengambil pengaturan dan feature flag-nya dari PostHog (`/config` dari `eu-assets.i.posthog.com` dan `/flags` dari `eu.i.posthog.com`).

Sebelum Anda masuk, peristiwa membawa ID acak yang dibuat pustaka di Mac Anda, dan PostHog tidak membuat profil orang untuk ID itu. Setelah Anda masuk, peristiwa membawa ID akun Anda, dan profil akun itu di PostHog menyimpan versi aplikasi dan macOS, arsitektur prosesor, bahasa aplikasi, dan lokasi kasar yang diperkirakan PostHog dari alamat IP. Ini mengaitkan instalasi Anda dengan proses masuk dan pembelian Anda. Keluar dari akun memulai ID acak baru. Data penggunaan aplikasi tidak lagi memuat ID mesin, status aktivasi lisensi, atau pengaturan pembaruan Anda.

Versi sebelum akun TablePro mengirim laporan penggunaan ke `api.tablepro.app` sebagai gantinya, dengan pengaturan yang sama, sekitar sepuluh detik setelah dimulai, lalu sekali sehari selama aplikasi berjalan. Laporan berisi:

- ID mesin: hash SHA-256 dari UUID perangkat keras Mac Anda (UUID itu sendiri tidak pernah dikirim);
- platform, versi aplikasi, versi macOS, arsitektur prosesor, dan bahasa aplikasi;
- nama jenis database dari koneksi yang sedang terbuka (misalnya "PostgreSQL") dan jumlah koneksi yang terbuka;
- status aktivasi lisensi;
- tanggal dan waktu percobaan koneksi pertama serta koneksi pertama yang berhasil;
- pengaturan pembaruan Anda (cara pembaruan dipasang dan frekuensi pemeriksaan aplikasi). Server kami membuang data ini saat laporan diterima.

Baik peristiwa maupun laporan tidak pernah berisi nama host, nama pengguna, kata sandi, kueri, atau baris data.

Server kami tidak menyimpan laporan maupun alamat IP asalnya. Server meneruskan laporan ke PostHog sebagai peristiwa tentang ID mesin, beserta negara yang diberikan Cloudflare untuk koneksi Anda, tanpa kunci lisensi atau alamat IP Anda, dan PostHog tidak membuat profil orang darinya. Karena akun Anda mencatat perangkatnya dengan ID mesin yang sama, laporan dari Mac tempat Anda masuk atau mengaktifkan lisensi dapat dihubungkan ke akun Anda.

### Pemeriksaan lisensi {#mac-license}

Versi sebelum akun TablePro hanya menghubungi server lisensi kami setelah Anda memasukkan kunci lisensi. Versi tersebut melakukannya saat lisensi diaktifkan, saat dimulai jika sudah berlalu {revalidateDays} hari atau lebih sejak pemeriksaan terakhir, dan setiap {revalidateDays} hari setelahnya. Setiap pemeriksaan mengirim:

- kunci lisensi Anda;
- ID mesin yang dijelaskan di [Data penggunaan](#mac-usage-report);
- nama Mac Anda, sebagaimana diatur di macOS (sering kali memuat nama Anda sendiri);
- versi aplikasi dan versi macOS.

Penonaktifan Mac hanya mengirim kunci lisensi dan ID mesin.

Server kami menyimpan setiap Mac yang diaktifkan sebagai perangkat dari akun pemilik lisensi: ID mesin dan namanya, versi aplikasi dan macOS, serta kapan terakhir kali menghubungi server. Aktivasi dan penonaktifan Mac dicatat dalam log audit akun tersebut beserta alamat IP dan user agent permintaannya; pemeriksaan rutin tidak dicatat. Portal akun menampilkan perangkat Anda berdasarkan nama. Jika server kami tidak dapat dihubungi, fitur berbayar tetap berfungsi selama {graceDays} hari setelah pemeriksaan terakhir yang berhasil.

### Akun TablePro {#mac-account}

Mulai versi yang menghadirkan akun TablePro, Anda masuk ke aplikasi Mac dengan [akun TablePro](#account), bukan kunci lisensi. Aplikasi membuka halaman masuk di jendela browser, tempat Anda dapat mengetik kode dari email masuk. Setelah Anda masuk, aplikasi mendaftarkan Mac Anda sebagai perangkat akun Anda: ID mesin yang dijelaskan di atas, nama Mac Anda, platform, serta versi aplikasi dan macOS. Lalu aplikasi mengambil paket Anda dari server kami sebagai file bertanda tangan sekali sehari selama berjalan, dan file itu membuat fitur berbayar tetap berfungsi hingga {offlineDays} hari tanpa server kami. Token yang membuat aplikasi tetap masuk hanya disimpan di Rantai Kunci macOS pada Mac itu dan tidak pernah disinkronkan lewat iCloud Keychain, meskipun sinkronisasi kata sandi aktif.

Kunci lisensi yang sudah ada di Mac Anda ditukar satu kali dengan proses masuk ke akun pemiliknya, lalu dihapus dari Mac. Perangkat yang tidak menghubungi server selama 180 hari akan dihapus. Anda dapat menghapus perangkat di aplikasi atau di portal akun, dan saat sebuah Mac pertama kali memakai lisensi Anda, kami memberi tahu Anda melalui email.

### Team Library {#library}

Team Library merupakan bagian dari lisensi Team. Saat Anda memilih **Share > Publish to Team Library…** pada koneksi atau **Publish Saved Queries to Team…** di sidebar Favorites, aplikasi Mac mengunggah data yang Anda publikasikan ke server kami:

- pengaturan koneksi: host, port, nama database, nama pengguna, pengaturan SSH dan SSL, opsi driver, perintah awal, pengaturan Tunnel Command, tingkat Safe Mode, dan pengaturan AI, tetapi tidak pernah kata sandi;
- kueri tersimpan: nama, teks SQL, kata kunci, dan foldernya.

Mulai versi yang menghadirkan akun TablePro, aplikasi Mac setiap anggota yang memiliki seat mengunduh perubahan pustaka saat dimulai, setiap 15 menit, dan setelah setiap publikasi. Publikasi hanya mengirim yang berubah dan hanya menghapus item yang dipublikasikan Mac itu dan tidak lagi dimilikinya. Jika orang lain sudah mengubah suatu item lebih dulu, aplikasi menanyakan salinan mana yang disimpan, dan menampilkan siapa yang terakhir mengubah setiap kueri tim. Versi sebelum akun TablePro mengunduh pustaka saat dimulai, paling sering sekali seminggu, dan Mac yang memublikasikannya mengunduh ulang segera setelahnya. Publikasi baru dari versi tersebut menggantikan publikasi Anda sebelumnya. Bagian Library di portal akun menampilkan setiap item, beserta nama orang yang terakhir mengubahnya, kepada anggota yang dapat membaca pustaka, dan memungkinkan pemilik dan admin menghapus item. Item yang dihapus tetap ada di server kami selama 90 hari agar setiap Mac dapat menyinkronkan penghapusannya. Jika lisensi berakhir, pustaka tetap berada di server kami sampai pemilik tim menghapus tim, yang sekaligus menghapus pustakanya.

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

Kata sandi disimpan di Rantai Kunci macOS. Daftar koneksi, riwayat kueri, Query Insights, snapshot Data Rewind, pengaturan, dan tab terbuka disimpan di Mac Anda. Aplikasi merujuk kunci SSH di lokasi aslinya pada disk dan tidak menyalinnya. Versi sebelum akun TablePro tidak berisi pelapor kerusakan atau pustaka analitik pihak ketiga. Mulai versi yang menghadirkan akun TablePro, aplikasi menyertakan pustaka PostHog, yang mengirim data penggunaan yang dijelaskan di atas. Pustaka itu berisi pelapor kerusakan PostHog, yang dibiarkan nonaktif oleh aplikasi, sehingga tidak ada laporan kerusakan yang dikirim. Pustaka menyimpan ID acaknya, pengaturannya, dan peristiwa yang belum terkirim dalam file di bawah `~/Library/Application Support/com.TablePro`.

## TablePro untuk iPhone dan iPad {#ios-app}

**Tidak ada data yang dikirim ke TablePro kecuali Anda mengaktifkan Share Usage Data**, saat aplikasi pertama kali dimulai atau kemudian di **Settings > Privacy**. Jika diaktifkan, aplikasi mengirim laporan sekali sehari ke server yang sama dengan versi aplikasi Mac sebelum akun TablePro, dan server kami meneruskannya ke PostHog dengan cara yang sama, tanpa alamat IP-nya. Laporan berisi hash SHA-256 dari pengenal yang diberikan Apple kepada aplikasi di perangkat Anda, platform, versi aplikasi dan iOS, arsitektur prosesor, bahasa aplikasi, nama jenis database dari koneksi yang sedang terbuka, jumlah koneksi yang terbuka, serta tanggal dan waktu percobaan koneksi pertama, koneksi pertama yang berhasil, dan kueri pertama. Laporan tidak berisi pengaturan pembaruan dan selalu menyatakan tidak ada lisensi yang diaktifkan karena aplikasi tidak memiliki keduanya.

Aplikasi tidak melakukan pemeriksaan lisensi, pemeriksaan pembaruan, atau permintaan plugin. Selain laporan opsional tersebut, aplikasi hanya terhubung ke database dan server SSH Anda, iCloud Apple jika Anda mengaktifkan iCloud Sync, serta Microsoft saat koneksi SQL Server masuk menggunakan Microsoft Entra ID.

Di perangkat, kata sandi dan kunci SSH yang ditempel disimpan di Rantai Kunci, dan sertifikat tidak pernah disinkronkan. Riwayat kueri tetap berada di perangkat. Koneksi Anda ditambahkan ke indeks Spotlight di perangkat agar dapat dicari. Saat kueri berjalan, Live Activity menampilkan SQL pada Layar Terkunci dan Dynamic Island yang diperluas, kecuali Anda mengaktifkan **Settings > Live Activities > Hide Query**.

Jika Anda membagikan analitik kepada pengembang aplikasi melalui pengaturan iPhone atau iPad, Apple dapat mengirim laporan kerusakan dan statistik penggunaan kepada kami melalui App Store Connect. Aplikasi tidak memiliki pelapor kerusakan atau pustaka analitik pihak ketiga sendiri.

## iCloud Sync dan Handoff {#icloud}

iCloud Sync nonaktif sampai Anda mengaktifkannya, baik di Mac maupun iPhone dan iPad. Saat aktif, data dikirim ke database pribadi dalam akun iCloud Anda sendiri (kontainer `iCloud.com.TablePro`). TablePro tidak dapat membacanya.

- Di Mac, Anda memilih data yang disinkronkan: koneksi, grup dan tag, pengaturan, profil SSH, profil kredensial (nama dan nama penggunanya, tanpa kata sandi), tabel dan database favorit, kueri tersimpan (termasuk teks SQL), serta folder tabel. Data koneksi mencakup host, port, nama pengguna, nama database, pengaturan SSH dan SSL, perintah awal, skrip sebelum koneksi, dan aturan AI. Riwayat kueri, snapshot Data Rewind, dan sumber kata sandi tidak pernah disinkronkan.
- iPhone dan iPad menyinkronkan koneksi, grup, dan tag.
- Kata sandi hanya disinkronkan jika Anda juga mengaktifkan **Passwords** di Sync Categories pada Mac atau **Sync Passwords** pada iPhone dan iPad, menggunakan iCloud Keychain. Di Mac, opsi ini juga menyinkronkan rahasia lain yang disimpan TablePro di Rantai Kunci, seperti kunci penyedia AI dan kunci lisensi. Mulai versi yang menghadirkan akun TablePro, kunci lisensi dihapus begitu ditukar dengan sesi masuk, dan token yang membuat aplikasi tetap masuk tidak pernah disinkronkan.

Di Mac, iCloud Sync merupakan bagian dari lisensi Starter atau Team. Di iPhone dan iPad, fitur ini gratis.

Handoff mengirim ID koneksi yang terbuka dan nama tabel yang terbuka antarperangkat Anda sendiri melalui Apple. Jika tidak ada tabel terbuka, Handoff mengirim nama koneksi, atau host-nya jika koneksi tidak memiliki nama. Handoff tidak mengirim pengaturan atau kredensial.

## Situs web {#website}

**Hosting.** Situs web dan portal akun berjalan di server kami, di belakang Cloudflare. Seperti server web lainnya, keduanya menerima alamat IP Anda, user agent peramban, dan alamat setiap halaman yang Anda minta.

**Cloudflare Web Analytics.** Cloudflare menambahkan skrip Web Analytics ke halaman situs web; portal akun tidak menjalankannya. Peramban Anda memuatnya dari `static.cloudflareinsights.com`, dan skrip melaporkan setiap tampilan halaman ke Cloudflare: halaman, situs yang menautkannya, waktu pemuatan halaman, serta peramban, sistem operasi, dan jenis perangkat Anda. Cloudflare menambahkan negara asal koneksi Anda. Skrip tidak memasang cookie atau menyimpan apa pun di peramban, dan Cloudflare menyatakan tidak menggunakan alamat IP atau detail peramban untuk mengidentifikasi Anda melalui fingerprinting. Cloudflare menampilkan jumlah keseluruhan kepada kami, seperti tampilan per halaman atau per negara, bukan catatan setiap pengunjung. Dasar hukum: kepentingan yang sah.

**Google Analytics.** Situs memuat Google Analytics pada setiap halaman dalam Consent Mode. Sampai Anda memilih **Izinkan** pada pertanyaan cookie, Google Analytics tidak memasang cookie dan hanya mengirim sinyal tanpa cookie ke Google untuk setiap halaman, tanpa pengenal yang disimpan di perangkat Anda. Jika diizinkan, Google Analytics memasang cookie `_ga` dan `_ga_<ID>` serta mengukur kunjungan Anda, seperti halaman yang dilihat, klik unduhan, dan awal proses pembelian. Penyimpanan iklan, personalisasi iklan, dan data pengguna iklan selalu ditolak. Google menyatakan bahwa Google Analytics 4 tidak mencatat atau menyimpan alamat IP. Properti Google Analytics kami menggunakan masa retensi bawaan Google: Google menghapus data tingkat pengguna dan tingkat peristiwa yang dikumpulkannya setelah 2 bulan. Laporan standar Google, yang berisi jumlah keseluruhan alih-alih pengenal, tidak terpengaruh. Dasar hukum: persetujuan Anda untuk cookie.

**Chat langsung.** Setiap halaman situs web dan portal akun menampilkan tombol chat dari penyedia kami, Crisp. Setelah halaman selesai dimuat, peramban memuat skrip Crisp dari `client.crisp.chat`, dan Crisp memasang cookie yang dijelaskan di [Cookie dan penyimpanan peramban](#cookies). Crisp menerima alamat IP Anda, detail peramban, alamat halaman yang Anda lihat, dan pesan yang Anda tulis, serta menyimpan alamat IP jika Anda memulai percakapan. Kami memberi tahu Crisp bahasa halaman. Saat Anda masuk ke portal akun, kami juga memberikan alamat email dan ID akun Anda kepada Crisp, yang menautkan percakapan ke akun Anda. Kami tidak memberikan informasi lain tentang Anda kepada Crisp. Crisp berbasis di Prancis.

**Skrip pembayaran.** Saat Anda mengarahkan penunjuk atau berpindah dengan tombol Tab ke tombol Beli, peramban memuat skrip pembayaran {merchant} dari jsDelivr (`cdn.jsdelivr.net`), yang menerima alamat IP dan detail peramban Anda. Halaman pembayaran itu sendiri baru dibuka dari {merchant} saat Anda mengeklik.

**Pemeriksaan buletin.** Saat Anda mulai mengisi formulir buletin, peramban Anda memuat Cloudflare Turnstile dari `challenges.cloudflare.com` untuk memeriksa bahwa yang mendaftar adalah manusia; Cloudflare menerima alamat IP dan detail peramban Anda.

**Atribusi pembelian.** Saat Anda tiba di situs, peramban menyimpan catatan kunjungan pertama bernama `tablepro:attribution` dalam penyimpanan lokal selama 90 hari: sumber kunjungan (tag `ref` atau `utm_*` pada tautan yang Anda ikuti, atau situs yang menautkan ke sini), halaman tujuan, dan waktunya. Jika Anda memulai pembelian, catatan dikirim bersama permintaan pembayaran. Server kami meneruskan sumber kunjungan ke {merchant} sebagai metadata pembayaran, menyimpannya bersama pesanan setelah Anda membayar, dan mengirimkannya ke PostHog bersama pembayaran yang dimulai dan yang diselesaikan. Halaman tujuan dan waktunya tidak disimpan.

**Dokumentasi.** Dokumentasi di docs.tablepro.app dihosting oleh Mintlify, yang menerima alamat IP dan detail peramban Anda pada setiap halaman, dan halaman memuat fonnya dari Google Fonts. Bilah navigasi menampilkan jumlah bintang repositori, yang diambil peramban Anda dari API GitHub, sehingga GitHub juga menerima alamat IP dan detail peramban Anda. Permintaan itu tidak memasang cookie. Dokumentasi mengajukan pertanyaan cookie sendiri, karena tidak dapat membaca jawaban Anda di situs ini. Sampai Anda memilih **Allow** di sana, dokumentasi tidak memasang cookie dan tidak menyimpan ID pengunjung. Jika diizinkan, Google Analytics memasang cookie `_ga` dan `_ga_<ID>` serta mengukur kunjungan Anda ke dokumentasi, dan Mintlify menyimpan ID pengunjung acak, `mintlify_anonymous_id`, di penyimpanan lokal untuk menghitungnya. **Cookie settings** di footer dokumentasi mengubah jawaban Anda, dan menolak menghapus keduanya. Dasar hukum: persetujuan Anda.

**Bahasa dan diskon regional.** Untuk menyarankan halaman dalam bahasa Anda saat browser tidak menyebut satu pun bahasa yang tersedia di situs, dan untuk menampilkan diskon regional yang akan diterapkan saat checkout, situs menanyakan kepada Cloudflare (`/cdn-cgi/trace`) dan server kami dari negara mana koneksi Anda berasal, dan dapat membaca zona waktu perangkat Anda. Kedua permintaan tersebut tidak membawa cookie, dan halaman tidak menyimpan apa pun dari jawabannya. Dasar hukum: kepentingan yang sah.

Membaca situs tidak menetapkan cookie miliknya sendiri. Permintaan pendaftaran newsletter, checkout, dan kode diskon dari situs publik tidak menyertakan kredensial: permintaan tersebut tidak mengirim cookie portal akun maupun menerima cookie dari respons. Membuka halaman portal akun adalah tindakan terpisah: masuk di sana menetapkan cookie portal di bawah ini. Semua yang disimpan situs di browser tercantum dalam [Cookie dan penyimpanan browser](#cookies).

## Pembelian {#purchases}

Lisensi dijual oleh {merchant} (Polar Software, Inc.), merchant of record dan penjual kembali kami. Anda membeli dari {merchant} berdasarkan ketentuan pembeli dan kebijakan privasinya sendiri. {merchant} menerima pembayaran, menghitung dan membayar pajak penjualan atau PPN, mengirim kuitansi dan faktur, serta menangani masalah dan sengketa pembayaran. Layanan ini mengumpulkan nama, alamat email, alamat penagihan, dan detail pembayaran Anda. Kami tidak pernah melihat detail lengkap kartu Anda.

Saat Anda memulai pembayaran, server kami memberi tahu {merchant} apa yang Anda beli, bahasa halaman tempat Anda membeli, sumber kunjungan Anda (lihat [Situs web](#website)), dan alamat IP Anda, yang digunakan {merchant} untuk menentukan pajak dan mata uang. Dari {merchant}, kami menerima alamat email, nama dan alamat penagihan sesuai yang Anda masukkan, produk yang dibeli, jumlah pembayaran, ID pesanan dan langganan, serta perubahan berikutnya seperti perpanjangan, pembatalan, dan pengembalian dana. Bersama setiap pesanan, kami menyimpan alamat email, negara penagihan, dan jumlahnya.

Pembelian tanpa masuk tercatat di akun TablePro milik alamat email yang Anda gunakan, yang dibuat jika belum ada dan tetap belum terverifikasi sampai Anda pertama kali masuk. Di [portal akun]({account}) Anda dapat mengubah siklus penagihan atau jumlah seat langganan, membatalkan atau melanjutkannya, dan meminta pengembalian dana. Saat Anda membatalkan, alasan yang Anda pilih dan komentar yang Anda tulis dikirim ke {merchant} dan disimpan bersama langganan. Kartu, faktur, data pajak, dan alamat penagihan ada di [portal pelanggan {merchant}]({portal}), yang dibukakan oleh portal akun untuk Anda. Pengembalian dana dijelaskan di [kebijakan pengembalian dana](/id/refund-policy), dan hak penggunaan lisensi dijelaskan di [ketentuan layanan](/id/terms).

## Portal akun {#account}

[Portal akun]({account}) di account.tablepro.app adalah tempat Anda mengelola akun TablePro: lisensi, perangkat, penagihan, dan tim. Portal berjalan di server kami, di belakang Cloudflare, seperti situs web.

**Akun Anda.** Sebuah akun dimiliki satu orang dan dikenali dari alamat email. Akun berisi alamat itu, nama dan bahasa yang Anda tetapkan, metode masuk Anda, perangkat yang masuk ke akun, lisensi dan pesanan Anda, tim tempat Anda bergabung beserta peran dan seat Anda, dan log audit perubahan yang dibuat padanya, seperti proses masuk, perangkat baru, dan perubahan tim, beserta alamat IP dan browser dari permintaan yang membuat setiap perubahan. Email kami sampai kepada Anda dalam bahasa akun Anda.

**Masuk.** Kami mengirim tautan dan kode 6 digit melalui email: tautan berfungsi sekali, kode dapat dicoba 5 kali, dan keduanya kedaluwarsa setelah 15 menit. Anda juga dapat menambahkan passkey; untuk masing-masing kami menyimpan kunci publiknya, nama yang Anda berikan, apakah passkey itu tersinkron di antara perangkat Anda, serta kapan ditambahkan dan terakhir digunakan. Atau Anda dapat masuk dengan Apple, GitHub, atau Google: penyedia memberi kami ID untuk Anda dan alamat email Anda yang terverifikasi, dan Apple juga nama Anda pada kali pertama. Kami menyimpan ID dan alamat itu bersama akun Anda, dan untuk Apple sebuah token yang kami simpan terenkripsi dan kami cabut di Apple saat Anda memutuskan Apple atau menghapus akun. Jika alamat dari penyedia milik akun yang sudah ada, kami mengirim tautan dan kode ke akun itu untuk dikonfirmasi sebelum menautkannya, kecuali jika alamat itu dikelola Google (Gmail atau Google Workspace).

**Tim Anda.** Saat Anda mengundang seseorang ke tim, kami menyimpan alamat email, peran, dan apakah undangan mencakup seat, lalu mengirim tautan yang berlaku 7 hari. Pemilik dan admin melihat anggota tim beserta nama dan alamat email mereka, undangan, dan log audit tim, yang menunjukkan siapa mengubah apa di tim, termasuk alamat yang diundang, tetapi tidak pernah alamat IP atau browser. Anggota melihat tim, paketnya, jumlah seat-nya, dan peran mereka sendiri.

**Data Anda.** Di Pengaturan Anda dapat mengubah nama, alamat email, dan bahasa, menambahkan dan menghapus metode masuk, mengunduh data akun sebagai file JSON, dan menghapus akun. Akun tidak dapat dihapus selama Anda memiliki tim yang punya anggota lain. Menghapusnya akan menghapus metode masuk, perangkat, lisensi, keanggotaan tim, dan tim yang hanya beranggotakan Anda, serta mengakhiri langganan Anda tanpa pengembalian dana. Apa yang kami simpan setelahnya dijelaskan di [Lama penyimpanan data](#retention).

**Yang dimuat portal.** Portal tidak memuat Google Analytics, Cloudflare Web Analytics, atau skrip analitik lain, dan tidak mengajukan pertanyaan cookie. Portal menampilkan chat langsung dari Crisp yang dijelaskan di [Situs web](#website), dan pembelian di sana membuka pembayaran {merchant} di atas halaman. Portal melaporkan error dan waktu pemuatan ke Grafana Cloud dengan Grafana Faro: error-nya, layar tempat error terjadi (tidak pernah alamat lengkapnya, yang dapat berisi token sebuah tautan), browser dan sistem operasi Anda, serta ID acak untuk kunjungan Anda.

## Buletin {#newsletter}

Jika Anda berlangganan catatan rilis, kami terlebih dahulu mengirim tautan konfirmasi dalam bahasa halaman tempat Anda berlangganan. Tautan berlaku 7 hari, dan satu alamat menerima paling banyak 3 per hari. Setelah Anda mengonfirmasi, alamat Anda masuk ke daftar buletin kami di Resend, layanan yang mengirim email kami. Setiap buletin memiliki tautan berhenti berlangganan, yang ditangani Resend. Setelah Anda berhenti berlangganan, kami tidak mengirim buletin lagi; untuk sekaligus menghapus alamat email, hubungi kami melalui email. Cloudflare Turnstile memeriksa formulir, seperti dijelaskan di [Situs web](#website).

Saat kami pindah dari server sebelumnya, setiap alamat di milis server itu yang belum berhenti berlangganan masuk ke daftar ini sebagai pelanggan, baik sudah dikonfirmasi maupun belum: server itu juga menambahkan alamat pembeli, pemegang lisensi, dan pendaftar beta, lalu mengirimi mereka email. Alamat yang sudah berhenti berlangganan dipindahkan dengan status berhenti berlangganan, dan alamat yang emailnya terpental atau ditandai sebagai spam justru dimasukkan ke daftar penahanan (suppression list) Resend, sehingga tidak ada buletin yang sampai kepadanya.

## Cookie dan penyimpanan peramban {#cookies}

Membaca situs publik serta permintaan newsletter, checkout, dan kode diskonnya tidak menetapkan cookie miliknya sendiri. Masuk ke portal akun, atau mulai masuk, menetapkan satu cookie portal yang benar-benar diperlukan di bawah ini. Cloudflare Web Analytics tidak menetapkan cookie atau menyimpan apa pun di browser. Cookie Google Analytics hanya ditetapkan dengan izin Anda. Crisp menetapkan cookie pada setiap halaman setelah chat dimuat. Tidak ada yang digunakan untuk iklan atau dijual.

- **`_ga` dan `_ga_<ID>`** (cookie Google Analytics, hingga 2 tahun, hanya jika Anda mengizinkan analitik): pengenal acak untuk peramban dan status kunjungan saat ini. Menolak atau mengubah jawaban kemudian akan menghapusnya. Dasar hukum: persetujuan.
- **`tablepro:analytics-consent`** (penyimpanan lokal, sampai Anda menghapusnya): jawaban Anda atas pertanyaan analitik, agar tidak ditanyakan pada setiap halaman. Portal akun tidak memuat analitik, jadi tidak mengajukan pertanyaan ini dan tidak membaca jawabannya. Dasar hukum: benar-benar diperlukan untuk menghormati pilihan Anda.
- **`tablepro:attribution`** (penyimpanan lokal, 90 hari): catatan kunjungan pertama yang dijelaskan di [Situs web](#website). Catatan ini tidak berisi pengenal Anda dan hanya dikirim bersama permintaan pembayaran, lalu server kami meneruskan sumber kunjungannya ke {merchant}. Dasar hukum: kepentingan yang sah.
- **`theme`** (penyimpanan lokal, sampai Anda menghapusnya): pilihan tampilan terang, gelap, atau sistem. Portal akun menyimpan pilihannya sendiri. Dasar hukum: kepentingan yang sah.
- **`tablepro:language`** (penyimpanan lokal, sampai Anda menghapusnya): bahasa yang Anda pilih di menu bahasa atau bilah bahasa, dan setiap bahasa yang sarannya Anda tutup, agar tidak ditawarkan lagi. Dasar hukum: kepentingan yang sah.
- **`mintlify_anonymous_id`** (penyimpanan lokal di docs.tablepro.app, dipasang oleh Mintlify, hanya jika Anda mengizinkan Google Analytics di sana): ID pengunjung yang dijelaskan di [Situs web](#website). Menolak akan menghapusnya. Dokumentasi menyimpan jawaban `tablepro:analytics-consent` miliknya sendiri. Dasar hukum: persetujuan.
- **Cookie yang diawali `crisp-client/`** (Crisp, misalnya `crisp-client/session/…`; 6 bulan, diperbarui saat Anda kembali; dipasang pada setiap halaman setelah chat dimuat): mempertahankan chat dan percakapan lintas halaman dan kunjungan. Dasar hukum: kepentingan yang sah, untuk menawarkan dukungan di setiap halaman.
- **`__Host-tp_session`** (cookie portal akun, 30 hari sejak Anda masuk): menjaga Anda tetap masuk. Sebelum Anda masuk, cookie ini hanya ditetapkan saat proses masuk dengan passkey, Apple, GitHub, Google, atau dari aplikasi sedang berlangsung, paling lama 10 menit. Keluar akan menghapusnya. Permintaan newsletter, checkout, dan kode diskon dari situs publik tidak menyertakan kredensial dan tidak pernah menerimanya. Dasar hukum: benar-benar diperlukan.
- **`locale`, `context`, dan `sign-in-return-to`** (penyimpanan lokal portal akun): bahasa yang Anda pilih di sana sebelum masuk dan apakah terakhir Anda membuka Pribadi atau sebuah tim, keduanya sampai Anda menghapusnya, serta selama 15 menit halaman tujuan setelah Anda membuka tautan masuk dari email. Dasar hukum: kepentingan yang sah.
- **`com.grafana.faro.session`** (penyimpanan sesi portal akun, sampai Anda menutup tab): ID kunjungan acak dalam laporan error portal. Dasar hukum: kepentingan yang sah.

Anda dapat mengubah atau menarik jawaban analitik kapan saja melalui **Pengaturan cookie** di footer setiap halaman, atau di sini:

<cookie-settings></cookie-settings>

## Dasar hukum {#lawful-basis}

Bagi pembaca di Wilayah Ekonomi Eropa dan Britania Raya, dasar hukum berdasarkan GDPR dan UK GDPR adalah:

- **Kontrak** (Art. 6(1)(b)): penjualan dan penyediaan lisensi, akun Anda beserta metode masuk dan perangkatnya, pemeriksaan lisensi, portal akun, dan Team Library.
- **Kepentingan yang sah** (Art. 6(1)(f)): data penggunaan aplikasi Mac dan analisisnya di PostHog, peristiwa tentang proses masuk, pembelian, perangkat, dan tim yang dikirim server kami ke PostHog, log audit akun, keamanan dan pencegahan penyalahgunaan, termasuk Cloudflare Turnstile pada formulir buletin, log server web dan laporan error portal akun, Cloudflare Web Analytics, catatan atribusi pembelian, pencarian negara untuk bahasa dan diskon regional, dan chat langsung di setiap halaman.
- **Persetujuan** (Art. 6(1)(a)): cookie Google Analytics, laporan penggunaan aplikasi iPhone dan iPad, buletin, serta percakapan yang Anda mulai melalui chat langsung.
- **Kewajiban hukum** (Art. 6(1)(c)): catatan pajak dan akuntansi, serta jawaban atas permintaan yang sah menurut hukum.

## Penerima data {#sharing}

Kami hanya membagikan data pribadi kepada layanan yang diperlukan untuk menjalankan TablePro:

- **{merchant}**, merchant of record untuk pembelian.
- **Resend**, yang mengirim email kami: tautan dan kode masuk, undangan tim, pemberitahuan akun dan keamanan, serta buletin. Resend menyimpan daftar buletin dan memberi tahu kami saat email ke suatu alamat terpental atau ditandai sebagai spam.
- **Penyedia hosting kami dan Cloudflare**, untuk situs web, portal akun, dan server yang berkomunikasi dengan aplikasi. Cloudflare juga menghitung tampilan halaman menggunakan Cloudflare Web Analytics dan memeriksa formulir buletin dengan Turnstile.
- **Google**, untuk Google Analytics di situs web dan dokumentasi.
- **Crisp**, untuk chat langsung pada setiap halaman situs web dan portal akun.
- **PostHog** (EU Cloud), layanan analitik produk kami, yang menerima laporan penggunaan aplikasi dan peristiwa server kami tentang proses masuk, pembelian, perangkat, dan tim, dengan ID akun Anda tetapi tidak pernah alamat email atau nama Anda. Data penggunaan yang dikirim aplikasi Mac secara langsung sampai ke PostHog beserta alamat IP Mac Anda.
- **Grafana Labs** (Grafana Cloud), yang menerima log dan trace server kami serta laporan error portal akun.
- **Apple, GitHub, dan Google**, saat Anda masuk ke akun dengan layanan tersebut.
- **jsDelivr**, yang menyajikan skrip pembayaran {merchant} ke peramban saat Anda mengarahkan penunjuk ke tombol Beli.
- **Mintlify**, yang menghosting dokumentasi di docs.tablepro.app.
- **GitHub**, yang menghosting feed pembaruan, katalog plugin, dan unduhan, serta menyediakan jumlah bintang yang ditampilkan dokumentasi.

Kami tidak menjual data pribadi atau membagikannya kepada pengiklan.

## Transfer internasional {#transfers}

Layanan di atas beroperasi di beberapa negara, sehingga data Anda dapat diproses di luar negara Anda. {merchant}, Google, GitHub, Cloudflare, dan Mintlify memproses data di Amerika Serikat; Google melakukannya berdasarkan EU-US Data Privacy Framework dan Standard Contractual Clauses. PostHog memprosesnya di Uni Eropa. Jika diwajibkan hukum, transfer dari EEA dan Britania Raya menggunakan Standard Contractual Clauses atau mekanisme lain yang disetujui.

## Lama penyimpanan data {#retention}

- **Laporan penggunaan dan peristiwa analitik**: server kami tidak menyimpan salinan setelah meneruskannya ke PostHog. Kami belum menetapkan batas waktu untuknya di PostHog.
- **Catatan dari server kami sebelumnya**: salinan seluruh basis datanya disimpan tanpa batas waktu dalam sebuah arsip. Arsip itu mencakup lisensi, pesanan, dan anggota tim beserta alamat email dan namanya; Mac yang diaktifkan dengan lisensi, beserta namanya; pelanggan buletin dan pendaftar beta; catatan email yang dikirimnya; serta laporan penggunaan dan log permintaan lisensi yang disimpannya, beserta alamat IP-nya.
- **Perangkat**: disimpan selama digunakan. Perangkat yang tidak menghubungi server selama 180 hari dihapus, kecuali file offline untuknya masih berlaku, dan perangkat yang dihapus dihilangkan setahun kemudian.
- **Log audit akun Anda**: disimpan selama akun ada, beserta alamat IP dan browser setiap perubahan yang Anda buat. Menghapus akun menghilangkan alamat email Anda dari log itu serta alamat IP dan browser tindakan Anda; catatan setiap perubahan tetap ada.
- **Pesanan**: disimpan untuk pajak dan akuntansi. Menghapus akun Anda menghilangkan alamat email dan akun Anda dari pesanan.
- **Notifikasi dari {merchant}, Resend, dan Apple**: 180 hari. Notifikasi {merchant} berisi nama, alamat email, dan alamat penagihan Anda; menghapus akun Anda menghilangkan data itu lebih awal dari notifikasi tentang pembelian Anda.
- **Team Library**: sampai item diubah atau dihapus; item yang dihapus disimpan selama 90 hari. Pustaka dihapus bersama timnya dan tetap ada setelah lisensi berakhir.
- **Tautan dan kode masuk**: kedaluwarsa setelah 15 menit dan dihapus 7 hari kemudian. Sesi portal berlangsung selama 30 hari. Token yang membuat aplikasi tetap masuk kedaluwarsa 90 hari setelah terakhir dipakai aplikasi, dan dihapus 30 hari setelahnya.
- **Akun yang dihapus**: akun, metode masuk, perangkat, lisensi, dan keanggotaan timnya langsung dihapus. Pesanan dan log audit tetap seperti dijelaskan di atas. Data tentang Anda yang disimpan server kami sebelumnya tetap ada dalam arsipnya, seperti dijelaskan di atas.
- **Buletin**: tautan konfirmasi dan alamat tujuannya dihapus 7 hari setelah tautan kedaluwarsa. Alamat yang sudah dikonfirmasi, atau yang dipindahkan dari server kami sebelumnya, tetap ada di daftar kami di Resend sampai kami menghapusnya atas permintaan Anda; setelah Anda berhenti berlangganan, alamat itu disimpan sebagai berhenti berlangganan agar tidak ada buletin yang sampai kepadanya.
- **Google Analytics**: data tingkat pengguna dan tingkat peristiwa selama 2 bulan, masa retensi bawaan Google yang digunakan properti kami. Cookie bertahan hingga 2 tahun atau dihapus saat Anda menolak.
- **Cloudflare Web Analytics**: Cloudflare menampilkan jumlah tampilan halaman selama enam bulan terakhir kepada kami. Tidak ada data yang disimpan di peramban.
- **Chat langsung dan email dukungan**: disimpan oleh Crisp dan di kotak email kami sampai dihapus. Mintalah kepada kami untuk menghapus percakapan dan email Anda.
- **Log server web**: disimpan untuk keamanan dan pemecahan masalah. Kami belum menetapkan masa penyimpanan tetap.
- **Log dan trace server kami, serta laporan error portal**: 14 hari, di Grafana Cloud.

## Hak Anda {#rights}

Bergantung pada tempat tinggal Anda, Anda dapat meminta kami untuk:

- memberikan salinan data pribadi Anda yang kami simpan (akses);
- memperbaikinya (koreksi);
- menghapusnya (penghapusan), kecuali data yang wajib disimpan menurut hukum;
- membatasi cara penggunaannya (pembatasan);
- mengirimkannya kepada Anda dalam format terstruktur yang dapat dibaca mesin (portabilitas);
- berhenti menggunakannya atas dasar kepentingan yang sah (keberatan).

Anda dapat menarik persetujuan kapan saja dan mengajukan keluhan kepada otoritas perlindungan data Anda. Untuk menggunakan hak ini, kirim email ke [{email}](mailto:{email}). Kami menjawab dalam 30 hari. Di [portal akun]({account}), Pengaturan juga memberi Anda salinan data akun dan menghapus akun. Untuk hal lain, seperti alamat buletin atau Mac tanpa akun, sebutkan alamat email, kunci lisensi, atau perangkat yang terkait. Data yang disimpan {merchant}, Google, Crisp, atau GitHub juga diatur oleh kebijakan masing-masing.

**Penduduk California.** California Consumer Privacy Act memberi Anda hak untuk mengetahui informasi pribadi yang kami kumpulkan, meminta penghapusannya, menolak penjualannya, serta tidak diperlakukan berbeda karena menggunakan hak tersebut. Kami tidak menjual informasi pribadi.

## Anak-anak {#children}

TablePro tidak ditujukan kepada anak di bawah 16 tahun, dan kami tidak dengan sengaja mengumpulkan data pribadi mereka. Jika Anda yakin seorang anak telah memberikan data pribadi kepada kami, hubungi kami dan kami akan menghapusnya.

## Keamanan {#security}

Lalu lintas antara aplikasi, situs web, portal akun, dan server kami menggunakan HTTPS. Akun TablePro tidak memiliki kata sandi. Tautan dan kode masuk, token yang membuat aplikasi tetap masuk, dan token API tim disimpan sebagai hash. Tugas yang mengirim tautan dan kode masuk lewat email menyimpan keduanya sebagai teks biasa sampai tugas itu dihapus: sehari setelah email terkirim, atau 7 hari setelah kami berhenti mencoba mengirimnya. Keduanya tidak berlaku lagi 15 menit setelah Anda memintanya. Akses ke sistem kami dibatasi untuk {publisherName} dan penyedia layanan yang tercantum di [Penerima data](#sharing). Tidak ada sistem yang sepenuhnya aman. Untuk melaporkan kerentanan, lihat [halaman Keamanan](/id/security#report) atau kirim email ke [{email}](mailto:{email}).

## Perubahan kebijakan ini {#changes}

Saat kebijakan ini berubah, kami memperbaruinya di sini dengan tanggal "Terakhir diperbarui" yang baru dan, jika diwajibkan hukum, memberi tahu Anda secara langsung.

## Kontak {#contact}

Untuk pertanyaan tentang privasi atau kebijakan ini, kirim email ke [{email}](mailto:{email}).
