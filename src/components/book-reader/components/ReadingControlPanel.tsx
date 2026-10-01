import React from 'react';
import {
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Volume2,
  Clock,
  Gauge,
  Sparkles,
  SlidersHorizontal,
} from 'lucide-react';
import { HighlightMode } from '../types';

interface ReadingControlPanelProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  onPrevWord: () => void;
  onNextWord: () => void;
  wpm: number;
  onWpmChange: (wpm: number) => void;
  highlightMode: HighlightMode;
  onHighlightModeChange: (mode: HighlightMode) => void;
  showVisuals: boolean;
  onToggleVisuals: () => void;
  pageRemainingTime: string;
  totalRemainingTime: string;
  progressPercent: number;
  currentWordIndex: number;
  totalWords: number;
  isTtsPanelOpen: boolean;
  onToggleTtsPanel: () => void;
  isMuted: boolean;
}

export const ReadingControlPanel: React.FC<ReadingControlPanelProps> = ({
  isPlaying,
  onTogglePlay,
  onPrevWord,
  onNextWord,
  wpm,
  onWpmChange,
  highlightMode,
  onHighlightModeChange,
  showVisuals,
  onToggleVisuals,
  pageRemainingTime,
  totalRemainingTime,
  progressPercent,
  currentWordIndex,
  totalWords,
  isTtsPanelOpen,
  onToggleTtsPanel,
  isMuted,
}) => {
  return (
    <div className="bg-white border-b border-slate-200 shadow-2xs sticky top-16 z-30">
      {/* Top Reading Progress Bar */}
      <div className="w-full bg-slate-100 h-1 relative overflow-hidden">
        <div
          className="h-full bg-slate-900 transition-all duration-150 ease-out"
          style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Section 1: Playback Controls & Skip Buttons */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Previous Word Button */}
            <button
              onClick={onPrevWord}
              disabled={currentWordIndex <= 0}
              className="p-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 active:bg-slate-200 rounded-lg border border-slate-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              title="Kata Sebelumnya (Panah Kiri)"
              aria-label="Kata Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Primary Action Button: Mulai baca + suara / Jeda */}
            <button
              onClick={onTogglePlay}
              className={`flex items-center justify-center gap-2 px-4 sm:px-5 py-2 text-xs sm:text-sm font-semibold rounded-lg shadow-xs transition-all cursor-pointer select-none ${
                isPlaying
                  ? 'bg-amber-600 hover:bg-amber-700 text-white'
                  : 'bg-slate-900 hover:bg-slate-800 active:bg-black text-white'
              }`}
              title={isPlaying ? 'Jeda Membaca (Spasi)' : 'Mulai Membaca & Suara (Spasi)'}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4 fill-white" />
                  <span>Jeda</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>Mulai baca + suara</span>
                </>
              )}
            </button>

            {/* Next Word Button */}
            <button
              onClick={onNextWord}
              disabled={currentWordIndex >= totalWords - 1}
              className="p-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 active:bg-slate-200 rounded-lg border border-slate-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              title="Kata Berikutnya (Panah Kanan)"
              aria-label="Kata Berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* TTS Panel Toggle Button */}
            <button
              onClick={onToggleTtsPanel}
              className={`flex items-center gap-1.5 px-2.5 py-2 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                isTtsPanelOpen
                  ? 'bg-slate-100 text-slate-900 border-slate-300'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
              title="Pengaturan Suara TTS"
            >
              <Volume2 className={`w-3.5 h-3.5 ${isMuted ? 'text-amber-500' : 'text-slate-700'}`} />
              <span className="hidden sm:inline">TTS</span>
            </button>
          </div>

          {/* Section 2: WPM Control & Rhythm Indicator */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 min-w-[280px] lg:min-w-[340px]">
            <div className="flex items-center justify-between sm:justify-start gap-2">
              <div className="flex items-center gap-1.5 text-slate-700">
                <Gauge className="w-4 h-4 text-slate-500" />
                <span className="text-xs font-semibold">Kecepatan:</span>
              </div>
              <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-900 shadow-2xs min-w-16 text-center">
                {wpm} WPM
              </span>
            </div>

            <div className="flex-1 flex flex-col justify-center">
              <input
                type="range"
                min={10}
                max={500}
                step={5}
                value={wpm}
                onChange={(e) => onWpmChange(Number(e.target.value))}
                className="w-full accent-slate-900 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                title={`Kecepatan Membaca: ${wpm} WPM`}
              />
              <span className="text-[10px] text-slate-600 mt-1 font-normal">
                1 kata standar = 5 huruf
              </span>
            </div>
          </div>

          {/* Section 3: Highlight Modes & Visual Toggle */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Highlight Mode Segmented Control */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
              <span className="text-[11px] font-semibold text-slate-600 px-2 select-none hidden md:inline">
                Sorotan:
              </span>
              <button
                onClick={() => onHighlightModeChange('word')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  highlightMode === 'word'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Sorot seluruh kata yang sedang dibaca"
              >
                Kata
              </button>
              <button
                onClick={() => onHighlightModeChange('letter')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  highlightMode === 'letter'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Sorot karakter/huruf aktif di dalam kata"
              >
                Huruf
              </button>
              <button
                onClick={() => onHighlightModeChange('both')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  highlightMode === 'both'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Sorot kata dan huruf aktif sekaligus"
              >
                Keduanya
              </button>
            </div>

            {/* Toggle Visual Objects (Images/Tables) */}
            <button
              onClick={onToggleVisuals}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                showVisuals
                  ? 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  : 'bg-slate-100 text-slate-500 border-slate-300'
              }`}
              title={showVisuals ? 'Sembunyikan Gambar & Tabel Dokumen' : 'Tampilkan Gambar & Tabel Dokumen'}
            >
              {showVisuals ? (
                <>
                  <Eye className="w-3.5 h-3.5 text-slate-600" />
                  <span className="hidden xl:inline">Objek Visual</span>
                </>
              ) : (
                <>
                  <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                  <span className="hidden xl:inline">Objek Visual</span>
                </>
              )}
            </button>
          </div>

          {/* Section 4: Time Estimation & Progress Indicator */}
          <div className="flex items-center justify-between sm:justify-end gap-3 text-xs text-slate-600 border-t lg:border-t-0 pt-2 lg:pt-0">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1" title="Estimasi sisa waktu untuk halaman aktif">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[11px] text-slate-600">Hal. Aktif:</span>
                <span className="font-mono font-semibold text-slate-800">{pageRemainingTime}</span>
              </div>

              <div className="h-3 w-px bg-slate-200" />

              <div className="flex items-center gap-1" title="Estimasi sisa waktu untuk menyelesaikan seluruh dokumen">
                <span className="text-[11px] text-slate-600">Sisa:</span>
                <span className="font-mono font-semibold text-slate-800">{totalRemainingTime}</span>
              </div>
            </div>

            <span className="text-xs font-bold font-mono text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 shrink-0">
              {progressPercent}%
            </span>
          </div>

        </div>
      </div>
    </div>
  );
};
