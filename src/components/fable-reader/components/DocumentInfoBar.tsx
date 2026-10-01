import React from 'react';
import { Minus, Plus, Maximize2, Minimize2, FileText, Layers, BookOpen } from 'lucide-react';
import { DocType, PdfDisplayMode } from '../types';

interface DocumentInfoBarProps {
  title: string;
  docType: DocType;
  currentPageNumber: number;
  totalPages: number;
  fontSizePercent: number;
  onIncreaseFontSize: () => void;
  onDecreaseFontSize: () => void;
  isExpandedWidth: boolean;
  onToggleExpandWidth: () => void;
  pdfDisplayMode: PdfDisplayMode;
  onTogglePdfMode: (mode: PdfDisplayMode) => void;
}

export const DocumentInfoBar: React.FC<DocumentInfoBarProps> = ({
  title,
  docType,
  currentPageNumber,
  totalPages,
  fontSizePercent,
  onIncreaseFontSize,
  onDecreaseFontSize,
  isExpandedWidth,
  onToggleExpandWidth,
  pdfDisplayMode,
  onTogglePdfMode,
}) => {
  return (
    <div className="bg-white border-b border-slate-200 py-3 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Document Metadata */}
        <div className="flex items-center gap-3 min-w-0">
          {/* Badge */}
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
            <FileText className="w-3 h-3" />
            {docType}
          </span>

          {/* Title */}
          <h2 className="text-sm sm:text-base font-semibold text-slate-800 truncate" title={title}>
            {title}
          </h2>

          {/* Page Counter */}
          <span className="text-xs font-medium text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200 shrink-0">
            Hal. {currentPageNumber} dari {Math.max(1, totalPages)}
          </span>
        </div>

        {/* Right: Controls (Font Sizing, Width Toggle, PDF Mode) */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* PDF Mode Toggle (only visible for PDF files) */}
          {docType === 'PDF' && (
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
              <button
                onClick={() => onTogglePdfMode('reader')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  pdfDisplayMode === 'reader'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Mode baca dengan sorotan kata & auto-scroll"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Mode Baca</span>
              </button>
              <button
                onClick={() => onTogglePdfMode('original')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  pdfDisplayMode === 'original'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Tampilan halaman PDF asli"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>PDF Asli</span>
              </button>
            </div>
          )}

          {/* Font Size Controls */}
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg p-0.5">
            <button
              onClick={onDecreaseFontSize}
              disabled={fontSizePercent <= 70}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              title="Kecilkan teks (−)"
              aria-label="Kecilkan ukuran teks"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs font-semibold text-slate-700 min-w-11 text-center select-none">
              {fontSizePercent}%
            </span>
            <button
              onClick={onIncreaseFontSize}
              disabled={fontSizePercent >= 200}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              title="Besarkan teks (+)"
              aria-label="Besarkan ukuran teks"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Expand / Maximize Width Button */}
          <button
            onClick={onToggleExpandWidth}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
              isExpandedWidth
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
            title={isExpandedWidth ? 'Kembalikan ke lebar standar' : 'Perlebar area dokumen'}
          >
            {isExpandedWidth ? (
              <>
                <Minimize2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Lebar Standar</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Perluas Area</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
