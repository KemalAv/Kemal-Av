/**
 * Storage service for Infinity Board
 * Handles multiple projects, auto-save to localStorage, and import/export.
 * Every new project includes welcoming sticker notes, sketches, and guides.
 * Full support for Background Layer (Layer BG) and multi-layer stacks.
 */

import { Project, ProjectMetadata, CanvasElement, CanvasLayer } from './types';

const STORAGE_KEY_PREFIX = 'infinity_board_proj_';
const METADATA_LIST_KEY = 'infinity_board_projects_index';
const ACTIVE_PROJECT_ID_KEY = 'infinity_board_active_id';

// Guard against resurrection of deleted projects
const deletedProjectIds = new Set<string>();

// Generate unique IDs
export const generateId = (): string => {
  return 'elem_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
};

export const generateProjectId = (): string => {
  return 'proj_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
};

// Generates default layers for any board, with dedicated Background Layer (Layer BG)
export const createDefaultLayers = (): CanvasLayer[] => {
  return [
    {
      id: 'layer_bg',
      name: 'Latar Belakang (BG)',
      visible: true,
      locked: false,
      opacity: 1,
      isBackground: true,
    },
    {
      id: 'layer_1',
      name: 'Layer 1 (Utama)',
      visible: true,
      locked: false,
      opacity: 1,
    },
    {
      id: 'layer_2',
      name: 'Layer 2 (Sketsa & Catatan)',
      visible: true,
      locked: false,
      opacity: 1,
    },
  ];
};

