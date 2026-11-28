/**
 * Infinity Board - Layers & Background Panel (Panel Layer & BG)
 * Manages layer hierarchy, visibility, lock state, reordering, opacity,
 * moving elements between layers, and background templates.
 */

import React, { useState, useRef } from 'react';
import { 
  X, 
  Plus, 
  Layers, 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock, 
  ChevronUp, 
  ChevronDown, 
  Trash2, 
  Copy, 
  Pencil, 
  Check, 
  Grid, 
  Image as ImageIcon,
  Sun,
  Moon,
  Upload,
  MoveUp,
  MoveDown,
  Sparkles
} from 'lucide-react';
import { CanvasLayer, GridStyle, CanvasElement } from '../types';

interface LayersPanelProps {
  isOpen: boolean;
  onClose: () => void;
  layers: CanvasLayer[];
  activeLayerId: string;
  onSelectActiveLayer: (layerId: string) => void;
  onAddLayer: () => void;
  onDeleteLayer: (layerId: string) => void;
  onDuplicateLayer: (layerId: string) => void;
  onRenameLayer: (layerId: string, newName: string) => void;
  onToggleLayerVisibility: (layerId: string) => void;
  onToggleLayerLock: (layerId: string) => void;
  onChangeLayerOpacity: (layerId: string, opacity: number) => void;
  onMoveLayerOrder: (layerId: string, direction: 'up' | 'down') => void;
  // Selected elements move
  selectedElementCount: number;
  onMoveSelectedToLayer: (targetLayerId: string) => void;
  // Background & Grid controls
  backgroundColor: string;
  onChangeBackgroundColor: (color: string) => void;
  gridStyle: GridStyle;
  onChangeGridStyle: (style: GridStyle) => void;
  backgroundImage?: string;
  backgroundImageOpacity?: number;
  onUploadBackgroundImage: (file: File) => void;
  onRemoveBackgroundImage: () => void;
  onChangeBackgroundImageOpacity: (opacity: number) => void;
  // Selected layers
  selectedLayerIds: string[];
  onSelectLayerIds: (layerIds: string[]) => void;
  // Element count map per layer
  elements: CanvasElement[];
}

