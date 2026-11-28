/**
 * Infinity Board - Export Modal
 * Emphasizes .infboard as the SOLE PRIMARY RECOMMENDED format for full fidelity & re-importing,
 * with static image/vector formats clearly organized as secondary/backup options.
 */

import React, { useState } from 'react';
import { 
  X, 
  Download, 
  Image as ImageIcon, 
  FileCode, 
  FileJson, 
  Check, 
  Star,
  ChevronDown,
  Info,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { Project } from '../types';
import { exportProjectToImage, exportProjectToSVG, exportProjectToJSON } from '../exporter';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
}

type ExportType = 'infboard' | 'png' | 'jpeg' | 'svg';

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  project,
}) => {
  // Default to infboard as requested!
  const [selectedFormat, setSelectedFormat] = useState<ExportType>('infboard');
  const [transparentBg, setTransparentBg] = useState(false);
  const [cropToContent, setCropToContent] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [showBackupOptions, setShowBackupOptions] = useState(false);

  if (!isOpen) return null;

  const handleExport = async () => {
    setIsExporting(true);
    try {
      if (selectedFormat === 'infboard') {
        exportProjectToJSON(project);
      } else if (selectedFormat === 'png' || selectedFormat === 'jpeg') {
        await exportProjectToImage(project, {
          format: selectedFormat,
          transparentBg: selectedFormat === 'png' ? transparentBg : false,
          cropToContent,
          scale: 2, // 2x retina
        });
      } else if (selectedFormat === 'svg') {
        exportProjectToSVG(project);
      }
      onClose();
    } catch (err) {
      console.error('Export failed', err);
      alert('Gagal mengekspor: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsExporting(false);
    }
  };

  const backupFormats: {
    id: 'png' | 'jpeg' | 'svg';
    title: string;
    description: string;
    icon: React.ReactNode;
    badge: string;
  }[] = [
    {
      id: 'png',
      title: 'Gambar PNG (Statis)',
      description: 'Gambar raster resolusi tinggi (2x Retina), bisa transparan. Cocok untuk dibagikan atau dicetak.',
      icon: <ImageIcon size={18} className="text-blue-500" />,
      badge: 'PNG',
    },
    {
      id: 'jpeg',
      title: 'Gambar JPEG (Statis)',
      description: 'Gambar terkompresi dengan latar belakang putih/gelap untuk ukuran file lebih kecil.',
      icon: <ImageIcon size={18} className="text-amber-500" />,
      badge: 'JPG',
    },
    {
      id: 'svg',
      title: 'Vektor SVG (Kurva)',
      description: 'Vektor kurva garis tanpa pecah, dapat dibuka di Figma atau Adobe Illustrator.',
      icon: <FileCode size={18} className="text-emerald-500" />,
      badge: 'SVG',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Simpan & Ekspor Kanvas
            </h2>
            <p className="text-xs text-slate-500">
              Proyek: <span className="font-semibold text-slate-700 dark:text-slate-300">"{project.title}"</span> ({project.elements.length} elemen)
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* SECTION 1: PRIMARY / MAIN RECOMMENDATION (.infboard) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1">
                <Star size={13} className="fill-blue-600 dark:fill-blue-400" />
                Rekomendasi Utama
              </span>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck size={12} />
                Bisa Diimpor & Diedit Lagi
              </span>
            </div>

            {/* Primary Card: .infboard */}
            <div
              onClick={() => setSelectedFormat('infboard')}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative overflow-hidden ${
                selectedFormat === 'infboard'
                  ? 'bg-blue-50/80 border-blue-600 dark:bg-blue-950/50 dark:border-blue-500 shadow-md ring-2 ring-blue-500/20'
                  : 'border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/30">
                    <FileJson size={24} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                        File Proyek (.infboard)
                      </h3>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 dark:bg-blue-900/80 dark:text-blue-300 font-bold">
                        Wajib untuk Backup
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mt-1">
                      Menyimpan seluruh data coretan pen, bentuk, foto, catatan, posisi, dan layer secara utuh. <span className="font-semibold text-blue-700 dark:text-blue-300">Satu-satunya format yang dapat Anda impor kembali ke Infinity Board</span> untuk melanjutkan mengedit kapan saja.
                    </p>
                  </div>
                </div>

                <div className="shrink-0 pt-0.5">
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                      selectedFormat === 'infboard'
                        ? 'border-blue-600 bg-blue-600 text-white'
                        : 'border-slate-300 dark:border-slate-700'
                    }`}
                  >
                    {selectedFormat === 'infboard' && <Check size={12} strokeWidth={3} />}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: BACKUP / STATIC EXPORT OPTIONS */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setShowBackupOptions(!showBackupOptions)}
              className="w-full flex items-center justify-between text-left group py-1"
            >
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Pilihan Cadangan (Gambar & Vektor Statis)
                </span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Hanya untuk dibagikan atau dilihat. <span className="text-amber-600 dark:text-amber-400">Tidak bisa diedit ulang.</span>
                </p>
              </div>
              <ChevronDown
                size={16}
                className={`text-slate-400 transition-transform ${showBackupOptions ? 'rotate-180' : ''}`}
              />
            </button>

            {showBackupOptions && (
              <div className="space-y-2 pt-1 animate-in fade-in duration-150">
                {backupFormats.map(fmt => {
                  const isSelected = selectedFormat === fmt.id;
                  return (
                    <div
                      key={fmt.id}
                      onClick={() => setSelectedFormat(fmt.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-slate-100 dark:bg-slate-800 border-slate-400 dark:border-slate-600 shadow-sm'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0">
                          {fmt.icon}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                              {fmt.title}
                            </span>
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                              {fmt.badge}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {fmt.description}
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0 ml-3">
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                            isSelected
                              ? 'border-blue-600 bg-blue-600 text-white'
                              : 'border-slate-300 dark:border-slate-700'
                          }`}
                        >
                          {isSelected && <Check size={10} strokeWidth={3} />}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Sub-options for PNG / JPEG */}
                {(selectedFormat === 'png' || selectedFormat === 'jpeg') && (
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl space-y-2 border border-slate-200/80 dark:border-slate-800 text-xs">
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-slate-700 dark:text-slate-300">Pangkas otomatis ke batas gambar</span>
                      <input
                        type="checkbox"
                        checked={cropToContent}
                        onChange={e => setCropToContent(e.target.checked)}
                        className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                      />
                    </label>

                    {selectedFormat === 'png' && (
                      <label className="flex items-center justify-between cursor-pointer">
                        <span className="text-slate-700 dark:text-slate-300">Latar belakang transparan</span>
                        <input
                          type="checkbox"
                          checked={transparentBg}
                          onChange={e => setTransparentBg(e.target.checked)}
                          className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                        />
                      </label>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 flex items-center justify-between">
          <div className="text-[11px] text-slate-500 flex items-center gap-1">
            <Info size={13} className="text-blue-500" />
            <span>
              {selectedFormat === 'infboard'
                ? 'Format .infboard aman untuk diimpor kembali.'
                : 'Pilihan cadangan format gambar statis.'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Batal
            </button>
            <button
              onClick={handleExport}
              disabled={isExporting}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white rounded-xl shadow-md transition-all ${
                selectedFormat === 'infboard'
                  ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/25'
                  : 'bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600'
              }`}
            >
              <Download size={14} />
              <span>
                {isExporting 
                  ? 'Memproses...' 
                  : selectedFormat === 'infboard'
                  ? 'Simpan File .infboard'
                  : `Unduh ${selectedFormat.toUpperCase()}`}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
