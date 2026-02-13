
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { VideoData, Translations } from '../types';
import { Sparkles, PieChart, Activity, PlayCircle, X, Play, ChevronDown, ChevronUp, Eye, Heart, Calendar, ArrowDownWideNarrow } from 'lucide-react';
import { VideoModal } from './VideoModal';
import { TRANSLATIONS } from '../constants';

interface Props {
  videos: VideoData[];
  onModalToggle?: (isOpen: boolean) => void;
}

const compactFormatter = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

const HighlightText: React.FC<{ text: string; highlights: string[] }> = ({ text, highlights }) => {
  if (!highlights || highlights.length === 0) return <span>{text}</span>;

  const escapedHighlights = highlights
    .map(h => h.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .filter(Boolean);
  
  if (escapedHighlights.length === 0) return <span>{text}</span>;
  
  const regex = new RegExp(`(${escapedHighlights.join('|')})`, 'gi');
  const parts = text.split(regex);

  return (
    <span>
      {parts.map((part, i) => 
        regex.test(part) ? (
          <span key={i} className="text-red-600 bg-red-100 px-1 rounded-md font-black">
            {part}
          </span>
        ) : (
          part
        )
      )}
    </span>
  );
};

type SortOption = 'views' | 'likes' | 'date';

export const HorseThemedStats: React.FC<Props> = ({ videos, onModalToggle }) => {
  const [selectedKeyword, setSelectedKeyword] = useState<string | null>(null);
  const [detailedVideo, setDetailedVideo] = useState<VideoData | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [hoveredPart, setHoveredPart] = useState<'pun' | 'other' | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [sortBy, setSortBy] = useState<SortOption>('views');
  const containerRef = useRef<HTMLDivElement>(null);
  
  const t = TRANSLATIONS;

  useEffect(() => {
    if (selectedKeyword || detailedVideo) {
      onModalToggle?.(true);
      return () => onModalToggle?.(false);
    }
  }, [selectedKeyword, detailedVideo, onModalToggle]);

  const horseStats = useMemo(() => {
    const statsMap: Record<string, { count: number, videoDetails: VideoData[] }> = {};
    const excludedKeywords = ['马年', '马来西亚'];
    
    videos.forEach(v => {
      if (v.HasHorsePair && v.HasHorsePair !== '0' && v.HasHorsePair !== '') {
        const pairParts = v.HasHorsePair.split(/[，,]/).map(p => p.trim()).filter(Boolean);
        pairParts.forEach((pair) => {
          if (excludedKeywords.includes(pair)) return;
          
          if (!statsMap[pair]) {
            statsMap[pair] = { count: 0, videoDetails: [] };
          }
          statsMap[pair].count += 1;
          statsMap[pair].videoDetails.push(v);
        });
      }
    });
    
    return Object.entries(statsMap)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.count - a.count);
  }, [videos]);

  const visibleStats = useMemo(() => {
    if (showAll) return horseStats;
    const highFrequency = horseStats.filter(s => s.count > 2);
    return highFrequency.length > 0 ? highFrequency : horseStats.slice(0, 6);
  }, [horseStats, showAll]);

  const hasRemaining = horseStats.length > (showAll ? 0 : visibleStats.length);

  const selectedStat = useMemo(() => 
    horseStats.find(s => s.name === selectedKeyword), 
  [horseStats, selectedKeyword]);

  const sortedVideoDetails = useMemo(() => {
    if (!selectedStat) return [];
    return [...selectedStat.videoDetails].sort((a, b) => {
      if (sortBy === 'views') return b.Views - a.Views;
      if (sortBy === 'likes') return b.Likes - a.Likes;
      return new Date(b.PublishDate).getTime() - new Date(a.PublishDate).getTime();
    });
  }, [selectedStat, sortBy]);

  const totalVideos = videos.length;
  const punVideoCount = videos.filter(v => {
    if (!v.HasHorsePair || v.HasHorsePair === '0' || v.HasHorsePair === '') return false;
    const pairs = v.HasHorsePair.split(/[，,]/).map(p => p.trim());
    return pairs.some(p => p !== '马年' && p !== '马来西亚' && p !== '');
  }).length;
  
  const otherVideoCount = totalVideos - punVideoCount;
  const punPercentage = totalVideos > 0 ? Math.round((punVideoCount / totalVideos) * 100) : 0;

  if (totalVideos === 0) return null;

  const maxCount = Math.max(...horseStats.map(s => s.count), 1);
  const midpoint = Math.ceil(visibleStats.length / 2);
  const leftCol = visibleStats.slice(0, midpoint);
  const rightCol = visibleStats.slice(midpoint);

  const radius = 100; 
  const stroke = 22;
  const normalizedRadius = radius - stroke;
  const circumference = normalizedRadius * 2 * Math.PI;
  const punStrokeDash = (punVideoCount / totalVideos) * circumference;
  const otherStrokeDash = circumference - punStrokeDash;

  const handleMouseMove = (e: React.MouseEvent) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  const renderStatItem = (stat: any, idx: number, overallIdx: number) => {
    const percentage = (stat.count / maxCount) * 100;
    const isHighFreq = stat.count >= 2;

    return (
      <div 
        key={stat.name} 
        className="relative group/bar cursor-pointer animate-in fade-in slide-in-from-bottom-2 duration-500"
        style={{ animationDelay: `${idx * 50}ms` }}
        onClick={() => setSelectedKeyword(stat.name)}
      >
        <div className="flex justify-between items-center mb-1.5 md:mb-2">
          <div className="flex items-center gap-2.5 md:gap-3">
            <span className={`w-5 h-5 md:w-7 md:h-7 rounded-lg flex items-center justify-center font-black text-[8px] md:text-[10px] shadow-sm border transition-all duration-500
              ${isHighFreq ? 'bg-red-600 text-white border-red-600 shadow-red-100' : 'bg-gray-100 text-gray-400 border-gray-100'}
            `}>
              {overallIdx + 1}
            </span>
            <span className={`text-[13px] md:text-base font-black uppercase tracking-tight transition-colors ${isHighFreq ? 'text-red-950 group-hover/bar:text-red-600' : 'text-gray-400'}`}>
              {stat.name}
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className={`text-[14px] md:text-base font-black tabular-nums ${isHighFreq ? 'text-red-950' : 'text-gray-400'}`}>{stat.count}</span>
            <span className={`text-[8px] md:text-[9px] font-bold uppercase tracking-widest ${isHighFreq ? 'text-red-900/30' : 'text-gray-300'}`}>首</span>
          </div>
        </div>
        
        <div className="h-1.5 md:h-3 bg-gray-50 rounded-full overflow-hidden border border-gray-100/50">
          <div 
            className={`h-full rounded-full transition-all duration-1000 ease-out ${
              isHighFreq 
                ? 'shadow-[0_0_15px_rgba(220,38,38,0.3)] bg-gradient-to-r from-red-600 via-red-500 to-amber-400 group-hover/bar:brightness-110' 
                : 'bg-gray-200 opacity-40'
            }`}
            style={{ width: `${percentage}%`, transitionDelay: `${idx * 30}ms` }}
          >
            {isHighFreq && (
              <div className="w-full h-full relative">
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full">
      <div className="mb-10 md:mb-16 flex flex-col items-center justify-center text-center">
        <div className="flex items-center gap-2 md:gap-3 mb-2">
          <Sparkles className="text-amber-500 animate-pulse w-4 h-4 md:w-5 md:h-5" />
          <span className="text-red-900/30 font-black text-[9px] md:text-[10px] uppercase tracking-[0.3em] md:tracking-[0.5em]">Creative Analysis</span>
          <Sparkles className="text-amber-500 animate-pulse w-4 h-4 md:w-5 md:h-5" />
        </div>
        <h2 className="text-2xl md:text-5xl font-black text-red-950 font-cny tracking-tight relative px-4">
          标题用“马”关键词/谐音
          <div className="absolute -bottom-3 md:-bottom-4 left-1/2 -translate-x-1/2 w-16 md:w-24 h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent rounded-full"></div>
        </h2>
        <p className="mt-6 text-[10px] md:text-xs font-bold text-red-900/40 uppercase tracking-[0.1em] md:tracking-[0.2em] bg-red-50/50 px-4 py-1.5 rounded-full border border-red-100/30">
          注：统计已排除 “马来西亚” 及 “马年” 等通用词汇
        </p>
      </div>

      <div className="bg-white rounded-[2.5rem] md:rounded-[4rem] p-6 md:p-16 shadow-2xl shadow-red-900/5 border border-gray-100 overflow-visible relative group">
        <div className="flex flex-col items-center gap-12 md:gap-20">
          {/* Donut Chart Section - Centered at the top */}
          <div 
            className="w-full flex flex-col items-center justify-center relative select-none py-4"
            onMouseMove={handleMouseMove}
            ref={containerRef}
          >
            <div 
              className={`absolute z-[70] transition-opacity duration-200 pointer-events-none transform -translate-x-1/2 -translate-y-[120%] ${hoveredPart ? 'opacity-100' : 'opacity-0'}`}
              style={{ left: mousePos.x, top: mousePos.y }}
            >
              {hoveredPart === 'pun' && (
                <div className="bg-gradient-to-br from-red-600 to-amber-500 text-white px-5 py-3 rounded-2xl shadow-2xl border border-white/20 whitespace-nowrap">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-0.5 text-center">使用“马”</p>
                  <p className="text-2xl font-black leading-none text-center">{punVideoCount} <span className="text-xs font-bold opacity-60">首</span></p>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-amber-500"></div>
                </div>
              )}
              {hoveredPart === 'other' && (
                <div className="bg-gray-800 text-white px-5 py-3 rounded-2xl shadow-2xl border border-white/10 whitespace-nowrap">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-0.5 text-center">其他作品</p>
                  <p className="text-2xl font-black leading-none text-center">{otherVideoCount} <span className="text-xs font-bold opacity-40">首</span></p>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-gray-800"></div>
                </div>
              )}
            </div>

            <div className="relative inline-flex items-center justify-center">
              <svg height={radius * 2} width={radius * 2} className="transform -rotate-90 scale-110 md:scale-125">
                <defs>
                  <linearGradient id="donutGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#dc2626" />
                    <stop offset="100%" stopColor="#f59e0b" />
                  </linearGradient>
                </defs>
                <circle
                  onMouseEnter={() => setHoveredPart('other')}
                  onMouseLeave={() => setHoveredPart(null)}
                  stroke="currentColor"
                  fill="transparent"
                  strokeWidth={stroke}
                  strokeDasharray={`${otherStrokeDash} ${circumference}`}
                  strokeDashoffset={-punStrokeDash}
                  style={{ 
                    transformOrigin: 'center', 
                    transform: hoveredPart === 'other' ? 'scale(1.04)' : 'scale(1)',
                    pointerEvents: 'visibleStroke'
                  }}
                  className={`text-gray-100 transition-all duration-500 cursor-default ${hoveredPart === 'other' ? 'text-gray-200' : ''}`}
                  r={normalizedRadius}
                  cx={radius}
                  cy={radius}
                />
                <circle
                  onMouseEnter={() => setHoveredPart('pun')}
                  onMouseLeave={() => setHoveredPart(null)}
                  stroke="url(#donutGradient)"
                  fill="transparent"
                  strokeWidth={stroke}
                  strokeDasharray={`${punStrokeDash} ${circumference}`}
                  strokeDashoffset={0}
                  strokeLinecap="round"
                  style={{ 
                    transformOrigin: 'center', 
                    transform: hoveredPart === 'pun' ? 'scale(1.04)' : 'scale(1)',
                    pointerEvents: 'visibleStroke'
                  }}
                  className={`transition-all duration-500 cursor-default ${hoveredPart === 'pun' ? 'brightness-110 drop-shadow-md' : ''}`}
                  r={normalizedRadius}
                  cx={radius}
                  cy={radius}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <div className="animate-in fade-in zoom-in-95 duration-700">
                  <span className="text-4xl md:text-6xl font-black text-red-950 leading-none tracking-tighter">
                    {punPercentage}%
                  </span>
                  <span className="text-[9px] md:text-xs font-bold text-red-900/30 uppercase tracking-[0.2em] md:tracking-[0.3em] mt-1 md:mt-2 block">
                    作品占比
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats List Section */}
          <div className="w-full space-y-6 md:space-y-12 max-w-6xl self-start">
            <div className="flex items-center justify-start mb-4">
              <div className="flex items-center gap-2 md:gap-3 bg-red-50/50 px-6 py-2.5 rounded-full border border-red-100">
                <PieChart size={16} className="text-red-600 md:size-5" />
                <h3 className="text-[14px] md:text-xl font-black text-red-950 uppercase tracking-tight">创意关键词使用热度榜</h3>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 md:gap-y-8 md:gap-x-16">
              <div className="space-y-4 md:space-y-8">
                {leftCol.map((stat, idx) => renderStatItem(stat, idx, idx))}
              </div>
              <div className="space-y-4 md:space-y-8">
                {rightCol.map((stat, idx) => renderStatItem(stat, idx, idx + midpoint))}
              </div>
            </div>

            {(hasRemaining || showAll) && (
              <div className="flex justify-center pt-6 md:pt-10">
                <button 
                  onClick={() => setShowAll(!showAll)}
                  className="group flex items-center justify-center gap-3 bg-red-600 hover:bg-red-700 text-white px-8 md:px-10 py-3.5 md:py-5 rounded-xl md:rounded-[1.5rem] font-black text-[10px] md:text-sm uppercase tracking-[0.2em] shadow-xl shadow-red-900/10 transition-all duration-300 active:scale-95 hover:shadow-red-900/20"
                >
                  {showAll ? (
                    <>
                      <ChevronUp size={18} className="group-hover:-translate-y-0.5 transition-transform" />
                      {t.showLess}
                    </>
                  ) : (
                    <>
                      <ChevronDown size={18} className="group-hover:translate-y-0.5 transition-transform" />
                      {t.showMore}
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedStat && createPortal(
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-2 sm:p-4 bg-red-950/25 backdrop-blur-xl animate-in fade-in duration-500">
          <div className="bg-[#fffbf2] border border-red-100 rounded-[2rem] md:rounded-[4rem] w-full max-w-7xl max-h-[96vh] overflow-hidden flex flex-col shadow-[0_40px_100px_-20px_rgba(220,38,38,0.25)] animate-in zoom-in-95 duration-500">
            <div className="px-5 py-4 md:px-12 md:py-10 border-b border-gray-100 flex flex-col gap-4 bg-gray-50/50 sticky top-0 z-10">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
                  <div className="bg-red-600 p-2 md:p-3 rounded-xl md:rounded-2xl shadow-xl shadow-red-100 shrink-0">
                    <PlayCircle size={18} className="text-white md:size-6" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-lg md:text-xl font-black text-red-950 tracking-tight flex items-baseline gap-2 md:gap-3 uppercase truncate">
                      {selectedStat.name} 
                      <span className="text-[10px] md:text-base font-bold text-red-900/30 uppercase tracking-[0.2em]">{selectedStat.count} 部作品</span>
                    </h3>
                    <p className="text-[8px] md:text-[10px] font-black text-red-900/40 uppercase tracking-[0.1em] md:tracking-[0.3em] mt-0.5 truncate">新年歌作品看板 • Performance Detail</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedKeyword(null)}
                  className="p-2 md:p-3 bg-white hover:bg-red-600 text-red-900/20 hover:text-white rounded-full transition-all duration-300 shadow-sm border border-gray-100 active:scale-90 shrink-0 ml-2"
                >
                  <X size={18} className="md:size-6" />
                </button>
              </div>

              {/* Sorting Tabs */}
              {selectedStat.count > 1 && (
                <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-6">
                  <div className="flex items-center gap-1.5 md:gap-2 bg-white/50 p-1 rounded-xl self-start border border-gray-200/50">
                    <button 
                      onClick={() => setSortBy('views')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-[10px] md:text-xs font-black uppercase tracking-widest transition-all ${sortBy === 'views' ? 'bg-red-600 text-white shadow-lg shadow-red-100' : 'text-gray-400 hover:text-red-900'}`}
                    >
                      <Eye size={12} className="md:size-3.5" />
                      播放量
                      {sortBy === 'views' && <ArrowDownWideNarrow size={12} className="animate-bounce" />}
                    </button>
                    <button 
                      onClick={() => setSortBy('likes')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-[10px] md:text-xs font-black uppercase tracking-widest transition-all ${sortBy === 'likes' ? 'bg-red-600 text-white shadow-lg shadow-red-100' : 'text-gray-400 hover:text-red-900'}`}
                    >
                      <Heart size={12} className="md:size-3.5" />
                      点赞数
                      {sortBy === 'likes' && <ArrowDownWideNarrow size={12} className="animate-bounce" />}
                    </button>
                    <button 
                      onClick={() => setSortBy('date')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-[10px] md:text-xs font-black uppercase tracking-widest transition-all ${sortBy === 'date' ? 'bg-red-600 text-white shadow-lg shadow-red-100' : 'text-gray-400 hover:text-red-900'}`}
                    >
                      <Calendar size={12} className="md:size-3.5" />
                      发布日期
                      {sortBy === 'date' && <ArrowDownWideNarrow size={12} className="animate-bounce" />}
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 md:p-12 space-y-4 md:space-y-10 custom-scrollbar overscroll-contain bg-paper/30">
              {sortedVideoDetails.map((v, i) => {
                const pairParts = v.HasHorsePair.split(/[，,]/).map(p => p.trim()).filter(Boolean);
                const keyParts = v.HasHorseKey.split(/[，,]/).map(p => p.trim()).filter(Boolean);
                const punIndex = pairParts.indexOf(selectedStat.name);
                const highlightKeys = punIndex !== -1 ? (keyParts[punIndex] || keyParts[0] || '').split(/[，,]/).map(k => k.trim()) : [];

                return (
                  <div 
                    key={v.VideoURL + i} 
                    onClick={() => {
                      setDetailedVideo(v);
                      setSelectedKeyword(null);
                    }}
                    className="group/item flex gap-4 md:gap-10 p-5 md:p-10 bg-white hover:bg-red-50/40 rounded-3xl md:rounded-[4rem] border border-gray-100 hover:border-red-600/20 transition-all duration-500 cursor-pointer shadow-sm active:scale-[0.98]"
                  >
                    <div className="relative w-32 md:w-64 lg:w-72 aspect-video shrink-0 rounded-2xl md:rounded-[3rem] overflow-hidden shadow-xl border md:border-2 border-white">
                      <img src={v.Thumbnail} className="w-full h-full object-cover transition-transform duration-700 group-hover/item:scale-110" alt="thumb" />
                      <div className="absolute inset-0 bg-black/5 group-hover/item:bg-red-600/10 transition-colors flex items-center justify-center">
                         <div className="bg-white/90 p-2 md:p-4 rounded-full shadow-lg opacity-0 group-hover/item:opacity-100 transform translate-y-2 group-hover/item:translate-y-0 transition-all duration-500">
                           <Play size={16} className="text-red-600 md:size-8" fill="currentColor" />
                         </div>
                      </div>
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col justify-center overflow-hidden">
                      <h5 className="text-base md:text-xl font-black text-red-950 leading-tight mb-3 md:mb-5 break-words">
                        <HighlightText text={v.VideoTitle} highlights={highlightKeys} />
                      </h5>
                      <div className="flex flex-col gap-2 md:gap-3">
                        <div className="flex items-center gap-2 md:gap-4">
                          <div className="w-5 h-5 md:w-8 md:h-8 rounded-lg bg-red-50 overflow-hidden border border-red-100 shrink-0">
                            <img src={v.ChannelAvatar} className="w-full h-full object-cover" alt="avatar" />
                          </div>
                          <p className="text-xs md:text-base font-black text-red-900 uppercase tracking-[0.1em] md:tracking-[0.2em] truncate">
                            {v.ChannelName}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-3 md:gap-5">
                           <div className="flex items-center gap-1.5 text-red-900/40">
                              <Eye size={12} className="md:size-4 text-red-600" />
                              <span className="text-[10px] md:text-sm font-black tabular-nums">{compactFormatter.format(v.Views)}</span>
                           </div>
                           <div className="flex items-center gap-1.5 text-red-900/40">
                              <Heart size={12} className="md:size-4 text-red-500" />
                              <span className="text-[10px] md:text-sm font-black tabular-nums">{compactFormatter.format(v.Likes)}</span>
                           </div>
                           <div className="hidden md:flex items-center gap-1.5 text-red-900/40">
                              <Calendar size={14} className="text-red-600" />
                              <span className="text-[10px] md:text-sm font-black">{new Date(v.PublishDate).toLocaleDateString()}</span>
                           </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>,
        document.body
      )}

      {detailedVideo && (
        <VideoModal 
          isOpen={!!detailedVideo}
          onClose={() => setDetailedVideo(null)}
          videos={[detailedVideo]}
          title="作品详情"
          t={t}
        />
      )}
    </div>
  );
};
