import { UndipMajor, UndipFaculty, DegreeType, ProdiCluster, scoreToOsuPP } from './snbt2030UndipData';

export interface ItbMajor extends UndipMajor {
  code: string;
}

export const ALL_ITB_MAJORS: ItbMajor[] = [
  {
    id: 'itb-13321001',
    code: '13321001',
    name: 'Fakultas Ilmu dan Teknologi Kebumian (FITB)',
    degree: 'S1',
    facultyId: 'fitb',
    facultyName: 'Fakultas Ilmu dan Teknologi Kebumian (FITB)',
    departmentName: 'Ganesa',
    cluster: 'teknik',
    totalSeats: 325,
    snbpSeats: 65,
    snbtSeats: 130,
    mandiriSeats: 130,
    passingScore: 707,
    passingPP: 535,
    competitiveness: 'Ketat'
  },
  {
    id: 'itb-13321002',
    code: '13321002',
    name: 'Fakultas Teknik Pertambangan dan Perminyakan (FTTM)',
    degree: 'S1',
    facultyId: 'fttm',
    facultyName: 'Fakultas Teknik Pertambangan dan Perminyakan (FTTM)',
    departmentName: 'Ganesa',
    cluster: 'teknik',
    totalSeats: 288,
    snbpSeats: 58,
    snbtSeats: 115,
    mandiriSeats: 115,
    passingScore: 745,
    passingPP: 725,
    competitiveness: 'Sangat Ketat'
  },
  {
    id: 'itb-13321005',
    code: '13321005',
    name: 'Sekolah Farmasi (SF)',
    degree: 'S1',
    facultyId: 'sf',
    facultyName: 'Sekolah Farmasi (SF)',
    departmentName: 'Ganesa',
    cluster: 'kesehatan',
    totalSeats: 140,
    snbpSeats: 28,
    snbtSeats: 56,
    mandiriSeats: 56,
    passingScore: 720,
    passingPP: 600,
    competitiveness: 'Sangat Ketat'
  },
  {
    id: 'itb-13321006',
    code: '13321006',
    name: 'Sekolah Ilmu dan Teknologi Hayati - Sains (SITH-S)',
    degree: 'S1',
    facultyId: 'sith',
    facultyName: 'Sekolah Ilmu dan Teknologi Hayati (SITH)',
    departmentName: 'Ganesa',
    cluster: 'kesehatan',
    totalSeats: 105,
    snbpSeats: 21,
    snbtSeats: 42,
    mandiriSeats: 42,
    passingScore: 694,
    passingPP: 488,
    competitiveness: 'Ketat'
  },
  {
    id: 'itb-13321009',
    code: '13321009',
    name: 'Fakultas Teknik Mesin dan Dirgantara (FTMD)',
    degree: 'S1',
    facultyId: 'ftmd',
    facultyName: 'Fakultas Teknik Mesin dan Dirgantara (FTMD)',
    departmentName: 'Ganesa',
    cluster: 'teknik',
    totalSeats: 250,
    snbpSeats: 50,
    snbtSeats: 100,
    mandiriSeats: 100,
    passingScore: 748,
    passingPP: 740,
    competitiveness: 'Sangat Ketat'
  },
  {
    id: 'itb-13321012',
    code: '13321012',
    name: 'Sekolah Ilmu dan Teknologi Hayati - Rekayasa (SITH-R)',
    degree: 'S1',
    facultyId: 'sith',
    facultyName: 'Sekolah Ilmu dan Teknologi Hayati (SITH)',
    departmentName: 'Jatinangor',
    cluster: 'teknik',
    totalSeats: 188,
    snbpSeats: 38,
    snbtSeats: 75,
    mandiriSeats: 75,
    passingScore: 680,
    passingPP: 460,
    competitiveness: 'Menengah'
  },
  {
    id: 'itb-13321015',
    code: '13321015',
    name: 'Fakultas Teknologi Industri - Kampus Cirebon (FTI-C)',
    degree: 'S1',
    facultyId: 'fti',
    facultyName: 'Fakultas Teknologi Industri (FTI)',
    departmentName: 'Cirebon',
    cluster: 'teknik',
    totalSeats: 83,
    snbpSeats: 17,
    snbtSeats: 33,
    mandiriSeats: 33,
    passingScore: 688,
    passingPP: 476,
    competitiveness: 'Menengah'
  },
  {
    id: 'itb-13321017',
    code: '13321017',
    name: 'Fakultas Teknik Pertambangan dan Perminyakan - Kampus Cirebon (FTTM-C)',
    degree: 'S1',
    facultyId: 'fttm',
    facultyName: 'Fakultas Teknik Pertambangan dan Perminyakan (FTTM)',
    departmentName: 'Cirebon',
    cluster: 'teknik',
    totalSeats: 75,
    snbpSeats: 15,
    snbtSeats: 30,
    mandiriSeats: 30,
    passingScore: 676,
    passingPP: 452,
    competitiveness: 'Menengah'
  },
  {
    id: 'itb-13321018',
    code: '13321018',
    name: 'Fakultas Ilmu dan Teknologi Kebumian - Kampus Cirebon (FITB-C)',
    degree: 'S1',
    facultyId: 'fitb',
    facultyName: 'Fakultas Ilmu dan Teknologi Kebumian (FITB)',
    departmentName: 'Cirebon',
    cluster: 'teknik',
    totalSeats: 75,
    snbpSeats: 15,
    snbtSeats: 30,
    mandiriSeats: 30,
    passingScore: 665,
    passingPP: 430,
    competitiveness: 'Menengah'
  },
  {
    id: 'itb-13321019',
    code: '13321019',
    name: 'Fakultas Matematika dan Ilmu Pengetahuan Alam - Matematika (FMIPA-M)',
    degree: 'S1',
    facultyId: 'fmipa',
    facultyName: 'Fakultas Matematika dan Ilmu Pengetahuan Alam (FMIPA)',
    departmentName: 'Ganesa',
    cluster: 'teknik',
    totalSeats: 150,
    snbpSeats: 30,
    snbtSeats: 60,
    mandiriSeats: 60,
    passingScore: 714,
    passingPP: 570,
    competitiveness: 'Ketat'
  },
  {
    id: 'itb-13321020',
    code: '13321020',
    name: 'Fakultas Matematika dan Ilmu Pengetahuan Alam - IPA (FMIPA-IPA)',
    degree: 'S1',
    facultyId: 'fmipa',
    facultyName: 'Fakultas Matematika dan Ilmu Pengetahuan Alam (FMIPA)',
    departmentName: 'Ganesa',
    cluster: 'teknik',
    totalSeats: 245,
    snbpSeats: 49,
    snbtSeats: 98,
    mandiriSeats: 98,
    passingScore: 691,
    passingPP: 482,
    competitiveness: 'Ketat'
  },
  {
    id: 'itb-13321021',
    code: '13321021',
    name: 'Sekolah Teknik Elektro dan Informatika - Komputasi (STEI-K)',
    degree: 'S1',
    facultyId: 'stei',
    facultyName: 'Sekolah Teknik Elektro dan Informatika (STEI)',
    departmentName: 'Ganesa',
    cluster: 'teknik',
    totalSeats: 168,
    snbpSeats: 34,
    snbtSeats: 67,
    mandiriSeats: 67,
    passingScore: 753,
    passingPP: 765,
    competitiveness: 'Sangat Ketat'
  },
  {
    id: 'itb-13321022',
    code: '13321022',
    name: 'Sekolah Teknik Elektro dan Informatika - Rekayasa (STEI-R)',
    degree: 'S1',
    facultyId: 'stei',
    facultyName: 'Sekolah Teknik Elektro dan Informatika (STEI)',
    departmentName: 'Ganesa',
    cluster: 'teknik',
    totalSeats: 188,
    snbpSeats: 38,
    snbtSeats: 75,
    mandiriSeats: 75,
    passingScore: 738,
    passingPP: 690,
    competitiveness: 'Sangat Ketat'
  },
  {
    id: 'itb-13321023',
    code: '13321023',
    name: 'Fakultas Seni Rupa dan Desain (FSRD)',
    degree: 'S1',
    facultyId: 'fsrd',
    facultyName: 'Fakultas Seni Rupa dan Desain (FSRD)',
    departmentName: 'Ganesa',
    cluster: 'sastra',
    totalSeats: 275,
    snbpSeats: 55,
    snbtSeats: 110,
    mandiriSeats: 110,
    passingScore: 663,
    passingPP: 426,
    competitiveness: 'Menengah'
  },
  {
    id: 'itb-13321024',
    code: '13321024',
    name: 'Sekolah Bisnis dan Manajemen (SBM)',
    degree: 'S1',
    facultyId: 'sbm',
    facultyName: 'Sekolah Bisnis dan Manajemen (SBM)',
    departmentName: 'Ganesa',
    cluster: 'bisnis',
    totalSeats: 138,
    snbpSeats: 28,
    snbtSeats: 55,
    mandiriSeats: 55,
    passingScore: 702,
    passingPP: 510,
    competitiveness: 'Ketat'
  },
  {
    id: 'itb-13321025',
    code: '13321025',
    name: 'Fakultas Seni Rupa dan Desain - Kampus Cirebon (FSRD-C)',
    degree: 'S1',
    facultyId: 'fsrd',
    facultyName: 'Fakultas Seni Rupa dan Desain (FSRD)',
    departmentName: 'Cirebon',
    cluster: 'sastra',
    totalSeats: 158,
    snbpSeats: 32,
    snbtSeats: 63,
    mandiriSeats: 63,
    passingScore: 628,
    passingPP: 356,
    competitiveness: 'Ramah'
  },
  {
    id: 'itb-13321026',
    code: '13321026',
    name: 'Fakultas Teknik Sipil dan Lingkungan - Infrastruktur Sipil, Lingkungan, dan Kelautan',
    degree: 'S1',
    facultyId: 'ftsl',
    facultyName: 'Fakultas Teknik Sipil dan Lingkungan (FTSL)',
    departmentName: 'Ganesa',
    cluster: 'teknik',
    totalSeats: 225,
    snbpSeats: 45,
    snbtSeats: 90,
    mandiriSeats: 90,
    passingScore: 723,
    passingPP: 615,
    competitiveness: 'Sangat Ketat'
  },
  {
    id: 'itb-13321027',
    code: '13321027',
    name: 'Fakultas Teknik Sipil dan Lingkungan - Infrastruktur Sumber Daya Air dan Sanitasi Lingkungan',
    degree: 'S1',
    facultyId: 'ftsl',
    facultyName: 'Fakultas Teknik Sipil dan Lingkungan (FTSL)',
    departmentName: 'Jatinangor',
    cluster: 'teknik',
    totalSeats: 100,
    snbpSeats: 20,
    snbtSeats: 40,
    mandiriSeats: 40,
    passingScore: 711,
    passingPP: 555,
    competitiveness: 'Ketat'
  },
  {
    id: 'itb-13321028',
    code: '13321028',
    name: 'Fakultas Teknologi Industri - Sistem dan Proses (FTI-SP)',
    degree: 'S1',
    facultyId: 'fti',
    facultyName: 'Fakultas Teknologi Industri (FTI)',
    departmentName: 'Ganesa / Jatinangor',
    cluster: 'teknik',
    totalSeats: 211,
    snbpSeats: 53,
    snbtSeats: 105,
    mandiriSeats: 105,
    passingScore: 719,
    passingPP: 595,
    competitiveness: 'Ketat'
  },
  {
    id: 'itb-13321029',
    code: '13321029',
    name: 'Fakultas Teknologi Industri - Rekayasa Industri (FTI-RI)',
    degree: 'S1',
    facultyId: 'fti',
    facultyName: 'Fakultas Teknologi Industri (FTI)',
    departmentName: 'Ganesa',
    cluster: 'teknik',
    totalSeats: 138,
    snbpSeats: 28,
    snbtSeats: 55,
    mandiriSeats: 55,
    passingScore: 741,
    passingPP: 705,
    competitiveness: 'Sangat Ketat'
  },
  {
    id: 'itb-13321034',
    code: '13321034',
    name: 'Sekolah Ilmu dan Teknologi Hayati - Kampus Cirebon (SITH-C)',
    degree: 'S1',
    facultyId: 'sith',
    facultyName: 'Sekolah Ilmu dan Teknologi Hayati (SITH)',
    departmentName: 'Cirebon',
    cluster: 'kesehatan',
    totalSeats: 45,
    snbpSeats: 9,
    snbtSeats: 18,
    mandiriSeats: 18,
    passingScore: 675,
    passingPP: 450,
    competitiveness: 'Menengah'
  },
  {
    id: 'itb-13321036',
    code: '13321036',
    name: 'Arsitektur',
    degree: 'S1',
    facultyId: 'sappk',
    facultyName: 'Sekolah Arsitektur, Perencanaan dan Pengembangan Kebijakan (SAPPK)',
    departmentName: 'Ganesa',
    cluster: 'teknik',
    totalSeats: 70,
    snbpSeats: 14,
    snbtSeats: 28,
    mandiriSeats: 28,
    passingScore: 709,
    passingPP: 545,
    competitiveness: 'Ketat'
  },
  {
    id: 'itb-13321037',
    code: '13321037',
    name: 'Perencanaan Wilayah dan Kota',
    degree: 'S1',
    facultyId: 'sappk',
    facultyName: 'Sekolah Arsitektur, Perencanaan dan Pengembangan Kebijakan (SAPPK)',
    departmentName: 'Ganesa',
    cluster: 'teknik',
    totalSeats: 88,
    snbpSeats: 18,
    snbtSeats: 35,
    mandiriSeats: 35,
    passingScore: 693,
    passingPP: 486,
    competitiveness: 'Ketat'
  },
  {
    id: 'itb-13321038',
    code: '13321038',
    name: 'Perencanaan Wilayah dan Kota - Kampus Cirebon',
    degree: 'S1',
    facultyId: 'sappk',
    facultyName: 'Sekolah Arsitektur, Perencanaan dan Pengembangan Kebijakan (SAPPK)',
    departmentName: 'Cirebon',
    cluster: 'teknik',
    totalSeats: 75,
    snbpSeats: 15,
    snbtSeats: 30,
    mandiriSeats: 30,
    passingScore: 663,
    passingPP: 426,
    competitiveness: 'Menengah'
  }
];

