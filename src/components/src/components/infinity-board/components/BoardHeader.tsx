/**
 * Infinity Board - Enhanced Header Component
 * With Lock Canvas, Ruler & Protractor toggles, Zoom slider, Layer & BG panel toggle, and rich options.
 */

import React, { useState } from 'react';
import { 
  ArrowLeft, 
  FolderKanban, 
  Undo2, 
  Redo2, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Download, 
  Upload, 
  Grid, 
  Trash2, 
  HelpCircle, 
  Check, 
  Pencil,
  Sun,
  Moon,
  Lock,
  Unlock,
  Ruler,
  Compass,
  Crop,
  Layers,
  AlertTriangle
} from 'lucide-react';
import { GridStyle, Viewport } from '../types';

interface BoardHeaderProps {
  title: string;
  onUpdateTitle: (newTitle: string) => void;
  onBackToHome: () => void;
  onOpenProjects: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  viewport: Viewport;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onFitContent: () => void;
  onZoomToPercent: (percent: number) => void;
  isCanvasLocked: boolean;
  onToggleCanvasLock: () => void;
  isRulerActive: boolean;
  onToggleRuler: () => void;
  isProtractorActive: boolean;
  onToggleProtractor: () => void;
  onStartSnipping: () => void;
  isLayersPanelOpen: boolean;
  onToggleLayersPanel: () => void;
  activeLayerName?: string;
  gridStyle: GridStyle;
  onChangeGridStyle: (style: GridStyle) => void;
  backgroundColor: string;
  onChangeBackgroundColor: (color: string) => void;
  onOpenExport: () => void;
  onTriggerImport: () => void;
  onClearCanvas: () => void;
  onDeleteCurrentProject: () => void;
  onOpenShortcuts: () => void;
}

