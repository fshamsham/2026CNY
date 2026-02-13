
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { VideoData, Translations } from '../types';
import { X, Youtube, Heart, Eye, Play, MessageSquare, ChevronDown, ChevronUp, ExternalLink, TrendingUp, Trophy, Calendar } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  videos: VideoData[];
  title: string;
  t: Translations;
}

const DescriptionText: React.FC<{ text: string; t: Translations }> = ({ text, t }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (!text) return null;

  const shouldShowToggle = text.length > 80;

  return (
    <div className="mt-2">
      <p className={`text-[13px] md:text-[13px] text-red-900/70 font-medium leading-relaxed max-w-4xl whitespace-pre-wrap break-words transition-all duration-500 ${!isExpanded ? 'line-clamp-2' : ''}`}>
        {text}
      </p>
      {shouldShowToggle && (
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-1 flex items-center gap-1 text-[10px] md:text-[10px] font-black uppercase tracking-widest text-red-600 hover:text-red-700 transition-all active:scale-95 py-1 px-2 -ml-2 rounded-lg hover:bg-red-50"
        >
          {isExpanded ? (
            <>{t.showLess} <ChevronUp size={12} className="md:size-3" /></>
          ) : (
            <>{t.showMore} <ChevronDown size={12} className="md:size-3" /></>
          )}
        </button>
      )}
    </div>
  );
};

const getYouTubeId = (url: string): string | null => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
};

