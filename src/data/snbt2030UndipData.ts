export type DegreeType = 'S1' | 'D4';

export type ProdiCluster = 'teknik' | 'sosial' | 'kesehatan' | 'bisnis' | 'sastra';

export interface ClusterWeights {
  id: ProdiCluster;
  name: string;
  icon: string;
  desc: string;
  weights: {
    pu: number;     // Penalaran Umum
    pbm: number;    // Pemahaman Bacaan & Menulis
    ppu: number;    // Pengetahuan & Pemahaman Umum
    pk: number;     // Pengetahuan Kuantitatif
    litIndo: number;// Literasi Bahasa Indonesia
    litIng: number; // Literasi Bahasa Inggris
    pm: number;     // Penalaran Matematika
  };
}

export const CLUSTER_WEIGHTS: Record<ProdiCluster, ClusterWeights> = {
  teknik: {
    id: 'teknik',
    name: 'Teknik',
    icon: '🛠️',
    desc: 'Penalaran Matematika & Pengetahuan Kuantitatif (PM 25%, PK 20%, PU 20%, LitIng 15%, LitIndo 10%, PBM 5%, PPU 5%)',
    weights: { pu: 0.20, pbm: 0.05, ppu: 0.05, pk: 0.20, litIndo: 0.10, litIng: 0.15, pm: 0.25 }
  },
  sosial: {
    id: 'sosial',
    name: 'Sosial',
    icon: '📚',
    desc: 'Pemahaman Bacaan, Menulis & Literasi Indonesia (PBM 25%, LitIndo 25%, PPU 15%, PU 15%, LitIng 10%, PM 5%, PK 5%)',
    weights: { pu: 0.15, pbm: 0.25, ppu: 0.15, pk: 0.05, litIndo: 0.25, litIng: 0.10, pm: 0.05 }
  },
  kesehatan: {
    id: 'kesehatan',
    name: 'Kesehatan',
    icon: '🏥',
    desc: 'Penalaran Umum & Literasi Bahasa Inggris (PU 25%, LitIng 25%, PK 15%, PM 15%, LitIndo 10%, PBM 5%, PPU 5%)',
    weights: { pu: 0.25, pbm: 0.05, ppu: 0.05, pk: 0.15, litIndo: 0.10, litIng: 0.25, pm: 0.15 }
  },
  bisnis: {
    id: 'bisnis',
    name: 'Bisnis',
    icon: '💼',
    desc: 'Pengetahuan Kuantitatif & Penalaran Matematika (PK 25%, PM 25%, LitIng 15%, PU 15%, PBM 10%, LitIndo 5%, PPU 5%)',
    weights: { pu: 0.15, pbm: 0.10, ppu: 0.05, pk: 0.25, litIndo: 0.05, litIng: 0.15, pm: 0.25 }
  },
  sastra: {
    id: 'sastra',
    name: 'Sastra',
    icon: '🎭',
    desc: 'Literasi Bahasa Inggris & Pengetahuan Umum (LitIng 30%, PPU 25%, LitIndo 15%, PBM 10%, PU 10%, PM 5%, PK 5%)',
    weights: { pu: 0.10, pbm: 0.10, ppu: 0.25, pk: 0.05, litIndo: 0.15, litIng: 0.30, pm: 0.05 }
  }
};

export interface UndipMajor {
  id: string;
  name: string;
  degree: DegreeType;
  facultyId: string;
  facultyName: string;
  departmentName: string;
  cluster: ProdiCluster;
  totalSeats: number;
  snbpSeats: number;
  snbtSeats: number;
  mandiriSeats: number;
  passingScore: number;     // Estimasi passing grade UTBK SNBT
  passingPP: number;        // Estimasi passing grade PP equivalent
  competitiveness: 'Sangat Ketat' | 'Ketat' | 'Menengah' | 'Ramah' | 'Sepi Peminat';
}

export interface UndipFaculty {
  id: string;
  name: string;
  shortName: string;
  totalSeats: number;
  departments: {
    name: string;
    subtotal: number;
    majors: UndipMajor[];
  }[];
}

// 1. FAKULTAS SAINS DAN MATEMATIKA (FSM) - 1.955 Kursi
const FSM_MAJORS: UndipMajor[] = [
  // Komputasi & Data (Subtotal: 637)
  {
    id: 'fsm-informatika',
    name: 'S1 Informatika',
    degree: 'S1',
    facultyId: 'fsm',
    facultyName: 'Fakultas Sains dan Matematika (FSM)',
    departmentName: 'Departemen Komputasi & Data',
    cluster: 'teknik',
    totalSeats: 246,
    snbpSeats: 49,
    snbtSeats: 74,
    mandiriSeats: 123,
    passingScore: 680,
    passingPP: 460,
    competitiveness: 'Sangat Ketat'
  },
  {
    id: 'fsm-statistika-data',
    name: 'S1 Statistika dan Sains Data',
    degree: 'S1',
    facultyId: 'fsm',
    facultyName: 'Fakultas Sains dan Matematika (FSM)',
    departmentName: 'Departemen Komputasi & Data',
    cluster: 'teknik',
    totalSeats: 187,
    snbpSeats: 37,
    snbtSeats: 56,
    mandiriSeats: 94,
    passingScore: 648,
    passingPP: 396,
    competitiveness: 'Ketat'
  },
  {
    id: 'fsm-aktuaria',
    name: 'S1 Ilmu Aktuaria',
    degree: 'S1',
    facultyId: 'fsm',
    facultyName: 'Fakultas Sains dan Matematika (FSM)',
    departmentName: 'Departemen Komputasi & Data',
    cluster: 'bisnis',
    totalSeats: 119,
    snbpSeats: 24,
    snbtSeats: 36,
    mandiriSeats: 59,
    passingScore: 662,
    passingPP: 424,
    competitiveness: 'Ketat'
  },
  {
    id: 'fsm-matematika',
    name: 'S1 Matematika Murni',
    degree: 'S1',
    facultyId: 'fsm',
    facultyName: 'Fakultas Sains dan Matematika (FSM)',
    departmentName: 'Departemen Komputasi & Data',
    cluster: 'teknik',
    totalSeats: 85,
    snbpSeats: 17,
    snbtSeats: 26,
    mandiriSeats: 42,
    passingScore: 605,
    passingPP: 310,
    competitiveness: 'Ramah'
  },
  // Sains Eksplorasi & Instrumentasi Medis (Subtotal: 451)
  {
    id: 'fsm-elins',
    name: 'S1 Elektronika & Instrumentasi',
    degree: 'S1',
    facultyId: 'fsm',
    facultyName: 'Fakultas Sains dan Matematika (FSM)',
    departmentName: 'Departemen Sains Eksplorasi & Instrumentasi Medis',
    cluster: 'teknik',
    totalSeats: 187,
    snbpSeats: 37,
    snbtSeats: 56,
    mandiriSeats: 94,
    passingScore: 622,
    passingPP: 344,
    competitiveness: 'Menengah'
  },
  {
    id: 'fsm-geofisika',
    name: 'S1 Geofisika',
    degree: 'S1',
    facultyId: 'fsm',
    facultyName: 'Fakultas Sains dan Matematika (FSM)',
    departmentName: 'Departemen Sains Eksplorasi & Instrumentasi Medis',
    cluster: 'teknik',
    totalSeats: 119,
    snbpSeats: 24,
    snbtSeats: 36,
    mandiriSeats: 59,
    passingScore: 596,
    passingPP: 292,
    competitiveness: 'Ramah'
  },
  {
    id: 'fsm-fisika-murni',
    name: 'S1 Fisika Murni',
    degree: 'S1',
    facultyId: 'fsm',
    facultyName: 'Fakultas Sains dan Matematika (FSM)',
    departmentName: 'Departemen Sains Eksplorasi & Instrumentasi Medis',
    cluster: 'teknik',
    totalSeats: 85,
    snbpSeats: 17,
    snbtSeats: 26,
    mandiriSeats: 42,
    passingScore: 585,
    passingPP: 270,
    competitiveness: 'Sepi Peminat'
  },
  {
    id: 'fsm-fisika-medis',
    name: 'S1 Fisika Medis',
    degree: 'S1',
    facultyId: 'fsm',
    facultyName: 'Fakultas Sains dan Matematika (FSM)',
    departmentName: 'Departemen Sains Eksplorasi & Instrumentasi Medis',
    cluster: 'kesehatan',
    totalSeats: 60,
    snbpSeats: 12,
    snbtSeats: 18,
    mandiriSeats: 30,
    passingScore: 684,
    passingPP: 468,
    competitiveness: 'Menengah'
  },
  // Biokimia Terapan (Subtotal: 867)
  {
    id: 'fsm-bioteknologi',
    name: 'S1 Bioteknologi',
    degree: 'S1',
    facultyId: 'fsm',
    facultyName: 'Fakultas Sains dan Matematika (FSM)',
    departmentName: 'Departemen Biokimia Terapan',
    cluster: 'kesehatan',
    totalSeats: 289,
    snbpSeats: 58,
    snbtSeats: 87,
    mandiriSeats: 144,
    passingScore: 682,
    passingPP: 464,
    competitiveness: 'Ketat'
  },
  {
    id: 'fsm-biokimia',
    name: 'S1 Biokimia',
    degree: 'S1',
    facultyId: 'fsm',
    facultyName: 'Fakultas Sains dan Matematika (FSM)',
    departmentName: 'Departemen Biokimia Terapan',
    cluster: 'kesehatan',
    totalSeats: 204,
    snbpSeats: 41,
    snbtSeats: 61,
    mandiriSeats: 102,
    passingScore: 642,
    passingPP: 384,
    competitiveness: 'Menengah'
  },
  {
    id: 'fsm-kimia-murni',
    name: 'S1 Kimia Murni',
    degree: 'S1',
    facultyId: 'fsm',
    facultyName: 'Fakultas Sains dan Matematika (FSM)',
    departmentName: 'Departemen Biokimia Terapan',
    cluster: 'teknik',
    totalSeats: 187,
    snbpSeats: 37,
    snbtSeats: 56,
    mandiriSeats: 94,
    passingScore: 598,
    passingPP: 296,
    competitiveness: 'Ramah'
  },
  {
    id: 'fsm-biologi-murni',
    name: 'S1 Biologi Murni',
    degree: 'S1',
    facultyId: 'fsm',
    facultyName: 'Fakultas Sains dan Matematika (FSM)',
    departmentName: 'Departemen Biokimia Terapan',
    cluster: 'kesehatan',
    totalSeats: 187,
    snbpSeats: 37,
    snbtSeats: 56,
    mandiriSeats: 94,
    passingScore: 595,
    passingPP: 290,
    competitiveness: 'Ramah'
  }
];

