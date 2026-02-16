import React, { useMemo, useState, useEffect, useRef } from 'react';
import { VideoData, Translations } from '../types';
import { Calendar, Zap, ChevronRight, Play, Flame, ChevronDown, ChevronUp, Trophy, Activity } from 'lucide-react';

interface PeakDay {
  date: string;
  count: number;
  videos: VideoData[];
}

interface PeakGroup {
  count: number;
  days: PeakDay[];
}

interface Props {
  videos: VideoData[];
  t: Translations;
  onDateClick?: (date: string, videos: VideoData[]) => void;
}

const AnimatedNumber: React.FC<{ value: number, isVisible: boolean, delay: number }> = ({ value, isVisible, delay }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (isVisible) {
      const timeout = setTimeout(() => {
        let startTime: number | null = null;
        const duration = 1500;
        
        const animate = (currentTime: number) => {
          if (!startTime) startTime = currentTime;
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 4);
          setDisplayValue(Math.floor(eased * value));
          
          if (progress < 1) {
            requestAnimationFrame(animate);
          }
        };
        requestAnimationFrame(animate);
      }, delay);
      return () => clearTimeout(timeout);
    } else {
      setDisplayValue(0);
    }
  }, [isVisible, value, delay]);

  return <span>{displayValue}</span>;
};

