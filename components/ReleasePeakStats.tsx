import React, { useMemo, useState } from 'react';
import { VideoData, Translations } from '../types';
import { ArrowRight, Trophy, Users, Flame, Calendar, ChevronRight, Sparkles, Star, Zap, Play, Layers, Eye, TrendingUp } from 'lucide-react';

interface PeakDay {
  date: string;
  count: number;
  videos: VideoData[];
  breakdown: { name: string; count: number; avatar: string }[];
}

interface PeakGroup {
  count: number;
  days: PeakDay[];
  combinedVideos: VideoData[];
  combinedBreakdown: { name: string; count: number; avatar: string }[];
}

interface Props {
  videos: VideoData[];
  t: Translations;
  onDateClick?: (date: string, videos: VideoData[]) => void;
}

const CalendarDate: React.FC<{ 
  date: string; 
  onClick?: () => void;
  accentColor?: string;
}> = ({ date, onClick, accentColor = "bg-red-600" }) => {
  const d = new Date(date);
  if (isNaN(d.getTime())) return null;
  
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');

  return (
    <div 
      onClick={onClick}
      className={`${accentColor} text-white w-10 md:w-12 h-10 md:h-12 rounded-xl flex flex-col items-center justify-center font-black shadow-lg transform hover:scale-105 transition-all cursor-pointer shrink-0 border border-white/10`}
    >
      <span className="text-[7px] md:text-[8px] uppercase leading-none mb-0.5 opacity-60 tracking-widest">{month}</span>
      <span className="text-sm md:text-lg leading-none tracking-tighter">{day}</span>
    </div>
  );
};

