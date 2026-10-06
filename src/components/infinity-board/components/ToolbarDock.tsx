/**
 * Infinity Board - Enhanced Responsive Toolbar Dock
 * Extended with Brush, Glow Pen, Rainbow Pen, Technical Dashed Pen,
 * Eraser modes, Snipping tool, and quick presets.
 * Optimized for mobile touch targets and compact layouts.
 */

import React, { useState } from 'react';
import {
  MousePointer2,
  Hand,
  Pen,
  Pencil,
  Highlighter,
  Eraser,
  Sparkles,
  Zap,
  Square,
  Circle,
  ArrowRight,
  Minus,
  Type,
  StickyNote,
  Image as ImageIcon,
  ChevronUp,
  Diamond,
  Triangle,
  Star,
  Crop,
  Spline
} from 'lucide-react';
import { ToolType, ShapeType, StrokeTool, EraserMode } from '../types';

interface ToolbarDockProps {
  activeTool: ToolType;
  onChangeTool: (tool: ToolType) => void;
  activeStrokeTool: StrokeTool;
  onChangeStrokeTool: (st: StrokeTool) => void;
  activeShapeType: ShapeType;
  onChangeShapeType: (shape: ShapeType) => void;
  eraserMode: EraserMode;
  onChangeEraserMode: (mode: EraserMode) => void;
  onUploadImageClick: () => void;
}

