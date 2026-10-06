/**
 * Infinity Board - Enhanced Contextual Property Panel
 * Includes font selection with 8 typography families, text underline & background highlight,
 * rotation controls (90° steps + slider), image filters, and eraser size.
 */

import React from 'react';
import { 
  Trash2, 
  Copy, 
  BringToFront, 
  SendToBack, 
  Bold, 
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  RotateCcw,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Highlighter,
  Sliders,
  Sparkles,
  X
} from 'lucide-react';
import { 
  ToolType, 
  CanvasElement, 
  NoteTheme, 
  FontFamilyId, 
  ImageFilter, 
  ImageElement, 
  TextElement 
} from '../types';

interface PropertyPanelProps {
  activeTool: ToolType;
  selectedElements: CanvasElement[];
  currentColor: string;
  onChangeColor: (color: string) => void;
  currentStrokeWidth: number;
  onChangeStrokeWidth: (width: number) => void;
  currentFillColor: string;
  onChangeFillColor: (fill: string) => void;
  currentOpacity: number;
  onChangeOpacity: (opacity: number) => void;
  currentFontSize: number;
  onChangeFontSize: (size: number) => void;
  currentFontFamily: FontFamilyId;
  onChangeFontFamily: (font: FontFamilyId) => void;
  currentNoteTheme: NoteTheme;
  onChangeNoteTheme: (theme: NoteTheme) => void;
  eraserSize: number;
  onChangeEraserSize: (size: number) => void;
  onDuplicateSelected: () => void;
  onDeleteSelected: () => void;
  onBringToFront: () => void;
  onSendToBack: () => void;
  onRotateSelectedBy: (degrees: number) => void;
  onSetRotationSelected: (degrees: number) => void;
  onFlipHorizontalSelected: () => void;
  onFlipVerticalSelected: () => void;
  onToggleBold?: () => void;
  onToggleItalic?: () => void;
  onToggleUnderline?: () => void;
  onChangeTextAlign?: (align: 'left' | 'center' | 'right') => void;
  onChangeTextHighlight?: (color: string) => void;
  onChangeImageFilter?: (filter: ImageFilter) => void;
}

const PRESET_COLORS = [
  '#0f172a', // Slate 900
  '#2563eb', // Royal Blue
  '#0ea5e9', // Sky Cyan
  '#10b981', // Emerald Green
  '#eab308', // Yellow
  '#f97316', // Orange
  '#ef4444', // Red
  '#ec4899', // Pink
  '#a855f7', // Purple
  '#06b6d4', // Neon Cyan
  '#84cc16', // Lime
  '#ffffff', // Pure White
];

const FONT_OPTIONS: { id: FontFamilyId; label: string; sample: string }[] = [
  { id: 'Inter', label: 'Inter', sample: 'Modern Sans' },
  { id: 'Space Grotesk', label: 'Space Grotesk', sample: 'Tech Display' },
  { id: 'Outfit', label: 'Outfit', sample: 'Geometric' },
  { id: 'Playfair Display', label: 'Playfair', sample: 'Elegan Serif' },
  { id: 'Caveat', label: 'Caveat', sample: 'Tulis Tangan' },
  { id: 'Patrick Hand', label: 'Patrick Hand', sample: 'Sketsa Pensil' },
  { id: 'Permanent Marker', label: 'Permanent Marker', sample: 'Spidol Tebal' },
  { id: 'Fira Code', label: 'Fira Code', sample: 'Monospace' },
];

const NOTE_THEMES: { id: NoteTheme; bg: string; label: string }[] = [
  { id: 'yellow', bg: '#fef08a', label: 'Kuning' },
  { id: 'blue', bg: '#bae6fd', label: 'Biru' },
  { id: 'green', bg: '#bbf7d0', label: 'Hijau' },
  { id: 'pink', bg: '#fbcfe8', label: 'Pink' },
  { id: 'purple', bg: '#e9d5ff', label: 'Ungu' },
  { id: 'orange', bg: '#fed7aa', label: 'Oranye' },
  { id: 'dark', bg: '#334155', label: 'Gelap' },
];

