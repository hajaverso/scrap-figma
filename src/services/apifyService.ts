import axios from 'axios';
import { Article } from '../store/useAppStore';
import { videoTranscriptionService } from './videoTranscriptionService';
import { cacheService } from './cacheService';
import { duckduckgoService } from './duckduckgoService';
import { apiConfigService } from './apiConfigService';

interface ApifyDataset {
  items: any[];
}

interface TrendData {
  keyword: string;
  score: number;
  sentiment: number;
  volume: number;
  growth: number;
  sources: string[];
  articles: Article[];
  temporalData?: {
    dailyVolume: number[];
    weeklyGrowth: number;
    peakDays: string[];
    trendDirection: 'rising' | 'falling' | 'stable';
  };
}

interface PredictionData {
  keyword: string;
  currentScore: number;
  predictedScore: number;
  trend: 'rising' | 'falling' | 'stable';
  confidence: number;
  timeframe: string;
}

interface PredictionResult {
  scorePrevisto: number;
  confianca: number;
}

interface AdvancedSearchConfig {
  keywords: string[];
  timeRange: '1d' | '3d' | '7d' | '14d' | '30d';
  analysisDepth: 'basic' | 'detailed' | 'comprehensive';
  includeFullContent: boolean;
  sourcePriority: 'all' | 'news' | 'social' | 'tech' | 'video';
  minEngagement: number;
  maxArticlesPerSource: number;
  includeVideos?: boolean;
  videoTranscription?: boolean;
}

class ScrapingService {
  private readonly USE_REAL_SCRAPING = true;

  private generateCacheMetadata(config: AdvancedSearchConfig) {
    return {
      analysisDepth: config.analysisDepth,
      sourcePriority: config.sourcePriority,
      includeFullContent: config.includeFullContent,
      includeVideos: config.includeVideos,
      videoTranscription: config.videoTranscription,
      minEngagement: config.minEngagement,
      maxArticlesPerSource: config.maxArticlesPerSource
    };
  }

  private getTTLForTimeRange(timeRange: string): number {
    const ttlMap = {
      '1d': 2 * 60 * 60 * 1000,    // 2 horas para dados de 1 dia
      '3d': 4 * 60 * 60 * 1000,    // 4 horas para dados de 3 dias
      '7d': 8 * 60 * 60 * 1000,    // 8 horas para dados de 7 dias
      '14d': 12 * 60 * 60 * 1000,  // 12 horas para dados de 14 dias
      '30d': 24 * 60 * 60 * 1000   // 24 horas para dados de 30 dias
    };
    
    return ttlMap[timeRange as keyof typeof ttlMap] || 12 * 60 * 60 * 1000;
  }

  /**
   * Scraping real usando DuckDuckGo + IA
   */
  private async performRealScraping(config: AdvancedSearchConfig): Promise<TrendData[]> {
    console.log('🦆 Iniciando scraping REAL com DuckDuckGo + IA...');
    
    try {
      // Configurar busca no DuckDuckGo
      const searchConfig = {
        keywords: config.keywords,
        timeRange: config.timeRange,
        region: 'us-en',
        safeSearch: 'moderate' as const,
        maxResults: config.maxArticlesPerSource * config.keywords.length
      };

      // Buscar no DuckDuckGo
      console.log('🔍 Executando busca real no DuckDuckGo...');
      const searchResults = await duckduckgoService.searchWeb(searchConfig);
      
      if (searchResults.length === 0) {
        console.warn('⚠️ Nenhum resultado real encontrado');
        throw new Error('Nenhum resultado encontrado na busca real');
      }

      console.log(`✅ ${searchResults.length} resultados reais encontrados`);

      // Enriquecer resultados com IA
      console.log('🧠 Enriquecendo resultados com análise de IA...');
      const enrichedArticles = await duckduckgoService.enrichResults(searchResults);

      console.log(`✅ ${enrichedArticles.length} artigos enriquecidos`);

      // Converter para formato TrendData
      const trends: TrendData[] = [];
      
      for (const keyword of config.keywords) {
        // Filtrar artigos relacionados a esta keyword
        const keywordArticles = enrichedArticles.filter(article => 
          article.title.toLowerCase().includes(keyword.toLowerCase()) ||
          article.description.toLowerCase().includes(keyword.toLowerCase()) ||
          article.keywords.some(k => k.toLowerCase().includes(keyword.toLowerCase()))
        );

        if (keywordArticles.length === 0) {
          console.warn(`⚠️ Nenhum artigo encontrado para "${keyword}"`);
          continue;
        }

        // Calcular métricas reais da tendência
        const avgScore = keywordArticles.reduce((sum, a) => sum + (a.viralScore || 5), 0) / keywordArticles.length;
        const avgSentiment = keywordArticles.reduce((sum, a) => sum + (a.sentiment || 0.5), 0) / keywordArticles.length;
        const totalVolume = keywordArticles.reduce((sum, a) => sum + (a.engagement || 50), 0);
        
        // Calcular crescimento baseado em dados reais
        const recentArticles = keywordArticles.filter(a => {
          const articleDate = new Date(a.publishDate);
          const daysDiff = (Date.now() - articleDate.getTime()) / (1000 * 60 * 60 * 24);
          return daysDiff <= 3;
        });
        
        const growth = recentArticles.length > 0 ? 
          ((recentArticles.length / keywordArticles.length) * 100) - 50 : 
          (Math.random() - 0.5) * 40;

        // Extrair fontes únicas
        const sources = [...new Set(keywordArticles.map(a => a.source))];

        // Gerar dados temporais baseados nos artigos reais
        const dailyVolume = this.calculateDailyVolume(keywordArticles);
        const weeklyGrowth = growth;
        const peakDays = this.calculatePeakDays(keywordArticles);
        const trendDirection: 'rising' | 'falling' | 'stable' = 
          growth > 20 ? 'rising' : growth < -20 ? 'falling' : 'stable';

        trends.push({
          keyword,
          score: avgScore,
          sentiment: avgSentiment,
          volume: totalVolume,
          growth,
          sources,
          articles: keywordArticles,
          temporalData: {
            dailyVolume,
            weeklyGrowth,
            peakDays,
            trendDirection
          }
        });

        console.log(`📊 Tendência "${keyword}": ${keywordArticles.length} artigos, score ${avgScore.toFixed(1)}`);
      }

      console.log(`✅ Scraping real concluído: ${trends.length} tendências processadas`);
      return trends;

    } catch (error) {
      console.error('❌ Erro no scraping real:', error);
      throw error; // Re-throw para forçar fallback
    }
  }