const DayRow: React.FC<{
  day: PeakDay;
  isZenith: boolean;
  onDateClick?: (date: string, videos: VideoData[]) => void;
}> = ({ day, isZenith, onDateClick }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  const formatDateLabel = (dateStr: string) => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return { month: '??', day: '??' };
    return { 
      month: (d.getMonth() + 1).toString().padStart(2, '0'), 
      day: d.getDate().toString().padStart(2, '0') 
    };
  };

  const getDayOfWeek = (dateStr: string) => {
    const days = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? '' : days[d.getDay()];
  };

  const d = formatDateLabel(day.date);

  const groupedByChannel = useMemo(() => {
    const map = new Map<string, VideoData[]>();
    day.videos.forEach(v => {
      if (!map.has(v.ChannelName)) map.set(v.ChannelName, []);
      map.get(v.ChannelName)!.push(v);
    });
    return Array.from(map.entries()).map(([name, vids]) => ({
      name,
      videos: vids,
      avatar: vids[0].ChannelAvatar
    })).sort((a, b) => b.videos.length - a.videos.length);
  }, [day.videos]);

  const formattedFullDate = `${d.month}月${d.day}日`;

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const handleScroll = () => {
      const maxScroll = el.scrollWidth - el.clientWidth;
      if (maxScroll <= 0) {
        setScrollProgress(0);
        return;
      }
      setScrollProgress(el.scrollLeft / maxScroll);
    };

    el.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    
    return () => el.removeEventListener('scroll', handleScroll);
  }, [groupedByChannel]);

  const ViewMoreButton = ({ mobile = false }: { mobile?: boolean }) => (
    <button 
      onClick={(e) => {
        e.stopPropagation();
        onDateClick?.(formattedFullDate, day.videos);
      }}
      className={`group/btn flex items-center justify-center transition-all duration-500 shadow-sm active:scale-95 shrink-0
        ${mobile 
          ? `w-10 h-10 rounded-full border ${isZenith ? 'bg-white/10 text-white border-white/20' : 'bg-white text-red-600 border-gray-100 shadow-lg shadow-red-900/5'}`
          : `px-5 py-2.5 rounded-full border ${isZenith ? 'bg-white/5 backdrop-blur-md md:hover:bg-white text-white/70 md:hover:text-red-950 border-white/10 md:hover:border-white' : 'bg-white md:hover:bg-red-50 text-red-900/40 md:hover:text-red-600 border-gray-100 md:hover:border-red-600/20'}`
        }`}
    >
      {!mobile && <span className="text-[11px] md:text-[13px] font-black uppercase tracking-[0.2em] whitespace-nowrap mr-2">查看更多</span>}
      <ChevronRight size={mobile ? 18 : 14} className="transition-transform md:group-hover/btn:translate-x-0.5" />
    </button>
  );

  return (
    <div 
      onClick={() => onDateClick?.(formattedFullDate, day.videos)}
      className={`flex flex-col md:flex-row gap-4 md:gap-8 items-stretch md:items-center py-6 border-b last:border-0 group/day-row cursor-pointer md:hover:bg-red-50/10 active:bg-red-50/20 transition-colors ${isZenith ? 'border-white/5' : 'border-red-50/50'}`}
    >
      <div className="flex items-center justify-between md:flex-col md:items-start md:justify-start gap-3 shrink-0 md:min-w-[120px] px-1">
        <div className="flex flex-row md:flex-col items-center md:items-start gap-3 md:gap-2">
          <div className="flex items-baseline gap-1">
            <span className={`font-black text-2xl md:text-3xl tracking-tighter tabular-nums leading-none ${isZenith ? 'text-white' : 'text-red-950'}`}>
              {d.month}<span className="text-red-400 mx-0.5">/</span>{d.day}
            </span>
          </div>
          <div className={`hidden md:block h-px w-8 ${isZenith ? 'bg-white/10' : 'bg-red-950/10'}`}></div>
          <div className="flex flex-row md:flex-col items-center md:items-start gap-2 md:gap-2">
            <span className={`text-[10px] md:text-xs font-black uppercase tracking-widest ${isZenith ? 'text-white/40' : 'text-red-900/40'}`}>
              {getDayOfWeek(day.date)}
            </span>
            <span className={`text-[9px] md:text-[11px] font-black uppercase tracking-tight md:tracking-normal px-1.5 py-0.5 rounded-md border whitespace-nowrap ${isZenith ? 'bg-white/5 text-amber-400 border-white/10' : 'bg-red-50 text-red-600 border-red-100'}`}>
              {groupedByChannel.length} 位创作者
            </span>
          </div>
        </div>
        <div className="md:hidden">
          <ViewMoreButton mobile={true} />
        </div>
      </div>

      <div className="flex-1 w-full overflow-hidden flex flex-col items-stretch gap-1 md:gap-2">
        <div 
          ref={scrollRef}
          className="flex overflow-x-auto custom-scrollbar-thin gap-6 md:gap-10 snap-x pb-2"
        >
          {groupedByChannel.map((chan, idx) => {
            const v = chan.videos[0];
            const hasMultipleVids = chan.videos.length > 1;
            return (
              <div 
                key={chan.name + idx} 
                className="group/chan shrink-0 w-40 md:w-64 flex flex-col gap-3 transition-all duration-300 cursor-pointer snap-start relative"
                onClick={(e) => {
                  e.stopPropagation();
                  onDateClick?.(`${formattedFullDate} - ${chan.name}`, chan.videos);
                }}
              >
                <div className="relative w-full h-24 md:h-36 overflow-hidden rounded-[1rem] md:rounded-[1.2rem] shadow-md border md:group-hover/chan:shadow-xl transition-shadow duration-500 bg-gray-100">
                  <div className={`w-full h-full relative ${isZenith ? 'border-white/10' : 'border-red-900/5'}`}>
                    <img 
                      src={v.Thumbnail} 
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 md:group-hover/chan:scale-105" 
                      alt="" 
                    />
                    <div className={`absolute inset-0 transition-colors ${isZenith ? 'bg-red-950/20 md:group-hover/chan:bg-transparent' : 'bg-black/5 md:group-hover/chan:bg-transparent'}`}></div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 md:group-hover/chan:opacity-100 transition-opacity">
                      <div className="bg-red-900 p-2 md:p-3 rounded-full shadow-2xl transform scale-75 md:group-hover/chan:scale-100 transition-transform">
                        <Play size={20} fill="currentColor" className="text-white" />
                      </div>
                    </div>
                  </div>
                  {hasMultipleVids && (
                    <div className="absolute top-1.5 right-1.5 z-[55] bg-white text-red-950 text-[10px] md:text-[11px] font-black px-2 py-0.5 rounded-full shadow-xl border border-red-900/10 transform md:group-hover/chan:scale-110 transition-transform">
                      {chan.videos.length}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 px-1">
                  <img 
                    src={chan.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(chan.name)}&background=random`} 
                    className={`w-6 h-6 md:w-8 md:h-8 rounded-lg object-cover border shadow-sm md:group-hover/chan:border-red-400 transition-colors ${isZenith ? 'border-white/10' : 'border-red-100'}`} 
                    alt={chan.name} 
                  />
                  <div className="min-w-0">
                    <h6 className={`font-black text-[10px] md:text-xs truncate uppercase tracking-tight transition-colors ${isZenith ? 'text-white/70 md:group-hover/chan:text-white' : 'text-red-950/60 md:group-hover/chan:text-red-600'}`}>
                      {chan.name}
                    </h6>
                  </div>
                </div>
              </div>
            );
          })}
          <div className="shrink-0 w-4"></div>
        </div>

        <div className="h-4 md:h-5 flex items-center justify-center">
          {groupedByChannel.length > 1 ? (
            <div className="flex items-center gap-2">
              {groupedByChannel.map((_, i) => {
                const dotProgress = i / (groupedByChannel.length - 1 || 1);
                const isActive = Math.abs(scrollProgress - dotProgress) < (1 / (groupedByChannel.length || 1));
                return (
                  <div 
                    key={i} 
                    className={`h-1 rounded-full transition-all duration-500 
                      ${isActive 
                        ? (isZenith ? 'w-5 md:w-8 bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]' : 'w-5 md:w-8 bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.3)]') 
                        : (isZenith ? 'w-1.5 bg-white/20' : 'w-1.5 bg-red-900/10')}`}
                  />
                );
              })}
            </div>
          ) : (
            <div className="w-full h-px bg-transparent"></div>
          )}
        </div>
      </div>

      <div className="hidden md:flex items-center">
        <ViewMoreButton />
      </div>
    </div>
  );
};

const PeakDayCard: React.FC<{
  group: PeakGroup;
  index: number;
  isZenith?: boolean;
  onDateClick?: (date: string, videos: VideoData[]) => void;
  mousePos: { x: number; y: number };
}> = ({ group, index, isZenith = false, onDateClick, mousePos }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const rank = index + 1;

  const dateTags = useMemo(() => {
    const weekdayChars = ['日', '一', '二', '三', '四', '五', '六'];
    return group.days.map(day => {
      const d = new Date(day.date);
      if (isNaN(d.getTime())) return '??/??';
      const month = (d.getMonth() + 1).toString().padStart(2, '0');
      const date = d.getDate().toString().padStart(2, '0');
      const weekday = weekdayChars[d.getDay()];
      return `${month}/${date} (${weekday})`;
    });
  }, [group.days]);

  return (
    <div className={`relative flex flex-col transition-all duration-700 w-full border-b last:border-0
      ${isZenith ? 'bg-red-950 overflow-hidden' : 'bg-transparent'}`}>
      
      {isZenith && (
        <div className="absolute inset-0 z-0">
          <div 
            className="absolute inset-0 transition-transform duration-1000 ease-out scale-110 opacity-20"
            style={{ transform: `translate(${mousePos.x * 10}px, ${mousePos.y * 10}px)` }}
          >
            <img src={group.days[0].videos[0]?.Thumbnail} className="w-full h-full object-cover blur-3xl scale-125" alt="" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-red-950 via-red-900/40 to-amber-900/10"></div>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/rice-paper.png')] opacity-[0.05] mix-blend-overlay"></div>
        </div>
      )}

      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className={`relative z-10 p-5 md:p-8 flex items-center justify-between gap-4 transition-all cursor-pointer group/header active:scale-[0.99] active:opacity-90
          ${isZenith ? 'md:hover:bg-red-950/40' : 'md:hover:bg-red-50/20'}`}
      >
        <div className="flex items-center gap-5 md:gap-8">
          <div className="relative">
            <div className={`w-10 h-10 md:w-14 md:h-14 flex items-center justify-center rounded-xl md:rounded-2xl font-black text-sm md:text-xl shadow-xl backdrop-blur-md border border-white/20 shrink-0 relative z-10
              ${rank === 1 ? 'bg-amber-500 text-white' : 
                rank === 2 ? 'bg-slate-500 text-white' : 
                rank === 3 ? 'bg-orange-500 text-white' : 'bg-red-950 text-white'}`}
            >
              <span className={`tracking-tighter tabular-nums ${rank === 1 ? 'animate-pulse' : ''}`}>
                {rank}
              </span>
            </div>
          </div>

          <div className="flex flex-col">
            <div className="flex items-baseline gap-2.5 md:gap-3">
              <span className={`font-black text-2xl md:text-4xl tabular-nums leading-none tracking-tighter drop-shadow-lg ${isZenith ? 'text-white' : 'text-red-950'}`}>
                {group.count}
              </span>
              <span className={`font-black text-[10px] md:text-xs uppercase tracking-[0.2em] ${isZenith ? 'text-white/40' : 'text-red-900/40'}`}>
                作品爆发量
              </span>
            </div>
            
            <div className="flex flex-col gap-1.5 mt-1.5 md:mt-2">
              <p className={`text-[9px] md:text-[11px] font-bold uppercase tracking-widest ${isZenith ? 'text-amber-400/60' : 'text-red-900/30'}`}>
                共有 {group.days.length} 个日期达到此强度
              </p>
              
              {!isExpanded && (
                <div className="flex flex-wrap gap-1.5 md:gap-2">
                  {dateTags.map((tag, i) => (
                    <span 
                      key={i} 
                      className={`text-[12px] md:text-[14px] font-black tabular-nums px-3 py-1 rounded-lg border 
                        ${isZenith 
                          ? 'bg-white/10 text-white border-white/20' 
                          : 'bg-red-50 text-red-700 border-red-100'}`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className={`p-1.5 md:p-2 rounded-full transition-all duration-300
          ${isZenith ? 'bg-white/5 text-white/40 md:group-hover/header:bg-white/10 md:group-hover/header:text-white' : 'bg-red-50 text-red-900/20 md:group-hover/header:bg-red-100 md:group-hover/header:text-red-600'}`}>
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </div>

      {isExpanded && (
        <div className="relative z-10 flex-1 p-5 md:px-12 md:py-8 flex flex-col animate-in fade-in slide-in-from-top-4 duration-500">
          {group.days.map((day) => (
            <DayRow 
              key={day.date} 
              day={day} 
              isZenith={isZenith} 
              onDateClick={onDateClick} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const ReleasePeakStats: React.FC<Props> = ({ videos, t, onDateClick }) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isChartsVisible, setIsChartsVisible] = useState(false);
  const chartsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsChartsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );
    if (chartsRef.current) observer.observe(chartsRef.current);
    return () => observer.disconnect();
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    // Only track mouse position on larger screens to improve mobile performance and prevent tap interference
    if (window.innerWidth < 768) return;
    
    const { clientX, clientY, currentTarget } = e;
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    const x = (clientX - left) / width - 0.5;
    const y = (clientY - top) / height - 0.5;
    setMousePos({ x, y });
  };

  const { peakGroups, distributionData } = useMemo(() => {
    const dayMap = new Map<string, VideoData[]>();
    const monthStats: Record<string, number> = {};
    const weekdayStats: number[] = new Array(7).fill(0);
    
    videos.forEach(v => {
      const rawDate = v.PublishDate;
      if (!rawDate) return;
      const d = new Date(rawDate);
      if (isNaN(d.getTime())) return;

      const mKey = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
      monthStats[mKey] = (monthStats[mKey] || 0) + 1;
      const dayIdx = (d.getDay() + 6) % 7;
      weekdayStats[dayIdx] += 1;
      const dateKey = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
      if (!dayMap.has(dateKey)) dayMap.set(dateKey, []);
      dayMap.get(dateKey)!.push(v);
    });

    const peakDays = Array.from(dayMap.entries())
      .map(([date, vids]) => ({
        date,
        count: vids.length,
        videos: vids.sort((a, b) => (b.Views || 0) - (a.Views || 0))
      }))
      .sort((a, b) => b.count - a.count);

    const groupsByCount = new Map<number, PeakDay[]>();
    peakDays.forEach(day => {
      if (!groupsByCount.has(day.count)) groupsByCount.set(day.count, []);
      groupsByCount.get(day.count)!.push(day);
    });

    const sortedCounts = Array.from(groupsByCount.keys()).sort((a, b) => b - a);
    const finalGroups = sortedCounts.map(count => {
      const days = groupsByCount.get(count)!.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      return { count, days };
    }).slice(0, 5);

    return {
      peakGroups: finalGroups,
      distributionData: {
        months: Object.entries(monthStats).sort((a, b) => a[0].localeCompare(b[0])),
        weekdays: weekdayStats
      }
    };
  }, [videos]);

  if (peakGroups.length === 0) return null;

  const maxMonthVal = Math.max(...distributionData.months.map(m => m[1]), 1);
  const maxWeekdayVal = Math.max(...distributionData.weekdays, 1);
  const weekdayNames = ['一', '二', '三', '四', '五', '六', '日'];

  return (
    <div className="w-full">
      <div className="mb-10 md:mb-16 flex flex-col items-center justify-center text-center">
        <div className="flex items-center gap-3 md:gap-4 mb-3">
          <Flame className="text-red-600 animate-pulse w-5 h-5 md:w-6 md:h-6" />
          <span className="text-red-900/30 font-black text-[10px] md:text-xs uppercase tracking-[0.3em] md:tracking-[0.6em]">Release Momentum Analysis</span>
          <Flame className="text-red-600 animate-pulse w-5 h-5 md:w-6 md:h-6" />
        </div>
        <h2 className="text-3xl md:text-6xl font-black text-red-950 font-cny tracking-tight relative px-4">
          新年歌曲发布趋势
          <div className="absolute -bottom-4 md:-bottom-6 left-1/2 -translate-x-1/2 w-20 md:w-32 h-1.5 bg-gradient-to-r from-transparent via-red-600 to-transparent rounded-full"></div>
        </h2>
        <p className="mt-8 md:mt-12 text-[11px] md:text-sm font-bold text-red-900/40 uppercase tracking-[0.1em] md:tracking-[0.2em] bg-red-50/50 px-6 py-3 rounded-full border border-red-100/30">
          深度解析新年歌曲的发布节奏与峰值强度，捕捉作品宣发的核心爆发周期
        </p>
      </div>

      <div className="flex flex-col gap-10 md:gap-16">
        <div ref={chartsRef} className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16">
          {/* Monthly Chart Container */}
          <div className="bg-white rounded-[2.5rem] md:rounded-[3rem] p-7 md:p-10 border border-red-50/50 shadow-xl relative overflow-hidden">
            <div className="relative z-10 flex items-center gap-4 mb-8">
              <div className="p-2.5 md:p-3.5 bg-red-950 text-white rounded-2xl shadow-lg">
                <Calendar size={20} className="md:size-5" />
              </div>
              <div>
                <h4 className="text-lg md:text-2xl font-black text-red-950 font-cny tracking-tight leading-none">月份发布统计</h4>
                <p className="text-red-900/20 text-[8px] md:text-[9px] font-bold uppercase tracking-widest mt-1">Monthly Release Volume</p>
              </div>
            </div>
            <div className="flex items-end justify-between gap-1.5 md:gap-2 h-40 md:h-56 px-1 md:px-4 relative">
              {distributionData.months.map(([mKey, count], idx) => {
                const height = (count / maxMonthVal) * 100;
                const delay = idx * 100;
                return (
                  <div key={mKey} className="flex-1 flex flex-col items-center group/bar relative h-full justify-end">
                    <div 
                      className="w-full max-w-[48px] md:max-w-[72px] transition-all origin-bottom relative rounded-t-lg md:rounded-t-xl bg-gradient-to-t from-red-950 to-red-600"
                      style={{ 
                        height: isChartsVisible ? `${height}%` : '0%', 
                        transitionDuration: '1.4s',
                        transitionDelay: `${delay}ms`,
                        transitionTimingFunction: 'cubic-bezier(0.19, 1, 0.22, 1)'
                      }}
                    >
                      <div className="absolute -top-7 md:-top-9 left-1/2 -translate-x-1/2 text-[10px] md:text-base font-black text-red-950">
                        <AnimatedNumber value={count} isVisible={isChartsVisible} delay={delay + 800} />
                      </div>
                    </div>
                    <div className="mt-3 md:mt-5 text-center">
                      <span className="text-red-950/60 font-black text-[9px] md:text-xs">{mKey.split('-')[1]}月</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Weekday Chart Container */}
          <div className="bg-white rounded-[2.5rem] md:rounded-[3rem] p-7 md:p-10 border border-red-50/50 shadow-xl relative overflow-hidden">
            <div className="relative z-10 flex items-center gap-4 mb-8">
              <div className="p-2.5 md:p-3.5 bg-red-950 text-white rounded-2xl shadow-lg">
                <Zap size={20} className="md:size-5" />
              </div>
              <div>
                <h4 className="text-lg md:text-2xl font-black text-red-950 font-cny tracking-tight leading-none">周发布频次</h4>
                <p className="text-red-900/20 text-[8px] md:text-[9px] font-bold uppercase tracking-widest mt-1">Weekday Launch Data</p>
              </div>
            </div>
            <div className="flex items-end justify-between gap-1.5 md:gap-2 h-40 md:h-56 px-1 md:px-4 relative">
              {distributionData.weekdays.map((count, idx) => {
                const height = (count / maxWeekdayVal) * 100;
                const delay = idx * 80;
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center group/bar relative h-full justify-end">
                    <div 
                      className={`w-full max-w-[44px] md:max-w-[64px] transition-all origin-bottom relative rounded-t-lg md:rounded-t-xl ${idx >= 4 ? 'bg-gradient-to-t from-amber-600 to-amber-400' : 'bg-gradient-to-t from-red-950 to-red-600'}`}
                      style={{ 
                        height: isChartsVisible ? `${height}%` : '0%', 
                        transitionDuration: '1.4s', 
                        transitionDelay: `${delay}ms`,
                        transitionTimingFunction: 'cubic-bezier(0.19, 1, 0.22, 1)'
                      }}
                    >
                      <div className="absolute -top-7 md:-top-9 left-1/2 -translate-x-1/2 text-[10px] md:text-base font-black text-red-950">
                        <AnimatedNumber value={count} isVisible={isChartsVisible} delay={delay + 800} />
                      </div>
                    </div>
                    <div className="mt-3 md:mt-5 text-center">
                      <span className={`font-black text-[9px] md:text-xs ${idx >= 4 ? 'text-amber-600' : 'text-red-950/60'}`}>{weekdayNames[idx]}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Hall of Fame Container - Unified edge-to-edge content */}
        <div 
          className="bg-white rounded-[2.5rem] md:rounded-[3.5rem] border border-red-50/50 shadow-xl relative overflow-hidden" 
          onMouseMove={handleMouseMove}
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between px-6 pt-10 md:px-12 md:pt-14 mb-8 gap-4 relative z-10">
             <div className="flex flex-col gap-3">
                <div className="flex items-center gap-4">
                  <div className="bg-amber-500 p-2.5 md:p-3.5 rounded-2xl text-white shadow-lg">
                    <Trophy size={20} className="md:size-5" />
                  </div>
                  <div>
                    <h3 className="text-lg md:text-2xl font-black text-red-950 font-cny tracking-tight leading-none">单日发布最多新年歌</h3>
                    <p className="text-red-900/20 text-[8px] md:text-[9px] font-bold uppercase tracking-widest mt-1">Peak Release Days Leaderboard</p>
                  </div>
                </div>
             </div>
          </div>

          <div className="relative">
            <div className="flex flex-col relative z-10">
              {peakGroups.map((group, idx) => (
                <PeakDayCard 
                  key={group.count}
                  group={group}
                  index={idx}
                  isZenith={idx === 0}
                  onDateClick={onDateClick}
                  mousePos={mousePos}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <style>{`
        .custom-scrollbar-thin::-webkit-scrollbar {
          display: none;
        }
        .custom-scrollbar-thin {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};