// Generates welcoming stickers, notes, doodle sketches, and guides for every new board
export const createWelcomingElements = (boardTitle: string): CanvasElement[] => {
  return [
    // 1. Welcome Yellow Sticky Note - Quick Guide
    {
      id: generateId(),
      type: 'note',
      x: 60,
      y: 90,
      width: 290,
      height: 240,
      text: `Selamat datang di ${boardTitle}! 🎨\n\n• Pilih Pulpen Gel, Kuas Kaligrafi, Pensil, Stabilo, Neon Glow, & Pelangi\n• Upload gambar lewat tombol Gambar, Paste (Ctrl+V) atau Drag & Drop\n• Penggaris & Busur bisa diputar untuk ukur garis lurus & sudut\n• Kunci Layar (L) agar kanvas diam tidak bergeser saat menggambar\n• Buka menu "Layer & BG" untuk atur lapisan gambar & template latar`,
      theme: 'yellow',
      title: '📌 Panduan Cepat Infinity Board',
      zIndex: 1,
      opacity: 1,
      layerId: 'layer_1',
    },

    // 2. Main Recommendation Green Note - Save to .infboard
    {
      id: generateId(),
      type: 'note',
      x: 380,
      y: 90,
      width: 280,
      height: 240,
      text: '💾 Simpan ke Format .infboard\n\n(Rekomendasi Utama!)\n\n• Selalu gunakan format .infboard saat menyimpan cadangan.\n• Hanya format ini yang menyimpan seluruh coretan, teks, gambar, & layer secara utuh sehingga bisa Anda impor & edit kembali kapan saja.\n• PNG, JPEG, dan SVG hanya untuk cadangan/tampilan statis.',
      theme: 'green',
      title: '⭐ Rekomendasi Utama Simpan',
      zIndex: 2,
      opacity: 1,
      layerId: 'layer_1',
    },

    // 3. Layer & BG Blue Note - Layer & Template Tracing
    {
      id: generateId(),
      type: 'note',
      x: 690,
      y: 90,
      width: 280,
      height: 240,
      text: '🥞 Fitur Layer & Latar (BG)\n\n• Buat banyak layer gambar (Layer 1, Layer 2, dll)\n• Sembunyikan (Mata) atau Kunci (Gembok) layer agar tidak sengaja terhapus\n• Atur opasitas per layer\n• Upload gambar template atau kisi cetak biru di Layer BG untuk jiplakan/referensi sketsa!',
      theme: 'blue',
      title: '🎨 Fitur Layer & BG Baru',
      zIndex: 3,
      opacity: 1,
      layerId: 'layer_1',
    },

    // 4. Snipping Tool Pink Note
    {
      id: generateId(),
      type: 'note',
      x: 1000,
      y: 90,
      width: 260,
      height: 240,
      text: '✂️ Tandai Wilayah / Snipping (S)\n\n• Klik ikon gunting atau tekan "S"\n• Seret kotak pada wilayah mana saja di kanvas\n• Salin ke clipboard, unduh gambar potongan, atau tempel langsung sebagai stiker gambar baru!',
      theme: 'pink',
      title: '🎯 Fitur Snipping',
      zIndex: 4,
      opacity: 1,
      layerId: 'layer_1',
    },

    // 5. Connector Arrow 1
    {
      id: generateId(),
      type: 'shape',
      shapeType: 'arrow',
      x: 350,
      y: 190,
      width: 28,
      height: 0,
      strokeColor: '#10b981',
      fillColor: '#10b981',
      strokeWidth: 3,
      strokeStyle: 'solid',
      zIndex: 5,
      opacity: 0.9,
      layerId: 'layer_1',
    },

    // 6. Connector Arrow 2
    {
      id: generateId(),
      type: 'shape',
      shapeType: 'arrow',
      x: 660,
      y: 190,
      width: 28,
      height: 0,
      strokeColor: '#3b82f6',
      fillColor: '#3b82f6',
      strokeWidth: 3,
      strokeStyle: 'solid',
      zIndex: 6,
      opacity: 0.9,
      layerId: 'layer_1',
    },

    // 7. Connector Arrow 3
    {
      id: generateId(),
      type: 'shape',
      shapeType: 'arrow',
      x: 970,
      y: 190,
      width: 28,
      height: 0,
      strokeColor: '#ec4899',
      fillColor: '#ec4899',
      strokeWidth: 3,
      strokeStyle: 'solid',
      zIndex: 7,
      opacity: 0.9,
      layerId: 'layer_1',
    },

    // 8. Stylized Title Text (Handwriting Caveat font)
    {
      id: generateId(),
      type: 'text',
      x: 70,
      y: 380,
      width: 480,
      height: 60,
      text: `${boardTitle} 🚀`,
      fontSize: 34,
      fontFamily: 'Caveat',
      color: '#0f172a',
      bold: true,
      zIndex: 8,
      opacity: 1,
      layerId: 'layer_2',
    },

    // 9. Highlighter accent under title
    {
      id: generateId(),
      type: 'stroke',
      tool: 'highlighter',
      points: [
        { x: 65, y: 425 },
        { x: 490, y: 420 },
      ],
      color: '#facc15',
      strokeWidth: 18,
      x: 65,
      y: 415,
      width: 425,
      height: 18,
      zIndex: 0,
      opacity: 0.55,
      layerId: 'layer_1',
    },

    // 10. Smile Doodle Sketch (mouth)
    {
      id: generateId(),
      type: 'stroke',
      tool: 'pen',
      points: [
        { x: 80, y: 500 },
        { x: 120, y: 530 },
        { x: 160, y: 540 },
        { x: 210, y: 530 },
        { x: 250, y: 500 },
      ],
      color: '#0ea5e9',
      strokeWidth: 4,
      x: 80,
      y: 500,
      width: 170,
      height: 40,
      zIndex: 9,
      opacity: 1,
      layerId: 'layer_2',
    },

    // 11. Smile Doodle (Left Eye)
    {
      id: generateId(),
      type: 'stroke',
      tool: 'pen',
      points: [
        { x: 120, y: 475 },
        { x: 125, y: 475 },
      ],
      color: '#0ea5e9',
      strokeWidth: 8,
      x: 120,
      y: 475,
      width: 10,
      height: 10,
      zIndex: 10,
      opacity: 1,
      layerId: 'layer_2',
    },

    // 12. Smile Doodle (Right Eye)
    {
      id: generateId(),
      type: 'stroke',
      tool: 'pen',
      points: [
        { x: 210, y: 475 },
        { x: 215, y: 475 },
      ],
      color: '#0ea5e9',
      strokeWidth: 8,
      x: 210,
      y: 475,
      width: 10,
      height: 10,
      zIndex: 11,
      opacity: 1,
      layerId: 'layer_2',
    },

    // 13. Rainbow stroke showcase
    {
      id: generateId(),
      type: 'stroke',
      tool: 'rainbow',
      points: [
        { x: 380, y: 400 },
        { x: 440, y: 390 },
        { x: 500, y: 420 },
        { x: 560, y: 390 },
        { x: 620, y: 410 },
      ],
      color: '#ec4899',
      strokeWidth: 5,
      x: 380,
      y: 390,
      width: 240,
      height: 30,
      zIndex: 12,
      opacity: 1,
      layerId: 'layer_2',
    },

    // 14. Neon Glow stroke showcase
    {
      id: generateId(),
      type: 'stroke',
      tool: 'glow',
      points: [
        { x: 380, y: 460 },
        { x: 450, y: 480 },
        { x: 520, y: 450 },
        { x: 600, y: 470 },
      ],
      color: '#06b6d4',
      strokeWidth: 4,
      x: 380,
      y: 450,
      width: 220,
      height: 30,
      zIndex: 13,
      opacity: 1,
      layerId: 'layer_2',
    },

    // 15. Sample diagram rectangle box
    {
      id: generateId(),
      type: 'shape',
      shapeType: 'rectangle',
      x: 690,
      y: 370,
      width: 280,
      height: 160,
      strokeColor: '#8b5cf6',
      fillColor: 'rgba(139, 92, 246, 0.08)',
      strokeWidth: 2,
      strokeStyle: 'solid',
      zIndex: 14,
      opacity: 1,
      layerId: 'layer_1',
    },
    {
      id: generateId(),
      type: 'text',
      x: 710,
      y: 400,
      width: 240,
      height: 90,
      text: '🎨 Bentuk, Diagram & Rotasi\n\nKlik objek untuk memutar derajatnya, mengatur skala, mengubah warna garis & isi, atau pindahkan ke layer lain.',
      fontSize: 14,
      fontFamily: 'Inter',
      color: '#6d28d9',
      zIndex: 15,
      opacity: 1,
      layerId: 'layer_1',
    },
  ];
};

