import OpenAI from 'openai';
import { Article, CarouselCard } from '../store/useAppStore';
import { apiConfigService } from './apiConfigService';

interface CarouselPrompt {
  articles: Article[];
  style: 'modern' | 'minimal' | 'bold' | 'elegant';
  customPrompt?: string;
  cardCount?: number;
  language?: 'pt' | 'en' | 'es';
}

interface GeneratedCarouselContent {
  title: string;
  subtitle: string;
  description: string;
  cta?: string;
  colors: {
    primary: string;
    secondary: string;
    text: string;
    background: string;
  };
}

class OpenAIService {
  private openai: OpenAI | null = null;
  private apiKey: string | null = null;

  constructor() {
    // Tentar recuperar a API key do serviço de configuração
    const savedApiKey = apiConfigService.getConfig('openaiKey');
    if (savedApiKey) {
      this.setApiKey(savedApiKey);
    }
  }

  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
    this.openai = new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true // Para uso no frontend - em produção, usar backend
    });
    // Salvar no serviço de configuração
    apiConfigService.saveConfig({ openaiKey: apiKey });
  }

  getApiKey(): string | null {
    return this.apiKey;
  }

  isConfigured(): boolean {
    return !!this.openai && !!this.apiKey;
  }

  clearApiKey() {
    this.apiKey = null;
    this.openai = null;
    apiConfigService.clearConfig('openaiKey');
  }

  /**
   * Avalia o potencial de viralização de um artigo no Instagram usando GPT-4
   * @param title - Título do artigo
   * @param summary - Resumo/descrição do artigo
   * @param url - URL do artigo
   * @returns Score de 0 a 10 representando o potencial viral
   */
  async rateArticlePotential(title: string, summary: string, url: string): Promise<number> {
    if (!this.openai) {
      throw new Error('OpenAI não configurado. Configure sua API key primeiro.');
    }

    console.log(`🧠 Avaliando potencial viral: "${title}"`);

    try {
      const systemPrompt = `Você é um especialista em marketing digital e viralização de conteúdo no Instagram.

Sua tarefa é avaliar o potencial de viralização de um artigo no Instagram baseado em 4 critérios principais:

1. CLAREZA (0-10): Quão claro e compreensível é o título e conteúdo
2. EMOÇÃO (0-10): Capacidade de evocar emoções fortes (curiosidade, surpresa, inspiração, etc.)
3. TENDÊNCIA (0-10): Relevância com tópicos em alta e tendências atuais
4. ORIGINALIDADE (0-10): Quão único e diferenciado é o conteúdo

Analise cada critério e retorne APENAS UM NÚMERO de 0 a 10 (com uma casa decimal) representando o score geral.

Exemplos de scores:
- 9.5: Conteúdo extremamente viral (título impactante, emoção alta, super atual)
- 7.0: Bom potencial viral (interessante, claro, relevante)
- 5.0: Potencial médio (neutro, sem grandes destaques)
- 3.0: Baixo potencial (confuso, sem emoção, desatualizado)
- 1.0: Muito baixo potencial (irrelevante, mal escrito)

Responda APENAS com o número (ex: 7.3)`;

      const userPrompt = `Avalie o potencial de viralização no Instagram:

TÍTULO: ${title}

RESUMO: ${summary}

URL: ${url}

Considere:
- Clareza: O título é fácil de entender?
- Emoção: Desperta curiosidade, surpresa ou inspiração?
- Tendência: É sobre algo atual e relevante?
- Originalidade: Traz uma perspectiva única?

Retorne apenas o score de 0 a 10:`;

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 10
      });

      const response = completion.choices[0]?.message?.content?.trim();
      
      if (!response) {
        throw new Error('Resposta vazia da OpenAI');
      }

      console.log(`🤖 Resposta da OpenAI: "${response}"`);

      // Extrair o número da resposta
      const scoreMatch = response.match(/(\d+\.?\d*)/);
      if (!scoreMatch) {
        throw new Error('Score não encontrado na resposta');
      }

      const score = parseFloat(scoreMatch[1]);
      
      // Validar se o score está no range correto
      if (isNaN(score) || score < 0 || score > 10) {
        throw new Error(`Score inválido: ${score}`);
      }

      console.log(`✅ Score de potencial viral: ${score}/10 para "${title}"`);
      return Math.round(score * 10) / 10; // Arredondar para 1 casa decimal

    } catch (error) {
      console.error('❌ Erro na avaliação de potencial viral:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('API key')) {
          throw new Error('API key inválida. Verifique sua chave da OpenAI.');
        }
        if (error.message.includes('quota')) {
          throw new Error('Cota da OpenAI excedida. Verifique seu plano.');
        }
        if (error.message.includes('rate limit')) {
          throw new Error('Limite de requisições excedido. Tente novamente em alguns segundos.');
        }
      }
      
      // Em caso de erro, retornar score neutro
      console.log('🔄 Retornando score neutro devido ao erro');
      return 5.0;
    }
  }

  async generateCarouselCards({ articles, style, customPrompt, cardCount = 5, language = 'pt' }: CarouselPrompt): Promise<CarouselCard[]> {
    if (!this.openai) {
      throw new Error('OpenAI não configurado. Configure sua API key primeiro.');
    }

    // Garantir que não tentamos gerar mais cards do que artigos disponíveis
    const actualCardCount = Math.min(cardCount, articles.length);
    const selectedArticles = articles.slice(0, actualCardCount);

    console.log(`🧠 OpenAI: Gerando ${actualCardCount} cards para ${selectedArticles.length} artigos`);

    try {
      const styleGuides = {
        modern: {
          description: 'Design moderno com gradientes, cantos arredondados e tipografia limpa',
          colors: ['#1500FF', '#6366F1', '#8B5CF6', '#A855F7'],
          background: '#111111'
        },
        minimal: {
          description: 'Design minimalista com muito espaço em branco, tipografia elegante e cores neutras',
          colors: ['#000000', '#374151', '#6B7280', '#9CA3AF'],
          background: '#FFFFFF'
        },
        bold: {
          description: 'Design ousado com cores vibrantes, contrastes fortes e tipografia impactante',
          colors: ['#EF4444', '#F97316', '#EAB308', '#22C55E'],
          background: '#000000'
        },
        elegant: {
          description: 'Design elegante com cores sofisticadas, tipografia refinada e elementos dourados',
          colors: ['#1F2937', '#374151', '#D4A574', '#F3E8D0'],
          background: '#F9FAFB'
        }
      };

      const languageInstructions = {
        pt: 'em português brasileiro, tom conversacional e próximo',
        en: 'in American English, professional and engaging tone',
        es: 'en español neutro, tono profesional y cercano'
      };

      const styleGuide = styleGuides[style];
      const langInstruction = languageInstructions[language];

      const systemPrompt = `Você é um designer especialista em criação de carrosséis para redes sociais e apresentações.
      
Estilo escolhido: ${style}
Características do estilo: ${styleGuide.description}
Paleta de cores: ${styleGuide.colors.join(', ')}
Cor de fundo: ${styleGuide.background}
Idioma: ${langInstruction}
Quantidade de cards: ${actualCardCount}

Sua tarefa é gerar conteúdo otimizado para carrosséis baseado nos artigos fornecidos.
O conteúdo deve ser ${langInstruction}.

IMPORTANTE: Você deve gerar EXATAMENTE ${actualCardCount} cards, um para cada artigo fornecido.`;

      const userPrompt = `Com base nos seguintes ${selectedArticles.length} artigos, crie conteúdo para EXATAMENTE ${actualCardCount} cards de carrossel no estilo ${style} ${langInstruction}:

${selectedArticles.map((article, index) => `
ARTIGO ${index + 1}:
Título: ${article.title}
Descrição: ${article.description}
Fonte: ${article.source}
Keywords: ${article.keywords.join(', ')}
URL da Imagem: ${article.imageUrl}
`).join('\n')}

${customPrompt ? `\nRequisitos adicionais: ${customPrompt}` : ''}

IMPORTANTE: 
- O conteúdo deve ser ${langInstruction}
- Gere EXATAMENTE ${actualCardCount} cards
- Cada card deve corresponder a um artigo na ordem fornecida
- Mantenha os títulos chamativos mas informativos
- Use cores que combinem com o estilo ${style}

Para cada card, retorne um JSON com esta estrutura:
{
  "title": "Título chamativo e envolvente (máximo 60 caracteres)",
  "subtitle": "Subtítulo explicativo (máximo 80 caracteres)",
  "description": "Descrição detalhada e persuasiva (máximo 150 caracteres)",
  "cta": "Call-to-action opcional",
  "colors": {
    "primary": "cor primária hex",
    "secondary": "cor secundária hex", 
    "text": "cor do texto hex",
    "background": "cor de fundo hex"
  }
}

Retorne um array JSON com EXATAMENTE ${actualCardCount} objetos, um para cada artigo na ordem fornecida.
Certifique-se de que TODO o conteúdo esteja ${langInstruction}.

Responda APENAS com o array JSON, sem texto adicional.`;

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.8,
        max_tokens: 3000
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('Resposta vazia da OpenAI');
      }

      console.log('🤖 Resposta da OpenAI:', response);

      // Tentar extrair JSON da resposta
      let generatedContent: GeneratedCarouselContent[];
      try {
        // Buscar por JSON na resposta
        const jsonMatch = response.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          generatedContent = JSON.parse(jsonMatch[0]);
        } else {
          // Tentar parsear a resposta inteira
          generatedContent = JSON.parse(response);
        }

        // Verificar se temos o número correto de cards
        if (!Array.isArray(generatedContent) || generatedContent.length !== actualCardCount) {
          console.warn(`⚠️ OpenAI retornou ${generatedContent?.length || 0} cards, esperado ${actualCardCount}`);
          throw new Error('Número incorreto de cards gerados');
        }

      } catch (parseError) {
        console.error('❌ Erro ao parsear JSON da OpenAI:', parseError);
        console.log('📝 Resposta original:', response);
        // Fallback para conteúdo gerado automaticamente
        generatedContent = this.generateFallbackContent(selectedArticles, style, language);
      }

      // Converter para CarouselCard
      const carouselCards: CarouselCard[] = selectedArticles.map((article, index) => {
        const content = generatedContent[index] || this.generateFallbackContent([article], style, language)[0];
        
        return {
          id: `ai-card-${Date.now()}-${index}`,
          title: content.title || article.title,
          subtitle: content.subtitle || `${article.source} • ${new Date(article.publishDate).toLocaleDateString(language === 'pt' ? 'pt-BR' : language === 'en' ? 'en-US' : 'es-ES')}`,
          description: content.description || article.description,
          imageUrl: article.imageUrl,
          style: style,
          colors: content.colors || this.getDefaultColors(style)
        };
      });

      console.log(`✅ OpenAI: ${carouselCards.length} cards gerados com sucesso`);
      return carouselCards;

    } catch (error) {
      console.error('❌ Erro na geração com OpenAI:', error);
      
      if (error instanceof Error && error.message.includes('API key')) {
        throw new Error('API key inválida. Verifique sua chave da OpenAI.');
      }
      
      // Em caso de erro, gerar fallback
      console.log('🔄 Usando fallback devido ao erro da OpenAI');
      return this.generateFallbackCards(selectedArticles, style, language);
    }
  }

  private generateFallbackCards(articles: Article[], style: string, language: 'pt' | 'en' | 'es'): CarouselCard[] {
    console.log(`🔄 Gerando ${articles.length} cards fallback`);
    
    const fallbackContent = this.generateFallbackContent(articles, style, language);
    
    return articles.map((article, index) => ({
      id: `fallback-card-${Date.now()}-${index}`,
      title: fallbackContent[index].title,
      subtitle: fallbackContent[index].subtitle,
      description: fallbackContent[index].description,
      imageUrl: article.imageUrl,
      style: style as any,
      colors: fallbackContent[index].colors
    }));
  }

  private generateFallbackContent(articles: Article[], style: string, language: 'pt' | 'en' | 'es'): GeneratedCarouselContent[] {
    const templates = {
      pt: {
        titleTemplates: [
          'Descubra: {keyword}',
          '{keyword} em Destaque',
          'Tendência: {keyword}',
          'Novidade: {keyword}',
          '{keyword} Revoluciona'
        ],
        subtitleTemplates: [
          '{source} • Tendência',
          'Análise Exclusiva • {source}',
          'Insights • {date}',
          '{source} • Destaque',
          'Reportagem • {source}'
        ],
        descriptionTemplates: [
          'Análise completa sobre {keyword} e seu impacto no mercado atual.',
          'Descubra as principais insights desta nova tendência em destaque.',
          'Entenda como {keyword} está transformando o setor.',
          'Guia completo com tudo sobre esta tendência emergente.',
          'Análise detalhada dos fatores que tornam isto tão relevante.'
        ]
      },
      en: {
        titleTemplates: [
          'Discover: {keyword}',
          '{keyword} Spotlight',
          'Trending: {keyword}',
          'Breaking: {keyword}',
          '{keyword} Revolution'
        ],
        subtitleTemplates: [
          '{source} • Trending',
          'Exclusive Analysis • {source}',
          'Insights • {date}',
          '{source} • Featured',
          'Report • {source}'
        ],
        descriptionTemplates: [
          'Complete analysis of {keyword} and its market impact.',
          'Discover key insights from this trending topic.',
          'Understand how {keyword} is transforming the industry.',
          'Complete guide about this emerging trend.',
          'Detailed analysis of factors making this so relevant.'
        ]
      },
      es: {
        titleTemplates: [
          'Descubre: {keyword}',
          '{keyword} en Foco',
          'Tendencia: {keyword}',
          'Novedad: {keyword}',
          '{keyword} Revolución'
        ],
        subtitleTemplates: [
          '{source} • Tendencia',
          'Análisis Exclusivo • {source}',
          'Insights • {date}',
          '{source} • Destacado',
          'Reportaje • {source}'
        ],
        descriptionTemplates: [
          'Análisis completo sobre {keyword} y su impacto en el mercado.',
          'Descubre las principales insights de esta tendencia destacada.',
          'Entiende cómo {keyword} está transformando el sector.',
          'Guía completa sobre esta tendencia emergente.',
          'Análisis detallado de los factores que hacen esto tan relevante.'
        ]
      }
    };

    const template = templates[language];

    return articles.map((article, index) => {
      const keyword = article.keywords[0] || article.title.split(' ')[0];
      const date = new Date(article.publishDate).toLocaleDateString(
        language === 'pt' ? 'pt-BR' : language === 'en' ? 'en-US' : 'es-ES'
      );

      const titleTemplate = template.titleTemplates[index % template.titleTemplates.length];
      const subtitleTemplate = template.subtitleTemplates[index % template.subtitleTemplates.length];
      const descriptionTemplate = template.descriptionTemplates[index % template.descriptionTemplates.length];

      return {
        title: titleTemplate.replace('{keyword}', keyword).substring(0, 60),
        subtitle: subtitleTemplate.replace('{source}', article.source).replace('{date}', date).substring(0, 80),
        description: descriptionTemplate.replace('{keyword}', keyword).substring(0, 150),
        colors: this.getDefaultColors(style)
      };
    });
  }

  private getDefaultColors(style: string) {
    const colorSchemes = {
      modern: {
        primary: '#1500FF',
        secondary: '#6366F1',
        text: '#FFFFFF',
        background: '#111111'
      },
      minimal: {
        primary: '#000000',
        secondary: '#6B7280',
        text: '#1F2937',
        background: '#FFFFFF'
      },
      bold: {
        primary: '#EF4444',
        secondary: '#F97316',
        text: '#FFFFFF',
        background: '#000000'
      },
      elegant: {
        primary: '#1F2937',
        secondary: '#D4A574',
        text: '#374151',
        background: '#F9FAFB'
      }
    };

    return colorSchemes[style as keyof typeof colorSchemes] || colorSchemes.modern;
  }

  async testConnection(): Promise<boolean> {
    if (!this.openai) return false;

    try {
      await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'Test' }],
        max_tokens: 5
      });
      return true;
    } catch {
      return false;
    }
  }
}

export const openAIService = new OpenAIService();