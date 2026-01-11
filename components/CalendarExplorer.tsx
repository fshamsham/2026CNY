import React, { useState, useMemo, useEffect } from 'react';
import { VideoData, Translations } from '../types';
import { ChevronLeft, ChevronRight, Play, Info, Calendar as CalendarIcon, List as ListIcon } from 'lucide-react';
import { VideoModal } from './VideoModal';

interface Props {
  videos: VideoData[];
  t: Translations;
}

const DayHoverCard: React.FC<{ videos: VideoData[] }> = ({ videos }) => {
  return (
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-64 md:w-80 bg-white rounded-3xl shadow-[0_20px_50px_rgba(220,38,38,0.15)] border border-red-50 overflow-hidden z-[60] animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-300 pointer-events-none">
      <div className="bg-red-600 px-4 py-2 flex items-center justify-between">
        <span className="text-[10px] font-black text-white uppercase tracking-widest">Release Preview</span>
        <span className="bg-white/20 text-white text-[9px] px-2 py-0.5 rounded-full font-black">{videos.length} Videos</span>
      </div>
      <div className="p-2 divide-y divide-gray-50">
        {videos.map((v, i) => (
          <div key={i} className="flex items-center gap-3 p-2.5">
            <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-gray-100 shadow-sm">
              <img src={v.Thumbnail} className="w-full h-full object-cover" alt="thumb" />
            </div>
            <div className="flex-1 min-w-0">
              <h6 className="text-[11px] font-black text-gray-900 leading-tight line-clamp-2 mb-0.5 uppercase tracking-tight">
                {v.VideoTitle}
              </h6>
              <p className="text-[8px] font-bold text-red-900/40 uppercase tracking-widest truncate">
                {v.ChannelName}
              </p>
            </div>
          </div>
        ))}
      </div>
      <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-white"></div>
    </div>
  );
};

