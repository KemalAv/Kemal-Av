import React, { useEffect, useRef } from 'react';
import { DocPage, DocParagraph, HighlightColor, HighlightMode, WordItem } from '../types';

interface ContinuousDocumentViewerProps {
  pages: DocPage[];
  currentWordIndex: number;
  activeCharIndexInWord: number;
  highlightMode: HighlightMode;
  highlightColor?: HighlightColor;
  fontSizePercent: number;
  isExpandedWidth: boolean;
  showVisuals: boolean;
  onWordClick: (wordIndex: number) => void;
  isPlaying: boolean;
}

const COLOR_MAP: Record<HighlightColor, { wordBg: string; bothWordBg: string; activeCharBg: string; activeRing: string; passedCharBg: string }> = {
  sky: {
    wordBg: 'bg-sky-200 text-sky-950 font-semibold ring-2 ring-sky-400 ring-offset-1',
    bothWordBg: 'bg-sky-100 text-sky-950 font-medium ring-1 ring-sky-300',
    activeCharBg: 'bg-sky-600 text-white font-black ring-2 ring-sky-500 shadow-md',
    activeRing: 'ring-sky-500',
    passedCharBg: 'bg-sky-200 text-sky-950 font-bold',
  },
  amber: {
    wordBg: 'bg-amber-200 text-amber-950 font-semibold ring-2 ring-amber-400 ring-offset-1',
    bothWordBg: 'bg-amber-100 text-amber-950 font-medium ring-1 ring-amber-300',
    activeCharBg: 'bg-amber-500 text-slate-950 font-black ring-2 ring-amber-600 shadow-md',
    activeRing: 'ring-amber-600',
    passedCharBg: 'bg-amber-200 text-amber-950 font-bold',
  },
  emerald: {
    wordBg: 'bg-emerald-200 text-emerald-950 font-semibold ring-2 ring-emerald-400 ring-offset-1',
    bothWordBg: 'bg-emerald-100 text-emerald-950 font-medium ring-1 ring-emerald-300',
    activeCharBg: 'bg-emerald-600 text-white font-black ring-2 ring-emerald-500 shadow-md',
    activeRing: 'ring-emerald-500',
    passedCharBg: 'bg-emerald-200 text-emerald-950 font-bold',
  },
  purple: {
    wordBg: 'bg-purple-200 text-purple-950 font-semibold ring-2 ring-purple-400 ring-offset-1',
    bothWordBg: 'bg-purple-100 text-purple-950 font-medium ring-1 ring-purple-300',
    activeCharBg: 'bg-purple-600 text-white font-black ring-2 ring-purple-500 shadow-md',
    activeRing: 'ring-purple-500',
    passedCharBg: 'bg-purple-200 text-purple-950 font-bold',
  },
};

