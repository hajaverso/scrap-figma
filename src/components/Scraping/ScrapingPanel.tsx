import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Loader, AlertCircle, TrendingUp, Globe, Zap, Brain, BarChart3, Target } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { ArticleTable } from './ArticleTable';
import { apifyService } from '../../services/apifyService';

export const ScrapingPanel: React.FC = () => {
  const {
    searchKeyword,
    setSearchKeyword,
    setArticles,
    isScrapingLoading,
    setScrapingError,
    scrapingError,
    articles,
    startScraping
  } = useAppStore();

  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const trendingCategories = [
    {
      name: 'Tecnologia',
      keywords: ['Artificial Intelligence', 'Machine Learning', 'Blockchain', 'Web3', 'React', 'TypeScript', 'Next.js'],
      icon: Zap,
      color: 'text-blue-400'
    },
    {
      name: 'Negócios',
      keywords: ['SaaS', 'Startup', 'Investment', 'IPO', 'Venture Capital', 'Digital Marketing'],
      icon: TrendingUp,
      color: 'text-green-400'
    },
    {
      name: 'Design',
      keywords: ['Figma', 'Design System', 'UI/UX', 'Prototyping', 'Adobe', 'No-code'],
      icon: Target,
      color: 'text-purple-400'
    },
    {
      name: 'IA & Automação',
      keywords: ['ChatGPT', 'OpenAI', 'Automation', 'Neural Networks', 'Deep Learning'],
      icon: Brain,
      color: 'text-yellow-400'
    }
  ];

  const popularKeywords = [
    'AI', 'Machine Learning', 'Blockchain', 'Web3', 'React', 'TypeScript',
    'Design System', 'UX/UI', 'Figma', 'No-code', 'SaaS', 'Startup',
    'ChatGPT', 'OpenAI', 'Automation', 'Cloud Computing'
  ];

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchKeyword.trim()) return;

    setIsAnalyzing(true);
    setScrapingError(null);

    try {
      console.log('🚀 Iniciando scraping profissional com Apify...');
      
      // Usar Apify para scraping profissional
      const keywords = [searchKeyword, ...selectedKeywords].slice(0, 5);
      const trends = await apifyService.scrapeTrends(keywords);
      
      setTrendData(trends);
      
      // Converter trends para articles
      const allArticles = trends.flatMap(trend => trend.articles);
      setArticles(allArticles);
      
      console.log(`✅ Encontrados ${allArticles.length} artigos de ${trends.length} tendências`);
      
    } catch (error) {
      console.error('❌ Erro no scraping:', error);
      setScrapingError('Erro no scraping profissional. Tente novamente.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleKeywordToggle = (keyword: string) => {
    setSelectedKeywords(prev => 
      prev.includes(keyword) 
        ? prev.filter(k => k !== keyword)
        : [...prev, keyword].slice(0, 4) // Máximo 4 keywords adicionais
    );
  };

  const handleCategorySelect = (keywords: string[]) => {
    setSelectedKeywords(keywords.slice(0, 4));
  };

  const isKeywordSelected = (keyword: string) => selectedKeywords.includes(keyword);

  return (
    <div className="space-y-6">
      {/* Search Form com Apify */}
      <motion.form
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        onSubmit={handleSearch}
        className="bg-[#111111] rounded-xl p-6 border border-gray-800"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-[#1500FF]/20 rounded-lg">
            <BarChart3 size={24} className="text-[#1500FF]" />
          </div>
          <div>
            <h3 className="text-white font-inter font-semibold text-xl">
              Scraping Profissional com Apify
            </h3>
            <p className="text-gray-400 font-inter text-sm">
              Análise avançada de tendências de múltiplas fontes em tempo real
            </p>
          </div>
        </div>
        
        <div className="space-y-4">
          {/* Main Search Input */}
          <div className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="Digite o tema principal (ex: AI, design, startup...)"
                className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white font-inter placeholder-gray-500 focus:outline-none focus:border-[#1500FF] transition-colors"
                disabled={isAnalyzing}
              />
            </div>
            
            <motion.button
              type="submit"
              disabled={isAnalyzing || !searchKeyword.trim()}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-[#1500FF] text-white px-8 py-3 rounded-lg font-inter font-semibold flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:bg-blue-600"
            >
              {isAnalyzing ? (
                <>
                  <Loader size={20} className="animate-spin" />
                  Analisando...
                </>
              ) : (
                <>
                  <Search size={20} />
                  Buscar com IA
                </>
              )}
            </motion.button>
          </div>

          {/* Selected Keywords Display */}
          {selectedKeywords.length > 0 && (
            <div className="bg-gray-900/50 rounded-lg p-4">
              <h4 className="text-gray-300 font-inter font-medium text-sm mb-3">
                Palavras-chave selecionadas ({selectedKeywords.length}/4):
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedKeywords.map((keyword) => (
                  <motion.button
                    key={keyword}
                    onClick={() => handleKeywordToggle(keyword)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-[#1500FF] text-white px-3 py-1 rounded-full font-inter text-sm flex items-center gap-2"
                  >
                    {keyword}
                    <span className="text-xs">×</span>
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {/* Category Quick Select */}
          <div className="space-y-3">
            <h4 className="text-gray-300 font-inter font-medium text-sm">
              Categorias em Destaque:
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {trendingCategories.map((category) => {
                const Icon = category.icon;
                return (
                  <motion.button
                    key={category.name}
                    type="button"
                    onClick={() => handleCategorySelect(category.keywords)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isAnalyzing}
                    className="bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg p-4 text-left transition-all duration-200 disabled:opacity-50 group"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Icon size={20} className={category.color} />
                      <h5 className="text-white font-inter font-medium text-sm">
                        {category.name}
                      </h5>
                    </div>
                    <p className="text-gray-400 font-inter text-xs">
                      {category.keywords.length} palavras-chave
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {category.keywords.slice(0, 3).map((keyword) => (
                        <span
                          key={keyword}
                          className="bg-gray-700 text-gray-300 px-2 py-1 rounded text-xs font-inter"
                        >
                          {keyword}
                        </span>
                      ))}
                      {category.keywords.length > 3 && (
                        <span className="text-gray-500 font-inter text-xs">
                          +{category.keywords.length - 3}
                        </span>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Popular Keywords */}
          <div className="space-y-3">
            <h4 className="text-gray-300 font-inter font-medium text-sm">
              Palavras-chave populares:
            </h4>
            <div className="flex flex-wrap gap-2">
              {popularKeywords.map((keyword) => (
                <motion.button
                  key={keyword}
                  type="button"
                  onClick={() => handleKeywordToggle(keyword)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={isAnalyzing}
                  className={`px-3 py-2 rounded-lg font-inter text-sm transition-all duration-200 disabled:opacity-50 ${
                    isKeywordSelected(keyword)
                      ? 'bg-[#1500FF] text-white'
                      : 'bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white'
                  }`}
                >
                  {keyword}
                  {isKeywordSelected(keyword) && (
                    <span className="ml-2">✓</span>
                  )}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Data Sources Info */}
          <div className="bg-green-900/20 border border-green-800 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-green-400 font-inter font-medium text-sm">
                Apify Conectado - Fontes Ativas
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-gray-300 font-inter text-xs">
              <div className="flex items-center gap-1">
                <Globe size={12} />
                <span>Google Search</span>
              </div>
              <div className="flex items-center gap-1">
                <Globe size={12} />
                <span>Reddit</span>
              </div>
              <div className="flex items-center gap-1">
                <Globe size={12} />
                <span>Twitter</span>
              </div>
              <div className="flex items-center gap-1">
                <Globe size={12} />
                <span>Hacker News</span>
              </div>
              <div className="flex items-center gap-1">
                <Zap size={12} />
                <span>News Sites</span>
              </div>
              <div className="flex items-center gap-1">
                <Brain size={12} />
                <span>IA Analysis</span>
              </div>
              <div className="flex items-center gap-1">
                <BarChart3 size={12} />
                <span>Sentiment</span>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp size={12} />
                <span>Predictions</span>
              </div>
            </div>
          </div>
        </div>

        {scrapingError && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 flex items-center gap-2 text-red-400 font-inter text-sm bg-red-900/20 p-4 rounded-lg border border-red-800"
          >
            <AlertCircle size={16} />
            {scrapingError}
          </motion.div>
        )}

        {isAnalyzing && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 flex items-center gap-2 text-[#1500FF] font-inter text-sm bg-[#1500FF]/10 p-4 rounded-lg border border-[#1500FF]/20"
          >
            <Loader size={16} className="animate-spin" />
            <div>
              <div className="font-medium">Processando com Apify...</div>
              <div className="text-xs text-gray-400 mt-1">
                Coletando dados de múltiplas fontes • Analisando sentimentos • Gerando insights
              </div>
            </div>
          </motion.div>
        )}
      </motion.form>

      {/* Trend Data Preview */}
      {trendData.length > 0 && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-[#111111] rounded-xl p-6 border border-gray-800"
        >
          <h3 className="text-white font-inter font-semibold text-lg mb-4">
            📊 Análise de Tendências
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {trendData.slice(0, 3).map((trend, index) => (
              <div key={trend.keyword} className="bg-gray-900/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-white font-inter font-medium text-sm">
                    {trend.keyword}
                  </h4>
                  <div className="text-[#1500FF] font-inter font-bold text-lg">
                    {trend.score.toFixed(1)}
                  </div>
                </div>
                
                <div className="space-y-2 text-xs font-inter">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Volume:</span>
                    <span className="text-white">{trend.volume}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Crescimento:</span>
                    <span className={trend.growth > 0 ? 'text-green-400' : 'text-red-400'}>
                      {trend.growth > 0 ? '+' : ''}{trend.growth.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Sentimento:</span>
                    <span className="text-yellow-400">
                      {(trend.sentiment * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <span className="text-gray-400 font-inter text-sm">
              Total: {articles.length} artigos de {trendData.length} tendências analisadas
            </span>
          </div>
        </motion.div>
      )}

      {/* Results */}
      {articles.length > 0 && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <ArticleTable />
        </motion.div>
      )}

      {/* Empty State */}
      {!isAnalyzing && articles.length === 0 && !scrapingError && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <div className="relative inline-block">
            <BarChart3 size={64} className="text-gray-600 mx-auto mb-6" />
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#1500FF] rounded-full flex items-center justify-center">
              <Zap size={12} className="text-white" />
            </div>
          </div>
          <h3 className="text-white font-inter font-semibold text-xl mb-3">
            Scraping Profissional com Apify
          </h3>
          <p className="text-gray-400 font-inter text-lg mb-6">
            Análise avançada de tendências com IA
          </p>
          <div className="text-gray-500 font-inter text-sm space-y-1">
            <p>🔍 Scraping de múltiplas fontes em tempo real</p>
            <p>🧠 Análise de sentimentos com IA</p>
            <p>📈 Predições e insights automáticos</p>
            <p>⚡ Dados de Google, Twitter, Reddit, News e mais</p>
          </div>
        </motion.div>
      )}
    </div>
  );
};