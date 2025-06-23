import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Calendar, Tag, Check } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const ArticleTable: React.FC = () => {
  const { articles, selectedArticles, toggleArticleSelection, clearSelectedArticles } = useAppStore();

  const isSelected = (articleId: string) => 
    selectedArticles.some(a => a.id === articleId);

  return (
    <div className="bg-[#111111] rounded-xl border border-gray-800 overflow-hidden">
      <div className="p-6 border-b border-gray-800 flex items-center justify-between">
        <div>
          <h3 className="text-white font-inter font-semibold text-lg">
            Artigos Encontrados
          </h3>
          <p className="text-gray-400 font-inter text-sm">
            {articles.length} artigos • {selectedArticles.length} selecionados
          </p>
        </div>

        {selectedArticles.length > 0 && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={clearSelectedArticles}
            className="text-gray-400 hover:text-white font-inter text-sm transition-colors"
          >
            Limpar seleção
          </motion.button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-900">
            <tr>
              <th className="text-left py-3 px-6 text-gray-400 font-inter font-medium text-sm">Seleção</th>
              <th className="text-left py-3 px-6 text-gray-400 font-inter font-medium text-sm">Artigo</th>
              <th className="text-left py-3 px-6 text-gray-400 font-inter font-medium text-sm">Fonte</th>
              <th className="text-left py-3 px-6 text-gray-400 font-inter font-medium text-sm">Data</th>
              <th className="text-left py-3 px-6 text-gray-400 font-inter font-medium text-sm">Ações</th>
            </tr>
          </thead>
          <tbody>
            {articles.map((article, index) => (
              <motion.tr
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="border-b border-gray-800 hover:bg-gray-900/50 transition-colors"
              >
                <td className="py-4 px-6">
                  <motion.button
                    onClick={() => toggleArticleSelection(article)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                      isSelected(article.id)
                        ? 'bg-[#1500FF] border-[#1500FF]'
                        : 'border-gray-600 hover:border-gray-500'
                    }`}
                  >
                    {isSelected(article.id) && (
                      <Check size={12} className="text-white" />
                    )}
                  </motion.button>
                </td>

                <td className="py-4 px-6">
                  <div className="flex items-start gap-3">
                    <img
                      src={article.imageUrl}
                      alt={article.title}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-inter font-medium text-sm truncate">
                        {article.title}
                      </h4>
                      <p className="text-gray-400 font-inter text-xs mt-1 line-clamp-2">
                        {article.description}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {article.keywords.slice(0, 3).map((keyword) => (
                          <span
                            key={keyword}
                            className="inline-flex items-center gap-1 bg-gray-800 text-gray-300 px-2 py-1 rounded text-xs font-inter"
                          >
                            <Tag size={10} />
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </td>

                <td className="py-4 px-6">
                  <span className="text-gray-300 font-inter text-sm">
                    {article.source}
                  </span>
                </td>

                <td className="py-4 px-6">
                  <div className="flex items-center gap-1 text-gray-400 font-inter text-sm">
                    <Calendar size={14} />
                    {format(new Date(article.publishDate), 'dd/MM/yyyy', { locale: ptBR })}
                  </div>
                </td>

                <td className="py-4 px-6">
                  <motion.a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex items-center gap-1 text-[#1500FF] hover:text-blue-400 font-inter text-sm transition-colors"
                  >
                    <ExternalLink size={14} />
                    Abrir
                  </motion.a>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};