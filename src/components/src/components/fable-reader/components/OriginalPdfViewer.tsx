import React from 'react';
import { DocPage } from '../types';

interface OriginalPdfViewerProps {
  pages: DocPage[];
  isExpandedWidth: boolean;
}

export const OriginalPdfViewer: React.FC<OriginalPdfViewerProps> = ({
  pages,
  isExpandedWidth,
}) => {
  const containerMaxWidthClass = isExpandedWidth ? 'max-w-5xl' : 'max-w-3xl';

  return (
    <div className={`w-full ${containerMaxWidthClass} mx-auto transition-all duration-200 py-8 px-4 sm:px-6`}>
      <div className="space-y-8">
        {pages.map((page) => (
          <div
            key={page.pageNumber}
            className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden"
          >
            {/* Page Header */}
            <div className="px-6 py-2.5 border-b border-slate-100 flex items-center justify-between text-[11px] font-medium text-slate-400 select-none bg-slate-50/50">
              <span>Halaman PDF Asli {page.pageNumber}</span>
              <span>{page.totalWords} kata terdeteksi</span>
            </div>

            {/* Page Canvas Image */}
            <div className="p-4 sm:p-6 flex justify-center bg-slate-100/50">
              {page.originalCanvasUrl ? (
                <img
                  src={page.originalCanvasUrl}
                  alt={`Halaman PDF ${page.pageNumber}`}
                  className="max-w-full rounded border border-slate-200 shadow-xs bg-white"
                />
              ) : (
                <div className="py-12 text-center text-slate-400 text-sm">
                  Pratinjau visual halaman tidak tersedia. Silakan gunakan Mode Baca.
                </div>
              )}
            </div>

            {/* Page Footer */}
            <div className="px-6 py-2 border-t border-slate-100 flex justify-center text-[10px] text-slate-300 font-mono select-none">
              — Hal. {page.pageNumber} —
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
