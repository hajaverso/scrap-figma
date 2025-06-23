import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Activity, Globe, Zap, Brain } from 'lucide-react';

interface TrendData {
  keyword: string;
  score: number;
  sentiment: number;
  volume: number;
  growth: number;
  sources: string[];
}

interface AnalyticsOverviewProps {
  trends: TrendData[];
  isLoading: boolean;
}

export const AnalyticsOverview: React.FC<AnalyticsOverviewProps> = ({ trends, isLoading }) => {
  const analytics = useMemo(() => {
    if (!trends.length) return null;

    const totalVolume = trends.reduce((sum, trend) => sum + trend.volume, 0);
    const avgScore = trends.reduce((sum, trend) => sum + trend.score, 0) / trends.length;
    const avgSentiment = trends.reduce((sum, trend) => sum + trend.sentiment, 0) / trends.length;
    const avgGrowth = trends.reduce((sum, trend) => sum + trend.growth, 0) / trends.length;
    const totalSources = new Set(trends.flatMap(trend => trend.sources)).size;
    const topTrend = trends.reduce((top, trend) => trend.score > top.score ? trend : top, trends[0]);

    return {
      totalVolume,
      avgScore,
      avgSentiment,
      avgGrowth,
      totalSources,
      topTrend,
      risingTrends: trends.filter(t => t.growth > 10).length,
      hotTopics: trends.filter(t => t.score > 7).length
    };
  }, [trends]);

  const stats = [
    {
      icon: BarChart3,
      label: 'Score Médio',
      value: analytics ? `${analytics.avgScore.toFixed(1)}/10` : '0',
      color: 'text-[#1500FF]',
      bgColor: 'bg-[#1500FF]/20',
      trend: analytics && analytics.avgScore > 6 ? '+' : '',
      isGood: analytics ? analytics.avgScore > 6 : false
    },
    {
      icon: Activity,
      label: 'Volume Total',
      value: analytics ? analytics.totalVolume.toLocaleString() : '0',
      color: 'text-green-400',
      bgColor: 'bg-green-500/20',
      trend: analytics && analytics.totalVolume > 1000 ? '+' : '',
      isGood: analytics ? analytics.totalVolume > 1000 : false
    },
    {
      icon: TrendingUp,
      label: 'Crescimento Médio',
      value: analytics ? `${analytics.avgGrowth > 0 ? '+' : ''}${analytics.avgGrowth.toFixed(1)}%` : '0%',
      color: analytics && analytics.avgGrowth > 0 ? 'text-green-400' : 'text-red-400',
      bgColor: analytics && analytics.avgGrowth > 0 ? 'bg-green-500/20' : 'bg-red-500/20',
      trend: analytics && analytics.avgGrowth > 0 ? '+' : '',
      isGood: analytics ? analytics.avgGrowth > 0 : false
    },
    {
      icon: Globe,
      label: 'Fontes Ativas',
      value: analytics ? analytics.totalSources.toString() : '0',
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
      trend: '+',
      isGood: analytics ? analytics.totalSources > 5 : false
    },
    {
      icon: Zap,
      label: 'Tendências Quentes',
      value: analytics ? analytics.hotTopics.toString() : '0',
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/20',
      trend: analytics && analytics.hotTopics > 3 ? '+' : '',
      isGood: analytics ? analytics.hotTopics > 3 : false
    },
    {
      icon: Brain,
      label: 'Sentimento Geral',
      value: analytics ? `${(analytics.avgSentiment * 100).toFixed(0)}%` : '0%',
      color: analytics && analytics.avgSentiment > 0.6 ? 'text-green-400' : analytics && analytics.avgSentiment < 0.4 ? 'text-red-400' : 'text-yellow-400',
      bgColor: analytics && analytics.avgSentiment > 0.6 ? 'bg-green-500/20' : analytics && analytics.avgSentiment < 0.4 ? 'bg-red-500/20' : 'bg-yellow-500/20',
      trend: analytics && analytics.avgSentiment > 0.5 ? '+' : '',
      isGood: analytics ? analytics.avgSentiment > 0.5 : false
    }
  ];

  if (isLoading) {
    return (
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4"
      >
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="bg-[#111111] rounded-xl p-4 border border-gray-800 animate-pulse">
            <div className="bg-gray-800 h-20 rounded" />
          </div>
        ))}
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4"
      >
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className="bg-[#111111] rounded-xl p-4 border border-gray-800 hover:border-gray-700 transition-all duration-300 group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon size={20} className={stat.color} />
                </div>
                
                {stat.isGood && (
                  <div className="text-green-400 font-inter text-xs bg-green-400/10 px-2 py-1 rounded">
                    {stat.trend}
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <h3 className="text-gray-400 font-inter text-xs font-medium">
                  {stat.label}
                </h3>
                <p className={`font-inter font-bold text-xl ${stat.color}`}>
                  {stat.value}
                </p>
              </div>

              {/* Hover effect */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 mt-2">
                <div className="w-full bg-gray-800 rounded-full h-1">
                  <div 
                    className={`h-1 rounded-full ${stat.color.replace('text-', 'bg-')}`}
                    style={{ width: stat.isGood ? '70%' : '30%' }}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Top Trend Highlight */}
      {analytics?.topTrend && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-r from-[#1500FF]/20 to-purple-600/20 rounded-xl p-6 border border-[#1500FF]/30"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-[#1500FF] font-inter font-semibold text-lg mb-2">
                🏆 Tendência #1: {analytics.topTrend.keyword}
              </h3>
              <p className="text-gray-300 font-inter text-sm">
                Score {analytics.topTrend.score.toFixed(1)}/10 • 
                {analytics.topTrend.growth > 0 ? ' Crescimento ' : ' Declínio '}
                {Math.abs(analytics.topTrend.growth).toFixed(1)}% • 
                Sentimento {(analytics.topTrend.sentiment * 100).toFixed(0)}%
              </p>
            </div>

            <div className="text-right">
              <div className="text-[#1500FF] font-inter font-bold text-2xl">
                #{1}
              </div>
              <div className="text-gray-400 font-inter text-xs">
                Posição atual
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Quick Insights */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-[#111111] rounded-xl p-6 border border-gray-800"
      >
        <h3 className="text-white font-inter font-semibold text-lg mb-4">
          📊 Insights Rápidos
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-900/50 rounded-lg p-4">
            <div className="text-green-400 font-inter font-semibold text-lg">
              {analytics?.risingTrends || 0}
            </div>
            <div className="text-gray-400 font-inter text-sm">
              Tendências em alta crescimento
            </div>
          </div>

          <div className="bg-gray-900/50 rounded-lg p-4">
            <div className="text-yellow-400 font-inter font-semibold text-lg">
              {analytics?.hotTopics || 0}
            </div>
            <div className="text-gray-400 font-inter text-sm">
              Tópicos super relevantes
            </div>
          </div>

          <div className="bg-gray-900/50 rounded-lg p-4">
            <div className="text-blue-400 font-inter font-semibold text-lg">
              {analytics?.totalSources || 0}
            </div>
            <div className="text-gray-400 font-inter text-sm">
              Fontes de dados ativas
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};