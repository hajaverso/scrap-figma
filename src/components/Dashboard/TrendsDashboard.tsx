import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, BarChart3, Brain, Zap, Globe, Filter, RefreshCw, Download, Eye, Search, Loader, Database } from 'lucide-react';
import { RelevanceChart } from './RelevanceChart';
import { PredictionPanel } from './PredictionPanel';
import { TrendCards } from './TrendCards';
import { AnalyticsOverview } from './AnalyticsOverview';
import { CacheStatsPanel } from './CacheStatsPanel';
import { apifyService } from '../../services/apifyService';

interface TrendData {
  keyword: string;
  score: number;
  sentiment: number;
  volume: number;
  growth: number;
  sources: string[];
  articles: any[];
}

export const TrendsDashboard: React.FC = () => {
  const [trends, setTrends] = useState<TrendData[]>([]);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [customKeyword, setCustomKeyword] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [showCacheStats, setShowCacheStats] = useState(false);
  const [forceRefresh, setForceRefresh] = useState(false);

  const categories = [
    { id: 'all', name: 'Todos', icon: Globe },
    { id: 'tech', name: 'Tecnologia', icon: Zap },
    { id: 'ai', name: 'Inteligência Artificial', icon: Brain },
    { id: 'business', name: 'Negócios', icon: TrendingUp },
    { id: 'design', name: 'Design', icon: Eye }
  ];

  const trendingKeywords = [
    'Artificial Intelligence', 'Machine Learning', 'Blockchain', 'Web3', 
    'React', 'TypeScript', 'Next.js', 'SaaS', 'No-code', 'Design System',
    'Figma', 'OpenAI', 'ChatGPT', 'Automation', 'Cloud Computing'
  ];

  useEffect(() => {
    loadInitialTrends();
  }, []);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        refreshTrends();
      }, 30000); // Refresh a cada 30 segundos

      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const loadInitialTrends = async () => {
    setIsLoading(true);
    setSearchError(null);
    try {
      console.log('🚀 Carregando trends iniciais...');
      
      // Usar palavras-chave baseadas na categoria
      const keywords = getKeywordsByCategory(selectedCategory);
      
      const config = {
        keywords: keywords.slice(0, 5),
        timeRange: selectedTimeframe as any,
        analysisDepth: 'detailed' as const,
        includeFullContent: true,
        sourcePriority: 'all' as const,
        minEngagement: 10,
        maxArticlesPerSource: 15,
        includeVideos: true,
        videoTranscription: true
      };

      const trendData = forceRefresh 
        ? await apifyService.forceRefresh(config)
        : await apifyService.scrapeAdvancedTrends(config);
      
      const predictionData = await apifyService.generatePredictions(trendData);
      
      setTrends(trendData);
      setPredictions(predictionData);
      
      console.log('✅ Trends carregados:', trendData.length);
      
      if (forceRefresh) {
        setForceRefresh(false);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar trends:', error);
      setSearchError('Erro ao carregar dados. Usando dados de exemplo.');
      // Fallback data
      setTrends(generateFallbackTrends());
      setPredictions(generateFallbackPredictions());
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomKeywordSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customKeyword.trim()) return;

    setIsSearching(true);
    setSearchError(null);

    try {
      console.log(`🔍 Buscando análise para: "${customKeyword}"`);
      
      const config = {
        keywords: [customKeyword.trim()],
        timeRange: selectedTimeframe as any,
        analysisDepth: 'comprehensive' as const,
        includeFullContent: true,
        sourcePriority: 'all' as const,
        minEngagement: 5,
        maxArticlesPerSource: 20,
        includeVideos: true,
        videoTranscription: true
      };

      const trendData = forceRefresh 
        ? await apifyService.forceRefresh(config)
        : await apifyService.scrapeAdvancedTrends(config);
      
      const predictionData = await apifyService.generatePredictions(trendData);
      
      if (trendData.length === 0) {
        throw new Error('Nenhum dado encontrado para esta palavra-chave');
      }
      
      setTrends(trendData);
      setPredictions(predictionData);
      
      console.log(`✅ Análise concluída para "${customKeyword}"`);
      
      if (forceRefresh) {
        setForceRefresh(false);
      }
      
    } catch (error) {
      console.error('❌ Erro na busca personalizada:', error);
      setSearchError('Erro ao buscar dados para esta palavra-chave. Tente outra.');
    } finally {
      setIsSearching(false);
    }
  };

  const refreshTrends = async () => {
    try {
      const keywords = customKeyword.trim() 
        ? [customKeyword.trim()] 
        : getKeywordsByCategory(selectedCategory).slice(0, 3);
      
      const config = {
        keywords,
        timeRange: selectedTimeframe as any,
        analysisDepth: 'detailed' as const,
        includeFullContent: true,
        sourcePriority: 'all' as const,
        minEngagement: 10,
        maxArticlesPerSource: 15,
        includeVideos: true,
        videoTranscription: true
      };

      const trendData = await apifyService.scrapeAdvancedTrends(config);
      
      // Atualizar apenas alguns trends para economizar recursos
      setTrends(prevTrends => {
        const updatedTrends = [...prevTrends];
        trendData.forEach((newTrend, index) => {
          if (updatedTrends[index]) {
            updatedTrends[index] = newTrend;
          }
        });
        return updatedTrends;
      });
    } catch (error) {
      console.error('Erro no refresh:', error);
    }
  };

  const handleForceRefresh = () => {
    setForceRefresh(true);
    if (customKeyword.trim()) {
      handleCustomKeywordSearch(new Event('submit') as any);
    } else {
      loadInitialTrends();
    }
  };

  const getKeywordsByCategory = (category: string): string[] => {
    const categoryKeywords = {
      all: trendingKeywords,
      tech: ['React', 'TypeScript', 'Next.js', 'Vue', 'Node.js', 'Python'],
      ai: ['Artificial Intelligence', 'Machine Learning', 'ChatGPT', 'OpenAI', 'Neural Networks'],
      business: ['SaaS', 'Startup', 'Investment', 'IPO', 'Venture Capital'],
      design: ['Figma', 'Design System', 'UI/UX', 'Prototyping', 'Adobe']
    };

    return categoryKeywords[category as keyof typeof categoryKeywords] || trendingKeywords;
  };

  const generateFallbackTrends = (): TrendData[] => {
    const keyword = customKeyword.trim() || 'Technology';
    
    return Array.from({ length: 8 }, (_, index) => ({
      keyword: customKeyword.trim() || trendingKeywords[index] || `Trend ${index + 1}`,
      score: 8.5 - (index * 0.3) + Math.random() * 0.5,
      sentiment: 0.4 + Math.random() * 0.4,
      volume: 150 - (index * 10) + Math.floor(Math.random() * 50),
      growth: (Math.random() - 0.5) * 40,
      sources: ['Google', 'Twitter', 'Reddit', 'News'].slice(0, Math.floor(Math.random() * 3) + 2),
      articles: []
    }));
  };

  const generateFallbackPredictions = () => {
    return trends.slice(0, 5).map(trend => ({
      keyword: trend.keyword,
      currentScore: trend.score,
      predictedScore: trend.score + (Math.random() - 0.5) * 2,
      trend: Math.random() > 0.5 ? 'rising' : 'falling',
      confidence: 0.7 + Math.random() * 0.25,
      timeframe: '7 days'
    }));
  };

  const exportData = () => {
    const dataToExport = {
      timestamp: new Date().toISOString(),
      customKeyword: customKeyword || null,
      trends,
      predictions,
      cacheStats: apifyService.getCacheStats(),
      metadata: {
        timeframe: selectedTimeframe,
        category: selectedCategory,
        totalSources: trends.reduce((acc, trend) => acc + trend.sources.length, 0),
        forceRefreshUsed: forceRefresh
      }
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trends-${customKeyword || 'general'}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-[#111111] rounded-xl p-6 border border-gray-800"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-white font-inter font-bold text-2xl mb-2">
              Analytics & Trends Dashboard
            </h1>
            <p className="text-gray-400 font-inter">
              Análise profissional de tendências com cache inteligente
            </p>
          </div>

          <div className="flex items-center gap-3">
            <motion.button
              onClick={() => setShowCacheStats(!showCacheStats)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-inter font-medium text-sm transition-all duration-200 ${
                showCacheStats 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              <Database size={16} />
              Cache Stats
            </motion.button>

            <motion.button
              onClick={() => setAutoRefresh(!autoRefresh)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-inter font-medium text-sm transition-all duration-200 ${
                autoRefresh 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              <RefreshCw size={16} className={autoRefresh ? 'animate-spin' : ''} />
              Auto Refresh
            </motion.button>

            <motion.button
              onClick={exportData}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 bg-[#1500FF] hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-inter font-medium text-sm transition-all duration-200"
            >
              <Download size={16} />
              Exportar
            </motion.button>
          </div>
        </div>

        {/* Custom Keyword Search */}
        <motion.form
          onSubmit={handleCustomKeywordSearch}
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-6 p-4 bg-gray-900/50 rounded-lg border border-gray-700"
        >
          <div className="flex items-center gap-3 mb-3">
            <Search size={20} className="text-[#1500FF]" />
            <h3 className="text-white font-inter font-semibold text-lg">
              Busca Personalizada com Cache
            </h3>
          </div>
          
          <div className="flex gap-3">
            <input
              type="text"
              value={customKeyword}
              onChange={(e) => setCustomKeyword(e.target.value)}
              placeholder="Digite uma palavra-chave personalizada... (ex: OpenAI, Blockchain, React)"
              className="flex-1 bg-black border border-gray-700 rounded-lg px-4 py-3 text-white font-inter placeholder-gray-500 focus:outline-none focus:border-[#1500FF] transition-colors"
              disabled={isSearching}
            />
            
            <motion.button
              type="submit"
              disabled={isSearching || !customKeyword.trim()}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-[#1500FF] text-white px-6 py-3 rounded-lg font-inter font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:bg-blue-600"
            >
              {isSearching ? (
                <>
                  <Loader size={18} className="animate-spin" />
                  Analisando...
                </>
              ) : (
                <>
                  <Search size={18} />
                  Analisar
                </>
              )}
            </motion.button>

            <motion.button
              type="button"
              onClick={handleForceRefresh}
              disabled={isSearching || isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-3 rounded-lg font-inter font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              title="Forçar atualização (ignora cache)"
            >
              <RefreshCw size={18} />
              Forçar
            </motion.button>
          </div>

          {searchError && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 flex items-center gap-2 text-red-400 font-inter text-sm bg-red-900/20 p-3 rounded-lg border border-red-800"
            >
              <TrendingDown size={16} />
              {searchError}
            </motion.div>
          )}

          {customKeyword && trends.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 flex items-center gap-2 text-green-400 font-inter text-sm bg-green-900/20 p-3 rounded-lg border border-green-800"
            >
              <TrendingUp size={16} />
              Análise concluída para "{customKeyword}" • {trends.length} tendências encontradas
            </motion.div>
          )}
        </motion.form>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-400" />
            <span className="text-gray-400 font-inter text-sm">Categoria:</span>
            <div className="flex gap-1">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <motion.button
                    key={category.id}
                    onClick={() => {
                      setSelectedCategory(category.id);
                      if (!customKeyword) {
                        loadInitialTrends();
                      }
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`flex items-center gap-2 px-3 py-1 rounded-lg font-inter text-sm transition-all duration-200 ${
                      selectedCategory === category.id
                        ? 'bg-[#1500FF] text-white'
                        : 'bg-gray-800 text-gray-400 hover:text-white'
                    }`}
                  >
                    <Icon size={14} />
                    {category.name}
                  </motion.button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-gray-400 font-inter text-sm">Período:</span>
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1 text-white font-inter text-sm focus:outline-none focus:border-[#1500FF]"
            >
              <option value="1d">24 horas</option>
              <option value="3d">3 dias</option>
              <option value="7d">7 dias</option>
              <option value="14d">14 dias</option>
              <option value="30d">30 dias</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Cache Stats Panel */}
      {showCacheStats && <CacheStatsPanel />}

      {/* Analytics Overview */}
      <AnalyticsOverview trends={trends} isLoading={isLoading || isSearching} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trends Cards */}
        <div className="lg:col-span-2">
          <TrendCards trends={trends} isLoading={isLoading || isSearching} />
        </div>

        {/* Prediction Panel */}
        <div className="lg:col-span-1">
          <PredictionPanel predictions={predictions} isLoading={isLoading || isSearching} />
        </div>
      </div>

      {/* Relevance Chart */}
      <RelevanceChart trends={trends} timeframe={selectedTimeframe} />

      {/* Loading Overlay */}
      <AnimatePresence>
        {(isLoading || isSearching) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#111111] rounded-xl p-8 border border-gray-800 max-w-md mx-4"
            >
              <div className="text-center">
                <div className="animate-spin w-12 h-12 border-4 border-[#1500FF] border-t-transparent rounded-full mx-auto mb-4" />
                <h3 className="text-white font-inter font-semibold text-lg mb-2">
                  {isSearching ? 'Analisando Palavra-chave' : 'Processando Dados'}
                </h3>
                <p className="text-gray-400 font-inter text-sm">
                  {isSearching 
                    ? `Coletando dados para "${customKeyword}"...`
                    : 'Coletando dados de múltiplas fontes...'
                  }
                </p>
                <div className="mt-3 text-xs text-gray-500 font-inter">
                  {forceRefresh ? '🔄 Ignorando cache - Dados frescos' : '📦 Verificando cache primeiro'}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};