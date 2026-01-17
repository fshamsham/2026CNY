import React, { useState, useMemo, useEffect } from 'react';
import { VideoData, Translations } from '../types';
import { ChevronLeft, ChevronRight, Play, Info, Calendar as CalendarIcon, List as ListIcon, Search, X, Sparkles, Plus } from 'lucide-react';
import { VideoModal } from './VideoModal';

interface Props {
  videos: VideoData[];
  t: Translations;
  onModalToggle?: (isOpen: boolean) => void;
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

export const CalendarExplorer: React.FC<Props> = ({ videos, t, onModalToggle }) => {
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [selectedDayVideos, setSelectedDayVideos] = useState<{ date: string, videos: VideoData[] } | null>(null);
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleGroupsCount, setVisibleGroupsCount] = useState(3);

  useEffect(() => {
    const handleResize = () => setIsMobileView(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isMobileView) setViewMode('list');
    else setViewMode('calendar');
  }, [isMobileView]);

  useEffect(() => {
    if (selectedDayVideos) {
      onModalToggle?.(true);
      return () => onModalToggle?.(false);
    }
  }, [selectedDayVideos, onModalToggle]);

  // Available months calculation
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

  // Reset pagination when date or search changes
  useEffect(() => {
    setVisibleGroupsCount(3);
  }, [currentDate, searchQuery]);

  // Sync date if initial month changes
  useEffect(() => {
    setCurrentDate(initialMonth);
  }, [initialMonth]);

