import React, { useRef } from 'react';
import { BookOpen, Upload, Clipboard, ArrowLeft, FileText } from 'lucide-react';

interface HeaderProps {
  onOpenFile: (file: File) => void;
  onOpenPasteModal: () => void;
  onLoadSampleText?: () => void;
  onBackToHome?: () => void;
  isProcessing?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenFile,
  onOpenPasteModal,
  onLoadSampleText,
  onBackToHome,
  isProcessing = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onOpenFile(file);
    }
    // Reset so same file can be selected again
    if (e.target) {
      e.target.value = '';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          {onBackToHome && (
            <button
              onClick={onBackToHome}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors cursor-pointer"
              title="Kembali ke Beranda"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Kembali</span>
            </button>
          )}

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-slate-900 text-white rounded-lg flex items-center justify-center shadow-xs">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-semibold text-lg sm:text-xl text-slate-900 leading-none tracking-tight">
                Book Reader
              </h1>
              <p className="text-[11px] text-slate-500 font-normal mt-0.5 hidden xs:block">
                Pembaca Dokumen & TTS Real-Time PDF
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Sample Document Button */}
          {onLoadSampleText && (
            <button
              onClick={onLoadSampleText}
              disabled={isProcessing}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              title="Muat teks panduan membaca cepat"
            >
              <FileText className="w-4 h-4 text-slate-500" />
              <span className="hidden sm:inline font-medium">Contoh Teks</span>
            </button>
          )}

          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileInputChange}
            accept=".docx,.pdf,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 active:bg-slate-100 rounded-lg shadow-2xs transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Upload className="w-4 h-4 text-slate-500" />
            <span>Buka file</span>
          </button>

          <button
            onClick={onOpenPasteModal}
            disabled={isProcessing}
            className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-2 text-xs sm:text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 active:bg-black rounded-lg shadow-2xs transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Clipboard className="w-4 h-4 text-slate-200" />
            <span className="hidden sm:inline">Tempel teks</span>
            <span className="sm:hidden">Tempel</span>
          </button>
        </div>
      </div>
    </header>
  );
};
