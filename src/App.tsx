/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback, useEffect } from 'react';
import { motion } from 'motion/react';
import { Routes, Route, useNavigate, useLocation, Navigate, useParams } from 'react-router-dom';
import Header from './components/Header';
import Hero from './components/Hero';
import Projects from './components/Projects';
import Socials from './components/Socials';
import DreamPlan from './components/DreamPlan';
import Articles from './components/Articles';
import { works, apps, articles } from './data';
import { getSubdomain } from './lib/subdomain';

// Mini App Imports
import { MainMenu } from './components/MainMenu';
import { FlashcardInputArea } from './components/FlashcardInputArea';
import { FlashcardReviewArea } from './components/FlashcardReviewArea';
import { MultipleChoiceInputArea } from './components/MultipleChoiceInputArea';
import { MultipleChoiceArea } from './components/MultipleChoiceArea';
import { QuranMiniApp } from './components/quran-miniapp/App';
import { ExamComparison } from './components/ExamComparison';
import { useLocalization } from './hooks/useLocalization';
import { PracticeMode, PracticeView, Flashcard, MultipleChoiceQuestion, BlogPost } from './types';
import { Icons } from './constants';
import { Button } from './components/Button';
import { ContentRenderer } from './components/ContentRenderer';

function SubdomainManager() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const subdomain = getSubdomain();
    if (!subdomain) return;

    const currentPath = location.pathname;

    if (subdomain === 'articles' && !currentPath.startsWith('/articles')) {
      navigate('/articles', { replace: true });
    } else if (subdomain === 'quran' && !currentPath.startsWith('/app/belajar-al-quran')) {
      navigate('/app/belajar-al-quran', { replace: true });
    } else if (subdomain === 'practice' && !currentPath.startsWith('/app/bikin-kuis-materi')) {
      navigate('/app/bikin-kuis-materi', { replace: true });
    } else if (subdomain === 'exam' && !currentPath.startsWith('/app/perbandingan-pencapaian')) {
      navigate('/app/perbandingan-pencapaian', { replace: true });
    } else if (subdomain === 'dream' && !currentPath.startsWith('/app/rencana-masa-depan')) {
      navigate('/app/rencana-masa-depan', { replace: true });
    }
  }, [navigate, location.pathname]);

  return null;
}

