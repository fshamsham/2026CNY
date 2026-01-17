import React, { useState, useMemo } from 'react';
import { VideoData, Translations } from '../types';
import { Hash, Sparkles, PlayCircle, X, Play, MessageSquareQuote } from 'lucide-react';
import { VideoModal } from './VideoModal';
import { TRANSLATIONS } from '../constants';

interface Props {
  videos: VideoData[];
}

interface HashtagStat {
  tag: string;
  count: number;
  videos: VideoData[];
}

export const HashtagAnalysis: React.FC<Props> = ({ videos }) => {
  const [selectedTag, setSelectedTag] = useState<HashtagStat | null>(null);
  const [detailedVideo, setDetailedVideo] = useState<VideoData | null>(null);
  const t = TRANSLATIONS;

  const hashtagStats = useMemo(() => {
    const statsMap: Record<string, HashtagStat> = {};
    const hashtagRegex = /#[\u4e00-\u9fa5a-zA-Z0-9_]+/g;

    videos.forEach(v => {
      const text = v.VideoDescription || '';
      const matches = text.match(hashtagRegex);
      if (matches) {
        // Use a Set to avoid counting the same tag multiple times in one video
        const uniqueMatches = Array.from(new Set(matches));
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
      .sort((a, b) => b.count - a.count)
      .slice(0, 40); // Top tags
  }, [videos]);

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
      {/* Header - Unified with other sections */}
      <div className="mb-10 md:mb-16 flex flex-col items-center justify-center text-center">
        <div className="flex items-center gap-2 md:gap-3 mb-2">
          <Hash className="text-red-600 animate-pulse w-4 h-4 md:w-5 md:h-5" />
          <span className="text-red-900/30 font-black text-[9px] md:text-[10px] uppercase tracking-[0.3em] md:tracking-[0.5em]">Hashtag Analysis</span>
          <Hash className="text-red-600 animate-pulse w-4 h-4 md:w-5 md:h-5" />
        </div>
        <h2 className="text-2xl md:text-5xl font-black text-red-950 font-cny tracking-tight relative px-4">
          热门社交媒体标签分析
          <div className="absolute -bottom-3 md:-bottom-4 left-1/2 -translate-x-1/2 w-16 md:w-24 h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent rounded-full opacity-50"></div>
        </h2>
        <p className="mt-6 text-[10px] md:text-xs font-bold text-red-900/40 uppercase tracking-[0.1em] md:tracking-[0.2em] bg-red-50/50 px-4 py-1.5 rounded-full border border-red-100/30">
          通过分析作品描述，探索今年最流行的社媒话题趋势
        </p>
      </div>

      {/* Tag Cloud Box - Highly Rounded Pill Tags */}
      <div className="bg-white rounded-[2.5rem] md:rounded-[4rem] p-6 md:p-16 shadow-2xl shadow-red-900/5 border border-gray-100 overflow-hidden relative group">
        <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none">
          <MessageSquareQuote size={400} className="text-red-600" />
        </div>

        <div className="flex flex-wrap justify-center gap-3 md:gap-4 relative z-10">
          {hashtagStats.map((stat, idx) => (
            <button
              key={stat.tag}
              onClick={() => setSelectedTag(stat)}
              className={`
                group/tag flex items-center gap-2 md:gap-3 px-5 py-2 md:px-7 md:py-3.5 rounded-full
                transition-all duration-300 hover:scale-105 active:scale-95 border
                ${getTagColor(idx)}
                ${idx < 3 ? 'shadow-lg' : 'hover:border-red-600/20 hover:shadow-lg hover:shadow-red-900/5 hover:bg-red-50/50'}
              `}
            >
              <span className="text-sm md:text-base font-black tracking-tight">
                {stat.tag}
              </span>
              <span className={`
                text-[10px] md:text-[11px] font-black px-2 py-0.5 rounded-full
                ${idx < 3 ? 'bg-black/10' : 'bg-red-50 text-red-600'}
              `}>
                {stat.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Focus Mode Popout */}
      {selectedTag && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-red-950/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[2rem] md:rounded-[4rem] w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col shadow-[0_40px_100px_-20px_rgba(0,0,0,0.4)] border border-red-50 animate-in zoom-in-95 duration-300">
            <div className="px-6 py-5 md:px-12 md:py-10 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 sticky top-0 z-10">
              <div className="flex items-center gap-4">
                <div className="bg-red-600 p-2 md:p-3 rounded-full shadow-xl shadow-red-100">
                  <Hash size={20} className="text-white md:size-6" />
                </div>
                <div>
                  <h3 className="text-lg md:text-3xl font-black text-red-950 tracking-tight flex items-baseline gap-2 md:gap-3 uppercase">
                    {selectedTag.tag}
                    <span className="text-[10px] md:text-base font-bold text-red-900/30 uppercase tracking-[0.2em]">{selectedTag.count} 首作品</span>
                  </h3>
                  <p className="text-[9px] md:text-xs font-black text-red-900/30 uppercase tracking-[0.2em] md:tracking-[0.3em] mt-0.5">
                    标签聚类展示 • Hashtag Cluster Detail
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedTag(null)}
                className="p-2 md:p-3 bg-white hover:bg-red-600 text-red-900/20 hover:text-white rounded-full transition-all duration-300 shadow-sm border border-gray-100 active:scale-90"
              >
                <X size={20} className="md:size-6" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5 md:p-12 space-y-5 md:space-y-8 custom-scrollbar overscroll-contain bg-paper/10">
              {selectedTag.videos.map((v, i) => (
                <div 
                  key={v.VideoURL + i} 
                  onClick={() => {
                    setDetailedVideo(v);
                    setSelectedTag(null);
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
                      {v.VideoTitle}
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
              ))}
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