// 2. FAKULTAS TEKNIK (FT) - 3.509 Kursi
const FT_MAJORS: UndipMajor[] = [
  // Infrastruktur & Wilayah (Subtotal: 1.096)
  {
    id: 'ft-teknik-sipil',
    name: 'S1 Teknik Sipil',
    degree: 'S1',
    facultyId: 'ft',
    facultyName: 'Fakultas Teknik (FT)',
    departmentName: 'Departemen Infrastruktur & Wilayah',
    cluster: 'teknik',
    totalSeats: 306,
    snbpSeats: 61,
    snbtSeats: 92,
    mandiriSeats: 153,
    passingScore: 676,
    passingPP: 452,
    competitiveness: 'Ketat'
  },
  {
    id: 'ft-arsitektur',
    name: 'S1 Arsitektur',
    degree: 'S1',
    facultyId: 'ft',
    facultyName: 'Fakultas Teknik (FT)',
    departmentName: 'Departemen Infrastruktur & Wilayah',
    cluster: 'teknik',
    totalSeats: 306,
    snbpSeats: 61,
    snbtSeats: 92,
    mandiriSeats: 153,
    passingScore: 652,
    passingPP: 404,
    competitiveness: 'Ketat'
  },
  {
    id: 'ft-pwk',
    name: 'S1 Perencanaan Wilayah dan Kota',
    degree: 'S1',
    facultyId: 'ft',
    facultyName: 'Fakultas Teknik (FT)',
    departmentName: 'Departemen Infrastruktur & Wilayah',
    cluster: 'teknik',
    totalSeats: 272,
    snbpSeats: 54,
    snbtSeats: 82,
    mandiriSeats: 136,
    passingScore: 640,
    passingPP: 380,
    competitiveness: 'Ketat'
  },
  {
    id: 'ft-teknik-lingkungan',
    name: 'S1 Teknik Lingkungan',
    degree: 'S1',
    facultyId: 'ft',
    facultyName: 'Fakultas Teknik (FT)',
    departmentName: 'Departemen Infrastruktur & Wilayah',
    cluster: 'teknik',
    totalSeats: 212,
    snbpSeats: 42,
    snbtSeats: 64,
    mandiriSeats: 106,
    passingScore: 668,
    passingPP: 436,
    competitiveness: 'Menengah'
  },
  // Manufaktur & Maritim (Subtotal: 943)
  {
    id: 'ft-teknik-industri',
    name: 'S1 Teknik Industri',
    degree: 'S1',
    facultyId: 'ft',
    facultyName: 'Fakultas Teknik (FT)',
    departmentName: 'Departemen Manufaktur & Maritim',
    cluster: 'teknik',
    totalSeats: 298,
    snbpSeats: 60,
    snbtSeats: 89,
    mandiriSeats: 149,
    passingScore: 678,
    passingPP: 456,
    competitiveness: 'Ketat'
  },
  {
    id: 'ft-teknik-mesin',
    name: 'S1 Teknik Mesin',
    degree: 'S1',
    facultyId: 'ft',
    facultyName: 'Fakultas Teknik (FT)',
    departmentName: 'Departemen Manufaktur & Maritim',
    cluster: 'teknik',
    totalSeats: 280,
    snbpSeats: 56,
    snbtSeats: 84,
    mandiriSeats: 140,
    passingScore: 664,
    passingPP: 428,
    competitiveness: 'Ketat'
  },
  {
    id: 'ft-teknik-perkapalan',
    name: 'S1 Teknik Perkapalan',
    degree: 'S1',
    facultyId: 'ft',
    facultyName: 'Fakultas Teknik (FT)',
    departmentName: 'Departemen Manufaktur & Maritim',
    cluster: 'teknik',
    totalSeats: 246,
    snbpSeats: 49,
    snbtSeats: 74,
    mandiriSeats: 123,
    passingScore: 612,
    passingPP: 324,
    competitiveness: 'Menengah'
  },
  {
    id: 'ft-material-metalurgi',
    name: 'S1 Teknik Material & Metalurgi',
    degree: 'S1',
    facultyId: 'ft',
    facultyName: 'Fakultas Teknik (FT)',
    departmentName: 'Departemen Manufaktur & Maritim',
    cluster: 'teknik',
    totalSeats: 119,
    snbpSeats: 24,
    snbtSeats: 36,
    mandiriSeats: 59,
    passingScore: 654,
    passingPP: 408,
    competitiveness: 'Menengah'
  },
  // Proses & Energi Bumi (Subtotal: 782)
  {
    id: 'ft-teknik-kimia',
    name: 'S1 Teknik Kimia',
    degree: 'S1',
    facultyId: 'ft',
    facultyName: 'Fakultas Teknik (FT)',
    departmentName: 'Departemen Proses & Energi Bumi',
    cluster: 'teknik',
    totalSeats: 298,
    snbpSeats: 60,
    snbtSeats: 89,
    mandiriSeats: 149,
    passingScore: 663,
    passingPP: 426,
    competitiveness: 'Ketat'
  },
  {
    id: 'ft-teknik-geologi',
    name: 'S1 Teknik Geologi',
    degree: 'S1',
    facultyId: 'ft',
    facultyName: 'Fakultas Teknik (FT)',
    departmentName: 'Departemen Proses & Energi Bumi',
    cluster: 'teknik',
    totalSeats: 246,
    snbpSeats: 49,
    snbtSeats: 74,
    mandiriSeats: 123,
    passingScore: 686,
    passingPP: 472,
    competitiveness: 'Menengah'
  },
  {
    id: 'ft-teknik-geodesi',
    name: 'S1 Teknik Geodesi',
    degree: 'S1',
    facultyId: 'ft',
    facultyName: 'Fakultas Teknik (FT)',
    departmentName: 'Departemen Proses & Energi Bumi',
    cluster: 'teknik',
    totalSeats: 119,
    snbpSeats: 24,
    snbtSeats: 36,
    mandiriSeats: 59,
    passingScore: 646,
    passingPP: 392,
    competitiveness: 'Menengah'
  },
  {
    id: 'ft-teknik-pertambangan',
    name: 'S1 Teknik Pertambangan',
    degree: 'S1',
    facultyId: 'ft',
    facultyName: 'Fakultas Teknik (FT)',
    departmentName: 'Departemen Proses & Energi Bumi',
    cluster: 'teknik',
    totalSeats: 119,
    snbpSeats: 24,
    snbtSeats: 36,
    mandiriSeats: 59,
    passingScore: 676,
    passingPP: 452,
    competitiveness: 'Ketat'
  },
  // Elektro & Komputer (Subtotal: 688)
  {
    id: 'ft-teknik-elektro',
    name: 'S1 Teknik Elektro',
    degree: 'S1',
    facultyId: 'ft',
    facultyName: 'Fakultas Teknik (FT)',
    departmentName: 'Departemen Elektro & Komputer',
    cluster: 'teknik',
    totalSeats: 280,
    snbpSeats: 56,
    snbtSeats: 84,
    mandiriSeats: 140,
    passingScore: 672,
    passingPP: 444,
    competitiveness: 'Ketat'
  },
  {
    id: 'ft-teknik-komputer',
    name: 'S1 Teknik Komputer',
    degree: 'S1',
    facultyId: 'ft',
    facultyName: 'Fakultas Teknik (FT)',
    departmentName: 'Departemen Elektro & Komputer',
    cluster: 'teknik',
    totalSeats: 187,
    snbpSeats: 37,
    snbtSeats: 56,
    mandiriSeats: 94,
    passingScore: 649,
    passingPP: 398,
    competitiveness: 'Ketat'
  },
  {
    id: 'ft-teknik-biomedis',
    name: 'S1 Teknik Biomedis',
    degree: 'S1',
    facultyId: 'ft',
    facultyName: 'Fakultas Teknik (FT)',
    departmentName: 'Departemen Elektro & Komputer',
    cluster: 'teknik',
    totalSeats: 119,
    snbpSeats: 24,
    snbtSeats: 36,
    mandiriSeats: 59,
    passingScore: 668,
    passingPP: 436,
    competitiveness: 'Menengah'
  },
  {
    id: 'ft-teknik-fisika',
    name: 'S1 Teknik Fisika',
    degree: 'S1',
    facultyId: 'ft',
    facultyName: 'Fakultas Teknik (FT)',
    departmentName: 'Departemen Elektro & Komputer',
    cluster: 'teknik',
    totalSeats: 102,
    snbpSeats: 20,
    snbtSeats: 31,
    mandiriSeats: 51,
    passingScore: 638,
    passingPP: 376,
    competitiveness: 'Ramah'
  }
];

