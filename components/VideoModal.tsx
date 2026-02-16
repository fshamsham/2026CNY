
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

const DescriptionText: React.FC<{ text: string; t: Translations; isSingle: boolean }> = ({ text, t, isSingle }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (!text) return null;

  const shouldShowToggle = !isSingle && text.length > 80;

  return (
    <div className="mt-2">
      <p className={`text-[13px] md:text-[13px] text-red-900/70 font-medium leading-relaxed max-w-4xl whitespace-pre-wrap break-words transition-all duration-500 ${(!isSingle && !isExpanded) ? 'line-clamp-2' : ''}`}>
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

  const isSingle = videos.length === 1;

  return createPortal(
    <div className="fixed inset-0 z-[110] flex flex-col items-center justify-end pt-12 md:pt-20 bg-red-950/25 backdrop-blur-xl animate-in fade-in duration-500">
      {/* Clickable area above the modal to close */}
      <div className="absolute inset-0 z-0" onClick={onClose}></div>
      
      <div className="relative z-10 bg-[#fffbf2] border-t border-x border-red-100 rounded-t-[2rem] md:rounded-t-[4rem] w-full max-w-7xl h-full overflow-hidden flex flex-col shadow-[0_-10px_60px_-15px_rgba(220,38,38,0.3)] animate-in slide-in-from-bottom-full duration-700 ease-out">
        
        {/* Header */}
        <div className="px-5 py-4 md:px-10 md:py-8 border-b border-red-50 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-20">
          <div className="min-w-0 flex-1 pr-4">
            <h2 className="text-xl md:text-3xl font-black font-cny text-red-950 tracking-tighter truncate leading-tight">{title}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-4 md:w-6 h-0.5 bg-red-600 shrink-0"></span>
              <p className="text-red-900/40 text-[9px] md:text-[10px] font-black uppercase tracking-[0.1em] md:tracking-[0.2em] truncate">
                 作品看板 • Performance Detail
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2.5 md:p-4 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white rounded-xl md:rounded-[1.5rem] transition-all duration-500 shadow-sm border border-red-100 shrink-0 active:scale-90"
          >
            <X size={20} className="md:w-7 md:h-7" />
          </button>
        </div>
        
        {/* List of Videos */}
        <div className="flex-1 overflow-y-auto p-4 md:p-12 space-y-8 md:space-y-16 bg-paper/30 custom-scrollbar pb-20">
          {videos.map((video, idx) => {
            const videoId = getYouTubeId(video.VideoURL);
            const isPlaying = playingVideoId === videoId;
            const formattedDate = formatDate(video.PublishDate);

            return (
              <div key={idx} className="flex flex-col gap-6 md:gap-12 bg-white rounded-[1.5rem] md:rounded-[3.5rem] p-5 md:p-12 border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-red-900/5 transition-all duration-700 group">
                
                {/* Player Area */}
                <div className="w-full relative aspect-video rounded-[1.2rem] md:rounded-[3rem] overflow-hidden bg-gray-950 shadow-2xl border-2 md:border-4 border-white">
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
                        <div className="bg-red-600 p-5 md:p-10 rounded-full text-white shadow-2xl transform transition-all duration-500 group-hover:scale-110 active:scale-95">
                          <Play size={24} className="md:w-12 md:h-12" fill="currentColor" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Details Area */}
                <div className="flex flex-col gap-5 md:gap-10 px-1">
                  <div className="w-full">
                    <a 
                      href={video.VideoURL} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="group/title inline-block max-w-full"
                    >
                      <h3 className="text-xl md:text-4xl font-black text-red-950 leading-tight tracking-tight hover:text-red-600 transition-colors duration-300 flex items-center gap-2 group/title">
                        <span className="flex-1 min-w-0 break-words line-clamp-2 md:line-clamp-none">{video.VideoTitle}</span>
                        <ExternalLink size={20} className="opacity-0 group-hover/title:opacity-100 translate-y-1 group-hover/title:translate-y-0 transition-all duration-300 text-red-600 shrink-0 hidden md:block" />
                      </h3>
                    </a>
                  </div>

                  {/* Stats Chips */}
                  <div className="flex flex-wrap gap-2.5 md:gap-5 items-center w-full">
                    <div className="flex items-center gap-2 md:gap-4 bg-red-50 px-3 md:px-5 py-2 md:py-3.5 rounded-xl md:rounded-[1.5rem] text-red-900 border border-red-100 shadow-sm">
                      <Eye size={14} className="text-red-600 shrink-0 md:size-6" />
                      <span className="text-xs md:text-lg font-black tabular-nums">
                        {video.Views.toLocaleString()} <span className="text-[10px] md:text-xs opacity-40 ml-1 uppercase tracking-tighter">Views</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2 md:gap-4 bg-red-50 px-3 md:px-5 py-2 md:py-3.5 rounded-xl md:rounded-[1.5rem] text-red-900 border border-red-100 shadow-sm">
                      <Heart size={14} className="text-red-500 shrink-0 md:size-6" />
                      <span className="text-xs md:text-lg font-black tabular-nums">
                        {video.Likes.toLocaleString()} <span className="text-[10px] md:text-xs opacity-40 ml-1 uppercase tracking-tighter">Likes</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2 md:gap-4 bg-red-50 px-3 md:px-5 py-2 md:py-3.5 rounded-xl md:rounded-[1.5rem] text-red-900 border border-red-100 shadow-sm">
                      <MessageSquare size={14} className="text-amber-700 shrink-0 md:size-6" />
                      <span className="text-xs md:text-lg font-black tabular-nums">
                        {video.Comments.toLocaleString()} <span className="text-[10px] md:text-xs opacity-40 ml-1 uppercase tracking-tighter">Comments</span>
                      </span>
                    </div>

                    <div className="relative group/tooltip flex items-center gap-2 md:gap-4 bg-amber-50 px-3 md:px-5 py-2 md:py-3.5 rounded-xl md:rounded-[1.5rem] text-amber-900 border border-amber-100 shadow-sm cursor-help">
                      <Trophy size={14} className="text-amber-600 shrink-0 md:size-6" />
                      <span className="text-xs md:text-lg font-black tabular-nums">
                        #{video.ViewRank} <span className="text-[10px] md:text-xs opacity-40 ml-1 uppercase tracking-tighter">Total Rank</span>
                      </span>
                    </div>

                    <div className="relative group/tooltip flex items-center gap-2 md:gap-4 bg-orange-50 px-3 md:px-5 py-2 md:py-3.5 rounded-xl md:rounded-[1.5rem] text-orange-900 border border-orange-100 shadow-sm cursor-help">
                      <TrendingUp size={14} className="text-orange-600 shrink-0 md:size-6" />
                      <span className="text-xs md:text-lg font-black tabular-nums">
                        #{video.TrendingRank} <span className="text-[10px] md:text-xs opacity-40 ml-1 uppercase tracking-tighter">Daily Rank</span>
                      </span>
                    </div>
                  </div>

                  {/* Channel & Description */}
                  <div className="flex items-start gap-4 md:gap-10 w-full pt-4">
                    <div className="p-0.5 bg-gradient-to-br from-red-600 to-amber-500 rounded-xl md:rounded-[2rem] shadow-lg shrink-0 group-hover:rotate-3 transition-transform duration-500">
                      <img 
                        src={video.ChannelAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(video.ChannelName)}&background=random`} 
                        alt={video.ChannelName}
                        className="w-12 h-12 md:w-24 md:h-24 rounded-[0.8rem] md:rounded-[1.8rem] border-2 border-white object-cover"
                      />
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mb-2">
                        <span className="text-sm md:text-2xl font-black text-red-950 uppercase tracking-widest leading-none truncate">{video.ChannelName}</span>
                        <div className="flex items-center gap-2 bg-red-50/80 px-3 py-1.5 rounded-xl border border-red-100/50">
                          <Calendar size={12} className="text-red-600 md:size-5" />
                          <span className="text-[10px] md:text-sm font-bold text-red-900/60 uppercase tracking-tighter whitespace-nowrap">
                            {t.publishedOn} {formattedDate}
                          </span>
                        </div>
                      </div>
                      <DescriptionText text={video.VideoDescription} t={t} isSingle={isSingle} />
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
