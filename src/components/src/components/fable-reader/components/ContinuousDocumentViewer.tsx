import React, { useEffect, useRef } from 'react';
import { DocPage, DocParagraph, HighlightMode, WordItem } from '../types';

interface ContinuousDocumentViewerProps {
  pages: DocPage[];
  currentWordIndex: number;
  activeCharIndexInWord: number;
  highlightMode: HighlightMode;
  fontSizePercent: number;
  isExpandedWidth: boolean;
  showVisuals: boolean;
  onWordClick: (wordIndex: number) => void;
  isPlaying: boolean;
}

export const ContinuousDocumentViewer: React.FC<ContinuousDocumentViewerProps> = ({
  pages,
  currentWordIndex,
  activeCharIndexInWord,
  highlightMode,
  fontSizePercent,
  isExpandedWidth,
  showVisuals,
  onWordClick,
  isPlaying,
}) => {
  const activeWordRef = useRef<HTMLSpanElement | null>(null);

  // Auto-scroll to keep active word comfortably in view
  useEffect(() => {
    if (!activeWordRef.current) return;

    // Check if user prefers reduced motion
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Check if element is out of optimal viewing box
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

    if (!isActive) {
      return text;
    }

    if (highlightMode === 'word') {
      return text;
    }

    // Letter or Both mode
    // Map alphanumeric characters to determine which char inside word is active
    let alphaCounter = 0;

    return (
      <>
        {text.split('').map((char, charIdx) => {
          const isAlpha = /[a-zA-Z0-9]/.test(char);
          const isCurrentChar = isAlpha && alphaCounter === activeCharIndexInWord;
          if (isAlpha) alphaCounter++;

          return (
            <span
              key={charIdx}
              className={
                isCurrentChar
                  ? 'bg-amber-400 text-slate-950 font-bold px-0.5 rounded-xs ring-1 ring-amber-500 shadow-xs'
                  : ''
              }
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
      if (highlightMode === 'word' || highlightMode === 'both') {
        wordHighlightClasses =
          'bg-amber-200 text-slate-950 font-semibold px-1 py-0.5 rounded-sm ring-2 ring-amber-400 ring-offset-1 transition-all duration-75';
      } else {
        wordHighlightClasses = 'font-semibold text-slate-950';
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
        return (
          <div key={paragraph.id} className="my-6 overflow-x-auto rounded-lg border border-slate-200 shadow-2xs">
            <table className="w-full text-left text-sm border-collapse">
              <tbody>
                {paragraph.tableData?.map((row, rIdx) => (
                  <tr
                    key={rIdx}
                    className={rIdx === 0 ? 'bg-slate-100 font-semibold border-b border-slate-200' : 'border-b border-slate-100 hover:bg-slate-50/50'}
                  >
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="p-3 border-r border-slate-100 last:border-r-0">
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
        return <hr key={paragraph.id} className="my-8 border-t border-slate-200" />;

      case 'h1':
        return (
          <h1 key={paragraph.id} className="font-bold text-slate-900 mt-8 mb-4 leading-tight text-2xl sm:text-3xl">
            {paragraph.words.map(renderWord)}
          </h1>
        );

      case 'h2':
        return (
          <h2 key={paragraph.id} className="font-bold text-slate-900 mt-6 mb-3 leading-snug text-xl sm:text-2xl border-b border-slate-100 pb-2">
            {paragraph.words.map(renderWord)}
          </h2>
        );

      case 'h3':
        return (
          <h3 key={paragraph.id} className="font-semibold text-slate-900 mt-5 mb-2 leading-snug text-lg sm:text-xl">
            {paragraph.words.map(renderWord)}
          </h3>
        );

      case 'blockquote':
        return (
          <blockquote
            key={paragraph.id}
            className="my-5 pl-4 border-l-4 border-slate-300 italic text-slate-700 bg-slate-50/60 py-2.5 rounded-r-md"
          >
            {paragraph.words.map(renderWord)}
          </blockquote>
        );

      case 'p':
      default:
        return (
          <p key={paragraph.id} className="mb-4 leading-relaxed text-slate-800 font-serif antialiased">
            {paragraph.words.map(renderWord)}
          </p>
        );
    }
  };

  const containerMaxWidthClass = isExpandedWidth ? 'max-w-5xl' : 'max-w-3xl';

  return (
    <div className={`w-full ${containerMaxWidthClass} mx-auto transition-all duration-200 py-8 px-4 sm:px-6`}>
      <div className="space-y-8">
        {pages.map((page, pageIdx) => {
          const isPageActive =
            currentWordIndex >= page.wordStartIndex && currentWordIndex <= page.wordEndIndex;

          return (
            <div
              key={page.pageNumber}
              className={`bg-white rounded-xl border transition-all duration-200 shadow-xs relative ${
                isPageActive
                  ? 'border-slate-300 ring-1 ring-slate-300/60 shadow-sm'
                  : 'border-slate-200'
              }`}
            >
              {/* Subtle Page Boundary Header */}
              <div className="px-6 py-2.5 border-b border-slate-100 flex items-center justify-between text-[11px] font-medium text-slate-500 select-none bg-slate-50/50 rounded-t-xl">
                <span>Halaman {page.pageNumber}</span>
                <span>{page.totalWords} kata</span>
              </div>

              {/* Page Content with dynamic font scaling */}
              <div
                className="p-6 sm:p-10 text-slate-800"
                style={{
                  fontSize: `${fontSizePercent}%`,
                  lineHeight: '1.8',
                }}
              >
                {page.paragraphs.length > 0 ? (
                  page.paragraphs.map(renderParagraph)
                ) : (
                  <p className="text-slate-400 italic text-sm">Halaman kosong atau tidak ada teks.</p>
                )}
              </div>

              {/* Page Footer Divider */}
              <div className="px-6 py-2 border-t border-slate-100 flex justify-center text-[10px] text-slate-500 font-mono select-none">
                — {page.pageNumber} —
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