// 3. FAKULTAS ILMU SOSIAL DAN ILMU POLITIK (FISIP) - 1.410 Kursi
const FISIP_MAJORS: UndipMajor[] = [
  // Bisnis & Komunikasi (Subtotal: 799)
  {
    id: 'fisip-adbis',
    name: 'S1 Administrasi Bisnis',
    degree: 'S1',
    facultyId: 'fisip',
    facultyName: 'Fakultas Ilmu Sosial dan Ilmu Politik (FISIP)',
    departmentName: 'Departemen Bisnis & Komunikasi',
    cluster: 'bisnis',
    totalSeats: 306,
    snbpSeats: 61,
    snbtSeats: 92,
    mandiriSeats: 153,
    passingScore: 636,
    passingPP: 372,
    competitiveness: 'Ketat'
  },
  {
    id: 'fisip-ilkom',
    name: 'S1 Ilmu Komunikasi',
    degree: 'S1',
    facultyId: 'fisip',
    facultyName: 'Fakultas Ilmu Sosial dan Ilmu Politik (FISIP)',
    departmentName: 'Departemen Bisnis & Komunikasi',
    cluster: 'sosial',
    totalSeats: 306,
    snbpSeats: 61,
    snbtSeats: 92,
    mandiriSeats: 153,
    passingScore: 634,
    passingPP: 368,
    competitiveness: 'Sangat Ketat'
  },
  {
    id: 'fisip-hi',
    name: 'S1 Hubungan Internasional',
    degree: 'S1',
    facultyId: 'fisip',
    facultyName: 'Fakultas Ilmu Sosial dan Ilmu Politik (FISIP)',
    departmentName: 'Departemen Bisnis & Komunikasi',
    cluster: 'sosial',
    totalSeats: 187,
    snbpSeats: 37,
    snbtSeats: 56,
    mandiriSeats: 94,
    passingScore: 646,
    passingPP: 392,
    competitiveness: 'Ketat'
  },
  // Kebijakan Publik (Subtotal: 611)
  {
    id: 'fisip-adpub',
    name: 'S1 Administrasi Publik',
    degree: 'S1',
    facultyId: 'fisip',
    facultyName: 'Fakultas Ilmu Sosial dan Ilmu Politik (FISIP)',
    departmentName: 'Departemen Kebijakan Publik',
    cluster: 'sosial',
    totalSeats: 246,
    snbpSeats: 49,
    snbtSeats: 74,
    mandiriSeats: 123,
    passingScore: 624,
    passingPP: 348,
    competitiveness: 'Menengah'
  },
  {
    id: 'fisip-ilpem',
    name: 'S1 Ilmu Pemerintahan',
    degree: 'S1',
    facultyId: 'fisip',
    facultyName: 'Fakultas Ilmu Sosial dan Ilmu Politik (FISIP)',
    departmentName: 'Departemen Kebijakan Publik',
    cluster: 'sosial',
    totalSeats: 221,
    snbpSeats: 44,
    snbtSeats: 66,
    mandiriSeats: 111,
    passingScore: 612,
    passingPP: 324,
    competitiveness: 'Menengah'
  },
  {
    id: 'fisip-ilpol',
    name: 'S1 Ilmu Politik',
    degree: 'S1',
    facultyId: 'fisip',
    facultyName: 'Fakultas Ilmu Sosial dan Ilmu Politik (FISIP)',
    departmentName: 'Departemen Kebijakan Publik',
    cluster: 'sosial',
    totalSeats: 144,
    snbpSeats: 29,
    snbtSeats: 43,
    mandiriSeats: 72,
    passingScore: 635,
    passingPP: 370,
    competitiveness: 'Ramah'
  }
];