export const BoardHeader: React.FC<BoardHeaderProps> = ({
  title,
  onUpdateTitle,
  onBackToHome,
  onOpenProjects,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  viewport,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onFitContent,
  onZoomToPercent,
  isCanvasLocked,
  onToggleCanvasLock,
  isRulerActive,
  onToggleRuler,
  isProtractorActive,
  onToggleProtractor,
  onStartSnipping,
  isLayersPanelOpen,
  onToggleLayersPanel,
  activeLayerName = 'Layer 1',
  gridStyle,
  onChangeGridStyle,
  backgroundColor,
  onChangeBackgroundColor,
  onOpenExport,
  onTriggerImport,
  onClearCanvas,
  onDeleteCurrentProject,
  onOpenShortcuts,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(title);
  const [isGridMenuOpen, setIsGridMenuOpen] = useState(false);
  const [isZoomSliderOpen, setIsZoomSliderOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleTitleSubmit = () => {
    if (titleDraft.trim()) {
      onUpdateTitle(titleDraft.trim());
    } else {
      setTitleDraft(title);
    }
    setIsEditingTitle(false);
  };

  const zoomPercent = Math.round(viewport.zoom * 100);

  return (
    <>
      <header className="absolute top-3 left-3 right-3 z-30 flex items-center justify-between pointer-events-none select-none">
        {/* Left section: Home, Projects, Title, Delete Project */}
        <div className="flex items-center gap-1.5 pointer-events-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-lg border border-slate-200/80 dark:border-slate-800">
          <button
            onClick={onBackToHome}
            className="flex items-center gap-1.5 px-2 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title="Kembali ke Beranda"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Kemal Avicenna</span>
          </button>

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />

          <button
            onClick={onOpenProjects}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title="Kelola & Buka Daftar Proyek"
          >
            <FolderKanban size={15} className="text-blue-500" />
            <span className="hidden md:inline">Proyek</span>
          </button>

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />

          {/* Editable Title */}
          {isEditingTitle ? (
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={titleDraft}
                onChange={e => setTitleDraft(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleTitleSubmit();
                  if (e.key === 'Escape') {
                    setTitleDraft(title);
                    setIsEditingTitle(false);
                  }
                }}
                autoFocus
                className="px-2 py-0.5 text-xs font-semibold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 rounded border border-blue-400 outline-none w-32 sm:w-48"
              />
              <button
                onClick={handleTitleSubmit}
                className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
              >
                <Check size={14} />
              </button>
            </div>
          ) : (
            <div
              onClick={() => {
                setTitleDraft(title);
                setIsEditingTitle(true);
              }}
              className="flex items-center gap-1 px-2 py-1 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg group"
              title="Klik untuk ubah nama proyek"
            >
              <span className="text-xs font-bold text-slate-800 dark:text-slate-100 max-w-[100px] sm:max-w-[180px] truncate">
                {title}
              </span>
              <Pencil size={11} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          )}

          {/* Delete Project Button in Header */}
          <button
            onClick={() => setIsDeleteModalOpen(true)}
            className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors ml-0.5"
            title="Hapus Proyek Ini"
          >
            <Trash2 size={13} />
          </button>
        </div>

        {/* Center section: Undo/Redo, Zoom Bar, and Lock Canvas */}
        <div className="flex items-center gap-1 pointer-events-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-2 py-1.5 rounded-xl shadow-lg border border-slate-200/80 dark:border-slate-800">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`p-1.5 rounded-lg text-slate-700 dark:text-slate-300 transition-colors ${
              canUndo ? 'hover:bg-slate-100 dark:hover:bg-slate-800' : 'opacity-30 cursor-not-allowed'
            }`}
            title="Urungkan / Undo (Ctrl+Z)"
          >
            <Undo2 size={15} />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className={`p-1.5 rounded-lg text-slate-700 dark:text-slate-300 transition-colors ${
              canRedo ? 'hover:bg-slate-100 dark:hover:bg-slate-800' : 'opacity-30 cursor-not-allowed'
            }`}
            title="Ulangi / Redo (Ctrl+Y)"
          >
            <Redo2 size={15} />
          </button>

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-0.5" />

          {/* Zoom Controls & Slider */}
          <div className="relative flex items-center">
            <button
              onClick={onZoomOut}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-300 transition-colors"
              title="Zoom Out"
            >
              <ZoomOut size={15} />
            </button>

            <button
              onClick={() => setIsZoomSliderOpen(!isZoomSliderOpen)}
              className="px-2 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg font-mono flex items-center gap-1"
              title="Buka Slider Zoom"
            >
              <span>{zoomPercent}%</span>
            </button>

            {isZoomSliderOpen && (
              <div className="absolute top-full mt-2 -left-8 bg-white dark:bg-slate-900 p-3 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 w-48 space-y-2 z-40">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                  <span>Perbesaran</span>
                  <span className="font-mono text-blue-600">{zoomPercent}%</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="300"
                  value={zoomPercent}
                  onChange={e => onZoomToPercent(parseInt(e.target.value, 10))}
                  className="w-full accent-blue-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                />
                <div className="grid grid-cols-3 gap-1 pt-1">
                  {[50, 100, 200].map(pz => (
                    <button
                      key={pz}
                      onClick={() => {
                        onZoomToPercent(pz);
                        setIsZoomSliderOpen(false);
                      }}
                      className={`py-1 text-[10px] font-mono rounded border transition-colors ${
                        zoomPercent === pz ? 'bg-blue-600 text-white border-blue-600' : 'border-slate-200 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {pz}%
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={onZoomIn}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-300 transition-colors"
              title="Zoom In"
            >
              <ZoomIn size={15} />
            </button>

            <button
              onClick={onFitContent}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-300 transition-colors hidden sm:block"
              title="Pusatkan Tampilan ke Semua Konten (Shift+1)"
            >
              <Maximize2 size={14} />
            </button>
          </div>

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-0.5" />

          {/* Lock Canvas Toggle */}
          <button
            onClick={onToggleCanvasLock}
            className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
              isCanvasLocked
                ? 'bg-amber-500 text-white shadow-sm ring-2 ring-amber-300 animate-pulse'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title={isCanvasLocked ? 'Kanvas Dikunci (Layar tidak bergerak)' : 'Kunci Kanvas agar Layar Diam'}
          >
            {isCanvasLocked ? <Lock size={14} /> : <Unlock size={14} />}
            <span className="hidden xl:inline">{isCanvasLocked ? 'Terkunci' : 'Kunci Layar'}</span>
          </button>
        </div>

        {/* Right section: Ruler, Protractor, Snipping, Layer & BG, Background, Export */}
        <div className="flex items-center gap-1 pointer-events-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-2 py-1.5 rounded-xl shadow-lg border border-slate-200/80 dark:border-slate-800">
          {/* Ruler Toggle */}
          <button
            onClick={onToggleRuler}
            className={`p-1.5 rounded-lg transition-colors ${
              isRulerActive
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title="Tampilkan / Sembunyikan Penggaris Interaktif"
          >
            <Ruler size={16} />
          </button>

          {/* Protractor Toggle */}
          <button
            onClick={onToggleProtractor}
            className={`p-1.5 rounded-lg transition-colors ${
              isProtractorActive
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title="Tampilkan / Sembunyikan Busur Derajat Interaktif"
          >
            <Compass size={16} />
          </button>

          {/* Snipping / Region Selection */}
          <button
            onClick={onStartSnipping}
            className="p-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Tandai Wilayah / Snipping Tool (S)"
          >
            <Crop size={16} />
          </button>

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-0.5" />

          {/* Layer & BG Panel Toggle */}
          <button
            onClick={onToggleLayersPanel}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
              isLayersPanelOpen
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title="Pengaturan Layer & BG (Latar Belakang & Template)"
          >
            <Layers size={15} />
            <span className="hidden sm:inline">Layer & BG</span>
            {activeLayerName && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                isLayersPanelOpen ? 'bg-blue-700 text-blue-100' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}>
                {activeLayerName}
              </span>
            )}
          </button>

          {/* Grid & Background Style */}
          <div className="relative">
            <button
              onClick={() => setIsGridMenuOpen(!isGridMenuOpen)}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-300 transition-colors"
              title="Pengaturan Cepat Pola Kertas & Latar"
            >
              <Grid size={16} />
            </button>

            {isGridMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 p-2.5 space-y-2.5 z-40">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Gaya Kertas
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {(['dots', 'grid', 'lines', 'none'] as GridStyle[]).map(style => (
                    <button
                      key={style}
                      onClick={() => {
                        onChangeGridStyle(style);
                        setIsGridMenuOpen(false);
                      }}
                      className={`px-2 py-1.5 text-xs rounded-lg font-medium text-left capitalize transition-colors ${
                        gridStyle === style
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      {style === 'dots' ? 'Titik-titik' : style === 'grid' ? 'Kotak' : style === 'lines' ? 'Garis Buku' : 'Polos'}
                    </button>
                  ))}
                </div>

                <div className="h-px bg-slate-100 dark:bg-slate-800" />

                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Warna Dasar
                </div>
                <div className="flex items-center gap-1.5">
                  {[
                    { label: 'Putih', color: '#ffffff', icon: Sun },
                    { label: 'Kertas Hangat', color: '#fafaf9', icon: null },
                    { label: 'Abu Lembut', color: '#f1f5f9', icon: null },
                    { label: 'Gelap', color: '#0f172a', icon: Moon },
                  ].map(bg => (
                    <button
                      key={bg.color}
                      onClick={() => {
                        onChangeBackgroundColor(bg.color);
                        setIsGridMenuOpen(false);
                      }}
                      className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-transform ${
                        backgroundColor === bg.color ? 'ring-2 ring-blue-500 scale-110' : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: bg.color, borderColor: '#cbd5e1' }}
                      title={bg.label}
                    >
                      {bg.icon && (
                        <bg.icon size={12} className={bg.color === '#0f172a' ? 'text-white' : 'text-slate-700'} />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Import */}
          <button
            onClick={onTriggerImport}
            className="p-1.5 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title="Impor Proyek (.infboard) / Gambar"
          >
            <Upload size={15} />
          </button>

          {/* Export - Emphasize .infboard */}
          <button
            onClick={onOpenExport}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition-all"
            title="Simpan Proyek (.infboard - Rekomendasi Utama)"
          >
            <Download size={14} />
            <span>Simpan</span>
          </button>

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-0.5" />

          {/* Clear Canvas */}
          <button
            onClick={onClearCanvas}
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
            title="Bersihkan Semua Coretan di Kanvas Ini"
          >
            <Trash2 size={15} />
          </button>

          {/* Shortcuts */}
          <button
            onClick={onOpenShortcuts}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title="Panduan Tombol Pintas"
          >
            <HelpCircle size={15} />
          </button>
        </div>
      </header>

      {/* CONFIRMATION MODAL FOR DELETING ACTIVE PROJECT DIRECTLY FROM HEADER */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 max-w-sm w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-600 flex items-center justify-center shrink-0">
                <Trash2 size={20} />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  Hapus Proyek Ini?
                </h4>
                <p className="text-xs text-slate-500">
                  Tindakan ini permanen dan tidak dapat dibatalkan.
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800 leading-relaxed">
              Papan <span className="font-bold text-slate-900 dark:text-white">"{title}"</span> beserta seluruh elemen di dalamnya akan dihapus.
            </p>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  onDeleteCurrentProject();
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-md shadow-red-500/25 transition-colors"
              >
                Ya, Hapus Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
