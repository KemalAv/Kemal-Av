/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  GraduationCap, 
  CheckCircle2, 
  HelpCircle, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink,
  Info,
  Building,
  MapPin,
  Compass,
  X,
  Eye,
  EyeOff,
  Filter,
  Search
} from 'lucide-react';
import { universityRoadmapData } from '../data/universityRoadmapData';
import { masterPlanData } from '../data/masterPlanData';
import { 
  UniversityRoadmapCampus, 
  UniversityPathway, 
  UniversityProgramChoice 
} from '../types';

interface ModalDetail {
  campus: UniversityRoadmapCampus;
  pathway: UniversityPathway;
  choice: UniversityProgramChoice;
}

export default function UniversityRoadmap() {
  const [showAllDetails, setShowAllDetails] = useState<boolean>(true);
  const [selectedModal, setSelectedModal] = useState<ModalDetail | null>(null);
  const [filterMajor, setFilterMajor] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showS2, setShowS2] = useState<boolean>(false);

  // Filter logic
  const filteredCampuses = useMemo(() => {
    return universityRoadmapData.map(campus => {
      // Filter pathways and choices
      const matchingPathways = campus.pathways.map(pw => {
        const matchingChoices = pw.choices.filter(choice => {
          // Major category filter
          let matchesFilter = true;
          if (filterMajor !== 'all') {
            const majorLower = choice.major.toLowerCase();
            if (filterMajor === 'industri') {
              matchesFilter = majorLower.includes('industri') || majorLower.includes('industrial');
            } else if (filterMajor === 'elektro') {
              matchesFilter = majorLower.includes('elektro');
            } else if (filterMajor === 'komputer') {
              matchesFilter = majorLower.includes('komputer');
            } else if (filterMajor === 'si') {
              matchesFilter = majorLower.includes('sistem informasi');
            } else if (filterMajor === 'vokasi') {
              matchesFilter = choice.degree === 'D4' || majorLower.includes('tro') || majorLower.includes('logistik');
            } else if (filterMajor === 'semarang') {
              matchesFilter = campus.location.toLowerCase().includes('semarang');
            }
          }

          // Search query
          let matchesSearch = true;
          if (searchQuery.trim() !== '') {
            const q = searchQuery.toLowerCase();
            matchesSearch = 
              campus.name.toLowerCase().includes(q) ||
              pw.name.toLowerCase().includes(q) ||
              choice.major.toLowerCase().includes(q) ||
              choice.reason.toLowerCase().includes(q) ||
              choice.benefits.toLowerCase().includes(q);
          }

          return matchesFilter && matchesSearch;
        });

        return {
          ...pw,
          choices: matchingChoices
        };
      }).filter(pw => pw.choices.length > 0);

      return {
        ...campus,
        pathways: matchingPathways
      };
    }).filter(c => c.pathways.length > 0);
  }, [filterMajor, searchQuery]);

  // Campuses for the 3 target PTN columns
  const col1Campuses = filteredCampuses.filter(c => c.column === 1 && !c.isCurrentOption && c.id !== 'binus' && c.id !== 'udinus');
  const col2Campuses = filteredCampuses.filter(c => c.column === 2 && !c.isCurrentOption && c.id !== 'binus' && c.id !== 'udinus');
  const col3Campuses = filteredCampuses.filter(c => c.column === 3 && !c.isCurrentOption && c.id !== 'binus' && c.id !== 'udinus');
  
  // Side-by-side Semarang Private Universities: BINUS & UDINUS
  const binusCampus = filteredCampuses.find(c => c.id === 'binus');
  const udinusCampus = filteredCampuses.find(c => c.id === 'udinus');
  
  const currentOptionCampus = filteredCampuses.find(c => c.isCurrentOption);

  return (
    <div className="w-full bg-[#070d1a] text-slate-100 rounded-[2.5rem] border border-slate-800/80 shadow-2xl p-4 sm:p-8 md:p-10 font-sans relative overflow-hidden">
      {/* Background Ambience Glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-sky-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header matching the Diagram */}
      <div className="text-center space-y-3 mb-8 relative z-10">
        <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-slate-400">
          ROADMAP PENDAFTARAN
        </p>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
          Target Universitas
        </h2>
        <p className="text-sm md:text-base text-slate-400 font-medium">
          Dikelompokkan berdasarkan kampus &rarr; jalur seleksi &rarr; program studi
        </p>

        {/* Central Badge from diagram */}
        <div className="pt-2 flex justify-center">
          <div className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#0f1c33] border border-sky-500/40 text-sky-200 font-bold tracking-wider text-xs md:text-sm uppercase shadow-inner">
            <span>🎯</span>
            <span>TARGET PENDIDIKAN TINGGI</span>
          </div>
        </div>
      </div>

      {/* Control Bar: View Toggle, Filter, and Search */}
      <div className="relative z-10 mb-8 bg-[#0b1426]/90 border border-slate-800 rounded-2xl p-4 backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
        {/* View Mode Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAllDetails(!showAllDetails)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              showAllDetails
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {showAllDetails ? <Eye size={15} /> : <EyeOff size={15} />}
            <span>{showAllDetails ? 'Alasan & Manfaat: Terbuka' : 'Mode Ringkas (Diagram)'}</span>
          </button>

          <span className="hidden sm:inline text-slate-600">|</span>
          <span className="hidden md:inline text-xs text-slate-400">
            Klik pada setiap prodi untuk membaca rincian strategis mendalam
          </span>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-bold text-slate-400 mr-1 flex items-center gap-1">
            <Filter size={12} /> Filter:
          </span>
          {[
            { id: 'all', label: 'Semua' },
            { id: 'industri', label: 'Teknik Industri' },
            { id: 'elektro', label: 'Teknik Elektro' },
            { id: 'komputer', label: 'Teknik Komputer' },
            { id: 'si', label: 'Sistem Informasi' },
            { id: 'vokasi', label: 'D4 Vokasi' },
            { id: 'semarang', label: 'Lokasi Semarang' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterMajor(f.id)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                filterMajor === f.id
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3-Column Diagram Grid (matching diagram_universitas_revisi.jpg) */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* COLUMN 1 */}
        <div className="space-y-6">
          {col1Campuses.map(campus => (
            <CampusCard
              key={campus.id}
              campus={campus}
              showDetails={showAllDetails}
              onSelectChoice={(pw, choice) => setSelectedModal({ campus, pathway: pw, choice })}
            />
          ))}
        </div>

        {/* COLUMN 2 */}
        <div className="space-y-6">
          {col2Campuses.map(campus => (
            <CampusCard
              key={campus.id}
              campus={campus}
              showDetails={showAllDetails}
              onSelectChoice={(pw, choice) => setSelectedModal({ campus, pathway: pw, choice })}
            />
          ))}
        </div>

        {/* COLUMN 3 */}
        <div className="space-y-6">
          {col3Campuses.map(campus => (
            <CampusCard
              key={campus.id}
              campus={campus}
              showDetails={showAllDetails}
              onSelectChoice={(pw, choice) => setSelectedModal({ campus, pathway: pw, choice })}
            />
          ))}
        </div>
      </div>

      {/* Side-by-Side: BINUS University Semarang & UDINUS */}
      {(binusCampus || udinusCampus) && (
        <div className="relative z-10 mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {binusCampus && (
            <CampusCard
              campus={binusCampus}
              showDetails={showAllDetails}
              onSelectChoice={(pw, choice) => setSelectedModal({ campus: binusCampus, pathway: pw, choice })}
            />
          )}
          {udinusCampus && (
            <CampusCard
              campus={udinusCampus}
              showDetails={showAllDetails}
              onSelectChoice={(pw, choice) => setSelectedModal({ campus: udinusCampus, pathway: pw, choice })}
            />
          )}
        </div>
      )}

      {/* UNDIP — Posisi Saat Ini / Opsi Bertahan (Placed at the very bottom) */}
      {currentOptionCampus && (
        <div className="relative z-10 mt-8">
          <div className="flex items-center gap-3 mb-3">
            <span className="h-px bg-rose-500/30 flex-1" />
            <span className="text-[11px] font-black uppercase tracking-widest text-rose-400 bg-rose-950/60 px-3 py-1 rounded-full border border-rose-500/40">
              Opsi Bertahan &amp; Status Terkini
            </span>
            <span className="h-px bg-rose-500/30 flex-1" />
          </div>

          <div className="max-w-4xl mx-auto">
            <CampusCard
              campus={currentOptionCampus}
              showDetails={showAllDetails}
              onSelectChoice={(pw, choice) => setSelectedModal({ campus: currentOptionCampus, pathway: pw, choice })}
            />
          </div>
        </div>
      )}

      {/* Bottom Legend matching the image */}
      <div className="relative z-10 mt-10 pt-6 border-t border-slate-800/80 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-300 font-medium">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
          <span><strong className="text-emerald-400">Hijau</strong> = Pilihan 1</span>
        </div>
        <span className="text-slate-600 hidden sm:inline">&bull;</span>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-sky-400 shadow-sm shadow-sky-400/50" />
          <span><strong className="text-sky-400">Biru</strong> = Pilihan 2</span>
        </div>
        <span className="text-slate-600 hidden sm:inline">&bull;</span>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50" />
          <span><strong className="text-rose-400">Merah</strong> = posisi saat ini / opsi bertahan</span>
        </div>
      </div>

      {/* S2 Strategic Education Section (Kept intact) */}
      <div className="relative z-10 mt-10 pt-6 border-t border-slate-800/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-900/50 text-indigo-400 border border-indigo-500/30 rounded-xl">
              <GraduationCap size={18} />
            </div>
            <div>
              <h4 className="text-base font-bold text-white">Target Strata 2 (S2) — MBA / MM Eksekutif</h4>
              <p className="text-xs text-slate-400">Jangkar Bisnis Global & Lokal untuk Akselerasi Manajemen Korporasi</p>
            </div>
          </div>
          <button
            onClick={() => setShowS2(!showS2)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-indigo-300 rounded-xl border border-slate-700 transition-colors"
          >
            {showS2 ? 'Sembunyikan' : 'Lihat Rencana S2'}
            {showS2 ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>

        <AnimatePresence>
          {showS2 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 overflow-hidden"
            >
              {masterPlanData.education.s2.map((s2, idx) => (
                <div key={idx} className="p-5 bg-[#0b1528] rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest bg-indigo-950/60 border border-indigo-800/60 px-2.5 py-0.5 rounded-full">
                      {s2.title}
                    </span>
                    <span className="text-xs text-slate-400 font-semibold">Kelas Eksekutif</span>
                  </div>
                  <h5 className="font-bold text-white text-base">{s2.campus}</h5>
                  <div className="space-y-2 text-xs">
                    <div className="p-3 bg-amber-950/30 border border-amber-800/40 rounded-xl text-amber-200">
                      <strong>Strategi:</strong> {s2.strategy}
                    </div>
                    <div className="p-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-slate-300">
                      <strong>Fokus & Keunggulan:</strong> {s2.perks}
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modal Detail for In-Depth Strategic Explanation */}
      <AnimatePresence>
        {selectedModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#0e1930] border border-slate-700 rounded-3xl p-6 md:p-8 max-w-2xl w-full text-white shadow-2xl relative space-y-6"
            >
              {/* Close button */}
              <button
                onClick={() => setSelectedModal(null)}
                className="absolute top-6 right-6 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>

              {/* Modal Header */}
              <div className="space-y-1 pr-10">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`text-[10px] font-black tracking-widest px-2.5 py-0.5 rounded-full uppercase ${
                    selectedModal.choice.type === 'pilihan1'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : selectedModal.choice.type === 'pilihan2'
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}>
                    {selectedModal.choice.label}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <MapPin size={12} /> {selectedModal.campus.location}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-white mt-1">
                  {selectedModal.choice.major}
                </h3>
                <p className="text-sm font-semibold text-indigo-400">
                  {selectedModal.campus.name}
                </p>
              </div>

              {/* Pathway Info */}
              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 text-xs">
                <span className="text-slate-400 block mb-0.5 uppercase tracking-wider font-semibold text-[10px]">
                  Jalur Pendaftaran
                </span>
                <span className="text-slate-200 font-medium">
                  {selectedModal.pathway.name}
                </span>
              </div>

              {/* Reason / Strategy */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                  <Compass size={16} />
                  <span>Alasan &amp; Strategi Pemilihan</span>
                </div>
                <div className="p-4 bg-emerald-950/20 border border-emerald-800/40 rounded-2xl text-xs md:text-sm text-emerald-100 leading-relaxed">
                  {selectedModal.choice.reason}
                </div>
              </div>

              {/* Benefits / Perks */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sky-400 text-xs font-bold uppercase tracking-wider">
                  <Sparkles size={16} />
                  <span>Manfaat, Akreditasi &amp; Prospek Karir</span>
                </div>
                <div className="p-4 bg-sky-950/20 border border-sky-800/40 rounded-2xl text-xs md:text-sm text-sky-100 leading-relaxed">
                  {selectedModal.choice.benefits}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setSelectedModal(null)}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-sm text-white transition-all shadow-lg shadow-indigo-600/30"
                >
                  Tutup Rincian
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// -----------------------------------------------------------
// SUB-COMPONENT: Campus Card
// -----------------------------------------------------------
interface CampusCardProps {
  campus: UniversityRoadmapCampus;
  showDetails: boolean;
  onSelectChoice: (pw: UniversityPathway, choice: UniversityProgramChoice) => void;
}

function CampusCard({ campus, showDetails, onSelectChoice }: CampusCardProps) {
  const isCurrent = campus.isCurrentOption;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`rounded-2xl p-5 md:p-6 transition-all duration-300 ${
        isCurrent
          ? 'bg-[#180b15]/95 border-2 border-rose-500/60 shadow-xl shadow-rose-950/40'
          : 'bg-[#0d172e]/90 hover:bg-[#0f1b36] border border-[#1d2d4c] shadow-lg shadow-black/30'
      }`}
    >
      {/* Header with Title */}
      <div className="border-b border-[#1d2d4c]/80 pb-3 mb-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className={`font-bold text-lg md:text-xl tracking-tight ${
            isCurrent ? 'text-rose-200' : 'text-white'
          }`}>
            {campus.name}
          </h3>
          {campus.badge && (
            <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30 shrink-0">
              {campus.badge}
            </span>
          )}
        </div>
      </div>

      {/* Pathways List */}
      <div className="space-y-5">
        {campus.pathways.map((pw, pwIdx) => (
          <div key={pwIdx} className="relative pl-3.5 border-l-2 border-slate-700/60">
            {/* Pathway Name */}
            <p className="text-xs md:text-sm text-slate-300 font-medium mb-2.5 leading-snug">
              {pw.name}
            </p>

            {/* Program Studi Choices Box */}
            <div className={`grid gap-2.5 ${
              pw.choices.length > 1 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'
            }`}>
              {pw.choices.map((choice, cIdx) => {
                const isChoice1 = choice.type === 'pilihan1';
                const isChoice2 = choice.type === 'pilihan2';
                const isCurr = choice.type === 'current';

                return (
                  <div
                    key={cIdx}
                    onClick={() => onSelectChoice(pw, choice)}
                    className={`group rounded-xl p-3 border transition-all cursor-pointer relative overflow-hidden ${
                      isChoice1
                        ? 'bg-[#091524] border-[#1e384e] hover:border-emerald-500/70 hover:shadow-md hover:shadow-emerald-950/40'
                        : isChoice2
                        ? 'bg-[#091524] border-[#1e384e] hover:border-sky-500/70 hover:shadow-md hover:shadow-sky-950/40'
                        : 'bg-[#200c14] border-rose-900/60 hover:border-rose-500/70 hover:shadow-md hover:shadow-rose-950/40'
                    }`}
                  >
                    {/* Badge Label (PILIHAN 1 / PILIHAN 2 / PROGRAM STUDI SAAT INI) */}
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-[10px] font-extrabold tracking-wider uppercase ${
                        isChoice1
                          ? 'text-emerald-400'
                          : isChoice2
                          ? 'text-sky-400'
                          : 'text-rose-400'
                      }`}>
                        {choice.label}
                      </span>
                      <Info size={13} className="text-slate-500 group-hover:text-slate-300 transition-colors" />
                    </div>

                    {/* Major Name */}
                    <p className={`text-xs md:text-sm font-semibold tracking-tight ${
                      isCurr ? 'text-rose-100' : 'text-white'
                    }`}>
                      {choice.major}
                    </p>

                    {/* Inline Reasons & Benefits when Toggled */}
                    {showDetails && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-2.5 pt-2 border-t border-slate-800 space-y-1.5 text-[11px] leading-relaxed"
                      >
                        <p className="text-slate-300">
                          <strong className="text-emerald-400 font-semibold">Alasan: </strong>
                          {choice.reason}
                        </p>
                        <p className="text-slate-400">
                          <strong className="text-sky-400 font-semibold">Manfaat: </strong>
                          {choice.benefits}
                        </p>
                      </motion.div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