// Initial sample project for first-time users
const createSampleProject = (): Project => {
  const now = Date.now();
  const id = generateProjectId();
  const title = 'Sketsa Pertama Saya';

  return {
    id,
    title,
    description: 'Papan sketsa & catatan pertama',
    layers: createDefaultLayers(),
    activeLayerId: 'layer_1',
    elements: createWelcomingElements(title),
    viewport: { x: 50, y: 20, zoom: 1 },
    backgroundColor: '#ffffff',
    gridStyle: 'dots',
    createdAt: now,
    updatedAt: now,
  };
};

export const getProjectsIndex = (): ProjectMetadata[] => {
  try {
    const raw = localStorage.getItem(METADATA_LIST_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Filter out any IDs known to be deleted
    return parsed.filter((p: ProjectMetadata) => !deletedProjectIds.has(p.id));
  } catch (err) {
    console.error('Failed to parse projects index', err);
    return [];
  }
};

export const saveProjectsIndex = (index: ProjectMetadata[]): void => {
  try {
    const filtered = index.filter(p => !deletedProjectIds.has(p.id));
    localStorage.setItem(METADATA_LIST_KEY, JSON.stringify(filtered));
  } catch (err) {
    console.error('Failed to save projects index', err);
  }
};

export const loadProject = (id: string): Project | null => {
  if (deletedProjectIds.has(id)) return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PREFIX + id);
    if (!raw) return null;
    const proj: Project = JSON.parse(raw);
    // Ensure layers exist if project was saved previously without them
    if (!proj.layers || proj.layers.length === 0) {
      proj.layers = createDefaultLayers();
      proj.activeLayerId = 'layer_1';
    }
    return proj;
  } catch (err) {
    console.error(`Failed to load project ${id}`, err);
    return null;
  }
};

