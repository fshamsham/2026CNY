import React, { useState, useMemo } from 'react';
import { VideoData, Translations } from '../types';
import { Sparkles, Info, PieChart, Activity, PlayCircle, X, ExternalLink, Play } from 'lucide-react';
import { VideoModal } from './VideoModal';
import { TRANSLATIONS } from '../constants';

interface Props {
  videos: VideoData[];
}

interface StatItem {
  name: string;
  count: number;
  videoDetails: VideoData[];
}

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

export const HorseThemedStats: React.FC<Props> = ({ videos }) => {
  const [selectedKeyword, setSelectedKeyword] = useState<string | null>(null);
  const [detailedVideo, setDetailedVideo] = useState<VideoData | null>(null);
  const t = TRANSLATIONS;

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

  const selectedStat = useMemo(() => 
    horseStats.find(s => s.name === selectedKeyword), 
  [horseStats, selectedKeyword]);

  const totalVideos = videos.length;
  const punVideoCount = videos.filter(v => {
    if (!v.HasHorsePair || v.HasHorsePair === '0' || v.HasHorsePair === '') return false;
    const pairs = v.HasHorsePair.split(/[，,]/).map(p => p.trim());
    // Only count as a "pun video" if it has at least one pair that isn't excluded
    return pairs.some(p => p !== '马年' && p !== '马来西亚' && p !== '');
  }).length;
  const punPercentage = totalVideos > 0 ? Math.round((punVideoCount / totalVideos) * 100) : 0;

  if (totalVideos === 0) return null;

  const maxCount = Math.max(...horseStats.map(s => s.count), 1);

  // Split stats for 1-6 on left and rest on right
  const leftCol = horseStats.slice(0, 6);
  const rightCol = horseStats.slice(6);

  // Donut Chart Settings - Reduced size for mobile-friendliness
  const radius = 90; 
  const stroke = 20;
  const normalizedRadius = radius - stroke;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (punPercentage / 100) * circumference;

  const renderStatItem = (stat: any, idx: number, overallIdx: number) => {
    const percentage = (stat.count / maxCount) * 100;
    const isMultiple = stat.count > 1;

    return (
      <div 
        key={stat.name} 
        className="relative group/bar cursor-pointer"
        onClick={() => setSelectedKeyword(stat.name)}
      >
        <div className="flex justify-between items-center mb-1.5">
          <div className="flex items-center gap-3">
            <span className={`w-6 h-6 md:w-7 md:h-7 rounded-lg flex items-center justify-center font-black text-[9px] md:text-[10px] shadow-sm border
              ${overallIdx === 0 && isMultiple ? 'bg-red-600 text-white border-red-600' : 
                isMultiple ? 'bg-white text-red-900/40 border-gray-100' : 
                'bg-gray-50 text-gray-300 border-gray-100'}
            `}>
              {overallIdx + 1}
            </span>
            <span className={`text-sm md:text-base font-black uppercase tracking-tight transition-colors group-hover/bar:text-red-600 ${isMultiple ? 'text-red-950' : 'text-gray-400'}`}>
              {stat.name}
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className={`text-base font-black tabular-nums ${isMultiple ? 'text-red-950' : 'text-gray-400'}`}>{stat.count}</span>
            <span className="text-[9px] font-bold text-red-900/30 uppercase tracking-widest">首</span>
          </div>
        </div>
        
        <div className="h-1.5 md:h-2.5 bg-gray-50 rounded-full overflow-hidden border border-gray-100/50">
          <div 
            className={`h-full rounded-full transition-all duration-1000 ease-out ${isMultiple ? 'shadow-lg bg-gradient-to-r from-red-600 via-red-500 to-amber-400 group-hover/bar:brightness-110' : 'bg-gray-200 opacity-60'}`}
            style={{ width: `${percentage}%`, transitionDelay: `${overallIdx * 50}ms` }}
          >
            {isMultiple && percentage > 15 && (
              <div className="w-full h-full relative">
                <div className="absolute inset-0 bg-white/10 animate-pulse"></div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full">
      {/* Centered Header - Outside of the white box */}
      <div className="mb-10 md:mb-16 flex flex-col items-center justify-center text-center">
        <div className="flex items-center gap-2 md:gap-3 mb-2">
          <Sparkles className="text-amber-500 animate-pulse w-4 h-4 md:w-5 md:h-5" />
          <span className="text-red-900/30 font-black text-[9px] md:text-[10px] uppercase tracking-[0.3em] md:tracking-[0.5em]">Creative Analysis</span>
          <Sparkles className="text-amber-500 animate-pulse w-4 h-4 md:w-5 md:h-5" />
        </div>
        <h2 className="text-2xl md:text-5xl font-black text-red-950 font-cny tracking-tight relative px-4">
          标题中使用“马”关键词
          <div className="absolute -bottom-3 md:-bottom-4 left-1/2 -translate-x-1/2 w-16 md:w-24 h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent rounded-full"></div>
        </h2>
        {/* Exclusion Note */}
        <p className="mt-6 text-[10px] md:text-xs font-bold text-red-900/40 uppercase tracking-[0.1em] md:tracking-[0.2em] bg-red-50/50 px-4 py-1.5 rounded-full border border-red-100/30">
          注：统计已排除 “马来西亚” 及 “马年” 等通用词汇
        </p>
      </div>

      {/* Main Content Box */}
      <div className="bg-white rounded-[2rem] md:rounded-[4rem] p-6 md:p-16 shadow-2xl shadow-red-900/5 border border-gray-100 overflow-visible relative group">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          {/* Donut Chart Column */}
          <div className="lg:col-span-4 flex flex-col items-center lg:sticky lg:top-8">
            <div className="relative inline-flex items-center justify-center">
              <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
                <defs>
                  <linearGradient id="donutGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#dc2626" /> {/* red-600 */}
                    <stop offset="100%" stopColor="#f59e0b" /> {/* amber-500 */}
                  </linearGradient>
                </defs>
                <circle
                  stroke="currentColor"
                  fill="transparent"
                  strokeWidth={stroke}
                  strokeDasharray={circumference + ' ' + circumference}
                  style={{ strokeDashoffset: 0 }}
                  className="text-red-50"
                  r={normalizedRadius}
                  cx={radius}
                  cy={radius}
                />
                <circle
                  stroke="url(#donutGradient)"
                  fill="transparent"
                  strokeWidth={stroke}
                  strokeDasharray={circumference + ' ' + circumference}
                  style={{ strokeDashoffset }}
                  strokeLinecap="round"
                  className="transition-all duration-[2000ms] ease-out"
                  r={normalizedRadius}
                  cx={radius}
                  cy={radius}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-2xl md:text-4xl font-black text-red-950 leading-none tracking-tighter">{punPercentage}%</span>
                <span className="text-[9px] md:text-[11px] font-bold text-red-900/30 uppercase tracking-[0.2em] md:tracking-[0.3em] mt-1">
                  作品占比
                </span>
              </div>
            </div>
            
            <div className="mt-8 grid grid-cols-2 gap-3 w-full max-w-xs">
              <div className="bg-red-50/50 p-3 md:p-4 rounded-2xl md:rounded-3xl border border-red-50 text-center">
                <p className="text-[9px] md:text-[10px] font-black text-red-900/40 uppercase tracking-widest mb-1">使用”马“</p>
                <p className="text-xl md:text-2xl font-black text-red-600">{punVideoCount}</p>
              </div>
              <div className="bg-gray-50/50 p-3 md:p-4 rounded-2xl md:rounded-3xl border border-gray-100 text-center">
                <p className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">其他</p>
                <p className="text-xl md:text-2xl font-black text-gray-900">{totalVideos - punVideoCount}</p>
              </div>
            </div>
          </div>

          {/* Denser 2-Column Bar Chart Column */}
          <div className="lg:col-span-8 space-y-6 md:space-y-8">
            <div className="flex items-center gap-3">
              <PieChart size={18} className="text-red-600 md:size-5" />
              <h3 className="text-base md:text-xl font-black text-red-950 uppercase tracking-tight">创意词频热度榜</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 md:gap-x-12">
              {/* Left Column (Items 1-6) */}
              <div className="space-y-4 md:space-y-5">
                {leftCol.map((stat, idx) => renderStatItem(stat, idx, idx))}
              </div>
              
              {/* Right Column (Items 7+) */}
              <div className="space-y-4 md:space-y-5">
                {rightCol.map((stat, idx) => renderStatItem(stat, idx, idx + 6))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Popout */}
      {selectedStat && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-red-950/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[2rem] md:rounded-[4rem] w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col shadow-[0_40px_100px_-20px_rgba(0,0,0,0.4)] border border-red-50 animate-in zoom-in-95 duration-300">
            <div className="px-6 py-5 md:px-12 md:py-10 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 sticky top-0 z-10">
              <div className="flex items-center gap-4">
                <div className="bg-red-600 p-2 md:p-3 rounded-xl md:rounded-2xl shadow-xl shadow-red-100">
                  <PlayCircle size={20} className="text-white md:size-6" />
                </div>
                <div>
                  <h3 className="text-lg md:text-3xl font-black text-red-950 tracking-tight flex items-baseline gap-2 md:gap-3 uppercase">
                    {selectedStat.name} 
                    <span className="text-[10px] md:text-base font-bold text-red-900/30 uppercase tracking-[0.2em]">{selectedStat.count} 部作品</span>
                  </h3>
                  <p className="text-[9px] md:text-xs font-black text-red-900/30 uppercase tracking-[0.2em] md:tracking-[0.3em] mt-0.5">新年歌作品看板 • Performance Detail</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedKeyword(null)}
                className="p-2 md:p-3 bg-white hover:bg-red-600 text-red-900/20 hover:text-white rounded-full transition-all duration-300 shadow-sm border border-gray-100 active:scale-90"
              >
                <X size={20} className="md:size-6" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5 md:p-12 space-y-5 md:space-y-8 custom-scrollbar overscroll-contain bg-paper/10">
              {selectedStat.videoDetails.map((v, i) => {
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
                    className="group/item flex gap-4 md:gap-8 p-3 md:p-6 bg-white hover:bg-red-50/40 rounded-2xl md:rounded-[2.5rem] border border-gray-100 hover:border-red-600/20 transition-all duration-500 cursor-pointer shadow-sm active:scale-[0.98]"
                  >
                    <div className="relative w-24 md:w-56 aspect-video shrink-0 rounded-xl md:rounded-3xl overflow-hidden shadow-lg border-2 border-white">
                      <img src={v.Thumbnail} className="w-full h-full object-cover transition-transform duration-700 group-hover/item:scale-110" alt="thumb" />
                      <div className="absolute inset-0 bg-black/5 group-hover/item:bg-red-600/10 transition-colors flex items-center justify-center">
                         <div className="bg-white/90 p-1.5 md:p-3 rounded-full shadow-lg opacity-0 group-hover/item:opacity-100 transform translate-y-2 group-hover/item:translate-y-0 transition-all duration-500">
                           <Play size={14} className="text-red-600 md:size-5" fill="currentColor" />
                         </div>
                      </div>
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <h5 className="text-[10px] md:text-lg font-black text-red-950 leading-tight mb-1.5 md:mb-3 line-clamp-2">
                        <HighlightText text={v.VideoTitle} highlights={highlightKeys} />
                      </h5>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 md:w-5 md:h-5 rounded-md bg-red-50 overflow-hidden border border-red-100 shrink-0">
                          <img src={v.ChannelAvatar} className="w-full h-full object-cover" alt="avatar" />
                        </div>
                        <p className="text-[9px] md:text-sm font-bold text-red-900/40 uppercase tracking-widest truncate">
                          {v.ChannelName}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
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