export const ToolbarDock: React.FC<ToolbarDockProps> = ({
  activeTool,
  onChangeTool,
  activeStrokeTool,
  onChangeStrokeTool,
  activeShapeType,
  onChangeShapeType,
  eraserMode,
  onChangeEraserMode,
  onUploadImageClick,
}) => {
  const [isPenMenuOpen, setIsPenMenuOpen] = useState(false);
  const [isShapeMenuOpen, setIsShapeMenuOpen] = useState(false);
  const [isEraserMenuOpen, setIsEraserMenuOpen] = useState(false);

  const getShapeIcon = (type: ShapeType) => {
    switch (type) {
      case 'rectangle': return <Square size={18} />;
      case 'ellipse': return <Circle size={18} />;
      case 'line': return <Minus size={18} />;
      case 'arrow': return <ArrowRight size={18} />;
      case 'diamond': return <Diamond size={18} />;
      case 'triangle': return <Triangle size={18} />;
      case 'star': return <Star size={18} />;
    }
  };

  const strokeToolsList: {
    id: StrokeTool;
    label: string;
    icon: React.ReactNode;
    colorBadge: string;
  }[] = [
    { id: 'pen', label: 'Pulpen Halus', icon: <Pen size={18} />, colorBadge: 'bg-blue-500' },
    { id: 'brush', label: 'Kuas Kaligrafi', icon: <Spline size={18} />, colorBadge: 'bg-emerald-500' },
    { id: 'pencil', label: 'Pensil Sketsa', icon: <Pencil size={18} />, colorBadge: 'bg-slate-500' },
    { id: 'highlighter', label: 'Stabilo Transparan', icon: <Highlighter size={18} />, colorBadge: 'bg-yellow-400' },
    { id: 'glow', label: 'Pena Neon Glow', icon: <Zap size={18} />, colorBadge: 'bg-cyan-400' },
    { id: 'dashed', label: 'Garis Putus Teknis', icon: <Minus size={18} />, colorBadge: 'bg-purple-500' },
    { id: 'rainbow', label: 'Pena Pelangi', icon: <Sparkles size={18} />, colorBadge: 'bg-gradient-to-r from-red-500 via-green-500 to-blue-500' },
  ];

  const currentStrokeToolMeta = strokeToolsList.find(t => t.id === activeStrokeTool) || strokeToolsList[0];
  const isDrawingToolActive = ['pen', 'brush', 'pencil', 'highlighter', 'glow', 'dashed', 'rainbow'].includes(activeTool);

  return (
    <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 flex items-center pointer-events-none select-none">
      <div className="pointer-events-auto flex items-center gap-1 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl px-2 py-1.5 rounded-2xl shadow-2xl border border-slate-200/90 dark:border-slate-800 ring-1 ring-black/5">
        {/* Select & Move */}
        <button
          onClick={() => {
            onChangeTool('select');
            setIsPenMenuOpen(false);
            setIsShapeMenuOpen(false);
            setIsEraserMenuOpen(false);
          }}
          className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all ${
            activeTool === 'select'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 scale-105'
              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
          title="Pilih & Transformasi (V)"
        >
          <MousePointer2 size={18} />
        </button>

        {/* Hand Pan */}
        <button
          onClick={() => {
            onChangeTool('hand');
            setIsPenMenuOpen(false);
            setIsShapeMenuOpen(false);
            setIsEraserMenuOpen(false);
          }}
          className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all ${
            activeTool === 'hand'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 scale-105'
              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
          title="Geser Kanvas (H / Tahan Spasi)"
        >
          <Hand size={18} />
        </button>

        <div className="h-5 w-px bg-slate-200 dark:bg-slate-700 mx-0.5" />

        {/* Extended Pen Tool Selector with Submenu */}
        <div className="relative">
          <button
            onClick={() => {
              onChangeTool(activeStrokeTool);
              setIsPenMenuOpen(!isPenMenuOpen);
              setIsShapeMenuOpen(false);
              setIsEraserMenuOpen(false);
            }}
            className={`flex items-center justify-center gap-0.5 px-2 h-10 rounded-xl transition-all ${
              isDrawingToolActive
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 scale-105'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title={`Pena & Alat Tulis: ${currentStrokeToolMeta.label} (P)`}
          >
            {currentStrokeToolMeta.icon}
            <ChevronUp size={12} className={`transition-transform ${isPenMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {isPenMenuOpen && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 bg-white dark:bg-slate-900 p-2 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-56 flex flex-col gap-1 z-50">
              <span className="text-[10px] font-bold text-slate-400 px-2 py-1 uppercase tracking-wider">
                Pilih Jenis Pena
              </span>
              {strokeToolsList.map(st => (
                <button
                  key={st.id}
                  onClick={() => {
                    onChangeStrokeTool(st.id);
                    onChangeTool(st.id);
                    setIsPenMenuOpen(false);
                  }}
                  className={`flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium transition-colors ${
                    activeStrokeTool === st.id && isDrawingToolActive
                      ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-300 font-bold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200">
                    {st.icon}
                  </div>
                  <div className="flex-1 text-left">
                    <span>{st.label}</span>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${st.colorBadge}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Eraser Tool with Mode Submenu */}
        <div className="relative">
          <button
            onClick={() => {
              onChangeTool('eraser');
              setIsEraserMenuOpen(!isEraserMenuOpen);
              setIsPenMenuOpen(false);
              setIsShapeMenuOpen(false);
            }}
            className={`flex items-center justify-center gap-0.5 px-2 h-10 rounded-xl transition-all ${
              activeTool === 'eraser'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 scale-105'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title={`Penghapus: ${eraserMode === 'stroke' ? 'Hapus Objek Utuh' : 'Kuas Penghapus'} (E)`}
          >
            <Eraser size={18} />
            <ChevronUp size={12} className={`transition-transform ${isEraserMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {isEraserMenuOpen && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 bg-white dark:bg-slate-900 p-2 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-48 flex flex-col gap-1 z-50">
              <span className="text-[10px] font-bold text-slate-400 px-2 py-1 uppercase tracking-wider">
                Mode Penghapus
              </span>
              <button
                onClick={() => {
                  onChangeEraserMode('stroke');
                  onChangeTool('eraser');
                  setIsEraserMenuOpen(false);
                }}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium ${
                  eraserMode === 'stroke'
                    ? 'bg-blue-50 text-blue-600 font-bold dark:bg-blue-950/50 dark:text-blue-300'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                }`}
              >
                <span>Hapus Objek Utuh</span>
              </button>
              <button
                onClick={() => {
                  onChangeEraserMode('brush');
                  onChangeTool('eraser');
                  setIsEraserMenuOpen(false);
                }}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium ${
                  eraserMode === 'brush'
                    ? 'bg-blue-50 text-blue-600 font-bold dark:bg-blue-950/50 dark:text-blue-300'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                }`}
              >
                <span>Usap / Kuas Parsial</span>
              </button>
            </div>
          )}
        </div>

        <div className="h-5 w-px bg-slate-200 dark:bg-slate-700 mx-0.5" />

        {/* Shapes Menu */}
        <div className="relative">
          <button
            onClick={() => {
              onChangeTool('shape');
              setIsShapeMenuOpen(!isShapeMenuOpen);
              setIsPenMenuOpen(false);
              setIsEraserMenuOpen(false);
            }}
            className={`flex items-center justify-center gap-0.5 px-2 h-10 rounded-xl transition-all ${
              activeTool === 'shape'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 scale-105'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title="Bentuk Geometri (R)"
          >
            {getShapeIcon(activeShapeType)}
            <ChevronUp size={12} className={`transition-transform ${isShapeMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {isShapeMenuOpen && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 bg-white dark:bg-slate-900 p-2 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-1.5 z-50">
              {(['rectangle', 'ellipse', 'arrow', 'line', 'diamond', 'triangle', 'star'] as ShapeType[]).map(st => (
                <button
                  key={st}
                  onClick={() => {
                    onChangeShapeType(st);
                    onChangeTool('shape');
                    setIsShapeMenuOpen(false);
                  }}
                  className={`p-2 rounded-lg transition-colors ${
                    activeShapeType === st && activeTool === 'shape'
                      ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-300'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                  title={st}
                >
                  {getShapeIcon(st)}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Text Tool */}
        <button
          onClick={() => {
            onChangeTool('text');
            setIsPenMenuOpen(false);
            setIsShapeMenuOpen(false);
            setIsEraserMenuOpen(false);
          }}
          className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all ${
            activeTool === 'text'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 scale-105'
              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
          title="Teks Bebas (T)"
        >
          <Type size={18} />
        </button>

        {/* Sticky Note */}
        <button
          onClick={() => {
            onChangeTool('note');
            setIsPenMenuOpen(false);
            setIsShapeMenuOpen(false);
            setIsEraserMenuOpen(false);
          }}
          className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all ${
            activeTool === 'note'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 scale-105'
              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
          title="Catatan Tempel (N)"
        >
          <StickyNote size={18} />
        </button>

        {/* Snipping Tool / Tandai Wilayah */}
        <button
          onClick={() => {
            onChangeTool('snipping');
            setIsPenMenuOpen(false);
            setIsShapeMenuOpen(false);
            setIsEraserMenuOpen(false);
          }}
          className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all ${
            activeTool === 'snipping'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 scale-105'
              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
          title="Tandai Wilayah / Snipping (S)"
        >
          <Crop size={18} />
        </button>

        {/* Image Upload */}
        <button
          onClick={() => {
            setIsPenMenuOpen(false);
            setIsShapeMenuOpen(false);
            setIsEraserMenuOpen(false);
            onUploadImageClick();
          }}
          className="flex items-center justify-center w-10 h-10 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Upload Gambar (I)"
        >
          <ImageIcon size={18} />
        </button>
      </div>
    </div>
  );
};