// 4. FAKULTAS ILMU BUDAYA (FIB) - 1.181 Kursi
const FIB_MAJORS: UndipMajor[] = [
  // Bahasa & Sastra (Subtotal: 739)
  {
    id: 'fib-mandarin',
    name: 'S1 Hubungan Budaya & Komunikasi Mandarin',
    degree: 'S1',
    facultyId: 'fib',
    facultyName: 'Fakultas Ilmu Budaya (FIB)',
    departmentName: 'Departemen Bahasa & Sastra',
    cluster: 'sastra',
    totalSeats: 246,
    snbpSeats: 49,
    snbtSeats: 74,
    mandiriSeats: 123,
    passingScore: 676,
    passingPP: 452,
    competitiveness: 'Menengah'
  },
  {
    id: 'fib-sastra-inggris',
    name: 'S1 Sastra Inggris',
    degree: 'S1',
    facultyId: 'fib',
    facultyName: 'Fakultas Ilmu Budaya (FIB)',
    departmentName: 'Departemen Bahasa & Sastra',
    cluster: 'sastra',
    totalSeats: 187,
    snbpSeats: 37,
    snbtSeats: 56,
    mandiriSeats: 94,
    passingScore: 636,
    passingPP: 372,
    competitiveness: 'Ketat'
  },
  {
    id: 'fib-sastra-jepang',
    name: 'S1 Bahasa & Kebudayaan Jepang',
    degree: 'S1',
    facultyId: 'fib',
    facultyName: 'Fakultas Ilmu Budaya (FIB)',
    departmentName: 'Departemen Bahasa & Sastra',
    cluster: 'sastra',
    totalSeats: 187,
    snbpSeats: 37,
    snbtSeats: 56,
    mandiriSeats: 94,
    passingScore: 648,
    passingPP: 396,
    competitiveness: 'Menengah'
  },
  {
    id: 'fib-sastra-indonesia',
    name: 'S1 Sastra Indonesia',
    degree: 'S1',
    facultyId: 'fib',
    facultyName: 'Fakultas Ilmu Budaya (FIB)',
    departmentName: 'Departemen Bahasa & Sastra',
    cluster: 'sastra',
    totalSeats: 119,
    snbpSeats: 24,
    snbtSeats: 36,
    mandiriSeats: 59,
    passingScore: 614,
    passingPP: 328,
    competitiveness: 'Ramah'
  },
  // Humaniora & Informasi (Subtotal: 442)
  {
    id: 'fib-humaniora-digital',
    name: 'S1 Humaniora Digital & Media Kreatif',
    degree: 'S1',
    facultyId: 'fib',
    facultyName: 'Fakultas Ilmu Budaya (FIB)',
    departmentName: 'Departemen Humaniora & Informasi',
    cluster: 'sosial',
    totalSeats: 153,
    snbpSeats: 31,
    snbtSeats: 46,
    mandiriSeats: 76,
    passingScore: 592,
    passingPP: 284,
    competitiveness: 'Menengah'
  },
  {
    id: 'fib-ilmu-perpustakaan',
    name: 'S1 Ilmu Perpustakaan & Informasi',
    degree: 'S1',
    facultyId: 'fib',
    facultyName: 'Fakultas Ilmu Budaya (FIB)',
    departmentName: 'Departemen Humaniora & Informasi',
    cluster: 'sosial',
    totalSeats: 119,
    snbpSeats: 24,
    snbtSeats: 36,
    mandiriSeats: 59,
    passingScore: 584,
    passingPP: 268,
    competitiveness: 'Ramah'
  },
  {
    id: 'fib-antropologi',
    name: 'S1 Antropologi Sosial',
    degree: 'S1',
    facultyId: 'fib',
    facultyName: 'Fakultas Ilmu Budaya (FIB)',
    departmentName: 'Departemen Humaniora & Informasi',
    cluster: 'sosial',
    totalSeats: 85,
    snbpSeats: 17,
    snbtSeats: 26,
    mandiriSeats: 42,
    passingScore: 582,
    passingPP: 264,
    competitiveness: 'Sepi Peminat'
  },
  {
    id: 'fib-sejarah',
    name: 'S1 Sejarah',
    degree: 'S1',
    facultyId: 'fib',
    facultyName: 'Fakultas Ilmu Budaya (FIB)',
    departmentName: 'Departemen Humaniora & Informasi',
    cluster: 'sosial',
    totalSeats: 85,
    snbpSeats: 17,
    snbtSeats: 26,
    mandiriSeats: 42,
    passingScore: 568,
    passingPP: 236,
    competitiveness: 'Sepi Peminat'
  }
];

// 5. FAKULTAS EKONOMIKA DAN BISNIS (FEB) - 1.523 Kursi
const FEB_MAJORS: UndipMajor[] = [
  {
    id: 'feb-manajemen',
    name: 'S1 Manajemen',
    degree: 'S1',
    facultyId: 'feb',
    facultyName: 'Fakultas Ekonomika dan Bisnis (FEB)',
    departmentName: 'Departemen Bisnis & Ekonomi Digital',
    cluster: 'bisnis',
    totalSeats: 435,
    snbpSeats: 87,
    snbtSeats: 130,
    mandiriSeats: 218,
    passingScore: 663,
    passingPP: 426,
    competitiveness: 'Sangat Ketat'
  },
  {
    id: 'feb-akuntansi',
    name: 'S1 Akuntansi',
    degree: 'S1',
    facultyId: 'feb',
    facultyName: 'Fakultas Ekonomika dan Bisnis (FEB)',
    departmentName: 'Departemen Bisnis & Ekonomi Digital',
    cluster: 'bisnis',
    totalSeats: 348,
    snbpSeats: 70,
    snbtSeats: 104,
    mandiriSeats: 174,
    passingScore: 648,
    passingPP: 396,
    competitiveness: 'Ketat'
  },
  {
    id: 'feb-ekonomi',
    name: 'S1 Ekonomi',
    degree: 'S1',
    facultyId: 'feb',
    facultyName: 'Fakultas Ekonomika dan Bisnis (FEB)',
    departmentName: 'Departemen Bisnis & Ekonomi Digital',
    cluster: 'bisnis',
    totalSeats: 332,
    snbpSeats: 66,
    snbtSeats: 100,
    mandiriSeats: 166,
    passingScore: 624,
    passingPP: 348,
    competitiveness: 'Menengah'
  },
  {
    id: 'feb-bisnis-digital',
    name: 'S1 Bisnis Digital',
    degree: 'S1',
    facultyId: 'feb',
    facultyName: 'Fakultas Ekonomika dan Bisnis (FEB)',
    departmentName: 'Departemen Bisnis & Ekonomi Digital',
    cluster: 'bisnis',
    totalSeats: 221,
    snbpSeats: 44,
    snbtSeats: 66,
    mandiriSeats: 111,
    passingScore: 674,
    passingPP: 448,
    competitiveness: 'Ketat'
  },
  {
    id: 'feb-ekonomi-islam',
    name: 'S1 Ekonomi Islam/Syariah',
    degree: 'S1',
    facultyId: 'feb',
    facultyName: 'Fakultas Ekonomika dan Bisnis (FEB)',
    departmentName: 'Departemen Bisnis & Ekonomi Digital',
    cluster: 'bisnis',
    totalSeats: 187,
    snbpSeats: 37,
    snbtSeats: 56,
    mandiriSeats: 94,
    passingScore: 609,
    passingPP: 318,
    competitiveness: 'Ramah'
  }
];

