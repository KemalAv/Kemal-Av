import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ALL_UNDIP_MAJORS,
  UNDIP_FACULTIES,
  UNDIP_2030_METADATA,
  CLUSTER_WEIGHTS,
  UndipMajor,
  UserUtbkScores,
  ProdiCluster,
  calculateMajorWeightedScore,
  calculateClusterScoreAndPP,
  scoreToOsuPP,
  getClusterHighlightText
} from '../data/snbt2030UndipData';
import {
  ALL_ITB_MAJORS,
  ITB_FACULTIES,
  ITB_2030_METADATA,
  ItbMajor
} from '../data/snbt2030ItbData';
import {
  GraduationCap,
  Trophy,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  Trash2,
  Plus,
  Search,
  Sliders,
  Sparkles,
  Info,
  ShieldCheck,
  Gamepad2,
  Building2,
  Layers,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Zap,
  Check,
  Compass,
  BookOpen,
  Scale,
  HelpCircle,
  Filter,
  Award,
  Play,
  Timer,
  Dices,
  X
} from 'lucide-react';

interface SimQuestion {
  id: string;
  level: 'Mudah' | 'Sedang' | 'Sulit';
  qType?: 'Pilihan Ganda' | 'Isian Singkat';
  a: number; // discrimination
  b: number; // difficulty
  c: number; // pseudo-guessing (3PL parameter)
  irtImpact: number;
  userAnswer: 'benar' | 'salah' | null;
  impactEarned: number;
}

interface SimSubtestResult {
  key: string;
  name: string;
  correct: number;
  wrong: number;
  irtEarned: number;
  totalIrtMax: number;
  theta: number;
  score: number;
}

interface SimSession {
  id: string;
  meanDifficulty: number;
  meanDiscrimination: number;
}

interface SavedSimResult {
  sessionId: string;
  meanDifficulty: number;
  meanDiscrimination: number;
  timestamp: string;
  totalCorrect: number;
  totalWrong: number;
  totalIrtEarned: number;
  totalIrtMax: number;
  snbtScore: number;
  subtests: SimSubtestResult[];
  questionsBySubtest: Record<string, SimQuestion[]>;
  profileName?: string;
}

const SUBTESTS_CONFIG = [
  { key: 'pu', name: 'Penalaran Umum (PU)', qCount: 30, duration: 1800, desc: 'Logika deduktif & induktif' },
  { key: 'ppu', name: 'Pengetahuan & Pemahaman Umum (PPU)', qCount: 20, duration: 900, desc: 'Kosakata & analogi makna' },
  { key: 'pbm', name: 'Pemahaman Bacaan & Menulis (PBM)', qCount: 20, duration: 1500, desc: 'Ejaan & kohesi teks' },
  { key: 'pk', name: 'Pengetahuan Kuantitatif (PK)', qCount: 20, duration: 1200, desc: 'Matematika dasar & aritmetika' },
  { key: 'litIndo', name: 'Literasi Bahasa Indonesia (LBI)', qCount: 30, duration: 2700, desc: 'Analisis teks sastra & opini' },
  { key: 'litIng', name: 'Literasi Bahasa Inggris (LBE)', qCount: 20, duration: 1800, desc: 'Critical reading global' },
  { key: 'pm', name: 'Penalaran Matematika (PM)', qCount: 20, duration: 2100, desc: 'Model matematis kontekstual' }
];

interface Snbt2030SimulatorProps {
  initialScores?: UserUtbkScores;
  onScoresChange?: (scores: UserUtbkScores) => void;
  activeTierHex?: string;
}

export const getClusterBadgeStyle = (cluster: ProdiCluster) => {
  switch (cluster) {
    case 'teknik':
      return { bg: 'bg-blue-500/15', text: 'text-blue-300', border: 'border-blue-500/30' };
    case 'sosial':
      return { bg: 'bg-amber-500/15', text: 'text-amber-300', border: 'border-amber-500/30' };
    case 'kesehatan':
      return { bg: 'bg-emerald-500/15', text: 'text-emerald-300', border: 'border-emerald-500/30' };
    case 'bisnis':
      return { bg: 'bg-purple-500/15', text: 'text-purple-300', border: 'border-purple-500/30' };
    case 'sastra':
      return { bg: 'bg-pink-500/15', text: 'text-pink-300', border: 'border-pink-500/30' };
    default:
      return { bg: 'bg-slate-500/15', text: 'text-slate-300', border: 'border-slate-500/30' };
  }
};