export const ITB_FACULTIES: UndipFaculty[] = [
  {
    id: 'fitb',
    name: 'Fakultas Ilmu dan Teknologi Kebumian',
    shortName: 'FITB',
    totalSeats: 400,
    departments: [
      {
        name: 'Kampus Ganesa',
        subtotal: 325,
        majors: ALL_ITB_MAJORS.filter(m => m.facultyId === 'fitb' && m.departmentName === 'Ganesa')
      },
      {
        name: 'Kampus Cirebon',
        subtotal: 75,
        majors: ALL_ITB_MAJORS.filter(m => m.facultyId === 'fitb' && m.departmentName === 'Cirebon')
      }
    ]
  },
  {
    id: 'fttm',
    name: 'Fakultas Teknik Pertambangan dan Perminyakan',
    shortName: 'FTTM',
    totalSeats: 363,
    departments: [
      {
        name: 'Kampus Ganesa',
        subtotal: 288,
        majors: ALL_ITB_MAJORS.filter(m => m.facultyId === 'fttm' && m.departmentName === 'Ganesa')
      },
      {
        name: 'Kampus Cirebon',
        subtotal: 75,
        majors: ALL_ITB_MAJORS.filter(m => m.facultyId === 'fttm' && m.departmentName === 'Cirebon')
      }
    ]
  },
  {
    id: 'sf',
    name: 'Sekolah Farmasi',
    shortName: 'SF',
    totalSeats: 140,
    departments: [
      {
        name: 'Kampus Ganesa',
        subtotal: 140,
        majors: ALL_ITB_MAJORS.filter(m => m.facultyId === 'sf')
      }
    ]
  },
  {
    id: 'sith',
    name: 'Sekolah Ilmu dan Teknologi Hayati',
    shortName: 'SITH',
    totalSeats: 338,
    departments: [
      {
        name: 'Sains - Kampus Ganesa',
        subtotal: 105,
        majors: ALL_ITB_MAJORS.filter(m => m.facultyId === 'sith' && m.departmentName === 'Ganesa')
      },
      {
        name: 'Rekayasa - Kampus Jatinangor',
        subtotal: 188,
        majors: ALL_ITB_MAJORS.filter(m => m.facultyId === 'sith' && m.departmentName === 'Jatinangor')
      },
      {
        name: 'Kampus Cirebon',
        subtotal: 45,
        majors: ALL_ITB_MAJORS.filter(m => m.facultyId === 'sith' && m.departmentName === 'Cirebon')
      }
    ]
  },
  {
    id: 'ftmd',
    name: 'Fakultas Teknik Mesin dan Dirgantara',
    shortName: 'FTMD',
    totalSeats: 250,
    departments: [
      {
        name: 'Kampus Ganesa',
        subtotal: 250,
        majors: ALL_ITB_MAJORS.filter(m => m.facultyId === 'ftmd')
      }
    ]
  },
  {
    id: 'fti',
    name: 'Fakultas Teknologi Industri',
    shortName: 'FTI',
    totalSeats: 432,
    departments: [
      {
        name: 'Sistem dan Proses (Ganesa / Jatinangor)',
        subtotal: 211,
        majors: ALL_ITB_MAJORS.filter(m => m.id === 'itb-13321028')
      },
      {
        name: 'Rekayasa Industri (Ganesa)',
        subtotal: 138,
        majors: ALL_ITB_MAJORS.filter(m => m.id === 'itb-13321029')
      },
      {
        name: 'Kampus Cirebon',
        subtotal: 83,
        majors: ALL_ITB_MAJORS.filter(m => m.facultyId === 'fti' && m.departmentName === 'Cirebon')
      }
    ]
  },
  {
    id: 'fmipa',
    name: 'Fakultas Matematika dan Ilmu Pengetahuan Alam',
    shortName: 'FMIPA',
    totalSeats: 395,
    departments: [
      {
        name: 'Matematika - Kampus Ganesa',
        subtotal: 150,
        majors: ALL_ITB_MAJORS.filter(m => m.id === 'itb-13321019')
      },
      {
        name: 'Sains IPA - Kampus Ganesa',
        subtotal: 245,
        majors: ALL_ITB_MAJORS.filter(m => m.id === 'itb-13321020')
      }
    ]
  },
  {
    id: 'stei',
    name: 'Sekolah Teknik Elektro dan Informatika',
    shortName: 'STEI',
    totalSeats: 356,
    departments: [
      {
        name: 'Komputasi - Kampus Ganesa',
        subtotal: 168,
        majors: ALL_ITB_MAJORS.filter(m => m.id === 'itb-13321021')
      },
      {
        name: 'Rekayasa - Kampus Ganesa',
        subtotal: 188,
        majors: ALL_ITB_MAJORS.filter(m => m.id === 'itb-13321022')
      }
    ]
  },
  {
    id: 'fsrd',
    name: 'Fakultas Seni Rupa dan Desain',
    shortName: 'FSRD',
    totalSeats: 433,
    departments: [
      {
        name: 'Kampus Ganesa',
        subtotal: 275,
        majors: ALL_ITB_MAJORS.filter(m => m.facultyId === 'fsrd' && m.departmentName === 'Ganesa')
      },
      {
        name: 'Kampus Cirebon',
        subtotal: 158,
        majors: ALL_ITB_MAJORS.filter(m => m.facultyId === 'fsrd' && m.departmentName === 'Cirebon')
      }
    ]
  },
  {
    id: 'sbm',
    name: 'Sekolah Bisnis dan Manajemen',
    shortName: 'SBM',
    totalSeats: 138,
    departments: [
      {
        name: 'Kampus Ganesa',
        subtotal: 138,
        majors: ALL_ITB_MAJORS.filter(m => m.facultyId === 'sbm')
      }
    ]
  },
  {
    id: 'ftsl',
    name: 'Fakultas Teknik Sipil dan Lingkungan',
    shortName: 'FTSL',
    totalSeats: 325,
    departments: [
      {
        name: 'Infrastruktur - Kampus Ganesa',
        subtotal: 225,
        majors: ALL_ITB_MAJORS.filter(m => m.id === 'itb-13321026')
      },
      {
        name: 'Sumber Daya Air & Sanitasi - Kampus Jatinangor',
        subtotal: 100,
        majors: ALL_ITB_MAJORS.filter(m => m.id === 'itb-13321027')
      }
    ]
  },
  {
    id: 'sappk',
    name: 'Sekolah Arsitektur, Perencanaan dan Pengembangan Kebijakan',
    shortName: 'SAPPK',
    totalSeats: 233,
    departments: [
      {
        name: 'Arsitektur (Ganesa)',
        subtotal: 70,
        majors: ALL_ITB_MAJORS.filter(m => m.id === 'itb-13321036')
      },
      {
        name: 'Perencanaan Wilayah & Kota (Ganesa)',
        subtotal: 88,
        majors: ALL_ITB_MAJORS.filter(m => m.id === 'itb-13321037')
      },
      {
        name: 'Perencanaan Wilayah & Kota (Cirebon)',
        subtotal: 75,
        majors: ALL_ITB_MAJORS.filter(m => m.id === 'itb-13321038')
      }
    ]
  }
];

