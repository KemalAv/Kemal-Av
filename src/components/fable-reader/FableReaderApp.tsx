import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from './components/Header';
import { DocumentInfoBar } from './components/DocumentInfoBar';
import { ReadingControlPanel } from './components/ReadingControlPanel';
import { TtsPanel } from './components/TtsPanel';
import { ContinuousDocumentViewer } from './components/ContinuousDocumentViewer';
import { OriginalPdfViewer } from './components/OriginalPdfViewer';
import { PasteTextModal } from './components/PasteTextModal';
import { SkeletonLoader } from './components/SkeletonLoader';
import { DocumentState, HighlightMode, LanguageCode, PdfDisplayMode, VoiceGender, WordItem } from './types';
import {
  getSampleDocument,
  parseDocxFile,
  parsePdfFile,
  parsePastedText,
} from './services/documentParser';
import {
  getDurationPerChar,
  getWordDuration,
  calculatePageRemainingTime,
  calculateTotalRemainingTime,
} from './services/wpmCalculator';
import { ttsService } from './services/ttsService';
import { AlertTriangle, UploadCloud } from 'lucide-react';

interface FableReaderAppProps {
  onBackToHome?: () => void;
}

export const FableReaderApp: React.FC<FableReaderAppProps> = ({ onBackToHome }) => {
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

  // Refs for Animation Frame & Audio Sync
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;

  const currentWordIndexRef = useRef(currentWordIndex);
  currentWordIndexRef.current = currentWordIndex;

  const activeCharIndexInWordRef = useRef(activeCharIndexInWord);
  activeCharIndexInWordRef.current = activeCharIndexInWord;

  const docStateRef = useRef(docState);
  docStateRef.current = docState;

  const wpmRef = useRef(wpm);
  wpmRef.current = wpm;

  const highlightModeRef = useRef(highlightMode);
  highlightModeRef.current = highlightMode;

  const isMutedRef = useRef(isMuted);
  isMutedRef.current = isMuted;

  // Active page calculation
  const currentWord = docState.allWords[currentWordIndex];
  const activePageNumber = currentWord ? currentWord.pageIndex + 1 : 1;
  const activePage = docState.pages[activePageNumber - 1];

  // Helper to start TTS from a specific word index
  const speakFromWordIndex = useCallback((startIndex: number) => {
    if (isMutedRef.current) {
      ttsService.stop();
      return;
    }

    const words = docStateRef.current.allWords;
    if (!words || words.length === 0 || startIndex >= words.length) {
      ttsService.stop();
      return;
    }

    // Take next ~40 words to feed into SpeechSynthesis
    const textChunk = words
      .slice(startIndex, startIndex + 45)
      .map(w => w.text)
      .join(' ');

    ttsService.speak(textChunk, {
      language,
      gender,
      wpm: wpmRef.current,
      isMuted: isMutedRef.current,
      onEnd: () => {
        // If still playing and has more words, continue chunking
        if (isPlayingRef.current && currentWordIndexRef.current < docStateRef.current.allWords.length - 1) {
          speakFromWordIndex(currentWordIndexRef.current);
        }
      },
      onError: (e) => {
        console.warn('TTS Speech error:', e);
      }
    });
  }, [language, gender]);

  // Step advancement logic (WPM rhythmic engine)
  const advanceStep = useCallback(() => {
    const words = docStateRef.current.allWords;
    if (!words || words.length === 0) return;

    const currentIdx = currentWordIndexRef.current;
    if (currentIdx >= words.length - 1) {
      // Reached end of document
      setIsPlaying(false);
      ttsService.stop();
      return;
    }

    const word = words[currentIdx];
    const totalCharsInWord = word.charCount > 0 ? word.charCount : 1;
    const mode = highlightModeRef.current;

    if (mode === 'letter' || mode === 'both') {
      const nextCharIdx = activeCharIndexInWordRef.current + 1;
      if (nextCharIdx < totalCharsInWord) {
        setActiveCharIndexInWord(nextCharIdx);
        scheduleNextStep(getDurationPerChar(wpmRef.current));
      } else {
        // Move to next word
        const nextWordIdx = currentIdx + 1;
        setCurrentWordIndex(nextWordIdx);
        setActiveCharIndexInWord(0);
        scheduleNextStep(getDurationPerChar(wpmRef.current));
      }
    } else {
      // Word mode: advance full word duration
      const nextWordIdx = currentIdx + 1;
      setCurrentWordIndex(nextWordIdx);
      setActiveCharIndexInWord(0);
      const nextWord = words[nextWordIdx];
      const duration = nextWord ? getWordDuration(nextWord, wpmRef.current) : getDurationPerChar(wpmRef.current);
      scheduleNextStep(duration);
    }
  }, []);

  const scheduleNextStep = useCallback((delayMs: number) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    if (isPlayingRef.current) {
      timerRef.current = setTimeout(() => {
        advanceStep();
      }, Math.max(20, delayMs));
    }
  }, [advanceStep]);

  // Handle Play/Pause
  const handleTogglePlay = useCallback(() => {
    if (isPlaying) {
      // Pause
      setIsPlaying(false);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      ttsService.stop();
    } else {
      // Play
      setIsPlaying(true);
      isPlayingRef.current = true;
      const currentWord = docState.allWords[currentWordIndex];
      const duration = currentWord ? getWordDuration(currentWord, wpm) : 300;
      scheduleNextStep(duration);

      if (!isMuted) {
        speakFromWordIndex(currentWordIndex);
      }
    }
  }, [isPlaying, currentWordIndex, docState, wpm, isMuted, scheduleNextStep, speakFromWordIndex]);

  // Jump to specific word index (click on word)
  const handleWordClick = useCallback((index: number) => {
    if (index < 0 || index >= docState.allWords.length) return;
    setCurrentWordIndex(index);
    setActiveCharIndexInWord(0);

    if (isPlaying) {
      if (timerRef.current) clearTimeout(timerRef.current);
      const targetWord = docState.allWords[index];
      const duration = targetWord ? getWordDuration(targetWord, wpm) : 300;
      scheduleNextStep(duration);

      if (!isMuted) {
        speakFromWordIndex(index);
      }
    }
  }, [docState.allWords, isPlaying, wpm, isMuted, scheduleNextStep, speakFromWordIndex]);

  // Prev / Next Word buttons
  const handlePrevWord = useCallback(() => {
    if (currentWordIndex > 0) {
      handleWordClick(currentWordIndex - 1);
    }
  }, [currentWordIndex, handleWordClick]);

  const handleNextWord = useCallback(() => {
    if (currentWordIndex < docState.allWords.length - 1) {
      handleWordClick(currentWordIndex + 1);
    }
  }, [currentWordIndex, docState.allWords.length, handleWordClick]);

  // Toggle Mute
  const handleToggleMute = useCallback(() => {
    setIsMuted(prev => {
      const next = !prev;
      if (next) {
        ttsService.stop();
      } else if (isPlaying) {
        speakFromWordIndex(currentWordIndex);
      }
      return next;
    });
  }, [isPlaying, currentWordIndex, speakFromWordIndex]);

  // Handle File Upload (.docx or .pdf)
  const handleOpenFile = async (file: File) => {
    setErrorMessage(null);
    setIsProcessing(true);
    setProcessingMessage(`Sedang memproses dan mengonversi ${file.name}...`);

    // Stop playback while loading
    setIsPlaying(false);
    ttsService.stop();
    if (timerRef.current) clearTimeout(timerRef.current);

    try {
      const fileName = file.name.toLowerCase();
      let parsedDoc: DocumentState;

      if (fileName.endsWith('.docx')) {
        parsedDoc = await parseDocxFile(file);
      } else if (fileName.endsWith('.pdf')) {
        parsedDoc = await parsePdfFile(file);
      } else {
        throw new Error('Format file tidak didukung. Harap pilih dokumen Microsoft Word (.docx) atau PDF (.pdf).');
      }

      if (!parsedDoc.allWords || parsedDoc.allWords.length === 0) {
        throw new Error('Dokumen tidak berisi teks yang dapat dibaca.');
      }

      setDocState(parsedDoc);
      setCurrentWordIndex(0);
      setActiveCharIndexInWord(0);
      setPdfDisplayMode('reader');
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
      // Don't intercept when user is typing in inputs or textarea
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
      className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans flex flex-col selection:bg-amber-300 selection:text-slate-950 relative"
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

      {/* 1. Header */}
      <Header
        onOpenFile={handleOpenFile}
        onOpenPasteModal={() => setIsPasteModalOpen(true)}
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
        onWpmChange={setWpm}
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
        ) : (
          <ContinuousDocumentViewer
            pages={docState.pages}
            currentWordIndex={currentWordIndex}
            activeCharIndexInWord={activeCharIndexInWord}
            highlightMode={highlightMode}
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
