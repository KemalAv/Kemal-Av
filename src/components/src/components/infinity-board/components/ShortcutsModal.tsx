/**
 * Infinity Board - Keyboard Shortcuts Modal
 */

import React from 'react';
import { X, Keyboard, MousePointer, Hand, Pen, Eraser, Square, Type, Undo, Redo, ZoomIn } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcutGroups = [
    {
      category: 'Alat Gambar',
      items: [
        { label: 'Pilih & Transformasi', key: 'V' },
        { label: 'Geser Kanvas (Pan)', key: 'H atau Tahan Spasi' },
        { label: 'Pena Halus', key: 'P' },
        { label: 'Pensil Sketsa', key: 'B' },
        { label: 'Stabilo (Highlighter)', key: 'M' },
        { label: 'Penghapus (Objek / Kuas)', key: 'E' },
        { label: 'Tandai Wilayah / Snipping', key: 'S' },
        { label: 'Bentuk Geometri', key: 'R' },
        { label: 'Teks Bebas', key: 'T' },
        { label: 'Catatan Tempel', key: 'N' },
        { label: 'Upload Gambar', key: 'I' },
      ],
    },
    {
      category: 'Navigasi & Kanvas',
      items: [
        { label: 'Kunci / Buka Kanvas (Lock)', key: 'L' },
        { label: 'Zoom Masuk / Keluar', key: 'Scroll Mouse / Cubit 2 Jari' },
        { label: 'Geser Cepat', key: 'Klik Tengah / Spasi + Drag' },
        { label: 'Reset Zoom (100%)', key: 'Ctrl + 0' },
        { label: 'Pusatkan ke Konten', key: 'Shift + 1' },
      ],
    },
    {
      category: 'Edit, Rotasi & Manipulasi',
      items: [
        { label: 'Putar / Rotate Elemen', key: 'Drag Pin Atas Kotak Seleksi' },
        { label: 'Snap Sudut Rotasi 15°', key: 'Tahan Shift saat Rotasi' },
        { label: 'Urungkan (Undo)', key: 'Ctrl + Z' },
        { label: 'Ulangi (Redo)', key: 'Ctrl + Y / Ctrl+Shift+Z' },
        { label: 'Duplikat Elemen', key: 'Ctrl + D' },
        { label: 'Hapus Elemen', key: 'Delete / Backspace' },
        { label: 'Tempel Gambar dari Clipboard', key: 'Ctrl + V' },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center">
              <Keyboard size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Panduan Tombol Pintas
              </h2>
              <p className="text-xs text-slate-500">
                Gunakan keyboard untuk bekerja lebih cepat di kanvas
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {shortcutGroups.map(group => (
            <div key={group.category} className="space-y-2">
              <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                {group.category}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {group.items.map(item => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs"
                  >
                    <span className="text-slate-700 dark:text-slate-300 font-medium">{item.label}</span>
                    <kbd className="px-2 py-0.5 font-mono text-[11px] font-semibold text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded shadow-2xs">
                      {item.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors"
          >
            Mengerti
          </button>
        </div>
      </div>
    </div>
  );
};