export const ITB_2030_METADATA = {
  title: 'REKAPITULASI DATA DAYA TAMPUNG TOTAL DAN ESTIMASI AMBANG BATAS ITB 2030',
  edition: 'Edisi 3.803 Kursi',
  grandTotal: 3803,
  snbpTotal: 761,
  snbtTotal: 1521,
  mandiriTotal: 1521,
  rules: {
    title: 'METADATA JALUR SELEKSI SNBT 2030 (ITB SELECTION)',
    targetTrack: 'JALUR UTBK SNBT - INSTITUT TEKNOLOGI BANDUNG',
    flow: 'Nilai UTBK Rilis → Pemilihan Fakultas/Sekolah di ITB (Pilihan Prioritas) → Penempatan Program Studi Tahap TPB.',
    maxS1: 10,
    maxD4: 5,
    maxTotal: 15,
    mechanism: 'Mahasiswa baru masuk melalui Fakultas/Sekolah pilihan. Seleksi penjurusan program studi spesifik dilakukan setelah melewati 1 tahun masa TPB (Tahap Persiapan Bersama) berdasarkan indeks prestasi dan prioritas minat.'
  },
  allPathways: [
    {
      id: 'snbp',
      name: 'SNBP (Seleksi Nasional Berdasarkan Prestasi)',
      quotaPercent: '20%',
      seats: 761,
      badgeColor: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
      tagline: 'Seleksi Undangan Rapor SMA / SMK Unggulan',
      basis: 'Rata-rata nilai rapor semua mata pelajaran serta portofolio tambahan untuk Fakultas Seni Rupa dan Desain (FSRD).',
      choiceRules: 'Maksimal 2 Fakultas/Sekolah di ITB.',
      consequence: 'Bagi siswa yang lolos SNBP ITB, secara sistem tidak diijinkan mengikuti UTBK SNBT maupun seleksi mandiri PTN mana pun.',
      isThisSimulatorTrack: false
    },
    {
      id: 'snbt',
      name: 'SNBT (Seleksi Nasional Berdasarkan Tes)',
      quotaPercent: '40%',
      seats: 1521,
      badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      tagline: 'Sistem Ujian Terpusat UTBK Nasional',
      basis: '100% skor murni UTBK (7 subtes). Portofolio gambar diwajibkan khusus untuk pilihan FSRD Ganesa & Cirebon.',
      choiceRules: 'Mengikuti aturan multi-pilihan nasional hingga 15 opsi. Pilihan ITB berupa entitas Fakultas/Sekolah/Kampus Cirebon.',
      consequence: 'Lolos di salah satu pilihan prioritas akan langsung mengunci status registrasi mahasiswa baru.',
      isThisSimulatorTrack: true
    },
    {
      id: 'mandiri',
      name: 'Seleksi Mandiri (SM-ITB) & International Track',
      quotaPercent: '40%',
      seats: 1521,
      badgeColor: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
      tagline: 'Seleksi Mandiri Berbasis Rapor, UTBK & Kemitraan',
      basis: 'Menggunakan skor UTBK, nilai rapor semester 1-5, tes kemampuan seni (FSRD), dan pertimbangan finansial IPI (Iuran Pengembangan Institusi).',
      choiceRules: 'Pendaftaran langsung melalui portal akademik ITB.',
      consequence: 'Dikenakan biaya UKT tingkat atas serta IPI (Iuran Pengembangan Mandiri) sebagai dukungan finansial institusi.',
      isThisSimulatorTrack: false
    }
  ]
};
