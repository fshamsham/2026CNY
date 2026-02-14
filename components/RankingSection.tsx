
import React, { useState, useMemo, useEffect } from 'react';
import { VideoData, Translations } from '../types';
import { Trophy, TrendingUp, Eye, Heart, Calendar, ExternalLink } from 'lucide-react';
import { VideoModal } from './VideoModal';

interface Props {
  videos: VideoData[];
  t: Translations;
  onModalToggle?: (isOpen: boolean) => void;
}

const compactFormatter = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

type FilterType = 'total' | 'daily' | 'liked' | 'recent' | 'oldest';

const RankItem: React.FC<{ 
  video: VideoData; 
  currentRank: number; 
  globalViewRank: number;
  metricLabel: string; 
  metricValue: string;
  isDate: boolean;
  onClick: () => void;
  t: Translations;
}> = ({ video, currentRank, globalViewRank, metricLabel, metricValue, isDate, onClick, t }) => (
  <div 
    onClick={onClick}
    className="group flex flex-col sm:flex-row items-start sm:items-center gap-5 md:gap-10 py-8 md:py-12 transition-all duration-300 hover:bg-red-50/30 cursor-pointer px-5 md:px-12"
  >
    {/* Thumbnail with Rank Overlay - Now full width on mobile */}
    <div className="relative w-full sm:w-48 md:w-72 lg:w-80 aspect-video rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden shrink-0 border border-gray-100 shadow-md">
      <img src={video.Thumbnail} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="thumb" />
      <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors"></div>
      
      {/* Rank Badge */}
      <div className={`absolute top-3 left-3 w-9 h-9 md:w-12 md:h-12 flex items-center justify-center rounded-xl md:rounded-[1.2rem] font-black text-sm md:text-lg shadow-xl backdrop-blur-md border border-white/20
        ${currentRank === 1 ? 'bg-amber-500 text-white' : 
          currentRank === 2 ? 'bg-slate-500 text-white' : 
          currentRank === 3 ? 'bg-orange-500 text-white' : 'bg-red-950/80 text-white'}`}
      >
        {currentRank}
      </div>
    </div>

    {/* Content - Positioned below video on mobile */}
    <div className="flex-1 min-w-0 w-full">
      <h4 className="font-black text-red-950 text-lg md:text-2xl line-clamp-3 group-hover:text-red-600 transition-colors leading-tight mb-2 md:mb-4">
        {video.VideoTitle}
      </h4>
      
      <div className="flex items-center gap-2 mb-4 md:mb-6">
        <div className="w-5 h-5 md:w-6 md:h-6 rounded-md md:rounded-lg overflow-hidden border border-red-100 shrink-0 shadow-sm">
          <img 
            src={video.ChannelAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(video.ChannelName)}&background=random`} 
            className="w-full h-full object-cover" 
            alt={video.ChannelName} 
          />
        </div>
        <p className="text-[11px] md:text-xs text-red-900/40 uppercase font-black tracking-[0.15em] md:tracking-[0.2em] truncate">
          {video.ChannelName}
        </p>
      </div>
      
      <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-6">
        <div className="flex items-baseline gap-2 bg-red-50/50 self-start px-3 py-1.5 rounded-lg md:bg-transparent md:p-0">
          <span className="text-xl md:text-3xl font-black text-red-600 tabular-nums leading-none tracking-tighter">
            {metricValue}
          </span>
          {metricLabel && (
            <span className="text-[10px] md:text-sm font-bold text-red-900/60 uppercase tracking-tight">
              {metricLabel}
            </span>
          )}
        </div>

        <span className="hidden md:block text-red-900/10 font-bold">•</span>
        <div className="flex items-center gap-1.5 opacity-50">
          <Eye size={12} className="md:size-4 text-red-600" />
          <span className="text-[10px] md:text-[13px] text-red-950 font-black uppercase tracking-widest">
             {t.totalViews} #{globalViewRank}
          </span>
        </div>
      </div>
    </div>
  </div>
);

export const RankingSection: React.FC<Props> = ({ videos, t, onModalToggle }) => {
  const [activeFilter, setActiveFilter] = useState<FilterType>('total');
  const [limit, setLimit] = useState<5 | 10>(5);
  const [selection, setSelection] = useState<{ video: VideoData; title: string } | null>(null);

  useEffect(() => {
    if (selection) {
      onModalToggle?.(true);
      return () => onModalToggle?.(false);
    }
  }, [selection, onModalToggle]);

  const viewRankMap = useMemo(() => {
    const sortedByViews = [...videos].sort((a, b) => b.Views - a.Views);
    const map = new Map<string, number>();
    sortedByViews.forEach((video, index) => {
      map.set(video.VideoURL, index + 1);
    });
    return map;
  }, [videos]);

  const filters = [
    { id: 'total', label: t.topTotalViews, icon: Eye },
    { id: 'daily', label: t.topDailyViews, icon: TrendingUp },
    { id: 'liked', label: t.mostLiked, icon: Heart },
    { id: 'recent', label: t.mostRecent, icon: Calendar },
    { id: 'oldest', label: t.oldest, icon: Calendar },
  ];

  const filterDescriptions: Record<FilterType, string> = {
    total: "总浏览排名基于视频发布至今在 YouTube 上的总累计观看次数进行的实时统计。",
    daily: "日均增量排名基于视频发布后的平均每日观看增速，反映了作品当下的流行趋势与人气。",
    liked: "点赞排名根据观众的正面反馈总数进行排序，体现了作品的受喜爱程度与内容共鸣。",
    recent: "最新发布按作品在 YouTube 上的正式上线时间倒序排列，让您抢先锁定最新动态。",
    oldest: "最早发布按作品上线时间先后顺序排列，带您回顾 2026 新年歌季度的初次绽放。"
  };

  const sortedVideos = useMemo(() => {
    let sorted = [...videos];
    switch (activeFilter) {
      case 'total':
        sorted.sort((a, b) => b.Views - a.Views);
        break;
      case 'daily':
        sorted.sort((a, b) => b.ViewsPerDay - a.ViewsPerDay);
        break;
      case 'liked':
        sorted.sort((a, b) => b.Likes - a.Likes);
        break;
      case 'recent':
        sorted.sort((a, b) => new Date(b.PublishDate).getTime() - new Date(a.PublishDate).getTime());
        break;
      case 'oldest':
        sorted.sort((a, b) => new Date(a.PublishDate).getTime() - new Date(b.PublishDate).getTime());
        break;
    }
    return sorted.slice(0, limit);
  }, [videos, activeFilter, limit]);

  const getMetricInfo = (video: VideoData) => {
    switch (activeFilter) {
      case 'total':
        return { label: 'Views', value: compactFormatter.format(video.Views) };
      case 'daily':
        return { label: 'Avg. Daily Views', value: compactFormatter.format(video.ViewsPerDay) };
      case 'liked':
        return { label: 'Likes', value: compactFormatter.format(video.Likes) };
      case 'recent':
      case 'oldest':
        const date = new Date(video.PublishDate);
        if (isNaN(date.getTime())) return { label: '', value: '---' };
        return { label: '', value: `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日` };
      default:
        return { label: '', value: '' };
    }
  };

  const currentFilterLabel = filters.find(f => f.id === activeFilter)?.label || '';
  const isDateFilter = activeFilter === 'recent' || activeFilter === 'oldest';

  return (
    <div className="space-y-10 md:space-y-16 w-full mx-auto">
      <div className="flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-50 border border-amber-100 mb-6">
          <Trophy size={14} className="text-amber-600" />
          <span className="text-amber-700 font-black text-[10px] uppercase tracking-[0.3em]">Leaderboard</span>
        </div>
        <h2 className="text-3xl md:text-6xl font-black text-red-950 font-cny tracking-tight px-4 mb-10">
          {t.rankingSectionTitle}
        </h2>

        {/* Filter Toggle Buttons */}
        <div className="flex flex-wrap justify-center gap-2.5 md:gap-4 px-4 w-full mb-10">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id as FilterType)}
              className={`flex items-center gap-2 px-4 py-3 md:px-7 md:py-4 rounded-full text-[10px] md:text-sm font-black uppercase tracking-wider transition-all duration-300 border ${
                activeFilter === filter.id
                  ? 'bg-red-600 border-red-600 text-white shadow-xl shadow-red-200 active:scale-95'
                  : 'bg-white border-gray-100 text-red-900/40 hover:border-red-600/20 hover:text-red-600'
              }`}
            >
              <filter.icon size={14} className={activeFilter === filter.id ? 'text-white' : 'text-red-600/30'} />
              {filter.label}
            </button>
          ))}
        </div>

        {/* Dynamic Filter Description Section */}
        <div className="w-full max-w-4xl px-6 mb-10 animate-in fade-in slide-in-from-top-2 duration-500">
          <div className="bg-red-50/50 rounded-2xl md:rounded-full px-8 py-5 border border-red-100">
            <p className="text-[12px] md:text-[15px] text-red-950/70 font-medium text-center leading-relaxed">
              {filterDescriptions[activeFilter]}
            </p>
          </div>
        </div>

        {/* Limit Selector */}
        <div className="flex items-center bg-gray-100/50 p-1.5 rounded-full border border-gray-100">
          <button 
            onClick={() => setLimit(5)}
            className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${limit === 5 ? 'bg-white text-red-600 shadow-sm' : 'text-gray-400 hover:text-red-900'}`}
          >
            Top 5
          </button>
          <button 
            onClick={() => setLimit(10)}
            className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${limit === 10 ? 'bg-white text-red-600 shadow-sm' : 'text-gray-400 hover:text-red-900'}`}
          >
            Top 10
          </button>
        </div>
      </div>

      {/* Unified Ranking List Container */}
      <div className="bg-white rounded-[2.5rem] md:rounded-[4rem] border border-gray-100 shadow-2xl shadow-red-900/5 overflow-hidden divide-y divide-gray-100">
        {sortedVideos.map((video, index) => {
          const { label, value } = getMetricInfo(video);
          const globalViewRank = viewRankMap.get(video.VideoURL) || 0;
          return (
            <RankItem 
              key={`${activeFilter}-${video.VideoURL}`}
              video={video}
              currentRank={index + 1}
              globalViewRank={globalViewRank}
              metricLabel={label}
              metricValue={value}
              isDate={isDateFilter}
              onClick={() => setSelection({ 
                video: video, 
                title: `${currentFilterLabel} #${index + 1}` 
              })}
              t={t}
            />
          );
        })}
      </div>

      {selection && (
        <VideoModal 
          isOpen={!!selection}
          onClose={() => setSelection(null)}
          videos={[selection.video]}
          title={selection.title}
          t={t}
        />
      )}
    </div>
  );
};
