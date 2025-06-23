import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Activity, Users, Globe, Heart } from 'lucide-react';

interface TrendData {
  keyword: string;
  score: number;
  sentiment: number;
  volume: number;
  growth: number;
  sources: string[];
}

interface TrendCardsProps {
  trends: TrendData[];
  isLoading: boolean;
}

export const TrendCards: React.FC<TrendCardsProps> = ({ trends, isLoading }) => {
  const getSentimentColor = (sentiment: number) => {
    if (sentiment >= 0.7) return 'text-green-400';
    if (sentiment >= 0.5) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getSentimentIcon = (sentiment: number) => {
    if (sentiment >= 0.7) return '😊';
    if (sentiment >= 0.5) return '😐';
    return '😟';
  };

  const getGrowthColor = (growth: number) => {
    if (growth > 10) return 'text-green-400';
    if (growth > 0) return 'text-green-300';
    if (growth < -10) return 'text-red-400';
    return 'text-red-300';
  };

  if (isLoading) {
    return (
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-[#111111] rounded-xl p-6 border border-gray-800"
      >
        <h3 className="text-white font-inter font-semibold text-lg mb-4">
          Tendências em Destaque
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-800 h-32 rounded-lg" />
            </div>
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-[#111111] rounded-xl p-6 border border-gray-800"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-white font-inter font-semibold text-lg">
          Tendências em Destaque
        </h3>
        
        <div className="text-gray-400 font-inter text-sm">
          {trends.length} tendências encontradas
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {trends.slice(0, 8).map((trend, index) => (
          <motion.div
            key={trend.keyword}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gradient-to-br from-gray-900 to-black rounded-xl p-5 border border-gray-800 hover:border-gray-700 transition-all duration-300 group cursor-pointer"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[#1500FF] rounded-full" />
                <h4 className="text-white font-inter font-semibold text-base truncate">
                  {trend.keyword}
                </h4>
              </div>
              
              <div className="flex items-center gap-1">
                {trend.growth > 0 ? (
                  <TrendingUp size={16} className="text-green-400" />
                ) : (
                  <TrendingDown size={16} className="text-red-400" />
                )}
              </div>
            </div>

            {/* Score and Sentiment */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Activity size={14} className="text-[#1500FF]" />
                  <span className="text-gray-400 font-inter text-xs">Score</span>
                </div>
                <div className="text-white font-inter font-bold text-xl">
                  {trend.score.toFixed(1)}
                  <span className="text-gray-500 text-sm">/10</span>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Heart size={14} className={getSentimentColor(trend.sentiment)} />
                  <span className="text-gray-400 font-inter text-xs">Sentimento</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`font-inter font-semibold ${getSentimentColor(trend.sentiment)}`}>
                    {(trend.sentiment * 100).toFixed(0)}%
                  </span>
                  <span className="text-lg">
                    {getSentimentIcon(trend.sentiment)}
                  </span>
                </div>
              </div>
            </div>

            {/* Volume and Growth */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Users size={14} className="text-blue-400" />
                  <span className="text-gray-400 font-inter text-xs">Volume</span>
                </div>
                <div className="text-white font-inter font-semibold">
                  {trend.volume.toLocaleString()}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp size={14} className="text-purple-400" />
                  <span className="text-gray-400 font-inter text-xs">Crescimento</span>
                </div>
                <div className={`font-inter font-semibold ${getGrowthColor(trend.growth)}`}>
                  {trend.growth > 0 ? '+' : ''}{trend.growth.toFixed(1)}%
                </div>
              </div>
            </div>

            {/* Sources */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Globe size={14} className="text-gray-400" />
                <span className="text-gray-400 font-inter text-xs">Fontes</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {trend.sources.slice(0, 3).map((source, sourceIndex) => (
                  <span
                    key={sourceIndex}
                    className="bg-gray-800 text-gray-300 px-2 py-1 rounded text-xs font-inter"
                  >
                    {source}
                  </span>
                ))}
                {trend.sources.length > 3 && (
                  <span className="text-gray-500 font-inter text-xs">
                    +{trend.sources.length - 3}
                  </span>
                )}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-3">
              <div className="flex justify-between text-xs font-inter text-gray-400 mb-1">
                <span>Relevância</span>
                <span>{trend.score.toFixed(1)}/10</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <motion.div
                  className="bg-gradient-to-r from-[#1500FF] to-blue-400 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(trend.score / 10) * 100}%` }}
                  transition={{ delay: index * 0.1 + 0.3, duration: 0.8 }}
                />
              </div>
            </div>

            {/* Hover Effect */}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="text-xs font-inter text-gray-500">
                💡 Clique para ver análise detalhada
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Load More */}
      {trends.length > 8 && (
        <div className="mt-6 text-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-inter font-medium transition-all duration-200"
          >
            Ver mais tendências ({trends.length - 8})
          </motion.button>
        </div>
      )}
    </motion.div>
  );
};