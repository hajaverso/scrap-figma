import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Activity } from 'lucide-react';

interface TrendData {
  keyword: string;
  score: number;
  sentiment: number;
  volume: number;
  growth: number;
}

interface RelevanceChartProps {
  trends: TrendData[];
  timeframe: string;
}

export const RelevanceChart: React.FC<RelevanceChartProps> = ({ trends, timeframe }) => {
  const chartData = useMemo(() => {
    return trends.slice(0, 10).map((trend, index) => ({
      ...trend,
      x: index,
      height: (trend.score / 10) * 100,
      sentimentColor: trend.sentiment > 0.6 ? '#22C55E' : trend.sentiment < 0.4 ? '#EF4444' : '#F59E0B',
      growthDirection: trend.growth > 0 ? 'up' : 'down'
    }));
  }, [trends]);

  const maxScore = Math.max(...trends.map(t => t.score), 10);
  const avgSentiment = trends.reduce((sum, t) => sum + t.sentiment, 0) / trends.length;
  const totalVolume = trends.reduce((sum, t) => sum + t.volume, 0);

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-[#111111] rounded-xl p-6 border border-gray-800"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-white font-inter font-semibold text-xl mb-2">
            Gráfico de Relevância
          </h3>
          <p className="text-gray-400 font-inter text-sm">
            Score de relevância por palavra-chave ({timeframe})
          </p>
        </div>

        <div className="flex items-center gap-4 text-sm font-inter">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[#1500FF] rounded-full" />
            <span className="text-gray-400">Relevância</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full" />
            <span className="text-gray-400">Sentimento +</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full" />
            <span className="text-gray-400">Sentimento -</span>
          </div>
        </div>
      </div>

      {/* Chart Area */}
      <div className="relative h-80 bg-black/20 rounded-lg p-4 overflow-x-auto">
        {/* Y-axis labels */}
        <div className="absolute left-2 top-4 bottom-4 flex flex-col justify-between text-xs font-inter text-gray-500">
          {Array.from({ length: 6 }, (_, i) => (
            <span key={i}>{(maxScore * (5 - i)) / 5}</span>
          ))}
        </div>

        {/* Grid lines */}
        <div className="absolute left-12 right-4 top-4 bottom-4">
          {Array.from({ length: 6 }, (_, i) => (
            <div
              key={i}
              className="absolute w-full border-t border-gray-800"
              style={{ top: `${(i / 5) * 100}%` }}
            />
          ))}
        </div>

        {/* Chart bars */}
        <div className="relative left-12 right-4 top-4 bottom-12 flex items-end justify-between">
          {chartData.map((data, index) => (
            <motion.div
              key={data.keyword}
              className="relative flex flex-col items-center group cursor-pointer"
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              {/* Main relevance bar */}
              <motion.div
                className="relative bg-[#1500FF] rounded-t-sm w-8 mb-2"
                style={{ height: `${data.height}%` }}
                whileHover={{ scaleY: 1.05 }}
              >
                {/* Sentiment indicator */}
                <div
                  className="absolute top-0 left-0 w-full h-2 rounded-t-sm"
                  style={{ backgroundColor: data.sentimentColor }}
                />
                
                {/* Growth indicator */}
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                  {data.growthDirection === 'up' ? (
                    <TrendingUp size={12} className="text-green-400" />
                  ) : (
                    <TrendingUp size={12} className="text-red-400 rotate-180" />
                  )}
                </div>
              </motion.div>

              {/* Volume bar */}
              <motion.div
                className="bg-gray-600 rounded-sm w-4 mb-2"
                style={{ height: `${(data.volume / 200) * 40}%` }}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: index * 0.1 + 0.2 }}
              />

              {/* Keyword label */}
              <span className="text-xs font-inter text-gray-400 transform -rotate-45 origin-left whitespace-nowrap mt-2">
                {data.keyword.length > 8 ? data.keyword.substring(0, 8) + '...' : data.keyword}
              </span>

              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                <div className="bg-black/90 text-white p-3 rounded-lg text-xs font-inter whitespace-nowrap border border-gray-700">
                  <div className="font-semibold mb-1">{data.keyword}</div>
                  <div>Score: {data.score.toFixed(1)}/10</div>
                  <div>Sentimento: {(data.sentiment * 100).toFixed(0)}%</div>
                  <div>Volume: {data.volume}</div>
                  <div>Crescimento: {data.growth > 0 ? '+' : ''}{data.growth.toFixed(1)}%</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Chart statistics */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="bg-gray-900/50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 size={14} className="text-[#1500FF]" />
            <span className="text-gray-400 font-inter text-xs">Score Máximo</span>
          </div>
          <span className="text-white font-inter font-semibold">
            {maxScore.toFixed(1)}/10
          </span>
        </div>

        <div className="bg-gray-900/50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Activity size={14} className="text-green-400" />
            <span className="text-gray-400 font-inter text-xs">Sentimento Médio</span>
          </div>
          <span className="text-white font-inter font-semibold">
            {(avgSentiment * 100).toFixed(0)}%
          </span>
        </div>

        <div className="bg-gray-900/50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={14} className="text-blue-400" />
            <span className="text-gray-400 font-inter text-xs">Volume Total</span>
          </div>
          <span className="text-white font-inter font-semibold">
            {totalVolume.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 text-xs font-inter text-gray-500">
        <p>💡 Altura da barra = Score de relevância | Cor do topo = Sentimento | Barra cinza = Volume</p>
      </div>
    </motion.div>
  );
};