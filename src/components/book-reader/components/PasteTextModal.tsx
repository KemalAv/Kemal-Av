import React, { useState } from 'react';
import { X, Clipboard, ArrowRight } from 'lucide-react';

interface PasteTextModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (title: string, text: string) => void;
}

export const PasteTextModal: React.FC<PasteTextModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) {
      setError('Harap masukkan teks yang ingin dibaca.');
      return;
    }
    setError('');
    onSubmit(title.trim() || 'Teks Tempelan Baru', text);
    setTitle('');
    setText('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
              <Clipboard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">Tempel Teks</h3>
              <p className="text-xs text-slate-500">Masukkan teks artikel, esai, atau materi bacaan Anda</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="doc-title" className="block text-xs font-semibold text-slate-700">
              Judul Dokumen (Opsional)
            </label>
            <input
              id="doc-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Esai Sejarah Peradaban, Bab 1"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent placeholder:text-slate-400"
            />
          </div>

          <div className="space-y-1.5 flex-1 flex flex-col">
            <label htmlFor="doc-content" className="block text-xs font-semibold text-slate-700">
              Isi Teks Bacaan
            </label>
            <textarea
              id="doc-content"
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                if (error) setError('');
              }}
              placeholder="Tempelkan atau ketik teks di sini... Pisahkan paragraf dengan baris kosong (Enter dua kali)."
              rows={10}
              required
              className="w-full px-3.5 py-3 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent placeholder:text-slate-400 font-sans leading-relaxed resize-none flex-1"
            />
          </div>

          {/* Modal Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Tutup
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2 text-xs sm:text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <span>Buka di Reader</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
