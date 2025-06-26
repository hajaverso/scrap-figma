/**
 * Serviço para calcular Score de Potencial Viral usando IA
 */

interface ViralScoreAnalysis {
  emotionScore: number; // 0-10: Emoção evocada
  clarityScore: number; // 0-10: Clareza do título
  carouselPotential: number; // 0-10: Facilidade de transformação em carrossel
  trendScore: number; // 0-10: Tendência do assunto
  authorityScore: number; // 0-10: Autoridade da fonte
  overallScore: number; // 0-10: Score geral
  analysis: {
    emotions: string[];
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
  };
}

interface ArticleForAnalysis {
  title: string;
  description: string;
  text?: string;
  url: string;
  source: string;
  keywords?: string[];
  images?: any[];
  videos?: any[];
}

class ViralScoreService {
  private readonly EMOTION_KEYWORDS = {
    high: ['incrível', 'surpreendente', 'revolucionário', 'extraordinário', 'impressionante', 'chocante', 'fantástico', 'amazing', 'incredible', 'shocking', 'revolutionary'],
    medium: ['interessante', 'importante', 'relevante', 'significativo', 'útil', 'valuable', 'important', 'interesting', 'relevant'],
    low: ['normal', 'comum', 'básico', 'simples', 'regular', 'standard', 'basic', 'common', 'simple']
  };

  private readonly AUTHORITY_DOMAINS = {
    high: ['techcrunch.com', 'wired.com', 'theverge.com', 'arstechnica.com', 'mit.edu', 'stanford.edu', 'harvard.edu'],
    medium: ['medium.com', 'linkedin.com', 'forbes.com', 'businessinsider.com', 'mashable.com'],
    low: ['blog', 'wordpress', 'blogspot', 'tumblr']
  };

  private readonly TRENDING_KEYWORDS = [
    'ai', 'artificial intelligence', 'machine learning', 'blockchain', 'crypto', 'nft', 'metaverse',
    'web3', 'sustainability', 'climate', 'remote work', 'automation', 'robotics', 'quantum',
    'inteligência artificial', 'aprendizado de máquina', 'sustentabilidade', 'automação'
  ];

  /**
   * Calcula o score de potencial viral de um artigo
   */
  async calculateViralScore(article: ArticleForAnalysis): Promise<ViralScoreAnalysis> {
    console.log(`🧠 Analisando potencial viral: "${article.title}"`);

    try {
      // Simular processamento de IA
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

      const emotionScore = this.analyzeEmotion(article);
      const clarityScore = this.analyzeClarity(article);
      const carouselPotential = this.analyzeCarouselPotential(article);
      const trendScore = this.analyzeTrendiness(article);
      const authorityScore = this.analyzeAuthority(article);

      // Calcular score geral (média ponderada)
      const overallScore = (
        emotionScore * 0.25 +
        clarityScore * 0.20 +
        carouselPotential * 0.25 +
        trendScore * 0.20 +
        authorityScore * 0.10
      );

      const analysis = this.generateAnalysis(article, {
        emotionScore,
        clarityScore,
        carouselPotential,
        trendScore,
        authorityScore,
        overallScore
      });

      const result: ViralScoreAnalysis = {
        emotionScore: Math.round(emotionScore * 10) / 10,
        clarityScore: Math.round(clarityScore * 10) / 10,
        carouselPotential: Math.round(carouselPotential * 10) / 10,
        trendScore: Math.round(trendScore * 10) / 10,
        authorityScore: Math.round(authorityScore * 10) / 10,
        overallScore: Math.round(overallScore * 10) / 10,
        analysis
      };

      console.log(`✅ Score calculado: ${result.overallScore}/10 para "${article.title}"`);
      return result;

    } catch (error) {
      console.error('❌ Erro no cálculo do score viral:', error);
      
      // Retornar score padrão em caso de erro
      return {
        emotionScore: 5.0,
        clarityScore: 5.0,
        carouselPotential: 5.0,
        trendScore: 5.0,
        authorityScore: 5.0,
        overallScore: 5.0,
        analysis: {
          emotions: ['neutro'],
          strengths: ['conteúdo padrão'],
          weaknesses: ['análise não disponível'],
          recommendations: ['tente novamente']
        }
      };
    }
  }

  /**
   * Analisa a emoção evocada pelo conteúdo
   */
  private analyzeEmotion(article: ArticleForAnalysis): number {
    const content = `${article.title} ${article.description} ${article.text || ''}`.toLowerCase();
    
    let emotionScore = 5.0; // Base neutra
    
    // Verificar palavras de alta emoção
    const highEmotionCount = this.EMOTION_KEYWORDS.high.filter(keyword => 
      content.includes(keyword.toLowerCase())
    ).length;
    
    // Verificar palavras de média emoção
    const mediumEmotionCount = this.EMOTION_KEYWORDS.medium.filter(keyword => 
      content.includes(keyword.toLowerCase())
    ).length;
    
    // Verificar palavras de baixa emoção
    const lowEmotionCount = this.EMOTION_KEYWORDS.low.filter(keyword => 
      content.includes(keyword.toLowerCase())
    ).length;
    
    // Calcular score baseado na presença de palavras emocionais
    emotionScore += (highEmotionCount * 1.5);
    emotionScore += (mediumEmotionCount * 0.8);
    emotionScore -= (lowEmotionCount * 0.5);
    
    // Verificar pontuação exclamativa (indica emoção)
    const exclamationCount = (content.match(/!/g) || []).length;
    emotionScore += Math.min(exclamationCount * 0.3, 1.0);
    
    // Verificar palavras em maiúscula (indica ênfase)
    const capsWords = (article.title.match(/[A-Z]{2,}/g) || []).length;
    emotionScore += Math.min(capsWords * 0.2, 0.8);
    
    return Math.max(0, Math.min(10, emotionScore));
  }

