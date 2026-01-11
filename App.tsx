import React, { useState, useEffect, useCallback } from 'react';
import { VideoData } from './types';
import { TRANSLATIONS } from './constants';
import { fetchVideoData } from './services/dataService';
import { MetricsSection } from './components/MetricsSection';
import { RankingSection } from './components/RankingSection';
import { CalendarExplorer } from './components/CalendarExplorer';
import { Music, Sparkles, Star, AlertCircle, RefreshCw, ChevronUp } from 'lucide-react';

const App: React.FC = () => {
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showGoTop, setShowGoTop] = useState(false);
  const [modalOpenCount, setModalOpenCount] = useState(0);

  const t = TRANSLATIONS;

  const isModalOpen = modalOpenCount > 0;

  const handleModalToggle = useCallback((isOpen: boolean) => {
    setModalOpenCount(prev => isOpen ? prev + 1 : Math.max(0, prev - 1));
  }, []);

  const formatDateTime = (date: Date): string => {
    const YYYY = date.getFullYear();
    const MM = String(date.getMonth() + 1).padStart(2, '0');
    const DD = String(date.getDate()).padStart(2, '0');
    
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const HH = String(hours).padStart(2, '0');
    
    return `${YYYY}/${MM}/${DD} ${HH}:${minutes} ${ampm}`;
  };

  const loadData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);
    
    setError(null);
    try {
      const videoData = await fetchVideoData();
      
      if (videoData.length === 0) {
        throw new Error("No data records found in the source sheet.");
      }
      
      // Extract the maximum LastDataUpdate from the dataset
      let maxTimeValue = 0;
      let latestDateObj: Date | null = null;
      
      videoData.forEach(v => {
        if (v.LastDataUpdate) {
          const d = new Date(v.LastDataUpdate);
          const time = d.getTime();
          if (!isNaN(time) && time > maxTimeValue) {
            maxTimeValue = time;
            latestDateObj = d;
          }
        }
      });
      
      setVideos(videoData);
      setLastUpdate(latestDateObj ? formatDateTime(latestDateObj) : '---');
    } catch (err: any) {
      console.error("App Error:", err);
      setError(err.message || '无法加载新年歌数据，请检查网络连接或稍后重试。');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 500) {
        setShowGoTop(true);
      } else {
        setShowGoTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [isModalOpen]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fffbf2] flex flex-col items-center justify-center text-red-600 p-4">
        <div className="relative">
          <Music size={80} className="animate-bounce text-red-600 mb-6" strokeWidth={1.5} />
          <Star size={24} className="absolute -top-4 -right-4 text-amber-500 animate-pulse" fill="currentColor" />
        </div>
        <p className="text-xl font-bold font-cny animate-pulse tracking-[0.3em] uppercase text-red-900/60">{t.loading}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#fffbf2] flex flex-col items-center justify-center p-8 text-center">
        <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl shadow-red-900/10 border border-red-100 max-w-md w-full">
          <div className="bg-red-50 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8">
            <AlertCircle size={40} className="text-red-600" />
          </div>
          <h2 className="text-2xl font-black text-red-950 mb-4 font-cny">出错了！</h2>
          <p className="text-red-900/60 text-sm mb-10 leading-relaxed font-medium">
            {error}
          </p>
          <button 
            onClick={() => loadData()}
            className="w-full flex items-center justify-center gap-3 bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-red-200 active:scale-95"
          >
            <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
            重试一次
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden relative selection:bg-red-100 selection:text-red-900 text-gray-900 pb-12">
      {/* Decorative background elements */}
      <div className={`fixed top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden transition-opacity duration-700 ${isModalOpen ? 'opacity-0' : 'opacity-50'}`}>
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-red-600/5 rounded-full blur-[100px]"></div>
        <div className="absolute top-1/2 -right-20 w-80 h-80 bg-amber-500/5 rounded-full blur-[80px]"></div>
      </div>

      <nav className={`w-full pt-6 md:pt-8 relative z-[50] transition-all duration-700 ${isModalOpen ? 'opacity-0 pointer-events-none translate-y-[-20px]' : 'opacity-100'}`}>
        <div className="w-[90%] mx-auto max-w-[1800px] glass-light rounded-[2rem] md:rounded-[2.5rem] px-5 py-3 md:px-6 md:py-4 flex justify-between items-center shadow-xl shadow-red-900/5 border-white/80">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-amber-500 rounded-xl md:rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
              <div className="relative bg-red-600 p-2 md:p-2.5 rounded-xl md:rounded-2xl shadow-lg">
                <Music className="text-white w-5 h-5 md:w-6 md:h-6" />
              </div>
            </div>
            <div className="flex flex-col gap-1.5 md:gap-2">
              <h1 className="text-lg md:text-2xl font-black text-red-900 font-cny leading-none tracking-tight">
                {t.title}
              </h1>
              <div className="flex items-start gap-2">
                <span className="h-px w-3 md:w-4 bg-red-600/30 mt-1.5 md:mt-2.5"></span>
                <div className="flex flex-col md:flex-row md:items-center text-red-900/60 text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] md:tracking-[0.25em] leading-tight md:leading-none">
                  <span>{t.subtitle}</span>
                  <span className="text-red-600 mt-0.5 md:mt-0 md:ml-1.5">{lastUpdate}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4">
             <button 
               onClick={() => loadData(true)}
               disabled={refreshing}
               className="group flex items-center gap-2 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white px-3 py-2 md:px-5 md:py-2.5 rounded-xl md:rounded-2xl transition-all shadow-sm border border-red-100 disabled:opacity-50"
               title="Reload Data"
             >
               <RefreshCw size={16} className={`${refreshing ? "animate-spin" : "group-hover:rotate-180"} transition-transform duration-500`} />
               <span className="text-[10px] md:text-xs font-black uppercase tracking-widest hidden sm:inline">Reload</span>
             </button>
             <div className="hidden lg:block text-red-900/20 font-black text-[10px] uppercase tracking-[0.4em] ml-2">
                Gong Xi Fa Cai 2026
             </div>
          </div>
        </div>
      </nav>

      <main className="w-full pt-10 md:pt-12 relative z-10 space-y-20 md:space-y-32">
        <section className="w-[90%] mx-auto max-w-[1800px]">
          <MetricsSection videos={videos} t={t} />
        </section>

        {/* Ranking Section */}
        <section className="w-[90%] mx-auto max-w-[1800px] animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <RankingSection videos={videos} t={t} onModalToggle={handleModalToggle} />
        </section>

        {/* Calendar Section */}
        <section className="w-[90%] mx-auto max-w-[1800px] animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200 pb-20">
          <div className="mb-8 flex flex-col items-center justify-center text-center">
            <div className="flex items-center gap-2 md:gap-3 mb-2">
              <Sparkles className="text-amber-500 animate-pulse w-4 h-4 md:w-5 md:h-5" />
              <span className="text-red-900/30 font-black text-[9px] md:text-[10px] uppercase tracking-[0.3em] md:tracking-[0.5em]">Release Calendar</span>
              <Sparkles className="text-amber-500 animate-pulse w-4 h-4 md:w-5 md:h-5" />
            </div>
            <h2 className="text-2xl md:text-5xl font-black text-red-950 font-cny tracking-tight relative px-4">
              {t.festiveTitle}
              <div className="absolute -bottom-3 md:-bottom-4 left-1/2 -translate-x-1/2 w-16 md:w-24 h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent rounded-full"></div>
            </h2>
          </div>
          
          <div className="relative w-full">
            <CalendarExplorer videos={videos} t={t} onModalToggle={handleModalToggle} />
          </div>
        </section>
      </main>

      {/* Go To Top Button */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-6 right-6 md:bottom-10 md:right-10 z-[60] bg-red-600 hover:bg-red-700 text-white p-3 md:p-4 rounded-full shadow-2xl transition-all duration-500 transform border-2 border-white/20 hover:scale-110 active:scale-90 hover:shadow-red-900/40 flex items-center justify-center group ${
          showGoTop && !isModalOpen ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-20 opacity-0 scale-50 pointer-events-none'
        }`}
        aria-label="Go to Top"
      >
        <ChevronUp size={24} className="group-hover:-translate-y-1 transition-transform" />
        <div className="absolute -inset-2 bg-red-600/20 rounded-full blur-xl animate-pulse group-hover:bg-amber-500/30"></div>
      </button>

      <footer className="mt-16 md:mt-32 text-center text-red-900/20 text-[9px] md:text-[10px] px-6 uppercase tracking-[0.15em] md:tracking-[0.4em] font-black relative z-10 max-w-full overflow-hidden">
      </footer>
    </div>
  );
};

export default App;