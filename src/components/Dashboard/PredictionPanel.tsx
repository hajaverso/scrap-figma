import React from 'react';
import { motion } from 'framer-motion';
import { Brain, TrendingUp, TrendingDown, Minus, Target, Clock } from 'lucide-react';

interface PredictionData {
  keyword: string;
  currentScore: number;
  predictedScore: number;
  trend: 'rising' | 'falling' | 'stable';
  confidence: number;
  timeframe: string;
}

interface PredictionPanelProps {
  predictions: PredictionData[];
  isLoading: boolean;
}

export const PredictionPanel: React.FC<PredictionPanelProps> = ({ predictions, isLoading }) => {
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'rising': return <TrendingUp size={16} className="text-green-400" />;
      case 'falling': return <TrendingDown size={16} className="text-red-400" />;
      default: return <Minus size={16} className="text-gray-400" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'rising': return 'text-green-400';
      case 'falling': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-400';
    if (confidence >= 0.6) return 'text-yellow-400';
    return 'text-red-400';
  };

  if (isLoading) {
    return (
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-[#111111] rounded-xl p-6 border border-gray-800"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-purple-500/20 rounded-lg">
            <Brain size={20} className="text-purple-400" />
          </div>
          <div>
            <h3 className="text-white font-inter font-semibold text-lg">
              Previsões IA
            </h3>
            <p className="text-gray-400 font-inter text-sm">
              Carregando predições...
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-800 h-20 rounded-lg" />
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
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-purple-500/20 rounded-lg">
          <Brain size={20} className="text-purple-400" />
        </div>
        <div>
          <h3 className="text-white font-inter font-semibold text-lg">
            Previsões IA
          </h3>
          <p className="text-gray-400 font-inter text-sm">
            Predições para os próximos 7 dias
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {predictions.slice(0, 8).map((prediction, index) => (
          <motion.div
            key={prediction.keyword}
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-900/30 rounded-lg p-4 border border-gray-800 hover:border-gray-700 transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h4 className="text-white font-inter font-medium text-sm">
                  {prediction.keyword}
                </h4>
                {getTrendIcon(prediction.trend)}
              </div>
              
              <div className="flex items-center gap-1">
                <Clock size={12} className="text-gray-500" />
                <span className="text-gray-500 font-inter text-xs">
                  {prediction.timeframe}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <span className="text-gray-400 font-inter text-xs">Atual</span>
                <div className="text-white font-inter font-semibold">
                  {prediction.currentScore.toFixed(1)}
                </div>
              </div>
              
              <div>
                <span className="text-gray-400 font-inter text-xs">Predição</span>
                <div className={`font-inter font-semibold ${getTrendColor(prediction.trend)}`}>
                  {prediction.predictedScore.toFixed(1)}
                </div>
              </div>
            </div>

            {/* Progress bars */}
            <div className="space-y-2 mb-3">
              <div className="flex justify-between text-xs font-inter text-gray-400">
                <span>Score atual</span>
                <span>{prediction.currentScore.toFixed(1)}/10</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div
                  className="bg-[#1500FF] h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(prediction.currentScore / 10) * 100}%` }}
                />
              </div>

              <div className="flex justify-between text-xs font-inter text-gray-400">
                <span>Score previsto</span>
                <span>{prediction.predictedScore.toFixed(1)}/10</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${
                    prediction.trend === 'rising' ? 'bg-green-500' :
                    prediction.trend === 'falling' ? 'bg-red-500' : 'bg-gray-500'
                  }`}
                  style={{ width: `${(prediction.predictedScore / 10) * 100}%` }}
                />
              </div>
            </div>

            {/* Confidence */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target size={12} className="text-gray-400" />
                <span className="text-gray-400 font-inter text-xs">Confiança</span>
              </div>
              
              <span className={`font-inter font-semibold text-sm ${getConfidenceColor(prediction.confidence)}`}>
                {(prediction.confidence * 100).toFixed(0)}%
              </span>
            </div>

            {/* Change indicator */}
            <div className="mt-2 pt-2 border-t border-gray-800">
              <div className="flex items-center justify-between text-xs font-inter">
                <span className="text-gray-400">Mudança esperada</span>
                <span className={getTrendColor(prediction.trend)}>
                  {prediction.trend === 'rising' ? '+' : prediction.trend === 'falling' ? '-' : ''}
                  {Math.abs(prediction.predictedScore - prediction.currentScore).toFixed(1)} pontos
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* AI Insights */}
      <div className="mt-6 bg-purple-900/20 border border-purple-800 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <Brain size={16} className="text-purple-400" />
          <span className="text-purple-400 font-inter font-medium text-sm">
            Insights da IA
          </span>
        </div>
        
        <div className="text-gray-300 font-inter text-xs space-y-1">
          <p>• {predictions.filter(p => p.trend === 'rising').length} tendências em crescimento</p>
          <p>• {predictions.filter(p => p.trend === 'falling').length} tendências em declínio</p>
          <p>• Confiança média: {((predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length) * 100).toFixed(0)}%</p>
        </div>
      </div>
    </motion.div>
  );
};