export const VideoModal: React.FC<Props> = ({ isOpen, onClose, videos, title, t }) => {
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-2 sm:p-4 bg-red-950/25 backdrop-blur-xl animate-in fade-in duration-500">
      <div className="bg-[#fffbf2] border border-red-100 rounded-[2rem] md:rounded-[4rem] w-full max-w-7xl max-h-[96vh] overflow-hidden flex flex-col shadow-[0_40px_100px_-20px_rgba(220,38,38,0.25)] animate-in zoom-in-95 duration-500">
        
        {/* Header */}
        <div className="px-5 py-4 md:px-10 lg:px-14 md:py-8 border-b border-red-50 flex justify-between items-center bg-white/60 sticky top-0 z-20">
          <div className="min-w-0 flex-1 pr-4">
            <h2 className="text-xl md:text-4xl font-black font-cny text-red-950 tracking-tighter truncate leading-tight">{title}</h2>
            <div className="flex items-center gap-2 mt-1 md:mt-2">
              <span className="w-4 md:w-6 h-0.5 bg-red-600 shrink-0"></span>
              <p className="text-red-900/40 text-[10px] md:text-[10px] font-black uppercase tracking-[0.1em] md:tracking-[0.3em] truncate">
                 新年歌作品看板 • Performance Detail
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2.5 md:p-3 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white rounded-xl md:rounded-[1.5rem] transition-all duration-500 shadow-sm border border-red-100 shrink-0 active:scale-90"
          >
            <X size={18} className="md:w-6 md:h-6" />
          </button>
        </div>
        
        {/* List of Videos */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-10 lg:p-14 space-y-8 md:space-y-12 bg-paper/30">
          {videos.map((video, idx) => {
            const videoId = getYouTubeId(video.VideoURL);
            const isPlaying = playingVideoId === videoId;
            const formattedDate = formatDate(video.PublishDate);

            return (
              <div key={idx} className="flex flex-col gap-6 md:gap-8 bg-white rounded-[1.8rem] md:rounded-[3.5rem] p-5 sm:p-6 md:p-10 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-700 group">
                
                {/* Player Area */}
                <div className="w-full relative aspect-video rounded-[1.2rem] md:rounded-[2.5rem] overflow-hidden bg-gray-950 shadow-2xl border-2 md:border-4 border-white">
                  {isPlaying && videoId ? (
                    <iframe
                      width="100%"
                      height="100%"
                      src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                      title="YouTube video player"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      className="w-full h-full"
                    ></iframe>
                  ) : (
                    <div className="relative w-full h-full cursor-pointer" onClick={() => videoId && setPlayingVideoId(videoId)}>
                      <img 
                        src={video.Thumbnail || 'https://picsum.photos/800/450'} 
                        alt={video.VideoTitle}
                        className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-105 opacity-95"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/10 transition-all hover:bg-black/20">
                        <div className="bg-red-600 p-5 md:p-7 rounded-full text-white shadow-2xl transform transition-all duration-500 group-hover:scale-110 active:scale-95">
                          <Play size={24} className="md:w-10 md:h-10" fill="currentColor" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Details Area */}
                <div className="flex flex-col gap-5 md:gap-6 px-0.5">
                  <div className="w-full">
                    <a 
                      href={video.VideoURL} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="group/title inline-block max-w-full"
                    >
                      <h3 className="text-lg md:text-3xl font-black text-red-950 leading-tight tracking-tight hover:text-red-600 transition-colors duration-300 flex items-center gap-2 group/title">
                        <span className="flex-1 min-w-0 break-words line-clamp-2 md:line-clamp-none">{video.VideoTitle}</span>
                        <ExternalLink size={16} className="opacity-0 group-hover/title:opacity-100 translate-y-1 group-hover/title:translate-y-0 transition-all duration-300 text-red-600 shrink-0 hidden md:block" />
                      </h3>
                    </a>
                  </div>

                  {/* Stats Chips */}
                  <div className="flex flex-wrap gap-2 md:gap-3 items-center w-full">
                    <div className="flex items-center gap-1.5 md:gap-2 bg-red-50 px-2.5 md:px-3 py-1.5 md:py-2 rounded-lg md:rounded-xl text-red-900 border border-red-100 shadow-sm">
                      <Eye size={12} className="text-red-600 shrink-0 md:size-4" />
                      <span className="text-xs md:text-xs font-black tabular-nums">
                        {video.Views.toLocaleString()} <span className="text-[10px] md:text-[10px] opacity-40 ml-0.5 uppercase tracking-tighter">Views</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 md:gap-2 bg-red-50 px-2.5 md:px-3 py-1.5 md:py-2 rounded-lg md:rounded-xl text-red-900 border border-red-100 shadow-sm">
                      <Heart size={12} className="text-red-500 shrink-0 md:size-4" />
                      <span className="text-xs md:text-xs font-black tabular-nums">
                        {video.Likes.toLocaleString()} <span className="text-[10px] md:text-[10px] opacity-40 ml-0.5 uppercase tracking-tighter">Likes</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 md:gap-2 bg-red-50 px-2.5 md:px-3 py-1.5 md:py-2 rounded-lg md:rounded-xl text-red-900 border border-red-100 shadow-sm">
                      <MessageSquare size={12} className="text-amber-700 shrink-0 md:size-4" />
                      <span className="text-xs md:text-xs font-black tabular-nums">
                        {video.Comments.toLocaleString()} <span className="text-[10px] md:text-[10px] opacity-40 ml-0.5 uppercase tracking-tighter">Comments</span>
                      </span>
                    </div>

                    <div className="relative group/tooltip flex items-center gap-1.5 md:gap-2 bg-amber-50 px-2.5 md:px-3 py-1.5 md:py-2 rounded-lg md:rounded-xl text-amber-900 border border-amber-100 shadow-sm cursor-help">
                      <Trophy size={12} className="text-amber-600 shrink-0 md:size-4" />
                      <span className="text-xs md:text-xs font-black tabular-nums">
                        #{video.ViewRank} <span className="text-[10px] md:text-[10px] opacity-40 ml-0.5 uppercase tracking-tighter">Total Views Rank</span>
                      </span>
                      {/* Tooltip Content */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-3 py-2 bg-gray-900 text-white text-[10px] font-bold rounded-xl opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-all duration-300 translate-y-2 group-hover/tooltip:translate-y-0 whitespace-nowrap z-30 shadow-2xl border border-white/10">
                        基于 YouTube 累计总播放量的全马排名
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-gray-900"></div>
                      </div>
                    </div>

                    <div className="relative group/tooltip flex items-center gap-1.5 md:gap-2 bg-orange-50 px-2.5 md:px-3 py-1.5 md:py-2 rounded-lg md:rounded-xl text-orange-900 border border-orange-100 shadow-sm cursor-help">
                      <TrendingUp size={12} className="text-orange-600 shrink-0 md:size-4" />
                      <span className="text-xs md:text-xs font-black tabular-nums">
                        #{video.TrendingRank} <span className="text-[10px] md:text-[10px] opacity-40 ml-0.5 uppercase tracking-tighter">Daily Views Rank</span>
                      </span>
                      {/* Tooltip Content */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-3 py-2 bg-gray-900 text-white text-[10px] font-bold rounded-xl opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-all duration-300 translate-y-2 group-hover/tooltip:translate-y-0 whitespace-nowrap z-30 shadow-2xl border border-white/10">
                        基于近期每日观看增量的实时人气排名
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-gray-900"></div>
                      </div>
                    </div>
                  </div>

                  {/* Channel & Description */}
                  <div className="flex items-start gap-4 md:gap-5 w-full pt-2">
                    <div className="p-0.5 bg-gradient-to-br from-red-600 to-amber-500 rounded-lg md:rounded-2xl shadow-lg shrink-0 group-hover:rotate-3 transition-transform duration-500">
                      <img 
                        src={video.ChannelAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(video.ChannelName)}&background=random`} 
                        alt={video.ChannelName}
                        className="w-10 h-10 md:w-14 md:h-14 rounded-[0.5rem] md:rounded-[1rem] border-2 border-white object-cover"
                      />
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-1.5 md:mb-1.5">
                        <span className="text-xs md:text-xs font-black text-red-900 uppercase tracking-widest leading-none truncate">{video.ChannelName}</span>
                        <div className="flex items-center gap-1.5 bg-red-50/80 px-2 py-0.5 rounded md:rounded-md border border-red-100/50">
                          <Calendar size={10} className="text-red-600 md:size-3" />
                          <span className="text-[10px] md:text-[10px] font-bold text-red-900/60 uppercase tracking-tighter whitespace-nowrap">
                            {t.publishedOn} {formattedDate}
                          </span>
                        </div>
                      </div>
                      <DescriptionText text={video.VideoDescription} t={t} />
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
  );
};
