export interface TierVisualInfo {
  tierId: string;
  name: string;
  description: string;
  visual: {
    environment: string;
    astronautAction: string;
    props: string[];
  };
  ui: {
    themeColor: string;
    hexCode: string;
    dominantColor: string;
    neonGlow: string;
  };
  motion: {
    cameraBehavior: string;
    particleEffect: string;
  };
}

export const TIER_VISUAL_DATA: Record<string, TierVisualInfo> = {
  "145-160": {
    tierId: "145-160",
    name: "GALACTIC LEGEND",
    description: "Satu langkah lagi menuju keabadian. Anda berada di puncak evolusi kognitif.",
    visual: {
      environment: "Nebula berwarna ungu-emas yang berputar lambat",
      astronautAction: "Mengambang tenang dengan aura cahaya putih",
      props: ["Piala Emas Raksasa"]
    },
    ui: {
      themeColor: "Sian Kosmis",
      hexCode: "#00F0FF",
      dominantColor: "#0D001F",
      neonGlow: "0 0 25px #00F0FF, 0 0 40px #BF00FF",
    },
    motion: {
      cameraBehavior: "Pergerakan kamera sangat tenang dan megah",
      particleEffect: "Debu bintang keemasan yang berkilau"
    }
  },
  "135-145": {
    tierId: "135-145",
    name: "COSMIC OVERLORD",
    description: "Kekuatan intelektual Anda melengkungkan ruang dan waktu.",
    visual: {
      environment: "Hujan meteor yang membeku di udara",
      astronautAction: "Duduk bersila di atas meteor besar",
      props: ["Hologram Smartphone / UI Slate"]
    },
    ui: {
      themeColor: "Magenta Neon",
      hexCode: "#BF00FF",
      dominantColor: "#120224",
      neonGlow: "0 0 20px #BF00FF, 0 0 40px #FF00AA",
    },
    motion: {
      cameraBehavior: "Kamera mengikuti meteor with getaran halus",
      particleEffect: "Garis-garis cahaya ungu cepat"
    }
  },
  "130-134": {
    tierId: "130-134",
    name: "STAR-BOUND VOYAGER",
    description: "Batas bumi sudah tidak lagi berlaku untuk Anda.",
    visual: {
      environment: "Cincin planet yang bersinar terang di belakang",
      astronautAction: "Meluncur cepat melewati kamera",
      props: ["Alat Pelacak Sinyal Kosmis"]
    },
    ui: {
      themeColor: "Pink Laser",
      hexCode: "#FF00AA",
      dominantColor: "#160630",
      neonGlow: "0 0 15px #FF00AA, 0 0 30px #00FF66",
    },
    motion: {
      cameraBehavior: "Drift upward lambat dengan hambatan",
      particleEffect: "Gelombang kejut transparan"
    }
  },
  "125-129": {
    tierId: "125-129",
    name: "AURORA EXPLORER",
    description: "Anda menari di antara cahaya langit yang paling murni.",
    visual: {
      environment: "Lautan cahaya aurora ungu dan sian yang menari di atas lengkungan bumi",
      astronautAction: "Mengambang bebas di luar stasiun luar angkasa (spacewalk)",
      props: ["Cetak Biru (Blueprint) Kampus Hologram", "Modul Stasiun Luar Angkasa"]
    },
    ui: {
      themeColor: "Hijau Aurora",
      hexCode: "#4ade80",
      dominantColor: "#0B133A",
      neonGlow: "0 0 15px #4ade80, 0 0 30px #22c55e, 0 0 45px #166534",
    },
    motion: {
      cameraBehavior: "Goncangan kamera saat aurora berdenyut",
      particleEffect: "Butiran energi hijau menguap"
    }
  },
  "120-124": {
    tierId: "120-124",
    name: "NEON NAVIGATOR",
    description: "Setiap rintangan adalah koordinat yang sudah Anda petakan.",
    visual: {
      environment: "Grid digital yang memanjang ke cakrawala",
      astronautAction: "Menyentuh layar virtual di depan",
      props: ["Navigation Wrist Device"]
    },
    ui: {
      themeColor: "Sian Elektrik",
      hexCode: "#2563eb",
      dominantColor: "#0E1C4E",
      neonGlow: "0 0 18px #2563eb, 0 0 35px #3b82f6",
    },
    motion: {
      cameraBehavior: "Vibrasi frekuensi tinggi pada layar",
      particleEffect: "Bit data melayang (0 and 1)"
    }
  },
  "115-119": {
    tierId: "115-119",
    name: "CYBER SCHOLAR",
    description: "Pengetahuan adalah bahan bakar roket Anda.",
    visual: {
      environment: "Sirkuit raksasa yang menyala di kegelapan",
      astronautAction: "Membaca buku hologram yang melayang",
      props: ["Tas punggung isi tumpukan buku tebal dengan kabel baja"]
    },
    ui: {
      themeColor: "Kuning Siber",
      hexCode: "#FFFF00",
      dominantColor: "#1A3B70",
      neonGlow: "0 0 10px #FFFF00, 0 0 25px #FFAA00",
    },
    motion: {
      cameraBehavior: "Pergerakan parallax cepat pada lapisan awan",
      particleEffect: "Percikan listrik kuning"
    }
  },
  "110-114": {
    tierId: "110-114",
    name: "AMBER ASCENDANT",
    description: "Cahaya keberhasilan mulai menyinari cakrawala Anda.",
    visual: {
      environment: "Matahari terbit di orbit bumi",
      astronautAction: "Melihat ke arah matahari dengan tangan di atas mata",
      props: ["Teropong (Binoculars) di leher"]
    },
    ui: {
      themeColor: "Amber Hangat",
      hexCode: "#FFAA00",
      dominantColor: "#3A7CA5",
      neonGlow: "0 0 8px #FFAA00, 0 0 20px #FFFFFF",
    },
    motion: {
      cameraBehavior: "Ayunan kamera seperti gantung parasut",
      particleEffect: "Suar lensa (lens flare) lembut"
    }
  },
  "105-109": {
    tierId: "105-109",
    name: "CLOUDWALKER",
    description: "Anda sudah berada di atas rata-rata, teruslah mendaki.",
    visual: {
      environment: "Awan kumulonimbus putih yang padat",
      astronautAction: "Berpose 'victory' sambil memegang bendera",
      props: ["Smartphone (Social Media)", "Es Kopi (Iced Coffee) dengan sedotan"]
    },
    ui: {
      themeColor: "Putih Bersih",
      hexCode: "#FFFFFF",
      dominantColor: "#2E5A44",
      neonGlow: "0 0 12px #FFFFFF, 0 0 20px #A6A6A6",
    },
    motion: {
      cameraBehavior: "Statis, tenang, tanpa guncangan",
      particleEffect: "Tetesan air/embun halus"
    }
  },
  "100-104": {
    tierId: "100-104",
    name: "ATMOSPHERE CADET",
    description: "Udara mulai menipis, tapi tekad Anda tetap menebal.",
    visual: {
      environment: "Langit biru tua dengan gradasi ke hitam",
      astronautAction: "Melakukan push-up di gravitasi rendah",
      props: ["Oksigen Tank portabel", "Stiker 'Almost There'"]
    },
    ui: {
      themeColor: "Perak Redup",
      hexCode: "#A6A6A6",
      dominantColor: "#4A3525",
      neonGlow: "0 0 10px #A6A6A6, 0 0 20px #808080",
    },
    motion: {
      cameraBehavior: "Getaran tanah sporadis",
      particleEffect: "Debu cokelat melayang"
    }
  },
  "95-99": {
    tierId: "95-99",
    name: "STRATO-STRIVER",
    description: "Bertahanlah, pemandangan dari atas sana sangat indah.",
    visual: {
      environment: "Puncak gunung yang tertutup salju di bawah",
      astronautAction: "Mendaki dinding batu di luar angkasa",
      props: ["Sekop (Shovel) di samping badan"]
    },
    ui: {
      themeColor: "Besi Tua",
      hexCode: "#808080",
      dominantColor: "#333333",
      neonGlow: "0 0 10px #808080, 0 0 25px #FF5500",
    },
    motion: {
      cameraBehavior: "Gerak perlahan and sesak di antara celah",
      particleEffect: "Uap panas dari mesin"
    }
  },
  "90-94": {
    tierId: "90-94",
    name: "THERMO-TOILER",
    description: "Panasnya kompetisi hanya akan menempa Anda jadi lebih kuat.",
    visual: {
      environment: "Lava yang mengalir di retakan tanah",
      astronautAction: "Berlari menghindari semburan uap",
      props: ["Lampu Senter Proyek di pundak (beam tajam)"]
    },
    ui: {
      themeColor: "Oranye Magma",
      hexCode: "#FF5500",
      dominantColor: "#26140A",
      neonGlow: "0 0 15px #FF5500, 0 0 35px #FF3300",
    },
    motion: {
      cameraBehavior: "Guncangan tektonik periodik (rumble)",
      particleEffect: "Bara api kecil"
    }
  },
  "87-89": {
    tierId: "87-89",
    name: "CORE DRILLER",
    description: "Anda sedang menggali potensi terdalam yang Anda miliki.",
    visual: {
      environment: "Gua kristal merah yang bercahaya",
      astronautAction: "Mencoba memperbaiki panel yang rusak",
      props: ["Lampu Sirine Merah (kedip)", "Layar Dada Eror"]
    },
    ui: {
      themeColor: "Merah Hiper",
      hexCode: "#FF3300",
      dominantColor: "#1F0B02",
      neonGlow: "0 0 20px #FF3300, 0 0 40px #800000",
    },
    motion: {
      cameraBehavior: "Zoom in pelan memberikan kesan sesak",
      particleEffect: "Sinyal 'WARNING' merah tipis"
    }
  },
  "85-86": {
    tierId: "85-86",
    name: "ABYSSAL APPRENTICE",
    description: "Kegelapan ini hanyalah persiapan sebelum Anda bersinar.",
    visual: {
      environment: "Ruang hampa hitam pekat dengan distorsi merah",
      astronautAction: "Terseret arus gravitasi yang tidak terlihat",
      props: ["Sample Extractor yang rusak"]
    },
    ui: {
      themeColor: "Merah Darah",
      hexCode: "#800000",
      dominantColor: "#120300",
      neonGlow: "0 0 20px #800000, 0 0 45px #4D0000",
    },
    motion: {
      cameraBehavior: "Distorsi panas hebat (heat waves)",
      particleEffect: "Abu hitam berjatuhan"
    }
  },
  "75-84": {
    tierId: "75-84",
    name: "BEDROCK BOUND",
    description: "Jangan menyerah sekarang. Pondasi yang kuat sedang dibangun.",
    visual: {
      environment: "Puing-puing bangunan yang melayang di kehampaan",
      astronautAction: "Berpegangan pada kabel baja agar tidak jatuh",
      props: ["Buku-buku UTBK yang terbakar abu"]
    },
    ui: {
      themeColor: "Merah Gelap (Eror)",
      hexCode: "#4D0000",
      dominantColor: "#050100",
      neonGlow: "0 0 30px #4D0000, 0 0 60px #260000",
    },
    motion: {
      cameraBehavior: "Slow sinking animation effect",
      particleEffect: "Glitches visual (statik)"
    }
  },
  "40-74": {
    tierId: "40-74",
    name: "CRITICAL FAILURE",
    description: "Sistem kritis. Inisialisasi ulang semangat Anda segera.",
    visual: {
      environment: "Layar peringatan merah yang retak di mana-mana",
      astronautAction: "Tertunduk diam dalam kegelapan",
      props: ["Sisa Puing HUD yang meleleh"]
    },
    ui: {
      themeColor: "Hitam Absolut",
      hexCode: "#260000",
      dominantColor: "#000000",
      neonGlow: "0 0 40px #260000, 0 0 80px #000000",
    },
    motion: {
      cameraBehavior: "Kamera miring (Dutch angle) ekstrim",
      particleEffect: "Layar berkedip gelap-terang"
    }
  }
};
