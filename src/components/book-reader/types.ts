export type DocType = 'DOCX' | 'PDF' | 'TEKS';

export type HighlightMode = 'word' | 'letter' | 'both';

export type HighlightColor = 'sky' | 'amber' | 'emerald' | 'purple';

export type VoiceGender = 'female' | 'male';

export type LanguageCode = 'id' | 'en';

export type PdfDisplayMode = 'reader' | 'original';

export interface WordItem {
  id: number;              // Sequential global index (0, 1, 2, ...)
  text: string;            // Original text with punctuation (e.g. "Halo,")
  cleanWord: string;       // Cleaned word without outer punctuation
  charCount: number;       // Number of alphanumeric chars (standard 5-letter calculation)
  pageIndex: number;       // 0-indexed page
  paragraphIndex: number;  // 0-indexed paragraph within page
  bbox?: {
    left: number;   // Percentage of page width (0 - 100)
    top: number;    // Percentage of page height (0 - 100)
    width: number;  // Percentage of page width (0 - 100)
    height: number; // Percentage of page height (0 - 100)
  };
}

export type ParagraphType = 'p' | 'h1' | 'h2' | 'h3' | 'blockquote' | 'table' | 'image' | 'divider';

export interface DocParagraph {
  id: number;
  pageIndex: number;
  type: ParagraphType;
  words: WordItem[];
  rawHtml?: string;
  src?: string;           // For image
  alt?: string;
  tableData?: string[][]; // For table
  isVisual?: boolean;     // If true, hidden when visual objects are toggled off
}

export interface DocPage {
  pageNumber: number;      // 1-indexed
  paragraphs: DocParagraph[];
  wordStartIndex: number;
  wordEndIndex: number;
  totalWords: number;
  totalChars: number;
  originalCanvasUrl?: string; // High-res image data of original PDF page if applicable
}

export interface DocumentState {
  title: string;
  type: DocType;
  pages: DocPage[];
  allWords: WordItem[];
  totalWords: number;
  totalChars: number;
  originalPdfDoc?: any;
}
