import React from 'react';
import { Volume2, VolumeX, Globe, User, AlertCircle, Sparkles } from 'lucide-react';
import { LanguageCode, VoiceGender } from '../types';
import { ttsService } from '../services/ttsService';

interface TtsPanelProps {
  language: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  gender: VoiceGender;
  onGenderChange: (gender: VoiceGender) => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const TtsPanel: React.FC<TtsPanelProps> = ({
  language,
  onLanguageChange,
  gender,
  onGenderChange,
  isMuted,
  onToggleMute,
}) => {
  const isSupported = ttsService.isSupported();
  const voiceMatch = isSupported ? ttsService.findVoice(language, gender) : null;

  return (
    <div className="bg-slate-50 border-b border-slate-200 px-4 sm:px-6 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Section Header & Language/Gender Controls */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-slate-700" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-700">
              Text-to-Speech (Suara)
            </span>
          </div>

          {/* Language Selector */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg p-1">
            <Globe className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
            <button
              onClick={() => onLanguageChange('id')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                language === 'id'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Indonesia
            </button>
            <button
              onClick={() => onLanguageChange('en')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                language === 'en'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              English
            </button>
          </div>

          {/* Voice Gender Selector */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg p-1">
            <User className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
            <button
              onClick={() => onGenderChange('female')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                gender === 'female'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Cewek
            </button>
            <button
              onClick={() => onGenderChange('male')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                gender === 'male'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Cowok
            </button>
          </div>

          {/* Mute / Unmute Button */}
          <button
            onClick={onToggleMute}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
              isMuted
                ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
            title={isMuted ? 'Suara dimatikan (sorotan tetap berjalan)' : 'Matikan suara TTS'}
          >
            {isMuted ? (
              <>
                <VolumeX className="w-3.5 h-3.5 text-amber-600" />
                <span>Muted (Hening)</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-slate-600" />
                <span>Suara Aktif</span>
              </>
            )}
          </button>
        </div>

        {/* Right: Detected Voice Info or Fallback notice */}
        <div className="text-xs text-slate-600 flex items-center gap-2">
          {!isSupported ? (
            <div className="flex items-center gap-1.5 text-amber-700 bg-amber-50 px-2.5 py-1 rounded border border-amber-200">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>Web Speech API tidak didukung pada browser ini.</span>
            </div>
          ) : voiceMatch?.voice ? (
            <div className="flex items-center gap-1.5 text-slate-600 bg-white px-2.5 py-1 rounded border border-slate-200">
              <Sparkles className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate max-w-xs sm:max-w-sm">
                Suara: <strong className="font-semibold text-slate-800">{voiceMatch.voice.name}</strong> ({voiceMatch.voice.lang})
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-slate-500">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>Memuat daftar suara perangkat...</span>
            </div>
          )}
        </div>
      </div>

      {/* Notice if voice was not exact gender match */}
      {voiceMatch?.note && (
        <div className="max-w-7xl mx-auto mt-2 pt-2 border-t border-slate-200/60 text-[11px] text-slate-500 flex items-center gap-1.5">
          <AlertCircle className="w-3 h-3 text-slate-400 shrink-0" />
          <span>{voiceMatch.note}</span>
        </div>
      )}
    </div>
  );
};