// 6. FAKULTAS PERIKANAN DAN ILMU KELAUTAN (FPIK) - 960 Kursi
const FPIK_MAJORS: UndipMajor[] = [
  // Sains Kelautan (Subtotal: 485)
  {
    id: 'fpik-ilmu-kelautan',
    name: 'S1 Ilmu Kelautan',
    degree: 'S1',
    facultyId: 'fpik',
    facultyName: 'Fakultas Perikanan dan Ilmu Kelautan (FPIK)',
    departmentName: 'Departemen Sains Kelautan',
    cluster: 'kesehatan',
    totalSeats: 187,
    snbpSeats: 37,
    snbtSeats: 56,
    mandiriSeats: 94,
    passingScore: 602,
    passingPP: 304,
    competitiveness: 'Ramah'
  },
  {
    id: 'fpik-oceanografi',
    name: 'S1 Oceanografi',
    degree: 'S1',
    facultyId: 'fpik',
    facultyName: 'Fakultas Perikanan dan Ilmu Kelautan (FPIK)',
    departmentName: 'Departemen Sains Kelautan',
    cluster: 'teknik',
    totalSeats: 162,
    snbpSeats: 32,
    snbtSeats: 49,
    mandiriSeats: 81,
    passingScore: 618,
    passingPP: 336,
    competitiveness: 'Ramah'
  },
  {
    id: 'fpik-akuakultur',
    name: 'S1 Akuakultur/Budidaya Perairan',
    degree: 'S1',
    facultyId: 'fpik',
    facultyName: 'Fakultas Perikanan dan Ilmu Kelautan (FPIK)',
    departmentName: 'Departemen Sains Kelautan',
    cluster: 'kesehatan',
    totalSeats: 136,
    snbpSeats: 27,
    snbtSeats: 41,
    mandiriSeats: 68,
    passingScore: 578,
    passingPP: 256,
    competitiveness: 'Sepi Peminat'
  },
  // Industri Perikanan (Subtotal: 475)
  {
    id: 'fpik-msp',
    name: 'S1 Manajemen Sumberdaya Perairan',
    degree: 'S1',
    facultyId: 'fpik',
    facultyName: 'Fakultas Perikanan dan Ilmu Kelautan (FPIK)',
    departmentName: 'Departemen Industri Perikanan',
    cluster: 'kesehatan',
    totalSeats: 187,
    snbpSeats: 37,
    snbtSeats: 56,
    mandiriSeats: 94,
    passingScore: 582,
    passingPP: 264,
    competitiveness: 'Ramah'
  },
  {
    id: 'fpik-thp',
    name: 'S1 Teknologi Hasil Perikanan',
    degree: 'S1',
    facultyId: 'fpik',
    facultyName: 'Fakultas Perikanan dan Ilmu Kelautan (FPIK)',
    departmentName: 'Departemen Industri Perikanan',
    cluster: 'kesehatan',
    totalSeats: 144,
    snbpSeats: 29,
    snbtSeats: 43,
    mandiriSeats: 72,
    passingScore: 565,
    passingPP: 230,
    competitiveness: 'Sepi Peminat'
  },
  {
    id: 'fpik-perikanan-tangkap',
    name: 'S1 Perikanan Tangkap',
    degree: 'S1',
    facultyId: 'fpik',
    facultyName: 'Fakultas Perikanan dan Ilmu Kelautan (FPIK)',
    departmentName: 'Departemen Industri Perikanan',
    cluster: 'kesehatan',
    totalSeats: 144,
    snbpSeats: 29,
    snbtSeats: 43,
    mandiriSeats: 72,
    passingScore: 559,
    passingPP: 218,
    competitiveness: 'Sepi Peminat'
  }
];

// 7. FAKULTAS PETERNAKAN DAN PERTANIAN (FPP) - 985 Kursi
const FPP_MAJORS: UndipMajor[] = [
  {
    id: 'fpp-peternakan',
    name: 'S1 Peternakan',
    degree: 'S1',
    facultyId: 'fpp',
    facultyName: 'Fakultas Peternakan dan Pertanian (FPP)',
    departmentName: 'Departemen Agro-Sains & Pangan',
    cluster: 'kesehatan',
    totalSeats: 306,
    snbpSeats: 61,
    snbtSeats: 92,
    mandiriSeats: 153,
    passingScore: 592,
    passingPP: 284,
    competitiveness: 'Ramah'
  },
  {
    id: 'fpp-agribisnis',
    name: 'S1 Agribisnis',
    degree: 'S1',
    facultyId: 'fpp',
    facultyName: 'Fakultas Peternakan dan Pertanian (FPP)',
    departmentName: 'Departemen Agro-Sains & Pangan',
    cluster: 'bisnis',
    totalSeats: 246,
    snbpSeats: 49,
    snbtSeats: 74,
    mandiriSeats: 123,
    passingScore: 620,
    passingPP: 340,
    competitiveness: 'Menengah'
  },
  {
    id: 'fpp-teknologi-pangan',
    name: 'S1 Teknologi Pangan',
    degree: 'S1',
    facultyId: 'fpp',
    facultyName: 'Fakultas Peternakan dan Pertanian (FPP)',
    departmentName: 'Departemen Agro-Sains & Pangan',
    cluster: 'kesehatan',
    totalSeats: 246,
    snbpSeats: 49,
    snbtSeats: 74,
    mandiriSeats: 123,
    passingScore: 650,
    passingPP: 400,
    competitiveness: 'Ketat'
  },
  {
    id: 'fpp-agroekoteknologi',
    name: 'S1 Agroekoteknologi',
    degree: 'S1',
    facultyId: 'fpp',
    facultyName: 'Fakultas Peternakan dan Pertanian (FPP)',
    departmentName: 'Departemen Agro-Sains & Pangan',
    cluster: 'kesehatan',
    totalSeats: 187,
    snbpSeats: 37,
    snbtSeats: 56,
    mandiriSeats: 94,
    passingScore: 595,
    passingPP: 290,
    competitiveness: 'Ramah'
  }
];

// 8. FAKULTAS KEDOKTERAN (FK) - 1.208 Kursi
const FK_MAJORS: UndipMajor[] = [
  // Pendukung Medis (Subtotal: 723)
  {
    id: 'fk-keperawatan',
    name: 'S1 Keperawatan',
    degree: 'S1',
    facultyId: 'fk',
    facultyName: 'Fakultas Kedokteran (FK)',
    departmentName: 'Departemen Pendukung Medis',
    cluster: 'kesehatan',
    totalSeats: 367,
    snbpSeats: 73,
    snbtSeats: 110,
    mandiriSeats: 184,
    passingScore: 642,
    passingPP: 384,
    competitiveness: 'Ketat'
  },
  {
    id: 'fk-gizi',
    name: 'S1 Gizi',
    degree: 'S1',
    facultyId: 'fk',
    facultyName: 'Fakultas Kedokteran (FK)',
    departmentName: 'Departemen Pendukung Medis',
    cluster: 'kesehatan',
    totalSeats: 212,
    snbpSeats: 42,
    snbtSeats: 64,
    mandiriSeats: 106,
    passingScore: 648,
    passingPP: 396,
    competitiveness: 'Ketat'
  },
  {
    id: 'fk-farmasi',
    name: 'S1 Farmasi',
    degree: 'S1',
    facultyId: 'fk',
    facultyName: 'Fakultas Kedokteran (FK)',
    departmentName: 'Departemen Pendukung Medis',
    cluster: 'kesehatan',
    totalSeats: 144,
    snbpSeats: 29,
    snbtSeats: 43,
    mandiriSeats: 72,
    passingScore: 660,
    passingPP: 420,
    competitiveness: 'Sangat Ketat'
  },
  // Kedokteran (Subtotal: 485)
  {
    id: 'fk-kedokteran-umum',
    name: 'S1 Kedokteran Umum',
    degree: 'S1',
    facultyId: 'fk',
    facultyName: 'Fakultas Kedokteran (FK)',
    departmentName: 'Departemen Kedokteran',
    cluster: 'kesehatan',
    totalSeats: 366,
    snbpSeats: 73,
    snbtSeats: 110,
    mandiriSeats: 183,
    passingScore: 718,
    passingPP: 590,
    competitiveness: 'Sangat Ketat'
  },
  {
    id: 'fk-kedokteran-gigi',
    name: 'S1 Kedokteran Gigi',
    degree: 'S1',
    facultyId: 'fk',
    facultyName: 'Fakultas Kedokteran (FK)',
    departmentName: 'Departemen Kedokteran',
    cluster: 'kesehatan',
    totalSeats: 119,
    snbpSeats: 24,
    snbtSeats: 36,
    mandiriSeats: 59,
    passingScore: 688,
    passingPP: 476,
    competitiveness: 'Sangat Ketat'
  }
];

