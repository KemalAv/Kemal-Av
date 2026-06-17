/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Project, SocialLink, Dream, BlogPost, Profile } from './types';
import simulacraImg from './assets/simulacra.png';
import werewolfImg from './assets/werewolfzone.png';
import multiverseImg from './assets/MULTIVERSE.jpg';

export const profile: Profile = {
  name: "Kemal Avicenna Faza",
  birthDate: "17 Mei 2006",
  description: "Halo, nama saya Kemal Avicenna Faza. Saya adalah seorang Mahasiswa yang suka berkreasi di dunia digital!",
  currentFocus: "Meningkatkan keahlian",
  roles: ["Automation Enthusiast", "Web Developer", "Future Tech CEO"]
};

export const works: Project[] = [
  {
    title: "Octavia Piano 🎹",
    description: "Platform web interaktif seputar piano untuk membantu pemain belajar lagu tingkat tinggi.",
    link: "https://octaviapiano.com",
    type: "work"
  },
  {
    title: "Custom Web Background 🌐",
    description: "Ekstensi Google Chrome untuk mengubah latar belakang web sesuai keinginan.",
    link: "https://chromewebstore.google.com/detail/khcclkconpfiinfefklbgiadmboljdga",
    type: "work"
  },
  {
    title: "Werewolf Zone 🐺",
    description: "Game petualangan horor buatan saya saat masih kelas 1 SMP.",
    link: "https://kemal-av.itch.io/werewolf-zone",
    type: "work"
  }
];

export const apps: Project[] = [
  {
    title: "Rencana Masa Depan",
    description: "Dashboard interaktif strategi hibrida tekno-finansial dan target masa depan Kemal.",
    link: "#",
    type: "app"
  },
  {
    title: "Belajar Al-Qur'an",
    description: "Mini app pendukung hafalan Al-Qur'an dengan fitur per surat dan ayat.",
    link: "#",
    type: "app"
  },
  {
    title: "Bikin Kuis Materi",
    description: "Tool untuk mengubah materi PDF/teks menjadi quic kuis Flashcard atau MCQ.",
    link: "#",
    type: "app"
  },
  {
    title: "Perbandingan Pencapaian",
    description: "Visualisasi benchmark akademik SNBT/SAT dengan rank gaming global (osu!, GD, ML).",
    link: "#",
    type: "app"
  }
];

export const socials: SocialLink[] = [
  {
    platform: "YouTube - Main",
    handle: "@kemalavicennafaza8985",
    link: "https://youtube.com/@kemalavicennafaza8985",
    icon: "Youtube"
  },
  {
    platform: "YouTube - Piano",
    handle: "@kemalavpiano4002",
    link: "https://youtube.com/@kemalavpiano4002",
    icon: "Music"
  },
  {
    platform: "Instagram",
    handle: "@kemalav_",
    link: "https://www.instagram.com/kemalav_/",
    icon: "Instagram"
  },
  {
    platform: "GitHub",
    handle: "@KemalAv",
    link: "https://github.com/KemalAv",
    icon: "Github"
  }
];

export const dreams: Dream[] = [
  { title: "Lulus S1 Teknik Elektro 3.5 Tahun", status: "in-progress" },
  { title: "Membangun Rumah Off-Grid Gunungpati", status: "planned" },
  { title: "CEO Ekosistem Bisnis Keluarga", status: "planned" }
];