  /**
   * Analisa a clareza do título
   */
  private analyzeClarity(article: ArticleForAnalysis): number {
    const title = article.title;
    let clarityScore = 5.0;
    
    // Comprimento ideal do título (30-60 caracteres)
    if (title.length >= 30 && title.length <= 60) {
      clarityScore += 2.0;
    } else if (title.length < 20 || title.length > 80) {
      clarityScore -= 1.5;
    }
    
    // Presença de números (aumenta clareza)
    const numberCount = (title.match(/\d+/g) || []).length;
    clarityScore += Math.min(numberCount * 0.5, 1.5);
    
    // Palavras de ação
    const actionWords = ['como', 'por que', 'quando', 'onde', 'guia', 'tutorial', 'dicas', 'how', 'why', 'guide', 'tips'];
    const actionWordCount = actionWords.filter(word => 
      title.toLowerCase().includes(word)
    ).length;
    clarityScore += Math.min(actionWordCount * 0.8, 2.0);
    
    // Evitar jargões excessivos
    const jargonWords = ['paradigma', 'sinergia', 'disruptivo', 'holístico'];
    const jargonCount = jargonWords.filter(word => 
      title.toLowerCase().includes(word)
    ).length;
    clarityScore -= jargonCount * 0.5;
    
    // Estrutura clara (presença de dois pontos ou travessão)
    if (title.includes(':') || title.includes('—') || title.includes('-')) {
      clarityScore += 0.8;
    }
    
    return Math.max(0, Math.min(10, clarityScore));
  }

  /**
   * Analisa a facilidade de transformação em carrossel
   */
  private analyzeCarouselPotential(article: ArticleForAnalysis): number {
    let carouselScore = 5.0;
    
    const content = article.text || article.description;
    const title = article.title;
    
    // Presença de listas ou pontos
    const listIndicators = content.match(/(\d+\.|•|\*|-\s)/g) || [];
    carouselScore += Math.min(listIndicators.length * 0.3, 2.0);
    
    // Presença de seções ou subtítulos
    const sectionIndicators = content.match(/(primeiro|segundo|terceiro|finally|conclusão|introduction)/gi) || [];
    carouselScore += Math.min(sectionIndicators.length * 0.4, 1.5);
    
    // Comprimento do conteúdo (ideal para divisão)
    if (content.length > 500 && content.length < 3000) {
      carouselScore += 1.5;
    } else if (content.length > 3000) {
      carouselScore += 2.0; // Muito conteúdo = mais slides
    }
    
    // Presença de imagens
    const imageCount = article.images?.length || 0;
    carouselScore += Math.min(imageCount * 0.2, 1.0);
    
    // Presença de dados ou estatísticas
    const dataIndicators = content.match(/(\d+%|\d+\s*(milhão|bilhão|mil)|estatística|pesquisa|estudo)/gi) || [];
    carouselScore += Math.min(dataIndicators.length * 0.3, 1.5);
    
    // Títulos que sugerem listas ou passos
    const listTitleIndicators = ['dicas', 'passos', 'maneiras', 'formas', 'tips', 'ways', 'steps'];
    const listTitleCount = listTitleIndicators.filter(indicator => 
      title.toLowerCase().includes(indicator)
    ).length;
    carouselScore += listTitleCount * 1.0;
    
    return Math.max(0, Math.min(10, carouselScore));
  }

  /**
   * Analisa se o assunto está em tendência
   */
  private analyzeTrendiness(article: ArticleForAnalysis): number {
    const content = `${article.title} ${article.description} ${article.text || ''}`.toLowerCase();
    let trendScore = 5.0;
    
    // Verificar palavras-chave de tendência
    const trendingKeywordCount = this.TRENDING_KEYWORDS.filter(keyword => 
      content.includes(keyword.toLowerCase())
    ).length;
    
    trendScore += Math.min(trendingKeywordCount * 0.8, 3.0);
    
    // Verificar palavras relacionadas a novidade
    const noveltyWords = ['novo', 'nova', 'lançamento', 'breakthrough', 'inovação', 'revolução', 'new', 'latest', 'innovation'];
    const noveltyCount = noveltyWords.filter(word => 
      content.includes(word)
    ).length;
    trendScore += Math.min(noveltyCount * 0.5, 2.0);
    
    // Verificar menções a anos recentes
    const currentYear = new Date().getFullYear();
    const recentYears = [currentYear, currentYear - 1].map(year => year.toString());
    const yearMentions = recentYears.filter(year => content.includes(year)).length;
    trendScore += yearMentions * 0.5;
    
    // Verificar palavras relacionadas a futuro
    const futureWords = ['futuro', 'próximo', 'future', 'next', 'upcoming', '2024', '2025'];
    const futureCount = futureWords.filter(word => 
      content.includes(word)
    ).length;
    trendScore += Math.min(futureCount * 0.3, 1.0);
    
    return Math.max(0, Math.min(10, trendScore));
  }

