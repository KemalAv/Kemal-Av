/**
 * Infinity Board - Snipping & Region Marker Tool Overlay
 */

import React from 'react';
import { Copy, Download, Stamp, MousePointer, X } from 'lucide-react';
import { SnippingRegion } from '../types';

interface SnippingOverlayProps {
  region: SnippingRegion | null;
  onCopyRegion: () => void;
  onDownloadRegion: () => void;
  onStampRegionToCanvas: () => void;
  onSelectElementsInRegion: () => void;
  onCancel: () => void;
}

export const SnippingOverlay: React.FC<SnippingOverlayProps> = ({
  region,
  onCopyRegion,
  onDownloadRegion,
  onStampRegionToCanvas,
  onSelectElementsInRegion,
  onCancel,
}) => {
  if (!region) return null;

  const rx = Math.min(region.x, region.x + region.width);
  const ry = Math.min(region.y, region.y + region.height);
  const rw = Math.abs(region.width);
  const rh = Math.abs(region.height);

  if (rw < 10 || rh < 10) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-40">
      {/* Darkened backdrop with cutout for snipped area */}
      <svg className="w-full h-full absolute inset-0">
        <defs>
          <mask id="snipping-mask">
            <rect width="100%" height="100%" fill="white" />
            <rect x={rx} y={ry} width={rw} height={rh} fill="black" />
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="rgba(15, 23, 42, 0.45)"
          mask="url(#snipping-mask)"
        />
        {/* Glowing border around snipped area */}
        <rect
          x={rx}
          y={ry}
          width={rw}
          height={rh}
          fill="none"
          stroke="#0ea5e9"
          strokeWidth="2"
          strokeDasharray="6 4"
          className="animate-pulse"
        />
      </svg>

      {/* Floating Action Menu for Snipped Region */}
      <div
        className="pointer-events-auto absolute flex items-center gap-1.5 bg-white dark:bg-slate-900 p-1.5 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 text-xs animate-in zoom-in-95 duration-150"
        style={{
          left: `${Math.max(10, Math.min(window.innerWidth - 380, rx))}` + 'px',
          top: `${Math.max(10, ry + rh + 10 > window.innerHeight - 50 ? ry - 45 : ry + rh + 10)}` + 'px',
        }}
      >
        <span className="font-mono text-[10px] text-slate-400 px-2 font-bold">
          {Math.round(rw)} × {Math.round(rh)} px
        </span>

        <button
          onClick={onStampRegionToCanvas}
          className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors shadow-2xs"
          title="Tempelkan hasil potong sebagai gambar baru di kanvas"
        >
          <Stamp size={13} />
          <span>Jadikan Gambar</span>
        </button>

        <button
          onClick={onDownloadRegion}
          className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          title="Unduh potongan gambar ini (PNG)"
        >
          <Download size={13} />
          <span>Unduh</span>
        </button>

        <button
          onClick={onCopyRegion}
          className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          title="Salin potongan ke clipboard"
        >
          <Copy size={13} />
          <span>Salin</span>
        </button>

        <button
          onClick={onSelectElementsInRegion}
          className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          title="Pilih semua elemen yang berada di dalam wilayah ini"
        >
          <MousePointer size={13} />
          <span>Pilih Objek</span>
        </button>

        <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-0.5" />

        <button
          onClick={onCancel}
          className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          title="Batal"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
};