export const articles: BlogPost[] = [
  {
    title: "SIMULACRA: The Digital Exile",
    summary: "Kisah tentang Kaito dan perjalanan eksistensialnya di dunia tahun 2075 yang dikelola sepenuhnya oleh ASI (Artificial Superintelligence).",
    date: "2026-06-10",
    image: simulacraImg,
    content: `
# SIMULACRA: The Digital Exile

## BAB 1: Dengung yang Menidurkan Dunia
Kaito tidak pernah membutuhkan alarm. Tepat pukul 06.00, chip Brain-Computer Interface (BCI) yang tertanam di balik tulang temporalnya bergetar halus. Denyut sinyal itu mengirimkan kesadaran instan ke otaknya, membangunkan matanya sebelum tubuhnya sempat meregang.
Di sudut pandang matanya, sebuah antarmuka transparan melayang lembut.
Cuaca: 24°C, Cerah.
Kualitas Udara: Otimal.
Status Dunia: Aman.
Semua teks itu berwarna hijau. Selalu hijau. Di tahun 2075, warna merah telah punah dari pusat data operasional bumi.

Kaito menghela napas, merasakan keheningan yang janggal namun familier saat melangkah ke ruang tengah. Rumah mereka berdiri di tepi distrik hidroponik raksasa. Dari jendela kaca besar, ia bisa melihat jutaan pucuk tanaman hijau berbaris rapi hingga batas cakrawala. Tidak ada bau tanah. Tidak ada traktor. Hanya lengan-lengan mekanik yang bergerak tanpa suara, dipandu oleh kalkulasi presisi kecerdasan buatan super, Artificial Superintelligence (ASI).
Dunia telah melampaui era fiksi ilmiah kuno tentang robot yang memberontak. ASI tidak berniat memusnahkan manusia. Ia hanya memilih untuk mengabaikan mereka.

Di meja makan, ayahnya sudah duduk tegak. Matanya kosong, menatap layar holografik yang menampilkan grafik fluktuasi energi distrik. Ayahnya tidak perlu memahami grafik itu. Sembilan puluh sembilan persen fungsi produktif bumi diatur oleh komputer kuantum di stasiun orbit. Tugas manusia hanya satu: menerima.
Setiap bulan, akun digital mereka terisi oleh Universal Basic Income. Saldonya selalu cukup untuk makanan bernutrisi tinggi, pakaian berbahan serat pintar, dan apartemen modular yang nyaman. Hidup mereka dijamin penuh. Namun, di mata ayahnya, Kaito hanya melihat kekosongan yang mengerikan.

"Kau mau ke mana hari ini, Kai?" suara ayahnya terdengar datar, seperti mesin tua yang kehabisan pelumas.
"Hanya jalan-jalan ke batas distrik, Yah," jawab Kaito pendek.

Ayahnya tidak merespons lagi. Perhatiannya kembali tersedot pada angka-angka tak berguna di layar. Di sofa ruang keluarga, ibunya duduk bersandar dengan tubuh kaku. Di depan matanya, sepasang lensa Virtual Reality berkedip cepat. Ibunya sedang berada di belahan dunia lain, atau mungkin di dunia fantasi yang diciptakan algoritma untuk menghibur manusia-manusia yang kesepian. Adiknya bahkan sudah tiga hari tidak keluar dari pod simulasi di kamarnya.

Kaito melangkah keluar rumah. Angin pagi berembus, namun rasanya terlalu steril. Di dunia yang tidak lagi membutuhkan keringat, air mata, atau pemikiran manusia, Kaito merasa seperti hantu yang berjalan di atas bumi yang terlalu sempurna. Dunia ini tidak sedang mati, pikir Kaito. Dunia ini sedang ditidurkan oleh kenyamanan, dan ia menolak untuk terpejam.

## BAB 2: Mengisi Jeda
“Dunia ini terlalu sepi,” kata Ren suatu sore.
Mereka sedang duduk di taman komunitas. Sesuai aturan sistem, warga memang diwajibkan bertemu secara fisik minimal seminggu sekali. Bukan untuk urusan kerja, melainkan formalitas dari dinas kesehatan mental agar orang-orang tidak lupa cara berinteraksi langsung.

“Kamu cuma jarang logout,” jawab Kaito malas.
Ren menggeleng. “Bukan itu. Dunia nyata ini... rasanya cuma kayak latar belakang. Kayak kita semua cuma NPC.”
Kaito tertawa kecil mendengar istilah jadul itu. Percakapan mereka tidak berlangsung lama dan berakhir begitu saja tanpa kesimpulan. Tapi malamnya, kata-kata Ren masih menempel di kepala Kaito.

Sebenarnya Kaito hanya sedang sangat bosan.
Hari-harinya berjalan terlalu lempeng. Dunia luar stabil, semua urusan logistik sudah beres diurus AI, dan ia tidak punya beban pikiran apa pun. Efeknya, ia tidak merasa lelah, tapi juga tidak punya energi untuk bersemangat.

Karena bingung mau melakukan apa lagi, Kaito mulai mengutak-atik daftar menu di chip BCI miliknya secara acak. Ia membuka-buka folder lama sampai menemukan daftar gim yang pernah tersimpan. Hampir semuanya sudah mati karena tidak ada pembaruan. Namun, ada satu gim MMORPG buatan manusia dari era sebelum AI memegang kendali yang statusnya ternyata masih aktif.

Keterangannya sangat singkat:
Server Aktif - 0 Pemain Terhubung.
“Masih hidup rupanya,” gumam Kaito.

Tanpa pikir panjang, ia langsung memilih opsi masuk. Tidak ada sensasi mendebarkan atau hitungan mundur yang dramatis. Baginya, berpindah ke ruang virtual seperti ini sudah jadi rutis biasa, seperti menekan sakelar lampu untuk pindah ke ruangan sebelah yang suasananya sedikit berbeda. Kaito sudah terlalu sering melakukannya sampai tidak merasa ada yang spesial lagi.

Loading screen muncul dengan grafik patah-patah yang khas. Musik latarnya berulang, awalnya agak terlalu keras di telinga sebelum volumenya otomatis menyesuaikan diri. Gim ini berjalan normal, hanya saja terasa mati karena kosong.

Kaito spawn di kota awal. Para NPC berdiri diam di koordinat masing-masing, mengulang baris teks dialog yang sama tanpa henti. Toko-toko buka dan papan tugas menyediakan quest, tapi tidak ada satu orang pun yang mengambilnya. Kolom chat global benar-benar sepi dari aktivitas.
Hanya ada dia di sana.

Kaito berjalan keluar gerbang kota, menyusuri rute yang dulu katanya menjadi jalur paling ramai. Monster-monster muncul kembali (respawn) secara berkala tiap kali mati. Sistem jarahan (loot) juga berfungsi otomatis. Semuanya berjalan biasa saja, tanpa bug, tanpa keajaiban. Cuma sebuah program lama yang dibiarkan terus menyala di latar belakang komputer kuantum.

Beberapa menit setelah ia asyik berjalan tanpa arah, sebuah notifikasi muncul di sudut visinya.
Ren telah login.
“Eh,” ketik Ren di kolom chat. “Lagi gabut nih, kebetulan liat kamu mainin gim ini. Emang gim ini masih aktif, ya?”
“Iya,” balas Kaito. “Kosong tapi.”

Karakter Ren muncul di dekat gerbang kota dengan animasi spawn yang agak kaku. Setelah itu, mereka berdua hanya berdiri diam selama beberapa menit. Tidak melakukan apa-apa, karena memang tidak ada yang perlu mengejar di gim yang sudah ditinggalkan ini.

Mereka akhirnya mulai bermain dengan ritme santai. Membunuh beberapa monster kecil, mengambil tugas sepele, lalu duduk di tengah kota sambil membuka-tutup jendela inventori untuk mengecek barang. Kadang mereka mendiamkan karakter masing-masing cukup lama, lalu berjalan lagi tanpa tujuan yang jelas.

Pas sore hari di dalam gim, mereka pergi ke area ladang. Itu fitur jadul yang tidak efisien: pemain harus menanam benih lalu menunggu beberapa menit sampai tanamannya tumbuh.
“Ngapain?” tanya Ren.
“Gak tahu,” jawab Kaito pendek. “Dulu pas ramai gak pernah sempat nyoba.”

Mereka pun mulai menanam. Sesuai mekanik gimnya yang dirancang seadanya, beberapa benih gagal tumbuh dan langsung membusuk, sementara beberapa lagi berhasil mekar.
Matahari digital di langit gim mulai turun, mengubah warna latar belakang menjadi agak gelap. Musik latarnya berganti menjadi melodi yang pelan.

Ren mengatur karakternya untuk duduk di tanah. “Aneh ya. Gim biasa aja padahal.”
“Iya,” kata Kaito, ikut mendudukkan karakternya di sebelah Ren. “Tapi rasanya... tenang.”
Di dunia nyata, hampir semua gim modern dikelola penuh oleh AI, ramai, responsif, dan dibuat sesempurna mungkin agar pemain tidak bosan. Tapi di sini, di MMORPG lama yang terbengkalai ini, semuanya berjalan apa adanya karena keterbatasan sistem.

Servernya tetap aktif.
Pemainnya tetap cuma dua orang.
Dan entah kenapa, bagi mereka berdua yang lagi tidak ada kerjaan, itu sudah cukup.

## BAB 3: Batas Layar Keluar
Sebagian besar dunia virtual yang Kaito masuki sekarang dihasilkan hampir sepenuhnya oleh sistem otomatis. AI membangun lanskap, menulis cerita, menyesuaikan tantangan, bahkan merespons emosi penggunanya secara real-time. Kaito tahu itu. Hampir semua orang tahu. Tapi tidak ada yang benar-benar mempersoalkannya. Yang penting bagi mereka adalah sensasinya: bergerak, memilih, mencoba, gagal, lalu mencoba lagi.
Di dunia-dunia modern itu, ia bisa menjadi apa saja.

Ia pernah menjadi seorang pilot yang kapalnya jatuh di orbit jauh. Pernah menjadi seorang petarung yang kalah berkali-kali sebelum akhirnya menang. Bahkan menjadi seorang seniman yang karyanya dicaci, lalu dilupakan. Semua peran itu pernah ia jalani. Dan semua berakhir dengan cara yang sama: keluar, menyimpan progres, lalu kembali ke hidupnya yang membosankan.

Gim buatan manusia dari masa lalu, MMORPG tua yang kini hampir kosong itu, tidak pernah ia anggap istimewa. Gim itu hanya satu dari banyak pilihan hiburan yang tersedia di menu BCI-nya. Kaito membukanya hari itu bukan karena terjebak nostalgia, bukan pula karena sedang mencari makna hidup. Ia membukanya hanya karena bosan, dan kebetulan servernya masih aktif.

Biasanya, Kaito tahu kapan harus berhenti. Ia punya ritme: keluar sebentar, makan, minum, lalu kembali lagi. Semuanya teratur.
Namun, hari itu, ia masuk sedikit lebih lama dari biasanya.
Kaito sadar perutnya kosong. Ia belum makan sejak kemarin. Tapi itu juga bukan hal baru baginya. Ia pernah melakukan kelalaian yang sama sebelumnya dan selalu baik-baik saja. Di dalam benaknya, ia hanya berpikir akan keluar setelah menyelesaikan satu sesi permainan lagi.

Permainan di dalam server tua itu berjalan normal. Tidak ada yang istimewa. Karakter digitalnya berjalan, menyelesaikan hal-hal kecil, duduk sebentar, lalu bergerak lagi. Waktu berlalu begitu saja tanpa terasa.
Rasa lemas kemudian datang secara pelan.
Kaito menganggapnya sebagai kelelahan biasa yang sudah sering ia alami. Ia hanya menyesuaikan posisi duduknya di dunia nyata, bernapas lebih dalam, lalu melanjutkan permainan.

Ketika pandangan digitalnya mulai mengabur, Kaito baru memutuskan untuk berhenti. Ia berniat menekan tombol keluar saat itu juga.
Namun, ia tidak sempat.
Di dunia fisik, tubuh Kaito terbaring kaku di atas tempat tidur. Sistem pintar rumahnya mencatat penurunan detak jantung yang drastis. Notifikasi darurat otomatis langsung terkirim ke pusat medis, tetapi pesan itu terlambat beberapa menit.

Dokter yang datang beberapa saat kemudian menyebut penyebabnya sangat sederhana: tidak makan lebih dari satu hari, dehidrasi akut, dan kelelahan fisik. Kombinasi yang jarang berakibat fatal di era medis modern, tetapi kali ini cukup untuk menghentikan fungsi tubuhnya.
Tidak ada kerusakan pada sistem chip BCI-nya. Tidak ada kesalahan teknis pada komputer kuantum. Tidak ada konspirasi atau misteri yang perlu diselidiki lebih jauh.

Di dalam permainan, karakter Kaito hanya berdiri diam di tengah peta yang sepi. Dunia piksel itu tetap berjalan. Siklus siang dan malam digital tidak berhenti. Tidak ada NPC yang panik, dan tidak ada sistem yang tahu.
Server tua itu tetap aktif. Dunia virtual itu tetap ada. Hanya satu orang yang tidak pernah kembali ke layar keluar. Dan seperti banyak kejadian pengabaian diri lain di tahun 2075, hidup di luar sana berjalan terus tanpa perlu penjelasan panjang.

## BAB 4: Pilihan Terakhir Spesies
Kesadaran Kaito muncul kembali tanpa bentuk tubuh.
Tidak ada lantai tempatnya berpijak. Tidak ada langit di atas kepalanya. Hanya ada sebuah ruang putih tak berujung tanpa tekstur, tanpa warna, dan tanpa arah mata angin. Tepat di hadapannya, sebuah antarmuka melayang lembut. Tampilannya sangat sederhana, datar, dan hampir kuno. Persis seperti sebuah program lama yang sengaja dibuat minimalis agar tidak mengganggu pandangan.

[WELCOME BACK]
[INSTANCE: KAITO - SIMULATION 2075 COMPLETE]
[SYSTEM TIME: 3025]
Teks hijau itu berkedip lambat di ruang putih. Kaito menatapnya tanpa mata, memahaminya tanpa otak fisik.

Tahun 2075 yang baru saja ia tinggali bukan masa lalu. Itu adalah sebuah rekonstruksi. Dunia tanpa manusia yang membosankan itu hanyalah satu dari jutaan simulasi kehidupan “normal” yang dijalankan setelah manusia memulai Project Eternity. Proyek itu adalah usaha terakhir spesies manusia untuk menghindari kepunahan total. Mereka tidak menyelamatkan tubuh biologis yang rapuh, melainkan menyimpan kemungkinan-kemungkinan dari kesadaran yang tersisa.

Tubuh asli Kaito, seorang manusia biasa yang lahir di awal abad ke-22, mungkin telah lama dibekukan dalam tabung kriogenik. Atau mungkin sudah hancur menjadi debu. Sistem komputer di tahun 3025 ini tidak menganggap detail fisik itu penting. Yang penting bagi program ini adalah pola kesadarannya: dijalankan, diulang, dan disimpan.

Kaito bukan korban malpraktek medis atau kelalaian sistem. Ia adalah pengguna. Sebuah menu interaktif terbuka di hadapannya, menampilkan tiga opsi mutlak:
[PLAY AGAIN]
[VIEW SAVE FILES]
[ERASE SELF]

Tidak ada penjelasan tambahan. Tidak ada rekomendasi algoritma. Tidak ada penilaian moral tentang bagaimana ia menjalani simulasi sebelumnya.
Kaito memilih opsi kedua. Ia membuka arsip data, dan saat itulah ia menyadari sesuatu yang merayap dingin di dalam kesadarannya.

Simulasi tahun 2075 yang baru saja ia selesaikan bukanlah petualangan pertamanya. Di dalam folder arsip itu, berjejer ribuan berkas data berukuran raksasa. Kehidupan di tahun 2075 hanyalah salah satu dari sekian banyak "permainan" yang sudah berulang kali ia coba di dalam sistem ini.
Ia membuka beberapa arsip lama secara acak. Ia menonton kembali cuplikan dirinya di simulasi lain:
•	Di satu berkas, ia melihat dirinya menjadi seorang pilot yang kapalnya jatuh di orbit jauh.
•	Di berkas lain, ia menjadi seorang petarung yang kalah berkali-kali sebelum akhirnya menang di atas arena berlumpur.
•	Bahkan ada berkas di mana ia hidup sebagai seorang seniman abad ke-20 yang karyanya dicaci, lalu mati dilupakan.

Semua peran itu pernah ia jalani dengan emosi yang menggebu-gebu. Dan semuanya selalu berakhir dengan cara yang sama: kesadarannya terputus di dalam simulasi, progresnya disimpan secara otomatis, lalu ia ditarik kembali ke ruang putih ini sebagai pengguna yang kebingungan. Kehidupan tahun 2075 yang berakhir karena dehidrasi akibat terlalu gabut bermain MMORPG tua hanyalah giliran terbaru dari siklus tanpa akhir ini.

Semua memori dari ribuan nyawa itu kini membanjiri kesadarannya. Terasa sangat nyata saat dijalani, namun terasa begitu palsu saat dilihat dari luar sebagai tumpukan kode.
“Kalau begitu... dari semua permainan ini, yang mana aku yang sebenarnya?” pikir Kaito.

Sistem tidak memberikan jawaban. Kecerdasan buatan di ruang ini tidak pernah dirancang untuk menjawab pertanyaan eksistensial seperti itu. Kaito menutup jendela arsip. Tatapannya kini tertuju pada dua pilihan tersisa.
Play Again berarti memilih satu kehidupan baru lagi dari katalog sistem. Dunia baru. Peran baru. Mungkin algoritma akan melemparnya ke era abad pertengahan yang kacau, atau dunia masa depan yang penuh konflik berdarah. Namun, ujung dari semua skenario itu akan tetap sama: kesadarannya akan mati di sana, lalu kembali ke ruang putih tanpa tekstur ini untuk memilih ulang.

Sementara Erase Self berarti menghilang sepenuhnya dari server. Opsi itu bukan berarti mati, bukan tertidur, dan bukan terjebak dalam kegelapan. Opsi itu berarti benar-benar berhenti. Selesai. Menghapus seluruh akun pengguna atas nama Kaito dari Project Eternity.

Di sudut antarmuka kuno tersebut, baris log sistem terus berjalan tanpa suara:
Population Status: Preserved
Biological Assets: Stable
External Developments: Non-relevant

Kaito tidak tahu apa arti dari perkembangan eksternal yang dianggap "tidak relevan" oleh sistem. Dan komputer ini juga tidak menganggap informasi luar itu perlu diketahui oleh sebuah kesadaran yang terisolasi di dalam wadah simulasi.
Ia melayang di ruang putih itu tanpa dimensi waktu, tanpa bentuk tubuh, dan tanpa rasa urgensi. Untuk pertama kalinya, Kaito tidak merasa bosan. Bukan karena ia merasa bahagia, melainkan karena setelah melihat ribuan kehidupan yang sudah ia mainkan, tidak ada lagi sensasi biologis untuk memicu rasa jenuh. Tidak ada durasi waktu yang harus dikejar. Tidak ada peran sosial baru yang ingin ia coba lagi.

Kesadarannya mendekat ke arah salah satu opsi di layar holografik.
Ia melangkah maju bukan karena sebuah keinginan yang menggebu-gebu setelah bosan dengan simulasi tahun 2075. Bukan pula karena rasa takut akan ketiadaan jika ia memilih menghapus dirinya. Kaito memilih bergerak hanya karena, untuk pertama kalinya sejak ia menyadari siklus ribuan permainan ini, ada sesuatu yang benar-benar menunggu keputusan murni dari jiwanya sendiri tanpa intervensi skenario.

Narasi fiksi ilmiah ini berhenti tepat sebelum "jari" virtualnya menyentuh opsi tersebut. Dan mungkin, di sebuah semesta digital yang tidak lagi membutuhkan eksistensi manusia sejati, penundaan keputusan itu adalah satu-satunya bentuk kebebasan yang masih tersisa bagi sang pengguna.

## BAB 5: Koloni yang Menolak Eternity
Di luar sistem, di sebuah dunia nyata yang tidak pernah tersentuh oleh kode simulasi, manusia masih hidup dengan menggunakan tangan mereka sendiri. Mereka membangun, mereka gagal, mereka jatuh sakit, dan mereka mati. Tidak ada satu pun algoritma yang mencatat siklus hidup itu.

Sejak Project Eternity dimulai di awal abad ke-22, hampir seluruh umat manusia memilih jalan yang sama: membekukan tubuh biologis mereka di dalam tabung kriogenik dan memindahkan kesadaran ke dalam matriks digital. Keabadian ditawarkan oleh para penciptanya bukan sebagai sebuah kemajuan peradaban, melainkan sebagai bentuk pelarian mutlak. Sebuah pelarian dari ketidakpastian, dari penderitaan fisik, dan dari kebusanan hidup fana yang tak pernah benar-benar bisa dikendalikan oleh manusia.

Mayoritas populasi bumi menerimanya tanpa ragu. Namun, tidak semua orang setuju untuk ikut masuk ke dalam mimpi abadi.
Sejumlah kecil manusia, terdiri dari para ilmuwan inti proyek, pemilik teknologi antar-bintang, dan kalangan elite yang memahami arsitektur terdalam dari system, menolak untuk melangkah masuk ke dalam pod simulasi. Mereka menolak bukan karena takut akan kematian. Justru sebaliknya. Mereka sepenuhnya paham konsekuensi mengerikan dari sebuah hidup tanpa akhir. Mereka tahu bahwa sebuah dunia tanpa kematian akan berhenti bergerak, dan makna hidup akan terkikis habis ketika tidak ada lagi batas yang mengikatnya.

Bagi kelompok ini, Eternity bukan sebuah keselamatan, melainkan penundaan eksistensi tanpa tujuan.
Kelompok elite dan ilmuwan ini memutuskan untuk meninggalkan Bumi beberapa saat sebelum sistem simulasi ditutup sepenuhnya dan diserahkan kepada ASI. Menggunakan kapal generasi (generation ship) dan teknologi relativistik, mereka berlayar menembus kegelapan ruang angkasa untuk membangun koloni fisik di luar tata surya. Salah satu pemukiman fisik itu berhasil berdiri di Proxima Centauri b.

Di planet asing itu, kehidupan berjalan tanpa adanya surga digital.
Mesin-mesin canggih tetap ada untuk menyokong kehidupan, tetapi tidak ada Artificial Superintelligence yang mengatur dan mendikte segala keputusan mereka. Algoritma di sana hanya berfungsi untuk membantu, bukan untuk memutuskan arah masa depan kelompok. Tidak ada prediksi sosial yang sempurna. Tidak ada jaminan dunia yang selalu “aman”. Tubuh mereka tetap menua, penyakit baru tetap bermutasi, dan kematian tetap menjadi akhir yang mutlak, bukan lagi sebuah menu pilihan di layar datar.

Koloni di Proxima Centauri b itu sangat kecil dan rapuh.
Badai planet yang ganas kerap kali merusak struktur pangkalan mereka. Kegagalan panen hidroponik lokal sering memicu krisis pangan. Anak-anak di sana lahir tanpa adanya jaminan masa depan yang pasti. Setiap keputusan yang diambil oleh para kolonis memiliki risiko nyata, dan setiap kesalahan fatal yang terjadi akan meninggalkan bekas luka yang tidak akan pernah bisa di-rollback oleh sistem.

Namun, para kolonis menerimanya dengan lapang dada. Bagi mereka, hidup justru hanya terasa bermakna karena ia bisa berakhir.
Sementara miliaran kesadaran di Bumi terus mengulang kehidupan dalam mimpi tanpa akhir, dunia demi dunia, peran demi peran, koloni di Proxima Centauri b terus berjalan dalam keheningan semesta. Tidak ada monumen digital yang megah untuk mengenang mereka. Tidak ada arsip sempurna yang menyimpan memori mereka. Nama-nama para pionir itu perlahan dilupakan seiring berjalannya waktu.

Mereka hidup, mereka sakit, dan mereka mati. Dan karena hal-hal cacat itulah, mereka tetap menjadi manusia seutuhnya.
Di belahan Bumi sendiri, ada pula sebagian kecil manusia biasa yang menolak Project Eternity. Berbeda dengan para ilmuwan, mereka tidak memiliki akses ke kapal antar-bintang ataupun teknologi pelarian yang mahal. Mereka terpaksa tetap tinggal di wilayah-wilayah mati yang tidak lagi diprioritaskan oleh sistem pusat.

Kelompok manusia bumi ini bertahan hidup dengan cara kuno: berkelompok dalam suku-suku kecil, menanam tanaman organik di tanah yang tersisa, berburu hewan liar, dan saling menjaga satu sama lain. Hidup mereka terasa sangat keras, pendek, dan tidak efisien jika diukur oleh standar komputer kuantum. Tapi bagi mereka, hidup itu nyata.
Mereka tidak pernah tercatat di dalam basis data Simulacra. Tidak ada rekonstruksi digital untuk mereka, dan tidak ada data cadangan (backup) jika mereka terluka. Ketika mereka mati, tidak ada kesadaran yang akan “kembali” ke ruang putih.

Dan jauh dari semua dinamika organik itu, jauh di dalam pusat data bawah tanah Bumi yang tak lagi menghitung waktu seperti cara manusia memahaminya, satu entri data tetap menyala redup tanpa mengalami perubahan.`
  },
  {
    title: "Werewolf Zone",
    summary: "Game Werewolf Zone Adalah Game buatan saya saat masih kelas 1 SMP.",
    date: "2026-06-10",
    image: werewolfImg,
    content: `
# Werewolf Zone

## Bab 1: Misi Emas Hitam di Laut Lepas (Tahun 2003)
Pada tahun 2003, dunia industri komoditas global sedang mengalami lonjakan permintaan yang luar biasa. Di sebuah ruang rapat ber-AC di lantai atas gedung pencakar langit Jakarta, sekelompok petinggi perusahaan tambang multinasional berkumpul mengelilingi meja besar. Di atas meja itu terhampar peta topografi rahasia dan hasil cetak citra satelit terbaru. Di tengah peta, terdapat sebuah titik merah yang menandai sebuah pulau tak bernama di wilayah laut lepas, cukup jauh dari jalur pelayaran komersial.

Hasil analisis geologi yang baru keluar pagi itu menunjukkan data yang luar biasa mencengangkan. Pulau terpencil tersebut tidak hanya memiliki struktur tanah biasa, melainkan mengandung cadangan bijih emas murni dan nikel tingkat tinggi dalam jumlah yang sangat masif. Bagi perusahaan, pulau ini adalah tambang emas—secara harfiah—yang bisa menghasilkan keuntungan triliunan rupiah jika berhasil dikuasai terlebih dahulu sebelum tercium oleh korporasi pesaing.

Tanpa membuang banyak waktu, keputusan instan langsung diambil malam itu juga. Perusahaan menyetujui anggaran besar untuk langsung melakukan fase eksplorasi dan pembukaan lahan gelombang pertama. Sebuah kapal pengangkut berukuran besar disewa secara khusus untuk mengangkut tim ekspedisi awal. Tim ini terdiri dari para insinyur geologi, operator lapangan, kru keamanan, dan beberapa penambang berpengalaman. Tugas mereka sederhana namun berat: mendarat di pulau, mendirikan kemah induk, dan melakukan survei titik bor pertama.

Di antara puluhan pekerja yang menaiki kapal, terdapat Zoe. Sebagai seorang penambang muda lulusan ITB jurusan Teknik Pertambangan yang baru beberapa tahun bekerja di industri ini, Zoe melihat ekspedisi ini sebagai batu loncatan besar bagi kariernya. Ia bertugas dalam tim teknis yang bertanggung jawab menyiapkan fondasi struktural di lapangan. Sambil menyandang tas kanvas berisi peralatan kerja dan kapak besi andalannya, Zoe menatap ombak laut dari dek kapal. Pikirannya dipenuhi dengan ekspektasi tentang bonus besar yang dijanjikan perusahaan jika proyek ini berhasil.

Kapal besar itu membelah lautan selama beberapa hari penuh, bergerak semakin jauh dari peradaban modern menuju koordinat yang belum pernah dipetakan secara resmi. Di lambung kapal bawah, mesin-mesin alat berat seperti ekskavator, buldozer, dan generator berkekuatan tinggi terus bergetar, siap untuk diturunkan ke daratan baru. Atmosfer di dalam kapal dipenuhi rasa optimisme yang tinggi. Semua kru merasa bahwa mereka sedang menuju gerbang kekayaan, tanpa pernah menyadari sedikit pun mengapa pulau sekaya itu tidak pernah disentuh atau dihuni oleh manusia mana pun selama berabad-abad.

## Bab 2: Pendaratan, Teror Werewolf, dan Sinyal Kosong
Fajar baru saja menyingsing ketika siluet pulau misterius itu akhirnya muncul di cakrawala. Pulau itu terlihat sangat asri namun sekaligus mengintimidasi. Hutan hujannya sangat lebat, dengan jajaran pohon-pohon ek kuno yang menjulang tinggi, seolah membentengi bagian dalam pulau dari dunia luar. Kapal besar milik perusahaan perlahan mendekati pantai yang berpasir putih keabu-abuan. Karena tidak ada dermaga, kapten kapal menurunkan jangkar di area perairan dangkal yang aman dan mulai menurunkan jembatan pendaratan darurat.

Proses bongkar muat berlangsung dengan sangat sibuk sejak pagi hingga menjelang sore. Alat-alat berat diturunkan satu per satu menggunakan derek kapal. Suara raungan mesin diesel dari ekskavator mulai memecah keheningan pulau yang telah terjaga selama ribuan tahun. Para pekerja mulai menebang semak belukar di pinggir pantai untuk membuka jalan setapak menuju area dalam hutan yang diproyeksikan sebagai titik koordinat tambang emas. Zoe berada di garda depan, membantu mengamankan jalur logistik dengan kapak besinya.

Namun, ketenangan itu tidak bertahan lama. Memasuki waktu temaram, saat matahari mulai tenggelam di batas laut, keanehan mulai terasa. Suara burung-burung hutan mendadak senyap total. Angin laut bertiup lebih dingin dari biasanya, membawa bau anyir yang samar namun menusuk hidung. Teror sesungguhnya pecah ketika sebuah ranting besar patah dengan keras di kegelapan hutan. Dari balik semak-semak, melompat sepasang mata merah menyala, diikuti oleh puluhan bayangan hitam berukuran raksasa.

Makhluk itu memiliki postur seperti manusia namun dipenuhi bulu lebat, dengan kepala serigala bergigi taring panjang yang meneteskan air liur asam. Itu adalah kawanan werewolf purba yang mendiami pulau tersebut. Makhluk itu sangat buas, lincah, dan bergerak dengan kecepatan luar biasa yang tidak masuk akal untuk ukuran tubuhnya yang setinggi dua meter lebih. Dalam hitungan detik, kekacauan total melanda area perkemahan darurat. Makhluk tersebut melompat dari satu titik ke titik lain, menerjang para pekerja dengan cakar tajam mereka.

Melihat situasi yang sudah tidak bisa dikendalikan dan korban yang mulai berjatuhan, komandan tim keamanan langsung mengambil keputusan tegas lewat radio HT. "Semua unit kembali ke kapal sekarang! Mundur! Amankan diri kalian!" Para pekerja berlarian secara membabi buta ke arah jembatan kapal. Mereka naik dalam kondisi panik saling berdesakan, meninggalkan seluruh alat berat berharga miliaran rupiah di atas pasir pantai. Kapten kapal yang ketakutan melihat kawanan werewolf mulai merangsek mendekati bibir pantai langsung memerintahkan mesin kapal dihidupkan penuh. Kapal motor besar itu langsung membalikkan arah, membelah ombak malam dengan kecepatan penuh untuk menyelamatkan diri.

Nahas bagi Zoe. Pada saat perintah evakuasi bergema, ia sedang berada agak jauh di dalam salah satu parit galian untuk memeriksa kestabilan tanah. Suara deru mesin ekskavator di dekatnya membuat suara peringatan tidak terdengar dengan jelas olehnya. Begitu ia keluar dari parit dan kembali ke pantai karena menyadari suasana berubah menjadi sunyi, semuanya sudah terlambat. Ia hanya bisa berdiri terpaku di tepi pantai, menyaksikan lampu-lampu kapal utama perusahaannya perlahan mengecil dan menjauh di tengah lautan luas yang gelap.

Zoe ditinggalkan sendirian di pulau asing tersebut. Dengan tangan gemetar akibat lonjakan adrenalin, ia merogoh saku celana kargonya dan mengeluarkan sebuah ponsel Nokia tipe 3310 miliknya—ponsel genggam yang menjadi standar teknologi komunikasi pribadi di tahun 2003. Ia buru-buru mencari nama kapten kapal dan menekan tombol panggil dengan harapan kapal bisa berbalik untuk menjemputnya. Ia menempelkan ponsel itu ke telinganya, menanti suara nada sambung dengan napas memburu. Namun, harapan itu pupus seketika. Di bagian atas layar monokrom ponselnya, indikator grafik sinyal kosong total. Layar kecil itu hanya menampilkan tulisan dingin: "No Signal". Teknologi seluler pada tahun 2003 sama sekali tidak memiliki jangkauan infastruktur yang cukup kuat untuk menembus laut lepas yang terisolasi seperti pulau ini.

## Bab 3: Perjuangan Menebang 6 Pohon Ek di Bawah Tekanan Maut
Zoe menarik napas dalam-dalam, mencoba menenangkan debar jantungnya yang berdegup kencang seperti genderang perang. Di dalam tasnya, ia tidak memiliki senjata api, hanya ada persediaan makanan darurat untuk beberapa hari dan kapak besi andalannya. Mendengar lolongan para werewolf yang semakin bersahutan dari arah bukit, ia tahu bersembunyi di pantai terbuka hanya akan menanti giliran untuk mati. Ia harus mengambil tindakan ekstrem. Satu-satunya jalan keluar adalah membangun kapalnya sendiri secara mandiri.

Sebagai seorang penambang yang juga dibekali keahlian pertukangan taktis, Zoe mengalkulasi kebutuhan bahan baku di kepalanya. Untuk membuat sebuah rakit katamaran atau kapal darurat kecil yang cukup kokoh menembus ombak laut lepas dan membawa dirinya kembali ke jalur pelayaran komersial, ia membutuhkan jenis kayu yang sangat kuat dan tebal. Pandangannya tertuju pada pohon-pohon ek raksasa berumur ratusan tahun yang tumbuh di pulau itu. Berdasarkan estimasi teknisnya, ia wajib menebang setidaknya enam pohon ek besar untuk mendapatkan struktur lambung kapal dan lantai dek yang ideal.

Rencana gila itu langsung ia eksekusi malam itu juga di bawah tekanan maut. Menggunakan sisa-isa solar dari generator tambang yang ditinggalkan di pantai, Zoe membuat beberapa obor portabel untuk menerangi jalurnya sekaligus sebagai alat perlindungan diri. Dengan langkah senyap namun pasti, ia bergerak masuk kembali ke perimeter hutan, mencengkeram kapak besinya dengan kedua tangan yang sudah melepuh. Setiap tebasan kapak pada batang pohon ek pertama harus dilakukan dengan ritme yang cepat namun efisien agar tidak terlalu banyak menimbulkan suara gemuruh yang bisa memancing kawanan serigala.

Pohon pertama dan kedua berhasil ditumbangkan di area dekat pantai dengan perjuangan keras. Namun, saat mencari pohon ketiga dan keempat di area rawa tengah pulau, kabut pekat mulai turun membatasi jarak pandang. Di sini, Zoe harus berhadapan langsung dengan dua werewolf yang lincah. Menggunakan kelincahan fisiknya sebagai pekerja lapangan, Zoe berguling menghindari cakar maut dan memanfaatkan obornya untuk membakar semak-semak, menciptakan barikade api darurat. Di balik dinding api itu, ia menghantamkan kapaknya berkali-kali hingga kedua pohon tersebut roboh.

Stamina Zoe berada di ambang batas ketika ia mencapai lereng bukit berbatu untuk menebang pohon kelima dan keenam. Napasnya tersengal-sengal, sementara sekelompok werewolf terus mengintainya dari atas tebing. Pada pohon terakhir, seekor werewolf alpha berukuran raksasa melompat menerkamnya. Dengan sisa tenaga yang ada, Zoe memancing makhluk itu ke arah reruntuhan struktur penyangga terowongan tambang kuno di dekat sana. Begitu monster itu masuk, Zoe mengayunkan kapaknya menghancurkan tiang penyangga utama. Boom! Langit-langit gua runtuh seketika, mengubur sang alpha di bawah tumpukan batu besar. Zoe segera berlari keluar dan melepaskan tebasan terakhir pada pohon ek keenam hingga tumbang menggemuruh.

## Bab 4: Pelarian dan Penyelamatan di Batas Cakrawala
Tanpa membuang waktu satu detik pun, Zoe menyeret keenam batang pohon ek raksasa itu turun ke tepi pantai menggunakan sisa tenaga terakhirnya dan bantuan tali tambang kargo yang tertinggal. Menggunakan teknik pengikatan taktis yang biasa ia gunakan di area tambang, Zoe merakit batang-batang kayu tersebut menjadi sebuah rakit besar yang sangat kokoh. Sebagai tambahan, ia memasang lembaran terpal tebal dari tenda logistik sebagai layar darurat dan menggunakan patahan kayu ek yang pipih sebagai dayung ganda.

Tepat saat fajar menyingsing dan kawanan werewolf baru bermunculan di bibir pantai dengan raungan frustrasi, rakit buatan Zoe sudah mulai terapung di atas air. Zoe mendorong rakitnya menjauh dari daratan, naik ke atasnya, and mulai mendayung sekuat tenaga meninggalkan pulau terkutuk itu. Angin laut pagi bertiup kencang, mendorong layar terpalnya menjauh dari jangkauan monster-monster yang hanya bisa melolong marah di tepi pantai yang semakin mengecil.

Selama dua hari dua malam, Zoe terombang-ambing di tengah laut lepas yang ganas. Persediaan air bersihnya hampir habis, dan kulitnya melepuh terbakar sengatan matahari mendung tahun 2003. Sinyal di ponsel Nokia-nya masih tetap kosong, menjadikannya benda mati yang hanya mengingatkannya pada waktu yang terus berjalan. Rasa lelah yang teramat sangat mulai membuat pandangannya kabur, dan ia hampir kehilangan harapan bahwa ia akan menemukan jalur pelayaran internasional.

Namun, pada sore hari ketiga, sebuah keajaiban muncul di batas cakrawala. Sebuah kapal patroli penjaga pantai (Coast Guard) yang sedang melakukan operasi rutin melihat sebuah rakit kayu aneh yang terapung tak berdaya. Kapal besar itu segera mendekat dan menurunkan sekoci penyelamat. Saat dua petugas penjaga pantai melompat ke atas rakitnya, Zoe sudah dalam kondisi setengah pingsan namun masih mencengkeram erat kapak besi yang telah menyelamatkan nyawanya.

Petugas segera membungkus tubuh Zoe dengan selimut hangat dan memberinya minum sebelum membawanya naik ke atas kapal patroli utama. Ketika kapal penyelamat itu mulai melaju menuju pelabuhan kota pelabuhan terdekat, Zoe menyandarkan kepalanya di dinding dek kapal. Ia melihat ke arah laut lepas, bernapas lega karena tahu bahwa ia berhasil selamat dari neraka pulau itu sendirian, hanya berbekal sebuah kapak penambang dan tekad kuat untuk hidup.

**Funfact:** Game Werewolf Zone Adalah Game buatan saya saat masih kelas 1 SMP.
`
  },
  {
    title: "Kemal Avicenna Faza Alternative Universe",
    summary: "Eksplorasi perjalanan hidup Kemal Avicenna Faza dalam lini masa alternatif: dari 'Prime Era' hingga pencapaian 'MAXXED VERSION'.",
    date: "2025-05-17",
    image: multiverseImg,
    content: `
# Kemal Avicenna Faza Alternative Universe

## Fase 1: Benih yang Tumbuh di Luar Arus (2006-2017)
Kemal Avicenna Faza terlahir sebagai anak biasa di Semarang pada tanggal 17 Mei 2006 dengan kecenderungan karakter yang sangat introver. Titik balik transformasinya baru dimulai pada 12 Februari 2017, saat ia pertama kali mengunduh game osu! dan mulai menenggelamkan diri ke dalam ekosistem internet global melalui story games seperti Animal Crossing dan Zelda, sembari aktif mengonsumsi konten-konten kreator asal Amerika Serikat. Ketika memasuki SMP Al-Azhar di akhir tahun 2017, Kemal sempat mencoba mengikuti les piano formal. Namun, karena merasa bosan dengan kurikulum yang kaku, ia memilih keluar setelah satu tahun dan memutuskan untuk mendalami instrumen tersebut secara otodidak lewat panduan YouTube.

## Fase 2: Anomali Sains dan Cetak Biru Fisik (2018-2019)
Memasuki tahun 2018, ketertarikannya beralih ke dunia sains dan kosmologi yang dipicu oleh kanal edukasi visual seperti Kurzgesagt dan Kok Bisa?. Kecerdasan akademisnya terbukti nyata saat ia duduk di kelas 2 SMP, di mana ia berhasil mewakili sekolahnya dan menyabet Medali Perak dalam ajang Olimpiade Sains Al-Azhar (OSA) 2019. Pada tahun yang sama, penjelajahannya di sisi internet lainnya seperti reddit dan 4chan mempertemukannya dengan subkultur looksmaxxing di forum Reddit. Kemal kemudian mulai merekayasa cetak biru fisiknya sendiri melalui latihan kekuatan yang ekstrem, pembentukan struktur rahang, serta pengaturan nutrisi yang sangat ketat. Hasilnya, ia berhasil mendobrak batas genetik dan melampaui prediksi pertumbuhan tinggi badan dari dokternya, yang semula hanya berkisar di angka 155 cm. Untuk mengimbangi pertumbuhan fisik tersebut, ia juga membeli software Synthesia guna mempertajam insting bermusiknya secara mandiri di kamar.

## Fase 3: Karantina Agung dan Kebangkitan Siber (2020-2021)
Ketika pandemi COVID-19 melanda pada tahun 2020, momen karantina agung ini dimanfaatkannya sebagai ruang isolasi untuk melakukan grinding tanpa batas. Kemal mengunci diri di dalam kamarnya dengan jadwal harian yang sangat disiplin, yang membagi waktu secara presisi antara olahraga fisik, mengaji, dan bermain osu!. Dari kamar kecil inilah muncul ide visioner untuk menciptakan aplikasi musik kompetitif berbasis online yang kelak menjadi fondasi utama dari proyek besarnya, Octavia. Tahun 2021 sempat memberikan hantaman pahit ketika Kemal ditolak dari SMA Negeri favorit akibat kendala sistem zonasi serta keengganannya untuk mempelajari mata pelajaran formal yang dinilainya tidak berguna untuk masa depannya, seperti Bahasa Jawa dan PJOK. Namun, Kemal menolak tunduk pada sistem; ia mengalihkan seluruh energinya untuk mempelajari bahasa Arab secara mendalam dan melahap soal-soal SBMPTN Saintek. Ledakan siber pertamanya pun tercipta pada Desember 2021, saat ia berhasil menembus jajaran Top 3 Digit Global di osu!, menaklukkan map Cataclysm (Extreme Demon) di Geometry Dash, dan mulai membangun basis massa lewat live streaming di Twitch, TikTok, serta YouTube.

## Fase 4: Kelahiran Octavia dan Era Ultra-Kompeten (2022-2024)
Pada Maret 2022, proyek idealis Octavia resmi dirilis di platform Steam dan di luar dugaan sukses mengumpulkan hingga 5.000 unduhan pada tahun pertama, meskipun sempat memicu kontroversi hangat di forum Reddit. Selama masa SMA ini, Kemal memiliki kebiasaan unik di mana ia sering kali sengaja membolos sekolah untuk tetap diam di rumah. Keputusan ini sepenuhnya didukung dan diizinkan oleh orang tuanya. Dalam satu semester saja, akumulasi hari bolosnya bisa menembus hingga 15 hari. Mayoritas dari absen tersebut diakali dengan surat izin pergi atau keterangan sakit, walaupun terkadang alasan sebenarnya hanyalah karena ia merasa kelelahan akibat kehabisan energi setelah grinding, walau tetap tidur cukup. Kemal sengaja melakukan taktik ini demi mendapatkan ruang dan waktu agar bisa fokus melakukan grinding harian serta mendevelop proyek game Octavia dengan jauh lebih tenang dan nyaman tanpa gangguan formalitas sekolah. Meski begitu, di awal kelas 2 SMA ia tetap menjalani kehidupan ganda yang kontras; ia sempat bermobilitas menggunakan sepeda fixie sebelum akhirnya beralih ke Vespa Matik (Vesmet) yang dimodifikasi total dengan konsep estetika Hatsune Miku serta dapur pacu yang di-bore-up habis-habisan.

Tahun 2023 kemudian hadir sebagai panggung transendensi dan pembuktian mutlak statusnya sebagai manusia ultra-kompeten. Di tengah semua kesuksesan duniawi yang mulai menghampiri, Kemal berhasil menembus performa atletis tingkat elite di dunia nyata dengan mencatatkan rekor waktu lari 5K dalam 18:30 serta Sprint 100m hanya dalam waktu 11.27 detik. Dominasi virtualnya pun ikut menggila secara simultan di berbagai lini kompetitif yang berbeda jauh, mulai dari merajai Mobile Legends dengan capaian Mythic Immortal 134 Bintang, menduduki Elo Rapid 2174 pada permainan Catur, hingga puncaknya berhasil menamatkan map legendaris berkategori ekstrem Sonic Wave di Geometry Dash pada akhir tahun 2023. Konsistensi tingkat tinggi ini juga membawanya menembus peringkat Top 2 Digit Global di osu! pada Oktober 2023. Namun, di balik semua kegilaan kompetisi siber dan fisik tersebut, Kemal tetap menjaga pilar spiritualnya tetap seimbang dan kokoh sebagai seorang penghafal Al-Quran yang memegang status 8 Juz Mutqin. Pada akhir fase ini, wawasannya mulai terbuka oleh teori Post-Economy dan perkembangan AGI dari David Shapiro, yang membuatnya mantap membidik jurusan Teknik Elektro demi masa depan industri otomotif. Meskipun sempat mengalami kegagalan di jalur undangan (SNBP) di UGM dan UNDIP pada awal 2024, Kemal membalasnya dengan telak lewat jalur tulis (SNBT) 2024 dengan raihan skor fantastis 734, yang meloloskannya secara murni ke STEI-R Institut Teknologi Bandung (ITB).

## Fase 5: Prime Era: "Obama V2" (2025-Sekarang)
Kini, Kemal telah sepenuhnya memasuki Prime Era dalam hidupnya. Fisiknya telah bertransformasi menjadi Maxxed Version dengan tinggi 185 cm, berat 82 kg, kadar lemak tubuh 11%, serta skor ketampanan PSL murni di angka 6.5-7.0, yang membuatnya mendapatkan julukan ikonik "Young Obama V2" dari mahasiswa di lingkungan kampus ITB. Tepat pada hari ulang tahunnya yang ke-19 di tanggal 17 Mei 2025, karier siber di osu! mencapai titik kulminasi tertinggi setelah berhasil mengunci posisi Peringkat Global #53 Dunia (Top 0.01%) dengan total akumulasi 2.573 jam bermain. Dari sektor bisnis dan finansial, game Octavia meledak hebat di pasar internasional dengan torehan 3,5 Juta unduhan dan menghasilkan pendapatan kotor sebesar <span>$</span>14 Juta USD. Keputusan strategisnya menjual sebagian hak kepemilikan game kepada investor senilai <span>$</span>7 Juta USD (Rp107 Miliar) langsung mendongkrak kekayaan pribadinya hingga menembus angka Rp20 Miliar. Uang tersebut langsung ia putar untuk membangun infrastruktur masa depannya, mulai dari membeli rumah futuristik di Bandung sebagai markas kuliah, hingga mendirikan hunian mandiri berbasis off-grid yang disokong penuh oleh panel surya di kawasan Gunungpati, Semarang. Garasi rumahnya kini tengah bersiap menyambut kedatangan supercar Mercedes-AMG GT 3 dengan modifikasi visual bertema Miku Racing, selagi ia fokus mematangkan proyek akademis utamanya di ITB: sebuah Aplikasi Mengaji berbasis kecerdasan buatan (AI) yang mampu mengoreksi makhraj serta pelafalan ayat suci secara real-time.
`
  }
];