export default function App() {
  const navigate = useNavigate();
  
  // Navigation State
  const [selectedArticle, setSelectedArticle] = useState<BlogPost | null>(null);
  const [practiceMode, setPracticeMode] = useState<PracticeMode>('FLASHCARD');
  const [practiceView, setPracticeView] = useState<PracticeView>('MENU');

  // App Settings
  const [latexEnabled, setLatexEnabled] = useState(true);
  const [shuffleEnabled, setShuffleEnabled] = useState(false);
  const { t, language, setLanguage, toggleLanguage } = useLocalization();

  // Data State
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [mcqs, setMcqs] = useState<MultipleChoiceQuestion[]>([]);

  // Handlers
  const openApp = useCallback((title: string) => {
    const slug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
    navigate(`/app/${slug}`);
  }, [navigate]);

  const openArticle = useCallback((article: BlogPost) => {
    setSelectedArticle(article);
    navigate(`/articles/${encodeURIComponent(article.title)}`);
  }, [navigate]);

  const handleFlashcardParse = (cards: Flashcard[]) => {
    let finalCards = [...cards];
    if (shuffleEnabled) {
      finalCards = finalCards.sort(() => Math.random() - 0.5);
    }
    setFlashcards(finalCards);
    setPracticeView('REVIEW');
  };

  const handleMCQParse = (questions: MultipleChoiceQuestion[]) => {
    let finalQs = [...questions];
    if (shuffleEnabled) {
      finalQs = finalQs.sort(() => Math.random() - 0.5);
    }
    setMcqs(finalQs);
    setPracticeView('QUIZ');
  };

  // Main Site View
  const MainSite = () => (
    <div className="min-h-screen bg-[#f8fafc] font-sans selection:bg-blue-500 selection:text-white relative overflow-hidden">
      <div className="fixed inset-0 z-0 geometric-bg opacity-40" />
      <div className="fixed inset-0 z-0 bg-gradient-to-br from-white/80 via-transparent to-blue-50/30" />

      <div className="relative z-10">
        <Header />
        
        <main>
          <Hero />
          
          <div id="works">
            <Projects id="works" title="Kumpulan Karya" items={works} />
          </div>

          <div id="apps">
            <Projects 
              id="apps" 
              title="Kumpulan Aplikasi" 
              items={apps} 
              onItemClick={(item) => openApp(item.title)}
            />
          </div>

          <Socials />
          
          <Articles onArticleClick={openArticle} />
        </main>

        <footer className="py-12 px-4 border-t border-slate-200 bg-white/50 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            <div className="space-y-2">
              <h3 className="font-display font-bold text-2xl text-slate-900 tracking-tight">Kemal Avicenna Faza</h3>
              <p className="text-sm text-slate-500 font-tech">© 2026. Semua Hak Dilindungi.</p>
            </div>
            
            <div className="flex items-center gap-8 font-tech">
              <a href="#profile" className="text-xs font-bold text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-[0.2em]">Profil</a>
              <a href="#works" className="text-xs font-bold text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-[0.2em]">Kumpulan Karya</a>
              <a href="#articles" className="text-xs font-bold text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-[0.2em]">Artikel</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );

  // Practice App View
  const PracticeAppView = () => (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-300 pb-20">
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer group" 
            onClick={() => navigate('/')}
          >
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold group-hover:scale-110 transition-transform">
              K
            </div>
            <span className="font-display font-bold dark:text-white hidden sm:inline">Kuis Materi</span>
          </div>

          <div className="flex items-center gap-2">
            <Button 
              variant={latexEnabled ? "secondary" : "ghost"} 
              size="sm" 
              onClick={() => setLatexEnabled(!latexEnabled)}
              icon={<Icons.Math size={18} />}
            >
              <span className="hidden sm:inline">LaTeX</span>
            </Button>
            <Button 
              variant={shuffleEnabled ? "secondary" : "ghost"} 
              size="sm" 
              onClick={() => setShuffleEnabled(!shuffleEnabled)}
              icon={<Icons.Reset size={18} />}
            >
              <span className="hidden sm:inline">{t.practice.settings.shuffle}</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto">
        {practiceView === 'MENU' && (
          <MainMenu 
            onSelectMode={(mode) => {
              setPracticeMode(mode);
              setPracticeView('INPUT');
            }} 
            t={t.practice}
            onBack={() => navigate('/')}
          />
        )}

        {practiceView === 'INPUT' && practiceMode === 'FLASHCARD' && (
          <FlashcardInputArea 
            onParse={handleFlashcardParse}
            t={t.practice}
            onBack={() => setPracticeView('MENU')}
          />
        )}

        {practiceView === 'INPUT' && practiceMode === 'MCQ' && (
          <MultipleChoiceInputArea 
            onParse={handleMCQParse}
            t={t.practice}
            onBack={() => setPracticeView('MENU')}
          />
        )}

        {practiceView === 'REVIEW' && (
          <FlashcardReviewArea 
            cards={flashcards}
            t={t.practice}
            onBack={() => setPracticeView('INPUT')}
            latexEnabled={latexEnabled}
          />
        )}

        {practiceView === 'QUIZ' && (
          <MultipleChoiceArea 
            questions={mcqs}
            t={t.practice}
            onBack={() => setPracticeView('INPUT')}
            latexEnabled={latexEnabled}
          />
        )}
      </main>
    </div>
  );

  // Article Reader View
  const ArticleReader = () => {
    const { title } = useParams();
    const article = selectedArticle || articles.find(a => a.title === decodeURIComponent(title || ''));

    if (!article) return <Navigate to="/" replace />;

    return (
      <div className="min-h-screen bg-white font-sans selection:bg-blue-500 selection:text-white">
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/')}
              icon={<Icons.Prev size={18} />}
              className="text-slate-600 hover:text-blue-600 font-bold uppercase tracking-widest text-[10px] font-tech"
            >
              Kembali
            </Button>
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-mono text-blue-600 uppercase tracking-tighter">Reading Mode</span>
              <span className="text-[10px] font-mono text-slate-400">ARTICLE</span>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12"
          >
            <div className="space-y-6 text-center">
              <h1 className="text-4xl md:text-6xl font-black text-slate-900 leading-none uppercase tracking-tight">
                {article.title}
              </h1>
              <p className="text-xl text-slate-500 font-sans max-w-2xl mx-auto leading-relaxed italic">
                {article.summary}
              </p>
            </div>

            {article.image && (
              <div className="aspect-video w-full overflow-hidden rounded-sm tech-border border-slate-100 shadow-2xl">
                <img 
                  src={article.image} 
                  alt={article.title} 
                  className="w-full h-full object-contain bg-slate-50"
                />
              </div>
            )}

            <div className="bg-white p-8 md:p-16 rounded-sm border border-slate-100 shadow-sm relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-400" />
              <ContentRenderer 
                content={article.content || ''} 
                className="prose-lg"
                variant="article"
              />
            </div>
          </motion.div>
        </main>

        <footer className="py-20 border-t border-slate-100 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <Button 
              variant="outline" 
              onClick={() => navigate('/')}
              className="tech-border font-bold uppercase tracking-widest text-xs px-12"
            >
              Selesai Membaca
            </Button>
          </div>
        </footer>
      </div>
    );
  };

  // App Router
  const AppRouter = () => {
    const { title } = useParams();
    
    switch (title) {
      case 'bikin-kuis-materi':
        return <PracticeAppView />;
      case 'belajar-al-quran':
        return (
          <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-300">
            <QuranMiniApp onClose={() => navigate('/')} />
          </div>
        );
      case 'perbandingan-pencapaian':
        return (
          <div className="min-h-screen bg-slate-50 font-sans">
            <div className="fixed top-4 left-4 z-50 flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate('/')}
                icon={<Icons.Prev size={18} />}
                className="bg-white/80 backdrop-blur-sm shadow-sm"
              >
                Kembali
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={toggleLanguage}
                className="bg-white/80 backdrop-blur-sm shadow-sm font-bold uppercase tracking-widest text-[10px]"
              >
                {language === 'id' ? 'English' : 'Indonesia'}
              </Button>
            </div>
            <ExamComparison t={t.exam} language={language} />
          </div>
        );
      case 'rencana-masa-depan':
        return (
          <div className="min-h-screen bg-slate-50 font-sans relative">
            <div className="fixed top-4 left-4 z-50">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate('/')}
                icon={<Icons.Prev size={18} />}
                className="bg-white/80 backdrop-blur-sm shadow-sm"
              >
                Kembali
              </Button>
            </div>
            <DreamPlan />
          </div>
        );
      default:
        return <Navigate to="/" replace />;
    }
  };

  return (
    <>
      <SubdomainManager />
      <Routes>
        <Route path="/" element={<MainSite />} />
        <Route path="/app/:title" element={<AppRouter />} />
        <Route path="/articles/:title" element={<ArticleReader />} />
        <Route path="/articles" element={<MainSite />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