// 9. FAKULTAS KESEHATAN MASYARAKAT (FKM) - 553 Kursi
const FKM_MAJORS: UndipMajor[] = [
  {
    id: 'fkm-kesmas',
    name: 'S1 Kesehatan Masyarakat',
    degree: 'S1',
    facultyId: 'fkm',
    facultyName: 'Fakultas Kesehatan Masyarakat (FKM)',
    departmentName: 'Departemen Kesehatan Masyarakat',
    cluster: 'kesehatan',
    totalSeats: 366,
    snbpSeats: 73,
    snbtSeats: 110,
    mandiriSeats: 183,
    passingScore: 636,
    passingPP: 372,
    competitiveness: 'Menengah'
  },
  {
    id: 'fkm-k3',
    name: 'S1 Keselamatan & Kesehatan Kerja',
    degree: 'S1',
    facultyId: 'fkm',
    facultyName: 'Fakultas Kesehatan Masyarakat (FKM)',
    departmentName: 'Departemen Kesehatan Masyarakat',
    cluster: 'kesehatan',
    totalSeats: 187,
    snbpSeats: 37,
    snbtSeats: 56,
    mandiriSeats: 94,
    passingScore: 652,
    passingPP: 404,
    competitiveness: 'Ketat'
  }
];

// 10. FAKULTAS HUKUM (FH) - 1.174 Kursi
const FH_MAJORS: UndipMajor[] = [
  {
    id: 'fh-ilmu-hukum',
    name: 'S1 Ilmu Hukum',
    degree: 'S1',
    facultyId: 'fh',
    facultyName: 'Fakultas Hukum (FH)',
    departmentName: 'Departemen Hukum',
    cluster: 'sosial',
    totalSeats: 1174,
    snbpSeats: 235,
    snbtSeats: 352,
    mandiriSeats: 587,
    passingScore: 642,
    passingPP: 384,
    competitiveness: 'Ketat'
  }
];

// 11. FAKULTAS PSIKOLOGI - 494 Kursi
const PSIKOLOGI_MAJORS: UndipMajor[] = [
  {
    id: 'psi-psikologi',
    name: 'S1 Psikologi',
    degree: 'S1',
    facultyId: 'psikologi',
    facultyName: 'Fakultas Psikologi',
    departmentName: 'Departemen Psikologi',
    cluster: 'sosial',
    totalSeats: 494,
    snbpSeats: 99,
    snbtSeats: 148,
    mandiriSeats: 247,
    passingScore: 652,
    passingPP: 404,
    competitiveness: 'Sangat Ketat'
  }
];

// 12. SEKOLAH VOKASI (SV) - 2.048 Kursi
const SV_MAJORS: UndipMajor[] = [
  // Teknologi Industri (Subtotal: 662)
  {
    id: 'sv-rekayasa-kimia-industri',
    name: 'D4 Teknologi Rekayasa Kimia Industri',
    degree: 'D4',
    facultyId: 'sv',
    facultyName: 'Sekolah Vokasi (SV)',
    departmentName: 'Departemen Teknologi Industri',
    cluster: 'teknik',
    totalSeats: 119,
    snbpSeats: 24,
    snbtSeats: 36,
    mandiriSeats: 59,
    passingScore: 643,
    passingPP: 386,
    competitiveness: 'Menengah'
  },
  {
    id: 'sv-rekayasa-perancangan-mekanik',
    name: 'D4 Rekayasa Perancangan Mekanik',
    degree: 'D4',
    facultyId: 'sv',
    facultyName: 'Sekolah Vokasi (SV)',
    departmentName: 'Departemen Teknologi Industri',
    cluster: 'teknik',
    totalSeats: 144,
    snbpSeats: 29,
    snbtSeats: 43,
    mandiriSeats: 72,
    passingScore: 594,
    passingPP: 288,
    competitiveness: 'Menengah'
  },
  {
    id: 'sv-rekayasa-otomasi',
    name: 'D4 Teknologi Rekayasa Otomasi',
    degree: 'D4',
    facultyId: 'sv',
    facultyName: 'Sekolah Vokasi (SV)',
    departmentName: 'Departemen Teknologi Industri',
    cluster: 'teknik',
    totalSeats: 144,
    snbpSeats: 29,
    snbtSeats: 43,
    mandiriSeats: 72,
    passingScore: 615,
    passingPP: 330,
    competitiveness: 'Menengah'
  },
  {
    id: 'sv-konstruksi-perkapalan',
    name: 'D4 Teknologi Rekayasa Konstruksi Perkapalan',
    degree: 'D4',
    facultyId: 'sv',
    facultyName: 'Sekolah Vokasi (SV)',
    departmentName: 'Departemen Teknologi Industri',
    cluster: 'teknik',
    totalSeats: 119,
    snbpSeats: 24,
    snbtSeats: 36,
    mandiriSeats: 59,
    passingScore: 597,
    passingPP: 294,
    competitiveness: 'Ramah'
  },
  {
    id: 'sv-listrik-industri',
    name: 'D4 Teknik Listrik Industri',
    degree: 'D4',
    facultyId: 'sv',
    facultyName: 'Sekolah Vokasi (SV)',
    departmentName: 'Departemen Teknologi Industri',
    cluster: 'teknik',
    totalSeats: 136,
    snbpSeats: 27,
    snbtSeats: 41,
    mandiriSeats: 68,
    passingScore: 608,
    passingPP: 316,
    competitiveness: 'Menengah'
  },
  // Sipil dan Perencanaan (Subtotal: 391)
  {
    id: 'sv-sipil-arsitektur',
    name: 'D4 Teknik Infrastruktur Sipil & Perancangan Arsitektur',
    degree: 'D4',
    facultyId: 'sv',
    facultyName: 'Sekolah Vokasi (SV)',
    departmentName: 'Departemen Sipil dan Perencanaan',
    cluster: 'teknik',
    totalSeats: 221,
    snbpSeats: 44,
    snbtSeats: 66,
    mandiriSeats: 111,
    passingScore: 642,
    passingPP: 384,
    competitiveness: 'Menengah'
  },
  {
    id: 'sv-tata-ruang-pertanahan',
    name: 'D4 Perencanaan Tata Ruang & Pertanahan',
    degree: 'D4',
    facultyId: 'sv',
    facultyName: 'Sekolah Vokasi (SV)',
    departmentName: 'Departemen Sipil dan Perencanaan',
    cluster: 'teknik',
    totalSeats: 170,
    snbpSeats: 34,
    snbtSeats: 51,
    mandiriSeats: 85,
    passingScore: 598,
    passingPP: 296,
    competitiveness: 'Ramah'
  },
  // Bisnis dan Keuangan (Subtotal: 604)
  {
    id: 'sv-akuntansi-perpajakan',
    name: 'D4 Akuntansi Perpajakan',
    degree: 'D4',
    facultyId: 'sv',
    facultyName: 'Sekolah Vokasi (SV)',
    departmentName: 'Departemen Bisnis dan Keuangan',
    cluster: 'bisnis',
    totalSeats: 383,
    snbpSeats: 77,
    snbtSeats: 115,
    mandiriSeats: 191,
    passingScore: 638,
    passingPP: 376,
    competitiveness: 'Ketat'
  },
  {
    id: 'sv-manajemen-logistik',
    name: 'D4 Manajemen & Administrasi Logistik',
    degree: 'D4',
    facultyId: 'sv',
    facultyName: 'Sekolah Vokasi (SV)',
    departmentName: 'Departemen Bisnis dan Keuangan',
    cluster: 'bisnis',
    totalSeats: 221,
    snbpSeats: 44,
    snbtSeats: 66,
    mandiriSeats: 111,
    passingScore: 645,
    passingPP: 390,
    competitiveness: 'Menengah'
  },
  // Informasi dan Budaya (Subtotal: 391)
  {
    id: 'sv-bahasa-asing-terapan',
    name: 'D4 Bahasa Asing Terapan',
    degree: 'D4',
    facultyId: 'sv',
    facultyName: 'Sekolah Vokasi (SV)',
    departmentName: 'Departemen Informasi dan Budaya',
    cluster: 'sastra',
    totalSeats: 170,
    snbpSeats: 34,
    snbtSeats: 51,
    mandiriSeats: 85,
    passingScore: 588,
    passingPP: 276,
    competitiveness: 'Ramah'
  },
  {
    id: 'sv-humas',
    name: 'D4 Informasi & Hubungan Masyarakat',
    degree: 'D4',
    facultyId: 'sv',
    facultyName: 'Sekolah Vokasi (SV)',
    departmentName: 'Departemen Informasi dan Budaya',
    cluster: 'sosial',
    totalSeats: 221,
    snbpSeats: 44,
    snbtSeats: 66,
    mandiriSeats: 111,
    passingScore: 614,
    passingPP: 328,
    competitiveness: 'Menengah'
  }
];

