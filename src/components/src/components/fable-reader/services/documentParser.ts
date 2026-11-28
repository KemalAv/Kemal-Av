import * as mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';
import { DocPage, DocParagraph, DocumentState, ParagraphType, WordItem } from '../types';
import { countAlphanumericChars } from './wpmCalculator';

// Configure PDF.js worker
try {
  // Use official CDN worker matching installed version or fallback
  if (pdfjsLib && pdfjsLib.GlobalWorkerOptions) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '4.10.38'}/pdf.worker.min.mjs`;
  }
} catch (err) {
  console.warn('PDF.js worker initialization error:', err);
}

/**
 * Tokenizes a string of text into WordItem objects.
 */
function tokenizeText(
  rawText: string,
  startGlobalIndex: number,
  pageIndex: number,
  paragraphIndex: number
): { words: WordItem[]; nextIndex: number } {
  // Match non-whitespace word segments
  const tokens = rawText.match(/\S+/g) || [];
  let currentIndex = startGlobalIndex;
  const words: WordItem[] = [];

  for (const token of tokens) {
    const clean = token.replace(/^[^\w\d]+|[^\w\d]+$/g, '');
    const charCount = countAlphanumericChars(token);

    words.push({
      id: currentIndex,
      text: token,
      cleanWord: clean || token,
      charCount,
      pageIndex,
      paragraphIndex,
    });
    currentIndex++;
  }

  return { words, nextIndex: currentIndex };
}

/**
 * Builds standard DocPages from structured paragraphs, grouping paragraphs into logical pages (~300 words each or based on headings/pagebreaks).
 */
function buildPagesFromParagraphs(paragraphs: DocParagraph[]): { pages: DocPage[]; allWords: WordItem[] } {
  const pages: DocPage[] = [];
  const allWords: WordItem[] = [];

  const WORDS_PER_PAGE_TARGET = 300;
  let currentPageIndex = 0;
  let currentPageParagraphs: DocParagraph[] = [];
  let currentPageWordCount = 0;

  for (let pIdx = 0; pIdx < paragraphs.length; pIdx++) {
    const p = paragraphs[pIdx];
    const pWords = p.words || [];

    // If current page already has enough words and this is a heading or we exceed threshold, break page
    const shouldBreak =
      currentPageWordCount >= WORDS_PER_PAGE_TARGET &&
      (p.type === 'h1' || p.type === 'h2' || currentPageWordCount >= WORDS_PER_PAGE_TARGET * 1.5);

    if (shouldBreak && currentPageParagraphs.length > 0) {
      // Finalize current page
      const pageWords = currentPageParagraphs.flatMap(cp => cp.words);
      const startIdx = pageWords.length > 0 ? pageWords[0].id : allWords.length;
      const endIdx = pageWords.length > 0 ? pageWords[pageWords.length - 1].id : startIdx;
      const charCount = pageWords.reduce((acc, w) => acc + (w.charCount || 1), 0);

      pages.push({
        pageNumber: currentPageIndex + 1,
        paragraphs: currentPageParagraphs,
        wordStartIndex: startIdx,
        wordEndIndex: endIdx,
        totalWords: pageWords.length,
        totalChars: charCount,
      });

      currentPageIndex++;
      currentPageParagraphs = [];
      currentPageWordCount = 0;
    }

    // Assign corrected pageIndex & paragraphIndex to words
    const updatedWords = pWords.map((w, wIdx) => ({
      ...w,
      pageIndex: currentPageIndex,
      paragraphIndex: currentPageParagraphs.length,
    }));

    currentPageParagraphs.push({
      ...p,
      pageIndex: currentPageIndex,
      words: updatedWords,
    });

    currentPageWordCount += updatedWords.length;
    allWords.push(...updatedWords);
  }

  // Finalize last page
  if (currentPageParagraphs.length > 0) {
    const pageWords = currentPageParagraphs.flatMap(cp => cp.words);
    const startIdx = pageWords.length > 0 ? pageWords[0].id : 0;
    const endIdx = pageWords.length > 0 ? pageWords[pageWords.length - 1].id : 0;
    const charCount = pageWords.reduce((acc, w) => acc + (w.charCount || 1), 0);

    pages.push({
      pageNumber: currentPageIndex + 1,
      paragraphs: currentPageParagraphs,
      wordStartIndex: startIdx,
      wordEndIndex: endIdx,
      totalWords: pageWords.length,
      totalChars: charCount,
    });
  }

  if (pages.length === 0) {
    pages.push({
      pageNumber: 1,
      paragraphs: [],
      wordStartIndex: 0,
      wordEndIndex: 0,
      totalWords: 0,
      totalChars: 0,
    });
  }

  return { pages, allWords };
}

/**
 * Parses Mammoth HTML output into structured DocParagraphs
 */
function parseHtmlToParagraphs(htmlString: string): DocParagraph[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, 'text/html');
  const paragraphs: DocParagraph[] = [];
  let globalWordCounter = 0;
  let paragraphCounter = 0;

  const childNodes = Array.from(doc.body.childNodes);

  for (const node of childNodes) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim() || '';
      if (!text) continue;
      const { words, nextIndex } = tokenizeText(text, globalWordCounter, 0, paragraphCounter);
      globalWordCounter = nextIndex;
      paragraphs.push({
        id: paragraphCounter++,
        pageIndex: 0,
        type: 'p',
        words,
        rawHtml: text,
      });
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;
      const tagName = el.tagName.toLowerCase();

      if (tagName === 'img') {
        const img = el as HTMLImageElement;
        paragraphs.push({
          id: paragraphCounter++,
          pageIndex: 0,
          type: 'image',
          words: [],
          src: img.src,
          alt: img.alt || 'Gambar Dokumen',
          isVisual: true,
        });
      } else if (tagName === 'table') {
        const rows = Array.from(el.querySelectorAll('tr'));
        const tableData: string[][] = [];
        const tableWords: WordItem[] = [];

        rows.forEach(row => {
          const cells = Array.from(row.querySelectorAll('th, td')).map(c => c.textContent?.trim() || '');
          tableData.push(cells);

          cells.forEach(cellText => {
            if (cellText) {
              const { words, nextIndex } = tokenizeText(cellText, globalWordCounter, 0, paragraphCounter);
              globalWordCounter = nextIndex;
              tableWords.push(...words);
            }
          });
        });

        paragraphs.push({
          id: paragraphCounter++,
          pageIndex: 0,
          type: 'table',
          words: tableWords,
          tableData,
          isVisual: true,
        });
      } else if (tagName === 'hr') {
        paragraphs.push({
          id: paragraphCounter++,
          pageIndex: 0,
          type: 'divider',
          words: [],
        });
      } else {
        // Heading or paragraph or blockquote
        let type: ParagraphType = 'p';
        if (tagName === 'h1') type = 'h1';
        else if (tagName === 'h2') type = 'h2';
        else if (tagName === 'h3' || tagName === 'h4' || tagName === 'h5' || tagName === 'h6') type = 'h3';
        else if (tagName === 'blockquote') type = 'blockquote';

        // Check if there are nested images inside
        const innerImages = Array.from(el.querySelectorAll('img'));
        if (innerImages.length > 0 && !el.textContent?.trim()) {
          innerImages.forEach(img => {
            paragraphs.push({
              id: paragraphCounter++,
              pageIndex: 0,
              type: 'image',
              words: [],
              src: img.src,
              alt: img.alt || 'Gambar Dokumen',
              isVisual: true,
            });
          });
          continue;
        }

        const text = el.textContent?.trim() || '';
        if (text) {
          const { words, nextIndex } = tokenizeText(text, globalWordCounter, 0, paragraphCounter);
          globalWordCounter = nextIndex;
          paragraphs.push({
            id: paragraphCounter++,
            pageIndex: 0,
            type,
            words,
            rawHtml: el.innerHTML,
          });
        }
      }
    }
  }

  return paragraphs;
}

/**
 * Parse Word .DOCX File
 */
export async function parseDocxFile(file: File): Promise<DocumentState> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.convertToHtml({ arrayBuffer });
  const html = result.value;

  const rawParagraphs = parseHtmlToParagraphs(html);
  const { pages, allWords } = buildPagesFromParagraphs(rawParagraphs);

  const totalWords = allWords.length;
  const totalChars = allWords.reduce((acc, w) => acc + (w.charCount || 1), 0);

  return {
    title: file.name.replace(/\.docx$/i, ''),
    type: 'DOCX',
    pages,
    allWords,
    totalWords,
    totalChars,
  };
}

/**
 * Parse PDF File using PDF.js
 */
export async function parsePdfFile(file: File): Promise<DocumentState> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdfDoc = await loadingTask.promise;

  const numPages = pdfDoc.numPages;
  const pages: DocPage[] = [];
  const allWords: WordItem[] = [];
  let globalWordCounter = 0;

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const page = await pdfDoc.getPage(pageNum);
    const textContent = await page.getTextContent();
    const pageParagraphs: DocParagraph[] = [];

    // Render original canvas thumbnail for "PDF Asli" view
    let originalCanvasUrl: string | undefined;
    try {
      const viewport = page.getViewport({ scale: 1.5 });
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await (page.render as any)({
          canvasContext: ctx,
          viewport,
          canvas,
        }).promise;
        originalCanvasUrl = canvas.toDataURL('image/jpeg', 0.85);
      }
    } catch (e) {
      console.warn(`Failed to render canvas for page ${pageNum}:`, e);
    }

    // Group text items by vertical lines (Y position)
    const items = textContent.items as any[];
    let currentLineText = '';
    let lastY: number | null = null;
    const lines: string[] = [];

    for (const item of items) {
      if (!('str' in item)) continue;
      const str = item.str;
      const transform = item.transform;
      const y = transform ? transform[5] : 0;

      if (lastY !== null && Math.abs(y - lastY) > 8) {
        if (currentLineText.trim()) {
          lines.push(currentLineText.trim());
        }
        currentLineText = str;
      } else {
        currentLineText += (currentLineText ? ' ' : '') + str;
      }
      lastY = y;
    }
    if (currentLineText.trim()) {
      lines.push(currentLineText.trim());
    }

    // Group lines into paragraphs
    let currentParagraphText = '';
    let pIdx = 0;
    const pageStartWordIdx = globalWordCounter;

    for (const line of lines) {
      const isHeader = line.length < 60 && /^[A-Z0-9\s:.-]{4,}$/.test(line);

      if (isHeader) {
        if (currentParagraphText.trim()) {
          const { words, nextIndex } = tokenizeText(currentParagraphText.trim(), globalWordCounter, pageNum - 1, pIdx++);
          globalWordCounter = nextIndex;
          pageParagraphs.push({
            id: pIdx,
            pageIndex: pageNum - 1,
            type: 'p',
            words,
          });
          currentParagraphText = '';
        }

        const { words, nextIndex } = tokenizeText(line, globalWordCounter, pageNum - 1, pIdx++);
        globalWordCounter = nextIndex;
        pageParagraphs.push({
          id: pIdx,
          pageIndex: pageNum - 1,
          type: 'h2',
          words,
        });
      } else {
        currentParagraphText += (currentParagraphText ? ' ' : '') + line;
        if (line.endsWith('.') || line.endsWith('?') || line.endsWith('!')) {
          const { words, nextIndex } = tokenizeText(currentParagraphText.trim(), globalWordCounter, pageNum - 1, pIdx++);
          globalWordCounter = nextIndex;
          pageParagraphs.push({
            id: pIdx,
            pageIndex: pageNum - 1,
            type: 'p',
            words,
          });
          currentParagraphText = '';
        }
      }
    }

    if (currentParagraphText.trim()) {
      const { words, nextIndex } = tokenizeText(currentParagraphText.trim(), globalWordCounter, pageNum - 1, pIdx++);
      globalWordCounter = nextIndex;
      pageParagraphs.push({
        id: pIdx,
        pageIndex: pageNum - 1,
        type: 'p',
        words,
      });
    }

    const pageWords = pageParagraphs.flatMap(p => p.words);
    const pageEndWordIdx = pageWords.length > 0 ? pageWords[pageWords.length - 1].id : pageStartWordIdx;
    const charCount = pageWords.reduce((acc, w) => acc + (w.charCount || 1), 0);

    pages.push({
      pageNumber: pageNum,
      paragraphs: pageParagraphs,
      wordStartIndex: pageStartWordIdx,
      wordEndIndex: pageEndWordIdx,
      totalWords: pageWords.length,
      totalChars: charCount,
      originalCanvasUrl,
    });

    allWords.push(...pageWords);
  }

  const totalWords = allWords.length;
  const totalChars = allWords.reduce((acc, w) => acc + (w.charCount || 1), 0);

  return {
    title: file.name.replace(/\.pdf$/i, ''),
    type: 'PDF',
    pages,
    allWords,
    totalWords,
    totalChars,
    originalPdfDoc: pdfDoc,
  };
}

/**
 * Parse Raw Pasted Text
 */
export function parsePastedText(rawText: string, customTitle?: string): DocumentState {
  const title = customTitle?.trim() || 'Teks Tempelan Baru';
  const rawParagraphsText = rawText
    .split(/\n{2,}|\r\n\r\n/)
    .map(p => p.trim())
    .filter(p => p.length > 0);

  const paragraphs: DocParagraph[] = [];
  let globalWordCounter = 0;

  rawParagraphsText.forEach((pText, idx) => {
    // Detect markdown-style headings
    let type: ParagraphType = 'p';
    let cleanText = pText;

    if (pText.startsWith('# ')) {
      type = 'h1';
      cleanText = pText.replace(/^#\s+/, '');
    } else if (pText.startsWith('## ')) {
      type = 'h2';
      cleanText = pText.replace(/^##\s+/, '');
    } else if (pText.startsWith('### ')) {
      type = 'h3';
      cleanText = pText.replace(/^###\s+/, '');
    } else if (pText.startsWith('> ')) {
      type = 'blockquote';
      cleanText = pText.replace(/^>\s+/, '');
    }

    const { words, nextIndex } = tokenizeText(cleanText, globalWordCounter, 0, idx);
    globalWordCounter = nextIndex;

    paragraphs.push({
      id: idx,
      pageIndex: 0,
      type,
      words,
      rawHtml: cleanText,
    });
  });

  const { pages, allWords } = buildPagesFromParagraphs(paragraphs);
  const totalWords = allWords.length;
  const totalChars = allWords.reduce((acc, w) => acc + (w.charCount || 1), 0);

  return {
    title,
    type: 'TEKS',
    pages,
    allWords,
    totalWords,
    totalChars,
  };
}

/**
 * Default Curated Sample Document
 */
export function getSampleDocument(): DocumentState {
  const sampleContent = `
