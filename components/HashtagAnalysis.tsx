
import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { VideoData, Translations } from '../types';
import { Hash, Sparkles, PlayCircle, X, Play, MessageSquareQuote, ChevronDown, ChevronUp } from 'lucide-react';
import { VideoModal } from './VideoModal';
import { TRANSLATIONS } from '../constants';

interface Props {
  videos: VideoData[];
  onModalToggle?: (isOpen: boolean) => void;
}

interface HashtagStat {
  tag: string;
  count: number;
  videos: VideoData[];
}

export const HashtagAnalysis: React.FC<Props> = ({ videos, onModalToggle }) => {
  const [selectedTag, setSelectedTag] = useState<HashtagStat | null>(null);
  const [detailedVideo, setDetailedVideo] = useState<VideoData | null>(null);
  const [showAllTags, setShowAllTags] = useState(false);
  const t = TRANSLATIONS;

  useEffect(() => {
    if (selectedTag || detailedVideo) {
      onModalToggle?.(true);
      return () => onModalToggle?.(false);
    }
  }, [selectedTag, detailedVideo, onModalToggle]);

  const hashtagStats = useMemo(() => {
    const statsMap: Record<string, HashtagStat> = {};
    const hashtagRegex = /#[\u4e00-\u9fa5a-zA-Z0-9_]+/g;

    videos.forEach(v => {
      const text = v.VideoDescription || '';
      const matches = text.match(hashtagRegex);
      if (matches) {
        const uniqueMatches = Array.from(new Set(matches)) as string[];
        uniqueMatches.forEach(tag => {
          if (!statsMap[tag]) {
            statsMap[tag] = { tag, count: 0, videos: [] };
          }
          statsMap[tag].count += 1;
          statsMap[tag].videos.push(v);
        });
      }
    });

    return Object.values(statsMap)
      .sort((a, b) => b.count - a.count);
  }, [videos]);

  const visibleTags = useMemo(() => {
    if (showAllTags) return hashtagStats.slice(0, 60);
    return hashtagStats.slice(0, window.innerWidth < 768 ? 15 : 30);
  }, [hashtagStats, showAllTags]);

  const hasRemaining = hashtagStats.length > (showAllTags ? 0 : visibleTags.length);

  if (hashtagStats.length === 0) return null;

  const getTagColor = (index: number) => {
    const colors = [
      'bg-red-600 text-white border-red-600 shadow-red-100',
      'bg-amber-500 text-white border-amber-500 shadow-amber-100',
      'bg-emerald-500 text-white border-emerald-500 shadow-emerald-100',
      'bg-white text-red-950 border-gray-100 shadow-sm'
    ];
    if (index < 3) return colors[index];
    return colors[3];
  };

  return (
    <div className="w-full">
      <div className="mb-10 md:mb-16 flex flex-col items-center justify-center text-center">
        <div className="flex items-center gap-2 md:gap-3 mb-2">
          <Hash className="text-red-600 animate-pulse w-4 h-4 md:w-5 md:h-5" />
          <span className="text-red-900/30 font-black text-[9px] md:text-[10px] uppercase tracking-[0.3em] md:tracking-[0.5em]">Hashtag Analysis</span>
          <Hash className="text-red-600 animate-pulse w-4 h-4 md:w-5 md:h-5" />
        </div>
        <h2 className="text-2xl md:text-5xl font-black text-red-950 font-cny tracking-tight relative px-4">
          热门标签分析
          <div className="absolute -bottom-3 md:-bottom-4 left-1/2 -translate-x-1/2 w-16 md:w-24 h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent rounded-full opacity-50"></div>
        </h2>
        <p className="mt-6 text-[10px] md:text-xs font-bold text-red-900/40 uppercase tracking-[0.1em] md:tracking-[0.2em] bg-red-50/50 px-4 py-1.5 rounded-full border border-red-100/30">
          通过分析作品描述，探索今年最流行的社媒话题趋势
        </p>
      </div>

      <div className="bg-white rounded-[2.5rem] md:rounded-[4rem] p-5 md:p-16 shadow-2xl shadow-red-900/5 border border-gray-100 overflow-hidden relative group">
        <div className="flex flex-wrap justify-center gap-2.5 md:gap-4 relative z-10">
          {visibleTags.map((stat, idx) => (
            <button
              key={stat.tag}
              onClick={() => setSelectedTag(stat)}
              className={`
                group/tag flex items-center gap-1.5 md:gap-3 px-4 py-2 md:px-7 md:py-3.5 rounded-full
                transition-all duration-300 hover:scale-105 active:scale-95 border
                ${getTagColor(idx)}
                ${idx < 3 ? 'shadow-lg' : 'hover:border-red-600/20 hover:shadow-lg hover:shadow-red-900/5 hover:bg-red-50/50'}
              `}
            >
              <span className="text-[12px] md:text-base font-black tracking-tight">
                {stat.tag}
              </span>
              <span className={`
                text-[9px] md:text-[11px] font-black px-1.5 py-0.5 rounded-full
                ${idx < 3 ? 'bg-black/10' : 'bg-red-50 text-red-600'}
              `}>
                {stat.count}
              </span>
            </button>
          ))}
        </div>

        {(hasRemaining || showAllTags) && (
          <div className="flex justify-center pt-8 md:pt-12 relative z-10">
            <button 
              onClick={() => setShowAllTags(!showAllTags)}
              className="group flex items-center justify-center gap-3 bg-red-600 hover:bg-red-700 text-white px-8 md:px-10 py-3.5 md:py-5 rounded-xl md:rounded-[1.5rem] font-black text-[10px] md:text-sm uppercase tracking-[0.2em] shadow-xl shadow-red-900/10 transition-all duration-300 active:scale-95 hover:shadow-red-900/20"
            >
              {showAllTags ? (
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

      {selectedTag && createPortal(
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-2 sm:p-4 bg-red-950/25 backdrop-blur-xl animate-in fade-in duration-500">
          <div className="bg-[#fffbf2] border border-red-100 rounded-[2rem] md:rounded-[4rem] w-full max-w-7xl max-h-[96vh] overflow-hidden flex flex-col shadow-[0_40px_100px_-20px_rgba(220,38,38,0.25)] animate-in zoom-in-95 duration-500">
            <div className="px-5 py-4 md:px-12 md:py-10 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 sticky top-0 z-10">
              <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
                <div className="bg-red-600 p-2 md:p-3 rounded-xl md:rounded-2xl shadow-xl shadow-red-100 shrink-0">
                  <Hash size={18} className="text-white md:size-6" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg md:text-3xl font-black text-red-950 tracking-tight flex items-baseline gap-2 md:gap-3 uppercase truncate">
                    {selectedTag.tag}
                    <span className="text-[10px] md:text-base font-bold text-red-900/30 uppercase tracking-[0.2em]">{selectedTag.count} 首作品</span>
                  </h3>
                  <p className="text-[8px] md:text-[10px] font-black text-red-900/40 uppercase tracking-[0.1em] md:tracking-[0.3em] mt-0.5 truncate">
                    标签聚类展示 • Hashtag Cluster Detail
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedTag(null)}
                className="p-2 md:p-3 bg-white hover:bg-red-600 text-red-900/20 hover:text-white rounded-full transition-all duration-300 shadow-sm border border-gray-100 active:scale-90 shrink-0 ml-2"
              >
                <X size={18} className="md:size-6" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 md:p-12 space-y-4 md:space-y-10 custom-scrollbar overscroll-contain bg-paper/30">
              {selectedTag.videos.map((v, i) => (
                <div 
                  key={v.VideoURL + i} 
                  onClick={() => {
                    setDetailedVideo(v);
                    setSelectedTag(null);
                  }}
                  className="group/item flex gap-4 md:gap-10 p-5 md:p-12 bg-white hover:bg-red-50/40 rounded-3xl md:rounded-[4rem] border border-gray-100 hover:border-red-600/20 transition-all duration-500 cursor-pointer shadow-sm active:scale-[0.98]"
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
                    <h5 className="text-base md:text-xl font-black text-red-950 leading-tight mb-3 md:mb-6 break-words">
                      {v.VideoTitle}
                    </h5>
                    <div className="flex items-center gap-2.5 md:gap-4">
                      <div className="w-5 h-5 md:w-8 md:h-8 rounded-lg bg-red-50 overflow-hidden border border-red-100 shrink-0">
                        <img src={v.ChannelAvatar} className="w-full h-full object-cover" alt="avatar" />
                      </div>
                      <p className="text-xs md:text-base font-black text-red-900 uppercase tracking-[0.1em] md:tracking-[0.2em] truncate">
                        {v.ChannelName}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
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