  /**
   * Analisa a autoridade da fonte
   */
  private analyzeAuthority(article: ArticleForAnalysis): number {
    let authorityScore = 5.0;
    
    try {
      const domain = new URL(article.url).hostname.toLowerCase();
      
      // Verificar domínios de alta autoridade
      const isHighAuthority = this.AUTHORITY_DOMAINS.high.some(authDomain => 
        domain.includes(authDomain)
      );
      if (isHighAuthority) {
        authorityScore += 3.0;
      }
      
      // Verificar domínios de média autoridade
      const isMediumAuthority = this.AUTHORITY_DOMAINS.medium.some(authDomain => 
        domain.includes(authDomain)
      );
      if (isMediumAuthority) {
        authorityScore += 1.5;
      }
      
      // Verificar domínios de baixa autoridade
      const isLowAuthority = this.AUTHORITY_DOMAINS.low.some(lowDomain => 
        domain.includes(lowDomain)
      );
      if (isLowAuthority) {
        authorityScore -= 2.0;
      }
      
      // Verificar se é HTTPS
      if (article.url.startsWith('https://')) {
        authorityScore += 0.5;
      }
      
      // Verificar se tem subdomínio www
      if (domain.startsWith('www.')) {
        authorityScore += 0.3;
      }
      
    } catch (error) {
      // URL inválida
      authorityScore -= 1.0;
    }
    
    // Verificar indicadores de autoridade no conteúdo
    const authorityIndicators = ['pesquisa', 'estudo', 'universidade', 'professor', 'dr.', 'phd', 'research', 'study', 'university'];
    const content = `${article.title} ${article.description}`.toLowerCase();
    const authorityCount = authorityIndicators.filter(indicator => 
      content.includes(indicator)
    ).length;
    authorityScore += Math.min(authorityCount * 0.4, 1.5);
    
    return Math.max(0, Math.min(10, authorityScore));
  }

  /**
   * Gera análise detalhada do artigo
   */
  private generateAnalysis(article: ArticleForAnalysis, scores: any) {
    const emotions: string[] = [];
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const recommendations: string[] = [];

    // Analisar emoções
    if (scores.emotionScore >= 7) {
      emotions.push('alto impacto emocional');
      strengths.push('Conteúdo emocionalmente envolvente');
    } else if (scores.emotionScore >= 5) {
      emotions.push('impacto emocional moderado');
    } else {
      emotions.push('baixo impacto emocional');
      weaknesses.push('Falta de elementos emocionais');
      recommendations.push('Adicionar palavras mais impactantes');
    }

    // Analisar clareza
    if (scores.clarityScore >= 7) {
      strengths.push('Título claro e direto');
    } else {
      weaknesses.push('Título pode ser mais claro');
      recommendations.push('Simplificar linguagem do título');
    }

    // Analisar potencial de carrossel
    if (scores.carouselPotential >= 7) {
      strengths.push('Excelente para carrossel');
    } else {
      recommendations.push('Estruturar conteúdo em tópicos');
    }

    // Analisar tendência
    if (scores.trendScore >= 7) {
      strengths.push('Assunto em alta');
    } else {
      recommendations.push('Conectar com tendências atuais');
    }

    // Analisar autoridade
    if (scores.authorityScore >= 7) {
      strengths.push('Fonte confiável');
    } else {
      weaknesses.push('Fonte com baixa autoridade');
    }

    return {
      emotions,
      strengths,
      weaknesses,
      recommendations
    };
  }

  /**
   * Calcula scores para múltiplos artigos em lote
   */
  async calculateBatchViralScores(articles: ArticleForAnalysis[]): Promise<ViralScoreAnalysis[]> {
    console.log(`🧠 Calculando scores virais para ${articles.length} artigos...`);
    
    const results: ViralScoreAnalysis[] = [];
    
    // Processar em lotes para não sobrecarregar
    const batchSize = 5;
    for (let i = 0; i < articles.length; i += batchSize) {
      const batch = articles.slice(i, i + batchSize);
      
      const batchPromises = batch.map(article => this.calculateViralScore(article));
      const batchResults = await Promise.all(batchPromises);
      
      results.push(...batchResults);
      
      // Pequena pausa entre lotes
      if (i + batchSize < articles.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    console.log(`✅ ${results.length} scores calculados com sucesso`);
    return results;
  }
}

export const viralScoreService = new ViralScoreService();