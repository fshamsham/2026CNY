import React, { useState, useEffect } from 'react';
import { VideoData, Translations } from '../types';
import { Eye, Clapperboard, Heart, MessageSquare, TrendingUp } from 'lucide-react';

interface Props {
  videos: VideoData[];
  t: Translations;
}

const Counter: React.FC<{ value: number }> = ({ value }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) return;
    let totalDuration = 1000;
    let incrementTime = Math.max(Math.floor(totalDuration / 50), 20);
    let timer = setInterval(() => {
      start += Math.ceil(end / 50);
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, incrementTime);
    return () => clearInterval(timer);
  }, [value]);

  return <span>{count.toLocaleString()}</span>;
};

export const MetricsSection: React.FC<Props> = ({ videos, t }) => {
  const totalViews = videos.reduce((acc, v) => acc + (v.Views || 0), 0);
  const totalLikes = videos.reduce((acc, v) => acc + (v.Likes || 0), 0);
  const totalComments = videos.reduce((acc, v) => acc + (v.Comments || 0), 0);
  const avgViewsPerDay = Math.round(videos.reduce((acc, v) => acc + (v.ViewsPerDay || 0), 0) / (videos.length || 1));

  const stats = [
    { label: t.totalVideos, value: videos.length, icon: Clapperboard, color: 'text-red-600', bg: 'bg-red-50' },
    { label: t.totalViews, value: totalViews, icon: Eye, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: t.totalLikes, value: totalLikes, icon: Heart, color: 'text-red-500', bg: 'bg-red-50' },
    { label: t.totalComments, value: totalComments, icon: MessageSquare, color: 'text-amber-700', bg: 'bg-amber-50' },
    { label: t.avgViewsPerDay, value: avgViewsPerDay, icon: TrendingUp, color: 'text-red-700', bg: 'bg-red-50' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
      {stats.map((stat, i) => (
        <div key={i} className="group relative bg-white rounded-[2rem] md:rounded-[2.8rem] p-5 md:p-8 border border-gray-100 hover:border-red-600/20 transition-all duration-700 hover:-translate-y-2 shadow-sm hover:shadow-2xl hover:shadow-red-900/10">
          <div className={`absolute top-4 right-4 md:top-6 md:right-6 p-2 md:p-3 rounded-xl md:rounded-2xl ${stat.bg} opacity-80 group-hover:opacity-100 transition-all`}>
            <stat.icon size={20} className={`${stat.color} md:w-8 md:h-8`} />
          </div>
          
          <div className="relative z-10 pt-4 md:pt-6">
            <p className="text-red-900/40 text-sm md:text-base font-black uppercase tracking-[0.05em] md:tracking-[0.15em] mb-1.5 md:mb-2 pr-8 whitespace-normal leading-tight">
              {stat.label}
            </p>
            <h3 className="text-2xl md:text-4xl font-black text-red-950 tracking-tighter">
              <Counter value={stat.value} />
            </h3>
            <div className="w-4 md:w-6 h-1 bg-red-600/10 rounded-full mt-3 md:mt-4 group-hover:w-12 md:group-hover:w-16 group-hover:bg-red-600 transition-all duration-700"></div>
          </div>
        </div>
      ))}
    </div>
  );
};