export const ALL_UNDIP_MAJORS: UndipMajor[] = [
  ...FSM_MAJORS,
  ...FT_MAJORS,
  ...FISIP_MAJORS,
  ...FIB_MAJORS,
  ...FEB_MAJORS,
  ...FPIK_MAJORS,
  ...FPP_MAJORS,
  ...FK_MAJORS,
  ...FKM_MAJORS,
  ...FH_MAJORS,
  ...PSIKOLOGI_MAJORS,
  ...SV_MAJORS
];

export const UNDIP_FACULTIES: UndipFaculty[] = [
  {
    id: 'fsm',
    name: 'Fakultas Sains dan Matematika',
    shortName: 'FSM',
    totalSeats: 1955,
    departments: [
      {
        name: 'Departemen Komputasi & Data',
        subtotal: 637,
        majors: FSM_MAJORS.filter(m => m.departmentName === 'Departemen Komputasi & Data')
      },
      {
        name: 'Departemen Sains Eksplorasi & Instrumentasi Medis',
        subtotal: 451,
        majors: FSM_MAJORS.filter(m => m.departmentName === 'Departemen Sains Eksplorasi & Instrumentasi Medis')
      },
      {
        name: 'Departemen Biokimia Terapan',
        subtotal: 867,
        majors: FSM_MAJORS.filter(m => m.departmentName === 'Departemen Biokimia Terapan')
      }
    ]
  },
  {
    id: 'ft',
    name: 'Fakultas Teknik',
    shortName: 'FT',
    totalSeats: 3509,
    departments: [
      {
        name: 'Departemen Infrastruktur & Wilayah',
        subtotal: 1096,
        majors: FT_MAJORS.filter(m => m.departmentName === 'Departemen Infrastruktur & Wilayah')
      },
      {
        name: 'Departemen Manufaktur & Maritim',
        subtotal: 943,
        majors: FT_MAJORS.filter(m => m.departmentName === 'Departemen Manufaktur & Maritim')
      },
      {
        name: 'Departemen Proses & Energi Bumi',
        subtotal: 782,
        majors: FT_MAJORS.filter(m => m.departmentName === 'Departemen Proses & Energi Bumi')
      },
      {
        name: 'Departemen Elektro & Komputer',
        subtotal: 688,
        majors: FT_MAJORS.filter(m => m.departmentName === 'Departemen Elektro & Komputer')
      }
    ]
  },
  {
    id: 'fisip',
    name: 'Fakultas Ilmu Sosial dan Ilmu Politik',
    shortName: 'FISIP',
    totalSeats: 1410,
    departments: [
      {
        name: 'Departemen Bisnis & Komunikasi',
        subtotal: 799,
        majors: FISIP_MAJORS.filter(m => m.departmentName === 'Departemen Bisnis & Komunikasi')
      },
      {
        name: 'Departemen Kebijakan Publik',
        subtotal: 611,
        majors: FISIP_MAJORS.filter(m => m.departmentName === 'Departemen Kebijakan Publik')
      }
    ]
  },
  {
    id: 'fib',
    name: 'Fakultas Ilmu Budaya',
    shortName: 'FIB',
    totalSeats: 1181,
    departments: [
      {
        name: 'Departemen Bahasa & Sastra',
        subtotal: 739,
        majors: FIB_MAJORS.filter(m => m.departmentName === 'Departemen Bahasa & Sastra')
      },
      {
        name: 'Departemen Humaniora & Informasi',
        subtotal: 442,
        majors: FIB_MAJORS.filter(m => m.departmentName === 'Departemen Humaniora & Informasi')
      }
    ]
  },
  {
    id: 'feb',
    name: 'Fakultas Ekonomika dan Bisnis',
    shortName: 'FEB',
    totalSeats: 1523,
    departments: [
      {
        name: 'Departemen Bisnis & Ekonomi Digital',
        subtotal: 1523,
        majors: FEB_MAJORS
      }
    ]
  },
  {
    id: 'fpik',
    name: 'Fakultas Perikanan dan Ilmu Kelautan',
    shortName: 'FPIK',
    totalSeats: 960,
    departments: [
      {
        name: 'Departemen Sains Kelautan',
        subtotal: 485,
        majors: FPIK_MAJORS.filter(m => m.departmentName === 'Departemen Sains Kelautan')
      },
      {
        name: 'Departemen Industri Perikanan',
        subtotal: 475,
        majors: FPIK_MAJORS.filter(m => m.departmentName === 'Departemen Industri Perikanan')
      }
    ]
  },
  {
    id: 'fpp',
    name: 'Fakultas Peternakan dan Pertanian',
    shortName: 'FPP',
    totalSeats: 985,
    departments: [
      {
        name: 'Departemen Agro-Sains & Pangan',
        subtotal: 985,
        majors: FPP_MAJORS
      }
    ]
  },
  {
    id: 'fk',
    name: 'Fakultas Kedokteran',
    shortName: 'FK',
    totalSeats: 1208,
    departments: [
      {
        name: 'Departemen Pendukung Medis',
        subtotal: 723,
        majors: FK_MAJORS.filter(m => m.departmentName === 'Departemen Pendukung Medis')
      },
      {
        name: 'Departemen Kedokteran',
        subtotal: 485,
        majors: FK_MAJORS.filter(m => m.departmentName === 'Departemen Kedokteran')
      }
    ]
  },
  {
    id: 'fkm',
    name: 'Fakultas Kesehatan Masyarakat',
    shortName: 'FKM',
    totalSeats: 553,
    departments: [
      {
        name: 'Departemen Kesehatan Masyarakat',
        subtotal: 553,
        majors: FKM_MAJORS
      }
    ]
  },
  {
    id: 'fh',
    name: 'Fakultas Hukum',
    shortName: 'FH',
    totalSeats: 1174,
    departments: [
      {
        name: 'Departemen Hukum',
        subtotal: 1174,
        majors: FH_MAJORS
      }
    ]
  },
  {
    id: 'psikologi',
    name: 'Fakultas Psikologi',
    shortName: 'F.Psikologi',
    totalSeats: 494,
    departments: [
      {
        name: 'Departemen Psikologi',
        subtotal: 494,
        majors: PSIKOLOGI_MAJORS
      }
    ]
  },
  {
    id: 'sv',
    name: 'Sekolah Vokasi',
    shortName: 'SV',
    totalSeats: 2048,
    departments: [
      {
        name: 'Departemen Teknologi Industri',
        subtotal: 662,
        majors: SV_MAJORS.filter(m => m.departmentName === 'Departemen Teknologi Industri')
      },
      {
        name: 'Departemen Sipil dan Perencanaan',
        subtotal: 391,
        majors: SV_MAJORS.filter(m => m.departmentName === 'Departemen Sipil dan Perencanaan')
      },
      {
        name: 'Departemen Bisnis dan Keuangan',
        subtotal: 604,
        majors: SV_MAJORS.filter(m => m.departmentName === 'Departemen Bisnis dan Keuangan')
      },
      {
        name: 'Departemen Informasi dan Budaya',
        subtotal: 391,
        majors: SV_MAJORS.filter(m => m.departmentName === 'Departemen Informasi dan Budaya')
      }
    ]
  }
];

