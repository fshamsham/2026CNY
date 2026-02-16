
import React, { useState, useEffect, useCallback } from 'react';
import { VideoData } from './types';
import { TRANSLATIONS } from './constants';
import { fetchVideoData } from './services/dataService';
import { MetricsSection } from './components/MetricsSection';
import { RankingSection } from './components/RankingSection';
import { CalendarExplorer } from './components/CalendarExplorer';
import { HorseThemedStats } from './components/HorseThemedStats';
import { HashtagAnalysis } from './components/HashtagAnalysis';
import { ReleasePeakStats } from './components/ReleasePeakStats';
import { VideoModal } from './components/VideoModal';
import { 
  Music, Sparkles, Star, AlertCircle, RefreshCw, 
  ChevronUp, Mail, Heart, Send, 
  Menu, X, Trophy, BarChart3, Calendar, Zap, Hash, Flame, ChevronRight
} from 'lucide-react';

const App: React.FC = () => {
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showGoTop, setShowGoTop] = useState(false);
  const [modalOpenCount, setModalOpenCount] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedDayVideos, setSelectedDayVideos] = useState<{ date: string, videos: VideoData[] } | null>(null);

  const t = TRANSLATIONS;

  const isModalOpen = modalOpenCount > 0 || !!selectedDayVideos;

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
    hours = hours ? hours : 12; 
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
    if (isModalOpen || isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [isModalOpen, isMenuOpen]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToSection = (id: string) => {
    setIsMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      const offset = 100;
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const navItems = [
    { id: 'metrics', label: '数据概览', sub: 'Metrics Overview', icon: BarChart3 },
    { id: 'ranking', label: '新年歌风云榜', sub: 'Leaderboard', icon: Trophy },
    { id: 'peaks', label: '新年歌曲发布趋势', sub: 'Momentum Trends', icon: Flame },
    { id: 'calendar', label: '新年歌曲发布日历', sub: 'Release Calendar', icon: Calendar },
    { id: 'pun-stats', label: '标题用“马”关键词/谐音', sub: 'Creative Puns', icon: Zap },
    { id: 'hashtags', label: '热门标签分析', sub: 'Hashtag Insights', icon: Hash }
  ];

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
      <div className={`fixed top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden transition-opacity duration-700 ${isModalOpen || isMenuOpen ? 'opacity-0' : 'opacity-50'}`}>
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-red-600/5 rounded-full blur-[100px]"></div>
        <div className="absolute top-1/2 -right-20 w-80 h-80 bg-amber-500/5 rounded-full blur-[80px]"></div>
      </div>

      {/* Hamburger Menu Overlay */}
      <div className={`fixed inset-0 z-[100] transition-all duration-700 ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-red-950/40 backdrop-blur-2xl" onClick={() => setIsMenuOpen(false)}></div>
        <div className={`absolute top-0 left-0 h-full w-full md:w-[420px] bg-white shadow-2xl transition-transform duration-700 ease-expo ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="p-6 md:p-10 h-full flex flex-col">
            <div className="flex justify-between items-center mb-8 md:mb-10">
              <div className="flex items-center gap-3">
                <div className="bg-red-600 p-2 rounded-xl">
                  <Music className="text-white w-4 h-4" />
                </div>
                <div className="flex flex-col">
                   <span className="font-black text-red-950 text-[10px] uppercase tracking-[0.2em] leading-none mb-1">Navigation</span>
                   <span className="font-black text-red-900/30 text-[8px] uppercase tracking-[0.4em] leading-none">2026 CNY Explorer</span>
                </div>
              </div>
              <button 
                onClick={() => setIsMenuOpen(false)}
                className="p-2.5 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white rounded-xl transition-all duration-500 active:scale-90 border border-red-100/50"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="mb-4 pl-1 flex items-center gap-3">
              <div className="h-0.5 w-8 bg-red-600 rounded-full"></div>
              <h3 className="text-[9px] font-black text-red-900/40 uppercase tracking-[0.5em]">内容导航</h3>
            </div>
            
            {/* Vertical List Column Menu - Reduced heights and paddings */}
            <div className="flex flex-col gap-2 md:gap-2.5 flex-none content-start overflow-y-auto custom-scrollbar pr-2 pb-6">
              {navItems.map((item, idx) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  style={{ transitionDelay: `${idx * 40}ms` }}
                  className={`group relative flex items-center gap-4 p-3 md:p-3.5 rounded-[1.2rem] md:rounded-[1.4rem] bg-gray-50/60 border border-transparent hover:border-red-600/10 hover:bg-red-50/50 transition-all duration-500 text-left w-full ${isMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}
                >
                  <div className="p-2.5 bg-white rounded-xl shadow-sm text-red-600 group-hover:text-red-700 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 border border-gray-100 shrink-0">
                    <item.icon size={18} strokeWidth={2.5} className="md:w-5 md:h-5" />
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="text-[14px] md:text-[15px] font-black text-red-950 tracking-tight leading-tight mb-0.5 break-words">
                      {item.label}
                    </span>
                    <span className="text-[8px] md:text-[9px] font-bold text-red-900/30 uppercase tracking-[0.2em]">
                      {item.sub}
                    </span>
                  </div>
                  <ChevronRight size={16} className="text-red-900/10 group-hover:text-red-600 transition-all group-hover:translate-x-1 shrink-0" />
                </button>
              ))}
            </div>
            
            <div className="mt-auto pt-6 border-t border-red-50">
               <div className="bg-red-50/50 p-4 md:p-5 rounded-2xl border border-red-100/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Heart size={12} className="text-red-600" fill="currentColor" />
                    <span className="text-[9px] font-black text-red-900/60 uppercase tracking-widest">Happy New Year</span>
                  </div>
                  <p className="text-[10px] text-red-900/40 font-medium leading-relaxed uppercase tracking-tight">
                    记录并见证马来西亚新年歌曲的文化生命力
                  </p>
               </div>
            </div>
          </div>
        </div>
      </div>

      <nav className={`w-full pt-8 md:pt-12 relative z-[50] transition-all duration-700 ${isModalOpen ? 'opacity-0 pointer-events-none translate-y-[-20px]' : 'opacity-100'}`}>
        <div className="w-[90%] md:w-[84%] mx-auto max-w-[1700px] glass-light rounded-[2.5rem] md:rounded-[4rem] px-6 py-5 md:px-14 md:py-10 flex justify-between items-center shadow-2xl shadow-red-900/5 border-white/80">
          <div className="flex items-center gap-4 md:gap-10">
            {/* Hamburger Button */}
            <button 
                onClick={() => setIsMenuOpen(true)}
                className="group flex items-center justify-center bg-red-50 hover:bg-red-600 text-red-600 hover:text-white p-3.5 md:p-5 rounded-2xl md:rounded-3xl transition-all duration-300 active:scale-95 shadow-sm border border-red-100/50"
                aria-label="Open Menu"
             >
                <Menu size={20} className="md:w-7 md:h-7" />
             </button>

            <div className="flex items-center gap-5 md:gap-8">
              <div className="relative group shrink-0 hidden sm:block">
                <div className="absolute -inset-2 bg-gradient-to-r from-red-600 to-amber-500 rounded-2xl md:rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                <div className="relative bg-red-600 p-3 md:p-5 rounded-2xl md:rounded-[2rem] shadow-xl">
                  <Music className="text-white w-5 h-5 md:w-8 md:h-8" />
                </div>
              </div>
              <div className="flex flex-col gap-1.5 md:gap-3">
                <h1 className="text-xl md:text-4xl lg:text-5xl font-black text-red-900 font-cny leading-none tracking-tighter">
                  {t.title}
                </h1>
                <div className="flex items-center gap-2 md:gap-4">
                  <span className="h-px w-3 md:w-6 bg-red-600/30"></span>
                  <div className="flex flex-col md:flex-row md:items-center text-red-900/60 text-[9px] md:text-xs font-black uppercase tracking-[0.2em] md:tracking-[0.4em] leading-tight md:leading-none">
                    <span>{t.subtitle}</span>
                    <span className="text-red-600 mt-1 md:mt-0 md:ml-3">{lastUpdate}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="hidden lg:block text-red-900/20 font-black text-[10px] md:text-sm uppercase tracking-[0.6em] whitespace-nowrap">
                2026 马年贺岁
             </div>
          </div>
        </div>
      </nav>

      <main className="w-full pt-12 md:pt-24 relative z-10 space-y-24 md:space-y-48">
        <section id="metrics" className="w-[90%] md:w-[80%] mx-auto max-w-[1700px]">
          <MetricsSection videos={videos} t={t} />
        </section>

        {/* Ranking Section */}
        <section id="ranking" className="w-[90%] md:w-[80%] mx-auto max-w-[1700px] animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <RankingSection videos={videos} t={t} onModalToggle={handleModalToggle} />
        </section>

        {/* Release Peak Stats Section */}
        <section id="peaks" className="w-[90%] md:w-[80%] mx-auto max-w-[1700px] animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <ReleasePeakStats 
            videos={videos} 
            t={t} 
            onDateClick={(date, vids) => setSelectedDayVideos({ date, videos: vids })} 
          />
        </section>

        {/* Calendar Section */}
        <section id="calendar" className="w-[90%] md:w-[80%] mx-auto max-w-[1700px] animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
          <div className="mb-10 flex flex-col items-center justify-center text-center">
            <div className="flex items-center gap-2 md:gap-3 mb-2">
              <Sparkles className="text-amber-500 animate-pulse w-4 h-4 md:w-5 md:h-5" />
              <span className="text-red-900/30 font-black text-[9px] md:text-[10px] uppercase tracking-[0.3em] md:tracking-[0.5em]">Release Calendar</span>
              <Sparkles className="text-amber-500 animate-pulse w-4 h-4 md:size-5" />
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

        {/* Horse Pun Stats Section */}
        <section id="pun-stats" className="w-[90%] md:w-[80%] mx-auto max-w-[1700px] animate-in fade-in slide-in-from-bottom-8 duration-1000">
           <HorseThemedStats videos={videos} onModalToggle={handleModalToggle} />
        </section>

        {/* Hashtag Spotlight Section */}
        <section id="hashtags" className="w-[90%] md:w-[80%] mx-auto max-w-[1700px] animate-in fade-in slide-in-from-bottom-8 duration-1000 pb-20">
           <HashtagAnalysis videos={videos} onModalToggle={handleModalToggle} />
        </section>
      </main>

      {/* Go To Top Button */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-6 right-6 md:bottom-12 md:right-12 z-[60] bg-red-600 hover:bg-red-700 text-white p-3.5 md:p-5 rounded-full shadow-2xl transition-all duration-500 transform border-2 border-white/20 hover:scale-110 active:scale-90 hover:shadow-red-900/40 flex items-center justify-center group ${
          showGoTop && !isModalOpen && !isMenuOpen ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-20 opacity-0 scale-50 pointer-events-none'
        }`}
        aria-label="Go to Top"
      >
        <ChevronUp size={24} className="group-hover:-translate-y-1 transition-transform" />
        <div className="absolute -inset-2 bg-red-600/20 rounded-full blur-xl animate-pulse group-hover:bg-amber-500/30"></div>
      </button>

      {/* Footer */}
      <footer className="mt-24 md:mt-48 bg-white border-t border-red-50 relative z-10 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 opacity-[0.06] bg-[radial-gradient(circle_at_center,_red_1.5px,_transparent_1.5px)] bg-[length:28px_28px]"></div>
        
        <div className="max-w-[1800px] mx-auto px-6 md:px-48 py-20 md:py-36">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 lg:gap-48">
            <div className="flex flex-col gap-6 md:pr-12">
              <div className="flex items-center gap-3">
                <div className="bg-red-600 p-1.5 rounded-lg shadow-lg shadow-red-100">
                  <Music className="text-white w-3.5 h-3.5" />
                </div>
                <h3 className="text-base md:text-lg font-black text-red-950 font-cny tracking-tighter">
                  {t.title}
                </h3>
              </div>
              <p className="text-red-900/50 text-[11px] md:text-[13px] leading-relaxed font-medium max-w-lg">
                以数据刻画并见证马来西亚新年歌曲的创作与传播轨迹。
              </p>
              <div className="flex flex-col gap-1.5 mt-3">
                <p className="text-red-900/20 text-[9px] font-black uppercase tracking-[0.4em] font-cny">
                  © 2026 CNY MUSIC INSIGHTS • 马来西亚新年歌曲
                </p>
                <div className="flex items-center gap-2 text-red-900/20">
                  <Heart size={10} fill="currentColor" className="text-red-600/20" />
                  <span className="text-[9px] font-bold uppercase tracking-[0.2em] leading-none">让本地贺岁文化在数字时代更显生命力</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-7">
              <h4 className="text-[10px] font-black text-red-950/30 uppercase tracking-[0.5em] border-l-2 border-red-50 pl-4">
                数据合作与建议反馈
              </h4>
              <p className="text-red-900/50 text-[11px] md:text-[13px] leading-relaxed font-medium">
                若有数据遗漏、合作意向或技术反馈，欢迎通过电子邮箱与我取得联系。您的建议将助力我们更完善地记录 2026 年的声音印记。
              </p>
              <a 
                href="mailto:itsfangying@gmail.com" 
                className="group relative flex items-center justify-between px-6 py-6 md:px-8 md:py-7 bg-white border border-red-50 rounded-[1.8rem] md:rounded-[2.2rem] transition-all duration-500 shadow-xl shadow-red-900/5 hover:shadow-red-600/20 active:scale-95 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-amber-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative flex items-center gap-4 md:gap-5">
                  <div className="bg-red-50 p-3 rounded-xl group-hover:bg-white/20 transition-colors">
                    <Mail size={18} className="text-red-600 group-hover:text-white transition-colors" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black text-red-900/30 group-hover:text-white/60 uppercase tracking-widest leading-none mb-1">联系开发者</span>
                    <span className="text-sm md:text-base font-black text-red-950 group-hover:text-white transition-colors tracking-tight">
                      itsfangying@gmail.com
                    </span>
                  </div>
                </div>
                <div className="relative p-2 rounded-full border border-red-50 group-hover:border-white/20 transition-colors">
                   <Send size={14} className="text-red-200 group-hover:text-white group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                </div>
              </a>
            </div>
          </div>

          <div className="mt-20 pt-14 border-t border-red-50 overflow-hidden relative">
            <div className="flex justify-center mb-10">
               <div className="w-12 h-1 bg-gradient-to-r from-transparent via-red-100 to-transparent rounded-full opacity-40"></div>
            </div>
            
            <div className="flex items-center justify-center gap-16 whitespace-nowrap animate-marquee">
              <span className="text-red-900/5 text-[9px] md:text-[10px] font-black uppercase tracking-[1.4em]">恭喜发财 • 万事如意 • 2026 丙午马年 • 骏马奔腾 • 岁岁平安 • 新年进步 • 马到功成 • 大吉大利</span>
              <span className="text-red-900/5 text-[9px] md:text-[10px] font-black uppercase tracking-[1.4em]">恭喜发财 • 万事如意 • 2026 丙午马年 • 骏马奔腾 • 岁岁平安 • 新年进步 • 马到功成 • 大吉大利</span>
            </div>
          </div>
        </div>
      </footer>

      {selectedDayVideos && (
        <VideoModal 
          isOpen={!!selectedDayVideos}
          onClose={() => setSelectedDayVideos(null)}
          videos={selectedDayVideos.videos}
          title={selectedDayVideos.videos.length === 1 ? '作品详情' : `2026年${selectedDayVideos.date} 作品集`}
          t={t}
        />
      )}
      
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: inline-flex;
          animation: marquee 50s linear infinite;
        }
        .ease-expo {
          transition-timing-function: cubic-bezier(0.85, 0, 0.15, 1);
        }
        footer {
          user-select: none;
        }
      `}</style>
    </div>
  );
};

export default App;
