import { LanguageCode, VoiceGender } from '../types';

export interface VoiceOption {
  voice: SpeechSynthesisVoice;
  name: string;
  lang: string;
  gender: VoiceGender;
}

class TtsService {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private isInitialized = false;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  private loadVoices(): void {
    if (!this.synth) return;
    this.voices = this.synth.getVoices();
    this.isInitialized = true;
  }

  public getAvailableVoices(): SpeechSynthesisVoice[] {
    if (!this.synth) return [];
    if (this.voices.length === 0) {
      this.voices = this.synth.getVoices();
    }
    return this.voices;
  }

  /**
   * Find matching voice by language ('id' | 'en') and preferred gender ('female' | 'male')
   */
  public findVoice(language: LanguageCode, preferredGender: VoiceGender): { voice: SpeechSynthesisVoice | null; isExactGender: boolean; note?: string } {
    const allVoices = this.getAvailableVoices();
    if (allVoices.length === 0) {
      return { voice: null, isExactGender: false, note: 'Tidak ada suara TTS yang terdeteksi di peramban ini.' };
    }

    const langPrefix = language === 'id' ? 'id' : 'en';
    const langVoices = allVoices.filter(v => v.lang.toLowerCase().startsWith(langPrefix));

    if (langVoices.length === 0) {
      return {
        voice: allVoices[0],
        isExactGender: false,
        note: `Suara bahasa ${language === 'id' ? 'Indonesia' : 'Inggris'} tidak ditemukan di perangkat. Menggunakan suara default sistem.`
      };
    }

    // Gender detection heuristics by voice name
    const femaleKeywords = ['female', 'woman', 'girl', 'zira', 'damayanti', 'samantha', 'victoria', 'karen', 'jenny', 'aria', 'google id-id', 'google uk english female', 'google us english'];
    const maleKeywords = ['male', 'man', 'boy', 'david', 'george', 'ardi', 'richard', 'guy', 'google uk english male'];

    const targetKeywords = preferredGender === 'female' ? femaleKeywords : maleKeywords;
    const oppositeKeywords = preferredGender === 'female' ? maleKeywords : femaleKeywords;

    // 1. Try to find language voice matching gender keywords
    const match = langVoices.find(v => {
      const nameLower = v.name.toLowerCase();
      return targetKeywords.some(kw => nameLower.includes(kw));
    });

    if (match) {
      return { voice: match, isExactGender: true };
    }

    // 2. Try to find voice that doesn't explicitly match the opposite gender
    const neutralMatch = langVoices.find(v => {
      const nameLower = v.name.toLowerCase();
      return !oppositeKeywords.some(kw => nameLower.includes(kw));
    });

    if (neutralMatch) {
      return {
        voice: neutralMatch,
        isExactGender: false,
        note: `Suara khusus ${preferredGender === 'female' ? 'cewek' : 'cowok'} untuk bahasa ${language === 'id' ? 'Indonesia' : 'Inggris'} tidak tersedia secara eksplisit. Menggunakan suara ${neutralMatch.name}.`
      };
    }

    // 3. Fallback to first voice in that language
    return {
      voice: langVoices[0],
      isExactGender: false,
      note: `Suara alternatif digunakan: ${langVoices[0].name}`
    };
  }

  /**
   * Calculate speech synthesis playback rate from WPM (10 to 500)
   * Standard default speech is ~150-180 WPM at rate = 1.0
   */
  public calculateSpeechRate(wpm: number): number {
    // Normal speech is ~160 WPM => rate 1.0. Range for Web Speech API is typically 0.5 to 2.5
    const baseRate = wpm / 160;
    return Math.max(0.5, Math.min(2.5, Number(baseRate.toFixed(2))));
  }

  /**
   * Speak a passage or sentence
   */
  public speak(
    text: string,
    options: {
      language: LanguageCode;
      gender: VoiceGender;
      wpm: number;
      isMuted: boolean;
      onBoundary?: (charIndex: number) => void;
      onEnd?: () => void;
      onError?: (e: any) => void;
    }
  ): void {
    if (!this.synth || typeof window === 'undefined') return;

    this.stop();

    if (!text || text.trim().length === 0) return;

    const utterance = new SpeechSynthesisUtterance(text);
    const { voice } = this.findVoice(options.language, options.gender);

    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    } else {
      utterance.lang = options.language === 'id' ? 'id-ID' : 'en-US';
    }

    utterance.rate = this.calculateSpeechRate(options.wpm);
    utterance.volume = options.isMuted ? 0 : 1;
    utterance.pitch = options.gender === 'female' ? 1.1 : 0.9;

    if (options.onBoundary) {
      utterance.onboundary = (event) => {
        if (event.name === 'word') {
          options.onBoundary?.(event.charIndex);
        }
      };
    }

    utterance.onend = () => {
      this.currentUtterance = null;
      options.onEnd?.();
    };

    utterance.onerror = (e) => {
      this.currentUtterance = null;
      // Filter out intentional cancel errors
      if (e.error !== 'canceled' && e.error !== 'interrupted') {
        options.onError?.(e);
      }
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  public setVolume(isMuted: boolean): void {
    // Web Speech API does not allow dynamic volume change on active utterance without restart,
    // but we track isMuted so subsequent utterances or restarts apply volume 0 or 1
  }

  public pause(): void {
    if (this.synth && this.synth.speaking) {
      this.synth.pause();
    }
  }

  public resume(): void {
    if (this.synth && this.synth.paused) {
      this.synth.resume();
    }
  }

  public stop(): void {
    if (this.synth) {
      this.synth.cancel();
      this.currentUtterance = null;
    }
  }

  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }
}

export const ttsService = new TtsService();