export const UNDIP_2030_METADATA = {
  title: 'MASTER REKAPITULASI DATA DAYA TAMPUNG TOTAL DAN FINAL UNDIP 2030',
  edition: 'Edisi 17.000 Kursi',
  grandTotal: 17000,
  snbpTotal: 3395,
  snbtTotal: 5097,
  mandiriTotal: 8508,
  rules: {
    title: 'METADATA JALUR SELEKSI SNBT 2030 (ATURAN BARU)',
    targetTrack: 'KHUSUS JALUR SNBT (Seleksi Nasional Berdasarkan Tes)',
    flow: 'Ujian/Tes UTBK terlebih dahulu → Rilis Nilai Resmi → Pemilihan Program Studi.',
    maxS1: 10,
    maxD4: 5,
    maxTotal: 15,
    mechanism: 'Sistem seleksi nasional akan melakukan perankingan nilai UTBK peserta secara otomatis terhadap daya tampung program studi yang dikunci langsung oleh peserta.'
  },
  allPathways: [
    {
      id: 'snbp',
      name: 'SNBP (Seleksi Nasional Berdasarkan Prestasi)',
      quotaPercent: '20%',
      seats: 3395,
      badgeColor: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
      tagline: 'Seleksi Undangan Rapor & Prestasi Unggul',
      basis: 'Nilai rapor semester 1-5, sertifikat prestasi akademik/non-akademik, portofolio seni/olahraga, dan akreditasi/rekam jejak sekolah.',
      choiceRules: 'Maksimal 2 program studi (jika memilih 2 prodi, minimal 1 prodi harus berada di PTN satu provinsi dengan SMA/SMK asal).',
      consequence: 'Peserta yang dinyatakan LULUS SNBP secara sistem dikunci dan TIDAK BOLEH mendaftar SNBT maupun Ujian Mandiri di seluruh PTN se-Indonesia.',
      isThisSimulatorTrack: false
    },
    {
      id: 'snbt',
      name: 'SNBT (Seleksi Nasional Berdasarkan Tes) - ATURAN BARU 2030',
      quotaPercent: '30%',
      seats: 5097,
      badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      tagline: 'Tes UTBK Terstandarisasi & Perankingan Nasional',
      basis: '100% Nilai Murni Ujian Tulis Berbasis Komputer (UTBK) yang mencakup 7 subtes dengan pembobotan spesifik sesuai rumpun keilmuan prodi.',
      choiceRules: 'Aturan Baru 2030: Peserta mengikuti tes terlebih dahulu, setelah skor keluar peserta menyusun hingga 15 pilihan (maksimal 10 S1 dan maksimal 5 D4).',
      consequence: 'Peserta yang dinyatakan lolos pada salah satu prioritas SNBT langsung mengunci kursinya dan tidak dapat mendaftar jalur mandiri tertentu sesuai regulasi.',
      isThisSimulatorTrack: true
    },
    {
      id: 'mandiri',
      name: 'Ujian Mandiri (UM UNDIP) & SBUB / IUP / Kemitraan',
      quotaPercent: '50%',
      seats: 8508,
      badgeColor: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
      tagline: 'Seleksi Mandiri PTN-BH Universitas Diponegoro',
      basis: 'Ujian Tertulis Berbasis Komputer Mandiri (CBT Mandiri UNDIP), portofolio, nilai UTBK, dan pertimbangan SPI (Sumbangan Pengembangan Institusi).',
      choiceRules: 'Dikelola otonom oleh Universitas Diponegoro. Memiliki sub-jalur seperti UM Reguler, SBUB (Bibit Unggul Berprestasi), Kemitraan Kerjasama, dan International Undergraduate Program (IUP).',
      consequence: 'Memiliki komponen biaya UKT dan SPI (IPI). Memberi kesempatan kedua bagi peserta yang belum beruntung di SNBP atau SNBT.',
      isThisSimulatorTrack: false
    }
  ]
};

export interface UserUtbkScores {
  pu: number;
  pbm: number;
  ppu: number;
  pk: number;
  litIndo: number;
  litIng: number;
  pm: number;
}

/**
 * Helper to get short label of top weighted subtests for each cluster
 */
export function getClusterHighlightText(cluster: ProdiCluster): string {
  switch (cluster) {
    case 'teknik':
      return 'PM 25% • PK 20% • PU 20%';
    case 'sosial':
      return 'PBM 25% • Lit-ID 25% • PPU 15% • PU 15%';
    case 'kesehatan':
      return 'PU 25% • Lit-EN 25% • PK 15% • PM 15%';
    case 'bisnis':
      return 'PK 25% • PM 25% • Lit-EN 15% • PU 15%';
    case 'sastra':
      return 'Lit-EN 30% • PPU 25% • Lit-ID 15%';
    default:
      return 'Bobot Rumpun Standar';
  }
}

/**
 * Converts weighted score to osu! PP scale (piecewise formula matching simulator).
 */
export function scoreToOsuPP(score: number): number {
  if (score >= 700) {
    return 500 + ((score - 700) / (1000 - 700)) * (2000 - 500);
  } else if (score >= 500) {
    return 100 + ((score - 500) / (700 - 500)) * (500 - 100);
  } else if (score >= 232) {
    return 1 + ((score - 232) / (500 - 232)) * (100 - 1);
  } else {
    return 1;
  }
}

/**
 * Calculates complete weighted score, subtest nerf/penalty, and PP matching the osu! PP Simulator.
 */
export function calculateClusterScoreAndPP(
  scores: UserUtbkScores,
  cluster: ProdiCluster
): {
  rawScore: number;
  penalty: number;
  penaltyPercent: number;
  finalScore: number;
  pp: number;
} {
  const c = CLUSTER_WEIGHTS[cluster];
  const w = c ? c.weights : { pu: 1/7, pbm: 1/7, ppu: 1/7, pk: 1/7, litIndo: 1/7, litIng: 1/7, pm: 1/7 };

  const rawScore = (
    scores.pu * w.pu +
    scores.pbm * w.pbm +
    scores.ppu * w.ppu +
    scores.pk * w.pk +
    scores.litIndo * w.litIndo +
    scores.litIng * w.litIng +
    scores.pm * w.pm
  );

  const subtests = [
    { val: scores.pu, weight: w.pu },
    { val: scores.pbm, weight: w.pbm },
    { val: scores.ppu, weight: w.ppu },
    { val: scores.pk, weight: w.pk },
    { val: scores.litIndo, weight: w.litIndo },
    { val: scores.litIng, weight: w.litIng },
    { val: scores.pm, weight: w.pm },
  ];

  let sumSeverity = 0;
  subtests.forEach(sub => {
    const zNat = (sub.val - 500) / 105;
    if (zNat < 1.0) {
      let severity = 0;
      if (zNat >= 0.0) {
        severity = (1.0 - zNat) * 1.5;
      } else {
        severity = 1.5 + Math.abs(zNat) * 4.0;
      }
      sumSeverity += sub.weight * severity;
    }
  });

  const penaltyFactor = 1.0 - Math.min(0.10, sumSeverity * 0.10);
  const finalScore = rawScore * penaltyFactor;
  const pp = scoreToOsuPP(finalScore);

  return {
    rawScore,
    penalty: penaltyFactor,
    penaltyPercent: (1.0 - penaltyFactor) * 100,
    finalScore,
    pp
  };
}

/**
 * Calculates weighted score for a major given the user's 7 subtest scores (incorporates PP simulator weighting & subtest nerf).
 */
export function calculateMajorWeightedScore(scores: UserUtbkScores, cluster: ProdiCluster): number {
  return calculateClusterScoreAndPP(scores, cluster).finalScore;
}

/**
 * Calculates the exact PP of a candidate for a specific major cluster.
 */
export function calculateMajorPP(scores: UserUtbkScores, cluster: ProdiCluster): number {
  return calculateClusterScoreAndPP(scores, cluster).pp;
}
