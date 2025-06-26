// src/components/Scraping/ArticleTable.tsx

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Calendar, Tag, Check, FileText, Eye, EyeOff, TrendingUp, Users, Clock, Sparkles, Brain, Target, Palette, MessageSquare } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { useIAGeneratorStore } from '../../store/iaGeneratorStore';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const ArticleTable: React.FC = () => {
  const { articles, selectedArticles, toggleArticleSelection, clearSelectedArticles } = useAppStore();
  const { setSelectedArticle } = useIAGeneratorStore();
  const [expandedArticle, setExpandedArticle] = useState<string | null>(null);
  const [showFullContent, setShowFullContent] = useState<{ [key: string]: boolean }>({});

  // Funções utilitárias para datas seguras
  function formatPublishDate(dateString?: string) {
    if (!dateString) return "Data indisponível";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Data indisponível";
    return format(date, 'dd/MM/yyyy', { locale: ptBR });
  }

  function formatPublishTime(dateString?: string) {
    if (!dateString) return "--:--";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "--:--";
    return format(date, 'HH:mm', { locale: ptBR });
  }

  const isSelected = (articleId: string) => 
    selectedArticles.some(a => a.id === articleId);

  const toggleFullContent = (articleId: string) => {
    setShowFullContent(prev => ({
      ...prev,
      [articleId]: !prev[articleId]
    }));
  };

  const toggleExpanded = (articleId: string) => {
    setExpandedArticle(expandedArticle === articleId ? null : articleId);
  };

  const getSentimentColor = (sentiment?: number) => {
    if (!sentiment) return 'text-gray-400';
    if (sentiment >= 0.7) return 'text-green-400';
    if (sentiment >= 0.5) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getSentimentLabel = (sentiment?: number) => {
    if (!sentiment) return 'N/A';
    if (sentiment >= 0.7) return 'Positivo';
    if (sentiment >= 0.5) return 'Neutro';
    return 'Negativo';
  };

  const getEngagementLevel = (engagement?: number) => {
    if (!engagement) return { level: 'Baixo', color: 'text-gray-400' };
    if (engagement >= 100) return { level: 'Alto', color: 'text-green-400' };
    if (engagement >= 50) return { level: 'Médio', color: 'text-yellow-400' };
    return { level: 'Baixo', color: 'text-red-400' };
  };

  const getViralScoreColor = (score?: number) => {
    if (!score) return 'text-gray-400';
    if (score >= 7) return 'text-green-400';
    if (score >= 5) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getViralScoreLabel = (score?: number) => {
    if (!score) return 'N/A';
    if (score >= 7) return 'Alto';
    if (score >= 5) return 'Médio';
    return 'Baixo';
  };

  const handleUseInCarousel = (article: any) => {
    // Converter para o formato esperado pelo IA Generator
    const selectedArticleData = {
      title: article.title,
      text: article.fullContent || article.description,
      images: article.images || [],
      videos: article.videos || [],
      url: article.url,
      extractedAt: article.publishDate
    };

    setSelectedArticle(selectedArticleData);
    // Opcional: mostrar feedback visual
    console.log('Artigo enviado para o IA Generator:', selectedArticleData);
  };

  // Verificar se temos artigos válidos
  if (!articles || articles.length === 0) {
    return (
      <div className="bg-[#111111] rounded-xl border border-gray-800 p-8 text-center">
        <FileText size={48} className="text-gray-600 mx-auto mb-4" />
        <h3 className="text-white font-inter font-medium text-lg mb-2">
          Nenhum artigo encontrado
        </h3>
        <p className="text-gray-400 font-inter">
          Execute uma busca para ver os artigos aqui
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#111111] rounded-xl border border-gray-800 overflow-hidden">
      <div className="p-6 border-b border-gray-800 flex items-center justify-between">
        <div>
          <h3 className="text-white font-inter font-semibold text-lg">
            Artigos Encontrados com Análise Avançada + IA Viral
          </h3>
          <p className="text-gray-400 font-inter text-sm">
            {articles.length} artigos • {selectedArticles.length} selecionados • Conteúdo completo + Score viral disponível
          </p>
        </div>

        <div className="flex items-center gap-3">
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
          
          <div className="text-gray-500 font-inter text-xs">
            📊 Análise temporal • 🧠 Sentimentos • 📄 Conteúdo completo • ✨ Score viral IA
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-900">
            <tr>
              <th className="text-left py-3 px-6 text-gray-400 font-inter font-medium text-sm">Seleção</th>
              <th className="text-left py-3 px-6 text-gray-400 font-inter font-medium text-sm">Artigo</th>
              <th className="text-left py-3 px-6 text-gray-400 font-inter font-medium text-sm">Fonte</th>
              <th className="text-left py-3 px-6 text-gray-400 font-inter font-medium text-sm">Métricas</th>
              <th className="text-left py-3 px-6 text-gray-400 font-inter font-medium text-sm">Score Viral IA</th>
              <th className="text-left py-3 px-6 text-gray-400 font-inter font-medium text-sm">Data</th>
              <th className="text-left py-3 px-6 text-gray-400 font-inter font-medium text-sm">Ações</th>
            </tr>
          </thead>
          <tbody>
            {articles.map((article, index) => (
              <React.Fragment key={article.id}>
                <motion.tr
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
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
                        className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://images.pexels.com/photos/3184431/pexels-photo-3184431.jpeg?w=400';
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white font-inter font-medium text-sm mb-1 line-clamp-2">
                          {article.title}
                        </h4>
                        <p className="text-gray-400 font-inter text-xs mb-2 line-clamp-2">
                          {article.description}
                        </p>
                        
                        {/* Keywords */}
                        <div className="flex flex-wrap gap-1 mb-2">
                          {(article.keywords || []).slice(0, 3).map((keyword) => (
                            <span
                              key={keyword}
                              className="inline-flex items-center gap-1 bg-gray-800 text-gray-300 px-2 py-1 rounded text-xs font-inter"
                            >
                              <Tag size={8} />
                              {keyword}
                            </span>
                          ))}
                        </div>

                        {/* Full Content Toggle */}
                        {(article as any).fullContent && (
                          <motion.button
                            onClick={() => toggleFullContent(article.id)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="flex items-center gap-1 text-[#1500FF] hover:text-blue-400 font-inter text-xs transition-colors"
                          >
                            <FileText size={12} />
                            {showFullContent[article.id] ? 'Ocultar conteúdo' : 'Ver conteúdo completo'}
                          </motion.button>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="py-4 px-6">
                    <div className="text-gray-300 font-inter text-sm font-medium">
                      {article.source}
                    </div>
                    <div className="text-gray-500 font-inter text-xs">
                      Fonte verificada
                    </div>
                  </td>

                  <td className="py-4 px-6">
                    <div className="space-y-2">
                      {/* Sentiment */}
                      {(article as any).sentiment !== undefined && (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400 font-inter text-xs">Sentimento:</span>
                          <span className={`font-inter text-xs font-medium ${getSentimentColor((article as any).sentiment)}`}>
                            {getSentimentLabel((article as any).sentiment)}
                          </span>
                        </div>
                      )}
                      
                      {/* Engagement */}
                      {(article as any).engagement !== undefined && (
                        <div className="flex items-center gap-2">
                          <Users size={12} className="text-gray-400" />
                          <span className="text-gray-400 font-inter text-xs">Engajamento:</span>
                          <span className={`font-inter text-xs font-medium ${getEngagementLevel((article as any).engagement).color}`}>
                            {(article as any).engagement} ({getEngagementLevel((article as any).engagement).level})
                          </span>
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Nova coluna: Score Viral IA */}
                  <td className="py-4 px-6">
                    <div className="space-y-2">
                      {(article as any).viralScore !== undefined ? (
                        <>
                          <div className="flex items-center gap-2">
                            <Sparkles size={12} className="text-orange-400" />
                            <span className="text-gray-400 font-inter text-xs">Score:</span>
                            <span className={`font-inter text-sm font-bold ${getViralScoreColor((article as any).viralScore)}`}>
                              {(article as any).viralScore.toFixed(1)}/10
                            </span>
                          </div>
                          
                          <div className="text-xs font-inter">
                            <span className="text-gray-400">Potencial: </span>
                            <span className={getViralScoreColor((article as any).viralScore)}>
                              {getViralScoreLabel((article as any).viralScore)}
                            </span>
                          </div>

                          {/* Breakdown dos scores */}
                          {(article as any).viralAnalysis && (
                            <div className="space-y-1">
                              <div className="flex items-center gap-1 text-xs">
                                <Brain size={8} className="text-purple-400" />
                                <span className="text-gray-500">Emoção: {((article as any).viralAnalysis.emotionScore || 0).toFixed(1)}</span>
                              </div>
                              <div className="flex items-center gap-1 text-xs">
                                <Target size={8} className="text-blue-400" />
                                <span className="text-gray-500">Clareza: {((article as any).viralAnalysis.clarityScore || 0).toFixed(1)}</span>
                              </div>
                              <div className="flex items-center gap-1 text-xs">
                                <Palette size={8} className="text-green-400" />
                                <span className="text-gray-500">Carrossel: {((article as any).viralAnalysis.carouselPotential || 0).toFixed(1)}</span>
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Sparkles size={12} className="text-gray-600" />
                          <span className="text-gray-500 font-inter text-xs">Calculando...</span>
                        </div>
                      )}
                    </div>
                  </td>

                  <td className="py-4 px-6">
                    <div className="flex items-center gap-1 text-gray-400 font-inter text-sm mb-1">
                      <Calendar size={14} />
                      {formatPublishDate(article.publishDate)}
                    </div>
                    <div className="flex items-center gap-1 text-gray-500 font-inter text-xs">
                      <Clock size={12} />
                      {formatPublishTime(article.publishDate)}
                    </div>
                  </td>

                  <td className="py-4 px-6">
                    <div className="flex flex-col gap-2">
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

                      {/* Botão para usar no IA Generator */}
                      <motion.button
                        onClick={() => handleUseInCarousel(article)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="inline-flex items-center gap-1 bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-xs font-inter font-medium transition-all duration-200"
                      >
                        <MessageSquare size={12} />
                        Usar no Carrossel
                      </motion.button>

                      {(article as any).fullContent && (
                        <motion.button
                          onClick={() => toggleExpanded(article.id)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="inline-flex items-center gap-1 text-gray-400 hover:text-white font-inter text-sm transition-colors"
                        >
                          {expandedArticle === article.id ? <EyeOff size={14} /> : <Eye size={14} />}
                          {expandedArticle === article.id ? 'Recolher' : 'Expandir'}
                        </motion.button>
                      )}
                    </div>
                  </td>
                </motion.tr>

                {/* Expanded Content Row */}
                <AnimatePresence>
                  {(expandedArticle === article.id || showFullContent[article.id]) && (article as any).fullContent && (
                    <motion.tr
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <td colSpan={7} className="px-6 pb-4">
                        <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                          <div className="flex items-center gap-2 mb-3">
                            <FileText size={16} className="text-[#1500FF]" />
                            <h5 className="text-white font-inter font-semibold text-sm">
                              Conteúdo Completo do Artigo
                            </h5>
                          </div>
                          
                          <div className="text-gray-300 font-inter text-sm leading-relaxed whitespace-pre-wrap mb-4">
                            {(article as any).fullContent}
                          </div>

                          {/* Viral Analysis Details */}
                          {(article as any).viralAnalysis && (
                            <div className="border-t border-gray-700 pt-4">
                              <div className="flex items-center gap-2 mb-3">
                                <Sparkles size={16} className="text-orange-400" />
                                <h6 className="text-orange-400 font-inter font-semibold text-sm">
                                  Análise Detalhada de Potencial Viral (IA)
                                </h6>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
                                <div className="bg-gray-800/50 rounded-lg p-3">
                                  <div className="text-gray-400 font-inter text-xs mb-1">Emoção Evocada</div>
                                  <div className={`font-inter text-sm font-semibold ${getViralScoreColor((article as any).viralAnalysis.emotionScore)}`}>
                                    {((article as any).viralAnalysis.emotionScore || 0).toFixed(1)}/10
                                  </div>
                                </div>
                                
                                <div className="bg-gray-800/50 rounded-lg p-3">
                                  <div className="text-gray-400 font-inter text-xs mb-1">Clareza do Título</div>
                                  <div className={`font-inter text-sm font-semibold ${getViralScoreColor((article as any).viralAnalysis.clarityScore)}`}>
                                    {((article as any).viralAnalysis.clarityScore || 0).toFixed(1)}/10
                                  </div>
                                </div>
                                
                                <div className="bg-gray-800/50 rounded-lg p-3">
                                  <div className="text-gray-400 font-inter text-xs mb-1">Potencial Carrossel</div>
                                  <div className={`font-inter text-sm font-semibold ${getViralScoreColor((article as any).viralAnalysis.carouselPotential)}`}>
                                    {((article as any).viralAnalysis.carouselPotential || 0).toFixed(1)}/10
                                  </div>
                                </div>
                                
                                <div className="bg-gray-800/50 rounded-lg p-3">
                                  <div className="text-gray-400 font-inter text-xs mb-1">Tendência do Assunto</div>
                                  <div className={`font-inter text-sm font-semibold ${getViralScoreColor((article as any).viralAnalysis.trendScore)}`}>
                                    {((article as any).viralAnalysis.trendScore || 0).toFixed(1)}/10
                                  </div>
                                </div>
                                
                                <div className="bg-gray-800/50 rounded-lg p-3">
                                  <div className="text-gray-400 font-inter text-xs mb-1">Autoridade da Fonte</div>
                                  <div className={`font-inter text-sm font-semibold ${getViralScoreColor((article as any).viralAnalysis.authorityScore)}`}>
                                    {((article as any).viralAnalysis.authorityScore || 0).toFixed(1)}/10
                                  </div>
                                </div>
                              </div>

                              {/* IA Insights */}
                              {(article as any).viralAnalysis.analysis && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <div>
                                    <h6 className="text-green-400 font-inter font-medium text-xs mb-2">✅ Pontos Fortes</h6>
                                    <ul className="text-gray-300 font-inter text-xs space-y-1">
                                      {((article as any).viralAnalysis.analysis.strengths || []).map((strength: string, idx: number) => (
                                        <li key={idx}>• {strength}</li>
                                      ))}
                                    </ul>
                                  </div>
                                  
                                  <div>
                                    <h6 className="text-red-400 font-inter font-medium text-xs mb-2">⚠️ Pontos Fracos</h6>
                                    <ul className="text-gray-300 font-inter text-xs space-y-1">
                                      {((article as any).viralAnalysis.analysis.weaknesses || []).map((weakness: string, idx: number) => (
                                        <li key={idx}>• {weakness}</li>
                                      ))}
                                    </ul>
                                  </div>
                                  
                                  <div>
                                    <h6 className="text-blue-400 font-inter font-medium text-xs mb-2">💡 Recomendações</h6>
                                    <ul className="text-gray-300 font-inter text-xs space-y-1">
                                      {((article as any).viralAnalysis.analysis.recommendations || []).map((rec: string, idx: number) => (
                                        <li key={idx}>• {rec}</li>
                                      ))}
                                    </ul>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Additional Metrics */}
                          <div className="mt-4 pt-4 border-t border-gray-700 grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-gray-800/50 rounded-lg p-3">
                              <div className="text-gray-400 font-inter text-xs mb-1">Análise de Sentimento</div>
                              <div className={`font-inter text-sm font-semibold ${getSentimentColor((article as any).sentiment)}`}>
                                {getSentimentLabel((article as any).sentiment)} ({(((article as any).sentiment || 0) * 100).toFixed(0)}%)
                              </div>
                            </div>
                            
                            <div className="bg-gray-800/50 rounded-lg p-3">
                              <div className="text-gray-400 font-inter text-xs mb-1">Nível de Engajamento</div>
                              <div className={`font-inter text-sm font-semibold ${getEngagementLevel((article as any).engagement).color}`}>
                                {getEngagementLevel((article as any).engagement).level} ({(article as any).engagement || 0})
                              </div>
                            </div>
                            
                            <div className="bg-gray-800/50 rounded-lg p-3">
                              <div className="text-gray-400 font-inter text-xs mb-1">Palavras-chave</div>
                              <div className="text-white font-inter text-sm">
                                {(article.keywords || []).length} identificadas
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </motion.tr>
                  )}
                </AnimatePresence>
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary Footer */}
      {articles.length > 0 && (
        <div className="p-4 bg-gray-900/30 border-t border-gray-800">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            <div>
              <div className="text-[#1500FF] font-inter font-bold text-lg">
                {articles.length}
              </div>
              <div className="text-gray-400 font-inter text-xs">
                Total de Artigos
              </div>
            </div>
            
            <div>
              <div className="text-green-400 font-inter font-bold text-lg">
                {articles.filter(a => (a as any).fullContent).length}
              </div>
              <div className="text-gray-400 font-inter text-xs">
                Com Conteúdo Completo
              </div>
            </div>
            
            <div>
              <div className="text-yellow-400 font-inter font-bold text-lg">
                {articles.filter(a => (a as any).sentiment && (a as any).sentiment > 0.6).length}
              </div>
              <div className="text-gray-400 font-inter text-xs">
                Sentimento Positivo
              </div>
            </div>
            
            <div>
              <div className="text-orange-400 font-inter font-bold text-lg">
                {articles.filter(a => (a as any).viralScore && (a as any).viralScore >= 7).length}
              </div>
              <div className="text-gray-400 font-inter text-xs">
                Alto Potencial Viral
              </div>
            </div>
            
            <div>
              <div className="text-purple-400 font-inter font-bold text-lg">
                {selectedArticles.length}
              </div>
              <div className="text-gray-400 font-inter text-xs">
                Selecionados
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
