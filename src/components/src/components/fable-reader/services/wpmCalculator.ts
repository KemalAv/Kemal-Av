import { DocPage, WordItem } from '../types';

/**
 * Standard WPM Calculation:
 * - 1 standard word = 5 alphanumeric characters.
 * - Spaces and punctuations are excluded.
 * - Duration per character = 60,000 ms / (WPM * 5).
 * - Example: 20 WPM = 100 characters per minute = 600 ms per character.
 */

export function countAlphanumericChars(text: string): number {
  const alphanumeric = text.replace(/[^a-zA-Z0-9]/g, '');
  return alphanumeric.length;
}

export function getDurationPerChar(wpm: number): number {
  const safeWpm = Math.max(10, Math.min(500, wpm));
  return 60000 / (safeWpm * 5);
}

export function getWordDuration(word: WordItem, wpm: number): number {
  const durationPerChar = getDurationPerChar(wpm);
  const chars = word.charCount > 0 ? word.charCount : 1;
  return Math.max(30, chars * durationPerChar);
}

export function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds <= 0) return '00:00';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const pad = (n: number) => n.toString().padStart(2, '0');

  if (hrs > 0) {
    return `${hrs}:${pad(mins)}:${pad(secs)}`;
  }
  return `${pad(mins)}:${pad(secs)}`;
}

export function calculatePageRemainingTime(
  page: DocPage | undefined,
  currentGlobalIndex: number,
  allWords: WordItem[],
  wpm: number
): string {
  if (!page || page.paragraphs.length === 0) return '00:00';
  const durationPerChar = getDurationPerChar(wpm);

  let remainingChars = 0;
  for (let i = page.wordStartIndex; i <= page.wordEndIndex; i++) {
    if (i >= currentGlobalIndex && allWords[i]) {
      remainingChars += allWords[i].charCount > 0 ? allWords[i].charCount : 1;
    }
  }

  // If already read past this page, total page time or 00:00
  if (currentGlobalIndex > page.wordEndIndex) {
    return '00:00';
  }

  const totalMs = remainingChars * durationPerChar;
  return formatTime(totalMs / 1000);
}

export function calculateTotalRemainingTime(
  allWords: WordItem[],
  currentIndex: number,
  wpm: number
): string {
  if (!allWords || allWords.length === 0 || currentIndex >= allWords.length) {
    return '00:00';
  }

  const durationPerChar = getDurationPerChar(wpm);
  let remainingChars = 0;

  for (let i = currentIndex; i < allWords.length; i++) {
    remainingChars += allWords[i].charCount > 0 ? allWords[i].charCount : 1;
  }

  const totalMs = remainingChars * durationPerChar;
  return formatTime(totalMs / 1000);
}