export const ContinuousDocumentViewer: React.FC<ContinuousDocumentViewerProps> = ({
  pages,
  currentWordIndex,
  activeCharIndexInWord,
  highlightMode,
  highlightColor = 'sky',
  fontSizePercent,
  isExpandedWidth,
  showVisuals,
  onWordClick,
  isPlaying,
}) => {
  const activeWordRef = useRef<HTMLSpanElement | null>(null);
  const colorTheme = COLOR_MAP[highlightColor] || COLOR_MAP.sky;

  // Auto-scroll to keep active word comfortably in view
  useEffect(() => {
    if (!activeWordRef.current) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const rect = activeWordRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const isAbove = rect.top < 140;
    const isBelow = rect.bottom > viewportHeight - 120;

    if (isAbove || isBelow) {
      activeWordRef.current.scrollIntoView({
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
        block: 'center',
        inline: 'nearest',
      });
    }
  }, [currentWordIndex]);

  // Render letters of a word for Letter / Both highlight mode
  const renderWordLetters = (word: WordItem, isActive: boolean) => {
    const text = word.text;

    if (!isActive || highlightMode === 'word') {
      return text;
    }

    // Letter or Both mode
    let alphaCounter = 0;

    return (
      <>
        {text.split('').map((char, charIdx) => {
          const isAlpha = /[a-zA-Z0-9\u00C0-\u024F]/.test(char);
          const isCurrentChar = isAlpha && alphaCounter === activeCharIndexInWord;
          const isPassedChar = isAlpha && alphaCounter < activeCharIndexInWord;
          if (isAlpha) alphaCounter++;

          return (
            <span
              key={charIdx}
              className={`transition-all duration-75 inline-block ${
                isCurrentChar
                  ? `${colorTheme.activeCharBg} px-1 rounded-xs scale-110 z-10 relative`
                  : isPassedChar && highlightMode === 'both'
                  ? `${colorTheme.passedCharBg} rounded-2xs`
                  : ''
              }`}
            >
              {char}
            </span>
          );
        })}
      </>
    );
  };

  // Render a single Word
  const renderWord = (word: WordItem) => {
    const isActive = word.id === currentWordIndex;

    let wordHighlightClasses = '';
    if (isActive) {
      if (highlightMode === 'word') {
        wordHighlightClasses = `${colorTheme.wordBg} px-1 py-0.5 rounded-sm transition-all duration-75`;
      } else if (highlightMode === 'both') {
        wordHighlightClasses = `${colorTheme.bothWordBg} px-1 py-0.5 rounded-sm transition-all duration-75`;
      } else {
        // 'letter' mode: clean padding without heavy background so individual letter pops!
        wordHighlightClasses = 'font-semibold text-slate-950 px-0.5';
      }
    } else {
      wordHighlightClasses =
        'hover:bg-slate-100 hover:text-slate-900 rounded-xs cursor-pointer transition-colors duration-75';
    }

    return (
      <span
        key={word.id}
        ref={isActive ? activeWordRef : null}
        onClick={() => onWordClick(word.id)}
        className={`inline-block mr-1.5 transition-colors cursor-pointer select-text ${wordHighlightClasses}`}
        title={`Klik untuk membaca dari kata ini (#${word.id + 1})`}
      >
        {renderWordLetters(word, isActive)}
      </span>
    );
  };

  // Render Paragraph based on type
  const renderParagraph = (paragraph: DocParagraph) => {
    if (paragraph.isVisual && !showVisuals) {
      return null;
    }

    switch (paragraph.type) {
      case 'image':
        return (
          <div key={paragraph.id} className="my-6 text-center">
            {paragraph.src && (
              <img
                src={paragraph.src}
                alt={paragraph.alt || 'Gambar Dokumen'}
                className="max-h-96 mx-auto rounded-lg border border-slate-200 object-contain shadow-xs bg-slate-50"
              />
            )}
            {paragraph.alt && (
              <p className="text-xs text-slate-500 mt-2 italic">{paragraph.alt}</p>
            )}
          </div>
        );

      case 'table':
        if (!paragraph.tableData || paragraph.tableData.length === 0) return null;
        return (
          <div key={paragraph.id} className="my-6 overflow-x-auto">
            <table className="w-full text-left border-collapse border border-slate-200 text-sm">
              <tbody>
                {paragraph.tableData.map((row, rIdx) => (
                  <tr key={rIdx} className={rIdx === 0 ? 'bg-slate-100 font-semibold' : 'hover:bg-slate-50'}>
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="border border-slate-200 p-2.5">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'divider':
        return <hr key={paragraph.id} className="my-8 border-slate-200" />;

      case 'h1':
        return (
          <h1 key={paragraph.id} className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-8 mb-4">
            {paragraph.words.map(renderWord)}
          </h1>
        );

      case 'h2':
        return (
          <h2 key={paragraph.id} className="text-xl sm:text-2xl font-bold tracking-tight text-slate-800 mt-6 mb-3">
            {paragraph.words.map(renderWord)}
          </h2>
        );

      case 'h3':
        return (
          <h3 key={paragraph.id} className="text-lg sm:text-xl font-semibold text-slate-800 mt-5 mb-2">
            {paragraph.words.map(renderWord)}
          </h3>
        );

      case 'blockquote':
        return (
          <blockquote
            key={paragraph.id}
            className="my-5 border-l-4 border-slate-300 pl-4 py-1 italic text-slate-700 bg-slate-50/50 rounded-r-md"
          >
            {paragraph.words.map(renderWord)}
          </blockquote>
        );

      case 'p':
      default:
        return (
          <p key={paragraph.id} className="leading-relaxed mb-4 text-slate-800">
            {paragraph.words.map(renderWord)}
          </p>
        );
    }
  };

  const containerMaxWidthClass = isExpandedWidth ? 'max-w-5xl' : 'max-w-3xl';

  return (
    <div className={`w-full ${containerMaxWidthClass} mx-auto transition-all duration-200 py-8 px-4 sm:px-6`}>
      <div className="space-y-10">
        {pages.map((page) => (
          <article
            key={page.pageNumber}
            className="bg-white rounded-xl border border-slate-200 p-6 sm:p-10 shadow-sm transition-all"
            style={{ fontSize: `${fontSizePercent}%` }}
          >
            {/* Page Header Indicator */}
            <div className="flex items-center justify-between text-[11px] font-medium text-slate-400 select-none pb-4 mb-6 border-b border-slate-100">
              <span className="font-semibold text-slate-500 uppercase tracking-wider">
                Halaman {page.pageNumber}
              </span>
              <span>{page.totalWords} kata</span>
            </div>

            {/* Paragraphs in Page */}
            <div className="text-slate-800 font-serif leading-loose">
              {page.paragraphs.map(renderParagraph)}
            </div>

            {/* Page Footer */}
            <div className="pt-6 mt-6 border-t border-slate-100 text-center text-[10px] text-slate-400 select-none font-mono">
              — {page.pageNumber} —
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};
