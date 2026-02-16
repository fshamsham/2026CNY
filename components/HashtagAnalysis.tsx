
import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { VideoData, Translations } from '../types';
import { Hash, Sparkles, PlayCircle, X, Play, MessageSquareQuote, ChevronDown, ChevronUp, Eye, Heart, Calendar, ArrowDownWideNarrow, ArrowUpWideNarrow } from 'lucide-react';
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

const compactFormatter = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

type SortOption = 'views' | 'likes' | 'date';
type SortOrder = 'asc' | 'desc';

export const HashtagAnalysis: React.FC<Props> = ({ videos, onModalToggle }) => {
  const [selectedTag, setSelectedTag] = useState<HashtagStat | null>(null);
  const [detailedVideo, setDetailedVideo] = useState<VideoData | null>(null);
  const [showAllTags, setShowAllTags] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('views');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
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

  const sortedVideos = useMemo(() => {
    if (!selectedTag) return [];
    return [...selectedTag.videos].sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'views') comparison = b.Views - a.Views;
      else if (sortBy === 'likes') comparison = b.Likes - a.Likes;
      else comparison = new Date(b.PublishDate).getTime() - new Date(a.PublishDate).getTime();
      
      return sortOrder === 'desc' ? comparison : -comparison;
    });
  }, [selectedTag, sortBy, sortOrder]);

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
          <Hash className="text-red-600 animate-pulse w-4 h-4 md:size-5" />
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
        <div className="fixed inset-0 z-[110] flex flex-col items-center justify-end pt-12 md:pt-20 bg-red-950/25 backdrop-blur-xl animate-in fade-in duration-500">
          <div className="absolute inset-0 z-0" onClick={() => setSelectedTag(null)}></div>
          <div className="relative z-10 bg-[#fffbf2] border-t border-x border-red-100 rounded-t-[2rem] md:rounded-t-[4rem] w-full max-w-7xl h-full overflow-hidden flex flex-col shadow-[0_-10px_60px_-15px_rgba(220,38,38,0.3)] animate-in slide-in-from-bottom-full duration-700 ease-out">
            <div className="px-5 py-4 md:px-10 md:py-8 border-b border-gray-100 flex flex-col gap-3 bg-white/80 backdrop-blur-md sticky top-0 z-10">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3 md:gap-5 overflow-hidden">
                  <div className="bg-red-600 p-2.5 md:p-4 rounded-xl md:rounded-2xl shadow-xl shadow-red-100 shrink-0">
                    <Hash size={20} className="text-white md:size-8" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-lg md:text-3xl font-black text-red-950 tracking-tight flex items-baseline gap-2 md:gap-4 uppercase truncate">
                      {selectedTag.tag}
                      <span className="text-[11px] md:text-xl font-bold text-red-900/30 uppercase tracking-[0.2em]">{selectedTag.count} 首作品</span>
                    </h3>
                    <p className="text-[9px] md:text-[11px] font-black text-red-900/40 uppercase tracking-[0.1em] md:tracking-[0.3em] mt-0.5 truncate">
                      标签聚类展示 • Hashtag Cluster Detail
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedTag(null)}
                  className="p-2.5 md:p-4 bg-white hover:bg-red-600 text-red-900/20 hover:text-white rounded-full transition-all duration-300 shadow-sm border border-gray-100 active:scale-90 shrink-0 ml-2"
                >
                  <X size={20} className="md:size-8" />
                </button>
              </div>

              {selectedTag.count > 1 && (
                <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-6">
                  <div className="flex items-center gap-2 md:gap-4 bg-white/50 p-1 rounded-xl self-start border border-gray-200/50">
                    <button 
                      onClick={() => setSortBy('views')}
                      className={`flex items-center gap-2 px-4 py-2 md:px-6 md:py-2.5 rounded-lg text-[10px] md:text-sm font-black uppercase tracking-widest transition-all ${sortBy === 'views' ? 'bg-red-600 text-white shadow-lg shadow-red-100' : 'text-gray-400 hover:text-red-900'}`}
                    >
                      <Eye size={14} className="md:size-5" />
                      播放量
                    </button>
                    <button 
                      onClick={() => setSortBy('likes')}
                      className={`flex items-center gap-2 px-4 py-2 md:px-6 md:py-2.5 rounded-lg text-[10px] md:text-sm font-black uppercase tracking-widest transition-all ${sortBy === 'likes' ? 'bg-red-600 text-white shadow-lg shadow-red-100' : 'text-gray-400 hover:text-red-900'}`}
                    >
                      <Heart size={14} className="md:size-5" />
                      点赞数
                    </button>
                    <button 
                      onClick={() => setSortBy('date')}
                      className={`flex items-center gap-2 px-4 py-2 md:px-6 md:py-2.5 rounded-lg text-[10px] md:text-sm font-black uppercase tracking-widest transition-all ${sortBy === 'date' ? 'bg-red-600 text-white shadow-lg shadow-red-100' : 'text-gray-400 hover:text-red-900'}`}
                    >
                      <Calendar size={14} className="md:size-5" />
                      发布日期
                    </button>

                    <div className="w-px h-6 bg-gray-200 mx-2 hidden md:block"></div>

                    <button 
                      onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                      className="flex items-center gap-2 px-4 py-2 md:px-5 md:py-2 rounded-lg bg-white border border-gray-100 text-red-600 hover:bg-red-50 transition-all shadow-sm active:scale-95"
                    >
                      {sortOrder === 'desc' ? <ArrowDownWideNarrow size={16} /> : <ArrowUpWideNarrow size={16} />}
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 md:p-12 space-y-5 md:space-y-10 custom-scrollbar overscroll-contain bg-paper/30 pb-20">
              {sortedVideos.map((v, i) => (
                <div 
                  key={v.VideoURL + i} 
                  onClick={() => {
                    setDetailedVideo(v);
                    setSelectedTag(null);
                  }}
                  className="group/item flex gap-5 md:gap-12 p-5 md:p-10 bg-white hover:bg-red-50/40 rounded-2xl md:rounded-[3.5rem] border border-gray-100 hover:border-red-600/20 transition-all duration-500 cursor-pointer shadow-sm active:scale-[0.98]"
                >
                  <div className="relative w-32 md:w-80 lg:w-96 aspect-video shrink-0 rounded-xl md:rounded-[2.5rem] overflow-hidden shadow-xl border border-white">
                    <img src={v.Thumbnail} className="w-full h-full object-cover transition-transform duration-700 group-hover/item:scale-110" alt="thumb" />
                    <div className="absolute inset-0 bg-black/5 group-hover/item:bg-red-600/10 transition-colors flex items-center justify-center">
                       <div className="bg-white/90 p-2.5 md:p-5 rounded-full shadow-lg opacity-0 group-hover/item:opacity-100 transform translate-y-2 group-hover/item:translate-y-0 transition-all duration-500">
                         <Play size={18} className="text-red-600 md:size-10" fill="currentColor" />
                       </div>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-center overflow-hidden">
                    <h5 className="text-base md:text-3xl font-black text-red-950 leading-tight mb-3 md:mb-6 break-words">
                      {v.VideoTitle}
                    </h5>
                    
                    <div className="flex flex-col gap-2 md:gap-3">
                      <div className="flex items-center gap-3 md:gap-5">
                        <div className="w-6 h-6 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-red-50 overflow-hidden border border-red-100 shrink-0">
                          <img src={v.ChannelAvatar} className="w-full h-full object-cover" alt="avatar" />
                        </div>
                        <p className="text-[11px] md:text-xl font-black text-red-900 uppercase tracking-wider truncate">
                          {v.ChannelName}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 md:gap-8">
                        <div className="flex items-center gap-1.5 text-red-900/40">
                          <Eye size={14} className="md:size-5 text-red-600" />
                          <span className="text-[10px] md:text-lg font-black tabular-nums">{compactFormatter.format(v.Views)}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-red-900/40">
                          <Heart size={14} className="md:size-5 text-red-500" />
                          <span className="text-[10px] md:text-lg font-black tabular-nums">{compactFormatter.format(v.Likes)}</span>
                        </div>
                      </div>
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
