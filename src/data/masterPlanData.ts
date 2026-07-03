/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MasterPlanData } from '../types';

export const masterPlanData: MasterPlanData = {
  profile: {
    name: "Kemal Avicenna Faza",
    domisili: "Semarang, Jawa Tengah",
    kelebihan: "Nilai Matematika dan Fisika yang kuat saat SMA.",
    proyek: [
      "Pembuat situs web: octaviapiano.com",
      "Pembuat Ekstensi Chrome: Custom Web Background"
    ]
  },
  interests: [
    "Teknologi: Koding (dengan bantuan AI), Machine Learning, AI.",
    "Fisik & Mekanikal: Robotika (Arduino) dan servis barang (maintenance).",
    "Gaya Hidup: Konsep hidup mandiri secara energi dan pangan (off-grid)."
  ],
  education: {
    s1: [
      {
        title: "Plan A (Insinyur Serba Bisa)",
        campus: "S1 Teknik Elektro Telkom University (Tel-U)",
        strategy: "Lulus dalam 3.5 tahun (7 semester) dengan memaksimalkan Transfer SKS dari kuliah lama dan menjaga IPK >3.25.",
        perks: "Memilih kos bagus akses dekat ke gedung FTE, fasilitas Wi-Fi untuk koding/game ritme."
      },
      {
        title: "Plan B (Jalur Makro Global)",
        campus: "S1 Teknik Industri IUP ITB",
        strategy: "Memanfaatkan persiapan IELTS/TOEFL dan tes skolastik (SAT/TPA) untuk menembus seleksi kelas internasional ITB.",
        perks: "Prestise ITB, paparan global, kurikulum teknik + manajemen operasional (persiapan CEO)."
      },
      {
        title: "Plan C (Praktik Lapangan Terfokus)",
        campus: "D4 Teknologi Rekayasa Otomasi (TRO) SV UNDIP",
        strategy: "Pindah internal kampus melalui jalur seleksi resmi ke program Sarjana Terapan.",
        perks: "Kurikulum berbasis 70% praktik lapangan, sertifikasi IABEE, fokus robotika/IoT (100% Semarang)."
      },
      {
        title: "Plan D (Jalur Bertahan & Otodidak)",
        campus: "S1 Fisika FSM UNDIP",
        strategy: "Lanjutkan studi yang sudah berjalan, masuk KBK Elektronika dan Instrumentasi (Elins).",
        perks: "Hemat energi birokrasi, belajar koding IoT & mekanikal agresif secara otodidak."
      }
    ],
    s2: [
      {
        title: "Plan A (Jangkar Bisnis Global)",
        campus: "MBA UGM Kelas Eksekutif Akhir Pekan",
        strategy: "Akreditasi global AACSB, gelar M.B.A internasional, jaringan elit CEO nasional.",
        perks: "Mobilitas dari Semarang via Tol/Kereta setiap akhir pekan."
      },
      {
        title: "Plan B (Jangkar Bisnis Lokal)",
        campus: "Magister Manajemen (MM) FEB UNDIP Eksekutif",
        strategy: "Efisiensi lokasi 100% Semarang, akreditasi internasional FIBAA.",
        perks: "Kuat dalam materi portofolio keuangan dan bursa saham."
      }
    ]
  },
  career: {
    targetGaji: "Di atas Rp8.000.000,- per bulan (Fresh Graduate).",
    lokasi: "Tetap berpusat di Semarang (Bisa pulang-pergi ke rumah).",
    karakter: "Memiliki komponen fisik lapangan yang kuat agar 100% aman dari otomatisasi AI.",
    tujuanAkhir: "CEO Ekosistem bisnis Ayah (Hibrida Tekno-Finansial: Elektro + MBA)."
  },
  familyBusiness: {
    retail: "3 gerai waralaba (Alfamart/Indomaret) & kemitraan lainnya.",
    properti: "Airbnb (harian), apartemen, & rumah kontrakan (bulanan).",
    finansial: "Pengelolaan portofolio saham fisik."
  },
  recommendations: [
    {
      title: "Automation / PLC Engineer",
      reason: "Merakit program (koding/ML) untuk menggerakkan mesin fisik (robotika/Arduino) di pabrik.",
      salary: "> Rp8 - 12 Juta"
    },
    {
      title: "IoT & Embedded Systems Developer",
      reason: "Hardware pintar + koding AI. Berguna untuk keahlian off-grid (misal: panel surya otomatis).",
      salary: "> Rp8 Juta"
    },
    {
      title: "Pakar Logistik & Supply Chain AI",
      reason: "Mengatur arus barang fisik di gudang. Jembatan operasional menuju kendali waralaba Ayah.",
      salary: "> Rp8 Juta"
    }
  ],
  integration: [
    {
      phase: "Fase 1 (Usia 20-an)",
      title: "Penguatan Finansial & Teknis",
      description: "Bekerja sebagai Automation Engineer di Semarang. Mulai investasi saham bimbingan Ayah."
    },
    {
      phase: "Fase 2 (Mid 20-an)",
      title: "Digitalisasi Aset & S2",
      description: "MBA UGM / MM UNDIP. Digitalisasi unit Airbnb keluarga via Smart Lock IoT & API daya listrik."
    },
    {
      phase: "Fase 3 (Masa Depan)",
      title: "CEO Gurita Bisnis",
      description: "Terapkan Operations Management & ML untuk prediksi penjualan di 3 gerai Alfamart/Indomaret, saham, dan penginapan."
    }
  ],
  offGrid: {
    budget: "Rp400.000.000,- (Tanah Keluarga)",
    timeline: "Eksekusi Fisik Pasca Menikah",
    pillars: [
      {
        title: "Arsitektur Energi (Off-Grid)",
        items: [
          "Panel Surya Monocrystalline 3 kWp + Smart Hybrid Inverter 5 kW.",
          "Baterai LiFePO4 10 kWh (48V 200Ah) + Premium Smart BMS.",
          "Dual-Axis Solar Tracker (ESP32) mengikuti matahari (Efisiensi +30-40%).",
          "AI Energy Broker (Raspberry Pi): Load shedding otomatis jika baterai <30%."
        ]
      },
      {
        title: "Otomatisasi Kebun (Smart Agriculture)",
        items: [
          "Greenhouse Baja Ringan + Filter UV + Mist Generator.",
          "Smart Irrigation: Solenoid valve industri + booster pump otomatis.",
          "Predictive Weather ML: Tunda penyiraman otomatis jika deteksi hujan via API."
        ]
      },
      {
        title: "Peternakan & Limbah Canggih",
        items: [
          "Smart Feeding: Motor industri + Load cell (presisi pakan ayam & sapi).",
          "Kandang rapi & canggih dengan kolam ikan hiasan terintegrasi.",
          "Siklus limbah terotomatisasi untuk menjaga kebersihan kandang."
        ]
      }
    ]
  },
  lifePhases: [
    {
      age: "19-21 Tahun",
      title: "Transisi & S1 Elektro Tel-U",
      description: "Fokus akademik S1 serta sinkronisasi bisnis keluarga setiap jeda semester.",
      items: [
        "Jeda Semester: Belajar Cash Flow retail & Properti di bawah bimbingan Ayah.",
        "Gaming: Osu! 3-digit (1000pp), GD Top Extreme Demon, Catur 2000 Elo.",
        "Hafalan Al-Qur'an: Mutqin >8 Juz via Self Recitation.",
        "Story: Tamat berbagai macam game."
      ],
      status: "in-progress"
    },
    {
      age: "21-23 Tahun",
      title: "Karir Lapangan & Penetrasi Industri",
      description: "Automation Engineer di Kawasan Industri Semarang/Kendal.",
      items: [
        "Audit Gaji: Target >Rp8jt, alokasi investasi saham fisik.",
        "R&D Mandiri: Matangkan sistem kontrol energi & otomatisasi surya di laptop.",
        "Fisik: Target Aman dari otomasi AI via kehadiran fisik lapangan."
      ],
      status: "planned"
    },
    {
      age: "24-26 Tahun",
      title: "MBA UGM & Digitalisasi Aset",
      description: "Penguatan manajemen & standarisasi profil eksekutif.",
      items: [
        "S2: MBA UGM Yogyakarta (AACSB Accredited).",
        "Aset: Pasang Smart Lock IoT di Airbnb keluarga untuk pangkas OPEX listrik.",
        "Fisik: Gym Bulk Kevin Hart type (165cm/60kg), Lasik 20/20, Behel gigi."
      ],
      status: "planned"
    },
    {
      age: "27 Tahun+",
      title: "CEO Ekosistem & Rumah Off-Grid",
      description: "Kepemimpinan penuh hibrida tekno-finansial.",
      items: [
        "CEO: Optimasi retail via ML dan Operations Management.",
        "Projek Akhir: Eksekusi Rumah Off-Grid Canggih Gunungpati (Rp400 Juta).",
        "Keluarga: Menikah dan hidup mandiri energi & pangan."
      ],
      status: "planned"
    }
  ],
  skillTargets: [
    {
      category: "Gaming",
      skills: [
        { name: "Osu!", target: "3 Digit Global / 1000pp", plan: "Pemanasan akurasi, stamina, maraton. Max 5 retry." },
        { name: "Geometry Dash", target: "Top Extreme Demon", plan: "5 level Demon per tingkat kesulitan, practice run min attempts." },
        { name: "Chess", target: "Rating 2000 / Puzzle 3000", plan: "Tactic puzzle, AI Analysis, Aturan waktu 20/40/40, belajar via chess.com, lichess, dan chesscompass." },
        { name: "Mobile Legends", target: "Mythic Immortal 100", plan: "Push rank konsisten, pelajari meta/item terbaru." }
      ]
    },
    {
      category: "Self Development",
      skills: [
        { name: "Piano", target: "Play Complex Pieces", plan: "Sight reading, fingering, play by ear via OctaviaPiano." },
        { name: "Al-Qur'an", target: ">8 Juz Mutqin", plan: "Murajaah rutin & Murattal Self Recitation (kemalav.vercel.app)." },
        { name: "Literasi", target: "Deep Story Analysis", plan: "Rangkuman mandiri vs ulasan YouTube, Kuis evaluasi AI." },
        { name: "Game Story", target: "Tamat", plan: "Fokus misi utama (GTA V, HSR, Minecraft, Baldi's Basics)." }
      ]
    }
  ],
  deviceSpecs: [
    { name: "Ponsel", model: "Z Fold 5 Cream", status: "completed" },
    { name: "Motor", model: "Yamaha Aerox Putih (White-Blue Futuristic + Hatsune Miku)", status: "completed" },
    { name: "Laptop", model: "RTX 3050 - 144Hz Screen", status: "completed" }
  ],
  physical: [
    {
      category: "Postur",
      target: "Kevin Hart Type",
      items: ["Tinggi 165 cm", "Berat 60 kg (Berotot/Bulk)"]
    },
    {
      category: "Estetika",
      target: "Executive Profile",
      items: ["Buzz Cut / Afro Modis", "Gigi Behel + Whitening", "Lasik Eyes 20/20"]
    }
  ]
};
