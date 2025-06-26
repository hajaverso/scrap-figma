import axios from 'axios';
import { Article } from '../store/useAppStore';
import { videoTranscriptionService } from './videoTranscriptionService';
import { cacheService } from './cacheService';

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
  private readonly API_TOKEN = 'scraping_api_VkUm4hGkHDlk5MuCUTZQku8U8aWkHn2ffup8';
  private readonly BASE_URL = 'https://api.scraping-service.com/v2';
  private readonly FALLBACK_MODE = false;

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

  private generateAdvancedFallbackTrends = async (config: AdvancedSearchConfig): Promise<TrendData[]> => {
    console.log('🎲 Gerando dados simulados avançados...');
    
    const fallbackTrends: TrendData[] = [];
    
    for (const keyword of config.keywords) {
      const baseScore = Math.random() * 100;
      const sentiment = (Math.random() - 0.5) * 2; // -1 to 1
      const volume = Math.floor(Math.random() * 10000) + 100;
      const growth = (Math.random() - 0.5) * 200; // -100% to 100%
      
      // Generate sample articles
      const articles: Article[] = [];
      const numArticles = Math.min(config.maxArticlesPerSource, Math.floor(Math.random() * 15) + 5);
      
      for (let i = 0; i < numArticles; i++) {
        articles.push({
          id: `fallback-${keyword}-${i}`,
          title: `${keyword} - Artigo de Exemplo ${i + 1}`,
          url: `https://example.com/article-${keyword}-${i}`,
          source: ['TechCrunch', 'Wired', 'The Verge', 'Ars Technica', 'Engadget'][Math.floor(Math.random() * 5)],
          publishedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
          snippet: `Este é um artigo de exemplo sobre ${keyword}. Conteúdo simulado para demonstração.`,
          engagement: Math.floor(Math.random() * 1000) + config.minEngagement,
          sentiment: sentiment,
          relevanceScore: baseScore + (Math.random() - 0.5) * 20
        });
      }
      
      // Generate temporal data
      const dailyVolume = Array.from({ length: 30 }, () => Math.floor(Math.random() * 1000) + 50);
      const weeklyGrowth = growth;
      const peakDays = ['Monday', 'Wednesday', 'Friday'].slice(0, Math.floor(Math.random() * 3) + 1);
      const trendDirection: 'rising' | 'falling' | 'stable' = 
        growth > 20 ? 'rising' : growth < -20 ? 'falling' : 'stable';
      
      fallbackTrends.push({
        keyword,
        score: baseScore,
        sentiment,
        volume,
        growth,
        sources: [...new Set(articles.map(a => a.source))],
        articles,
        temporalData: {
          dailyVolume,
          weeklyGrowth,
          peakDays,
          trendDirection
        }
      });
    }
    
    console.log(`✅ Gerados ${fallbackTrends.length} trends simulados`);
    return fallbackTrends;
  };

  private async analyzeAdvancedTrend(keyword: string, config: AdvancedSearchConfig): Promise<TrendData> {
    // This method would contain the actual API logic
    // For now, return a single trend using the fallback method
    const fallbackData = await this.generateAdvancedFallbackTrends({
      ...config,
      keywords: [keyword]
    });
    
    return fallbackData[0];
  }

  async scrapeAdvancedTrends(config: AdvancedSearchConfig): Promise<TrendData[]> {
    try {
      console.log('🔍 Iniciando análise avançada com cache...');
      console.log('🎯 Configuração:', config);
      
      const cacheMetadata = this.generateCacheMetadata(config);
      const ttl = this.getTTLForTimeRange(config.timeRange);
      
      const cachedResults: TrendData[] = [];
      const keywordsToFetch: string[] = [];
      
      for (const keyword of config.keywords) {
        console.log(`📦 Verificando cache para: "${keyword}" (${config.timeRange})`);
        
        const cachedData = cacheService.get<TrendData[]>(
          keyword, 
          config.timeRange, 
          cacheMetadata
        );
        
        if (cachedData && cachedData.length > 0) {
          console.log(`✅ Cache HIT para "${keyword}" - Usando dados em cache`);
          cachedResults.push(...cachedData);
        } else {
          console.log(`❌ Cache MISS para "${keyword}" - Será buscado`);
          keywordsToFetch.push(keyword);
        }
      }
      
      if (keywordsToFetch.length === 0) {
        console.log('🎉 Todos os dados encontrados no cache!');
        return cachedResults.sort((a, b) => b.score - a.score);
      }
      
      console.log(`🌐 Buscando ${keywordsToFetch.length} keywords não encontradas no cache...`);
      
      let freshResults: TrendData[] = [];
      
      if (!this.API_TOKEN || this.API_TOKEN === 'your_api_token_here' || this.FALLBACK_MODE) {
        console.log('⚠️ Modo Fallback - Usando dados simulados avançados');
        freshResults = await this.generateAdvancedFallbackTrends({
          ...config,
          keywords: keywordsToFetch
        });
      } else {
        const trendPromises = keywordsToFetch.map(keyword => 
          this.analyzeAdvancedTrend(keyword, config)
        );
        const trends = await Promise.allSettled(trendPromises);
        
        freshResults = trends
          .filter((result): result is PromiseFulfilledResult<TrendData> => result.status === 'fulfilled')
          .map(result => result.value);
        
        if (freshResults.length === 0) {
          console.log('⚠️ Nenhum resultado da API - Usando fallback avançado');
          freshResults = await this.generateAdvancedFallbackTrends({
            ...config,
            keywords: keywordsToFetch
          });
        }
      }
      
      for (const keyword of keywordsToFetch) {
        const keywordResults = freshResults.filter(trend => 
          trend.keyword.toLowerCase() === keyword.toLowerCase()
        );
        
        if (keywordResults.length > 0) {
          console.log(`💾 Salvando no cache: "${keyword}" (${config.timeRange}) - TTL: ${this.formatDuration(ttl)}`);
          
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
      console.error('❌ Erro no scraping avançado:', error);
      return this.generateAdvancedFallbackTrends(config);
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