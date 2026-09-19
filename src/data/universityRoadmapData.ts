/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { UniversityRoadmapCampus } from '../types';

export const universityRoadmapData: UniversityRoadmapCampus[] = [
  // ==========================================
  // COLUMN 1: UGM, UB, TELKOM, UNDIP SAAT INI
  // ==========================================
  {
    id: 'ugm',
    name: 'Universitas Gadjah Mada (UGM)',
    shortName: 'UGM',
    location: 'Yogyakarta',
    column: 1,
    type: 'ptn',
    pathways: [
      {
        name: 'International Undergraduate Program (IUP) Universitas Gadjah Mada',
        shortType: 'IUP',
        choices: [
          {
            type: 'pilihan1',
            label: 'PILIHAN 1',
            major: 'Industrial Engineering',
            degree: 'S1',
            reason: 'Fokus utama pada efisiensi sistem kerja, riset operasional, optimasi rantai pasok (supply chain), dan manajemen pergudangan otomatis. Sangat relevan untuk otomatisasi alur barang, kontrol stok, dan efisiensi di 3 gerai franchise waralaba keluarga.',
            benefits: 'Prestise internasional UGM (peringkat 1 nasional), akreditasi dunia ABET, jejaring alumni elit CEO korporasi, kurikulum berbahasa Inggris penuh, peluang exchange / double degree di luar negeri, serta fondasi manajemen operasional kelas atas.'
          }
        ]
      }
    ]
  },
  {
    id: 'ub',
    name: 'Universitas Brawijaya (UB)',
    shortName: 'UB',
    location: 'Malang',
    column: 1,
    type: 'ptn',
    pathways: [
      {
        name: 'Seleksi Berbasis Prestasi Unggul Berkeadilan (SBUB) - Jalur Rapor Universitas Brawijaya',
        shortType: 'SBUB Rapor',
        choices: [
          {
            type: 'pilihan1',
            label: 'PILIHAN 1',
            major: 'Teknik Industri',
            degree: 'S1',
            reason: 'Memanfaatkan nilai rapor SMA yang kuat di bidang matematika dan fisika untuk menembus Teknik Industri UB; berfokus pada optimasi sistem produksi dan perancangan tata kelola bisnis terintegrasi.',
            benefits: 'Akreditasi Unggul dari BAN-PT dan sertifikasi IABEE, ekosistem laboratorium manufaktur dan ergonomi lengkap, jejaring industri nasional yang solid di Jawa Timur.'
          },
          {
            type: 'pilihan2',
            label: 'PILIHAN 2',
            major: 'Teknik Komputer',
            degree: 'S1',
            reason: 'Alternatif pengaman di bidang hardware-software, berfokus pada arsitektur sistem cerdas, embedded microcontroller, IoT, dan jaringan komputer.',
            benefits: 'Penguasaan hardware cerdas untuk integrasi perangkat IoT mandiri (solar tracker, sensor pintar Airbnb), riset komputasi terapan, dan peluang karir embedded engineer.'
          }
        ]
      }
    ]
  },
  {
    id: 'telkom',
    name: 'Telkom University',
    shortName: 'Telkom University',
    location: 'Bandung',
    column: 1,
    type: 'pts',
    pathways: [
      {
        name: 'Jalur Prestasi Akademik (JPA) Telkom University',
        shortType: 'JPA (Rapor)',
        choices: [
          {
            type: 'pilihan1',
            label: 'PILIHAN 1',
            major: 'Teknik Industri',
            degree: 'S1',
            reason: 'Menggabungkan keilmuan teknik industri modern dengan ekosistem Information & Communication Technology (ICT) terdepan dan otomatisasi proses bisnis digital.',
            benefits: 'Universitas swasta nomor 1 di Indonesia, koneksi langsung ke ekosistem Telkom Group dan BUMN, fasilitas lab industri 4.0 berstandar global, proses seleksi cepat tanpa tes.'
          },
          {
            type: 'pilihan2',
            label: 'PILIHAN 2',
            major: 'Sistem Informasi',
            degree: 'S1',
            reason: 'Fokus pada tata kelola enterprise data, pengembangan sistem informasi terintegrasi, dan pembuatan dasbor visualisasi data bisnis franchise secara real-time.',
            benefits: 'Akreditasi internasional ABET & IABEE, laboratorium enterprise resource planning (SAP/ERP) terlengkap, prospek karir IT Business Analyst dan Data Engineer.'
          }
        ]
      },
      {
        name: 'Ujian Tulis Gelombang (UTG) Telkom University',
        shortType: 'UTG (Tes Tulis)',
        choices: [
          {
            type: 'pilihan1',
            label: 'PILIHAN 1',
            major: 'Teknik Industri',
            degree: 'S1',
            reason: 'Jalur ujian tertulis online/CBT sebagai proteksi cadangan jika jalur rapor belum membuahkan hasil, memastikan tetap memiliki tiket masuk ke prodi prioritas.',
            benefits: 'Fleksibilitas jadwal ujian, peluang beasiswa prestasi parsial jalur tertulis, dan jaminan kurikulum rekayasa industri berorientasi teknologi digital.'
          },
          {
            type: 'pilihan2',
            label: 'PILIHAN 2',
            major: 'Sistem Informasi',
            degree: 'S1',
            reason: 'Jaminan ketersediaan pilihan kedua bidang teknologi informasi terapan dan manajemen sistem komputasi bisnis.',
            benefits: 'Koneksi karir korporat masif, akreditasi Unggul, kesiapan menghadapi transformasi digital enterprise.'
          }
        ]
      }
    ]
  },
  {
    id: 'undip-current',
    name: 'UNDIP — Posisi Saat Ini / Opsi Bertahan',
    shortName: 'UNDIP Bertahan',
    location: 'Semarang (Tembalang)',
    column: 1,
    type: 'current',
    badge: 'Posisi Saat Ini / Opsi Bertahan',
    isCurrentOption: true,
    pathways: [
      {
        name: 'Seleksi Nasional Berdasarkan Prestasi (SNBP)',
        shortType: 'SNBP',
        choices: [
          {
            type: 'current',
            label: 'PROGRAM STUDI SAAT INI',
            major: 'S1 Fisika Universitas Diponegoro',
            degree: 'S1',
            reason: 'Melanjutkan studi yang sudah resmi berjalan tanpa biaya pendaftaran baru atau risiko adaptasi ulang; mengambil Kelompok Bidang Keahlian (KBK) Elektronika dan Instrumentasi (Elins) untuk mendalami instrumentasi fisik, mikrokontroler, dan sensor hardware.',
            benefits: 'Menghemat energi birokrasi kampus, lokasi 100% di Semarang (hemat biaya kos/hidup), fondasi matematika & sains analitis yang kuat, sambil memperdalam ilmu koding IoT, robotika, dan mekanikal secara agresif lewat jalur otodidak serta langsung terlibat aktif dalam pengelolaan aset dan bisnis keluarga.'
          }
        ]
      }
    ]
  },

  // ==========================================
  // COLUMN 2: UNDIP (5 PATHWAYS) & BINUS
  // ==========================================
  {
    id: 'undip',
    name: 'Universitas Diponegoro (UNDIP)',
    shortName: 'UNDIP',
    location: 'Semarang (Tembalang)',
    column: 2,
    type: 'ptn',
    pathways: [
      {
        name: 'International Undergraduate Program (IUP) Universitas Diponegoro',
        shortType: 'IUP',
        choices: [
          {
            type: 'pilihan1',
            label: 'PILIHAN 1',
            major: 'Industrial Engineering',
            degree: 'S1',
            reason: 'Meraih standar pendidikan global dan kurikulum berbahasa Inggris penuh untuk teknik industri dengan keuntungan lokasi tetap di Semarang (pulang-pergi dari rumah).',
            benefits: 'Lingkungan akademik internasional, peluang exchange atau double degree di universitas mitra luar negeri, efisiensi waktu & biaya hidup karena tetap berpusat di Semarang, serta persiapan menjadi pimpinan ekosistem bisnis keluarga.'
          }
        ]
      },
      {
        name: 'Ujian Mandiri Computer Based Test (CBT) Universitas Diponegoro',
        shortType: 'UM CBT',
        choices: [
          {
            type: 'pilihan1',
            label: 'PILIHAN 1',
            major: 'Teknik Elektro',
            degree: 'S1',
            reason: 'Pilihan teknis utama; mendalami teknik arus kuat, elektronika daya, sistem kendali, dan implementasi teknologi Smart Home di unit Airbnb / properti keluarga guna memangkas OPEX listrik. Aman 100% dari ancaman otomasi AI murni karena memiliki komponen fisik lapangan yang kuat.',
            benefits: 'Fakultas Teknik UNDIP terakreditasi Unggul, laboratorium mesin dan tenaga listrik lengkap di Tembalang, prospek profesi Automation / PLC Engineer dengan gaji tinggi di kawasan industri Kendal/Semarang.'
          },
          {
            type: 'pilihan2',
            label: 'PILIHAN 2',
            major: 'Teknik Komputer',
            degree: 'S1',
            reason: 'Opsi pengaman terbaik jika Teknik Elektro tidak tembus; berfokus pada integrasi sistem digital, firmware mikrokontroler, IoT, dan perancangan jaringan komputer cerdas.',
            benefits: 'Keahlian terpadu antara hardware dan software, relevan untuk perakitan sistem energi cerdas rumah off-grid, dan prospek karir embedded systems engineer.'
          }
        ]
      },
      {
        name: 'Ujian Mandiri Jalur Kemitraan Universitas Diponegoro',
        shortType: 'UM Kemitraan',
        choices: [
          {
            type: 'pilihan1',
            label: 'PILIHAN 1',
            major: 'Teknik Industri',
            degree: 'S1',
            reason: 'Memaksimalkan peluang masuk Teknik Industri UNDIP melalui kuota jalur kemitraan kerja sama institusi, memperbesar peluang penerimaan di prodi manajemen operasional prioritas.',
            benefits: 'Probabilitas lolos lebih tinggi tanpa bertumpu pada jalur reguler murni, kurikulum dan status ijazah 100% setara jalur mandiri umum, lokasi strategis di Tembalang Semarang.'
          },
          {
            type: 'pilihan2',
            label: 'PILIHAN 2',
            major: 'Teknik Komputer',
            degree: 'S1',
            reason: 'Cadangan strategis di jalur kemitraan untuk mengamankan kursi di bidang rekayasa komputer dan sistem digital.',
            benefits: 'Double-guarding untuk bidang teknologi komputer di kampus negeri terbaik Semarang.'
          }
        ]
      },
      {
        name: 'Ujian Mandiri Program Vokasi Universitas Diponegoro',
        shortType: 'UM Vokasi',
        choices: [
          {
            type: 'pilihan1',
            label: 'PILIHAN 1',
            major: 'D4 Teknologi Rekayasa Otomasi (TRO)',
            degree: 'D4',
            reason: 'Titik temu paling ideal antara koding praktis, machine learning terapan, robotika industri, dan sistem PLC mesin pabrik. Berorientasi 70% praktik lapangan langsung guna mengincar posisi IT & Inovasi di kantor pusat retail atau Automation Engineer manufaktur.',
            benefits: 'Kurikulum terapan berstandar IABEE, fasilitas laboratorium otomasi Sekolah Vokasi UNDIP yang super canggih, sertifikasi kompetensi industri resmi BNSP, lulusan langsung terserap pasar kerja tanpa masa tunggu panjang.'
          },
          {
            type: 'pilihan2',
            label: 'PILIHAN 2',
            major: 'D4 Manajemen dan Administrasi Logistik (MAL)',
            degree: 'D4',
            reason: 'Spesialisasi tata kelola rantai pasok (supply chain management), pergudangan modern, alur distribusi barang skala besar, dan optimasi stok gerai waralaba.',
            benefits: 'Keahlian terapan yang langsung dapat diaplikasikan 1:1 pada audit stok dan ekspansi 3 gerai franchise keluarga, sertifikasi profesi logistik nasional.'
          }
        ]
      },
      {
        name: 'Ujian Mandiri Program Vokasi Jalur Kemitraan Universitas Diponegoro',
        shortType: 'UM Vokasi Kemitraan',
        choices: [
          {
            type: 'pilihan1',
            label: 'PILIHAN 1',
            major: 'D4 Teknologi Rekayasa Otomasi (TRO)',
            degree: 'D4',
            reason: 'Mengoptimalkan kuota kemitraan vokasi untuk menjamin kepastian mendapatkan kursi di prodi D4 TRO.',
            benefits: 'Maksimalisasi peluang tembus ke program vokasi rekayasa otomasi favorit Jawa Tengah.'
          },
          {
            type: 'pilihan2',
            label: 'PILIHAN 2',
            major: 'D4 Manajemen dan Administrasi Logistik (MAL)',
            degree: 'D4',
            reason: 'Opsi kedua jalur kemitraan vokasi untuk penguatan di bidang manajemen rantai pasok dan pergudangan.',
            benefits: 'Jalur pengaman ekstra yang menjamin kelanjutan studi logistik terapan di Semarang.'
          }
        ]
      }
    ]
  },
  {
    id: 'binus',
    name: 'BINUS University Semarang',
    shortName: 'BINUS Semarang',
    location: 'Semarang (POJ City)',
    column: 2,
    type: 'pts',
    pathways: [
      {
        name: 'Tes Potensi Keberhasilan Studi (TPKS) BINUS University Semarang',
        shortType: 'TPKS',
        choices: [
          {
            type: 'pilihan1',
            label: 'PILIHAN 1',
            major: 'Smart Industrial Engineering',
            degree: 'S1',
            reason: 'Kurikulum inovatif yang secara khusus menyatukan teknik industri dengan teknologi Smart Factory, Industrial IoT, AI Analytics, dan otomatisasi manufaktur generasi baru, berlokasi sangat modern di kawasan POJ City Semarang.',
            benefits: 'Kampus berstandar internasional terakreditasi Unggul, program unggulan 2+1+1 (magang 1 tahun penuh di korporasi multinasional), fasilitas super mutakhir, dekat dari rumah, jejaring karir global.'
          }
        ]
      }
    ]
  },

  // ==========================================
  // COLUMN 3: ITS, UNNES, UDINUS
  // ==========================================
  {
    id: 'its',
    name: 'Institut Teknologi Sepuluh Nopember (ITS)',
    shortName: 'ITS',
    location: 'Surabaya',
    column: 3,
    type: 'ptn',
    pathways: [
      {
        name: 'Seleksi Mandiri Institut Teknologi Sepuluh Nopember - Jalur Ujian Tulis',
        shortType: 'SM Mandiri Ujian Tulis',
        choices: [
          {
            type: 'pilihan1',
            label: 'PILIHAN 1',
            major: 'Teknik Industri',
            degree: 'S1',
            reason: 'Mengincar prodi Teknik Industri di institut teknologi terbaik Indonesia Timur; fokus pada riset operasional, optimasi sistem rantai pasok, ergonomi, dan sistem manufaktur kelas berat.',
            benefits: 'Reputasi nomor 1 teknologi di Jawa Timur, akreditasi internasional ABET, jejaring alumni industri nasional dan multinasional paling solid, daya tawar korporasi sangat tinggi.'
          },
          {
            type: 'pilihan2',
            label: 'PILIHAN 2',
            major: 'Teknik Elektro',
            degree: 'S1',
            reason: 'Departemen legendaris ITS dengan riset robotika otomasi juara dunia; fokus pada sistem tenaga listrik, kontrol instrumen industri, dan hardware cerdas.',
            benefits: 'Pusat riset robotika terbaik di Asia Tenggara (juara kontes robot nasional & internasional), fasilitas lab kendali berstandar dunia, kualifikasi teknik elektro diakui industri global.'
          }
        ]
      },
      {
        name: 'Seleksi Mandiri Institut Teknologi Sepuluh Nopember - Jalur Kemitraan',
        shortType: 'SM Kemitraan',
        choices: [
          {
            type: 'pilihan1',
            label: 'PILIHAN 1',
            major: 'Teknik Komputer',
            degree: 'S1',
            reason: 'Memanfaatkan kuota kemitraan instansi resmi untuk menembus persaingan ketat Departemen Teknik Komputer ITS; memperdalam arsitektur komputasi, kecerdasan buatan terapan, dan sistem cerdas.',
            benefits: 'Peluang penerimaan lebih terarah lewat jalur kemitraan korporat, kurikulum mendalam sistem hardware-software dan keamanan komputasi modern.'
          },
          {
            type: 'pilihan2',
            label: 'PILIHAN 2',
            major: 'Teknik Elektro',
            degree: 'S1',
            reason: 'Cadangan jalur kemitraan untuk Teknik Elektro ITS, melipatgandakan peluang diterima di departemen elektro ITS yang bereputasi tinggi.',
            benefits: 'Akses jalur kemitraan ke salah satu departemen teknik elektro terbaik di Indonesia.'
          }
        ]
      }
    ]
  },
  {
    id: 'unnes',
    name: 'Universitas Negeri Semarang (UNNES)',
    shortName: 'UNNES',
    location: 'Semarang (Gunungpati)',
    column: 3,
    type: 'ptn',
    pathways: [
      {
        name: 'Seleksi Mandiri Universitas Negeri Semarang - Jalur Ujian Tulis',
        shortType: 'SM Ujian Tulis',
        choices: [
          {
            type: 'pilihan1',
            label: 'PILIHAN 1',
            major: 'Sistem Informasi',
            degree: 'S1',
            reason: 'Fokus pada tata kelola sistem enterprise dan rekayasa platform data bisnis; lokasi kampus di Gunungpati sangat dekat dengan proyek rumah off-grid masa depan dan mudah dijangkau dari rumah.',
            benefits: 'Biaya pendidikan PTN yang ekonomis, efisiensi mobilitas harian tanpa perlu kos, kurikulum sistem informasi bisnis yang aplikatif dan terus berkembang.'
          },
          {
            type: 'pilihan2',
            label: 'PILIHAN 2',
            major: 'Teknik Elektro',
            degree: 'S1',
            reason: 'Alternatif studi teknik kelistrikan dan instrumentasi di PTN Semarang dengan akses logistik harian mudah dan praktis.',
            benefits: 'Penguasaan kompetensi dasar elektronika, kendali dasar, dan sistem tenaga listrik di Semarang.'
          }
        ]
      },
      {
        name: 'Seleksi Mandiri Universitas Negeri Semarang - Jalur Prestasi',
        shortType: 'SM Jalur Prestasi',
        choices: [
          {
            type: 'pilihan1',
            label: 'PILIHAN 1',
            major: 'Sistem Informasi',
            degree: 'S1',
            reason: 'Mengoptimalkan portofolio proyek perangkat lunak nyata (pengembangan website octaviapiano.com, Chrome extension, dan aplikasi web) untuk lolos tanpa tes tertulis.',
            benefits: 'Jalur masuk berbasis validasi portofolio teknologi nyata, proses seleksi non-tes yang efisien, kepastian studi di PTN Semarang.'
          },
          {
            type: 'pilihan2',
            label: 'PILIHAN 2',
            major: 'Teknik Elektro',
            degree: 'S1',
            reason: 'Opsi kedua jalur prestasi untuk mengamankan kursi di fakultas teknik UNNES.',
            benefits: 'Pemanfaatan prestasi dan keunggulan sains SMA untuk masuk prodi teknik di PTN Semarang.'
          }
        ]
      }
    ]
  },
  {
    id: 'udinus',
    name: 'Universitas Dian Nuswantoro (UDINUS)',
    shortName: 'UDINUS',
    location: 'Semarang (Imam Bonjol)',
    column: 3,
    type: 'pts',
    pathways: [
      {
        name: 'Penelusuran Minat dan Kemampuan (PMDK) Universitas Dian Nuswantoro',
        shortType: 'PMDK (Rapor)',
        choices: [
          {
            type: 'pilihan1',
            label: 'PILIHAN 1',
            major: 'Sistem Informasi',
            degree: 'S1',
            reason: 'UDINUS merupakan kiblat dan pionir kampus IT swasta terakreditasi Unggul di Semarang, memiliki keunggulan kurikulum enterprise system, business intelligence, dan digital solution.',
            benefits: 'Akreditasi institusi dan prodi Unggul, lokasi strategis di pusat kota Semarang (Imam Bonjol), fasilitas laboratorium komputer super modern, kultur startup dan koding IT yang sangat aktif, fleksibilitas tinggi untuk sinkronisasi proyek bisnis keluarga.'
          }
        ]
      }
    ]
  }
];
