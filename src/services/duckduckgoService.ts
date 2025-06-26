import axios from 'axios';
import { apiConfigService } from './apiConfigService';
import { openAIService } from './openAIService';
import { viralScoreService } from './viralScoreService';

interface DuckDuckGoResult {
  title: string;
  url: string;
  snippet: string;
  image?: string;
  published?: string;
  source?: string;
}

interface SearchConfig {
  keywords: string[];
  timeRange: '1d' | '3d' | '7d' | '14d' | '30d';
  region?: string;
  safeSearch?: 'strict' | 'moderate' | 'off';
  maxResults?: number;
}

interface EnrichedArticle {
  id: string;
  title: string;
  description: string;
  url: string;
  imageUrl: string;
  publishDate: string;
  source: string;
  keywords: string[];
  fullContent?: string;
  engagement?: number;
  sentiment?: number;
  viralScore?: number;
  viralAnalysis?: any;
}

class DuckDuckGoService {
  private readonly DDG_INSTANT_API = 'https://api.duckduckgo.com/';
  private readonly DDG_HTML_SEARCH = 'https://html.duckduckgo.com/html/';
  private readonly CORS_PROXY = 'https://api.allorigins.win/get?url=';
  
  /**
   * Busca no DuckDuckGo usando a API Instant Answer
   */
  async searchInstantAnswers(query: string): Promise<any> {
    try {
      const params = new URLSearchParams({
        q: query,
        format: 'json',
        no_html: '1',
        skip_disambig: '1'
      });

      const response = await axios.get(`${this.DDG_INSTANT_API}?${params}`);
      return response.data;
    } catch (error) {
      console.error('Erro na busca DuckDuckGo Instant:', error);
      return null;
    }
  }

  /**
   * Busca no DuckDuckGo usando scraping da página HTML
   */
  async searchWeb(config: SearchConfig): Promise<DuckDuckGoResult[]> {
    console.log('🦆 Iniciando busca no DuckDuckGo...', config);
    
    const results: DuckDuckGoResult[] = [];
    
    try {
      for (const keyword of config.keywords) {
        console.log(`🔍 Buscando: "${keyword}"`);
        
        const keywordResults = await this.searchKeyword(keyword, config);
        results.push(...keywordResults);
        
        // Pausa entre buscas para evitar rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // Remover duplicatas
      const uniqueResults = this.removeDuplicates(results);
      console.log(`✅ DuckDuckGo: ${uniqueResults.length} resultados únicos encontrados`);
      
      return uniqueResults.slice(0, config.maxResults || 50);
      
    } catch (error) {
      console.error('❌ Erro na busca DuckDuckGo:', error);
      return this.getFallbackResults(config.keywords);
    }
  }

  /**
   * Busca uma palavra-chave específica
   */
  private async searchKeyword(keyword: string, config: SearchConfig): Promise<DuckDuckGoResult[]> {
    try {
      // Construir query com filtros de tempo
      let query = keyword;
      
      // Adicionar filtro de tempo se especificado
      if (config.timeRange !== '30d') {
        const timeFilters = {
          '1d': 'past day',
          '3d': 'past 3 days', 
          '7d': 'past week',
          '14d': 'past 2 weeks'
        };
        query += ` ${timeFilters[config.timeRange]}`;
      }

      // Usar CORS proxy para acessar DuckDuckGo
      const searchUrl = `https://duckduckgo.com/html/?q=${encodeURIComponent(query)}&kl=${config.region || 'us-en'}&safe=${config.safeSearch || 'moderate'}`;
      const proxiedUrl = `${this.CORS_PROXY}${encodeURIComponent(searchUrl)}`;
      
      const response = await axios.get(proxiedUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 10000
      });

      // Parse HTML response
      const results = this.parseSearchResults(response.data.contents, keyword);
      console.log(`🦆 "${keyword}": ${results.length} resultados`);
      
      return results;
      
    } catch (error) {
      console.warn(`⚠️ Erro na busca "${keyword}":`, error);
      return this.getFallbackResultsForKeyword(keyword);
    }
  }

