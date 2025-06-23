import React from 'react';
import { motion } from 'framer-motion';
import { Search, Loader, AlertCircle, TrendingUp, Globe, Zap } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { ArticleTable } from './ArticleTable';

export const ScrapingPanel: React.FC = () => {
  const {
    searchKeyword,
    setSearchKeyword,
    startScraping,
    isScrapingLoading,
    scrapingError,
    articles
  } = useAppStore();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    startScraping();
  };

  const popularKeywords = [
    'AI', 'Machine Learning', 'Blockchain', 'Web3', 'React', 'TypeScript',
    'Design System', 'UX/UI', 'Figma', 'No-code', 'SaaS', 'Startup'
  ];

  const handleKeywordClick = (keyword: string) => {
    setSearchKeyword(keyword);
  };

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <motion.form
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        onSubmit={handleSearch}
        className="bg-[#111111] rounded-xl p-6 border border-gray-800"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-[#1500FF]/20 rounded-lg">
            <TrendingUp size={20} className="text-[#1500FF]" />
          </div>
          <div>
            <h3 className="text-white font-inter font-semibold text-lg">
              Descobrir Tendências
            </h3>
            <p className="text-gray-400 font-inter text-sm">
              Busque as últimas tendências de múltiplas fontes da web
            </p>
          </div>
        </div>
        
        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="Digite uma palavra-chave (ex: AI, design, UX, startup...)"
              className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white font-inter placeholder-gray-500 focus:outline-none focus:border-[#1500FF] transition-colors"
              disabled={isScrapingLoading}
            />
          </div>
          
          <motion.button
            type="submit"
            disabled={isScrapingLoading || !searchKeyword.trim()}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-[#1500FF] text-white px-6 py-3 rounded-lg font-inter font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:bg-blue-600"
          >
            {isScrapingLoading ? (
              <>
                <Loader size={20} className="animate-spin" />
                Buscando...
              </>
            ) : (
              <>
                <Search size={20} />
                Buscar
              </>
            )}
          </motion.button>
        </div>

        {/* Popular Keywords */}
        <div className="mb-4">
          <p className="text-gray-400 font-inter text-sm mb-3">Palavras-chave populares:</p>
          <div className="flex flex-wrap gap-2">
            {popularKeywords.map((keyword) => (
              <motion.button
                key={keyword}
                type="button"
                onClick={() => handleKeywordClick(keyword)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={isScrapingLoading}
                className="bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white px-3 py-1 rounded-full font-inter text-sm transition-all duration-200 disabled:opacity-50"
              >
                {keyword}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Data Sources Info */}
        <div className="flex items-center gap-6 text-gray-500 font-inter text-xs">
          <div className="flex items-center gap-1">
            <Globe size={12} />
            <span>Hacker News</span>
          </div>
          <div className="flex items-center gap-1">
            <Globe size={12} />
            <span>Reddit</span>
          </div>
          <div className="flex items-center gap-1">
            <Globe size={12} />
            <span>Dev.to</span>
          </div>
          <div className="flex items-center gap-1">
            <Zap size={12} />
            <span>Product Hunt</span>
          </div>
        </div>

        {scrapingError && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 flex items-center gap-2 text-red-400 font-inter text-sm bg-red-900/20 p-3 rounded-lg border border-red-800"
          >
            <AlertCircle size={16} />
            {scrapingError}
          </motion.div>
        )}

        {isScrapingLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 flex items-center gap-2 text-[#1500FF] font-inter text-sm bg-[#1500FF]/10 p-3 rounded-lg border border-[#1500FF]/20"
          >
            <Loader size={16} className="animate-spin" />
            Coletando dados de múltiplas fontes...
          </motion.div>
        )}
      </motion.form>

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
      {!isScrapingLoading && articles.length === 0 && !scrapingError && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Search size={48} className="text-gray-600 mx-auto mb-4" />
          <h3 className="text-white font-inter font-medium text-lg mb-2">
            Descubra as Últimas Tendências
          </h3>
          <p className="text-gray-400 font-inter">
            Digite uma palavra-chave para encontrar artigos relevantes de várias fontes
          </p>
        </motion.div>
      )}
    </div>
  );
};