export const LayersPanel: React.FC<LayersPanelProps> = ({
  isOpen,
  onClose,
  layers,
  activeLayerId,
  onSelectActiveLayer,
  onAddLayer,
  onDeleteLayer,
  onDuplicateLayer,
  onRenameLayer,
  onToggleLayerVisibility,
  onToggleLayerLock,
  onChangeLayerOpacity,
  onMoveLayerOrder,
  selectedLayerIds,
  onSelectLayerIds,
  selectedElementCount,
  onMoveSelectedToLayer,
  backgroundColor,
  onChangeBackgroundColor,
  gridStyle,
  onChangeGridStyle,
  backgroundImage,
  backgroundImageOpacity = 0.5,
  onUploadBackgroundImage,
  onRemoveBackgroundImage,
  onChangeBackgroundImageOpacity,
  elements,
}) => {
  const [activeTab, setActiveTab] = useState<'layers' | 'bg'>('layers');
  const [editingLayerId, setEditingLayerId] = useState<string | null>(null);
  const [nameDraft, setNameDraft] = useState('');
  const [targetMoveLayerId, setTargetMoveLayerId] = useState<string>(activeLayerId);
  const bgImageInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  // Calculate elements count per layer
  const countPerLayer = new Map<string, number>();
  for (const el of elements) {
    const lid = el.layerId || 'layer_1';
    countPerLayer.set(lid, (countPerLayer.get(lid) || 0) + 1);
  }

  const handleStartRename = (layer: CanvasLayer, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingLayerId(layer.id);
    setNameDraft(layer.name);
  };

  const handleSaveRename = (layerId: string) => {
    if (nameDraft.trim()) {
      onRenameLayer(layerId, nameDraft.trim());
    }
    setEditingLayerId(null);
  };

  const handleBgFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onUploadBackgroundImage(files[0]);
    }
    if (bgImageInputRef.current) bgImageInputRef.current.value = '';
  };

  // Layers list sorted for visual stack: Topmost layer at top of UI list
  const displayLayers = [...layers].reverse();

  return (
    <div className="absolute top-16 right-3 z-40 w-80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200/90 dark:border-slate-800 flex flex-col overflow-hidden max-h-[85vh] animate-in fade-in slide-in-from-top-2 duration-150 select-none">
      {/* Hidden input for background template image */}
      <input
        ref={bgImageInputRef}
        type="file"
        accept="image/*"
        onChange={handleBgFileChange}
        className="hidden"
      />

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center">
            <Layers size={15} />
          </div>
          <span className="text-xs font-bold text-slate-900 dark:text-white">
            Pengaturan Layer & BG
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X size={15} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center border-b border-slate-100 dark:border-slate-800 p-1 bg-slate-50/60 dark:bg-slate-950/30 text-xs">
        <button
          onClick={() => setActiveTab('layers')}
          className={`flex-1 py-1.5 rounded-lg font-semibold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'layers'
              ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-2xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Layers size={13} />
          <span>Tumpukan Layer ({layers.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('bg')}
          className={`flex-1 py-1.5 rounded-lg font-semibold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'bg'
              ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-2xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Grid size={13} />
          <span>Latar (BG)</span>
        </button>
      </div>

      {/* Tab 1: Layer Stack */}
      {activeTab === 'layers' && (
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {/* Move selected elements to layer toolbar */}
          {selectedElementCount > 0 && (
            <div className="p-2.5 bg-blue-50/80 dark:bg-blue-950/40 rounded-xl border border-blue-200/80 dark:border-blue-900/50 space-y-1.5">
              <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">
                Pindahkan {selectedElementCount} Elemen Terpilih
              </span>
              <div className="flex items-center gap-1.5">
                <select
                  value={targetMoveLayerId}
                  onChange={e => setTargetMoveLayerId(e.target.value)}
                  className="flex-1 px-2 py-1 text-xs rounded-lg border border-blue-300 dark:border-blue-800 bg-white dark:bg-slate-800 text-slate-800 dark:text-white outline-none"
                >
                  {layers.map(l => (
                    <option key={l.id} value={l.id}>
                      {l.name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => onMoveSelectedToLayer(targetMoveLayerId)}
                  className="px-2.5 py-1 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-2xs transition-colors"
                >
                  Pindahkan
                </button>
              </div>
            </div>
          )}

          {/* Bulk Layer Selection & Quick Action Toolbar */}
          <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-100 dark:border-slate-800 text-[11px] text-slate-500">
            <label className="flex items-center gap-1.5 cursor-pointer font-semibold select-none">
              <input
                type="checkbox"
                checked={selectedLayerIds.length === layers.length}
                onChange={() => {
                  if (selectedLayerIds.length === layers.length) {
                    onSelectLayerIds([activeLayerId]);
                  } else {
                    onSelectLayerIds(layers.map(l => l.id));
                  }
                }}
                className="rounded text-blue-600 focus:ring-blue-500 h-3.5 w-3.5 cursor-pointer"
              />
              <span>Pilih Semua ({selectedLayerIds.length})</span>
            </label>

            {selectedLayerIds.length > 0 && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    const anyVisible = layers.some(l => selectedLayerIds.includes(l.id) && l.visible);
                    layers.forEach(l => {
                      if (selectedLayerIds.includes(l.id) && l.visible === anyVisible) {
                        onToggleLayerVisibility(l.id);
                      }
                    });
                  }}
                  className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded transition-colors text-slate-600 dark:text-slate-300"
                  title="Sembunyikan/Tampilkan Terpilih"
                >
                  <Eye size={12} />
                </button>

                <button
                  onClick={() => {
                    const anyLocked = layers.some(l => selectedLayerIds.includes(l.id) && l.locked);
                    layers.forEach(l => {
                      if (selectedLayerIds.includes(l.id) && l.locked === anyLocked) {
                        onToggleLayerLock(l.id);
                      }
                    });
                  }}
                  className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded transition-colors text-slate-600 dark:text-slate-300"
                  title="Kunci/Buka Terpilih"
                >
                  <Lock size={12} />
                </button>
              </div>
            )}
          </div>

          {/* Layers List */}
          <div className="space-y-1.5">
            {displayLayers.map((layer, index) => {
              const isActive = layer.id === activeLayerId;
              const isSelected = selectedLayerIds.includes(layer.id);
              const isEditing = editingLayerId === layer.id;
              const elemCount = countPerLayer.get(layer.id) || 0;
              const isTop = index === 0;
              const isBottom = index === displayLayers.length - 1;

              return (
                <div
                  key={layer.id}
                  onClick={(e) => {
                    if (e.ctrlKey || e.metaKey) {
                      const isCurrentlySelected = selectedLayerIds.includes(layer.id);
                      const newSelected = isCurrentlySelected
                        ? selectedLayerIds.filter(id => id !== layer.id)
                        : [...selectedLayerIds, layer.id];
                      
                      if (newSelected.length > 0) {
                        onSelectLayerIds(newSelected);
                        if (layer.id === activeLayerId && !newSelected.includes(activeLayerId)) {
                          onSelectActiveLayer(newSelected[0]);
                        }
                      }
                    } else {
                      onSelectActiveLayer(layer.id);
                      onSelectLayerIds([layer.id]);
                    }
                  }}
                  className={`group relative p-2 rounded-xl border transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-50/80 border-blue-400 dark:bg-blue-950/50 dark:border-blue-700 shadow-2xs'
                      : isSelected
                      ? 'bg-slate-50 border-slate-300 dark:bg-slate-800/80 dark:border-slate-700 shadow-3xs'
                      : 'bg-white dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-800 hover:border-slate-300'
                  } ${!layer.visible ? 'opacity-50' : ''}`}
                >
                  <div className="flex items-center justify-between gap-1.5">
                    {/* Checkbox and Layer Name */}
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      {/* Selection Checkbox */}
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onClick={e => e.stopPropagation()}
                        onChange={e => {
                          e.stopPropagation();
                          const isCurrentlySelected = selectedLayerIds.includes(layer.id);
                          const newSelected = isCurrentlySelected
                            ? selectedLayerIds.filter(id => id !== layer.id)
                            : [...selectedLayerIds, layer.id];
                          
                          if (newSelected.length > 0) {
                            onSelectLayerIds(newSelected);
                            if (layer.id === activeLayerId && !newSelected.includes(activeLayerId)) {
                              onSelectActiveLayer(newSelected[0]);
                            }
                          }
                        }}
                        className="rounded text-blue-600 focus:ring-blue-500 h-3.5 w-3.5 cursor-pointer shrink-0"
                        title="Pilih layer ini"
                      />

                      {/* Active Indicator Pin */}
                      {isActive && (
                        <span className="text-[9px] font-bold uppercase tracking-wider text-blue-600 bg-blue-100 dark:bg-blue-900/60 dark:text-blue-300 px-1 py-0.2 rounded shrink-0">
                          Aktif
                        </span>
                      )}

                      {isEditing ? (
                        <div className="flex items-center gap-1 flex-1" onClick={e => e.stopPropagation()}>
                          <input
                            type="text"
                            value={nameDraft}
                            onChange={e => setNameDraft(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter') handleSaveRename(layer.id);
                              if (e.key === 'Escape') setEditingLayerId(null);
                            }}
                            autoFocus
                            className="px-1.5 py-0.5 text-xs font-semibold rounded border border-blue-400 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none w-32"
                          />
                          <button
                            onClick={() => handleSaveRename(layer.id)}
                            className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                          >
                            <Check size={12} />
                          </button>
                        </div>
                      ) : (
                        <div className="min-w-0 flex-1 flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                          <span 
                            onClick={() => {
                              onSelectActiveLayer(layer.id);
                              onSelectLayerIds([layer.id]);
                            }}
                            className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate hover:text-blue-600 dark:hover:text-blue-400"
                          >
                            {layer.name}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 shrink-0">
                            ({elemCount})
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Quick Layer Controls: Eye (Visibility) & Lock */}
                    <div className="flex items-center gap-0.5 shrink-0" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => onToggleLayerVisibility(layer.id)}
                        className={`p-1 rounded-md transition-colors ${
                          layer.visible
                            ? 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                            : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                        }`}
                        title={layer.visible ? 'Sembunyikan Layer' : 'Tampilkan Layer'}
                      >
                        {layer.visible ? <Eye size={13} /> : <EyeOff size={13} />}
                      </button>

                      <button
                        onClick={() => onToggleLayerLock(layer.id)}
                        className={`p-1 rounded-md transition-colors ${
                          layer.locked
                            ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/40'
                            : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                        title={layer.locked ? 'Layer Terkunci (Elemen aman)' : 'Kunci Layer'}
                      >
                        {layer.locked ? <Lock size={13} /> : <Unlock size={13} />}
                      </button>

                      {/* Reorder Up / Down */}
                      <button
                        onClick={() => onMoveLayerOrder(layer.id, 'up')}
                        disabled={isTop}
                        className={`p-1 rounded-md ${
                          isTop ? 'opacity-20 cursor-not-allowed' : 'text-slate-500 hover:bg-slate-100'
                        }`}
                        title="Geser Layer ke Atas"
                      >
                        <ChevronUp size={13} />
                      </button>

                      <button
                        onClick={() => onMoveLayerOrder(layer.id, 'down')}
                        disabled={isBottom}
                        className={`p-1 rounded-md ${
                          isBottom ? 'opacity-20 cursor-not-allowed' : 'text-slate-500 hover:bg-slate-100'
                        }`}
                        title="Geser Layer ke Bawah"
                      >
                        <ChevronDown size={13} />
                      </button>

                      {/* Rename Button */}
                      {!isEditing && (
                        <button
                          onClick={e => handleStartRename(layer, e)}
                          className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md"
                          title="Ubah Nama Layer"
                        >
                          <Pencil size={11} />
                        </button>
                      )}

                      {/* Duplicate Layer */}
                      <button
                        onClick={() => onDuplicateLayer(layer.id)}
                        className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md"
                        title="Duplikat Layer"
                      >
                        <Copy size={11} />
                      </button>

                      {/* Delete Layer (Only if > 1 layer) */}
                      {layers.length > 1 && (
                        <button
                          onClick={() => onDeleteLayer(layer.id)}
                          className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md"
                          title="Hapus Layer"
                        >
                          <Trash2 size={11} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Layer Opacity Slider (Only if active or expanded) */}
                  {isActive && (
                    <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 text-[10px]" onClick={e => e.stopPropagation()}>
                      <span className="text-slate-400 font-bold uppercase tracking-wider">
                        Opasitas Layer
                      </span>
                      <span className="font-mono text-slate-700 dark:text-slate-300">
                        {Math.round(layer.opacity * 100)}%
                      </span>
                      <input
                        type="range"
                        min="0.1"
                        max="1"
                        step="0.05"
                        value={layer.opacity}
                        onChange={e => onChangeLayerOpacity(layer.id, parseFloat(e.target.value))}
                        className="w-28 accent-blue-600 h-1 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Add Layer Button */}
          <button
            onClick={onAddLayer}
            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 rounded-xl transition-colors border border-blue-200 dark:border-blue-800 shadow-2xs"
          >
            <Plus size={14} />
            <span>Tambah Layer Baru</span>
          </button>
        </div>
      )}

      {/* Tab 2: Background (BG) Settings & Template */}
      {activeTab === 'bg' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {/* Paper Pattern */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Pola Kertas
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {(['dots', 'grid', 'lines', 'none'] as GridStyle[]).map(style => (
                <button
                  key={style}
                  onClick={() => onChangeGridStyle(style)}
                  className={`px-2.5 py-2 rounded-xl font-medium text-left capitalize transition-colors ${
                    gridStyle === style
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100'
                  }`}
                >
                  {style === 'dots' ? '• Titik-titik' : style === 'grid' ? '▦ Kotak Grid' : style === 'lines' ? '☰ Garis Buku' : '▢ Polos'}
                </button>
              ))}
            </div>
          </div>

          {/* Background Colors */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Warna Dasar Kanvas
              </span>
              <input
                type="color"
                value={backgroundColor}
                onChange={e => onChangeBackgroundColor(e.target.value)}
                className="w-5 h-5 rounded cursor-pointer border-0 p-0 bg-transparent"
                title="Pilih Warna Bebas (Hex)"
              />
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { label: 'Putih', color: '#ffffff' },
                { label: 'Kertas Hangat', color: '#fafaf9' },
                { label: 'Abu Lembut', color: '#f1f5f9' },
                { label: 'Kuning Pastel', color: '#fefce8' },
                { label: 'Biru Pastel', color: '#f0f9ff' },
                { label: 'Hijau Pastel', color: '#f0fdf4' },
                { label: 'Slate Gelap', color: '#0f172a' },
                { label: 'Hitam Pekat', color: '#020617' },
              ].map(bg => (
                <button
                  key={bg.color}
                  onClick={() => onChangeBackgroundColor(bg.color)}
                  className={`py-1.5 px-2 rounded-lg border text-[11px] font-medium text-center transition-all ${
                    backgroundColor.toLowerCase() === bg.color.toLowerCase()
                      ? 'ring-2 ring-blue-500 scale-105'
                      : 'border-slate-200 dark:border-slate-700'
                  }`}
                  style={{
                    backgroundColor: bg.color,
                    color: bg.color === '#0f172a' || bg.color === '#020617' ? '#ffffff' : '#1e293b',
                  }}
                >
                  {bg.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Background Template Image */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Template Gambar Latar (BG Image)
            </span>
            <p className="text-[11px] text-slate-500">
              Gunakan gambar cetak biru, diagram, partitur, atau peta sebagai dasar jiplakan di layer bawah.
            </p>

            {backgroundImage ? (
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800 dark:text-slate-100 text-xs flex items-center gap-1.5">
                    <ImageIcon size={14} className="text-blue-500" />
                    Gambar Latar Aktif
                  </span>
                  <button
                    onClick={onRemoveBackgroundImage}
                    className="p-1 text-red-500 hover:bg-red-50 rounded"
                    title="Hapus Gambar Latar"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>Transparansi Template</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">
                    {Math.round(backgroundImageOpacity * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.05"
                  value={backgroundImageOpacity}
                  onChange={e => onChangeBackgroundImageOpacity(parseFloat(e.target.value))}
                  className="w-full accent-blue-600 h-1 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                />
              </div>
            ) : (
              <button
                onClick={() => bgImageInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 border border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-400 rounded-xl text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-colors bg-slate-50/50 dark:bg-slate-800/30"
              >
                <Upload size={14} />
                <span>Upload Gambar Template Latar</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
