import React, { useEffect, useRef, useState } from 'react';
import { DocPage, HighlightColor, HighlightMode, WordItem } from '../types';
import { Volume2, Play, Pause } from 'lucide-react';

interface OriginalPdfViewerProps {
  pages: DocPage[];
  isExpandedWidth: boolean;
  currentWordIndex: number;
  activeCharIndexInWord: number;
  highlightMode: HighlightMode;
  allWords: WordItem[];
  onWordClick?: (wordIndex: number) => void;
  isPlaying?: boolean;
  onTogglePlay?: () => void;
  highlightColor?: HighlightColor;
  onHighlightColorChange?: (color: HighlightColor) => void;
  wpm?: number;
  isMuted?: boolean;
  pdfDoc?: any;
  fontSizePercent?: number;
}

const COLOR_CONFIGS: Record<HighlightColor, {
  name: string;
  bg: string;
  bothWordBg: string;
  border: string;
  shadow: string;
  letterBg: string;
  letterBorder: string;
  letterShadow: string;
  dotClass: string;
}> = {
  sky: {
    name: 'Biru Langit (Standar)',
    bg: 'rgba(186, 230, 253, 0.82)',
    bothWordBg: 'rgba(224, 242, 254, 0.65)',
    border: '1.5px solid rgba(14, 165, 233, 0.85)',
    shadow: '0 0 0 1.5px rgba(56, 189, 248, 0.8), 0 2px 6px rgba(14, 165, 233, 0.28)',
    letterBg: 'rgba(2, 132, 199, 0.92)',
    letterBorder: '1.5px solid #0369a1',
    letterShadow: '0 0 0 1.5px rgba(14, 165, 233, 0.95), 0 2px 5px rgba(2, 132, 199, 0.45)',
    dotClass: 'bg-sky-500',
  },
  amber: {
    name: 'Kuning Stabilo',
    bg: 'rgba(254, 240, 138, 0.82)',
    bothWordBg: 'rgba(254, 249, 195, 0.65)',
    border: '1.5px solid rgba(217, 119, 6, 0.85)',
    shadow: '0 0 0 1.5px rgba(245, 158, 11, 0.8), 0 2px 6px rgba(217, 119, 6, 0.28)',
    letterBg: 'rgba(217, 119, 6, 0.92)',
    letterBorder: '1.5px solid #b45309',
    letterShadow: '0 0 0 1.5px rgba(245, 158, 11, 0.95), 0 2px 5px rgba(217, 119, 6, 0.45)',
    dotClass: 'bg-amber-500',
  },
  emerald: {
    name: 'Hijau Mint',
    bg: 'rgba(167, 243, 208, 0.82)',
    bothWordBg: 'rgba(209, 250, 229, 0.65)',
    border: '1.5px solid rgba(5, 150, 105, 0.85)',
    shadow: '0 0 0 1.5px rgba(16, 185, 129, 0.8), 0 2px 6px rgba(5, 150, 105, 0.28)',
    letterBg: 'rgba(5, 150, 105, 0.92)',
    letterBorder: '1.5px solid #047857',
    letterShadow: '0 0 0 1.5px rgba(16, 185, 129, 0.95), 0 2px 5px rgba(5, 150, 105, 0.45)',
    dotClass: 'bg-emerald-500',
  },
  purple: {
    name: 'Ungu Lavender',
    bg: 'rgba(233, 213, 255, 0.82)',
    bothWordBg: 'rgba(243, 232, 255, 0.65)',
    border: '1.5px solid rgba(147, 51, 234, 0.85)',
    shadow: '0 0 0 1.5px rgba(168, 85, 247, 0.8), 0 2px 6px rgba(147, 51, 234, 0.28)',
    letterBg: 'rgba(147, 51, 234, 0.92)',
    letterBorder: '1.5px solid #7e22ce',
    letterShadow: '0 0 0 1.5px rgba(168, 85, 247, 0.95), 0 2px 5px rgba(147, 51, 234, 0.45)',
    dotClass: 'bg-purple-500',
  },
};

interface HighResPdfPageCanvasProps {
  pdfDoc?: any;
  pageNumber: number;
  fallbackUrl?: string;
  isExpandedWidth: boolean;
  fontSizePercent: number;
}