  // Global search results
  const searchResults = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return [];
    return videos.filter(v => 
      v.VideoTitle.toLowerCase().includes(q) || 
      v.ChannelName.toLowerCase().includes(q) ||
      (v.VideoDescription && v.VideoDescription.toLowerCase().includes(q))
    ).sort((a, b) => new Date(b.PublishDate).getTime() - new Date(a.PublishDate).getTime());
  }, [videos, searchQuery]);

  const isSearching = searchQuery.trim().length > 0;

  const monthVideos = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    return videos.filter(v => {
      const d = new Date(v.PublishDate);
      return d.getFullYear() === year && d.getMonth() === month;
    });
  }, [videos, currentDate]);

  const groupedVideos = useMemo(() => {
    const list = isSearching ? searchResults : monthVideos;
    const groups = new Map<string, VideoData[]>();
    
    list.forEach(v => {
      const date = new Date(v.PublishDate);
      if (isNaN(date.getTime())) return;
      const key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(v);
    });
    
    return Array.from(groups.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  }, [isSearching, searchResults, monthVideos]);

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const startOffset = (firstDayOfMonth + 6) % 7;

  const currentMonthIdx = availableMonths.findIndex(
    m => m.getFullYear() === currentDate.getFullYear() && m.getMonth() === currentDate.getMonth()
  );

  const handlePrevMonth = () => {
    if (currentMonthIdx > 0) setCurrentDate(availableMonths[currentMonthIdx - 1]);
  };

  const handleNextMonth = () => {
    if (currentMonthIdx < availableMonths.length - 1) setCurrentDate(availableMonths[currentMonthIdx + 1]);
  };

  const monthNumber = (currentDate.getMonth() + 1).toString().padStart(2, '0');

  const getDayVideos = (day: number) => {
    return monthVideos.filter(v => new Date(v.PublishDate).getDate() === day);
  };

  const formatDateForModal = (dateStr: string) => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
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
      
      const limit = isMobileView ? 2 : 3;
      const displayVids = dayVids.slice(0, limit);
      const remaining = dayVids.length - limit;

      days.push(
        <div 
          key={d} 
          onMouseEnter={() => !isMobileView && dayVids.length > 0 && setHoveredDay(d)}
          onMouseLeave={() => setHoveredDay(null)}
          onClick={() => dayVids.length > 0 && setSelectedDayVideos({ date: `${currentDate.getFullYear()}年${currentDate.getMonth() + 1}月${d}日`, videos: dayVids })}
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
            <span className={`text-sm md:text-lg font-black tracking-tighter ${dayVids.length > 0 ? 'text-red-900' : 'text-gray-300'}`}>
              {d}
            </span>
            {dayVids.length > 0 && (
              <span className="bg-red-600 text-white text-[9px] md:text-[10px] px-1 md:px-2 py-0.5 rounded-sm md:rounded-lg font-black shadow-md md:shadow-lg shadow-red-200">
                {dayVids.length}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-0.5 relative z-10 overflow-hidden mt-auto pb-0.5">
            {isMobileView ? (
              <>
                {displayVids.map((v, i) => (
                  <div key={i} className="text-[7px] text-red-900/60 font-bold truncate leading-tight bg-red-50/50 px-1 rounded-sm">
                    {v.VideoTitle}
                  </div>
                ))}
                {remaining > 0 && (
                  <div className="text-[7px] text-red-600 font-black uppercase text-right mt-0.5 px-1">
                    +{remaining}
                  </div>
                )}
              </>
            ) : (
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
    if (groupedVideos.length === 0) {
      return (
        <div className="py-24 text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6">
             <Info size={32} className="text-gray-200" />
          </div>
          <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-xs">
            {isSearching ? "未找到匹配的新年歌曲" : t.noVideos}
          </p>
        </div>
      );
    }

    const visibleGroups = groupedVideos.slice(0, visibleGroupsCount);
    const hasMore = groupedVideos.length > visibleGroupsCount;

    return (
      <div className="space-y-8 md:space-y-12">
        {visibleGroups.map(([dateKey, vids]) => {
          const date = new Date(dateKey);
          const dMonth = (date.getMonth() + 1).toString().padStart(2, '0');
          const dDay = date.getDate().toString().padStart(2, '0');
          
          return (
            <div key={dateKey} className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="flex items-center gap-4 md:gap-6 mb-6 md:mb-8">
                <div className="bg-red-600 text-white px-4 py-2 md:px-6 md:py-3 rounded-xl md:rounded-2xl flex flex-col items-center justify-center font-black shadow-2xl shadow-red-200 transform hover:scale-105 transition-transform cursor-default">
                  <span className="text-[10px] md:text-[10px] uppercase leading-none mb-1 opacity-70 tracking-widest">{dMonth}</span>
                  <span className="text-2xl md:text-3xl leading-none">{dDay}</span>
                </div>
                <div className="h-px flex-1 bg-gradient-to-r from-red-100 to-transparent"></div>
                <h4 className="font-black text-red-900/20 text-[10px] md:text-[10px] uppercase tracking-[0.3em] md:tracking-[0.4em] whitespace-nowrap">
                  {vids.length} {t.videos}
                </h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {vids.map((v, i) => (
                  <div 
                    key={v.VideoURL + i} 
                    onClick={() => setSelectedDayVideos({ date: formatDateForModal(v.PublishDate), videos: [v] })}
                    className="bg-white rounded-[1.8rem] md:rounded-[2.5rem] p-6 md:p-10 flex gap-4 md:gap-6 border border-gray-100 hover:border-red-600/20 hover:shadow-2xl hover:shadow-red-900/5 transition-all duration-500 cursor-pointer group relative overflow-hidden active:scale-[0.98]"
                  >
                    <div className="relative w-28 md:w-40 aspect-video shrink-0">
                      <img src={v.Thumbnail} className="w-full h-full rounded-xl md:rounded-2xl object-cover border border-gray-50 shadow-sm transition-transform duration-700 group-hover:scale-105" alt="thumb" />
                      <div className="absolute inset-0 bg-black/5 group-hover:bg-red-600/10 transition-colors rounded-xl md:rounded-2xl flex items-center justify-center">
                        <div className="bg-white/90 p-2 md:p-2.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-500">
                           <Play size={16} className="text-red-600" fill="currentColor" />
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <h5 className="font-black text-gray-900 line-clamp-3 text-sm md:text-lg leading-tight mb-2 group-hover:text-red-600 transition-colors">{v.VideoTitle}</h5>
                      <div className="flex items-center gap-1.5 md:gap-2">
                        <div className="w-4 h-4 md:w-5 md:h-5 rounded-md bg-red-50 overflow-hidden border border-red-100 shrink-0">
                          <img src={v.ChannelAvatar} className="w-full h-full object-cover" alt="avatar" />
                        </div>
                        <p className="text-[10px] md:text-[11px] text-red-900/60 font-black uppercase tracking-wider truncate">{v.ChannelName}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {hasMore && (
          <div className="pt-4 flex justify-center">
            <button 
              onClick={() => setVisibleGroupsCount(prev => prev + 5)}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-red-200 transition-all active:scale-95 group"
            >
              <Plus size={16} className="group-hover:rotate-90 transition-transform" />
              View More
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-[2rem] md:rounded-[3.5rem] p-5 md:p-14 shadow-2xl shadow-red-900/5 border border-gray-100 relative overflow-visible">
      
      {/* Search Bar Container */}
      <div className="mb-10 md:mb-14 animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="relative group max-w-4xl mx-auto">
          <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
            <Search size={22} className="text-red-300 group-focus-within:text-red-600 transition-colors" />
          </div>
          <input
            type="text"
            placeholder="搜索全季候新年歌曲..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (e.target.value.trim() && viewMode !== 'list') setViewMode('list');
            }}
            className="w-full bg-red-50/50 border-2 border-red-50 focus:border-red-600/20 focus:bg-white rounded-[1.5rem] md:rounded-[2rem] py-4 md:py-6 pl-16 pr-14 text-base md:text-xl font-bold text-red-950 placeholder:text-red-900/30 shadow-sm transition-all outline-none"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-6 flex items-center text-red-300 hover:text-red-600 transition-colors"
            >
              <X size={24} />
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center mb-8 md:mb-14 gap-6 md:gap-8 relative z-10">
        <div className="text-center md:text-left flex-1">
          {isSearching ? (
            <div className="animate-in fade-in slide-in-from-left-4 duration-500">
               <h2 className="text-lg md:text-2xl font-black text-red-900 font-cny tracking-tighter flex flex-row items-center justify-center md:justify-start uppercase">
                 <span>SEARCH RESULTS</span>
               </h2>
               <div className="flex items-center justify-center md:justify-start gap-2 mt-3">
                  <div className="flex items-center gap-1.5 bg-red-50 px-3 py-1 rounded-full border border-red-100">
                    <Sparkles size={12} className="text-amber-500" />
                    <p className="text-red-900/70 font-black text-[10px] md:text-xs uppercase tracking-widest">
                      找到 <span className="text-red-600">{searchResults.length}</span> 首相关作品
                    </p>
                  </div>
               </div>
            </div>
          ) : (
            <div className="animate-in fade-in duration-500">
              <h2 className="text-3xl md:text-6xl font-black text-red-950 font-cny tracking-tighter flex flex-row items-center justify-center md:justify-start gap-3 md:gap-6">
                <span>{monthNumber}</span> 
                <span className="text-red-600/20 font-light">/</span> 
                <span>{currentDate.getFullYear()}</span>
              </h2>
              <div className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-2 md:gap-4 mt-4 md:mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 md:w-8 h-px bg-red-600/30"></div>
                  <p className="text-red-900/60 font-black text-base md:text-xl uppercase tracking-[0.1em] md:tracking-[0.2em]">
                    <span className="text-red-600">{monthVideos.length}</span> {t.videos}
                  </p>
                </div>
                
                {!isMobileView && (
                  <div className="flex bg-gray-100/80 p-1 rounded-xl md:rounded-2xl border border-gray-200">
                    <button 
                      onClick={() => setViewMode('calendar')}
                      className={`p-2 md:p-2 rounded-lg md:rounded-xl transition-all ${viewMode === 'calendar' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-400 hover:text-red-900'}`}
                      title="Calendar View"
                    >
                      <CalendarIcon size={18} className="md:size-5" />
                    </button>
                    <button 
                      onClick={() => setViewMode('list')}
                      className={`p-2 md:p-2 rounded-lg md:rounded-xl transition-all ${viewMode === 'list' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-400 hover:text-red-900'}`}
                      title="List View"
                    >
                      <ListIcon size={18} className="md:size-5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Only show pagination if NOT searching */}
        {!isSearching && (
          <div className="flex items-center bg-red-50 p-1 md:p-1.5 rounded-[1.2rem] md:rounded-[1.8rem] border border-red-100 shadow-sm animate-in fade-in duration-500">
            <button 
              onClick={handlePrevMonth}
              disabled={currentMonthIdx <= 0}
              className={`p-3 md:p-3 rounded-lg md:rounded-[1.2rem] transition-all ${currentMonthIdx <= 0 ? 'text-gray-300 cursor-not-allowed' : 'text-red-600 hover:bg-white hover:shadow-md active:scale-95'}`}
            >
              <ChevronLeft size={24} className="md:w-6 md:h-6" />
            </button>
            <div className="w-px h-6 md:h-8 bg-red-200 mx-2 md:mx-3"></div>
            <button 
              onClick={handleNextMonth}
              disabled={currentMonthIdx >= availableMonths.length - 1}
              className={`p-3 md:p-3 rounded-lg md:rounded-[1.2rem] transition-all ${currentMonthIdx >= availableMonths.length - 1 ? 'text-gray-300 cursor-not-allowed' : 'text-red-600 hover:bg-white hover:shadow-md active:scale-95'}`}
            >
              <ChevronRight size={24} className="md:w-6 md:h-6" />
            </button>
          </div>
        )}
      </div>

      {viewMode === 'list' ? (
        renderList()
      ) : (
        <div className="animate-in fade-in duration-1000 overflow-visible">
          <div className="grid grid-cols-7 gap-0 border-t border-l border-gray-100 rounded-t-[1rem] md:rounded-t-3xl overflow-hidden">
            {[t.monday, t.tuesday, t.wednesday, t.thursday, t.friday, t.saturday, t.sunday].map(day => (
              <div key={day} className="text-center py-3 md:py-6 text-[10px] md:text-xs font-black text-red-900/30 uppercase tracking-tight md:tracking-[0.5em] border-r bg-gray-50/30">
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
          title={selectedDayVideos.videos.length === 1 ? '作品详情' : `${selectedDayVideos.date} 作品集`}
          t={t}
        />
      )}
    </div>
  );
};