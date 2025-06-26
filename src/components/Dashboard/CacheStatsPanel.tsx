import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Database, Trash2, RefreshCw, Download, Clock, BarChart3, HardDrive, Zap } from 'lucide-react';
import { cacheService } from '../../services/cacheService';
import { apifyService } from '../../services/apifyService';

export const CacheStatsPanel: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    loadStats();
    
    // Atualizar stats a cada 30 segundos
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadStats = () => {
    setIsLoading(true);
    try {
      const cacheStats = apifyService.getCacheStats();
      setStats(cacheStats);
    } catch (error) {
      console.error('Erro ao carregar estatísticas do cache:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearCache = () => {
    if (confirm('Tem certeza que deseja limpar todo o cache? Esta ação não pode ser desfeita.')) {
      apifyService.clearCache();
      loadStats();
    }
  };

  const handleExportCache = () => {
    try {
      const cacheData = cacheService.exportCache();
      const blob = new Blob([JSON.stringify(cacheData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cache-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao exportar cache:', error);
    }
  };

  const formatDate = (date?: Date) => {
    if (!date) return 'N/A';
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getHitRateColor = (hitRate: number) => {
    if (hitRate >= 80) return 'text-green-400';
    if (hitRate >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#111111] rounded-xl p-6 border border-gray-800"
      >
        <div className="flex items-center gap-3 mb-4">
          <Database size={20} className="text-blue-400" />
          <h3 className="text-white font-inter font-semibold text-lg">
            Cache do Sistema
          </h3>
        </div>
        
        <div className="animate-pulse space-y-4">
          <div className="bg-gray-800 h-20 rounded-lg" />
          <div className="bg-gray-800 h-16 rounded-lg" />
        </div>
      </motion.div>
    );
  }

  if (!stats) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#111111] rounded-xl p-6 border border-gray-800"
      >
        <div className="text-center py-8">
          <Database size={48} className="text-gray-600 mx-auto mb-4" />
          <h3 className="text-white font-inter font-medium text-lg mb-2">
            Cache Não Disponível
          </h3>
          <p className="text-gray-400 font-inter text-sm">
            Erro ao carregar estatísticas do cache
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#111111] rounded-xl p-6 border border-gray-800"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <Database size={20} className="text-blue-400" />
          </div>
          <div>
            <h3 className="text-white font-inter font-semibold text-lg">
              Cache Inteligente
            </h3>
            <p className="text-gray-400 font-inter text-sm">
              Sistema de cache baseado em keyword + período
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <motion.button
            onClick={loadStats}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all duration-200"
            title="Atualizar estatísticas"
          >
            <RefreshCw size={16} />
          </motion.button>

          <motion.button
            onClick={handleExportCache}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all duration-200"
            title="Exportar cache"
          >
            <Download size={16} />
          </motion.button>

          <motion.button
            onClick={handleClearCache}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-all duration-200"
            title="Limpar cache"
          >
            <Trash2 size={16} />
          </motion.button>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-900/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <HardDrive size={16} className="text-blue-400" />
            <span className="text-gray-400 font-inter text-xs">Entradas</span>
          </div>
          <div className="text-white font-inter font-bold text-xl">
            {stats.totalEntries}
          </div>
          <div className="text-gray-500 font-inter text-xs">
            {stats.expiredEntries} expiradas
          </div>
        </div>

        <div className="bg-gray-900/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap size={16} className="text-green-400" />
            <span className="text-gray-400 font-inter text-xs">Hit Rate</span>
          </div>
          <div className={`font-inter font-bold text-xl ${getHitRateColor(stats.hitRate)}`}>
            {stats.hitRate.toFixed(1)}%
          </div>
          <div className="text-gray-500 font-inter text-xs">
            {stats.totalHits} hits / {stats.totalMisses} misses
          </div>
        </div>

        <div className="bg-gray-900/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 size={16} className="text-purple-400" />
            <span className="text-gray-400 font-inter text-xs">Tamanho</span>
          </div>
          <div className="text-white font-inter font-bold text-xl">
            {stats.cacheSize}
          </div>
          <div className="text-gray-500 font-inter text-xs">
            Em memória
          </div>
        </div>

        <div className="bg-gray-900/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={16} className="text-yellow-400" />
            <span className="text-gray-400 font-inter text-xs">Atividade</span>
          </div>
          <div className="text-white font-inter font-bold text-sm">
            {stats.newestEntry ? 'Ativo' : 'Vazio'}
          </div>
          <div className="text-gray-500 font-inter text-xs">
            {stats.newestEntry ? formatDate(stats.newestEntry).split(' ')[1] : 'N/A'}
          </div>
        </div>
      </div>

      {/* Performance Indicator */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-400 font-inter text-sm">Performance do Cache</span>
          <span className={`font-inter text-sm font-medium ${getHitRateColor(stats.hitRate)}`}>
            {stats.hitRate >= 80 ? 'Excelente' : stats.hitRate >= 60 ? 'Bom' : 'Precisa Melhorar'}
          </span>
        </div>
        
        <div className="w-full bg-gray-800 rounded-full h-2">
          <motion.div
            className={`h-2 rounded-full transition-all duration-500 ${
              stats.hitRate >= 80 ? 'bg-green-500' : 
              stats.hitRate >= 60 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(stats.hitRate, 100)}%` }}
          />
        </div>
      </div>

      {/* Detailed Stats Toggle */}
      <div className="border-t border-gray-800 pt-4">
        <motion.button
          onClick={() => setShowDetails(!showDetails)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full text-left text-gray-400 hover:text-white font-inter text-sm transition-colors"
        >
          {showDetails ? '▼' : '▶'} Detalhes do Cache
        </motion.button>

        {showDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 space-y-3"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-inter">
              <div>
                <span className="text-gray-400">Total de Requisições:</span>
                <span className="text-white ml-2">{stats.totalHits + stats.totalMisses}</span>
              </div>
              
              <div>
                <span className="text-gray-400">Cache Hits:</span>
                <span className="text-green-400 ml-2">{stats.totalHits}</span>
              </div>
              
              <div>
                <span className="text-gray-400">Cache Misses:</span>
                <span className="text-red-400 ml-2">{stats.totalMisses}</span>
              </div>
              
              <div>
                <span className="text-gray-400">Entradas Expiradas:</span>
                <span className="text-yellow-400 ml-2">{stats.expiredEntries}</span>
              </div>
              
              {stats.oldestEntry && (
                <div>
                  <span className="text-gray-400">Entrada Mais Antiga:</span>
                  <span className="text-white ml-2">{formatDate(stats.oldestEntry)}</span>
                </div>
              )}
              
              {stats.newestEntry && (
                <div>
                  <span className="text-gray-400">Entrada Mais Recente:</span>
                  <span className="text-white ml-2">{formatDate(stats.newestEntry)}</span>
                </div>
              )}
            </div>

            {/* Cache Benefits */}
            <div className="bg-green-900/20 border border-green-800 rounded-lg p-3 mt-4">
              <h4 className="text-green-400 font-inter font-medium text-sm mb-2">
                💡 Benefícios do Cache
              </h4>
              <div className="text-gray-300 font-inter text-xs space-y-1">
                <p>• Reduz tempo de resposta em até 90%</p>
                <p>• Economiza recursos de API e largura de banda</p>
                <p>• Melhora experiência do usuário com dados instantâneos</p>
                <p>• Funciona offline com dados previamente carregados</p>
                <p>• TTL configurável baseado no período de análise</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};