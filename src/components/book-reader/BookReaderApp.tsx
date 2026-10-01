import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from './components/Header';
import { DocumentInfoBar } from './components/DocumentInfoBar';
import { ReadingControlPanel } from './components/ReadingControlPanel';
import { TtsPanel } from './components/TtsPanel';
import { ContinuousDocumentViewer } from './components/ContinuousDocumentViewer';
import { OriginalPdfViewer } from './components/OriginalPdfViewer';
import { PasteTextModal } from './components/PasteTextModal';
import { SkeletonLoader } from './components/SkeletonLoader';
import { DocumentState, HighlightColor, HighlightMode, LanguageCode, PdfDisplayMode, VoiceGender, WordItem } from './types';
import {
  getSampleDocument,
  parseDocxFile,
  parsePdfFile,
  parsePastedText,
} from './services/documentParser';
import {
  calculatePageRemainingTime,
  calculateTotalRemainingTime,
} from './services/wpmCalculator';
import { ttsService } from './services/ttsService';
import { AlertTriangle, UploadCloud } from 'lucide-react';

interface BookReaderAppProps {
  onBackToHome?: () => void;
}

export const BookReaderApp: React.FC<BookReaderAppProps> = ({ onBackToHome }) => {
  // Document State
  const [docState, setDocState] = useState<DocumentState>(() => getSampleDocument());
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState('Memproses dokumen...');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Reader State
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [activeCharIndexInWord, setActiveCharIndexInWord] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [wpm, setWpm] = useState(180);
  const [highlightMode, setHighlightMode] = useState<HighlightMode>('both');
  const [highlightColor, setHighlightColor] = useState<HighlightColor>('sky');
  const [fontSizePercent, setFontSizePercent] = useState(100);
  const [isExpandedWidth, setIsExpandedWidth] = useState(false);
  const [showVisuals, setShowVisuals] = useState(true);
  const [pdfDisplayMode, setPdfDisplayMode] = useState<PdfDisplayMode>('reader');

  // TTS State
  const [isTtsPanelOpen, setIsTtsPanelOpen] = useState(false);
  const [language, setLanguage] = useState<LanguageCode>('id');
  const [gender, setGender] = useState<VoiceGender>('female');
  const [isMuted, setIsMuted] = useState(false);

  // Modals & Drag State
  const [isPasteModalOpen, setIsPasteModalOpen] = useState(false);
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  // Synchronization & Audio Refs
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;

  const currentWordIndexRef = useRef(currentWordIndex);
  currentWordIndexRef.current = currentWordIndex;

  const docStateRef = useRef(docState);
  docStateRef.current = docState;

  const wpmRef = useRef(wpm);
  wpmRef.current = wpm;

  const isMutedRef = useRef(isMuted);
  isMutedRef.current = isMuted;

  const currentChunkEndIndexRef = useRef<number>(0);

  // Active page calculation
  const currentWord = docState.allWords[currentWordIndex];
  const activePageNumber = currentWord ? currentWord.pageIndex + 1 : 1;
  const activePage = docState.pages[activePageNumber - 1];

  // Helper to count valid letters in word
  const getWordLetterCount = (word?: WordItem): number => {
    if (!word) return 1;
    const letters = word.text.split('').filter(c => /[a-zA-Z0-9\u00C0-\u024F]/.test(c));
    return Math.max(1, letters.length);
  };

  // Primary TTS Voice Driver: chunks words and plays natural sentences
  const speakFromWordIndex = useCallback((startIndex: number) => {
    if (isMutedRef.current) {
      ttsService.stop();
      return;
    }

    const words = docStateRef.current.allWords;
    if (!words || words.length === 0 || startIndex >= words.length) {
      ttsService.stop();
      setIsPlaying(false);
      isPlayingRef.current = false;
      return;
    }

    // Find sentence boundary or chunk of ~15 to 30 words
    let chunkEnd = Math.min(words.length, startIndex + 25);
    for (let i = startIndex + 8; i < Math.min(words.length, startIndex + 35); i++) {
      const w = words[i];
      if (/[.?!;:]$/.test(w.text) || (words[i + 1] && words[i + 1].pageIndex !== w.pageIndex)) {
        chunkEnd = i + 1;
        break;
      }
    }

    const chunkWords = words.slice(startIndex, chunkEnd);
    if (chunkWords.length === 0) return;

    let fullText = '';
    const wordMap: { wordIndex: number; charStart: number; charEnd: number }[] = [];

    for (let i = 0; i < chunkWords.length; i++) {
      const w = chunkWords[i];
      if (i > 0) fullText += ' ';
      const start = fullText.length;
      fullText += w.text;
      const end = fullText.length;
      wordMap.push({
        wordIndex: w.id,
        charStart: start,
        charEnd: end,
      });
    }

    currentChunkEndIndexRef.current = chunkEnd;

    ttsService.speak(fullText, {
      language,
      gender,
      wpm: wpmRef.current,
      isMuted: isMutedRef.current,
      onBoundary: (charIndex: number) => {
        // Find matching word token in the active chunk
        const match = wordMap.find(m => charIndex >= m.charStart && charIndex < m.charEnd)
          || wordMap.find(m => charIndex <= m.charStart);
        if (match && match.wordIndex !== currentWordIndexRef.current) {
          // Align word index smoothly if speech is leading or lagging slightly
          setCurrentWordIndex(match.wordIndex);
          setActiveCharIndexInWord(0);
        }
      },
      onEnd: () => {
        if (isPlayingRef.current) {
          const nextStart = chunkEnd;
          if (nextStart < docStateRef.current.allWords.length) {
            // Speak next sentence/chunk starting from chunkEnd
            speakFromWordIndex(nextStart);
          } else {
            setIsPlaying(false);
            isPlayingRef.current = false;
            ttsService.stop();
          }
        }
      },
      onError: (err) => {
        console.warn('TTS playback error:', err);
      }
    });
  }, [language, gender]);

  // Jump to specific word index (clicking directly on PDF or reader text)
  const handleWordClick = useCallback((index: number) => {
    if (index < 0 || index >= docStateRef.current.allWords.length) return;
    setCurrentWordIndex(index);
    setActiveCharIndexInWord(0);

    if (isPlayingRef.current && !isMutedRef.current) {
      speakFromWordIndex(index);
    }
  }, [speakFromWordIndex]);

  // Step to next word naturally without restarting TTS audio
  const advanceToNextWord = useCallback(() => {
    const words = docStateRef.current.allWords;
    if (!words || words.length === 0) return;

    const currentIdx = currentWordIndexRef.current;
    if (currentIdx >= words.length - 1) {
      // Reached the very end of document
      setIsPlaying(false);
      isPlayingRef.current = false;
      ttsService.stop();
      return;
    }

    const nextIdx = currentIdx + 1;
    setCurrentWordIndex(nextIdx);
    setActiveCharIndexInWord(0);

    // If TTS is playing, check if we passed the end of the current chunk
    if (!isMutedRef.current && isPlayingRef.current) {
      if (nextIdx >= currentChunkEndIndexRef.current) {
        speakFromWordIndex(nextIdx);
      }
    }
  }, [speakFromWordIndex]);

  // Prev / Next Word buttons
  const handlePrevWord = useCallback(() => {
    const current = currentWordIndexRef.current;
    if (current > 0) {
      handleWordClick(current - 1);
    }
  }, [handleWordClick]);

  const handleNextWord = useCallback(() => {
    const current = currentWordIndexRef.current;
    if (current < docStateRef.current.allWords.length - 1) {
      handleWordClick(current + 1);
    }
  }, [handleWordClick]);

  // Dedicated, Unbreakable Rhythmic Pacing Loop
  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    const words = docState.allWords;
    if (!words || words.length === 0 || currentWordIndex >= words.length) {
      setIsPlaying(false);
      isPlayingRef.current = false;
      ttsService.stop();
      return;
    }

    const currentWord = words[currentWordIndex];
    const totalLetters = getWordLetterCount(currentWord);
    const durationPerChar = Math.max(25, Math.round(60000 / (wpm * 5)));

    // Mode: Word only
    if (highlightMode === 'word') {
      const wordDuration = Math.max(40, totalLetters * durationPerChar);
      timerRef.current = setTimeout(() => {
        if (isPlayingRef.current) {
          advanceToNextWord();
        }
      }, wordDuration);

      return () => {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
      };
    }

    // Mode: 'letter' or 'both' -> step letter-by-letter
    if (activeCharIndexInWord < totalLetters - 1) {
      // Step to next letter in this word
      timerRef.current = setTimeout(() => {
        if (isPlayingRef.current) {
          setActiveCharIndexInWord(prev => prev + 1);
        }
      }, durationPerChar);
    } else {
      // Reached last letter -> advance to next word
      timerRef.current = setTimeout(() => {
        if (isPlayingRef.current) {
          advanceToNextWord();
        }
      }, durationPerChar);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isPlaying, currentWordIndex, activeCharIndexInWord, highlightMode, wpm, docState.allWords, advanceToNextWord]);

  // Handle Play/Pause Toggle
  const handleTogglePlay = useCallback(() => {
    if (isPlaying) {
      // Pause
      setIsPlaying(false);
      isPlayingRef.current = false;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      ttsService.stop();
    } else {
      // Play
      setIsPlaying(true);
      isPlayingRef.current = true;

      if (!isMuted) {
        speakFromWordIndex(currentWordIndex);
      }
    }
  }, [isPlaying, isMuted, currentWordIndex, speakFromWordIndex]);

  // Toggle Mute
  const handleToggleMute = useCallback(() => {
    setIsMuted(prev => {
      const next = !prev;
      isMutedRef.current = next;
      if (next) {
        ttsService.stop();
      } else if (isPlayingRef.current) {
        speakFromWordIndex(currentWordIndexRef.current);
      }
      return next;
    });
  }, [speakFromWordIndex]);

  // Handle WPM speed change
  const handleWpmChange = useCallback((newWpm: number) => {
    setWpm(newWpm);
    wpmRef.current = newWpm;
    if (isPlayingRef.current && !isMutedRef.current) {
      // Update TTS rate with the current word
      speakFromWordIndex(currentWordIndexRef.current);
    }
  }, [speakFromWordIndex]);

  // Load Default Sample Text Document
  const handleLoadSampleText = () => {
    setIsPlaying(false);
    isPlayingRef.current = false;
    ttsService.stop();
    if (timerRef.current) clearTimeout(timerRef.current);

    const textDoc = getSampleDocument();
    setDocState(textDoc);
    setCurrentWordIndex(0);
    setActiveCharIndexInWord(0);
    setPdfDisplayMode('reader');
  };

  // Handle File Upload (.docx or .pdf)
  const handleOpenFile = async (file: File) => {
    setErrorMessage(null);
    setIsProcessing(true);
    setProcessingMessage(`Sedang mengonversi dan membaca layout ${file.name}...`);

    setIsPlaying(false);
    isPlayingRef.current = false;
    ttsService.stop();
    if (timerRef.current) clearTimeout(timerRef.current);

    try {
      const fileName = file.name.toLowerCase();
      let parsedDoc: DocumentState;

      if (fileName.endsWith('.docx')) {
        parsedDoc = await parseDocxFile(file);
        setPdfDisplayMode('reader');
      } else if (fileName.endsWith('.pdf')) {
        parsedDoc = await parsePdfFile(file);
        setPdfDisplayMode('original'); // Default to Original PDF view for PDFs!
      } else {
        throw new Error('Format file tidak didukung. Harap pilih dokumen Microsoft Word (.docx) atau PDF (.pdf).');
      }

      if (!parsedDoc.allWords || parsedDoc.allWords.length === 0) {
        throw new Error('Dokumen tidak berisi teks yang dapat dibaca.');
      }

      setDocState(parsedDoc);
      setCurrentWordIndex(0);
      setActiveCharIndexInWord(0);
    } catch (err: any) {
      console.error('Document parsing error:', err);
      setErrorMessage(err.message || 'Gagal memproses dokumen. Pastikan file valid.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Pasted Text Submission
  const handlePasteSubmit = (title: string, rawText: string) => {
    setErrorMessage(null);
    setIsProcessing(true);
    setProcessingMessage('Menguraikan teks tempelan...');

    setIsPlaying(false);
    isPlayingRef.current = false;
    ttsService.stop();
    if (timerRef.current) clearTimeout(timerRef.current);

    try {
      const parsedDoc = parsePastedText(rawText, title);
      if (parsedDoc.allWords.length === 0) {
        throw new Error('Teks yang ditempelkan kosong.');
      }
      setDocState(parsedDoc);
      setCurrentWordIndex(0);
      setActiveCharIndexInWord(0);
      setPdfDisplayMode('reader');
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal memproses teks yang ditempel.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Drag & Drop Handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleOpenFile(file);
    }
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        handleTogglePlay();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handlePrevWord();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleNextWord();
      } else if (e.key === '+' || e.key === '=') {
        setFontSizePercent(prev => Math.min(200, prev + 10));
      } else if (e.key === '-') {
        setFontSizePercent(prev => Math.max(70, prev - 10));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleTogglePlay, handlePrevWord, handleNextWord]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      ttsService.stop();
    };
  }, []);

  // Time calculations
  const pageRemainingTime = calculatePageRemainingTime(activePage, currentWordIndex, docState.allWords, wpm);
  const totalRemainingTime = calculateTotalRemainingTime(docState.allWords, currentWordIndex, wpm);
  const progressPercent = docState.totalWords > 0
    ? Math.round(((currentWordIndex + 1) / docState.totalWords) * 100)
    : 0;

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans flex flex-col selection:bg-sky-200 selection:text-slate-950 relative"
    >
      {/* Drag & Drop Overlay */}
      {isDraggingFile && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-6 border-4 border-dashed border-white">
          <div className="bg-white rounded-2xl p-8 text-center shadow-2xl max-w-md">
            <UploadCloud className="w-14 h-14 text-slate-800 mx-auto mb-4 animate-bounce" />
            <h3 className="text-xl font-bold text-slate-900 mb-1">Lepaskan Dokumen di Sini</h3>
            <p className="text-xs text-slate-500">Mendukung file Microsoft Word (.docx) dan PDF (.pdf)</p>
          </div>
        </div>
      )}

      {/* 1. Header with Sample Document Option */}
      <Header
        onOpenFile={handleOpenFile}
        onOpenPasteModal={() => setIsPasteModalOpen(true)}
        onLoadSampleText={handleLoadSampleText}
        onBackToHome={onBackToHome}
        isProcessing={isProcessing}
      />

      {/* 2. Document Info Bar */}
      <DocumentInfoBar
        title={docState.title}
        docType={docState.type}
        currentPageNumber={activePageNumber}
        totalPages={docState.pages.length}
        fontSizePercent={fontSizePercent}
        onIncreaseFontSize={() => setFontSizePercent(p => Math.min(200, p + 10))}
        onDecreaseFontSize={() => setFontSizePercent(p => Math.max(70, p - 10))}
        isExpandedWidth={isExpandedWidth}
        onToggleExpandWidth={() => setIsExpandedWidth(prev => !prev)}
        pdfDisplayMode={pdfDisplayMode}
        onTogglePdfMode={setPdfDisplayMode}
      />

      {/* 3. Reading Control Panel */}
      <ReadingControlPanel
        isPlaying={isPlaying}
        onTogglePlay={handleTogglePlay}
        onPrevWord={handlePrevWord}
        onNextWord={handleNextWord}
        wpm={wpm}
        onWpmChange={handleWpmChange}
        highlightMode={highlightMode}
        onHighlightModeChange={setHighlightMode}
        showVisuals={showVisuals}
        onToggleVisuals={() => setShowVisuals(prev => !prev)}
        pageRemainingTime={pageRemainingTime}
        totalRemainingTime={totalRemainingTime}
        progressPercent={progressPercent}
        currentWordIndex={currentWordIndex}
        totalWords={docState.totalWords}
        isTtsPanelOpen={isTtsPanelOpen}
        onToggleTtsPanel={() => setIsTtsPanelOpen(prev => !prev)}
        isMuted={isMuted}
      />

      {/* 4. Collapsible TTS Settings Panel */}
      {isTtsPanelOpen && (
        <TtsPanel
          language={language}
          onLanguageChange={setLanguage}
          gender={gender}
          onGenderChange={setGender}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />
      )}

      {/* Error Banner */}
      {errorMessage && (
        <div className="max-w-3xl mx-auto mt-4 px-4 sm:px-6 w-full">
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-start gap-3 shadow-xs">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1 text-sm">
              <p className="font-semibold">Terjadi Kesalahan</p>
              <p className="text-rose-700 text-xs mt-0.5">{errorMessage}</p>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-xs font-semibold text-rose-700 hover:text-rose-900 cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* 5. Main Document Workspace */}
      <main className="flex-1 pb-20">
        {isProcessing ? (
          <SkeletonLoader message={processingMessage} />
        ) : docState.type === 'PDF' && pdfDisplayMode === 'original' ? (
          <OriginalPdfViewer
            pages={docState.pages}
            isExpandedWidth={isExpandedWidth}
            currentWordIndex={currentWordIndex}
            activeCharIndexInWord={activeCharIndexInWord}
            highlightMode={highlightMode}
            allWords={docState.allWords}
            onWordClick={handleWordClick}
            isPlaying={isPlaying}
            onTogglePlay={handleTogglePlay}
            highlightColor={highlightColor}
            onHighlightColorChange={setHighlightColor}
            wpm={wpm}
            isMuted={isMuted}
          />
        ) : (
          <ContinuousDocumentViewer
            pages={docState.pages}
            currentWordIndex={currentWordIndex}
            activeCharIndexInWord={activeCharIndexInWord}
            highlightMode={highlightMode}
            highlightColor={highlightColor}
            fontSizePercent={fontSizePercent}
            isExpandedWidth={isExpandedWidth}
            showVisuals={showVisuals}
            onWordClick={handleWordClick}
            isPlaying={isPlaying}
          />
        )}
      </main>

      {/* 6. Paste Text Modal */}
      <PasteTextModal
        isOpen={isPasteModalOpen}
        onClose={() => setIsPasteModalOpen(false)}
        onSubmit={handlePasteSubmit}
      />
    </div>
  );
};
