import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { VideoData, Translations } from '../types';
import { Sparkles, Brain, Zap, RefreshCw, MessageSquareQuote, BarChart3, TrendingUp, Lightbulb } from 'lucide-react';

interface Props {
  videos: VideoData[];
  t: Translations;
}

export const GeminiInsights: React.FC<Props> = ({ videos, t }) => {
  const [insight, setInsight] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  const generateInsight = async () => {
    setLoading(true);
    setError(false);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const topPerformers = [...videos]
        .sort((a, b) => b.Views - a.Views)
        .slice(0, 6)
        .map(v => ({
          title: v.VideoTitle,
          channel: v.ChannelName,
          views: v.Views,
          dailyViews: v.ViewsPerDay,
          likes: v.Likes,
          comments: v.Comments,
          momentum: v.RankMomentum,
          advice: v.CreativeAdvice,
          duration: v.Duration
        }));

      const stats = {
        totalCount: videos.length,
        totalViews: videos.reduce((acc, v) => acc + v.Views, 0),
        avgViewsPerDay: Math.round(videos.reduce((acc, v) => acc + v.ViewsPerDay, 0) / (videos.length || 1)),
      };

      const prompt = `你是一位高级数据分析师与流行文化专家，请针对 2026 年马来西亚农历新年（CNY）歌曲市场进行深度多维分析。

数据摘要：
- 2026 总作品数：${stats.totalCount}
- 总浏览量：${stats.totalViews.toLocaleString()}
- 市场日均增量：${stats.avgViewsPerDay.toLocaleString()}
- 头部作品详情：${JSON.stringify(topPerformers)}

请基于以上数据，对比 2025 年的行业普遍趋势，输出一份【深度洞察报告】：

1. **流量表现与增长势头 (Quantitative)**：利用 ViewsPerDay 和 RankMomentum 分析当前的爆发力。判断哪些作品具有“长尾效应”，哪些是“短期洗脑”。
2. **观众参与度与质感 (Qualitative)**：分析点赞/评论比。探讨观众审美是否从“热闹就好”转向了更高的内容质感要求。
3. **跨维度对比 (2025 vs 2026)**：从制作规格、叙事长度、以及品牌商的嵌入方式，分析今年是否实现了从“感官刺激”到“情感共鸣”的跃迁。
4. **策略性建议 (Strategic)**：总结今年成功的关键因子 (Success Factors)，并为未来的创作提供 3 条基于数据的改进方向。

要求：
- 使用【简体中文】。
- 采用【Markdown】排版，使用加粗和列点。
- 直接输出分析报告，不要包含任何前导词或引号。`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
      });

      setInsight(response.text || '暂无深度洞察。');
    } catch (err) {
      console.error("Gemini Insight Error:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (videos.length > 0) {
      generateInsight();
    }
  }, [videos]);

  return (
    <div className="relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-red-600/5 via-amber-500/5 to-transparent rounded-[2.5rem] md:rounded-[4rem] -z-10 transition-all duration-1000 group-hover:scale-105"></div>
      
      <div className="bg-white/40 backdrop-blur-xl border border-red-100/50 rounded-[2.5rem] md:rounded-[4rem] p-8 md:p-12 shadow-xl shadow-red-900/5 relative">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
          
          <div className="shrink-0 relative">
            <div className="absolute -inset-4 bg-gradient-to-tr from-red-600 to-amber-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
            <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-red-600 to-amber-600 rounded-3xl flex items-center justify-center shadow-lg relative z-10">
              {loading ? (
                <RefreshCw size={32} className="text-white animate-spin" />
              ) : (
                <Brain size={32} className="text-white" />
              )}
            </div>
            <div className="absolute -bottom-2 -right-2 bg-white p-1.5 rounded-full shadow-md border border-gray-100">
              <Sparkles size={16} className="text-amber-500" />
            </div>
          </div>

          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row items-center gap-3 mb-8">
              <h3 className="text-xl md:text-2xl font-black text-red-950 font-cny uppercase tracking-tight">
                Gemini AI 深度行业洞察
              </h3>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-red-600/10 text-red-600 rounded-full border border-red-600/10">
                <BarChart3 size={12} fill="currentColor" />
                <span className="text-[10px] font-black uppercase tracking-widest">Expert Analysis</span>
              </div>
            </div>

            {loading ? (
              <div className="space-y-4">
                <div className="h-4 bg-red-900/5 rounded-full w-full animate-pulse"></div>
                <div className="h-4 bg-red-900/5 rounded-full w-3/4 animate-pulse mx-auto md:mx-0"></div>
                <div className="h-4 bg-red-900/5 rounded-full w-5/6 animate-pulse"></div>
                <div className="h-4 bg-red-900/5 rounded-full w-2/3 animate-pulse mx-auto md:mx-0"></div>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center md:items-start">
                <p className="text-red-900/40 text-sm font-medium mb-4">无法加载 AI 深度分析，请稍后再试。</p>
                <button 
                  onClick={generateInsight}
                  className="text-red-600 font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:underline"
                >
                  <RefreshCw size={14} /> 点击重试
                </button>
              </div>
            ) : (
              <div className="relative">
                <div className="absolute -left-10 -top-4 opacity-[0.03] hidden md:block">
                  <TrendingUp size={120} className="text-red-600" />
                </div>
                <div className="prose prose-red max-w-none text-base md:text-lg text-red-950/80 font-medium leading-relaxed font-cny animate-in fade-in slide-in-from-left-4 duration-1000 whitespace-pre-wrap">
                  {insight.split('\n').map((line, i) => {
                    const isHeader = line.startsWith('###') || line.startsWith('**');
                    return (
                      <p key={i} className={`${isHeader ? 'text-red-900 font-black mt-6 mb-2' : 'mb-3'}`}>
                        {line}
                      </p>
                    );
                  })}
                </div>
                <div className="mt-8 pt-6 border-t border-red-100/50 flex items-center gap-2 text-red-900/30">
                  <Lightbulb size={16} />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">Strategy Framework v2.0</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