# Fable Reader: Panduan Membaca Cepat & Retensi Kognitif

Selamat datang di Fable Reader, platform pembaca dokumen modern yang dirancang untuk memaksimalkan fokus, ritme membaca, dan kenyamanan visual Anda dalam sesi membaca panjang.

## Prinsip Dasar Kecepatan Membaca (WPM)

Membaca dengan kecepatan terkontrol (Words Per Minute) membantu mengurangi subvokalisasi yang tidak disengaja dan melatih fokus mata agar mengalir stabil di sepanjang teks.

> "Membaca bukan sekadar memindai kata-kata di atas kertas atau layar, melainkan menyelaraskan kecepatan persepsi visual dengan kecepatan pemahaman konsep dalam pikiran kita."

Dalam standar pembacaan profesional, satu kata standar dihitung setara dengan 5 karakter alfanumerik. Rumus durasi waktu per karakter dihitung secara matematis menggunakan presisi milidetik.

## Fitur Unggulan Fable Reader

Berikut adalah kemampuan utama yang telah diintegrasikan langsung ke dalam peramban Anda:

1. Penyesuaian WPM Dinamis (10 sampai 500 WPM) dengan estimasi waktu halaman dan dokumen yang akurat.
2. Sorotan Teks Tiga Mode: Mode Kata, Mode Huruf, dan Mode Keduanya untuk latihan ritme membaca presisi.
3. Dukungan File Word (.docx) dan PDF (.pdf) lokal yang diproses 100% aman di perangkat Anda tanpa diunggah ke server.
4. Text-to-Speech (TTS) multibahasa dengan kontrol suara pria dan wanita serta sinkronisasi tempo otomatis.
5. Area Scroll Berkelanjutan yang memudahkan navigasi tanpa terpotong batas halaman kaku.

## Mengapa Kontrol Ritme Membantu Pembaca?

Saat membaca secara konvensional, mata manusia sering mengalami regresi—yaitu kebiasaan melompat kembali ke kata-kata sebelumnya tanpa disadari. Dengan sorotan kata dan auto-scroll yang lembut, mata Anda dipandu untuk terus maju dengan ritme yang konsisten.

Cobalah menekan tombol Mulai Baca di panel kontrol atas, lalu sesuaikan slider WPM sesuai kenyamanan Anda. Anda juga dapat mengeklik sembarang kata di dokumen ini untuk langsung berpindah posisi membaca seketika!
  `.trim();

  return parsePastedText(sampleContent, 'Panduan Membaca Cepat & Retensi Kognitif (Contoh)');
}