export const saveProject = (project: Project): void => {
  // CRITICAL: If this project was marked as deleted, NEVER resurrect it!
  if (deletedProjectIds.has(project.id)) {
    return;
  }

  try {
    const now = Date.now();
    project.updatedAt = now;

    // Ensure layers exist
    if (!project.layers || project.layers.length === 0) {
      project.layers = createDefaultLayers();
      project.activeLayerId = 'layer_1';
    }
    
    // Save project full data
    localStorage.setItem(STORAGE_KEY_PREFIX + project.id, JSON.stringify(project));

    // Update index
    const index = getProjectsIndex().filter(p => !deletedProjectIds.has(p.id));
    const existingIdx = index.findIndex(p => p.id === project.id);
    const meta: ProjectMetadata = {
      id: project.id,
      title: project.title,
      description: project.description,
      elementCount: project.elements.length,
      createdAt: project.createdAt || now,
      updatedAt: now,
      backgroundColor: project.backgroundColor,
    };

    if (existingIdx >= 0) {
      index[existingIdx] = meta;
    } else {
      index.unshift(meta);
    }
    saveProjectsIndex(index);
  } catch (err) {
    console.error('Failed to save project', err);
  }
};

// Create new project - ALWAYS POPULATED WITH WELCOMING STICKERS, NOTES, AND DEFAULT LAYERS
export const createNewProject = (title = 'Papan Sketsa Baru'): Project => {
  const now = Date.now();
  const id = generateProjectId();
  const project: Project = {
    id,
    title,
    layers: createDefaultLayers(),
    activeLayerId: 'layer_1',
    elements: createWelcomingElements(title),
    viewport: { x: 50, y: 20, zoom: 1 },
    backgroundColor: '#ffffff',
    gridStyle: 'dots',
    createdAt: now,
    updatedAt: now,
  };
  saveProject(project);
  setActiveProjectId(id);
  return project;
};

export const duplicateProject = (id: string): Project | null => {
  const source = loadProject(id);
  if (!source) return null;

  const now = Date.now();
  const newId = generateProjectId();
  
  // Clone elements with fresh IDs
  const clonedElements = source.elements.map(el => ({
    ...el,
    id: generateId(),
  }));

  const copy: Project = {
    ...source,
    id: newId,
    title: `${source.title} (Salinan)`,
    elements: clonedElements,
    layers: source.layers ? JSON.parse(JSON.stringify(source.layers)) : createDefaultLayers(),
    createdAt: now,
    updatedAt: now,
  };

  saveProject(copy);
  return copy;
};

export const deleteProject = (id: string): void => {
  try {
    // 1. Mark as permanently deleted in guard set
    deletedProjectIds.add(id);

    // 2. Remove raw item from localStorage
    localStorage.removeItem(STORAGE_KEY_PREFIX + id);

    // 3. Remove from metadata list and persist
    const index = getProjectsIndex().filter(p => p.id !== id);
    saveProjectsIndex(index);

    // 4. Update active ID if this was active
    const activeId = getActiveProjectId();
    if (activeId === id) {
      if (index.length > 0) {
        setActiveProjectId(index[0].id);
      } else {
        localStorage.removeItem(ACTIVE_PROJECT_ID_KEY);
      }
    }
  } catch (err) {
    console.error(`Failed to delete project ${id}`, err);
  }
};

export const getActiveProjectId = (): string | null => {
  return localStorage.getItem(ACTIVE_PROJECT_ID_KEY);
};

export const setActiveProjectId = (id: string): void => {
  localStorage.setItem(ACTIVE_PROJECT_ID_KEY, id);
};

// Initialize or get initial project
export const getOrInitCurrentProject = (): Project => {
  const index = getProjectsIndex();
  let activeId = getActiveProjectId();

  if (activeId && !deletedProjectIds.has(activeId)) {
    const existing = loadProject(activeId);
    if (existing) return existing;
  }

  if (index.length > 0) {
    for (const meta of index) {
      if (!deletedProjectIds.has(meta.id)) {
        const proj = loadProject(meta.id);
        if (proj) {
          setActiveProjectId(proj.id);
          return proj;
        }
      }
    }
  }

  // First time initialization
  const sample = createSampleProject();
  saveProject(sample);
  setActiveProjectId(sample.id);
  return sample;
};