export const Snbt2030Simulator: React.FC<Snbt2030SimulatorProps> = ({
  initialScores,
  onScoresChange,
  activeTierHex = '#3b82f6'
}) => {
  // 7 Subtest Scores
  const [scores, setScores] = useState<UserUtbkScores>(
    initialScores || {
      pu: 620,
      pbm: 610,
      ppu: 615,
      pk: 640,
      litIndo: 625,
      litIng: 630,
      pm: 635,
    }
  );

  // Submit / Lock status
  const [isSubmitted, setIsSubmitted] = useState<boolean>(true);
  const [submittedAt, setSubmittedAt] = useState<Date | null>(new Date());

  // Selected Choices (ordered 1 to 15)
  const [univ, setUniv] = useState<'undip' | 'itb'>('undip');

  const activeMajors = useMemo(() => {
    return univ === 'undip' ? ALL_UNDIP_MAJORS : ALL_ITB_MAJORS;
  }, [univ]);

  const activeFaculties = useMemo(() => {
    return univ === 'undip' ? UNDIP_FACULTIES : ITB_FACULTIES;
  }, [univ]);

  const activeMetadata = useMemo(() => {
    return univ === 'undip' ? UNDIP_2030_METADATA : ITB_2030_METADATA;
  }, [univ]);

  // Selected Choices (ordered 1 to 15, supports cross-university selection)
  const [selectedChoices, setSelectedChoices] = useState<UndipMajor[]>(() => {
    const defaults = [
      ALL_ITB_MAJORS.find(m => m.id === 'itb-13321021'), // STEI-K
      ALL_UNDIP_MAJORS.find(m => m.id === 'fsm-informatika'), // Informatika
      ALL_ITB_MAJORS.find(m => m.id === 'itb-13321002'), // FTTM
      ALL_UNDIP_MAJORS.find(m => m.id === 'ft-teknik-komputer'), // Teknik Komputer
      ALL_ITB_MAJORS.find(m => m.id === 'itb-13321024'), // SBM
      ALL_UNDIP_MAJORS.find(m => m.id === 'feb-bisnis-digital'), // Bisnis Digital
      ALL_ITB_MAJORS.find(m => m.id === 'itb-13321028'), // FTI-SP
      ALL_UNDIP_MAJORS.find(m => m.id === 'fsm-aktuaria') // Aktuaria
    ].filter(Boolean) as UndipMajor[];
    return defaults;
  });

  // Directory filter & search state
  const [searchTerm, setSearchTerm] = useState('');
  const [facultyFilter, setFacultyFilter] = useState<string>('all');
  const [degreeFilter, setDegreeFilter] = useState<'all' | 'S1' | 'D4'>('all');
  const [clusterFilter, setClusterFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'simulation' | 'directory' | 'rules' | 'exam_sim'>('exam_sim');
  const [expandedFaculty, setExpandedFaculty] = useState<Record<string, boolean>>({
    fsm: true,
    ft: true,
    sv: true
  });
  const [expandedMajorWeight, setExpandedMajorWeight] = useState<string | null>(null);

  // Simulation State Variables
  const [simState, setSimState] = useState<'dashboard' | 'testing' | 'results'>('dashboard');
  const [simSession, setSimSession] = useState<SimSession | null>(null);
  const [simCurrentSubtestIndex, setSimCurrentSubtestIndex] = useState<number>(0);
  const [simCurrentQuestionIndex, setSimCurrentQuestionIndex] = useState<number>(0);
  const [simAllSubtestsQuestions, setSimAllSubtestsQuestions] = useState<Record<string, SimQuestion[]>>({});
  const [simSubtestResults, setSimSubtestResults] = useState<SimSubtestResult[]>([]);
  const [simTimer, setSimTimer] = useState<number>(1800);
  const [simFeedback, setSimFeedback] = useState<{ isCorrect: boolean; level: string; a: number; b: number } | null>(null);
  const [simLastSavedResult, setSimLastSavedResult] = useState<SavedSimResult | null>(null);
  const [simActiveDetailSubtest, setSimActiveDetailSubtest] = useState<string>('pu');

  // Load saved simulation results on mount
  useEffect(() => {
    setFacultyFilter('all');
    const newExpanded: Record<string, boolean> = {};
    activeFaculties.forEach(f => {
      newExpanded[f.id] = true;
    });
    setExpandedFaculty(newExpanded);
  }, [univ, activeFaculties]);

  useEffect(() => {
    const saved = localStorage.getItem('last_snbt_simulation_result');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSimLastSavedResult(parsed);
      } catch (e) {
        console.error('Error loading saved simulation:', e);
      }
    }
  }, []);

  // Sync scores with parent if initialScores prop changes
  useEffect(() => {
    if (initialScores) {
      setScores(initialScores);
    }
  }, [initialScores]);

  // Timer effect for active subtest
  useEffect(() => {
    if (simState !== 'testing') return;

    const interval = setInterval(() => {
      setSimTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          handleTimeOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [simState, simCurrentSubtestIndex]);

  // Set timer and index configurations when moving to next subtest
  useEffect(() => {
    if (simState === 'testing' && simSession) {
      const activeSubConfig = SUBTESTS_CONFIG[simCurrentSubtestIndex];
      setSimTimer(activeSubConfig.duration);
      setSimCurrentQuestionIndex(0);
      setSimFeedback(null);
    }
  }, [simCurrentSubtestIndex, simState]);

  // Estimate theta using 3PL IRT model and anchor to real UTBK-SNBT standard population distribution
  const estimateTheta = (questions: SimQuestion[]) => {
    if (!questions || questions.length === 0) return 0;

    let bestTheta = 0;
    let maxLogPosterior = -Infinity;
    for (let theta = -3.5; theta <= 3.5; theta += 0.02) {
      let logLikelihood = 0;
      for (const q of questions) {
        // 3-Parameter Logistic (3PL) formula
        const p = q.c + (1 - q.c) * (1 / (1 + Math.exp(-q.a * (theta - q.b))));
        const y = q.userAnswer === 'benar' ? 1 : 0;
        logLikelihood += y * Math.log(Math.max(1e-6, p)) + (1 - y) * Math.log(Math.max(1e-6, 1 - p));
      }
      // Gaussian regularizer
      const logPrior = -0.5 * Math.pow(theta / 3.0, 2);
      const logPosterior = logLikelihood + logPrior;

      if (logPosterior > maxLogPosterior) {
        maxLogPosterior = logPosterior;
        bestTheta = theta;
      }
    }

    // Psychometric UTBK-SNBT standard norming:
    // In UTBK-SNBT:
    // - Mean population capability theta = 0.0 corresponds to ~37.5% accuracy (Score 500).
    // - Benar ~100/160 (62.5%) -> theta ~ +1.25 -> Skor ~650
    // - Benar ~115/160 (71.9%) -> theta ~ +1.70 -> Skor ~704 (Mendekati / tembus 700)
    // - Benar ~125/160 (78.1%) -> theta ~ +2.07 -> Skor ~748 (Tembus 740 - 760)
    // - Benar ~136/160 (85.0% / 17 dari 20) -> theta ~ +2.50 -> Skor ~800+
    const rawCorrect = questions.filter(q => q.userAnswer === 'benar').length;
    const totalQ = questions.length;
    const rawProp = rawCorrect / totalQ;

    let abilityZ = 0;
    if (rawProp >= 0.375) {
      // Upper curve: progressive psychometric rewards for high-difficulty questions
      abilityZ = (rawProp - 0.375) * 5.10;
    } else {
      // Lower curve: standard calibration down to guessing threshold
      abilityZ = (rawProp - 0.375) * 3.60;
    }
    
    // Combine 3PL item-weighted theta (65%) with proportion-anchored ability (35%)
    const calibratedTheta = (bestTheta * 1.40) * 0.65 + abilityZ * 0.35;
    const boundedTheta = Math.max(-2.5, Math.min(3.8, calibratedTheta));

    return Number(boundedTheta.toFixed(2));
  };

  // Convert estimated theta directly to authentic UTBK-SNBT score (where theta = 0 maps to exactly 500)
  const calculateSnbtIrtScore = (theta: number) => {
    // Official IRT Linear Transformation: Score = 500 + 120 * theta (Mean = 500, SD = 120)
    // Theta 0.0 = exactly 500
    const rawScore = Math.round(500 + 120 * theta);
    return Math.max(200, Math.min(1000, rawScore));
  };

  // Helper to generate authentic 3PL pseudo-guessing parameter c matching real UTBK-SNBT:
  // 1. Isian Singkat: for the last 2-3 questions in PK and PM, c = 0.00 (no multiple choice options to guess).
  // 2. 5-Option Multiple Choice: c fluctuates empirically around 0.20 depending on distractor attractiveness.
  const generateItemC = (
    subKey: string,
    qIndex: number,
    qCount: number,
    level: 'Mudah' | 'Sedang' | 'Sulit'
  ): { c: number; qType: 'Pilihan Ganda' | 'Isian Singkat' } => {
    // In official SNBT, PK and PM feature short-answer numeric fill-in (Isian Singkat) questions at the end
    const isFillIn = (subKey === 'pk' && qIndex >= qCount - 2) || (subKey === 'pm' && qIndex >= qCount - 3);
    if (isFillIn) {
      return { c: 0.0, qType: 'Isian Singkat' };
    }

    // For standard 5-option multiple choice items:
    // c varies based on distractor effectiveness & item difficulty
    let cVal = 0.20;
    if (level === 'Sulit') {
      // Attractive, deceptive distractors reduce the likelihood of a successful blind guess
      cVal = 0.13 + Math.random() * 0.05; // 0.13 to 0.18
    } else if (level === 'Sedang') {
      // Standard balanced distractors
      cVal = 0.17 + Math.random() * 0.06; // 0.17 to 0.23
    } else {
      // Easier items where 1-2 distractors are readily eliminated by candidates
      cVal = 0.21 + Math.random() * 0.05; // 0.21 to 0.26
    }

    return {
      c: Number(cVal.toFixed(2)),
      qType: 'Pilihan Ganda'
    };
  };

  const startSimulation = () => {
    // Generate new Session ID
    const sessionId = "SESS-" + Math.floor(1000 + Math.random() * 9000);

    // Subtle package-level difficulty shift: e.g. [-0.08, +0.08] for authentic UTBK session variance
    const packageShift = (Math.random() - 0.5) * 0.16;

    const allQuestions: Record<string, SimQuestion[]> = {};
    let sumB = 0;
    let sumA = 0;
    let totalQuestionsCount = 0;

    SUBTESTS_CONFIG.forEach(sub => {
      // Subtle subtest-level natural variation: e.g. [-0.06, +0.06]
      const subtestShift = (Math.random() - 0.5) * 0.12;
      const list: SimQuestion[] = [];
      for (let i = 0; i < sub.qCount; i++) {
        const r = Math.random();
        let level: 'Mudah' | 'Sedang' | 'Sulit' = 'Sedang';
        if (r < 0.25) level = 'Mudah';
        else if (r < 0.70) level = 'Sedang';
        else level = 'Sulit';

        const a = 0.90 + Math.random() * 0.40; // Discrimination parameter a (0.90 to 1.30)
        let b = 0; // Empirical Difficulty parameter b
        if (level === 'Mudah') {
          b = -0.8 + Math.random() * 0.6; // -0.8 to -0.2 (Mudah)
        } else if (level === 'Sedang') {
          b = 0.0 + Math.random() * 0.7; // 0.0 to +0.7 (Sedang)
        } else {
          b = 0.9 + Math.random() * 0.9; // +0.9 to +1.8 (Sulit / HOTS)
        }

        // Apply subtle package & subtest natural RNG
        b = Number((b + packageShift + subtestShift).toFixed(3));

        // Authentic SNBT pseudo-guessing distribution (0.00 for Isian Singkat, 0.13-0.26 for Pilihan Ganda)
        const { c, qType } = generateItemC(sub.key, i, sub.qCount, level);
        const irtImpact = Math.round(15 * a);

        sumB += b;
        sumA += a;
        totalQuestionsCount++;

        list.push({
          id: `${sub.key}-${i}`,
          level,
          qType,
          a,
          b,
          c,
          irtImpact,
          userAnswer: null,
          impactEarned: 0
        });
      }
      allQuestions[sub.key] = list;
    });

    const rawMeanB = totalQuestionsCount > 0 ? sumB / totalQuestionsCount : 0;
    // Centered around standard UTBK baseline so standard package difficulty sits cleanly at 0.00
    const meanDifficulty = Number((rawMeanB - 0.45).toFixed(3));
    const meanDiscrimination = totalQuestionsCount > 0 ? sumA / totalQuestionsCount : 1.0;

    const session: SimSession = {
      id: sessionId,
      meanDifficulty,
      meanDiscrimination
    };

    setSimSession(session);
    setSimCurrentSubtestIndex(0);
    setSimCurrentQuestionIndex(0);
    setSimFeedback(null);
    setSimSubtestResults([]);
    setSimAllSubtestsQuestions(allQuestions);
    setSimTimer(SUBTESTS_CONFIG[0].duration);
    setSimState('testing');
  };

  const startInstantSimulation = () => {
    const sessionId = "SESS-" + Math.floor(1000 + Math.random() * 9000);

    // Subtle package-level difficulty shift: e.g. [-0.08, +0.08]
    const packageShift = (Math.random() - 0.5) * 0.16;

    const allQuestions: Record<string, SimQuestion[]> = {};
    const results: SimSubtestResult[] = [];
    let sumB = 0;
    let sumA = 0;
    let totalQuestionsCount = 0;

    // Pure RNG candidate capability across authentic national spectrum
    // Gaussian-like random theta with mean ~0.25 and sd ~0.90, bounded realistically
    const u1 = Math.random() || 0.001;
    const u2 = Math.random() || 0.001;
    const randNorm = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    const targetTheta = Math.max(-1.8, Math.min(2.8, 0.25 + randNorm * 0.90));

    SUBTESTS_CONFIG.forEach(sub => {
      // Subtle subtest-level natural variation: e.g. [-0.06, +0.06]
      const subtestShift = (Math.random() - 0.5) * 0.12;
      const tempQuestions: { q: SimQuestion; prob: number }[] = [];
      const subtestTheta = targetTheta + (Math.random() * 0.40 - 0.20);

      for (let i = 0; i < sub.qCount; i++) {
        const r = Math.random();
        let level: 'Mudah' | 'Sedang' | 'Sulit' = 'Sedang';
        if (r < 0.25) level = 'Mudah';
        else if (r < 0.70) level = 'Sedang';
        else level = 'Sulit';

        const a = 0.90 + Math.random() * 0.40; // Discrimination parameter a (0.90 to 1.30)
        let b = 0; // Empirical Difficulty parameter b
        if (level === 'Mudah') {
          b = -0.8 + Math.random() * 0.6; // -0.8 to -0.2 (Mudah)
        } else if (level === 'Sedang') {
          b = 0.0 + Math.random() * 0.7; // 0.0 to +0.7 (Sedang)
        } else {
          b = 0.9 + Math.random() * 0.9; // +0.9 to +1.8 (Sulit / HOTS)
        }

        // Apply subtle package & subtest natural RNG
        b = Number((b + packageShift + subtestShift).toFixed(3));

        // Authentic SNBT pseudo-guessing distribution (0.00 for Isian Singkat, 0.13-0.26 for Pilihan Ganda)
        const { c, qType } = generateItemC(sub.key, i, sub.qCount, level);
        const irtImpact = Math.round(15 * a);

        sumB += b;
        sumA += a;
        totalQuestionsCount++;

        // 3PL probability of candidate with subtestTheta solving question
        const exponent = -a * (subtestTheta - b);
        const correctProb = c + (1 - c) * (1 / (1 + Math.exp(exponent)));

        const simQ: SimQuestion = {
          id: `${sub.key}-${i}`,
          level,
          qType,
          a,
          b,
          c,
          irtImpact,
          userAnswer: null,
          impactEarned: 0
        };

        tempQuestions.push({ q: simQ, prob: correctProb });
      }

      // Calculate expected target correct count with small, natural human variance (+/- 1)
      const expectedSumProb = tempQuestions.reduce((sum, item) => sum + item.prob, 0);
      const randomOffset = (Math.random() - 0.5) * 1.2;
      const targetCorrectCount = Math.max(1, Math.min(sub.qCount, Math.round(expectedSumProb + randomOffset)));

      // Rank questions by candidate proficiency probability + minor realistic noise
      const scoredItems = tempQuestions.map((item, idx) => ({
        idx,
        score: item.prob + (Math.random() * 0.20 - 0.10)
      })).sort((a, b) => b.score - a.score);

      const correctIndices = new Set(scoredItems.slice(0, targetCorrectCount).map(s => s.idx));

      const list: SimQuestion[] = [];
      let correct = 0;
      let wrong = 0;
      let irtEarned = 0;
      let totalIrtMax = 0;

      tempQuestions.forEach((item, idx) => {
        const isCorrect = correctIndices.has(idx);
        const userAnswer = isCorrect ? 'benar' : 'salah';
        const impactEarned = isCorrect ? item.q.irtImpact : 0;

        if (isCorrect) {
          correct++;
          irtEarned += item.q.irtImpact;
        } else {
          wrong++;
        }
        totalIrtMax += item.q.irtImpact;

        list.push({
          ...item.q,
          userAnswer,
          impactEarned
        });
      });

      allQuestions[sub.key] = list;

      const theta = estimateTheta(list);
      const score = calculateSnbtIrtScore(theta);

      results.push({
        key: sub.key,
        name: sub.name,
        correct,
        wrong,
        irtEarned,
        totalIrtMax,
        theta,
        score
      });
    });

    const rawMeanB = totalQuestionsCount > 0 ? sumB / totalQuestionsCount : 0;
    // Centered around standard UTBK baseline so standard package difficulty sits cleanly at 0.00
    const meanDifficulty = Number((rawMeanB - 0.45).toFixed(3));
    const meanDiscrimination = totalQuestionsCount > 0 ? sumA / totalQuestionsCount : 1.0;

    const session: SimSession = {
      id: sessionId,
      meanDifficulty,
      meanDiscrimination
    };

    setSimSession(session);
    setSimAllSubtestsQuestions(allQuestions);
    setSimSubtestResults(results);

    const totalCorrect = results.reduce((sum, r) => sum + r.correct, 0);
    const totalWrong = results.reduce((sum, r) => sum + r.wrong, 0);
    const totalIrtEarned = results.reduce((sum, r) => sum + r.irtEarned, 0);
    const totalIrtMax = results.reduce((sum, r) => sum + r.totalIrtMax, 0);
    const sumScores = results.reduce((sum, r) => sum + r.score, 0);
    const snbtScore = Math.round(sumScores / 7.0);

    const finalResult: SavedSimResult = {
      sessionId: session.id,
      meanDifficulty,
      meanDiscrimination,
      timestamp: new Date().toLocaleDateString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      totalCorrect,
      totalWrong,
      totalIrtEarned,
      totalIrtMax,
      snbtScore,
      subtests: results,
      questionsBySubtest: allQuestions
    };

    localStorage.setItem('last_snbt_simulation_result', JSON.stringify(finalResult));
    setSimLastSavedResult(finalResult);

    const newScores: UserUtbkScores = {
      pu: results.find(r => r.key === 'pu')?.score || 600,
      ppu: results.find(r => r.key === 'ppu')?.score || 600,
      pbm: results.find(r => r.key === 'pbm')?.score || 600,
      pk: results.find(r => r.key === 'pk')?.score || 600,
      litIndo: results.find(r => r.key === 'litIndo')?.score || 600,
      litIng: results.find(r => r.key === 'litIng')?.score || 600,
      pm: results.find(r => r.key === 'pm')?.score || 600,
    };

    setScores(newScores);
    if (onScoresChange) onScoresChange(newScores);

    setSimState('results');
  };

  const handleTimeOut = () => {
    if (!simSession) return;
    const activeSub = SUBTESTS_CONFIG[simCurrentSubtestIndex];
    const qList = [...(simAllSubtestsQuestions[activeSub.key] || [])];
    
    qList.forEach(q => {
      if (q.userAnswer === null) {
        q.userAnswer = 'salah';
        q.impactEarned = 0;
      }
    });

    setSimAllSubtestsQuestions(prev => ({
      ...prev,
      [activeSub.key]: qList
    }));

    calculateAndAdvanceSubtest(qList);
  };

  const handleAnswerClick = (answer: 'benar' | 'salah') => {
    if (!simSession) return;
    const activeSub = SUBTESTS_CONFIG[simCurrentSubtestIndex];
    const qList = [...(simAllSubtestsQuestions[activeSub.key] || [])];
    const currentQ = qList[simCurrentQuestionIndex];

    currentQ.userAnswer = answer;
    const gainedImpact = answer === 'benar' ? currentQ.irtImpact : 0;
    currentQ.impactEarned = gainedImpact;

    const nextQIdx = simCurrentQuestionIndex + 1;
    if (nextQIdx < activeSub.qCount) {
      setSimCurrentQuestionIndex(nextQIdx);
    } else {
      calculateAndAdvanceSubtest(qList);
    }
  };

  const calculateAndAdvanceSubtest = (qList: SimQuestion[]) => {
    if (!simSession) return;
    const activeSub = SUBTESTS_CONFIG[simCurrentSubtestIndex];

    let correct = 0;
    let wrong = 0;
    let irtEarned = 0;
    let totalIrtMax = 0;

    qList.forEach(q => {
      if (q.userAnswer === 'benar') {
        correct++;
        irtEarned += q.irtImpact;
      } else {
        wrong++;
      }
      totalIrtMax += q.irtImpact;
    });

    const theta = estimateTheta(qList);
    const score = calculateSnbtIrtScore(theta);

    const result: SimSubtestResult = {
      key: activeSub.key,
      name: activeSub.name,
      correct,
      wrong,
      irtEarned,
      totalIrtMax,
      theta,
      score
    };

    const newResults = [...simSubtestResults, result];
    setSimSubtestResults(newResults);

    const nextSubtestIdx = simCurrentSubtestIndex + 1;
    if (nextSubtestIdx < SUBTESTS_CONFIG.length) {
      setSimCurrentSubtestIndex(nextSubtestIdx);
    } else {
      finishSimulation(newResults);
    }
  };

  const finishSimulation = (results: SimSubtestResult[]) => {
    if (!simSession) return;

    const totalCorrect = results.reduce((sum, r) => sum + r.correct, 0);
    const totalWrong = results.reduce((sum, r) => sum + r.wrong, 0);
    const totalIrtEarned = results.reduce((sum, r) => sum + r.irtEarned, 0);
    const totalIrtMax = results.reduce((sum, r) => sum + r.totalIrtMax, 0);

    const sumScores = results.reduce((sum, r) => sum + r.score, 0);
    const snbtScore = Math.round(sumScores / 7.0);

    const finalResult: SavedSimResult = {
      sessionId: simSession.id,
      meanDifficulty: simSession.meanDifficulty,
      meanDiscrimination: simSession.meanDiscrimination,
      timestamp: new Date().toLocaleDateString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      totalCorrect,
      totalWrong,
      totalIrtEarned,
      totalIrtMax,
      snbtScore,
      subtests: results,
      questionsBySubtest: simAllSubtestsQuestions
    };

    localStorage.setItem('last_snbt_simulation_result', JSON.stringify(finalResult));
    setSimLastSavedResult(finalResult);

    const newScores: UserUtbkScores = {
      pu: results.find(r => r.key === 'pu')?.score || 600,
      ppu: results.find(r => r.key === 'ppu')?.score || 600,
      pbm: results.find(r => r.key === 'pbm')?.score || 600,
      pk: results.find(r => r.key === 'pk')?.score || 600,
      litIndo: results.find(r => r.key === 'litIndo')?.score || 600,
      litIng: results.find(r => r.key === 'litIng')?.score || 600,
      pm: results.find(r => r.key === 'pm')?.score || 600,
    };

    setScores(newScores);
    if (onScoresChange) onScoresChange(newScores);

    setSimState('results');
  };

  const resetSavedScore = () => {
    localStorage.removeItem('last_snbt_simulation_result');
    setSimLastSavedResult(null);
  };

  // Update a subtest score
  const handleScoreChange = (key: keyof UserUtbkScores, val: number) => {
    const updated = { ...scores, [key]: val };
    setScores(updated);
    if (onScoresChange) onScoresChange(updated);
  };

  const handleSubmitScores = () => {
    setIsSubmitted(true);
    setSubmittedAt(new Date());
  };

  // Choice counts
  const s1Count = useMemo(() => selectedChoices.filter(c => c.degree === 'S1').length, [selectedChoices]);
  const d4Count = useMemo(() => selectedChoices.filter(c => c.degree === 'D4').length, [selectedChoices]);
  const totalCount = selectedChoices.length;

  const canAddS1 = s1Count < 10;
  const canAddD4 = d4Count < 5;
  const canAddMore = totalCount < 15;

  const handleAddChoice = (major: UndipMajor) => {
    if (selectedChoices.some(c => c.id === major.id)) return;
    if (major.degree === 'S1' && !canAddS1) return;
    if (major.degree === 'D4' && !canAddD4) return;
    if (!canAddMore) return;
    setSelectedChoices(prev => [...prev, major]);
  };

  const handleRemoveChoice = (id: string) => {
    setSelectedChoices(prev => prev.filter(c => c.id !== id));
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    setSelectedChoices(prev => {
      const next = [...prev];
      const temp = next[index - 1];
      next[index - 1] = next[index];
      next[index] = temp;
      return next;
    });
  };

  const handleMoveDown = (index: number) => {
    if (index === selectedChoices.length - 1) return;
    setSelectedChoices(prev => {
      const next = [...prev];
      const temp = next[index + 1];
      next[index + 1] = next[index];
      next[index] = temp;
      return next;
    });
  };

  // Mean score
  const scoreValues = Object.values(scores);
  const rawMeanScore = scoreValues.reduce((a, b) => a + b, 0) / 7;
  const rawMeanPP = scoreToOsuPP(rawMeanScore);

  // Evaluate choices according to SNBT 2030 national ranking rule:
  // Evaluated sequentially from Choice 1 to 15. The first choice meeting passing grade locks in!
  const simulationResults = useMemo(() => {
    let acceptedChoiceIndex: number | null = null;
    let acceptedMajor: UndipMajor | null = null;

    const evaluatedChoices = selectedChoices.map((major, idx) => {
      const clusterCalc = calculateClusterScoreAndPP(scores, major.cluster);
      const userWeightedScore = clusterCalc.finalScore;
      const userPP = clusterCalc.pp;
      const scoreDiff = userWeightedScore - major.passingScore;
      const ppDiff = userPP - major.passingPP;
      // Passing grade ditentukan berdasarkan PP bukan rata-rata
      const isQualified = userPP >= major.passingPP;

      let isLockedAsAccepted = false;
      if (isQualified && acceptedChoiceIndex === null) {
        acceptedChoiceIndex = idx;
        acceptedMajor = major;
        isLockedAsAccepted = true;
      }

      // Status chance berdasarkan selisih PP terhadap passing grade PP
      let status: 'accepted' | 'high' | 'medium' | 'low';
      if (isLockedAsAccepted) {
        status = 'accepted';
      } else if (ppDiff >= 0) {
        status = 'high';
      } else if (ppDiff >= -25) {
        status = 'medium';
      } else {
        status = 'low';
      }

      return {
        priority: idx + 1,
        major,
        userWeightedScore,
        userPP,
        clusterCalc,
        scoreDiff,
        ppDiff,
        isQualified,
        isLockedAsAccepted,
        status
      };
    });

    return {
      evaluatedChoices,
      acceptedChoiceIndex,
      acceptedMajor
    };
  }, [selectedChoices, scores]);

  // Filtered directory list
  const filteredMajors = useMemo(() => {
    return activeMajors.filter(m => {
      const matchesSearch = searchTerm === '' || 
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.departmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.facultyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        CLUSTER_WEIGHTS[m.cluster]?.name.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFaculty = facultyFilter === 'all' || m.facultyId === facultyFilter;
      const matchesDegree = degreeFilter === 'all' || m.degree === degreeFilter;
      const matchesCluster = clusterFilter === 'all' || m.cluster === clusterFilter;

      return matchesSearch && matchesFaculty && matchesDegree && matchesCluster;
    });
  }, [activeMajors, searchTerm, facultyFilter, degreeFilter, clusterFilter]);

  return (
    <div className="space-y-8 text-slate-100">
      {/* HEADER: MASTER REKAPITULASI DATA DAYA TAMPUNG 2030 */}
      <div className="relative p-6 sm:p-8 rounded-3xl border border-white/10 bg-black/60 backdrop-blur-xl shadow-2xl overflow-hidden">
        <div className="absolute -top-32 -left-32 w-64 h-64 rounded-full bg-blue-600/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-64 h-64 rounded-full bg-emerald-600/20 blur-3xl pointer-events-none" />

        {/* Top Title Section with University switcher */}
        <div className="relative z-10 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6 border-b border-white/10 pb-6 mb-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1.5">
                {univ === 'undip' ? <Building2 className="w-3 h-3 text-blue-400" /> : <GraduationCap className="w-3 h-3 text-rose-400" />}
                {univ === 'undip' ? 'UNIVERSITAS DIPONEGORO' : 'INSTITUT TEKNOLOGI BANDUNG'}
              </span>
              <span className="px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                SNBT 2030 (ATURAN BARU)
              </span>
              <span className="px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30">
                {activeMetadata.grandTotal.toLocaleString('id-ID')} KURSI TOTAL
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
              Simulator Seleksi SNBT 2030 & Master Daya Tampung {univ === 'undip' ? 'UNDIP' : 'ITB'}
            </h2>
          </div>

          {/* University Selector Button Group */}
          <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-white/5 border border-white/10 w-full sm:w-auto self-stretch sm:self-auto shrink-0">
            <button
              onClick={() => setUniv('undip')}
              className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                univ === 'undip'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 ring-1 ring-blue-400/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Building2 className="w-4 h-4" />
              UNDIP (Semarang)
            </button>
            <button
              onClick={() => setUniv('itb')}
              className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                univ === 'itb'
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30 ring-1 ring-rose-400/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              ITB (Bandung)
            </button>
          </div>
        </div>

        <div className="relative z-10 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6">
          <p className="text-xs sm:text-sm font-medium text-slate-400 max-w-3xl leading-relaxed">
            Metadata Kebijakan Nasional: Peserta mengikuti ujian UTBK terlebih dahulu → Nilai resmi keluar → Pemilihan prodi (Maksimal 10 S1 & 5 D4 = 15 Pilihan). Sistem secara otomatis merangking nilai peserta terhadap daya tampung program studi yang dikunci.
          </p>

          {/* Quick Sub-navigation */}
          <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-2xl bg-white/5 border border-white/10 self-stretch sm:self-auto w-full xl:w-auto">
            <button
              onClick={() => setActiveTab('simulation')}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                activeTab === 'simulation'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Gamepad2 className="w-3.5 h-3.5" />
              Simulator & 15 Pilihan
            </button>
            <button
              onClick={() => setActiveTab('exam_sim')}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                activeTab === 'exam_sim'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-600/30 ring-1 ring-purple-400/50'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Dices className="w-3.5 h-3.5" />
              Simulasi Ujian Real-Time
            </button>
            <button
              onClick={() => setActiveTab('directory')}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                activeTab === 'directory'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Katalog {activeMetadata.grandTotal.toLocaleString('id-ID')} Kursi
            </button>
            <button
              onClick={() => setActiveTab('rules')}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                activeTab === 'rules'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Panduan Jalur Masuk
            </button>
          </div>
        </div>

        {/* 4 Grand Summary Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/10">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Daya Tampung</span>
            <div className="text-2xl sm:text-3xl font-black text-white font-mono">{activeMetadata.grandTotal.toLocaleString('id-ID')}</div>
            <p className="text-[10px] text-slate-400 font-medium">100% Target Kapasitas Final</p>
          </div>

          <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-300 font-mono">SNBP (20%)</span>
            <div className="text-2xl sm:text-3xl font-black text-blue-400 font-mono">{activeMetadata.snbpTotal.toLocaleString('id-ID')}</div>
            <p className="text-[10px] text-blue-300/80 font-medium">Alokasi Prestasi Rapor</p>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-1 ring-1 ring-emerald-500/40">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-300 font-mono">SNBT ({univ === 'undip' ? '30%' : '40%'})</span>
              <span className="px-1.5 py-0.5 rounded text-[8px] font-black bg-emerald-500 text-slate-950 uppercase">Simulator Ini</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">{activeMetadata.snbtTotal.toLocaleString('id-ID')}</div>
            <p className="text-[10px] text-emerald-300/80 font-medium">Alokasi Tes UTBK Nasional</p>
          </div>

          <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-purple-300 font-mono">Mandiri ({univ === 'undip' ? '50%' : '40%'})</span>
            <div className="text-2xl sm:text-3xl font-black text-purple-400 font-mono">{activeMetadata.mandiriTotal.toLocaleString('id-ID')}</div>
            <p className="text-[10px] text-purple-300/80 font-medium">Alokasi Jalur Mandiri {univ === 'undip' ? 'UNDIP' : 'ITB'}</p>
          </div>
        </div>

        {/* Disclaimer & Pathway Context Banner */}
        <div className="mt-4 p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-300">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <Scale className="w-4 h-4" />
            </div>
            <span>
              <strong>Perhatian Jalur Seleksi:</strong> Simulator dan kalkulasi passing grade di bawah <strong>khusus untuk jalur SNBT 2030 (Tes UTBK)</strong>. Untuk rincian lengkap jalur SNBP (Prestasi) dan Ujian Mandiri di {univ === 'undip' ? 'UNDIP' : 'ITB'}, buka tab <strong>Panduan Jalur Masuk</strong>.
            </span>
          </div>
          <button
            onClick={() => setActiveTab('rules')}
            className="shrink-0 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-emerald-300 hover:text-emerald-200 border border-white/10 text-[11px] font-bold flex items-center gap-1.5 transition-all self-end sm:self-auto"
          >
            Pelajari Semua Jalur
            <BookOpen className="w-3 h-3" />
          </button>
        </div>
      </div>

      {activeTab === 'simulation' && (
        <div className="space-y-8">
          {/* SECTION 1: OSU-PP STYLE UTBK 7 SUBTEST SLIDERS */}
          <div className="p-6 sm:p-8 rounded-3xl border border-white/10 bg-black/50 backdrop-blur-xl shadow-2xl space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/10 pb-5">
              <div className="space-y-1">
                <h3 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-pink-500" />
                  SLIDER NILAI 7 SUBTES UTBK-SNBT (OSU! STYLE)
                </h3>
                <p className="text-xs font-medium text-slate-400">
                  Geser nilai setiap subtes (275 - 1000). Bobot PP jurusan disesuaikan otomatis berdasarkan rumpun program studi pilihan Anda.
                </p>
              </div>
            </div>

            {/* Subtests Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[
                { key: 'pu', label: 'PU (Penalaran Umum)', code: 'PU', color: 'accent-blue-500', desc: 'Logika deduktif & induktif' },
                { key: 'pbm', label: 'PBM (Pemahaman Bacaan & Menulis)', code: 'PBM', color: 'accent-indigo-500', desc: 'Ejaan & kohesi teks' },
                { key: 'ppu', label: 'PPU (Pengetahuan & Pemahaman Umum)', code: 'PPU', color: 'accent-purple-500', desc: 'Kosakata & analogi makna' },
                { key: 'pk', label: 'PK (Pengetahuan Kuantitatif)', code: 'PK', color: 'accent-emerald-500', desc: 'Matematika dasar & aritmetika' },
                { key: 'litIndo', label: 'Literasi Bahasa Indonesia', code: 'LIT-ID', color: 'accent-amber-500', desc: 'Analisis teks sastra & opini' },
                { key: 'litIng', label: 'Literasi Bahasa Inggris', code: 'LIT-EN', color: 'accent-rose-500', desc: 'Critical reading global' },
                { key: 'pm', label: 'PM (Penalaran Matematika)', code: 'PM', color: 'accent-teal-500', desc: 'Model matematis kontekstual' },
              ].map((sub) => {
                const val = scores[sub.key as keyof UserUtbkScores];
                return (
                  <div 
                    key={sub.key} 
                    className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/15 transition-all space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-200">{sub.code}</span>
                      <span className="px-2 py-0.5 rounded bg-white/10 text-white font-mono font-black text-xs">
                        {val}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium truncate" title={sub.label}>
                      {sub.label}
                    </div>
                    <input
                      type="range"
                      min={275}
                      max={1000}
                      step={1}
                      value={val}
                      onChange={(e) => handleScoreChange(sub.key as keyof UserUtbkScores, parseInt(e.target.value))}
                      className={`w-full cursor-pointer h-2 bg-slate-900 rounded-lg outline-none transition-all ${sub.color}`}
                    />
                    <div className="flex justify-between items-center text-[9px] text-slate-500 font-mono">
                      <span>275</span>
                      <span>Z: {((val - 500) / 105).toFixed(2)}</span>
                      <span>1000</span>
                    </div>
                  </div>
                );
              })}

              {/* Rerata Summary Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-blue-500/10 border border-pink-500/20 flex flex-col justify-between space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-pink-300">Rerata UTBK</span>
                  <div className="p-1.5 rounded-lg bg-pink-500/20 text-pink-300">
                    <Zap className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-black text-white font-mono">
                    {rawMeanScore.toFixed(1)}
                  </div>
                  <div className="text-xs font-bold text-pink-300 font-mono">
                    ≈ {Math.round(rawMeanPP)} pp
                  </div>
                </div>
                <button
                  onClick={handleSubmitScores}
                  className="w-full py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-pink-600 hover:bg-pink-500 text-white shadow-lg shadow-pink-600/30 flex items-center justify-center gap-1.5 transition-all active:scale-95"
                >
                  <Check className="w-3.5 h-3.5" />
                  {isSubmitted ? 'Nilai Telah Dikunci' : 'Kunci & Submit Nilai'}
                </button>
              </div>
            </div>
          </div>

          {/* SECTION 2: 15 PILIHAN MAHASISWA & SIMULASI KELULUSAN OTOMATIS */}
          <div className="p-6 sm:p-8 rounded-3xl border border-white/10 bg-black/50 backdrop-blur-xl shadow-2xl space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/10 pb-5">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-amber-400" />
                    15 PILIHAN PROGRAM STUDI SNBT 2030 (ATURAN BARU)
                  </h3>
                </div>
                <p className="text-xs font-medium text-slate-400">
                  Prioritas disusun berurutan (#1 hingga #15). Sistem seleksi nasional akan mengunci kelulusan pada pilihan prioritas tertinggi yang memenuhi passing grade daya tampung.
                </p>
              </div>

              {/* Counter Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <div className={`px-3 py-1.5 rounded-xl border text-xs font-black font-mono flex items-center gap-1.5 ${
                  s1Count > 10 ? 'bg-rose-500/20 border-rose-500 text-rose-300' : 'bg-white/5 border-white/10 text-slate-200'
                }`}>
                  <span>Sarjana S1:</span>
                  <span className={s1Count === 10 ? 'text-amber-400' : 'text-blue-400'}>{s1Count}/10</span>
                </div>

                <div className={`px-3 py-1.5 rounded-xl border text-xs font-black font-mono flex items-center gap-1.5 ${
                  d4Count > 5 ? 'bg-rose-500/20 border-rose-500 text-rose-300' : 'bg-white/5 border-white/10 text-slate-200'
                }`}>
                  <span>Vokasi D4:</span>
                  <span className={d4Count === 5 ? 'text-amber-400' : 'text-emerald-400'}>{d4Count}/5</span>
                </div>

                <div className="px-3 py-1.5 rounded-xl border bg-blue-500/10 border-blue-500/30 text-blue-300 text-xs font-black font-mono">
                  Total: {totalCount}/15
                </div>
              </div>
            </div>

            {/* AUTOMATIC PASSING BANNER */}
            {simulationResults.acceptedMajor ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/70 via-teal-950/60 to-slate-900 border border-emerald-500/40 shadow-xl space-y-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black tracking-widest uppercase text-emerald-400 block">
                      HASIL SIMULASI SISTEM SELEKSI NASIONAL SNBT 2030
                    </span>
                    <h4 className="text-base sm:text-lg font-black text-white">
                      🎉 SELAMAT! ANDA LOLOS DI PILIHAN #{simulationResults.acceptedChoiceIndex! + 1}: {simulationResults.acceptedMajor.name}
                    </h4>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                    <span className="text-[9px] uppercase tracking-wider text-slate-400 block">Daya Tampung SNBT</span>
                    <strong className="text-emerald-400 font-mono text-sm">{simulationResults.acceptedMajor.snbtSeats} Kursi</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                    <span className="text-[9px] uppercase tracking-wider text-slate-400 block">PP Terbobot Anda</span>
                    <strong className="text-pink-400 font-mono text-sm">
                      {Math.round(calculateClusterScoreAndPP(scores, simulationResults.acceptedMajor.cluster).pp)} pp
                    </strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                    <span className="text-[9px] uppercase tracking-wider text-slate-400 block">Passing Cutoff PP</span>
                    <strong className="text-pink-300 font-mono text-sm">{simulationResults.acceptedMajor.passingPP} pp</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                    <span className="text-[9px] uppercase tracking-wider text-slate-400 block">Skor Bobot UTBK</span>
                    <strong className="text-white font-mono text-sm">
                      {calculateClusterScoreAndPP(scores, simulationResults.acceptedMajor.cluster).finalScore.toFixed(1)}
                    </strong>
                  </div>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
                  Sesuai aturan resmi SNBT 2030, karena Anda berhasil menduduki peringkat aman pada Pilihan #{simulationResults.acceptedChoiceIndex! + 1}, pilihan di bawahnya (Pilihan #{simulationResults.acceptedChoiceIndex! + 2} s.d #{totalCount}) secara otomatis digugurkan dari evaluasi seleksi.
                </p>
              </motion.div>
            ) : totalCount > 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-5 rounded-2xl bg-gradient-to-r from-rose-950/50 via-slate-900 to-slate-900 border border-rose-500/30 space-y-2"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-rose-300 uppercase tracking-wide">
                      BELUM MEMENUHI PASSING GRADE PP DARI {totalCount} PILIHAN YANG DIKUNCI
                    </h4>
                    <p className="text-xs text-slate-400">
                      Nilai PP (Performance Points) terbobot Anda saat ini masih berada di bawah passing grade PP program studi yang Anda pilih. Coba naikkan slider subtes Anda atau tambahkan program studi dengan passing grade PP lebih ramah dari katalog 17.000 kursi di bawah.
                    </p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="p-8 rounded-2xl border border-dashed border-white/10 text-center space-y-3">
                <Compass className="w-10 h-10 mx-auto text-slate-500" />
                <p className="text-sm font-bold text-slate-400">
                  Belum ada jurusan yang dipilih. Pilih hingga 10 Program Sarjana (S1) dan 5 Program Vokasi (D4) dari katalog di bawah.
                </p>
              </div>
            )}

            {/* List of Ordered Choices */}
            <div className="space-y-3">
              {simulationResults.evaluatedChoices.map((item, idx) => {
                const { major, userWeightedScore, userPP, scoreDiff, ppDiff, isLockedAsAccepted, isQualified } = item;
                const clusterInfo = CLUSTER_WEIGHTS[major.cluster];
                const badgeStyle = getClusterBadgeStyle(major.cluster);
                const highlightText = getClusterHighlightText(major.cluster);
                const isWeightExpanded = expandedMajorWeight === major.id;

                return (
                  <motion.div
                    key={major.id}
                    layoutId={`choice-${major.id}`}
                    className={`p-4 rounded-2xl border transition-all ${
                      isLockedAsAccepted
                        ? 'bg-emerald-500/10 border-emerald-500/40 shadow-lg shadow-emerald-500/10'
                        : 'bg-white/[0.03] border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Left: Rank & Major Info */}
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-xl font-black font-mono flex items-center justify-center text-sm shrink-0 ${
                          isLockedAsAccepted ? 'bg-emerald-500 text-slate-950 font-black ring-2 ring-emerald-400' : 'bg-white/10 text-slate-300'
                        }`}>
                          #{item.priority}
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-black text-white">
                              {major.name}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase font-mono ${
                              major.id.startsWith('itb-') ? 'bg-rose-500/20 text-rose-300' : 'bg-blue-500/20 text-blue-300'
                            }`}>
                              {major.degree}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase font-mono ${
                              major.id.startsWith('itb-') ? 'bg-rose-600/30 text-rose-200 border border-rose-500/30' : 'bg-blue-600/30 text-blue-200 border border-blue-500/30'
                            }`}>
                              {major.id.startsWith('itb-') ? 'ITB' : 'UNDIP'}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              • {major.facultyName}
                            </span>
                          </div>

                          {/* Cluster & Weighting Badges */}
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border flex items-center gap-1 ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}>
                              <span>{clusterInfo?.icon}</span>
                              <span>{clusterInfo?.name}</span>
                            </span>
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-white/5 text-amber-300 border border-amber-500/20">
                              Bobot: {highlightText}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                            <span>Daya Tampung SNBT: <strong className="text-white font-mono">{major.snbtSeats} Kursi</strong></span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-pink-500/15 border border-pink-500/30 text-pink-300 font-mono font-bold text-[10px]">
                              <Gamepad2 className="w-3 h-3" />
                              Passing Grade: {major.passingPP} pp
                            </span>
                            <span>(Estimasi UTBK: <strong className="text-slate-300 font-mono">{major.passingScore}</strong>)</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Scores & Controls */}
                      <div className="flex items-center justify-between lg:justify-end gap-4 border-t lg:border-t-0 pt-3 lg:pt-0 border-white/5">
                        {/* Score display */}
                        <div className="text-right">
                          <div className="text-[9px] uppercase font-bold text-slate-400">Evaluasi Passing Grade PP</div>
                          <div className="flex items-center gap-1.5 justify-end">
                            <span className={`text-base font-black font-mono ${isQualified ? 'text-emerald-400' : 'text-slate-200'}`}>
                              {Math.round(userPP)} pp
                            </span>
                            <span className="text-xs font-mono text-slate-400">
                              / {major.passingPP} pp
                            </span>
                          </div>
                          <div className="text-[10px] font-mono flex items-center justify-end gap-1.5">
                            <span className="text-slate-400 font-medium">Skor: {userWeightedScore.toFixed(1)}</span>
                            <span className={`font-black ${ppDiff >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                              ({ppDiff >= 0 ? '+' : ''}{Math.round(ppDiff)} pp)
                            </span>
                          </div>
                        </div>

                        {/* Reordering & Delete Controls */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setExpandedMajorWeight(isWeightExpanded ? null : major.id)}
                            className={`p-2 rounded-xl text-xs transition-all ${
                              isWeightExpanded ? 'bg-white/20 text-white' : 'bg-white/5 text-slate-400 hover:text-white'
                            }`}
                            title="Lihat Rincian Kontribusi 7 Subtes"
                          >
                            <Info className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleMoveUp(idx)}
                            disabled={idx === 0}
                            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                            title="Naikkan Prioritas"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleMoveDown(idx)}
                            disabled={idx === selectedChoices.length - 1}
                            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                            title="Turunkan Prioritas"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleRemoveChoice(major.id)}
                            className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-all ml-1"
                            title="Hapus dari Pilihan"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Weight Breakdown Accordion */}
                    <AnimatePresence>
                      {isWeightExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-3 pt-3 border-t border-white/5 text-xs space-y-2 overflow-hidden"
                        >
                          <div className="flex items-center justify-between text-[11px] text-slate-400">
                            <span>Formula Bobot Rumpun: <strong className="text-white">{clusterInfo?.name}</strong></span>
                            <span>Passing Grade PP: <strong className="text-pink-400 font-mono">{major.passingPP} pp</strong></span>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                            {Object.entries(clusterInfo.weights).map(([k, weight]) => {
                              const subScore = scores[k as keyof UserUtbkScores];
                              const contrib = subScore * weight;
                              return (
                                <div key={k} className="p-2 rounded-lg bg-black/40 border border-white/5 space-y-0.5">
                                  <div className="text-[9px] uppercase tracking-wider text-slate-400 flex justify-between">
                                    <span>{k.toUpperCase()}</span>
                                    <span className="text-pink-300 font-bold">{Math.round(weight * 100)}%</span>
                                  </div>
                                  <div className="text-xs font-mono font-bold text-white">
                                    {subScore}
                                  </div>
                                  <div className="text-[9px] text-emerald-400 font-mono">
                                    +{contrib.toFixed(1)}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: DIRECTORY OF ALL 17.000 SEATS */}
      {(activeTab === 'directory' || activeTab === 'simulation') && (
        <div className="p-6 sm:p-8 rounded-3xl border border-white/10 bg-black/50 backdrop-blur-xl shadow-2xl space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/10 pb-5">
            <div>
              <h3 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-5 h-5 text-blue-500" />
                KATALOG MASTER DAYA TAMPUNG {activeMetadata.grandTotal.toLocaleString('id-ID')} KURSI {univ === 'undip' ? 'UNDIP' : 'ITB'}
              </h3>
              <p className="text-xs font-medium text-slate-400">
                Cari dan klik tombol &quot;+ Tambah ke Pilihan&quot; untuk memasukkan prodi ke dalam 15 pilihan SNBT 2030 Anda.
              </p>
            </div>

            {/* Degree Filter Switcher */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-white/5 border border-white/10">
              <button
                onClick={() => setDegreeFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  degreeFilter === 'all' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Semua Jenjang
              </button>
              <button
                onClick={() => setDegreeFilter('S1')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  degreeFilter === 'S1' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Hanya S1
              </button>
              <button
                onClick={() => setDegreeFilter('D4')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  degreeFilter === 'D4' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Hanya D4 Vokasi
              </button>
            </div>
          </div>

          {/* Search, Faculty & Cluster Filters */}
          <div className="flex flex-col md:flex-row gap-3 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Cari program studi, departemen, fakultas, atau kata kunci rumpun..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-white text-xs outline-none transition-all placeholder:text-slate-500"
              />
            </div>

            <select
              value={facultyFilter}
              onChange={(e) => setFacultyFilter(e.target.value)}
              className="w-full md:w-56 px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-white text-xs outline-none focus:border-blue-500 transition-all font-bold"
            >
              <option value="all" className="bg-slate-950 text-white">Semua Unit ({activeFaculties.length} Pilihan)</option>
              {activeFaculties.map(f => (
                <option key={f.id} value={f.id} className="bg-slate-950 text-white">
                  {f.shortName} - {f.name} ({f.totalSeats.toLocaleString()} Kursi)
                </option>
              ))}
            </select>

            <select
              value={clusterFilter}
              onChange={(e) => setClusterFilter(e.target.value)}
              className="w-full md:w-56 px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-white text-xs outline-none focus:border-blue-500 transition-all font-bold"
            >
              <option value="all" className="bg-slate-950 text-white">Semua Rumpun PP (5 Tipe Simulator)</option>
              {Object.values(CLUSTER_WEIGHTS).map(c => (
                <option key={c.id} value={c.id} className="bg-slate-950 text-white">
                  {c.icon} {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Faculty Groups Accordion / Grid */}
          <div className="space-y-6">
            {activeFaculties.filter(f => facultyFilter === 'all' || f.id === facultyFilter).map(faculty => {
              const facultyMajors = filteredMajors.filter(m => m.facultyId === faculty.id);
              if (facultyMajors.length === 0) return null;

              const isExpanded = expandedFaculty[faculty.id] ?? true;

              return (
                <div key={faculty.id} className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
                  <div
                    onClick={() => setExpandedFaculty(prev => ({ ...prev, [faculty.id]: !prev[faculty.id] }))}
                    className="p-4 bg-white/5 hover:bg-white/10 flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Building2 className="w-5 h-5 text-blue-400" />
                      <div>
                        <h4 className="text-sm font-black text-white uppercase tracking-wider">
                          {faculty.name} ({faculty.shortName})
                        </h4>
                        <p className="text-[10px] text-slate-400 font-medium">
                          Total Alokasi: {faculty.totalSeats.toLocaleString('id-ID')} Kursi
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono font-black text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-lg border border-blue-500/20">
                        {facultyMajors.length} Prodi
                      </span>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </div>
                  </div>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="p-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
                      >
                        {facultyMajors.map(major => {
                          const isSelected = selectedChoices.some(c => c.id === major.id);
                          const clusterCalc = calculateClusterScoreAndPP(scores, major.cluster);
                          const userWeightedScore = clusterCalc.finalScore;
                          const userPP = clusterCalc.pp;
                          const isQualified = userPP >= major.passingPP;
                          const ppDiff = userPP - major.passingPP;
                          const clusterInfo = CLUSTER_WEIGHTS[major.cluster];
                          const badgeStyle = getClusterBadgeStyle(major.cluster);
                          const highlightText = getClusterHighlightText(major.cluster);
                          const isWeightExpanded = expandedMajorWeight === `dir-${major.id}`;

                          const canAddThis = major.degree === 'S1' ? canAddS1 : canAddD4;

                          return (
                            <div
                              key={major.id}
                              className={`p-4 rounded-xl border transition-all flex flex-col justify-between space-y-3 ${
                                isSelected
                                  ? 'bg-blue-500/10 border-blue-500/30'
                                  : 'bg-black/40 border-white/5 hover:border-white/20'
                              }`}
                            >
                              <div className="space-y-2.5">
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <span className="text-[9px] font-mono uppercase text-slate-400 block truncate">
                                      {major.departmentName}
                                    </span>
                                    <h5 className="text-sm font-black text-white">
                                      {major.name}
                                    </h5>
                                  </div>
                                  <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase font-mono shrink-0 ${
                                    major.degree === 'S1' ? 'bg-blue-500/20 text-blue-300' : 'bg-emerald-500/20 text-emerald-300'
                                  }`}>
                                    {major.degree}
                                  </span>
                                </div>

                                {/* Cluster & Weighting Badge */}
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border flex items-center gap-1 ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}>
                                    <span>{clusterInfo?.icon}</span>
                                    <span>{clusterInfo?.name}</span>
                                  </span>
                                  <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-white/5 text-amber-300 border border-amber-500/20">
                                    Bobot: {highlightText}
                                  </span>
                                </div>

                                {/* Quota Breakdown Pill */}
                                <div className="p-2.5 rounded-xl bg-white/5 text-[10px] space-y-1 border border-white/5">
                                  <div className="flex justify-between items-center text-slate-300 font-medium">
                                    <span>Kapasitas Total: <strong className="text-white font-mono">{major.totalSeats}</strong></span>
                                    <span>SNBT ({univ === 'undip' ? '30%' : '40%'}): <strong className="text-emerald-400 font-mono">{major.snbtSeats} Kursi</strong></span>
                                  </div>
                                  <div className="flex justify-between items-center text-slate-400 text-[9px]">
                                    <span>Jalur SNBP (20%): {major.snbpSeats}</span>
                                    <span>Jalur Mandiri ({univ === 'undip' ? '50%' : '40%'}): {major.mandiriSeats}</span>
                                  </div>
                                </div>

                                {/* Passing Grade & Calculated Simulation */}
                                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-white/5">
                                  <div>
                                    <span className="text-[9px] uppercase font-bold text-slate-400 block">Passing Grade PP</span>
                                    <div className="flex items-center gap-1.5 font-mono font-black">
                                      <span className="px-2 py-0.5 rounded bg-pink-500/20 border border-pink-500/40 text-pink-300 text-xs">
                                        {major.passingPP} pp
                                      </span>
                                      <span className="text-slate-400 text-[10px]">
                                        (~{major.passingScore})
                                      </span>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <span className="text-[9px] uppercase font-bold text-slate-400 block">PP Terbobot Kamu</span>
                                    <div className="flex items-center justify-end gap-1 font-mono font-black">
                                      <span className={isQualified ? 'text-emerald-400' : 'text-slate-300'}>
                                        {Math.round(userPP)} pp
                                      </span>
                                      <span className={`text-[10px] ${ppDiff >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                        ({ppDiff >= 0 ? '+' : ''}{Math.round(ppDiff)} pp)
                                      </span>
                                    </div>
                                    <span className="text-[10px] font-mono text-slate-400 block font-medium">Skor: {userWeightedScore.toFixed(1)}</span>
                                  </div>
                                </div>

                                {/* Subtest Weight Formula Preview Toggle */}
                                <button
                                  type="button"
                                  onClick={() => setExpandedMajorWeight(isWeightExpanded ? null : `dir-${major.id}`)}
                                  className="w-full py-1 text-[10px] font-bold text-slate-400 hover:text-white flex items-center justify-center gap-1 transition-colors"
                                >
                                  <Info className="w-3 h-3" />
                                  {isWeightExpanded ? 'Tutup Rincian Bobot' : 'Lihat Formula Bobot Subtes'}
                                </button>

                                <AnimatePresence>
                                  {isWeightExpanded && (
                                    <motion.div
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: 'auto' }}
                                      exit={{ opacity: 0, height: 0 }}
                                      className="pt-2 border-t border-white/5 space-y-1.5 overflow-hidden"
                                    >
                                      <div className="grid grid-cols-4 gap-1">
                                        {Object.entries(clusterInfo.weights).map(([k, weight]) => {
                                          const subScore = scores[k as keyof UserUtbkScores];
                                          const contrib = subScore * weight;
                                          return (
                                            <div key={k} className="p-1 rounded bg-black/50 text-center text-[9px] border border-white/5">
                                              <div className="text-slate-400 uppercase font-mono">{k}</div>
                                              <div className="text-amber-300 font-bold">{Math.round(weight * 100)}%</div>
                                              <div className="text-emerald-400 font-mono text-[8px]">+{contrib.toFixed(0)}</div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>

                              {/* Add / Added Button */}
                              <div>
                                {isSelected ? (
                                  <button
                                    onClick={() => handleRemoveChoice(major.id)}
                                    className="w-full py-2 rounded-lg text-xs font-black uppercase tracking-wider bg-blue-600/30 text-blue-300 border border-blue-500/40 hover:bg-rose-500/20 hover:text-rose-300 hover:border-rose-500/30 transition-all flex items-center justify-center gap-1.5"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                    Pilihan #{selectedChoices.findIndex(c => c.id === major.id) + 1} (Hapus)
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleAddChoice(major)}
                                    disabled={!canAddMore || !canAddThis}
                                    className="w-full py-2 rounded-lg text-xs font-black uppercase tracking-wider bg-white/5 hover:bg-blue-600 hover:text-white text-slate-200 border border-white/10 hover:border-blue-500 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                    {canAddThis ? 'Tambah ke Pilihan' : `Batas ${major.degree} Penuh`}
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 4: OFFICIAL RULES & PATHWAY COMPARISON DOCUMENT */}
      {activeTab === 'rules' && (
        <div className="space-y-8">
          {/* Header Banner */}
          <div className="p-6 sm:p-8 rounded-3xl border border-white/10 bg-black/50 backdrop-blur-xl shadow-2xl space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30">
                PANDUAN LENGKAP JALUR MASUK
              </span>
              <span className="px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                FOKUS UTAMA: SNBT 2030
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
              Panduan Jalur Masuk PTN 2030: SNBT vs SNBP vs Mandiri
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-4xl leading-relaxed">
              Simulator pada aplikasi ini dikhususkan untuk <strong>Jalur SNBT (Seleksi Nasional Berdasarkan Tes)</strong> menggunakan kalkulasi nilai UTBK 7 subtes terbobot dan aturan baru perankingan 15 pilihan prodi. Namun untuk memberikan pemahaman utuh bagi calon mahasiswa, berikut adalah komparasi resmi seluruh jalur seleksi penerimaan mahasiswa baru di {univ === 'undip' ? 'Universitas Diponegoro (UNDIP)' : 'Institut Teknologi Bandung (ITB)'}.
            </p>
          </div>

          {/* 3 Jalur Penerimaan Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {activeMetadata.allPathways.map((p) => {
              const isSnbt = p.id === 'snbt';
              const isSnbp = p.id === 'snbp';
              const isMandiri = p.id === 'mandiri';

              return (
                <div
                  key={p.id}
                  className={`p-6 rounded-3xl border flex flex-col justify-between space-y-5 transition-all ${
                    isSnbt
                      ? 'bg-emerald-950/20 border-emerald-500/40 shadow-xl shadow-emerald-500/5 ring-1 ring-emerald-500/40'
                      : isSnbp
                      ? 'bg-blue-950/20 border-blue-500/30'
                      : 'bg-purple-950/20 border-purple-500/30'
                  }`}
                >
                  <div className="space-y-4">
                    {/* Badge & Title */}
                    <div className="flex items-center justify-between gap-2">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        isSnbt
                          ? 'bg-emerald-500 text-slate-950 font-black'
                          : isSnbp
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      }`}>
                        {isSnbt ? 'Fokus Simulator Ini' : p.id.toUpperCase()}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-400">
                        {p.quotaPercent} Kuota
                      </span>
                    </div>

                    <div>
                      <h4 className="text-lg font-black text-white">
                        {p.name}
                      </h4>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                        Alokasi {univ === 'undip' ? 'UNDIP' : 'ITB'}: <strong className="text-white">{p.seats.toLocaleString('id-ID')} Kursi</strong>
                      </p>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {p.tagline}
                    </p>

                    {/* Breakdown Attributes */}
                    <div className="space-y-3 pt-3 border-t border-white/10 text-xs">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                          Basis Penilaian
                        </span>
                        <p className="text-slate-200 mt-0.5 font-medium">
                          {p.basis}
                        </p>
                      </div>

                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                          Aturan Pemilihan Prodi
                        </span>
                        <p className="text-slate-200 mt-0.5 font-medium">
                          {p.choiceRules}
                        </p>
                      </div>

                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                          Konsekuensi & Sanksi
                        </span>
                        <p className={`mt-0.5 font-medium ${isSnbp ? 'text-rose-300 font-semibold' : 'text-slate-300'}`}>
                          {p.consequence}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Footer Tag */}
                  <div className={`p-3 rounded-2xl text-[11px] font-medium ${
                    isSnbt
                      ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                      : isSnbp
                      ? 'bg-blue-500/10 text-blue-300 border border-blue-500/20'
                      : 'bg-purple-500/10 text-purple-300 border border-purple-500/20'
                  }`}>
                    {isSnbt && '✓ Diuji menggunakan skor 7 subtes UTBK terbobot pada tab Simulator.'}
                    {isSnbp && '⚠️ Lulus SNBP dilarang mendaftar SNBT maupun Mandiri di PTN manapun.'}
                    {isMandiri && 'ℹ️ Dikenakan UKT + IPI/SPI (Sumbangan Pengembangan Institusi).'}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Aturan Baru SNBT 2030 (15 Pilihan & Alur Ujian) */}
          <div className="p-6 sm:p-8 rounded-3xl border border-white/10 bg-black/50 backdrop-blur-xl shadow-2xl space-y-6">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-lg font-black text-white uppercase tracking-tight">
                  Mekanisme Aturan Baru SNBT 2030
                </h4>
                <p className="text-xs text-slate-400">
                  Ujian terlebih dahulu → Nilai resmi keluar → Kunci 15 pilihan prodi → Perangkingan otomatis nasional
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2">
                <div className="w-7 h-7 rounded-xl bg-blue-500/20 text-blue-400 font-mono font-black text-xs flex items-center justify-center">
                  01
                </div>
                <h5 className="text-xs font-black text-white uppercase">Tes UTBK 7 Subtes</h5>
                <p className="text-[11px] text-slate-400">
                  Peserta menempuh ujian 7 subtes (PU, PBM, PPU, PK, Literasi Indonesia, Literasi Inggris, Penalaran Matematika).
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2">
                <div className="w-7 h-7 rounded-xl bg-indigo-500/20 text-indigo-400 font-mono font-black text-xs flex items-center justify-center">
                  02
                </div>
                <h5 className="text-xs font-black text-white uppercase">Sertifikat Nilai Rilis</h5>
                <p className="text-[11px] text-slate-400">
                  Siswa menerima sertifikat skor murni setiap subtes sebelum memilih kampus, sehingga tidak memilih jurusan secara buta.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2">
                <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 font-mono font-black text-xs flex items-center justify-center">
                  03
                </div>
                <h5 className="text-xs font-black text-white uppercase">Kunci 15 Pilihan</h5>
                <p className="text-[11px] text-slate-400">
                  Bebas mengunci hingga 10 program Sarjana (S1) dan 5 program Vokasi (D4) sesuai urutan prioritas tertinggi ke terendah.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2">
                <div className="w-7 h-7 rounded-xl bg-purple-500/20 text-purple-400 font-mono font-black text-xs flex items-center justify-center">
                  04
                </div>
                <h5 className="text-xs font-black text-white uppercase">Ranking Otomatis</h5>
                <p className="text-[11px] text-slate-400">
                  Sistem mengevaluasi pilihan dari no. 1 sampai 15. Begitu nilai Anda tembus daya tampung suatu prodi, pilihan tersebut langsung dikunci lolos!
                </p>
              </div>
            </div>
          </div>

          {/* Matriks Pembobotan 5 Tipe Rumpun PP Simulator */}
          <div className="p-6 sm:p-8 rounded-3xl border border-white/10 bg-black/50 backdrop-blur-xl shadow-2xl space-y-6">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-lg font-black text-white uppercase tracking-tight">
                  Matriks Pembobotan 5 Tipe Rumpun (Sesuai PP Simulator)
                </h4>
                <p className="text-xs text-slate-400">
                  5 tipe pembobotan rumpun standar PP Simulator (Teknik, Sosial, Kesehatan, Bisnis, Sastra) dengan bobot spesifik 7 subtes dan kalkulasi penalti kompetitif
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.values(CLUSTER_WEIGHTS).map((cluster) => {
                const badgeStyle = getClusterBadgeStyle(cluster.id as ProdiCluster);
                const highlightText = getClusterHighlightText(cluster.id as ProdiCluster);

                return (
                  <div
                    key={cluster.id}
                    className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border flex items-center gap-1 ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}>
                        <span>{cluster.icon}</span>
                        <span>{cluster.name}</span>
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-300">
                      {cluster.desc}
                    </p>

                    <div className="p-2 rounded-xl bg-black/40 text-[10px] space-y-1">
                      <span className="text-slate-400 block font-bold uppercase tracking-wider text-[9px]">Fokus Bobot Utama:</span>
                      <span className="font-mono text-amber-300 font-bold block">{highlightText}</span>
                    </div>

                    {/* All 7 Subtest Weights Chips */}
                    <div className="grid grid-cols-4 gap-1 text-[9px] font-mono">
                      {Object.entries(cluster.weights).map(([k, w]) => (
                        <div key={k} className="p-1 rounded bg-white/5 text-center">
                          <span className="text-slate-400 uppercase block">{k}</span>
                          <span className={w >= 0.2 ? 'text-emerald-400 font-bold' : 'text-slate-300'}>
                            {Math.round(w * 100)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* osu! Performance Points (PP) Explanation */}
          <div className="p-6 sm:p-8 rounded-3xl border border-white/10 bg-black/50 backdrop-blur-xl shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-pink-500/20 text-pink-400 border border-pink-500/30 flex items-center justify-center">
                <Gamepad2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-lg font-black text-white uppercase tracking-tight">
                  Mengapa Ada Skor &quot;osu! Performance Points (pp)&quot;?
                </h4>
                <p className="text-xs text-slate-400">
                  Standardisasi pemeringkatan performa kompetitif bagi calon mahasiswa
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Metrik <strong>osu! PP</strong> merupakan representasi non-linear yang mengkonversi nilai UTBK (skala 275–1000) menjadi skala kompetitif <em>performance points</em> layaknya game ritme <strong>osu!</strong>. Kurva eksponensial ini mencerminkan hukum penambahan usaha di level atas: menaikkan nilai dari 700 ke 750 jauh lebih sulit dibandingkan dari 500 ke 550.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-pink-500/10 border border-pink-500/20 space-y-1">
                <span className="text-[10px] font-bold text-pink-300 uppercase">Top Tier (Kedokteran / Informatika)</span>
                <div className="text-base font-black text-pink-400 font-mono">460 - 550+ pp</div>
                <p className="text-[10px] text-slate-400">UTBK ekuivalen 680 - 750+</p>
              </div>

              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 space-y-1">
                <span className="text-[10px] font-bold text-blue-300 uppercase">High Tier (Teknik / Manajemen / Hukum)</span>
                <div className="text-base font-black text-blue-400 font-mono">380 - 460 pp</div>
                <p className="text-[10px] text-slate-400">UTBK ekuivalen 630 - 680</p>
              </div>

              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-1">
                <span className="text-[10px] font-bold text-emerald-300 uppercase">Moderate / Safe Tier (Sains / Vokasi)</span>
                <div className="text-base font-black text-emerald-400 font-mono">280 - 380 pp</div>
                <p className="text-[10px] text-slate-400">UTBK ekuivalen 550 - 630</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 5: REAL-TIME EXAM SIMULATOR (IRT/RNG ENGINE) */}
      {activeTab === 'exam_sim' && (
        <div className="space-y-8">
          {/* STATE 1: DASHBOARD UTAMA */}
          {simState === 'dashboard' && (
            <div className="space-y-8">
              {/* Header Banner */}
              <div className="relative p-6 sm:p-8 rounded-3xl border border-white/10 bg-black/60 backdrop-blur-xl shadow-2xl overflow-hidden">
                <div className="absolute -top-32 -left-32 w-64 h-64 rounded-full bg-purple-600/20 blur-3xl pointer-events-none" />
                <div className="relative z-10 space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1.5">
                      <Dices className="w-3.5 h-3.5" />
                      MODEL METRIK IRT & RNG SESI
                    </span>
                    <span className="px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase bg-pink-500/20 text-pink-300 border border-pink-500/30">
                      NASIONAL 2030 COMPLIANT
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
                    Simulasi UTBK SNBT 2030 (Real-Time IRT)
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 max-w-4xl leading-relaxed">
                    Uji ketahanan Anda melewati <strong>160 soal</strong> terdistribusi dalam 7 subtes terstandarisasi. Simulator ini menerapkan pembobotan dinamis <em>Item Response Theory (IRT)</em> sesungguhnya, di mana setiap soal memiliki parameter daya beda (<em>discrimination &apos;a&apos;</em>) dan tingkat kesulitan (<em>difficulty &apos;b&apos;</em>) tersendiri.
                  </p>
                </div>
              </div>

              {/* Saved Result Display (if any) */}
              {simLastSavedResult ? (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 sm:p-8 rounded-3xl border border-purple-500/20 bg-purple-950/20 backdrop-blur-xl shadow-2xl grid grid-cols-1 md:grid-cols-3 gap-6 items-center"
                >
                  <div className="space-y-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-purple-500/30 text-purple-200 border border-purple-400/20">
                      Skor Tersimpan Terakhir
                    </span>
                    <h4 className="text-4xl sm:text-5xl font-black text-white tracking-tight font-mono">
                      {simLastSavedResult.snbtScore}
                    </h4>
                    <p className="text-xs text-slate-400">
                      Sesi: <span className="font-mono text-purple-300">{simLastSavedResult.sessionId}</span> · {simLastSavedResult.timestamp}
                    </p>
                  </div>

                  <div className="space-y-3 p-4 rounded-2xl bg-black/40 border border-white/5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Metrik Keberhasilan</span>
                    <div className="grid grid-cols-2 gap-2 text-xs font-medium">
                      <div>
                        <span className="text-slate-500 block text-[10px] font-bold">TOTAL BENAR</span>
                        <span className="font-mono font-bold text-emerald-400">{simLastSavedResult.totalCorrect} Soal</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px] font-bold">TOTAL SALAH</span>
                        <span className="font-mono font-bold text-rose-400">{simLastSavedResult.totalWrong} Soal</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px] font-bold">AKURASI SESI</span>
                        <span className="font-mono font-bold text-white">
                          {((simLastSavedResult.totalCorrect / 160) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px] font-bold">BOBOT IRT</span>
                        <span className="font-mono font-bold text-purple-400">
                          {simLastSavedResult.totalIrtEarned.toFixed(0)}/{simLastSavedResult.totalIrtMax.toFixed(0)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2.5">
                    <button
                      onClick={startSimulation}
                      className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-black text-xs uppercase tracking-wider shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Play className="w-4 h-4 fill-white" />
                      Ulangi Ujian Manual
                    </button>
                    <button
                      onClick={startInstantSimulation}
                      className="w-full py-2.5 px-4 rounded-xl border border-purple-500/30 bg-purple-600/10 hover:bg-purple-600/20 text-purple-300 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Zap className="w-4 h-4 fill-purple-300" />
                      Simulasi Cepat (Pure RNG)
                    </button>
                    <button
                      onClick={resetSavedScore}
                      className="w-full py-2 px-4 rounded-xl bg-white/5 hover:bg-rose-500/10 border border-white/10 hover:border-rose-500/30 text-slate-400 hover:text-rose-400 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                      Hapus Skor Tersimpan
                    </button>
                  </div>
                </motion.div>
              ) : (
                <div className="p-6 rounded-3xl border border-white/5 bg-white/5 text-center space-y-4">
                  <p className="text-xs text-slate-400 font-medium">
                    Belum ada simulasi ujian yang disimpan pada perangkat ini. Mulai simulasi pertama Anda!
                  </p>
                  <div className="flex flex-wrap justify-center gap-3">
                    <button
                      onClick={startSimulation}
                      className="py-3 px-6 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-black text-xs uppercase tracking-wider shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <Play className="w-4 h-4 fill-white" />
                      Mulai Simulasi Manual
                    </button>
                    <button
                      onClick={startInstantSimulation}
                      className="py-3 px-6 rounded-xl border border-purple-500/30 bg-purple-600/20 hover:bg-purple-500/30 text-purple-300 hover:text-white font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <Zap className="w-4 h-4 fill-purple-300" />
                      Simulasi Cepat (Pure RNG)
                    </button>
                  </div>
                </div>
              )}

              {/* Transparent Formula explanation */}
              <div className="p-6 rounded-3xl border border-white/10 bg-slate-900/40 backdrop-blur space-y-3">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-black uppercase text-purple-400 tracking-wider">Formula Transparan Pembentukan Skor Akhir</span>
                </div>
                <div className="p-4 rounded-2xl bg-black/50 border border-white/5 font-mono text-center overflow-x-auto">
                  <code className="text-white font-black text-xs sm:text-sm whitespace-nowrap">
                    Skor SNBT = (PU + PPU + PBM + PK + LBI + LBE + PM) / 7
                  </code>
                </div>
                <p className="text-[11px] sm:text-xs text-slate-400 leading-relaxed">
                  Setiap subtes dihitung murni berdasarkan <strong>estimasi kemampuan laten peserta (Theta &theta;) model 3PL IRT</strong> dengan transformasi linier standar nasional: <code className="text-purple-300 font-mono">Skor = 500 + 120 &times; &theta;</code>. Nilai <code className="text-purple-300 font-mono">&theta; = 0.0</code> (titik rata-rata kemampuan nasional) menghasilkan tepat nilai <strong>500</strong>.
                </p>
              </div>

              {/* Subtests Config Cards */}
              <div className="space-y-4">
                <h4 className="text-sm font-black uppercase tracking-wider text-slate-300">Rincian Kurikulum Ujian (160 Soal)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {SUBTESTS_CONFIG.map((sub, idx) => (
                    <div key={sub.key} className="p-5 rounded-2xl border border-white/5 bg-black/30 flex flex-col justify-between space-y-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-500 font-mono">SUBTES #{idx + 1}</span>
                          <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-white/5 text-slate-300 border border-white/10">
                            {sub.qCount} Soal
                          </span>
                        </div>
                        <h5 className="text-sm font-black text-white">{sub.name}</h5>
                        <p className="text-[11px] text-slate-400 leading-relaxed">{sub.desc}</p>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-slate-300 pt-2 border-t border-white/5 font-mono font-bold">
                        <Timer className="w-3.5 h-3.5 text-purple-400" />
                        <span>Durasi: {sub.duration / 60} menit</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STATE 2: ACTIVE TESTING INTERFACE */}
          {simState === 'testing' && simSession && (
            <div className="max-w-2xl mx-auto space-y-6">
              {/* Active Test Header Status */}
              <div className="p-4 sm:p-5 rounded-2xl border border-white/10 bg-black/60 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest font-mono">
                    SUBTES JALAN ({simCurrentSubtestIndex + 1} / 7)
                  </span>
                  <h4 className="text-base font-black text-white uppercase tracking-tight">
                    {SUBTESTS_CONFIG[simCurrentSubtestIndex].name}
                  </h4>
                </div>

                <div className={`px-4 py-2 rounded-xl flex items-center gap-2 font-mono font-black text-sm border ${
                  simTimer < 120 
                    ? 'bg-rose-500/20 text-rose-400 border-rose-500/30 animate-pulse' 
                    : 'bg-white/5 text-white border-white/10'
                }`}>
                  <Timer className="w-4 h-4 text-purple-400" />
                  <span>{Math.floor(simTimer / 60).toString().padStart(2, '0')}:{(simTimer % 60).toString().padStart(2, '0')}</span>
                </div>
              </div>

              {/* Progress and Question Parameter Details */}
              <div className="p-6 sm:p-8 rounded-3xl border border-white/10 bg-black/40 backdrop-blur space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                    <span className="font-mono">SOAL #{simCurrentQuestionIndex + 1} dari {SUBTESTS_CONFIG[simCurrentSubtestIndex].qCount}</span>
                    <span className="font-mono">
                      Akurasi Subtes: {Math.round(((simCurrentQuestionIndex) / SUBTESTS_CONFIG[simCurrentSubtestIndex].qCount) * 100)}%
                    </span>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
                      style={{
                        width: `${((simCurrentQuestionIndex + 1) / SUBTESTS_CONFIG[simCurrentSubtestIndex].qCount) * 100}%`
                      }}
                    />
                  </div>
                </div>

                {/* Question Details Block - Hiding during active test, only showing on feedback or final page */}
                {simAllSubtestsQuestions[SUBTESTS_CONFIG[simCurrentSubtestIndex].key]?.[simCurrentQuestionIndex] && (() => {
                  const q = simAllSubtestsQuestions[SUBTESTS_CONFIG[simCurrentSubtestIndex].key][simCurrentQuestionIndex];
                  return (
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <div className="p-5 rounded-2xl border border-white/10 bg-black/20 text-center space-y-2">
                          <div className="flex justify-center gap-2 flex-wrap text-[10px] uppercase font-mono font-black">
                            <span className={`px-2 py-0.5 rounded ${
                              q.level === 'Mudah' ? 'bg-emerald-500/20 text-emerald-400' : q.level === 'Sedang' ? 'bg-amber-500/20 text-amber-400' : 'bg-rose-500/20 text-rose-400'
                            }`}>
                              {q.level}
                            </span>
                            {q.qType && (
                              <span className={`px-2 py-0.5 rounded ${q.qType === 'Isian Singkat' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'bg-white/10 text-slate-300'}`}>
                                {q.qType}
                              </span>
                            )}
                            <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">
                              Daya Beda a: {q.a.toFixed(2)}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">
                              Kesulitan b: {q.b.toFixed(2)}
                            </span>
                            <span className={`px-2 py-0.5 rounded ${q.c === 0 ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'bg-amber-500/20 text-amber-300'}`}>
                              Tebakan c: {q.c !== undefined ? q.c.toFixed(2) : '0.20'}{q.c === 0 ? ' (Isian Singkat)' : ''}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 uppercase tracking-widest font-black">Pertanyaan Simulasi</p>
                          <h4 className="text-base sm:text-lg font-black text-white leading-relaxed">
                            Apakah respon pengerjaan soal nomor #{simCurrentQuestionIndex + 1} ini BENAR atau SALAH?
                          </h4>
                          <p className="text-[11px] text-slate-500 font-medium">
                            (Gunakan tombol di bawah untuk menyimulasikan hasil pemecahan Anda secara dinamis)
                          </p>
                        </div>

                        {/* Answers Action Buttons with Transient Feedback Delay */}
                        <div className="relative">
                          <div className="grid grid-cols-2 gap-4">
                            <button
                              onClick={() => handleAnswerClick('benar')}
                              className="py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-emerald-950/40 border border-emerald-400/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                            >
                              <CheckCircle2 className="w-5 h-5 text-white" />
                              BENAR
                            </button>
                            <button
                              onClick={() => handleAnswerClick('salah')}
                              className="py-4 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-rose-950/40 border border-rose-400/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                            >
                              <XCircle className="w-5 h-5 text-white" />
                              SALAH
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Skip and Dev Bypasses */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-slate-400 font-medium">Equating Index Sesi (b̄):</span>
                  <span className="font-mono font-bold text-white">
                    {(simSession?.meanDifficulty || 0) >= 0 ? '+' : ''}{(simSession?.meanDifficulty || 0).toFixed(3)}
                  </span>
                  <span className="text-slate-500 font-mono text-[10px]">
                    (3PL IRT Standardized)
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      // Instantly complete current subtest as random
                      const activeSub = SUBTESTS_CONFIG[simCurrentSubtestIndex];
                      const qList = [...(simAllSubtestsQuestions[activeSub.key] || [])];
                      qList.forEach((q, idx) => {
                        if (idx >= simCurrentQuestionIndex) {
                          const isCorrect = Math.random() < (q.level === 'Mudah' ? 0.8 : q.level === 'Sedang' ? 0.6 : 0.4);
                          q.userAnswer = isCorrect ? 'benar' : 'salah';
                          q.impactEarned = isCorrect ? q.irtImpact : 0;
                        }
                      });
                      setSimAllSubtestsQuestions(prev => ({ ...prev, [activeSub.key]: qList }));
                      calculateAndAdvanceSubtest(qList);
                    }}
                    className="px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all cursor-pointer font-bold"
                  >
                    Auto-Run Subtes Ini
                  </button>
                  <button
                    onClick={startInstantSimulation}
                    className="px-3 py-1.5 rounded bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 hover:text-purple-200 transition-all cursor-pointer font-bold"
                  >
                    Selesaikan Cepat (3PL)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STATE 3: RESULTS AND BREAKDOWN */}
          {simState === 'results' && (
            <div className="space-y-8">
              {/* Top Bento Grid Stats Card */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="p-6 sm:p-8 rounded-3xl border border-purple-500/30 bg-gradient-to-br from-purple-950/25 to-black/60 shadow-2xl flex flex-col justify-between space-y-4 lg:col-span-2">
                  <div className="space-y-1">
                    <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      SKOR UTBK FINAL SNBT 2030
                    </span>
                    <div className="text-6xl sm:text-7xl font-black text-white font-mono tracking-tight pt-2">
                      {simLastSavedResult?.snbtScore}
                    </div>
                    <p className="text-xs text-slate-400 font-medium">
                      Skor ini otomatis diaplikasikan ke slider nilai 7 subtes pada menu simulator utama.
                    </p>
                  </div>

                  <div className="pt-4 border-t border-white/5 text-xs text-slate-400 flex items-center gap-2">
                    <Award className="w-4 h-4 text-purple-400" />
                    <span>Daya Saing Sesi: <strong>{simLastSavedResult ? scoreToOsuPP(simLastSavedResult.snbtScore).toFixed(0) : 0} pp</strong> (Performance Points)</span>
                  </div>
                </div>

                <div className="p-6 rounded-3xl border border-white/10 bg-black/40 space-y-4">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Statistik Jawaban</span>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between font-medium">
                      <span className="text-xs text-slate-400">Total Benar</span>
                      <span className="font-mono text-sm font-bold text-emerald-400">{simLastSavedResult?.totalCorrect} / 160</span>
                    </div>
                    <div className="flex items-center justify-between font-medium">
                      <span className="text-xs text-slate-400">Total Salah</span>
                      <span className="font-mono text-sm font-bold text-rose-400">{simLastSavedResult?.totalWrong} / 160</span>
                    </div>
                    <div className="flex items-center justify-between font-medium">
                      <span className="text-xs text-slate-400">Akurasi Ujian</span>
                      <span className="font-mono text-sm font-bold text-white">
                        {simLastSavedResult ? ((simLastSavedResult.totalCorrect / 160) * 100).toFixed(1) : 0}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-3xl border border-white/10 bg-black/40 space-y-4">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Metrik IRT Sesi</span>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between font-medium">
                      <span className="text-xs text-slate-400">Sesi ID</span>
                      <span className="font-mono text-sm font-bold text-purple-300">{simLastSavedResult?.sessionId}</span>
                    </div>
                    {(() => {
                      const meanB = simLastSavedResult?.meanDifficulty ?? 0;
                      const meanA = simLastSavedResult?.meanDiscrimination ?? 1.15;
                      return (
                        <>
                          <div className="flex items-center justify-between font-medium">
                            <span className="text-xs text-slate-400">Penyetaraan IRT (b̄)</span>
                            <span className="font-mono text-xs font-bold text-slate-200">
                              {meanB >= 0 ? '+' : ''}{meanB.toFixed(3)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between font-medium">
                            <span className="text-xs text-slate-400">Mean Daya Pembeda (ā)</span>
                            <span className="font-mono text-xs font-bold text-purple-300">
                              {meanA.toFixed(3)}x
                            </span>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>

              {/* 7 Subtest Results Details Breakdown */}
              <div className="space-y-4">
                <h4 className="text-sm font-black uppercase tracking-wider text-slate-300">Performa Per Subtes (Model 3PL IRT Resmi SNBT)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {simLastSavedResult?.subtests.map((sub, idx) => (
                    <div key={sub.key} className="p-5 rounded-2xl border border-white/5 bg-black/30 flex flex-col justify-between space-y-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-500 font-mono">SUBTES #{idx + 1}</span>
                          <span className="text-xs font-bold font-mono text-purple-400">Skor: {sub.score}</span>
                        </div>
                        <h5 className="text-sm font-black text-white">{sub.name}</h5>
                        
                        <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-2 text-slate-400">
                          <div>
                            <span className="text-[9px] text-slate-500 block">BENAR</span>
                            <span className="text-emerald-400 font-bold">{sub.correct}</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-500 block">SALAH</span>
                            <span className="text-rose-400 font-bold">{sub.wrong}</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-500 block">KEMAMPUAN (&theta;)</span>
                            <span className="text-white font-bold">{sub.theta >= 0 ? '+' : ''}{sub.theta.toFixed(2)}</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-500 block">AKURASI</span>
                            <span className="text-purple-400 font-bold">{sub.correct} / {sub.correct + sub.wrong} Soal</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mathematical Verification of unweighted final score */}
              {simLastSavedResult && (
                <div className="p-6 rounded-3xl border border-white/10 bg-black/40 space-y-3">
                  <div className="flex items-center gap-2">
                    <Scale className="w-4 h-4 text-purple-400" />
                    <span className="text-xs font-black uppercase text-purple-400 tracking-wider">Verifikasi Matematis Transparansi Skor</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-black/60 border border-white/5 font-mono text-[11px] sm:text-xs space-y-2">
                    <p className="text-slate-400">
                      Sesuai peraturan murni: <strong>Skor SNBT Akhir</strong> dihitung sebagai rata-rata aritmatika tak-terbobot dari ketujuh subtes di atas tanpa manipulasi RNG akhir tambahan.
                    </p>
                    <div className="flex flex-wrap items-center gap-1.5 text-white font-bold">
                      <span>Rata-Rata:</span>
                      <span className="bg-white/5 px-2 py-0.5 rounded text-slate-300">
                        ({simLastSavedResult.subtests.map(s => s.score).join(' + ')}) / 7
                      </span>
                    </div>
                    <p className="text-slate-400 pt-1">
                      Kalkulasi: <span className="text-white font-bold">{simLastSavedResult.subtests.reduce((sum, s) => sum + s.score, 0)} / 7 = {(simLastSavedResult.subtests.reduce((sum, s) => sum + s.score, 0) / 7).toFixed(3)}</span> &rarr; Dibulatkan menjadi <span className="text-purple-400 font-black font-mono">{simLastSavedResult.snbtScore}</span>.
                    </p>
                  </div>
                </div>
              )}

              {/* IRT 2PL Theory Explanation Panel */}
              <div className="p-6 sm:p-8 rounded-3xl border border-purple-500/20 bg-purple-950/10 backdrop-blur-xl shadow-2xl space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
                    <Scale className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-white uppercase tracking-tight">
                      Panduan Penilaian Sistem IRT 3PL (3-Parameter Logistic)
                    </h4>
                    <p className="text-xs text-slate-400">
                      Penjelasan ilmiah estimasi nilai kemampuan laten (&theta;) Anda dengan Faktor Tebakan Semu
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-300 leading-relaxed">
                  <div className="space-y-3 p-4 rounded-2xl bg-black/40 border border-white/5">
                    <span className="text-[10px] font-black text-purple-300 uppercase tracking-widest block">1. Model Probabilitas Benar (3PL)</span>
                    <p>
                      Probabilitas seorang peserta dengan tingkat kemampuan <code className="text-purple-300 font-mono font-bold">&theta;</code> menjawab benar butir soal <code className="text-white font-mono">i</code> dengan tingkat kesulitan <code className="text-purple-300 font-mono">b_i</code>, daya pembeda <code className="text-amber-300 font-mono">a_i</code>, dan faktor tebakan semu <code className="text-emerald-300 font-mono">c_i</code> dirumuskan oleh fungsi logistik berikut:
                    </p>
                    <div className="p-3 rounded-xl bg-black/60 font-mono text-[11px] text-center text-white border border-white/5 my-2">
                      P(&theta;) = c_i + (1 - c_i) / [1 + e^(-a_i * (&theta; - b_i))]
                    </div>
                    <ul className="list-disc pl-4 space-y-1 text-slate-400 text-[11px]">
                      <li><strong className="text-slate-300">Daya Pembeda (a_i)</strong>: Kepekaan butir soal dalam memisahkan kelompok berkemampuan tinggi dan rendah (0.90 - 1.30).</li>
                      <li><strong className="text-slate-300">Tingkat Kesulitan (b_i)</strong>: Titik kemampuan laten yang dibutuhkan agar memiliki peluang 50% melewati tebakan.</li>
                      <li><strong className="text-slate-300">Tebakan Semu (c_i)</strong>: Probabilitas menjawab benar secara acak/tebakan semu (berkisar 0.13 - 0.26 pada pilihan ganda sesuai daya kecoh distraktor, dan 0.00 pada format isian singkat).</li>
                    </ul>
                  </div>

                  <div className="space-y-3 p-4 rounded-2xl bg-black/40 border border-white/5">
                    <span className="text-[10px] font-black text-purple-300 uppercase tracking-widest block">2. Estimasi Kemampuan Laten (&theta;)</span>
                    <p>
                      Sistem komputer mencari nilai <code className="text-purple-300 font-mono font-bold">&theta;</code> optimal yang memaksimalkan fungsi log-likelihood dari seluruh pola jawaban peserta:
                    </p>
                    <div className="p-3 rounded-xl bg-black/60 font-mono text-[11px] text-center text-white border border-white/5 my-2">
                      ln L(&theta;) = &Sigma; [y_i * ln P_i(&theta;) + (1 - y_i) * ln(1 - P_i(&theta;))]
                    </div>
                    <p className="text-slate-400 text-[11px]">
                      Jika Anda salah menjawab soal bertingkat kesulitan rendah (<code className="text-purple-300 font-mono">b</code> negatif), estimasi <code className="text-purple-300 font-mono font-bold">&theta;</code> akan mengalami koreksi/penalti tajam ke bawah. Sebaliknya, berhasil menjawab benar soal bertingkat kesulitan tinggi (<code className="text-purple-300 font-mono">b</code> positif) akan menggeser kurva kecocokan maksimal ke arah nilai <code className="text-purple-300 font-mono font-bold">&theta;</code> yang tinggi.
                    </p>

                  </div>
                </div>
              </div>

              {/* Accordion list for IRT question logs details */}
              <div className="p-6 rounded-3xl border border-white/10 bg-black/40 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-black uppercase tracking-wider text-slate-300">Detail Log Bobot IRT Per Soal</h4>
                    <p className="text-xs text-slate-500">Gunakan tab untuk memfilter log butir soal di bawah</p>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {SUBTESTS_CONFIG.map(sub => (
                      <button
                        key={sub.key}
                        onClick={() => setSimActiveDetailSubtest(sub.key)}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase transition-all ${
                          simActiveDetailSubtest === sub.key
                            ? 'bg-purple-600 text-white'
                            : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        {sub.key.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                {simLastSavedResult?.questionsBySubtest?.[simActiveDetailSubtest] ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 pt-2">
                    {simLastSavedResult.questionsBySubtest[simActiveDetailSubtest].map((q, qidx) => (
                      <div key={q.id} className="p-3 rounded-xl border border-white/5 bg-black/40 space-y-1 text-center font-mono text-[10px]">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <span className="text-slate-500 font-bold">#{qidx + 1}</span>
                            {q.qType === 'Isian Singkat' && (
                              <span className="px-1 py-0.2 rounded text-[7px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                                ISIAN
                              </span>
                            )}
                          </div>
                          <span className={`px-1.5 py-0.2 rounded text-[8px] font-bold ${
                            q.userAnswer === 'benar' 
                              ? 'bg-emerald-500/10 text-emerald-400' 
                              : 'bg-rose-500/10 text-rose-400'
                          }`}>
                            {q.userAnswer === 'benar' ? '✓ BENAR' : '✕ SALAH'}
                          </span>
                        </div>

                          <div className="grid grid-cols-4 gap-1 text-slate-400 pt-1 border-t border-white/5 text-[9px]">
                          <div>
                            <span className="text-slate-600 block text-[6px] uppercase">Daya Beda (a)</span>
                            <span className="text-white font-bold">{q.a.toFixed(2)}</span>
                          </div>
                          <div>
                            <span className="text-slate-600 block text-[6px] uppercase">Kesulitan (b)</span>
                            <span className="text-purple-300 font-bold">{q.b.toFixed(2)}</span>
                          </div>
                          <div>
                            <span className="text-slate-600 block text-[6px] uppercase">Tebakan (c)</span>
                            <span className={`font-bold ${q.c === 0 ? 'text-cyan-300' : 'text-amber-300'}`}>
                              {q.c !== undefined ? q.c.toFixed(2) : '0.20'}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-600 block text-[6px] uppercase">Tingkat</span>
                            <span className={q.level === 'Mudah' ? 'text-emerald-400 font-medium' : q.level === 'Sedang' ? 'text-amber-400 font-medium' : 'text-rose-400 font-medium'}>
                              {q.level}
                            </span>
                          </div>
                         </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 font-mono">No detailed log available.</p>
                )}
              </div>

              {/* Back actions */}
              <div className="flex flex-wrap gap-4 pt-4">
                <button
                  onClick={startSimulation}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-black text-xs uppercase tracking-wider shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Dices className="w-4 h-4" />
                  RNG Sesi Baru
                </button>
                <button
                  onClick={() => setSimState('dashboard')}
                  className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  Kembali ke Dashboard
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