const HighResPdfPageCanvas: React.FC<HighResPdfPageCanvasProps> = ({
  pdfDoc,
  pageNumber,
  fallbackUrl,
  isExpandedWidth,
  fontSizePercent,
}) => {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isRendered, setIsRendered] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;

    let timeoutId: NodeJS.Timeout | null = null;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = Math.round(entry.contentRect.width);
        if (w > 0) {
          if (timeoutId) clearTimeout(timeoutId);
          timeoutId = setTimeout(() => {
            setContainerWidth(w);
          }, 80);
        }
      }
    });

    observer.observe(el);
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;

    let cancelled = false;
    let renderTask: any = null;

    const renderHighDpiPage = async () => {
      try {
        const page = await pdfDoc.getPage(pageNumber);
        if (cancelled || !canvasRef.current) return;

        const baseViewport = page.getViewport({ scale: 1 });
        const dpr = typeof window !== 'undefined' ? Math.max(window.devicePixelRatio || 1, 2.25) : 2.5;
        const targetCssWidth = containerWidth > 0 ? containerWidth : (isExpandedWidth ? 1400 : 850);
        const zoomFactor = Math.max(0.7, fontSizePercent / 100);

        // Compute crisp vector scale matching exact display width * high-DPI supersampling
        const desiredScale = (targetCssWidth / baseViewport.width) * dpr * zoomFactor;
        const highResScale = Math.min(4.5, Math.max(3.0, desiredScale));

        const viewport = page.getViewport({ scale: highResScale });
        const offscreenCanvas = document.createElement('canvas');
        offscreenCanvas.width = Math.floor(viewport.width);
        offscreenCanvas.height = Math.floor(viewport.height);

        const ctx = offscreenCanvas.getContext('2d', { alpha: false });
        if (!ctx) return;

        // Plain white background matching text reader
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, offscreenCanvas.width, offscreenCanvas.height);

        renderTask = (page.render as any)({
          canvasContext: ctx,
          viewport,
          canvas: offscreenCanvas,
          background: '#ffffff',
        });

        await renderTask.promise;
        if (cancelled || !canvasRef.current) return;

        // Clean any faint off-white/gray paper tint so background is 100% plain white
        try {
          const imgData = ctx.getImageData(0, 0, offscreenCanvas.width, offscreenCanvas.height);
          const data = imgData.data;
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            if (r >= 235 && g >= 235 && b >= 230 && Math.abs(r - g) <= 12 && Math.abs(g - b) <= 16) {
              data[i] = 255;
              data[i + 1] = 255;
              data[i + 2] = 255;
            }
          }
          ctx.putImageData(imgData, 0, 0);
        } catch {
          // Ignore if canvas pixel manipulation is restricted
        }

        const targetCanvas = canvasRef.current;
        targetCanvas.width = offscreenCanvas.width;
        targetCanvas.height = offscreenCanvas.height;
        const targetCtx = targetCanvas.getContext('2d', { alpha: false });
        if (targetCtx) {
          targetCtx.drawImage(offscreenCanvas, 0, 0);
          setIsRendered(true);
        }
      } catch (err: any) {
        if (err?.name !== 'RenderingCancelledException') {
          console.warn(`High-DPI render warning on page ${pageNumber}:`, err);
        }
      }
    };

    renderHighDpiPage();

    return () => {
      cancelled = true;
      if (renderTask && typeof renderTask.cancel === 'function') {
        try {
          renderTask.cancel();
        } catch {
          // Ignore cancel error
        }
      }
    };
  }, [pdfDoc, pageNumber, containerWidth, isExpandedWidth, fontSizePercent]);

  return (
    <div ref={wrapperRef} className="w-full bg-white">
      {pdfDoc ? (
        <>
          <canvas
            ref={canvasRef}
            className={`block w-full h-auto pointer-events-none bg-white ${isRendered ? '' : 'hidden'}`}
          />
          {!isRendered && fallbackUrl && (
            <img
              src={fallbackUrl}
              alt={`Halaman PDF ${pageNumber}`}
              className="block w-full h-auto pointer-events-none bg-white"
              draggable={false}
            />
          )}
        </>
      ) : fallbackUrl ? (
        <img
          src={fallbackUrl}
          alt={`Halaman PDF ${pageNumber}`}
          className="block w-full h-auto pointer-events-none bg-white"
          draggable={false}
        />
      ) : null}
    </div>
  );
};