export const CalendarExplorer: React.FC<Props> = ({ videos, t }) => {
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [selectedDayVideos, setSelectedDayVideos] = useState<{ date: string, videos: VideoData[] } | null>(null);
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);

  // Calculate unique months that have videos
  const availableMonths = useMemo(() => {
    const monthMap = new Map<string, Date>();
    videos.forEach(v => {
      const d = new Date(v.PublishDate);
      if (isNaN(d.getTime())) return;
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (!monthMap.has(key)) {
        monthMap.set(key, new Date(d.getFullYear(), d.getMonth(), 1));
      }
    });
    return Array.from(monthMap.values()).sort((a, b) => a.getTime() - b.getTime());
  }, [videos]);

  const initialMonth = useMemo(() => {
    const now = new Date();
    const todayKey = `${now.getFullYear()}-${now.getMonth()}`;
    const hasToday = availableMonths.find(m => `${m.getFullYear()}-${m.getMonth()}` === todayKey);
    if (hasToday) return hasToday;
    if (availableMonths.length > 0) {
      return availableMonths[availableMonths.length - 1];
    }
    return new Date();
  }, [availableMonths]);

  const [currentDate, setCurrentDate] = useState<Date>(initialMonth);

  useEffect(() => {
    const handleResize = () => setIsMobileView(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setCurrentDate(initialMonth);
  }, [initialMonth]);

  useEffect(() => {
    if (isMobileView) setViewMode('list');
    else setViewMode('calendar');
  }, [isMobileView]);

  const monthVideos = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    return videos.filter(v => {
      const d = new Date(v.PublishDate);
      return d.getFullYear() === year && d.getMonth() === month;
    });
  }, [videos, currentDate]);

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const startOffset = (firstDayOfMonth + 6) % 7;

  const currentMonthIdx = availableMonths.findIndex(
    m => m.getFullYear() === currentDate.getFullYear() && m.getMonth() === currentDate.getMonth()
  );

  const handlePrevMonth = () => {
    if (currentMonthIdx > 0) {
      setCurrentDate(availableMonths[currentMonthIdx - 1]);
    }
  };

  const handleNextMonth = () => {
    if (currentMonthIdx < availableMonths.length - 1) {
      setCurrentDate(availableMonths[currentMonthIdx + 1]);
    }
  };

  const monthNumber = (currentDate.getMonth() + 1).toString().padStart(2, '0');

  const getDayVideos = (day: number) => {
    return monthVideos.filter(v => new Date(v.PublishDate).getDate() === day);
  };

  const formatDateForModal = (day: number) => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    return `${year}年${month}月${day}日`;
  };

  const renderCalendar = () => {
    const days = [];
    for (let i = 0; i < startOffset; i++) {
      days.push(<div key={`empty-${i}`} className="h-20 md:h-32 bg-gray-50/50 border-b border-r border-gray-100"></div>);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const dayVids = getDayVideos(d);
      const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), d).toDateString();
      const isHovered = hoveredDay === d;
      
      // Limit to 2 titles on mobile, 3 thumbnails on desktop
      const limit = isMobileView ? 2 : 3;
      const displayVids = dayVids.slice(0, limit);
      const remaining = dayVids.length - limit;

      days.push(
        <div 
          key={d} 
          onMouseEnter={() => !isMobileView && dayVids.length > 0 && setHoveredDay(d)}
          onMouseLeave={() => setHoveredDay(null)}
          onClick={() => dayVids.length > 0 && setSelectedDayVideos({ date: formatDateForModal(d), videos: dayVids })}
          className={`h-20 md:h-32 p-1 md:p-3 transition-all cursor-pointer group flex flex-col justify-between relative overflow-hidden border-b border-r border-gray-100
            ${dayVids.length > 0 
              ? 'bg-white hover:bg-red-50/30' 
              : 'bg-white/40'
            }
            ${isToday ? 'bg-red-50/20' : ''}`}
        >
          {!isMobileView && isHovered && dayVids.length > 0 && (
            <DayHoverCard videos={dayVids} />
          )}

          <div className="flex justify-between items-start relative z-10">
            <span className={`text-[10px] md:text-lg font-black tracking-tighter ${dayVids.length > 0 ? 'text-red-900' : 'text-gray-300'}`}>
              {d}
            </span>
            {dayVids.length > 0 && (
              <span className="bg-red-600 text-white text-[7px] md:text-[10px] px-1 md:px-2 py-0.5 rounded-sm md:rounded-lg font-black shadow-md md:shadow-lg shadow-red-200">
                {dayVids.length}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-0.5 relative z-10 overflow-hidden mt-auto pb-0.5">
            {isMobileView ? (
              // Mobile View: Title Rows
              <>
                {displayVids.map((v, i) => (
                  <div key={i} className="text-[6px] text-red-900/60 font-bold truncate leading-tight bg-red-50/50 px-1 rounded-sm">
                    {v.VideoTitle}
                  </div>
                ))}
                {remaining > 0 && (
                  <div className="text-[6px] text-red-600 font-black uppercase text-right mt-0.5 px-1">
                    +{remaining}
                  </div>
                )}
              </>
            ) : (
              // Desktop View: Thumbnails
              <div className="flex -space-x-3 items-end overflow-hidden flex-nowrap">
                {displayVids.map((v, i) => (
                  <div key={i} className="relative group/thumb shrink-0">
                    <img 
                      src={v.Thumbnail} 
                      className="w-10 h-10 rounded-xl border-2 border-white object-cover shadow-md group-hover/thumb:scale-110 transition-transform duration-500" 
                      alt="thumb" 
                    />
                  </div>
                ))}
                {remaining > 0 && (
                  <div className="relative z-20 shrink-0">
                    <div className="w-10 h-10 rounded-xl border-2 border-white bg-red-50 text-red-600 flex items-center justify-center text-xs font-black shadow-md">
                      +{remaining}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {isToday && (
            <div className="absolute top-0 right-0 w-1.5 h-1.5 md:w-2 md:h-2 bg-red-600 rounded-bl-full"></div>
          )}
        </div>
      );
    }
    return days;
  };

  const renderList = () => {
    const daysWithVideos = Array.from({ length: daysInMonth }, (_, i) => i + 1)
      .filter(d => getDayVideos(d).length > 0)
      .sort((a, b) => b - a);

    if (daysWithVideos.length === 0) {
      return (
        <div className="py-24 text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6">
             <Info size={32} className="text-gray-200" />
          </div>
          <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-[10px]">{t.noVideos}</p>
        </div>
      );
    }

    return (
      <div className="space-y-8 md:space-y-12">
        {daysWithVideos.map(d => {
          const vids = getDayVideos(d);
          return (
            <div key={d} className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="flex items-center gap-4 md:gap-6 mb-6 md:mb-8">
                <div className="bg-red-600 text-white px-4 py-2 md:px-6 md:py-3 rounded-xl md:rounded-2xl flex flex-col items-center justify-center font-black shadow-2xl shadow-red-200 transform hover:scale-105 transition-transform cursor-default">
                  <span className="text-[8px] md:text-[10px] uppercase leading-none mb-1 opacity-70 tracking-widest">{monthNumber}</span>
                  <span className="text-xl md:text-3xl leading-none">{d}</span>
                </div>
                <div className="h-px flex-1 bg-gradient-to-r from-red-100 to-transparent"></div>
                <h4 className="font-black text-red-900/20 text-[9px] md:text-[10px] uppercase tracking-[0.3em] md:tracking-[0.4em] whitespace-nowrap">
                  {vids.length} {t.videos}
                </h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {vids.map((v, i) => (
                  <div 
                    key={i} 
                    onClick={() => setSelectedDayVideos({ date: formatDateForModal(d), videos: [v] })}
                    className="bg-white rounded-[1.8rem] md:rounded-[2.5rem] p-4 md:p-6 flex gap-4 md:gap-6 border border-gray-100 hover:border-red-600/20 hover:shadow-2xl hover:shadow-red-900/5 transition-all duration-500 cursor-pointer group relative overflow-hidden active:scale-[0.98]"
                  >
                    <div className="relative w-28 md:w-40 aspect-video shrink-0">
                      <img src={v.Thumbnail} className="w-full h-full rounded-xl md:rounded-2xl object-cover border border-gray-50 shadow-sm transition-transform duration-700 group-hover:scale-105" alt="thumb" />
                      <div className="absolute inset-0 bg-black/5 group-hover:bg-red-600/10 transition-colors rounded-xl md:rounded-2xl flex items-center justify-center">
                        <div className="bg-white/90 p-2 md:p-2.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-500">
                           <Play size={14} className="text-red-600 md:size-18" fill="currentColor" />
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <h5 className="font-black text-gray-900 line-clamp-2 text-sm md:text-lg leading-tight mb-1 md:mb-2 group-hover:text-red-600 transition-colors">{v.VideoTitle}</h5>
                      <div className="flex items-center gap-1.5 md:gap-2">
                        <div className="w-4 h-4 md:w-5 md:h-5 rounded-md bg-red-50 overflow-hidden border border-red-100 shrink-0">
                          <img src={v.ChannelAvatar} className="w-full h-full object-cover" alt="avatar" />
                        </div>
                        <p className="text-[9px] md:text-[11px] text-red-900/60 font-black uppercase tracking-wider truncate">{v.ChannelName}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-[2rem] md:rounded-[3.5rem] p-5 md:p-14 shadow-2xl shadow-red-900/5 border border-gray-100 relative overflow-visible">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 md:mb-14 gap-6 md:gap-8 relative z-10">
        <div className="text-center md:text-left">
          <h2 className="text-3xl md:text-6xl font-black text-red-950 font-cny tracking-tighter flex flex-row items-center justify-center md:justify-start gap-3 md:gap-6">
             <span>{monthNumber}</span> 
             <span className="text-red-600/20 font-light">/</span> 
             <span>{currentDate.getFullYear()}</span>
          </h2>
          <div className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-2 md:gap-4 mt-3 md:mt-4">
            <div className="flex items-center gap-2">
              <div className="w-6 md:w-8 h-px bg-red-600/30"></div>
              <p className="text-red-900/60 font-black text-sm md:text-xl uppercase tracking-[0.1em] md:tracking-[0.2em]">
                 <span className="hidden md:inline">{t.totalVideos}: </span>
                 <span className="text-red-600">{monthVideos.length}</span> {t.videos}
              </p>
            </div>
            
            <div className="flex bg-gray-100/80 p-1 rounded-xl md:rounded-2xl border border-gray-200">
              <button 
                onClick={() => setViewMode('calendar')}
                className={`p-1.5 md:p-2 rounded-lg md:rounded-xl transition-all ${viewMode === 'calendar' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-400 hover:text-red-900'}`}
                title="Calendar View"
              >
                <CalendarIcon size={16} className="md:size-5" />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`p-1.5 md:p-2 rounded-lg md:rounded-xl transition-all ${viewMode === 'list' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-400 hover:text-red-900'}`}
                title="List View"
              >
                <ListIcon size={16} className="md:size-5" />
              </button>
            </div>
          </div>
        </div>
        
        <div className="flex items-center bg-red-50 p-1 md:p-1.5 rounded-[1.2rem] md:rounded-[1.8rem] border border-red-100 shadow-sm">
          <button 
            onClick={handlePrevMonth}
            disabled={currentMonthIdx <= 0}
            className={`p-2.5 md:p-3 rounded-lg md:rounded-[1.2rem] transition-all ${currentMonthIdx <= 0 ? 'text-gray-300 cursor-not-allowed' : 'text-red-600 hover:bg-white hover:shadow-md active:scale-95'}`}
          >
            <ChevronLeft size={20} className="md:w-6 md:h-6" />
          </button>
          <div className="w-px h-6 md:h-8 bg-red-200 mx-2 md:mx-3"></div>
          <button 
            onClick={handleNextMonth}
            disabled={currentMonthIdx >= availableMonths.length - 1}
            className={`p-2.5 md:p-3 rounded-lg md:rounded-[1.2rem] transition-all ${currentMonthIdx >= availableMonths.length - 1 ? 'text-gray-300 cursor-not-allowed' : 'text-red-600 hover:bg-white hover:shadow-md active:scale-95'}`}
          >
            <ChevronRight size={20} className="md:w-6 md:h-6" />
          </button>
        </div>
      </div>

      {viewMode === 'list' ? (
        renderList()
      ) : (
        <div className="animate-in fade-in duration-1000 overflow-visible">
          <div className="grid grid-cols-7 gap-0 border-t border-l border-gray-100 rounded-t-[1rem] md:rounded-t-3xl overflow-hidden">
            {[t.monday, t.tuesday, t.wednesday, t.thursday, t.friday, t.saturday, t.sunday].map(day => (
              <div key={day} className="text-center py-2 md:py-6 text-[7px] md:text-[10px] font-black text-red-900/30 uppercase tracking-tight md:tracking-[0.5em] border-r bg-gray-50/30">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-0 border-l border-gray-100 rounded-b-[1rem] md:rounded-b-3xl overflow-visible shadow-inner">
            {renderCalendar()}
          </div>
        </div>
      )}

      {selectedDayVideos && (
        <VideoModal 
          isOpen={!!selectedDayVideos}
          onClose={() => setSelectedDayVideos(null)}
          videos={selectedDayVideos.videos}
          title={`${selectedDayVideos.date} 作品集`}
          t={t}
        />
      )}
    </div>
  );
};