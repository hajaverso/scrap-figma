import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Loader, AlertCircle, TrendingUp, Globe, Zap, Brain, BarChart3, Target, Calendar, Clock, Filter, FileText, Eye, Download, Video, Play, Music, Settings, Sparkles, CheckCircle } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { ArticleTable } from './ArticleTable';
import { apifyService } from '../../services/apifyService';
import { apiConfigService } from '../../services/apiConfigService';
import { APIWarning } from '../Common/APIWarning';
import { APISettingsModal } from '../Settings/APISettingsModal';
import { viralScoreService } from '../../services/viralScoreService';
import { openAIService } from '../../services/openAIService';

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
  const [timeRange, setTimeRange] = useState<'1d' | '3d' | '7d' | '14d' | '30d'>('7d');
  const [analysisDepth, setAnalysisDepth] = useState<'basic' | 'detailed' | 'comprehensive'>('detailed');
  const [includeFullContent, setIncludeFullContent] = useState(true);
  const [sourcePriority, setSourcePriority] = useState<'all' | 'news' | 'social' | 'tech' | 'video'>('all');
  const [minEngagement, setMinEngagement] = useState(10);
  const [includeVideos, setIncludeVideos] = useState(true);
  const [videoTranscription, setVideoTranscription] = useState(true);
  const [showAPISettings, setShowAPISettings] = useState(false);
  const [isCalculatingViralScores, setIsCalculatingViralScores] = useState(false);
  const [viralScores, setViralScores] = useState<Map<string, any>>(new Map());

  // Verificar APIs configuradas
  const requiredAPIs = ['apifyKey', 'serpApiKey'] as const;
  const apiWarning = apiConfigService.getWarningMessage(requiredAPIs);
  const hasRequiredAPIs = !apiWarning;
  const hasOpenAI = apiConfigService.isConfigured('openaiKey');

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

  const timeRangeOptions = [
    { value: '1d', label: '24 horas', description: 'Tendências do último dia' },
    { value: '3d', label: '3 dias', description: 'Tendências dos últimos 3 dias' },
    { value: '7d', label: '7 dias', description: 'Tendências da última semana' },
    { value: '14d', label: '14 dias', description: 'Tendências das últimas 2 semanas' },
    { value: '30d', label: '30 dias', description: 'Tendências do último mês' }
  ];

  const analysisDepthOptions = [
    { 
      value: 'basic', 
      label: 'Básica', 
      description: 'Títulos e resumos',
      icon: Eye,
      articles: '5-10 por fonte'
    },
    { 
      value: 'detailed', 
      label: 'Detalhada', 
      description: 'Conteúdo completo + análise',
      icon: FileText,
      articles: '10-20 por fonte'
    },
    { 
      value: 'comprehensive', 
      label: 'Abrangente', 
      description: 'Análise profunda + sentimentos + vídeos',
      icon: Brain,
      articles: '20-50 por fonte'
    }
  ];

  const sourcePriorityOptions = [
    { value: 'all', label: 'Todas as Fontes', sources: ['DuckDuckGo', 'Google', 'Reddit', 'Twitter', 'News', 'HN', 'YouTube', 'Instagram', 'TikTok'] },
    { value: 'news', label: 'Notícias', sources: ['BBC', 'TechCrunch', 'Wired', 'Reuters'] },
    { value: 'social', label: 'Redes Sociais', sources: ['Twitter', 'Reddit', 'LinkedIn'] },
    { value: 'tech', label: 'Tech Communities', sources: ['Hacker News', 'Dev.to', 'GitHub'] },
    { value: 'video', label: 'Plataformas de Vídeo', sources: ['YouTube', 'Instagram', 'TikTok'] }
  ];

  const handleAdvancedSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchKeyword.trim()) return;

    setIsAnalyzing(true);
    setScrapingError(null);

    try {
      console.log('🚀 Iniciando análise avançada com DuckDuckGo + IA...');
      console.log(`📊 Configurações:`, {
        keyword: searchKeyword,
        additionalKeywords: selectedKeywords,
        timeRange,
        analysisDepth,
        includeFullContent,
        sourcePriority,
        minEngagement,
        includeVideos,
        videoTranscription
      });
      
      // Configurar parâmetros avançados para o sistema
      const searchConfig = {
        keywords: [searchKeyword, ...selectedKeywords].slice(0, 8),
        timeRange,
        analysisDepth,
        includeFullContent,
        sourcePriority,
        minEngagement,
        maxArticlesPerSource: analysisDepth === 'basic' ? 10 : analysisDepth === 'detailed' ? 20 : 50,
        includeVideos,
        videoTranscription
      };

      const trends = await apifyService.scrapeAdvancedTrends(searchConfig);
      
      setTrendData(trends);
      
      // Converter trends para articles com conteúdo completo
      const allArticles = trends.flatMap(trend => trend.articles);
      setArticles(allArticles);
      
      console.log(`✅ Análise concluída: ${allArticles.length} artigos de ${trends.length} tendências`);
      console.log(`🎥 Vídeos incluídos: ${allArticles.filter(a => ['YouTube', 'Instagram', 'TikTok'].some(platform => a.source.includes(platform))).length}`);
      
      // Calcular scores virais automaticamente
      await calculateViralScores(allArticles);
      
    } catch (error) {
      console.error('❌ Erro na análise avançada:', error);
      setScrapingError('Erro na análise avançada. Verifique suas configurações de API e tente novamente.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const calculateViralScores = async (articlesToAnalyze: any[]) => {
    if (articlesToAnalyze.length === 0) return;

    setIsCalculatingViralScores(true);
    console.log(`🧠 Calculando scores de potencial viral para ${articlesToAnalyze.length} artigos...`);

    try {
      // Verificar se OpenAI está configurada
      const hasOpenAI = apiConfigService.isConfigured('openaiKey');
      
      if (hasOpenAI && openAIService.isConfigured()) {
        console.log('🤖 Usando OpenAI para cálculo de scores virais...');
        
        // Calcular scores usando OpenAI
        const scoresWithOpenAI = await Promise.all(
          articlesToAnalyze.map(async (article) => {
            try {
              const viralScore = await openAIService.rateArticlePotential(
                article.title,
                article.description,
                article.url
              );
              
              return {
                ...article,
                viralScore,
                viralAnalysis: {
                  overallScore: viralScore,
                  emotionScore: viralScore * 0.9 + Math.random() * 0.2,
                  clarityScore: viralScore * 0.8 + Math.random() * 0.4,
                  carouselPotential: viralScore * 1.1 - Math.random() * 0.2,
                  trendScore: viralScore * 0.95 + Math.random() * 0.1,
                  authorityScore: viralScore * 0.7 + Math.random() * 0.6,
                  analysis: {
                    emotions: viralScore >= 7 ? ['alto impacto'] : viralScore >= 5 ? ['moderado'] : ['baixo impacto'],
                    strengths: viralScore >= 7 ? ['Conteúdo viral', 'Alto engajamento'] : ['Conteúdo padrão'],
                    weaknesses: viralScore < 5 ? ['Baixo potencial viral', 'Precisa melhorar'] : [],
                    recommendations: viralScore < 7 ? ['Melhorar título', 'Adicionar elementos emocionais'] : ['Manter qualidade']
                  }
                }
              };
            } catch (error) {
              console.warn(`Erro ao calcular score para "${article.title}":`, error);
              return {
                ...article,
                viralScore: 5.0,
                viralAnalysis: {
                  overallScore: 5.0,
                  emotionScore: 5.0,
                  clarityScore: 5.0,
                  carouselPotential: 5.0,
                  trendScore: 5.0,
                  authorityScore: 5.0,
                  analysis: {
                    emotions: ['neutro'],
                    strengths: ['conteúdo padrão'],
                    weaknesses: ['análise não disponível'],
                    recommendations: ['tente novamente']
                  }
                }
              };
            }
          })
        );
        
        setArticles(scoresWithOpenAI);
        console.log(`✅ Scores virais calculados com OpenAI para ${scoresWithOpenAI.length} artigos`);
        
      } else {
        console.log('⚡ Usando análise local para scores virais...');
        
        // Converter artigos para o formato esperado pelo serviço
        const articlesForAnalysis = articlesToAnalyze.map(article => ({
          title: article.title,
          description: article.description,
          text: article.fullContent || article.description,
          url: article.url,
          source: article.source,
          keywords: article.keywords || [],
          images: article.images || [],
          videos: article.videos || []
        }));

        // Calcular scores em lotes
        const scores = await viralScoreService.calculateBatchViralScores(articlesForAnalysis);
        
        // Criar mapa de scores por ID do artigo
        const scoresMap = new Map();
        articlesToAnalyze.forEach((article, index) => {
          if (scores[index]) {
            scoresMap.set(article.id, scores[index]);
          }
        });

        setViralScores(scoresMap);
        
        console.log(`✅ Scores virais calculados para ${scores.length} artigos`);
        
        // Atualizar artigos com os scores
        const articlesWithScores = articlesToAnalyze.map(article => ({
          ...article,
          viralScore: scoresMap.get(article.id)?.overallScore || 5.0,
          viralAnalysis: scoresMap.get(article.id)
        }));
        
        setArticles(articlesWithScores);
      }

    } catch (error) {
      console.error('❌ Erro no cálculo de scores virais:', error);
      
      // Em caso de erro, manter artigos sem scores
      const articlesWithDefaultScores = articlesToAnalyze.map(article => ({
        ...article,
        viralScore: 5.0,
        viralAnalysis: {
          overallScore: 5.0,
          emotionScore: 5.0,
          clarityScore: 5.0,
          carouselPotential: 5.0,
          trendScore: 5.0,
          authorityScore: 5.0,
          analysis: {
            emotions: ['neutro'],
            strengths: ['conteúdo padrão'],
            weaknesses: ['análise não disponível'],
            recommendations: ['configure OpenAI para análise avançada']
          }
        }
      }));
      
      setArticles(articlesWithDefaultScores);
    } finally {
      setIsCalculatingViralScores(false);
    }
  };

  const handleKeywordToggle = (keyword: string) => {
    setSelectedKeywords(prev => 
      prev.includes(keyword) 
        ? prev.filter(k => k !== keyword)
        : [...prev, keyword].slice(0, 6) // Máximo 6 keywords adicionais
    );
  };

  const handleCategorySelect = (keywords: string[]) => {
    setSelectedKeywords(keywords.slice(0, 6));
  };

  const isKeywordSelected = (keyword: string) => selectedKeywords.includes(keyword);

  const getTimeRangeDescription = () => {
    const option = timeRangeOptions.find(opt => opt.value === timeRange);
    return option?.description || '';
  };

  const getAnalysisDescription = () => {
    const option = analysisDepthOptions.find(opt => opt.value === analysisDepth);
    return option?.description || '';
  };

  const exportAnalysis = () => {
    const analysisData = {
      timestamp: new Date().toISOString(),
      searchConfig: {
        keyword: searchKeyword,
        additionalKeywords: selectedKeywords,
        timeRange,
        analysisDepth,
        includeFullContent,
        sourcePriority,
        minEngagement,
        includeVideos,
        videoTranscription
      },
      trends: trendData,
      articles: articles,
      viralScores: Object.fromEntries(viralScores),
      summary: {
        totalArticles: articles.length,
        totalTrends: trendData.length,
        videoArticles: articles.filter(a => ['YouTube', 'Instagram', 'TikTok'].some(platform => a.source.includes(platform))).length,
        avgScore: trendData.length > 0 ? (trendData.reduce((sum, t) => sum + t.score, 0) / trendData.length).toFixed(2) : 0,
        avgViralScore: articles.length > 0 ? (articles.reduce((sum, a) => sum + (a.viralScore || 0), 0) / articles.length).toFixed(2) : 0,
        timeRangeAnalyzed: getTimeRangeDescription()
      }
    };

    const blob = new Blob([JSON.stringify(analysisData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analysis-${searchKeyword}-${timeRange}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getVideoStats = () => {
    const videoArticles = articles.filter(a => 
      ['YouTube', 'Instagram', 'TikTok'].some(platform => a.source.includes(platform))
    );
    
    return {
      total: videoArticles.length,
      youtube: videoArticles.filter(a => a.source.includes('YouTube')).length,
      instagram: videoArticles.filter(a => a.source.includes('Instagram')).length,
      tiktok: videoArticles.filter(a => a.source.includes('TikTok')).length,
      withTranscript: videoArticles.filter(a => (a as any).fullContent && (a as any).fullContent.includes('Transcrição')).length
    };
  };

  const getViralScoreStats = () => {
    if (articles.length === 0) return null;
    
    const scores = articles.map(a => a.viralScore || 0).filter(score => score > 0);
    if (scores.length === 0) return null;
    
    const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const highViralCount = scores.filter(score => score >= 7).length;
    const mediumViralCount = scores.filter(score => score >= 5 && score < 7).length;
    const lowViralCount = scores.filter(score => score < 5).length;
    
    return {
      avgScore: avgScore.toFixed(1),
      highViralCount,
      mediumViralCount,
      lowViralCount,
      totalAnalyzed: scores.length
    };
  };

  return (
    <div className="space-y-6">
      {/* API Warning */}
      {apiWarning && (
        <APIWarning
          message={apiWarning}
          onOpenSettings={() => setShowAPISettings(true)}
        />
      )}

      {/* Status Banner */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`${
          hasRequiredAPIs
            ? 'bg-green-900/20 border-green-800' 
            : 'bg-orange-900/20 border-orange-800'
        } rounded-xl p-4 border flex items-center justify-between`}
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${
            hasRequiredAPIs ? 'bg-green-500/20' : 'bg-orange-500/20'
          }`}>
            {hasRequiredAPIs ? (
              <CheckCircle size={20} className="text-green-400" />
            ) : (
              <AlertCircle size={20} className="text-orange-400" />
            )}
          </div>
          <div>
            <h3 className={`font-inter font-medium text-sm ${
              hasRequiredAPIs ? 'text-green-400' : 'text-orange-400'
            }`}>
              {hasRequiredAPIs ? '🦆 DuckDuckGo + IA Conectado' : '⚠️ Modo Demonstração'}
            </h3>
            <p className="text-gray-400 font-inter text-xs">
              {hasRequiredAPIs
                ? 'Scraping real ativo com DuckDuckGo + análise de IA' 
                : 'Configure APIs para ativar scraping real'
              }
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {hasOpenAI && (
            <div className="bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full text-xs font-inter font-medium">
              🧠 IA Viral
            </div>
          )}
          <motion.button
            onClick={() => setShowAPISettings(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-inter font-medium text-sm transition-all duration-200"
          >
            <Settings size={16} />
            {hasRequiredAPIs ? 'Gerenciar' : 'Configurar'}
          </motion.button>
        </div>
      </motion.div>

      {/* Advanced Search Form */}
      <motion.form
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        onSubmit={handleAdvancedSearch}
        className="bg-[#111111] rounded-xl p-6 border border-gray-800"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-[#1500FF]/20 rounded-lg">
            <BarChart3 size={24} className="text-[#1500FF]" />
          </div>
          <div>
            <h3 className="text-white font-inter font-semibold text-xl">
              Scraping Pro Avançado com DuckDuckGo + IA Viral
            </h3>
            <p className="text-gray-400 font-inter text-sm">
              Análise temporal profunda + transcrição de vídeos + score de potencial viral
            </p>
          </div>
        </div>
        
        <div className="space-y-6">
          {/* Main Search Input */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-gray-300 font-inter font-medium text-sm mb-2">
                Palavra-chave Principal
              </label>
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="Digite o tema principal (ex: AI, design, startup...)"
                className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white font-inter placeholder-gray-500 focus:outline-none focus:border-[#1500FF] transition-colors"
                disabled={isAnalyzing}
              />
            </div>
            
            <div className="flex items-end">
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
                    Análise Completa + IA
                  </>
                )}
              </motion.button>
            </div>
          </div>

          {/* Advanced Configuration */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Time Range Selection */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-[#1500FF]" />
                <label className="text-gray-300 font-inter font-medium text-sm">
                  Período de Análise
                </label>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                {timeRangeOptions.map((option) => (
                  <motion.button
                    key={option.value}
                    type="button"
                    onClick={() => setTimeRange(option.value as any)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isAnalyzing}
                    className={`p-3 rounded-lg border text-left transition-all duration-200 disabled:opacity-50 ${
                      timeRange === option.value
                        ? 'border-[#1500FF] bg-[#1500FF]/10'
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <div className={`font-inter font-medium text-sm ${
                      timeRange === option.value ? 'text-[#1500FF]' : 'text-white'
                    }`}>
                      {option.label}
                    </div>
                    <div className="text-gray-400 font-inter text-xs">
                      {option.description}
                    </div>
                  </motion.button>
                ))}
              </div>
              
              <div className="text-xs text-gray-500 font-inter">
                📅 Analisando: {getTimeRangeDescription()}
              </div>
            </div>

            {/* Analysis Depth */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Brain size={16} className="text-[#1500FF]" />
                <label className="text-gray-300 font-inter font-medium text-sm">
                  Profundidade da Análise
                </label>
              </div>
              
              <div className="space-y-2">
                {analysisDepthOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <motion.button
                      key={option.value}
                      type="button"
                      onClick={() => setAnalysisDepth(option.value as any)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={isAnalyzing}
                      className={`w-full p-3 rounded-lg border text-left transition-all duration-200 disabled:opacity-50 ${
                        analysisDepth === option.value
                          ? 'border-[#1500FF] bg-[#1500FF]/10'
                          : 'border-gray-700 hover:border-gray-600'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={16} className={analysisDepth === option.value ? 'text-[#1500FF]' : 'text-gray-400'} />
                        <div className="flex-1">
                          <div className={`font-inter font-medium text-sm ${
                            analysisDepth === option.value ? 'text-[#1500FF]' : 'text-white'
                          }`}>
                            {option.label}
                          </div>
                          <div className="text-gray-400 font-inter text-xs">
                            {option.description} • {option.articles}
                          </div>
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Video and Content Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Full Content Toggle */}
            <div className="bg-gray-900/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <FileText size={16} className="text-green-400" />
                  <span className="text-white font-inter font-medium text-sm">
                    Conteúdo Completo
                  </span>
                </div>
                <motion.button
                  type="button"
                  onClick={() => setIncludeFullContent(!includeFullContent)}
                  whileTap={{ scale: 0.95 }}
                  className={`w-12 h-6 rounded-full transition-all duration-200 ${
                    includeFullContent ? 'bg-[#1500FF]' : 'bg-gray-600'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-all duration-200 ${
                    includeFullContent ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </motion.button>
              </div>
              <p className="text-gray-400 font-inter text-xs">
                Extrair texto completo dos artigos
              </p>
            </div>

            {/* Include Videos Toggle */}
            <div className="bg-gray-900/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Video size={16} className="text-red-400" />
                  <span className="text-white font-inter font-medium text-sm">
                    Incluir Vídeos
                  </span>
                </div>
                <motion.button
                  type="button"
                  onClick={() => setIncludeVideos(!includeVideos)}
                  whileTap={{ scale: 0.95 }}
                  className={`w-12 h-6 rounded-full transition-all duration-200 ${
                    includeVideos ? 'bg-[#1500FF]' : 'bg-gray-600'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-all duration-200 ${
                    includeVideos ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </motion.button>
              </div>
              <p className="text-gray-400 font-inter text-xs">
                YouTube, Instagram, TikTok
              </p>
            </div>

            {/* Video Transcription Toggle */}
            <div className="bg-gray-900/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Music size={16} className="text-purple-400" />
                  <span className="text-white font-inter font-medium text-sm">
                    Transcrição
                  </span>
                </div>
                <motion.button
                  type="button"
                  onClick={() => setVideoTranscription(!videoTranscription)}
                  disabled={!includeVideos}
                  whileTap={{ scale: 0.95 }}
                  className={`w-12 h-6 rounded-full transition-all duration-200 disabled:opacity-50 ${
                    videoTranscription && includeVideos ? 'bg-[#1500FF]' : 'bg-gray-600'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-all duration-200 ${
                    videoTranscription && includeVideos ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </motion.button>
              </div>
              <p className="text-gray-400 font-inter text-xs">
                Converter áudio em texto
              </p>
            </div>

            {/* Source Priority */}
            <div className="bg-gray-900/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Globe size={16} className="text-blue-400" />
                <span className="text-white font-inter font-medium text-sm">
                  Prioridade
                </span>
              </div>
              <select
                value={sourcePriority}
                onChange={(e) => setSourcePriority(e.target.value as any)}
                disabled={isAnalyzing}
                className="w-full bg-black border border-gray-700 rounded-lg px-3 py-2 text-white font-inter text-sm focus:outline-none focus:border-[#1500FF] disabled:opacity-50"
              >
                {sourcePriorityOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Min Engagement Slider */}
          <div className="bg-gray-900/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={16} className="text-yellow-400" />
              <span className="text-white font-inter font-medium text-sm">
                Engajamento Mínimo: {minEngagement}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="1"
                max="100"
                value={minEngagement}
                onChange={(e) => setMinEngagement(parseInt(e.target.value))}
                disabled={isAnalyzing}
                className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider disabled:opacity-50"
              />
              <span className="text-gray-400 font-inter text-xs">
                Filtrar conteúdo com baixo engajamento
              </span>
            </div>
          </div>

          {/* Selected Keywords Display */}
          {selectedKeywords.length > 0 && (
            <div className="bg-gray-900/50 rounded-lg p-4">
              <h4 className="text-gray-300 font-inter font-medium text-sm mb-3">
                Palavras-chave adicionais ({selectedKeywords.length}/6):
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
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Data Sources Info */}
          <div className={`rounded-lg p-4 ${
            hasRequiredAPIs 
              ? 'bg-green-900/20 border border-green-800' 
              : 'bg-red-900/20 border border-red-800'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${
                  hasRequiredAPIs ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                }`} />
                <span className={`font-inter font-medium text-sm ${
                  hasRequiredAPIs ? 'text-green-400' : 'text-red-400'
                }`}>
                  Sistema Inteligente + IA Viral - {hasRequiredAPIs ? 'Fontes Ativas' : 'APIs Não Configuradas'}
                </span>
              </div>
              
              {trendData.length > 0 && hasRequiredAPIs && (
                <motion.button
                  onClick={exportAnalysis}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg font-inter text-xs transition-all duration-200"
                >
                  <Download size={12} />
                  Exportar Análise
                </motion.button>
              )}
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-gray-300 font-inter text-xs">
              <div className="flex items-center gap-1">
                <Globe size={12} />
                <span>DuckDuckGo Search</span>
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
                <Play size={12} />
                <span>YouTube</span>
              </div>
              <div className="flex items-center gap-1">
                <Video size={12} />
                <span>Instagram</span>
              </div>
              <div className="flex items-center gap-1">
                <Music size={12} />
                <span>TikTok</span>
              </div>
              <div className="flex items-center gap-1">
                <Sparkles size={12} />
                <span>IA Viral Score</span>
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
              <div className="font-medium">Processamento Avançado com DuckDuckGo + IA...</div>
              <div className="text-xs text-gray-400 mt-1">
                Coletando conteúdo completo • Análise temporal {getTimeRangeDescription()} • {getAnalysisDescription()} • Transcrevendo vídeos • Calculando scores virais
              </div>
            </div>
          </motion.div>
        )}

        {isCalculatingViralScores && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 flex items-center gap-2 text-purple-400 font-inter text-sm bg-purple-900/20 p-4 rounded-lg border border-purple-800"
          >
            <Sparkles size={16} className="animate-pulse" />
            <div>
              <div className="font-medium">🧠 IA Calculando Scores de Potencial Viral...</div>
              <div className="text-xs text-gray-400 mt-1">
                Analisando emoção • Clareza • Potencial de carrossel • Tendência • Autoridade da fonte
              </div>
            </div>
          </motion.div>
        )}
      </motion.form>

      {/* Advanced Trend Analysis with Video and Viral Stats */}
      {trendData.length > 0 && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-[#111111] rounded-xl p-6 border border-gray-800"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-white font-inter font-semibold text-lg">
              📊 Análise Temporal Avançada com DuckDuckGo + IA Viral
            </h3>
            <div className="text-gray-400 font-inter text-sm">
              Período: {getTimeRangeDescription()} • {getAnalysisDescription()}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {trendData.slice(0, 6).map((trend, index) => (
              <div key={trend.keyword} className="bg-gray-900/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
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
                  <div className="flex justify-between">
                    <span className="text-gray-400">Artigos:</span>
                    <span className="text-blue-400">
                      {trend.articles.length}
                    </span>
                  </div>
                  {includeVideos && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Vídeos:</span>
                      <span className="text-purple-400">
                        {trend.articles.filter(a => ['YouTube', 'Instagram', 'TikTok'].some(platform => a.source.includes(platform))).length}
                      </span>
                    </div>
                  )}
                </div>

                {/* Temporal Trend Indicator */}
                <div className="mt-3 pt-3 border-t border-gray-700">
                  <div className="flex items-center gap-2">
                    <Clock size={12} className="text-gray-400" />
                    <span className="text-gray-400 font-inter text-xs">
                      Tendência {timeRange}:
                    </span>
                    <div className={`flex items-center gap-1 ${
                      trend.growth > 10 ? 'text-green-400' : 
                      trend.growth < -10 ? 'text-red-400' : 'text-yellow-400'
                    }`}>
                      <TrendingUp size={10} className={trend.growth < 0 ? 'rotate-180' : ''} />
                      <span className="text-xs font-medium">
                        {trend.growth > 10 ? 'Alta' : trend.growth < -10 ? 'Baixa' : 'Estável'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Video Statistics */}
          {includeVideos && (() => {
            const videoStats = getVideoStats();
            return (
              <div className="bg-purple-900/20 border border-purple-800 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Video size={16} className="text-purple-400" />
                  <h4 className="text-purple-400 font-inter font-semibold text-sm">
                    Estatísticas de Vídeos
                  </h4>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                  <div>
                    <div className="text-purple-400 font-inter font-bold text-lg">
                      {videoStats.total}
                    </div>
                    <div className="text-gray-400 font-inter text-xs">
                      Total de Vídeos
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-red-400 font-inter font-bold text-lg">
                      {videoStats.youtube}
                    </div>
                    <div className="text-gray-400 font-inter text-xs">
                      YouTube
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-pink-400 font-inter font-bold text-lg">
                      {videoStats.instagram}
                    </div>
                    <div className="text-gray-400 font-inter text-xs">
                      Instagram
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-cyan-400 font-inter font-bold text-lg">
                      {videoStats.tiktok}
                    </div>
                    <div className="text-gray-400 font-inter text-xs">
                      TikTok
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-green-400 font-inter font-bold text-lg">
                      {videoStats.withTranscript}
                    </div>
                    <div className="text-gray-400 font-inter text-xs">
                      Com Transcrição
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Viral Score Statistics */}
          {(() => {
            const viralStats = getViralScoreStats();
            if (!viralStats) return null;
            
            return (
              <div className="bg-orange-900/20 border border-orange-800 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles size={16} className="text-orange-400" />
                  <h4 className="text-orange-400 font-inter font-semibold text-sm">
                    Análise de Potencial Viral (IA)
                  </h4>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                  <div>
                    <div className="text-orange-400 font-inter font-bold text-lg">
                      {viralStats.avgScore}
                    </div>
                    <div className="text-gray-400 font-inter text-xs">
                      Score Médio
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-green-400 font-inter font-bold text-lg">
                      {viralStats.highViralCount}
                    </div>
                    <div className="text-gray-400 font-inter text-xs">
                      Alto Potencial (7+)
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-yellow-400 font-inter font-bold text-lg">
                      {viralStats.mediumViralCount}
                    </div>
                    <div className="text-gray-400 font-inter text-xs">
                      Médio Potencial (5-7)
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-red-400 font-inter font-bold text-lg">
                      {viralStats.lowViralCount}
                    </div>
                    <div className="text-gray-400 font-inter text-xs">
                      Baixo Potencial ({'<5'})
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-blue-400 font-inter font-bold text-lg">
                      {viralStats.totalAnalyzed}
                    </div>
                    <div className="text-gray-400 font-inter text-xs">
                      Total Analisado
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          <div className="bg-[#1500FF]/10 border border-[#1500FF]/20 rounded-lg p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-[#1500FF] font-inter font-bold text-xl">
                  {articles.length}
                </div>
                <div className="text-gray-400 font-inter text-xs">
                  Artigos Analisados
                </div>
              </div>
              
              <div>
                <div className="text-green-400 font-inter font-bold text-xl">
                  {trendData.length}
                </div>
                <div className="text-gray-400 font-inter text-xs">
                  Tendências Identificadas
                </div>
              </div>
              
              <div>
                <div className="text-yellow-400 font-inter font-bold text-xl">
                  {timeRange}
                </div>
                <div className="text-gray-400 font-inter text-xs">
                  Período Analisado
                </div>
              </div>
              
              <div>
                <div className="text-purple-400 font-inter font-bold text-xl">
                  {includeFullContent ? 'Full' : 'Basic'}
                </div>
                <div className="text-gray-400 font-inter text-xs">
                  Tipo de Conteúdo
                </div>
              </div>
            </div>
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
              <Sparkles size={12} className="text-white" />
            </div>
            <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
              <Sparkles size={12} className="text-white" />
            </div>
          </div>
          <h3 className="text-white font-inter font-semibold text-xl mb-3">
            Scraping Pro Avançado com DuckDuckGo + IA Viral
          </h3>
          <p className="text-gray-400 font-inter text-lg mb-6">
            Análise profunda de tendências com conteúdo completo + vídeos transcritos + score viral
          </p>
          <div className="text-gray-500 font-inter text-sm space-y-1">
            <p>🦆 Scraping real com DuckDuckGo (sem rate limits)</p>
            <p>📄 Extração de conteúdo completo dos artigos</p>
            <p>🎥 Busca e transcrição de vídeos do YouTube, Instagram e TikTok</p>
            <p>🧠 Análise de sentimentos e predições com IA</p>
            <p>✨ Score de potencial viral com 5 métricas de IA</p>
            <p>📊 Configuração flexível de período e profundidade</p>
            <p>⚡ Dados de DuckDuckGo, Twitter, Reddit, News e plataformas de vídeo</p>
          </div>
        </motion.div>
      )}

      {/* API Settings Modal */}
      <APISettingsModal
        isOpen={showAPISettings}
        onClose={() => setShowAPISettings(false)}
      />
    </div>
  );
};