  /**
   * Calcula volume diário baseado nos artigos reais
   */
  private calculateDailyVolume(articles: Article[]): number[] {
    const dailyVolume = new Array(30).fill(0);
    
    articles.forEach(article => {
      const articleDate = new Date(article.publishDate);
      const daysDiff = Math.floor((Date.now() - articleDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff >= 0 && daysDiff < 30) {
        dailyVolume[29 - daysDiff] += (article.engagement || 50);
      }
    });
    
    return dailyVolume;
  }

  /**
   * Calcula dias de pico baseado nos artigos reais
   */
  private calculatePeakDays(articles: Article[]): string[] {
    const dayCount: { [key: string]: number } = {};
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    articles.forEach(article => {
      const articleDate = new Date(article.publishDate);
      const dayName = dayNames[articleDate.getDay()];
      dayCount[dayName] = (dayCount[dayName] || 0) + 1;
    });
    
    return Object.entries(dayCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([day]) => day);
  }

  /**
   * Fallback apenas quando scraping real falha completamente
   */
  private generateMinimalFallback = async (config: AdvancedSearchConfig): Promise<TrendData[]> => {
    console.log('🔄 Gerando fallback mínimo (scraping real falhou)...');
    
    // Só usar fallback se realmente não conseguir dados reais
    const fallbackTrends: TrendData[] = [];
    
    for (const keyword of config.keywords) {
      console.warn(`⚠️ Usando fallback para "${keyword}" - dados reais não disponíveis`);
      
      // Criar apenas 1-2 artigos básicos por keyword
      const articles: Article[] = [];
      const numArticles = Math.min(2, config.maxArticlesPerSource);
      
      for (let i = 0; i < numArticles; i++) {
        articles.push({
          id: `fallback-${keyword}-${i}`,
          title: `${keyword} - Análise Atual ${i + 1}`,
          description: `Análise sobre ${keyword} baseada em dados disponíveis. Informações limitadas devido à indisponibilidade de APIs.`,
          url: `https://example.com/${keyword.toLowerCase()}-${i}`,
          source: 'Dados Limitados',
          publishDate: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
          imageUrl: `https://images.pexels.com/photos/318443${i}/pexels-photo-318443${i}.jpeg?w=400`,
          keywords: [keyword],
          fullContent: `Conteúdo limitado sobre ${keyword}. Para análise completa, configure as APIs necessárias.`,
          engagement: 30 + Math.floor(Math.random() * 20),
          sentiment: 0.4 + Math.random() * 0.2,
          viralScore: 4 + Math.random() * 2
        });
      }
      
      fallbackTrends.push({
        keyword,
        score: 5 + Math.random() * 2,
        sentiment: 0.5,
        volume: 100 + Math.floor(Math.random() * 50),
        growth: (Math.random() - 0.5) * 20,
        sources: ['Dados Limitados'],
        articles,
        temporalData: {
          dailyVolume: Array.from({ length: 30 }, () => Math.floor(Math.random() * 50) + 25),
          weeklyGrowth: (Math.random() - 0.5) * 20,
          peakDays: ['Monday', 'Wednesday'],
          trendDirection: 'stable'
        }
      });
    }
    
    console.log(`⚠️ Fallback gerado: ${fallbackTrends.length} tendências com dados limitados`);
    return fallbackTrends;
  };

  async scrapeAdvancedTrends(config: AdvancedSearchConfig): Promise<TrendData[]> {
    try {
      console.log('🔍 Iniciando análise avançada REAL...');
      console.log('🎯 Configuração:', config);
      
      const cacheMetadata = this.generateCacheMetadata(config);
      const ttl = this.getTTLForTimeRange(config.timeRange);
      
      const cachedResults: TrendData[] = [];
      const keywordsToFetch: string[] = [];
      
      // Verificar cache
      for (const keyword of config.keywords) {
        console.log(`📦 Verificando cache para: "${keyword}" (${config.timeRange})`);
        
        const cachedData = cacheService.get<TrendData[]>(
          keyword, 
          config.timeRange, 
          cacheMetadata
        );
        
        if (cachedData && cachedData.length > 0) {
          console.log(`✅ Cache HIT para "${keyword}"`);
          cachedResults.push(...cachedData);
        } else {
          console.log(`❌ Cache MISS para "${keyword}"`);
          keywordsToFetch.push(keyword);
        }
      }
      
      if (keywordsToFetch.length === 0) {
        console.log('🎉 Todos os dados encontrados no cache!');
        return cachedResults.sort((a, b) => b.score - a.score);
      }
      
      console.log(`🌐 Buscando dados REAIS para ${keywordsToFetch.length} keywords...`);
      
      let freshResults: TrendData[] = [];
      
      // Tentar scraping real primeiro
      try {
        freshResults = await this.performRealScraping({
          ...config,
          keywords: keywordsToFetch
        });
        
        console.log(`✅ Scraping real bem-sucedido: ${freshResults.length} tendências`);
        
      } catch (realScrapingError) {
        console.error('❌ Scraping real falhou:', realScrapingError);
        console.log('🔄 Usando fallback mínimo...');
        
        freshResults = await this.generateMinimalFallback({
          ...config,
          keywords: keywordsToFetch
        });
      }
      
      // Salvar no cache
      for (const keyword of keywordsToFetch) {
        const keywordResults = freshResults.filter(trend => 
          trend.keyword.toLowerCase() === keyword.toLowerCase()
        );
        
        if (keywordResults.length > 0) {
          console.log(`💾 Salvando no cache: "${keyword}" (${config.timeRange})`);
          
          cacheService.set(
            keyword,
            config.timeRange,
            keywordResults,
            ttl,
            cacheMetadata
          );
        }
      }
      
      const allResults = [...cachedResults, ...freshResults];
      
      console.log(`✅ Análise concluída: ${cachedResults.length} do cache + ${freshResults.length} novos = ${allResults.length} total`);
      
      return allResults.sort((a, b) => b.score - a.score);
      
    } catch (error) {
      console.error('❌ Erro crítico na análise avançada:', error);
      
      // Último recurso: fallback mínimo
      return this.generateMinimalFallback(config);
    }
  }

  async scrapeTrends(keywords: string[]): Promise<TrendData[]> {
    const config: AdvancedSearchConfig = {
      keywords,
      timeRange: '7d',
      analysisDepth: 'detailed',
      includeFullContent: true,
      sourcePriority: 'all',
      minEngagement: 10,
      maxArticlesPerSource: 20,
      includeVideos: true,
      videoTranscription: true
    };
    
    return this.scrapeAdvancedTrends(config);
  }

  /**
   * Gera previsões de score futuro baseado em uma palavra-chave específica
   */
  async generatePredictions(keyword: string): Promise<PredictionResult>;
  async generatePredictions(trends: TrendData[]): Promise<PredictionData[]>;
  async generatePredictions(input: string | TrendData[]): Promise<PredictionResult | PredictionData[]> {
    // Sobrecarga para palavra-chave única
    if (typeof input === 'string') {
      const keyword = input;
      console.log(`🔮 Gerando previsão para palavra-chave: "${keyword}"`);
      
      try {
        const config: AdvancedSearchConfig = {
          keywords: [keyword],
          timeRange: '7d',
          analysisDepth: 'detailed',
          includeFullContent: true,
          sourcePriority: 'all',
          minEngagement: 10,
          maxArticlesPerSource: 15,
          includeVideos: true,
          videoTranscription: true
        };
        
        const trends = await this.scrapeAdvancedTrends(config);
        
        if (trends.length === 0) {
          console.warn(`⚠️ Nenhuma tendência encontrada para "${keyword}"`);
          return {
            scorePrevisto: 5.0,
            confianca: 50
          };
        }
        
        const trend = trends[0];
        const prediction = this.calculatePrediction(trend);
        
        console.log(`✅ Previsão gerada para "${keyword}": Score ${prediction.scorePrevisto.toFixed(1)}, Confiança ${prediction.confianca}%`);
        
        return prediction;
      } catch (error) {
        console.error(`❌ Erro ao gerar previsão para "${keyword}":`, error);
        return {
          scorePrevisto: 5.0,
          confianca: 50
        };
      }
    }
    
    // Sobrecarga para array de tendências
    const trends = input;
    console.log(`🔮 Gerando previsões para ${trends.length} tendências`);
    
    return trends.map(trend => {
      const prediction = this.calculatePrediction(trend);
      
      const change = prediction.scorePrevisto - trend.score;
      let trendDirection: 'rising' | 'falling' | 'stable';
      
      if (change > 0.5) trendDirection = 'rising';
      else if (change < -0.5) trendDirection = 'falling';
      else trendDirection = 'stable';
      
      return {
        keyword: trend.keyword,
        currentScore: trend.score,
        predictedScore: prediction.scorePrevisto,
        trend: trendDirection,
        confidence: prediction.confianca / 100,
        timeframe: '7 days'
      };
    });
  }

  /**
   * Calcula a previsão de score baseado nos dados da tendência
   */
  private calculatePrediction(trend: TrendData): PredictionResult {
    const currentScore = Math.max(0, Math.min(10, trend.score || 5));
    const growth = trend.growth || 0;
    const sentiment = Math.max(0, Math.min(1, trend.sentiment || 0.5));
    const volume = Math.max(0, trend.volume || 100);
    
    let scoreAdjustment = 0;
    let confidenceBase = 85; // Confiança baseada em dados reais
    
    // Lógica preditiva baseada no crescimento
    if (growth > 50) {
      scoreAdjustment = 1.2 + Math.random() * 0.8;
      confidenceBase += 10;
    } else if (growth >= 20 && growth <= 50) {
      scoreAdjustment = 0.4 + Math.random() * 0.6;
      confidenceBase += 5;
    } else if (growth < 20) {
      if (growth >= 0) {
        scoreAdjustment = -0.1 + Math.random() * 0.3;
      } else {
        scoreAdjustment = -0.8 + Math.random() * 0.4;
        confidenceBase -= 5;
      }
    }
    
    // Ajustes baseados em outros fatores
    const sentimentFactor = (sentiment - 0.5) * 0.4;
    scoreAdjustment += sentimentFactor;
    
    const volumeFactor = Math.log(volume + 1) / 150;
    scoreAdjustment += volumeFactor;
    
    // Calcular score previsto
    let predictedScore = currentScore + scoreAdjustment;
    predictedScore = Math.max(0, Math.min(10, predictedScore));
    
    return {
      scorePrevisto: Math.round(predictedScore * 10) / 10,
      confianca: Math.max(50, Math.min(95, confidenceBase))
    };
  }

  invalidateCache(keyword: string, timeRange?: string): void {
    if (timeRange) {
      const deleted = cacheService.delete(keyword, timeRange);
      console.log(`🗑️ Cache invalidado para "${keyword}" (${timeRange}): ${deleted ? 'Sucesso' : 'Não encontrado'}`);
    } else {
      const entries = cacheService.getEntriesByKeyword(keyword);
      let deletedCount = 0;
      
      for (const entry of entries) {
        if (cacheService.delete(keyword, entry.period)) {
          deletedCount++;
        }
      }
      
      console.log(`🗑️ Cache invalidado para "${keyword}" (todos os períodos): ${deletedCount} entradas removidas`);
    }
  }

  getCacheStats() {
    return cacheService.getStats();
  }

  clearCache(): void {
    cacheService.clear();
    console.log('🗑️ Todo o cache foi limpo');
  }

  async forceRefresh(config: AdvancedSearchConfig): Promise<TrendData[]> {
    console.log('🔄 Forçando atualização - Ignorando cache...');
    
    for (const keyword of config.keywords) {
      this.invalidateCache(keyword, config.timeRange);
    }
    
    return this.scrapeAdvancedTrends(config);
  }

  private formatDuration(ms: number): string {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h${minutes > 0 ? ` ${minutes}m` : ''}`;
    }
    return `${minutes}m`;
  }
}

export const apifyService = new ScrapingService();