export const PropertyPanel: React.FC<PropertyPanelProps> = ({
  activeTool,
  selectedElements,
  currentColor,
  onChangeColor,
  currentStrokeWidth,
  onChangeStrokeWidth,
  currentFillColor,
  onChangeFillColor,
  currentOpacity,
  onChangeOpacity,
  currentFontSize,
  onChangeFontSize,
  currentFontFamily,
  onChangeFontFamily,
  currentNoteTheme,
  onChangeNoteTheme,
  eraserSize,
  onChangeEraserSize,
  onDuplicateSelected,
  onDeleteSelected,
  onBringToFront,
  onSendToBack,
  onRotateSelectedBy,
  onSetRotationSelected,
  onFlipHorizontalSelected,
  onFlipVerticalSelected,
  onToggleBold,
  onToggleItalic,
  onToggleUnderline,
  onChangeTextAlign,
  onChangeTextHighlight,
  onChangeImageFilter,
}) => {
  const hasSelection = selectedElements.length > 0;
  const isDrawingTool = ['pen', 'brush', 'pencil', 'highlighter', 'glow', 'dashed', 'rainbow'].includes(activeTool);
  const isShapeTool = activeTool === 'shape';
  const isTextTool = activeTool === 'text';
  const isNoteTool = activeTool === 'note';
  const isEraserTool = activeTool === 'eraser';

  // Selection types inspection
  const hasSelectedImage = selectedElements.some(el => el.type === 'image');
  const hasSelectedText = selectedElements.some(el => el.type === 'text');
  const hasSelectedShape = selectedElements.some(el => el.type === 'shape');
  const hasSelectedStroke = selectedElements.some(el => el.type === 'stroke');
  const hasSelectedNote = selectedElements.some(el => el.type === 'note');

  // Single element rotation
  const currentRotation = hasSelection ? selectedElements[0].rotation || 0 : 0;

  const [isMobile, setIsMobile] = React.useState(false);
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (activeTool === 'hand' || activeTool === 'snipping') return null;
  if (activeTool === 'select' && !hasSelection) return null;

  if (isMobile && !isMobileOpen) {
    return (
      <div className="absolute top-22 left-3 z-30 pointer-events-auto select-none">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="flex items-center justify-center w-11 h-11 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl text-blue-600 dark:text-blue-400 hover:scale-105 active:scale-95 transition-all relative pointer-events-auto"
          title="Buka Pengaturan Alat / Warna"
        >
          <Sliders size={18} />
          {hasSelection && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white ring-2 ring-white">
              {selectedElements.length}
            </span>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className={`absolute top-20 md:top-16 left-3 z-30 flex flex-col gap-2 pointer-events-none select-none max-h-[calc(100vh-140px)] overflow-y-auto ${isMobile ? 'w-64 pointer-events-auto' : ''}`}>
      <div className="pointer-events-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl p-3 rounded-2xl shadow-xl border border-slate-200/90 dark:border-slate-800 w-64 flex flex-col gap-3">
        {/* Mobile Title + Close Button */}
        {isMobile && (
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Sliders size={12} />
              <span>Pengaturan Alat</span>
            </span>
            <button
              onClick={() => setIsMobileOpen(false)}
              className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 transition"
              title="Sembunyikan"
            >
              <X size={14} />
            </button>
          </div>
        )}
        {/* Selection Actions Header */}
        {hasSelection && (
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {selectedElements.length} Dipilih
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={onBringToFront}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-300"
                title="Bawa ke Depan"
              >
                <BringToFront size={14} />
              </button>
              <button
                onClick={onSendToBack}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-300"
                title="Kirim ke Belakang"
              >
                <SendToBack size={14} />
              </button>
              <button
                onClick={onDuplicateSelected}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-300"
                title="Duplikat (Ctrl+D)"
              >
                <Copy size={14} />
              </button>
              <button
                onClick={onDeleteSelected}
                className="p-1 hover:bg-red-50 text-red-500 rounded"
                title="Hapus (Delete)"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        )}

        {/* ROTATION & FLIP CONTROLS (for selected elements) */}
        {hasSelection && (
          <div className="space-y-1.5 pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <span>Putar & Balik</span>
              <span className="font-mono text-blue-600">{Math.round(currentRotation)}°</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => onRotateSelectedBy(-90)}
                className="flex-1 py-1 px-1.5 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-1 text-[11px] font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                title="Putar 90° Berlawanan Jarum Jam"
              >
                <RotateCcw size={12} />
                <span>-90°</span>
              </button>
              <button
                onClick={() => onRotateSelectedBy(90)}
                className="flex-1 py-1 px-1.5 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-1 text-[11px] font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                title="Putar 90° Searah Jarum Jam"
              >
                <RotateCw size={12} />
                <span>+90°</span>
              </button>
              <button
                onClick={onFlipHorizontalSelected}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                title="Cermin Horizontal"
              >
                <FlipHorizontal size={13} />
              </button>
              <button
                onClick={onFlipVerticalSelected}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                title="Cermin Vertikal"
              >
                <FlipVertical size={13} />
              </button>
            </div>
            {/* Fine Rotation Slider */}
            <input
              type="range"
              min="-180"
              max="180"
              value={currentRotation}
              onChange={e => onSetRotationSelected(parseInt(e.target.value, 10))}
              className="w-full accent-blue-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
            />
          </div>
        )}

        {/* IMAGE FILTERS (if Image is selected) */}
        {hasSelectedImage && (
          <div className="space-y-1.5 pb-2 border-b border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Filter Gambar
            </span>
            <div className="grid grid-cols-3 gap-1 text-[11px]">
              {(['none', 'grayscale', 'sepia', 'invert', 'vintage'] as ImageFilter[]).map(flt => (
                <button
                  key={flt}
                  onClick={() => onChangeImageFilter?.(flt)}
                  className="py-1 px-1.5 rounded border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 capitalize text-center"
                >
                  {flt === 'none' ? 'Normal' : flt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ERASER SIZE SLIDER (if Eraser tool is active) */}
        {isEraserTool && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <span>Ukuran Penghapus</span>
              <span className="font-mono text-slate-700 dark:text-slate-300">{eraserSize}px</span>
            </div>
            <div className="grid grid-cols-4 gap-1">
              {[15, 30, 60, 100].map(sz => (
                <button
                  key={sz}
                  onClick={() => onChangeEraserSize(sz)}
                  className={`py-1 text-xs rounded border transition-colors ${
                    eraserSize === sz
                      ? 'bg-blue-50 border-blue-500 font-bold text-blue-600'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {sz}px
                </button>
              ))}
            </div>
            <input
              type="range"
              min="10"
              max="150"
              value={eraserSize}
              onChange={e => onChangeEraserSize(parseInt(e.target.value, 10))}
              className="w-full accent-blue-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
            />
          </div>
        )}

        {/* TEXT CONTROLS & FONT SELECTOR */}
        {(isTextTool || hasSelectedText) && (
          <div className="space-y-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Pilihan Font & Tipografi
            </span>
            <select
              value={currentFontFamily}
              onChange={e => onChangeFontFamily(e.target.value as FontFamilyId)}
              className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none cursor-pointer"
            >
              {FONT_OPTIONS.map(f => (
                <option key={f.id} value={f.id} style={{ fontFamily: `"${f.id}", sans-serif` }}>
                  {f.label} — {f.sample}
                </option>
              ))}
            </select>

            {/* Font Style Toggles */}
            <div className="flex items-center gap-1">
              <button
                onClick={onToggleBold}
                className="flex-1 py-1 rounded border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                title="Tebal (Bold)"
              >
                <Bold size={13} />
              </button>
              <button
                onClick={onToggleItalic}
                className="flex-1 py-1 rounded border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                title="Miring (Italic)"
              >
                <Italic size={13} />
              </button>
              <button
                onClick={onToggleUnderline}
                className="flex-1 py-1 rounded border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                title="Garis Bawah (Underline)"
              >
                <Underline size={13} />
              </button>
              <button
                onClick={() => onChangeTextAlign?.('left')}
                className="p-1 rounded border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                title="Rata Kiri"
              >
                <AlignLeft size={13} />
              </button>
              <button
                onClick={() => onChangeTextAlign?.('center')}
                className="p-1 rounded border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                title="Rata Tengah"
              >
                <AlignCenter size={13} />
              </button>
              <button
                onClick={() => onChangeTextAlign?.('right')}
                className="p-1 rounded border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                title="Rata Kanan"
              >
                <AlignRight size={13} />
              </button>
            </div>

            {/* Font Size Presets */}
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
              <span>Ukuran Teks</span>
              <span className="font-mono text-slate-700 dark:text-slate-300">{currentFontSize}px</span>
            </div>
            <div className="grid grid-cols-4 gap-1">
              {[16, 24, 36, 48].map(size => (
                <button
                  key={size}
                  onClick={() => onChangeFontSize(size)}
                  className={`py-1 text-xs rounded border font-mono transition-colors ${
                    currentFontSize === size
                      ? 'bg-blue-50 border-blue-500 font-bold text-blue-600'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* NOTE THEMES */}
        {(isNoteTool || hasSelectedNote) && (
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Warna Catatan
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {NOTE_THEMES.map(nt => (
                <button
                  key={nt.id}
                  onClick={() => onChangeNoteTheme(nt.id)}
                  className={`w-6 h-6 rounded-full border transition-transform ${
                    currentNoteTheme === nt.id ? 'ring-2 ring-blue-500 scale-110' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: nt.bg, borderColor: '#cbd5e1' }}
                  title={nt.label}
                />
              ))}
            </div>
          </div>
        )}

        {/* COLOR PALETTE & CUSTOM COLOR (for Stroke, Shape, Text) */}
        {!isEraserTool && !isNoteTool && !hasSelectedNote && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Warna
              </span>
              <input
                type="color"
                value={currentColor}
                onChange={e => onChangeColor(e.target.value)}
                className="w-5 h-5 rounded cursor-pointer border-0 p-0 bg-transparent"
                title="Pilih Warna Bebas (Hex)"
              />
            </div>
            <div className="grid grid-cols-6 gap-1.5">
              {PRESET_COLORS.map(color => (
                <button
                  key={color}
                  onClick={() => onChangeColor(color)}
                  className={`w-6 h-6 rounded-lg border transition-transform flex items-center justify-center ${
                    currentColor.toLowerCase() === color.toLowerCase()
                      ? 'ring-2 ring-blue-500 scale-110'
                      : 'hover:scale-105'
                  }`}
                  style={{
                    backgroundColor: color,
                    borderColor: color === '#ffffff' ? '#cbd5e1' : 'transparent',
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* STROKE WIDTH (for drawing & shapes) */}
        {(isDrawingTool || isShapeTool || hasSelectedStroke || hasSelectedShape) && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <span>Ketebalan</span>
              <span className="font-mono text-slate-700 dark:text-slate-300">{currentStrokeWidth}px</span>
            </div>
            <div className="flex items-center gap-1.5">
              {[2, 4, 8, 16, 28].map(width => (
                <button
                  key={width}
                  onClick={() => onChangeStrokeWidth(width)}
                  className={`flex-1 py-1.5 rounded-lg border flex items-center justify-center transition-colors ${
                    currentStrokeWidth === width
                      ? 'bg-blue-50 border-blue-500 dark:bg-blue-950/40'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <div
                    className="rounded-full bg-slate-800 dark:bg-slate-200"
                    style={{ width: `${Math.min(width, 12)}px`, height: `${Math.min(width, 12)}px` }}
                  />
                </button>
              ))}
            </div>
            <input
              type="range"
              min="1"
              max="40"
              value={currentStrokeWidth}
              onChange={e => onChangeStrokeWidth(parseInt(e.target.value, 10))}
              className="w-full accent-blue-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
            />
          </div>
        )}

        {/* SHAPE FILL */}
        {(isShapeTool || hasSelectedShape) && (
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Isian Bentuk
            </span>
            <div className="grid grid-cols-3 gap-1">
              <button
                onClick={() => onChangeFillColor('none')}
                className={`px-2 py-1 text-xs rounded border transition-colors ${
                  currentFillColor === 'none'
                    ? 'bg-blue-50 border-blue-500 font-semibold text-blue-600'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Kosong
              </button>
              <button
                onClick={() => onChangeFillColor(currentColor + '26')}
                className={`px-2 py-1 text-xs rounded border transition-colors ${
                  currentFillColor.endsWith('26')
                    ? 'bg-blue-50 border-blue-500 font-semibold text-blue-600'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Transparan
              </button>
              <button
                onClick={() => onChangeFillColor(currentColor)}
                className={`px-2 py-1 text-xs rounded border transition-colors ${
                  currentFillColor === currentColor
                    ? 'bg-blue-50 border-blue-500 font-semibold text-blue-600'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Penuh
              </button>
            </div>
          </div>
        )}

        {/* OPACITY SLIDER */}
        {!isEraserTool && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <span>Opasitas</span>
              <span className="font-mono text-slate-700 dark:text-slate-300">{Math.round(currentOpacity * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.05"
              value={currentOpacity}
              onChange={e => onChangeOpacity(parseFloat(e.target.value))}
              className="w-full accent-blue-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
            />
          </div>
        )}
      </div>
    </div>
  );
};
