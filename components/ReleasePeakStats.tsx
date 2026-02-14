
import React, { useMemo, useState, useEffect, useRef } from 'react';
import { VideoData, Translations } from '../types';
import { Calendar, Zap, TrendingUp, ChevronRight, Users, Play, Star, Sparkles, Flame, Maximize2, Plus } from 'lucide-react';

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

  // Scroll Progress Listener
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const handleScroll = () => {
      const maxScroll = el.scrollWidth - el.clientWidth;
      if (maxScroll <= 0) return;
      setScrollProgress(el.scrollLeft / maxScroll);
    };

    el.addEventListener('scroll', handleScroll, { passive: true });
    // Initial check
    handleScroll();
    
    return () => el.removeEventListener('scroll', handleScroll);
  }, [groupedByChannel]);

  const ViewMoreButton = ({ mobile = false }: { mobile?: boolean }) => (
    <button 
      onClick={() => onDateClick?.(formattedFullDate, day.videos)}
      className={`group/btn flex items-center justify-center transition-all duration-500 shadow-sm active:scale-95 shrink-0
        ${mobile 
          ? `w-9 h-9 rounded-full border ${isZenith ? 'bg-white/10 text-white border-white/20' : 'bg-white text-red-600 border-gray-100 shadow-lg shadow-red-900/5'}`
          : `px-5 py-2.5 rounded-full border ${isZenith ? 'bg-white/5 backdrop-blur-md hover:bg-white text-white/70 hover:text-red-950 border-white/10 hover:border-white' : 'bg-white hover:bg-red-50 text-red-900/40 hover:text-red-600 border-gray-100 hover:border-red-600/20'}`
        }`}
    >
      {!mobile && <span className="text-[11px] md:text-xs font-black uppercase tracking-[0.2em] whitespace-nowrap mr-2">查看更多</span>}
      <ChevronRight size={mobile ? 16 : 14} className="transition-transform group-hover/btn:translate-x-0.5" />
    </button>
  );

  // Pagination dots logic: assuming each item is a "page" roughly
  const showScrollIndicators = groupedByChannel.length > 1;

  return (
    <div className={`flex flex-col md:flex-row gap-4 md:gap-6 items-stretch md:items-center py-3 md:py-5 border-b last:border-0 group/day-row ${isZenith ? 'border-white/5' : 'border-red-50'}`}>
      
      {/* Date Header & Action (Mobile side-by-side, Desktop vertical) */}
      <div className="flex items-center justify-between md:flex-col md:items-start md:justify-start gap-3 shrink-0 md:min-w-[90px]">
        <div className="flex flex-row md:flex-col items-center md:items-start gap-2 md:gap-1">
          <div className="flex items-baseline gap-1">
            <span className={`font-black text-xl md:text-2xl tracking-tighter tabular-nums leading-none ${isZenith ? 'text-white' : 'text-red-950'}`}>
              {d.month}<span className="text-red-400 mx-0.5">/</span>{d.day}
            </span>
          </div>
          <div className={`hidden md:block h-px w-6 ${isZenith ? 'bg-white/10' : 'bg-red-950/10'}`}></div>
          <span className={`text-[9px] md:text-[10px] font-black uppercase tracking-widest ${isZenith ? 'text-white/40' : 'text-red-900/40'}`}>
            {getDayOfWeek(day.date)}
          </span>
        </div>
        
        {/* View More Button for Mobile - Only Right Arrow Circle */}
        <div className="md:hidden">
          <ViewMoreButton mobile={true} />
        </div>
      </div>

      {/* Video Scroll */}
      <div className="flex-1 w-full overflow-hidden relative flex flex-col gap-3">
        <div 
          ref={scrollRef}
          className="flex overflow-x-auto custom-scrollbar-thin gap-5 md:gap-8 pb-1 snap-x"
        >
          {groupedByChannel.map((chan, idx) => {
            const isStacked = chan.videos.length > 1;
            return (
              <div 
                key={chan.name + idx} 
                className="group/chan shrink-0 w-32 md:w-44 flex flex-col gap-2 transition-all duration-300 cursor-pointer snap-start"
                onClick={(e) => {
                  e.stopPropagation();
                  onDateClick?.(chan.videos[0].VideoTitle, [chan.videos[0]]);
                }}
              >
                <div className="relative aspect-video w-full group/stack">
                  {chan.videos.slice(0, 3).map((v, i) => (
                    <div key={v.VideoURL + i} className={`absolute bottom-0 left-0 w-full h-full transition-all duration-700 shadow-2xl border ${isZenith ? 'border-white/10' : 'border-red-900/5'}`} style={{ 
                        transform: `translate(${i * 3}px, ${i * -3}px) scale(${1 - i * 0.04})`,
                        '--hover-transform': `translate(${i * 6}px, ${i * -6}px) scale(${1 - i * 0.02})`,
                        zIndex: 10 - i,
                        opacity: 1 - i * 0.25,
                        borderRadius: '0.6rem'
                      } as React.CSSProperties}>
                      <div className="w-full h-full rounded-[0.6rem] overflow-hidden relative shadow-lg">
                        <img src={v.Thumbnail} className="w-full h-full object-cover" alt="" />
                        <div className={`absolute inset-0 transition-colors ${isZenith ? 'bg-red-950/20 group-hover/chan:bg-transparent' : 'bg-black/5 group-hover/chan:bg-transparent'}`}></div>
                        {i === 0 && (
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/chan:opacity-100 transition-opacity">
                            <div className="bg-red-900 p-1 rounded-full shadow-2xl transform scale-75 group-hover/chan:scale-100 transition-transform">
                              <Play size={10} fill="currentColor" className="text-white" />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {isStacked && (
                    <div className="absolute -top-1 -right-1 z-[50] bg-white text-red-950 text-[7px] font-black px-1 py-0.5 rounded-full shadow-lg border border-red-900/10 transform group-hover/chan:scale-110 transition-transform">
                      {chan.videos.length}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 px-1">
                  <img 
                    src={chan.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(chan.name)}&background=random`} 
                    className={`w-5 h-5 rounded-md object-cover border shadow-sm group-hover/chan:border-red-400 transition-colors ${isZenith ? 'border-white/10' : 'border-red-100'}`} 
                    alt={chan.name} 
                  />
                  <div className="min-w-0">
                    <h6 className={`font-black text-[8px] md:text-[9px] truncate uppercase tracking-tight transition-colors ${isZenith ? 'text-white/70 group-hover/chan:text-white' : 'text-red-950/60 group-hover/chan:text-red-600'}`}>
                      {chan.name}
                    </h6>
                  </div>
                </div>
              </div>
            );
          })}
          <div className="shrink-0 w-4"></div>
        </div>

        {/* Centered Scroll Indicators / Dots */}
        {showScrollIndicators && (
          <div className="flex items-center justify-center gap-1 md:gap-1.5 px-1">
            {groupedByChannel.map((_, i) => {
              const dotProgress = i / (groupedByChannel.length - 1 || 1);
              const isActive = Math.abs(scrollProgress - dotProgress) < (1 / (groupedByChannel.length || 1));
              return (
                <div 
                  key={i} 
                  className={`h-0.5 rounded-full transition-all duration-300 
                    ${isActive 
                      ? (isZenith ? 'w-3 md:w-5 bg-amber-400' : 'w-3 md:w-5 bg-red-600') 
                      : (isZenith ? 'w-1 bg-white/20' : 'w-1 bg-red-900/10')}`}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* View More Button for Desktop */}
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
  const rank = index + 1;
  return (
    <div className={`relative rounded-[2rem] md:rounded-[3rem] overflow-hidden group shadow-2xl flex flex-col transition-all duration-700 w-full
      ${isZenith ? 'bg-red-950 ring-1 ring-white/10' : 'bg-white border border-red-50/50'}`}>
      
      {/* Background Decor */}
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

      {/* Header Container */}
      <div className={`relative z-10 p-4 md:p-5 flex flex-wrap items-center justify-between gap-4 border-b transition-colors
        ${isZenith ? 'border-white/5 bg-red-950/20 backdrop-blur-xl' : 'border-red-50 bg-red-50/10'}`}>
        
        <div className="flex items-center gap-4 md:gap-6">
          {/* Rank Indicator Styled like Leaderboard */}
          <div className={`w-9 h-9 md:w-12 md:h-12 flex items-center justify-center rounded-xl md:rounded-[1.2rem] font-black text-sm md:text-lg shadow-xl backdrop-blur-md border border-white/20 shrink-0
            ${rank === 1 ? 'bg-amber-500 text-white' : 
              rank === 2 ? 'bg-slate-500 text-white' : 
              rank === 3 ? 'bg-orange-500 text-white' : 'bg-red-950/80 text-white'}`}
          >
            <span className={`tracking-tighter tabular-nums ${rank === 1 ? 'animate-pulse' : ''}`}>
              {rank}
            </span>
          </div>
          
          <div className="flex flex-col">
            <div className="flex items-baseline gap-2">
              <span className={`font-black text-2xl md:text-4xl tabular-nums leading-none tracking-tighter drop-shadow-lg ${isZenith ? 'text-white' : 'text-red-950'}`}>
                {group.count}
              </span>
              <span className={`font-black text-[9px] md:text-[11px] uppercase tracking-[0.2em] ${isZenith ? 'text-white/40' : 'text-red-900/40'}`}>
                作品爆发量
              </span>
            </div>
            <p className={`text-[9px] md:text-[10px] font-bold uppercase tracking-widest mt-0.5 ${isZenith ? 'text-amber-400' : 'text-red-600/60'}`}>
              共有 {group.days.length} 个日期达到此强度
            </p>
          </div>
        </div>
      </div>

      <div className="relative z-10 flex-1 p-4 md:p-6 flex flex-col">
        {group.days.map((day, idx) => (
          <DayRow 
            key={day.date} 
            day={day} 
            isZenith={isZenith} 
            onDateClick={onDateClick} 
          />
        ))}
      </div>
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
        if (entry.isIntersecting) {
          setIsChartsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (chartsRef.current) {
      observer.observe(chartsRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
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

    const peakDays: PeakDay[] = Array.from(dayMap.entries())
      .map(([date, vids]) => ({
        date,
        count: vids.length,
        videos: vids.sort((a, b) => (b.Views || 0) - (a.Views || 0))
      }))
      .sort((a, b) => b.count - a.count);

    // Grouping logic: group dates that have the same number of work (count)
    const groupsByCount = new Map<number, PeakDay[]>();
    peakDays.forEach(day => {
      if (!groupsByCount.has(day.count)) {
        groupsByCount.set(day.count, []);
      }
      groupsByCount.get(day.count)!.push(day);
    });

    const sortedCounts = Array.from(groupsByCount.keys()).sort((a, b) => b - a);
    
    const finalGroups: PeakGroup[] = sortedCounts.map(count => {
      const days = groupsByCount.get(count)!.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      return { count, days };
    }).slice(0, 5); // Display top 5 groupings of intensity

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
        <div className="flex items-center gap-2 md:gap-3 mb-2">
          <Flame className="text-red-600 animate-pulse w-4 h-4 md:w-5 md:h-5" />
          <span className="text-red-900/30 font-black text-[9px] md:text-[10px] uppercase tracking-[0.3em] md:tracking-[0.5em]">Release Momentum Analysis</span>
          <Flame className="text-red-600 animate-pulse w-4 h-4 md:w-5 md:h-5" />
        </div>
        <h2 className="text-2xl md:text-5xl font-black text-red-950 font-cny tracking-tight relative px-4">
          新年歌曲发布趋势
          <div className="absolute -bottom-3 md:-bottom-4 left-1/2 -translate-x-1/2 w-16 md:w-24 h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent rounded-full"></div>
        </h2>
        <p className="mt-6 text-[10px] md:text-xs font-bold text-red-900/40 uppercase tracking-[0.1em] md:tracking-[0.2em] bg-red-50/50 px-4 py-1.5 rounded-full border border-red-100/30">
          深度解析新年歌曲的发布节奏与峰值强度，捕捉作品宣发的核心爆发周期
        </p>
      </div>

      <div ref={chartsRef} className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-12 md:mb-16">
        {/* Monthly Chart */}
        <div className="bg-white rounded-[2rem] p-8 md:p-10 border border-red-50/50 shadow-2xl relative overflow-hidden">
          <div className="relative z-10 flex items-center gap-3 mb-10">
            <div className="p-2.5 bg-red-950 text-white rounded-xl shadow-lg">
              <Calendar size={18} />
            </div>
            <div>
              <h4 className="text-red-950 font-black text-lg font-cny">月份发布统计</h4>
              <p className="text-red-900/20 text-[7px] font-bold uppercase tracking-widest mt-0.5">Monthly Release Volume</p>
            </div>
          </div>

          <div className="flex items-end justify-between gap-3 h-48 px-1 relative">
            {distributionData.months.map(([mKey, count], idx) => {
              const height = (count / maxMonthVal) * 100;
              const delay = idx * 100;
              return (
                <div key={mKey} className="flex-1 flex flex-col items-center group/bar relative h-full justify-end">
                  <div 
                    className="w-full max-w-[32px] transition-all origin-bottom relative rounded-t-lg bg-gradient-to-t from-red-950 to-red-600"
                    style={{ 
                      height: isChartsVisible ? `${height}%` : '0%', 
                      transitionDuration: '1.4s',
                      transitionDelay: `${delay}ms`,
                      transitionTimingFunction: 'cubic-bezier(0.19, 1, 0.22, 1)'
                    }}
                  >
                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-black text-red-950">
                      <AnimatedNumber value={count} isVisible={isChartsVisible} delay={delay + 800} />
                    </div>
                  </div>
                  <div className="mt-3 text-center">
                    <span className="text-red-950/60 font-black text-[9px]">{mKey.split('-')[1]}月</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Weekday Chart */}
        <div className="bg-white rounded-[2rem] p-8 md:p-10 border border-red-50/50 shadow-2xl relative overflow-hidden">
          <div className="relative z-10 flex items-center gap-3 mb-10">
            <div className="p-2.5 bg-red-950 text-white rounded-xl shadow-lg">
              <Zap size={18} />
            </div>
            <div>
              <h4 className="text-red-950 font-black text-lg font-cny">周发布频次</h4>
              <p className="text-red-900/20 text-[7px] font-bold uppercase tracking-widest mt-0.5">Weekday Launch Data</p>
            </div>
          </div>

          <div className="flex items-end justify-between gap-3 h-48 px-1 relative">
            {distributionData.weekdays.map((count, idx) => {
              const height = (count / maxWeekdayVal) * 100;
              const delay = idx * 80;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center group/bar relative h-full justify-end">
                  <div 
                    className={`w-full max-w-[28px] transition-all origin-bottom relative rounded-t-lg ${idx >= 4 ? 'bg-gradient-to-t from-amber-600 to-amber-400' : 'bg-gradient-to-t from-red-950 to-red-600'}`}
                    style={{ 
                      height: isChartsVisible ? `${height}%` : '0%', 
                      transitionDuration: '1.4s', 
                      transitionDelay: `${delay}ms`,
                      transitionTimingFunction: 'cubic-bezier(0.19, 1, 0.22, 1)'
                    }}
                  >
                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-black text-red-950">
                      <AnimatedNumber value={count} isVisible={isChartsVisible} delay={delay + 800} />
                    </div>
                  </div>
                  <div className="mt-3 text-center">
                    <span className={`font-black text-[9px] ${idx >= 4 ? 'text-amber-600' : 'text-red-950/60'}`}>{weekdayNames[idx]}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6 md:gap-8" onMouseMove={handleMouseMove}>
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
      
      <style>{`
        .group\\/chan:hover .group\\/stack > div {
          transform: var(--hover-transform) !important;
        }
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
