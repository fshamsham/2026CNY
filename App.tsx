import React, { useState, useEffect, useCallback } from 'react';
import { VideoData } from './types';
import { TRANSLATIONS } from './constants';
import { fetchVideoData } from './services/dataService';
import { MetricsSection } from './components/MetricsSection';
import { RankingSection } from './components/RankingSection';
import { CalendarExplorer } from './components/CalendarExplorer';
import { Music, Sparkles, Star, AlertCircle, RefreshCw, CalendarDays } from 'lucide-react';

const App: React.FC = () => {
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const t = TRANSLATIONS;

  const loadData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);
    
    setError(null);
    try {
      const data = await fetchVideoData();
      if (data.length === 0) {
        throw new Error("No data records found in the source sheet.");
      }
      setVideos(data);
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
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none opacity-50 z-0 overflow-hidden">
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-red-600/5 rounded-full blur-[100px]"></div>
        <div className="absolute top-1/2 -right-20 w-80 h-80 bg-amber-500/5 rounded-full blur-[80px]"></div>
      </div>

      <nav className="w-full pt-6 md:pt-8 relative z-[50]">
        <div className="w-[90%] mx-auto max-w-[1800px] glass-light rounded-[2rem] md:rounded-[2.5rem] px-5 py-3 md:px-6 md:py-4 flex justify-between items-center shadow-xl shadow-red-900/5 border-white/80">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-amber-500 rounded-xl md:rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
              <div className="relative bg-red-600 p-2 md:p-2.5 rounded-xl md:rounded-2xl shadow-lg">
                <Music className="text-white w-5 h-5 md:w-6 md:h-6" />
              </div>
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg md:text-2xl font-black text-red-900 font-cny leading-none tracking-tight">
                {t.title}
              </h1>
              <div className="flex items-center gap-2">
                <span className="h-px w-3 md:w-4 bg-red-600/30"></span>
                <p className="text-red-900/40 text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] md:tracking-[0.25em]">{t.subtitle}</p>
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
        <section className="w-[90%] mx-auto max-w-[1800px] animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
          <RankingSection videos={videos} t={t} />
        </section>

        {/* Calendar Section */}
        <section className="w-[90%] mx-auto max-w-[1800px] animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300 pb-20">
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
            <CalendarExplorer videos={videos} t={t} />
          </div>
        </section>
      </main>

      <footer className="mt-16 md:mt-32 text-center text-red-900/20 text-[9px] md:text-[10px] px-6 uppercase tracking-[0.15em] md:tracking-[0.4em] font-black relative z-10 max-w-full overflow-hidden">
      </footer>
    </div>
  );
};

export default App;