export const OriginalPdfViewer: React.FC<OriginalPdfViewerProps> = ({
  pages,
  isExpandedWidth,
  currentWordIndex,
  activeCharIndexInWord,
  highlightMode,
  allWords,
  onWordClick,
  isPlaying = false,
  onTogglePlay,
  highlightColor = 'sky',
  onHighlightColorChange,
  wpm = 180,
  isMuted = false,
  pdfDoc,
  fontSizePercent = 100,
}) => {
  const containerMaxWidthClass = isExpandedWidth ? 'w-full max-w-none px-0' : 'max-w-3xl px-4 sm:px-6';
  const activeWord = allWords[currentWordIndex];
  const activeHighlightRef = useRef<HTMLDivElement | null>(null);

  const activeColorConfig = COLOR_CONFIGS[highlightColor] || COLOR_CONFIGS.sky;

  // Auto-scroll to keep active word on the PDF comfortably centered in view
  useEffect(() => {
    if (!activeHighlightRef.current) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const rect = activeHighlightRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const isAbove = rect.top < 180;
    const isBelow = rect.bottom > viewportHeight - 160;

    if (isAbove || isBelow) {
      activeHighlightRef.current.scrollIntoView({
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
        block: 'center',
        inline: 'nearest',
      });
    }
  }, [currentWordIndex]);

  // Context snippet for floating HUD
  const getContextSnippet = () => {
    if (!activeWord) return '';
    const start = Math.max(0, currentWordIndex - 3);
    const end = Math.min(allWords.length, currentWordIndex + 5);
    return allWords.slice(start, end).map(w => w.text).join(' ');
  };

  // Helper to calculate active letter bounds inside the word's bbox
  const calculateLetterBounds = (word: WordItem, charIdx: number) => {
    if (!word.bbox) return null;
    const cleanChars = word.text.split('').filter(c => /[a-zA-Z0-9\u00C0-\u024F]/.test(c));
    const totalLetters = Math.max(1, cleanChars.length);
    const safeCharIdx = Math.min(Math.max(0, charIdx), totalLetters - 1);
    const charWidthPct = word.bbox.width / totalLetters;
    const charLeftPct = word.bbox.left + (safeCharIdx * charWidthPct);

    return {
      left: charLeftPct,
      top: word.bbox.top,
      width: charWidthPct,
      height: word.bbox.height,
    };
  };

  return (
    <div className={`w-full ${containerMaxWidthClass} mx-auto transition-all duration-200 ${isExpandedWidth ? 'py-1 sm:py-3' : 'py-6 sm:py-8'} relative pb-28`}>
      <div className={isExpandedWidth ? "space-y-4" : "space-y-10"}>
        {pages.map((page) => {
          const isActivePage = activeWord?.pageIndex === page.pageNumber - 1;
          const pageWords = page.paragraphs.flatMap(p => p.words);
          const letterBounds = (isActivePage && activeWord) ? calculateLetterBounds(activeWord, activeCharIndexInWord) : null;

          return (
            <article
              key={page.pageNumber}
              className={`bg-white transition-all ${
                isExpandedWidth
                  ? 'w-full rounded-none border-x-0 border-y border-slate-200 p-0 shadow-xs'
                  : 'rounded-xl border border-slate-200 p-4 sm:p-10 shadow-sm'
              }`}
            >
              {/* Page Header Indicator (Plain white like Text Reader) */}
              <div className={`flex items-center justify-between text-[11px] font-medium text-slate-400 select-none border-b border-slate-100 ${
                isExpandedWidth ? 'px-4 sm:px-6 py-2.5 mb-2' : 'pb-4 mb-6'
              }`}>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${isActivePage && isPlaying ? 'bg-sky-500 animate-ping' : 'bg-emerald-500'} inline-block`} />
                  <span className="font-semibold text-slate-500 uppercase tracking-wider">
                    Halaman {page.pageNumber}
                  </span>
                  {isActivePage && isPlaying && (
                    <span className="text-[10px] text-sky-600 bg-sky-50 px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider border border-sky-200">
                      TTS Aktif
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span>{page.totalWords} kata</span>
                  <span className="text-slate-300 hidden sm:inline">|</span>
                  <span className="text-[10px] text-slate-400 hidden sm:inline">Klik kata mana saja untuk membaca</span>
                </div>
              </div>

              {/* Plain White PDF Page Surface (No gray wrapper or inner border) */}
              <div className="w-full bg-white overflow-x-auto">
                {page.originalCanvasUrl || pdfDoc ? (
                  <div
                    className="relative w-full select-none bg-white mx-auto"
                    style={fontSizePercent !== 100 ? { width: `${fontSizePercent}%` } : undefined}
                  >
                    <HighResPdfPageCanvas
                      pdfDoc={pdfDoc}
                      pageNumber={page.pageNumber}
                      fallbackUrl={page.originalCanvasUrl}
                      isExpandedWidth={isExpandedWidth}
                      fontSizePercent={fontSizePercent}
                    />

                    {/* Word Hitboxes Layer for clicking directly on original PDF */}
                    {onWordClick && (
                      <div className="absolute inset-0 z-10 cursor-pointer">
                        {pageWords.map((w) => {
                          if (!w.bbox) return null;
                          return (
                            <div
                              key={w.id}
                              onClick={() => onWordClick(w.id)}
                              title={`Baca kata: "${w.text}"`}
                              className="absolute hover:bg-sky-400/20 hover:ring-1 hover:ring-sky-400/60 transition-colors rounded-xs"
                              style={{
                                left: `${Math.max(0, w.bbox.left - 0.1)}%`,
                                top: `${Math.max(0, w.bbox.top - 0.1)}%`,
                                width: `${w.bbox.width + 0.2}%`,
                                height: `${w.bbox.height + 0.2}%`,
                              }}
                            />
                          );
                        })}
                      </div>
                    )}

                    {/* 1. Full Word Background Highlight (Visible in 'word' and 'both' modes) */}
                    {isActivePage && activeWord?.bbox && (highlightMode === 'word' || highlightMode === 'both') && (
                      <div
                        ref={highlightMode === 'word' ? activeHighlightRef : null}
                        className={`absolute z-20 pointer-events-none rounded-[3px] transition-all duration-75 ease-out ${
                          isPlaying && highlightMode === 'word' ? 'animate-pulse' : ''
                        }`}
                        style={{
                          left: `${Math.max(0, activeWord.bbox.left - 0.12)}%`,
                          top: `${Math.max(0, activeWord.bbox.top - 0.15)}%`,
                          width: `${activeWord.bbox.width + 0.24}%`,
                          height: `${activeWord.bbox.height + 0.3}%`,
                          backgroundColor: highlightMode === 'both' ? activeColorConfig.bothWordBg : activeColorConfig.bg,
                          border: highlightMode === 'both' ? '1px dashed rgba(14, 165, 233, 0.5)' : activeColorConfig.border,
                          boxShadow: highlightMode === 'both' ? '0 0 0 1px rgba(186, 230, 253, 0.6)' : activeColorConfig.shadow,
                          mixBlendMode: 'multiply',
                        }}
                      />
                    )}

                    {/* 2. Active Letter Precision Highlight (Visible in 'letter' and 'both' modes) */}
                    {isActivePage && letterBounds && (highlightMode === 'letter' || highlightMode === 'both') && (
                      <div
                        ref={activeHighlightRef}
                        className="absolute z-30 pointer-events-none rounded-[2px] transition-all duration-75 ease-out"
                        style={{
                          left: `${Math.max(0, letterBounds.left - 0.05)}%`,
                          top: `${Math.max(0, letterBounds.top - 0.18)}%`,
                          width: `${letterBounds.width + 0.1}%`,
                          height: `${letterBounds.height + 0.36}%`,
                          backgroundColor: activeColorConfig.letterBg,
                          border: activeColorConfig.letterBorder,
                          boxShadow: activeColorConfig.letterShadow,
                          mixBlendMode: 'multiply',
                        }}
                      />
                    )}
                  </div>
                ) : (
                  <div className="py-16 text-center text-slate-400 text-sm bg-white">
                    Pratinjau visual halaman PDF tidak tersedia. Silakan gunakan Mode Baca.
                  </div>
                )}
              </div>

              {/* Page Footer (Plain white like Text Reader) */}
              <div className={`border-t border-slate-100 text-center text-[10px] text-slate-400 select-none font-mono ${
                isExpandedWidth ? 'py-3 mt-2' : 'pt-6 mt-6'
              }`}>
                — {page.pageNumber} —
              </div>
            </article>
          );
        })}
      </div>

      {/* Floating Audio & Highlight HUD Bar for PDF Reading */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[94%] max-w-2xl bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl shadow-xl px-4 py-2.5 flex items-center justify-between gap-3 text-slate-800 transition-all">
        {/* Left: Play/Pause and Current Spoken Word / Letters */}
        <div className="flex items-center gap-3 min-w-0">
          {onTogglePlay && (
            <button
              onClick={onTogglePlay}
              className={`p-2.5 rounded-xl font-bold flex items-center justify-center transition-all cursor-pointer shadow-xs shrink-0 ${
                isPlaying
                  ? 'bg-amber-600 text-white hover:bg-amber-700'
                  : 'bg-slate-900 text-white hover:bg-slate-800'
              }`}
              title={isPlaying ? 'Jeda Suara' : 'Lanjutkan Membaca PDF'}
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
            </button>
          )}

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              {isPlaying ? (
                <span className="flex items-center gap-1 text-[11px] font-bold text-sky-600 uppercase tracking-wider">
                  <Volume2 className="w-3.5 h-3.5 animate-pulse" />
                  <span>Membaca PDF:</span>
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <span>Kata Terpilih:</span>
                </span>
              )}

              {/* Active Word with Letter-by-Letter Highlight in HUD */}
              {activeWord ? (
                <div className="flex items-center gap-0.5 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 font-mono text-xs">
                  {(() => {
                    let letterCounter = 0;
                    return activeWord.text.split('').map((char, cIdx) => {
                      const isWordChar = /[a-zA-Z0-9\u00C0-\u024F]/.test(char);
                      const isCurrentChar = isWordChar && letterCounter === activeCharIndexInWord && (highlightMode === 'letter' || highlightMode === 'both');
                      if (isWordChar) letterCounter++;

                      return (
                        <span
                          key={cIdx}
                          className={`transition-all duration-75 px-0.5 rounded-xs ${
                            isCurrentChar
                              ? 'bg-sky-600 text-white font-black scale-110 shadow-xs'
                              : 'text-slate-800 font-semibold'
                          }`}
                        >
                          {char}
                        </span>
                      );
                    });
                  })()}
                </div>
              ) : (
                <span className="text-xs text-slate-400">—</span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 truncate max-w-[280px] sm:max-w-sm mt-0.5" title={getContextSnippet()}>
              {getContextSnippet() || 'Klik kata pada PDF untuk mulai mendengarkan'}
            </p>
          </div>
        </div>

        {/* Right: Color Highlighter Selector & WPM */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Highlighter Color Picker */}
          {onHighlightColorChange && (
            <div className="hidden xs:flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200" title="Pilih warna sorotan PDF">
              {(Object.keys(COLOR_CONFIGS) as HighlightColor[]).map((cKey) => {
                const cfg = COLOR_CONFIGS[cKey];
                const isSelected = highlightColor === cKey;
                return (
                  <button
                    key={cKey}
                    onClick={() => onHighlightColorChange(cKey)}
                    className={`w-5 h-5 rounded-full transition-transform cursor-pointer flex items-center justify-center ${cfg.dotClass} ${
                      isSelected ? 'ring-2 ring-slate-900 ring-offset-1 scale-110' : 'opacity-60 hover:opacity-100'
                    }`}
                    title={cfg.name}
                  />
                );
              })}
            </div>
          )}

          {/* Speed Badge */}
          <span className="text-[11px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-1 rounded-lg border border-slate-200">
            {wpm} WPM
          </span>
        </div>
      </div>
    </div>
  );
};
