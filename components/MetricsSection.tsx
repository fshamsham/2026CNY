import React, { useState, useEffect, useMemo } from 'react';
import { VideoData, Translations } from '../types';
import { Eye, Clapperboard, Heart, MessageSquare, TrendingUp } from 'lucide-react';

interface Props {
  videos: VideoData[];
  t: Translations;
}

const compactFormatter = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

const fullFormatter = new Intl.NumberFormat('en-US');

const Counter: React.FC<{ value: number; compact?: boolean }> = ({ value, compact = true }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) {
      setCount(end);
      return;
    }
    const totalDuration = 1000;
    const incrementTime = Math.max(Math.floor(totalDuration / 50), 20);
    const timer = setInterval(() => {
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

  return <span>{compact ? compactFormatter.format(count) : fullFormatter.format(count)}</span>;
};

export const MetricsSection: React.FC<Props> = ({ videos, t }) => {
  const totalViews = useMemo(() => videos.reduce((acc, v) => acc + (v.Views || 0), 0), [videos]);
  const totalLikes = useMemo(() => videos.reduce((acc, v) => acc + (v.Likes || 0), 0), [videos]);
  const totalComments = useMemo(() => videos.reduce((acc, v) => acc + (v.Comments || 0), 0), [videos]);
  const avgViewsPerDay = useMemo(() => Math.round(videos.reduce((acc, v) => acc + (v.ViewsPerDay || 0), 0) / (videos.length || 1)), [videos]);

  const monthlyCounts = useMemo(() => {
    const counts: Record<string, number> = {
      '2025-11': 0,
      '2025-12': 0,
      '2026-01': 0,
    };
    videos.forEach(v => {
      const d = new Date(v.PublishDate);
      if (!isNaN(d.getTime())) {
        const key = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
        if (counts[key] !== undefined) {
          counts[key]++;
        }
      }
    });
    return counts;
  }, [videos]);

  const stats = [
    { label: t.totalVideos, value: videos.length, icon: Clapperboard, color: 'text-red-600', bg: 'bg-red-50', isTotal: true },
    { label: t.totalViews, value: totalViews, icon: Eye, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: t.totalLikes, value: totalLikes, icon: Heart, color: 'text-red-500', bg: 'bg-red-50' },
    { label: t.totalComments, value: totalComments, icon: MessageSquare, color: 'text-amber-700', bg: 'bg-amber-50' },
    { label: t.avgViewsPerDay, value: avgViewsPerDay, icon: TrendingUp, color: 'text-red-700', bg: 'bg-red-50' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
      {stats.map((stat, i) => (
        <div 
          key={i} 
          className="group relative bg-white rounded-[2rem] md:rounded-[2.8rem] p-5 md:p-8 border border-gray-100 hover:border-red-600/20 transition-all duration-700 hover:-translate-y-2 shadow-sm hover:shadow-2xl hover:shadow-red-900/10 cursor-help hover:z-50"
        >
          {/* Tooltip for Detailed Data - Now positioned closer to the bottom */}
          <div className="absolute top-[105%] left-1/2 -translate-x-1/2 px-4 py-3 bg-red-950 text-white text-[10px] md:text-xs font-black rounded-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 translate-y-2 group-hover:translate-y-0 whitespace-nowrap z-[60] shadow-2xl border border-white/10">
            {stat.isTotal ? (
              <div className="flex flex-col gap-1.5 text-left min-w-[140px]">
                <div className="flex justify-between items-center gap-6">
                  <span className="text-amber-400">2025-11:</span>
                  <span className="font-black">{monthlyCounts['2025-11']} 首</span>
                </div>
                <div className="flex justify-between items-center gap-6">
                  <span className="text-amber-400">2025-12:</span>
                  <span className="font-black">{monthlyCounts['2025-12']} 首</span>
                </div>
                <div className="flex justify-between items-center gap-6">
                  <span className="text-amber-400">2026-01:</span>
                  <span className="font-black">{monthlyCounts['2026-01']} 首</span>
                </div>
                <div className="h-px bg-white/20 my-1"></div>
                <div className="flex justify-between items-center gap-6 opacity-60">
                  <span className="text-[8px] uppercase tracking-tighter">Grand Total:</span>
                  <span className="font-black">{fullFormatter.format(stat.value)}</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-amber-400 uppercase">Exact:</span>
                <span className="font-black">{fullFormatter.format(stat.value)}</span>
              </div>
            )}
            {/* Arrow pointing UP */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-8 border-transparent border-b-red-950"></div>
          </div>

          <div className={`absolute top-4 right-4 md:top-6 md:right-6 p-2 md:p-3 rounded-xl md:rounded-2xl ${stat.bg} opacity-80 group-hover:opacity-100 transition-all`}>
            <stat.icon size={20} className={`${stat.color} md:w-8 md:h-8`} />
          </div>
          
          <div className="relative z-10 pt-4 md:pt-6">
            <p className="text-red-900/40 text-sm md:text-base font-black uppercase tracking-[0.05em] md:tracking-[0.15em] mb-1.5 md:mb-2 pr-8 whitespace-normal leading-tight">
              {stat.label}
            </p>
            <div className="flex items-baseline gap-1">
              <h3 className="text-2xl md:text-4xl font-black text-red-950 tracking-tighter">
                <Counter value={stat.value} compact={true} />
              </h3>
            </div>
            <div className="w-4 md:w-6 h-1 bg-red-600/10 rounded-full mt-3 md:mt-4 group-hover:w-12 md:group-hover:w-16 group-hover:bg-red-600 transition-all duration-700"></div>
          </div>
        </div>
      ))}
    </div>
  );
};