export const ReleasePeakStats: React.FC<Props> = ({ videos, t, onDateClick }) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY, currentTarget } = e;
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    const x = (clientX - left) / width - 0.5;
    const y = (clientY - top) / height - 0.5;
    setMousePos({ x, y });
  };

  const { peakGroups } = useMemo(() => {
    const dayMap = new Map<string, VideoData[]>();
    
    videos.forEach(v => {
      const rawDate = v.PublishDate;
      if (!rawDate) return;

      const d = new Date(rawDate);
      if (isNaN(d.getTime())) {
        if (!dayMap.has(rawDate)) dayMap.set(rawDate, []);
        dayMap.get(rawDate)!.push(v);
        return;
      }

      const dateKey = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
      
      if (!dayMap.has(dateKey)) dayMap.set(dateKey, []);
      dayMap.get(dateKey)!.push(v);
    });

    const peakDays = Array.from(dayMap.entries())
      .map(([date, vids]) => {
        const breakdownMap: Record<string, { count: number, avatar: string }> = {};
        vids.forEach(v => {
          if (!breakdownMap[v.ChannelName]) {
            breakdownMap[v.ChannelName] = { 
              count: 0, 
              avatar: v.ChannelAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(v.ChannelName)}&background=random` 
            };
          }
          breakdownMap[v.ChannelName].count += 1;
        });

        const breakdown = Object.entries(breakdownMap)
          .map(([name, data]) => ({ name, ...data }))
          .sort((a, b) => b.count - a.count);

        return {
          date,
          count: vids.length,
          videos: vids.sort((a, b) => (b.Views || 0) - (a.Views || 0)),
          breakdown
        } as PeakDay;
      });

    const countGroups: Record<number, PeakDay[]> = {};
    peakDays.forEach(day => {
      if (!countGroups[day.count]) countGroups[day.count] = [];
      countGroups[day.count].push(day);
    });

    const sortedGroups: PeakGroup[] = Object.entries(countGroups)
      .map(([countStr, days]) => {
        const count = parseInt(countStr);
        const combinedVideos = days.flatMap(d => d.videos).sort((a, b) => (b.Views || 0) - (a.Views || 0));
        const aggregateBreakdownMap: Record<string, { count: number, avatar: string }> = {};
        days.forEach(d => {
          d.breakdown.forEach(b => {
            if (!aggregateBreakdownMap[b.name]) {
              aggregateBreakdownMap[b.name] = { count: 0, avatar: b.avatar };
            }
            aggregateBreakdownMap[b.name].count += b.count;
          });
        });

        const combinedBreakdown = Object.entries(aggregateBreakdownMap)
          .map(([name, data]) => ({ name, ...data }))
          .sort((a, b) => b.count - a.count);

        return {
          count,
          days: days.sort((a, b) => new Date(a.date).getTime() - new Date(a.date).getTime()),
          combinedVideos,
          combinedBreakdown
        };
      })
      .sort((a, b) => b.count - a.count);

    return {
      peakGroups: sortedGroups.slice(0, 5)
    };
  }, [videos]);

  const zenithGroupedByChannel = useMemo(() => {
    if (!peakGroups[0]) return [];
    const map = new Map<string, VideoData[]>();
    peakGroups[0].combinedVideos.forEach(v => {
      if (!map.has(v.ChannelName)) map.set(v.ChannelName, []);
      map.get(v.ChannelName)!.push(v);
    });
    return Array.from(map.entries()).map(([name, vids]) => ({
      name,
      videos: vids,
      avatar: vids[0].ChannelAvatar
    })).sort((a, b) => b.videos.length - a.videos.length);
  }, [peakGroups]);

  if (peakGroups.length === 0) return null;

  const zenith = peakGroups[0];
  const rankingStream = peakGroups.slice(1);

  const formatDateLabel = (dateStr: string) => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return { month: '??', day: '??' };
    return { 
      month: (d.getMonth() + 1).toString().padStart(2, '0'), 
      day: d.getDate().toString().padStart(2, '0') 
    };
  };

  return (
    <div className="w-full">
      <div className="mb-10 md:mb-14 flex flex-col items-center justify-center text-center">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="text-red-600 w-4 h-4" />
          <span className="text-red-900/40 font-black text-[10px] uppercase tracking-[0.5em]">Release Momentum Analysis</span>
          <TrendingUp className="text-red-600 w-4 h-4" />
        </div>
        <h2 className="text-2xl md:text-4xl font-black text-red-950 font-cny tracking-tight relative px-4">
          贺岁档发布爆发力榜单
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-10 h-1 bg-red-600 rounded-full"></div>
        </h2>
      </div>

      <div className="bg-white rounded-[2rem] md:rounded-[3rem] p-3 md:p-6 shadow-2xl shadow-red-900/5 border border-red-100 overflow-visible relative">
        <div className="max-w-7xl mx-auto flex flex-col gap-4 md:gap-8">
          
          {/* ZENITH HERO (RANK 1 GROUP) - "Royal Crimson & Gold" Dashboard */}
          {zenith && (
            <div 
              onMouseMove={handleMouseMove}
              onClick={() => onDateClick?.('全年度最高峰作品集', zenith.combinedVideos)}
              className="relative min-h-[360px] md:min-h-[420px] rounded-[2rem] md:rounded-[2.5rem] overflow-hidden group cursor-pointer shadow-2xl border border-red-950/20 bg-red-950 flex flex-col"
            >
              <div className="absolute inset-0 z-0">
                <div 
                  className="absolute inset-0 transition-transform duration-1000 ease-out scale-110 opacity-30"
                  style={{ transform: `translate(${mousePos.x * 12}px, ${mousePos.y * 12}px)` }}
                >
                  <img src={zenith.combinedVideos[0]?.Thumbnail} className="w-full h-full object-cover blur-3xl scale-125" alt="" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-red-950 via-red-900/95 to-amber-900/20"></div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/rice-paper.png')] opacity-[0.2] mix-blend-overlay"></div>
              </div>

              <div className="relative z-10 p-5 md:p-8 flex flex-wrap md:flex-nowrap items-center justify-between gap-6 border-b border-white/10 bg-red-950/20 backdrop-blur-sm">
                <div className="flex items-center gap-4 md:gap-6 min-w-0">
                  <div className="bg-amber-500 text-red-950 w-12 h-12 md:w-16 md:h-16 rounded-[1rem] md:rounded-[1.2rem] flex items-center justify-center font-black text-2xl md:text-3xl shadow-lg shadow-amber-500/20 shrink-0">
                    1
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-white font-black text-xl md:text-2xl font-cny tracking-tight uppercase leading-none truncate">全年度集结最巅峰</h3>
                    <p className="text-amber-500/60 font-bold text-[10px] md:text-xs uppercase tracking-[0.2em] mt-1.5 truncate">The Ultimate Release Peak of 2026</p>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-6 md:gap-12 w-full md:w-auto border-t md:border-t-0 border-white/5 pt-4 md:pt-0">
                  <div className="flex items-center gap-4">
                    {zenith.days.map((day) => {
                      const d = formatDateLabel(day.date);
                      return (
                        <div key={day.date} className="flex flex-col items-center">
                          <span className="text-white font-black text-2xl md:text-3xl tracking-tighter tabular-nums leading-none">
                              {d.month}<span className="text-amber-500 mx-0.5">/</span>{d.day}
                          </span>
                          <span className="text-white/20 text-[8px] font-bold uppercase tracking-widest mt-1.5">爆发日</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="h-10 w-px bg-white/10 hidden sm:block"></div>
                  <div className="flex flex-col items-end shrink-0">
                    <div className="flex items-baseline gap-2">
                      <span className="text-white font-black text-3xl md:text-5xl tabular-nums leading-none tracking-tighter drop-shadow-md">{zenith.count}</span>
                      <span className="text-amber-500 font-black text-sm md:text-lg font-cny">首作品</span>
                    </div>
                    <div className="mt-1.5 flex items-center gap-1.5 px-2.5 py-1 bg-white/10 rounded-md border border-white/5">
                       <Users size={12} className="text-amber-500/60" />
                       <span className="text-white/60 font-black text-[10px] uppercase tracking-widest leading-none">{zenith.combinedBreakdown.length} 位创作者</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative z-10 flex-1 p-5 md:p-8 overflow-hidden flex flex-col justify-center">
                <div className="flex overflow-x-auto custom-scrollbar-thin gap-8 md:gap-14 lg:gap-20 pb-6 pt-10 items-end">
                  {zenithGroupedByChannel.map((chan, idx) => {
                    const isStacked = chan.videos.length > 1;
                    return (
                      <div key={chan.name + idx} className="group/chan shrink-0 w-52 md:w-72 flex flex-col gap-5 transition-all duration-300">
                        <div className="relative aspect-video w-full group/stack">
                          {chan.videos.slice(0, 3).map((v, i) => {
                            const rotations = [0, -3, 3];
                            return (
                              <div key={v.VideoURL + i} className="absolute bottom-0 left-0 w-full h-full transition-all duration-700 shadow-2xl border border-white/15" style={{ 
                                  transform: `translate(${i * 8}px, ${i * -8}px) rotate(${rotations[i]}deg) scale(${1 - i * 0.05})`,
                                  '--hover-transform': `translate(${i * 18}px, ${i * -12}px) rotate(${rotations[i] * 1.5}deg) scale(${1 - i * 0.02})`,
                                  zIndex: 10 - i,
                                  opacity: 1 - i * 0.25,
                                  borderRadius: '1.5rem'
                                } as React.CSSProperties}>
                                <div className="w-full h-full rounded-[1.5rem] overflow-hidden relative shadow-2xl">
                                  <img src={v.Thumbnail} className="w-full h-full object-cover" alt="" />
                                  <div className="absolute inset-0 bg-red-950/10 group-hover/chan:bg-transparent transition-colors"></div>
                                  {i === 0 && (
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/chan:opacity-100 transition-opacity">
                                      <div className="bg-red-600 p-3 rounded-full shadow-2xl transform scale-75 group-hover/chan:scale-100 transition-transform">
                                        <Play size={18} fill="currentColor" className="text-white" />
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                          {isStacked && (
                            <div className="absolute -top-3 -right-3 z-[50] bg-amber-500 text-red-950 text-[10px] md:text-xs font-black px-3 py-1 rounded-full shadow-xl border-2 border-white ring-4 ring-red-950/30 transform group-hover/chan:scale-110 transition-transform">
                              {chan.videos.length} 作品
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-4 px-1 mt-2">
                          <img src={chan.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(chan.name)}&background=random`} className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl object-cover border-2 border-white/10 shadow-lg group-hover/chan:border-amber-500/50 transition-colors" alt={chan.name} />
                          <div className="min-w-0">
                            <h6 className="text-white font-black text-[13px] md:text-[15px] truncate uppercase tracking-tight group-hover/chan:text-amber-400 transition-colors">{chan.name}</h6>
                            <p className="text-white/20 font-bold text-[9px] uppercase tracking-[0.2em] mt-1">Leading Force</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div className="shrink-0 w-8"></div>
                </div>
              </div>

              <div className="relative z-10 px-6 py-5 md:px-10 bg-red-950/50 flex items-center justify-between border-t border-white/5">
                <div className="flex items-center gap-3">
                   <Zap size={12} className="text-amber-500 animate-pulse" />
                   <span className="text-white/30 font-black text-[9px] md:text-[10px] uppercase tracking-[0.4em] hidden sm:inline">2026 丙午马年贺岁档核心数据报告</span>
                   <span className="text-white/30 font-black text-[9px] uppercase tracking-[0.3em] sm:hidden">2026 DATA REPORT</span>
                </div>
                <div className="flex items-center gap-2 text-white/50 hover:text-white transition-colors group/view cursor-pointer">
                   <span className="text-[10px] font-black uppercase tracking-widest">查看全量作品</span>
                   <ChevronRight size={16} className="group-hover/view:translate-x-1.5 transition-transform" />
                </div>
              </div>
            </div>
          )}

          {/* STREAM ROWS (RANK 2-5 GROUPS) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {rankingStream.map((group, groupIdx) => {
              const rank = groupIdx + 2;
              const isSilver = rank === 2;
              const isBronze = rank === 3;
              
              return (
                <div key={group.count} className="group flex flex-col bg-white hover:bg-red-50/50 rounded-2xl md:rounded-[2rem] border border-red-50 hover:border-red-200 transition-all duration-300 overflow-hidden relative shadow-sm hover:shadow-xl hover:shadow-red-900/5">
                  
                  {/* Rank & Count Header (Requested Layout) */}
                  <div className={`px-5 py-4 flex items-center justify-between border-b border-red-50 transition-colors duration-300 ${isSilver ? 'bg-red-50/30' : isBronze ? 'bg-amber-50/20' : 'bg-white'}`}>
                    <div className="flex items-center gap-3">
                       <span className={`text-xl md:text-2xl font-black ${rank <= 3 ? 'text-red-900' : 'text-red-200 group-hover:text-red-600'}`}>#{rank}</span>
                       <div className="h-5 w-px bg-red-100 hidden sm:block"></div>
                       <div className="flex items-baseline gap-1.5">
                          <span className="text-lg md:text-xl font-black text-red-950 tabular-nums leading-none tracking-tighter">{group.count}</span>
                          <span className="text-[10px] font-bold text-red-900/30 uppercase tracking-widest">首作品</span>
                       </div>
                    </div>
                    <div className="flex items-center gap-1.5 opacity-20 group-hover:opacity-100 transition-opacity">
                       <span className="text-[9px] font-black uppercase tracking-widest text-red-900">RANK MOMENTUM</span>
                    </div>
                  </div>

                  {/* Days Section */}
                  <div className="p-5 md:p-6 overflow-hidden space-y-8">
                    {group.days.map((day) => (
                      <div 
                        key={day.date}
                        onClick={() => onDateClick?.(new Date(day.date).toLocaleDateString(), day.videos)}
                        className="flex flex-col gap-4 group/row cursor-pointer"
                      >
                        {/* Date Header for the Day */}
                        <div className="flex items-center justify-between border-b border-red-50 pb-2">
                           <div className="flex items-center gap-4">
                              <CalendarDate date={day.date} accentColor="bg-red-600" />
                              <div className="flex flex-col">
                                <span className="text-[10px] font-black text-red-950 uppercase tracking-widest">PEAK RELEASE</span>
                                <span className="text-[9px] font-bold text-red-900/40 uppercase tracking-tighter">{day.videos.length} Works Uploaded</span>
                              </div>
                           </div>
                           <div className="w-8 h-8 rounded-full bg-red-50 text-red-200 flex items-center justify-center group-hover/row:text-red-600 group-hover/row:bg-red-50 transition-all shrink-0">
                              <ChevronRight size={18} />
                           </div>
                        </div>

                        {/* Avatars below the date */}
                        <div className="flex flex-wrap gap-2 md:gap-2.5 px-0.5">
                           {day.breakdown.map((chan, i) => (
                              <div key={i} className="relative group/avatar shrink-0">
                                <img 
                                  src={chan.avatar} 
                                  className="w-11 h-11 md:w-12 md:h-12 rounded-[0.9rem] md:rounded-xl border-2 border-white object-cover shadow-sm group-hover/avatar:scale-110 group-hover/avatar:z-10 transition-transform"
                                  alt={chan.name}
                                />
                                {chan.count > 1 && (
                                  <div className="absolute -top-1 -right-1 bg-amber-500 text-red-950 text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-white shadow-sm">
                                    {chan.count}
                                  </div>
                                )}
                              </div>
                           ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      <style>{`
        .group\\/chan:hover .group\\/stack > div {
          transform: var(--hover-transform) !important;
        }
        .custom-scrollbar-thin::-webkit-scrollbar {
          height: 3px;
        }
        .custom-scrollbar-thin::-webkit-scrollbar-track {
          background: rgba(220, 38, 38, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar-thin::-webkit-scrollbar-thumb {
          background: rgba(220, 38, 38, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: rgba(220, 38, 38, 0.4);
        }
      `}</style>
    </div>
  );
};