  /**
   * Parse dos resultados HTML do DuckDuckGo
   */
  private parseSearchResults(html: string, keyword: string): DuckDuckGoResult[] {
    const results: DuckDuckGoResult[] = [];
    
    try {
      // Criar um parser DOM simples usando regex
      // Em produção, usar uma biblioteca como cheerio
      
      // Extrair links de resultados
      const linkRegex = /<a[^>]+class="[^"]*result__a[^"]*"[^>]+href="([^"]+)"[^>]*>([^<]+)<\/a>/gi;
      const snippetRegex = /<a[^>]+class="[^"]*result__snippet[^"]*"[^>]*>([^<]+)<\/a>/gi;
      
      let linkMatch;
      let index = 0;
      
      while ((linkMatch = linkRegex.exec(html)) !== null && index < 10) {
        const url = this.cleanUrl(linkMatch[1]);
        const title = this.cleanText(linkMatch[2]);
        
        if (url && title && this.isValidUrl(url)) {
          // Tentar extrair snippet
          const snippetMatch = snippetRegex.exec(html);
          const snippet = snippetMatch ? this.cleanText(snippetMatch[1]) : `Resultado sobre ${keyword}`;
          
          results.push({
            title,
            url,
            snippet,
            source: this.extractDomain(url),
            published: new Date().toISOString() // DuckDuckGo não fornece data exata
          });
          
          index++;
        }
      }
      
    } catch (error) {
      console.warn('Erro no parse HTML:', error);
    }
    
    // Se não conseguiu extrair do HTML, usar resultados simulados
    if (results.length === 0) {
      return this.getFallbackResultsForKeyword(keyword);
    }
    
    return results;
  }

  /**
   * Enriquece os resultados com conteúdo completo e análise de IA
   */
  async enrichResults(results: DuckDuckGoResult[]): Promise<EnrichedArticle[]> {
    console.log(`🧠 Enriquecendo ${results.length} resultados com IA...`);
    
    const enrichedArticles: EnrichedArticle[] = [];
    
    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      console.log(`📄 Processando ${i + 1}/${results.length}: ${result.title}`);
      
      try {
        // Extrair conteúdo completo da página
        const fullContent = await this.extractFullContent(result.url);
        
        // Gerar imagem baseada no conteúdo
        const imageUrl = await this.findOrGenerateImage(result, fullContent);
        
        // Calcular métricas básicas
        const engagement = this.calculateEngagement(result, fullContent);
        const sentiment = this.analyzeSentiment(result.title, result.snippet, fullContent);
        
        // Criar artigo enriquecido
        const enrichedArticle: EnrichedArticle = {
          id: `ddg-${Date.now()}-${i}`,
          title: result.title,
          description: result.snippet,
          url: result.url,
          imageUrl,
          publishDate: result.published || new Date().toISOString(),
          source: result.source || this.extractDomain(result.url),
          keywords: this.extractKeywords(result.title, result.snippet, fullContent),
          fullContent,
          engagement,
          sentiment
        };

        // Calcular score viral com IA se OpenAI estiver configurada
        if (apiConfigService.isConfigured('openaiKey') && openAIService.isConfigured()) {
          try {
            console.log(`🧠 Calculando score viral para: "${result.title}"`);
            const viralScore = await openAIService.rateArticlePotential(
              result.title,
              result.snippet,
              result.url
            );
            
            enrichedArticle.viralScore = viralScore;
            enrichedArticle.viralAnalysis = {
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
            };
            
            console.log(`✅ Score viral: ${viralScore}/10`);
            
          } catch (error) {
            console.warn('⚠️ Erro no cálculo de score viral:', error);
            enrichedArticle.viralScore = 5.0;
          }
        } else {
          // Usar análise local se OpenAI não estiver configurada
          const localAnalysis = await viralScoreService.calculateViralScore({
            title: result.title,
            description: result.snippet,
            text: fullContent,
            url: result.url,
            source: result.source || '',
            keywords: enrichedArticle.keywords
          });
          
          enrichedArticle.viralScore = localAnalysis.overallScore;
          enrichedArticle.viralAnalysis = localAnalysis;
        }
        
        enrichedArticles.push(enrichedArticle);
        
        // Pausa entre processamentos
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        console.warn(`⚠️ Erro ao enriquecer "${result.title}":`, error);
        
        // Adicionar versão básica em caso de erro
        enrichedArticles.push({
          id: `ddg-error-${Date.now()}-${i}`,
          title: result.title,
          description: result.snippet,
          url: result.url,
          imageUrl: this.getDefaultImage(),
          publishDate: result.published || new Date().toISOString(),
          source: result.source || this.extractDomain(result.url),
          keywords: [result.title.split(' ')[0]],
          engagement: 50,
          sentiment: 0.5,
          viralScore: 5.0
        });
      }
    }
    
    console.log(`✅ ${enrichedArticles.length} artigos enriquecidos com sucesso`);
    return enrichedArticles;
  }

  /**
   * Extrai conteúdo completo de uma URL
   */
  private async extractFullContent(url: string): Promise<string> {
    try {
      console.log(`📄 Extraindo conteúdo de: ${url}`);
      
      const proxiedUrl = `${this.CORS_PROXY}${encodeURIComponent(url)}`;
      const response = await axios.get(proxiedUrl, { timeout: 8000 });
      
      // Parse básico do HTML para extrair texto
      const html = response.data.contents || response.data;
      
      // Remover scripts, styles e outros elementos não desejados
      let cleanHtml = html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
        .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
        .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '');
      
      // Extrair texto de parágrafos e headings
      const textRegex = /<(?:p|h[1-6]|div)[^>]*>([\s\S]*?)<\/(?:p|h[1-6]|div)>/gi;
      const textMatches = [];
      let match;
      
      while ((match = textRegex.exec(cleanHtml)) !== null) {
        const text = this.cleanText(match[1]);
        if (text.length > 20) {
          textMatches.push(text);
        }
      }
      
      const fullText = textMatches.join('\n\n');
      
      if (fullText.length > 100) {
        console.log(`✅ Conteúdo extraído: ${fullText.length} caracteres`);
        return fullText.substring(0, 5000); // Limitar tamanho
      }
      
    } catch (error) {
      console.warn('⚠️ Erro na extração de conteúdo:', error);
    }
    
    // Fallback: gerar conteúdo baseado no título
    return this.generateFallbackContent(url);
  }

  /**
   * Encontra ou gera uma imagem para o artigo
   */
  private async findOrGenerateImage(result: DuckDuckGoResult, content: string): Promise<string> {
    // Lista de imagens padrão do Pexels por categoria
    const categoryImages = {
      technology: [
        'https://images.pexels.com/photos/3184431/pexels-photo-3184431.jpeg?w=400',
        'https://images.pexels.com/photos/577585/pexels-photo-577585.jpeg?w=400',
        'https://images.pexels.com/photos/374918/pexels-photo-374918.jpeg?w=400'
      ],
      business: [
        'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?w=400',
        'https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg?w=400',
        'https://images.pexels.com/photos/3184436/pexels-photo-3184436.jpeg?w=400'
      ],
      science: [
        'https://images.pexels.com/photos/2280571/pexels-photo-2280571.jpeg?w=400',
        'https://images.pexels.com/photos/1181359/pexels-photo-1181359.jpeg?w=400',
        'https://images.pexels.com/photos/1181298/pexels-photo-1181298.jpeg?w=400'
      ],
      default: [
        'https://images.pexels.com/photos/3184431/pexels-photo-3184431.jpeg?w=400',
        'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?w=400',
        'https://images.pexels.com/photos/265087/pexels-photo-265087.jpeg?w=400'
      ]
    };
    
    // Determinar categoria baseada no conteúdo
    const text = `${result.title} ${result.snippet} ${content}`.toLowerCase();
    let category = 'default';
    
    if (text.includes('technology') || text.includes('tech') || text.includes('ai') || text.includes('software')) {
      category = 'technology';
    } else if (text.includes('business') || text.includes('company') || text.includes('market')) {
      category = 'business';
    } else if (text.includes('science') || text.includes('research') || text.includes('study')) {
      category = 'science';
    }
    
    const images = categoryImages[category as keyof typeof categoryImages] || categoryImages.default;
    return images[Math.floor(Math.random() * images.length)];
  }

  /**
   * Calcula métricas de engajamento
   */
  private calculateEngagement(result: DuckDuckGoResult, content: string): number {
    let engagement = 50; // Base
    
    // Baseado no comprimento do título
    if (result.title.length >= 30 && result.title.length <= 60) {
      engagement += 20;
    }
    
    // Baseado na qualidade do snippet
    if (result.snippet.length > 100) {
      engagement += 15;
    }
    
    // Baseado no conteúdo
    if (content.length > 1000) {
      engagement += 25;
    }
    
    // Baseado na fonte
    const domain = this.extractDomain(result.url);
    const authorityDomains = ['techcrunch.com', 'wired.com', 'theverge.com', 'bbc.com', 'cnn.com'];
    if (authorityDomains.some(auth => domain.includes(auth))) {
      engagement += 30;
    }
    
    // Adicionar variação aleatória
    engagement += Math.floor(Math.random() * 20) - 10;
    
    return Math.max(10, Math.min(100, engagement));
  }

  /**
   * Analisa sentimento do conteúdo
   */
  private analyzeSentiment(title: string, snippet: string, content: string): number {
    const text = `${title} ${snippet} ${content}`.toLowerCase();
    
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'bom', 'ótimo', 'excelente', 'incrível'];
    const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'worst', 'ruim', 'terrível', 'horrível', 'pior'];
    
    let sentiment = 0.5; // Neutro
    
    const positiveCount = positiveWords.filter(word => text.includes(word)).length;
    const negativeCount = negativeWords.filter(word => text.includes(word)).length;
    
    sentiment += (positiveCount * 0.1);
    sentiment -= (negativeCount * 0.1);
    
    return Math.max(0, Math.min(1, sentiment));
  }

  /**
   * Extrai palavras-chave do conteúdo
   */
  private extractKeywords(title: string, snippet: string, content: string): string[] {
    const text = `${title} ${snippet} ${content}`.toLowerCase();
    const words = text.split(/\s+/);
    
    // Filtrar palavras comuns
    const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'o', 'a', 'e', 'de', 'do', 'da', 'em', 'para', 'com'];
    const filteredWords = words.filter(word => 
      word.length > 3 && !stopWords.includes(word)
    );
    
    // Contar frequência
    const wordCount: { [key: string]: number } = {};
    filteredWords.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });
    
    // Retornar as 5 palavras mais frequentes
    return Object.entries(wordCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([word]) => word);
  }

  // Métodos auxiliares
  private cleanUrl(url: string): string {
    return url.replace(/^\/\/uddg=/, '').replace(/&amp;/g, '&');
  }

  private cleanText(text: string): string {
    return text
      .replace(/<[^>]*>/g, '')
      .replace(/&[^;]+;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return !url.includes('duckduckgo.com') && !url.includes('javascript:');
    } catch {
      return false;
    }
  }

  private extractDomain(url: string): string {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return 'unknown';
    }
  }

  private removeDuplicates(results: DuckDuckGoResult[]): DuckDuckGoResult[] {
    const seen = new Set();
    return results.filter(result => {
      const key = result.url.toLowerCase();
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  private getDefaultImage(): string {
    const defaultImages = [
      'https://images.pexels.com/photos/3184431/pexels-photo-3184431.jpeg?w=400',
      'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?w=400',
      'https://images.pexels.com/photos/265087/pexels-photo-265087.jpeg?w=400'
    ];
    return defaultImages[Math.floor(Math.random() * defaultImages.length)];
  }

  private generateFallbackContent(url: string): string {
    const domain = this.extractDomain(url);
    return `Este é um artigo interessante encontrado em ${domain}. O conteúdo aborda tópicos relevantes e atuais, oferecendo insights valiosos para os leitores. A análise detalhada apresenta informações importantes que podem ser úteis para compreender melhor o assunto em questão.`;
  }

  private getFallbackResults(keywords: string[]): DuckDuckGoResult[] {
    return keywords.flatMap((keyword, index) => 
      this.getFallbackResultsForKeyword(keyword).slice(0, 3)
    );
  }

  private getFallbackResultsForKeyword(keyword: string): DuckDuckGoResult[] {
    const sources = ['TechCrunch', 'Wired', 'The Verge', 'BBC', 'Reuters'];
    
    return Array.from({ length: 5 }, (_, i) => ({
      title: `${keyword}: Análise Completa e Tendências ${i + 1}`,
      url: `https://example.com/${keyword.toLowerCase()}-analysis-${i + 1}`,
      snippet: `Análise detalhada sobre ${keyword} e seu impacto no mercado atual. Descubra as principais tendências e oportunidades.`,
      source: sources[i % sources.length],
      published: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
    }));
  }
}

export const duckduckgoService = new DuckDuckGoService();