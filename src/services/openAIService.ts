import OpenAI from 'openai';
import { Article, CarouselCard } from '../store/useAppStore';

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
    // Tentar recuperar a API key do localStorage
    const savedApiKey = localStorage.getItem('openai_api_key');
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
    localStorage.setItem('openai_api_key', apiKey);
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
    localStorage.removeItem('openai_api_key');
  }

  async generateCarouselCards({ articles, style, customPrompt, cardCount = 5, language = 'pt' }: CarouselPrompt): Promise<CarouselCard[]> {
    if (!this.openai) {
      throw new Error('OpenAI não configurado. Configure sua API key primeiro.');
    }

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
Quantidade de cards: ${cardCount}

Sua tarefa é gerar conteúdo otimizado para carrosséis baseado nos artigos fornecidos.
O conteúdo deve ser ${langInstruction}.`;

      const userPrompt = `Com base nos seguintes artigos, crie conteúdo para ${cardCount} cards de carrossel no estilo ${style} ${langInstruction}:

${articles.slice(0, cardCount).map((article, index) => `
ARTIGO ${index + 1}:
Título: ${article.title}
Descrição: ${article.description}
Fonte: ${article.source}
Keywords: ${article.keywords.join(', ')}
`).join('\n')}

${customPrompt ? `\nRequisitos adicionais: ${customPrompt}` : ''}

IMPORTANTE: O conteúdo deve ser ${langInstruction}.

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

Retorne um array JSON com ${cardCount} objetos, um para cada artigo na ordem fornecida.
Certifique-se de que TODO o conteúdo esteja ${langInstruction}.`;

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.8,
        max_tokens: 2000
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('Resposta vazia da OpenAI');
      }

      // Tentar extrair JSON da resposta
      let generatedContent: GeneratedCarouselContent[];
      try {
        // Buscar por JSON na resposta
        const jsonMatch = response.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          generatedContent = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('JSON não encontrado na resposta');
        }
      } catch (parseError) {
        console.error('Erro ao parsear JSON:', parseError);
        // Fallback para conteúdo gerado automaticamente
        generatedContent = this.generateFallbackContent(articles.slice(0, cardCount), style, language);
      }

      // Converter para CarouselCard
      const carouselCards: CarouselCard[] = articles.slice(0, cardCount).map((article, index) => ({
        id: `ai-card-${Date.now()}-${index}`,
        title: generatedContent[index]?.title || article.title,
        subtitle: generatedContent[index]?.subtitle || `${article.source} • ${new Date(article.publishDate).toLocaleDateString(language === 'pt' ? 'pt-BR' : language === 'en' ? 'en-US' : 'es-ES')}`,
        description: generatedContent[index]?.description || article.description,
        imageUrl: article.imageUrl,
        style: style,
        colors: generatedContent[index]?.colors || this.getDefaultColors(style)
      }));

      return carouselCards;

    } catch (error) {
      console.error('Erro na geração com OpenAI:', error);
      
      if (error instanceof Error && error.message.includes('API key')) {
        throw new Error('API key inválida. Verifique sua chave da OpenAI.');
      }
      
      throw new Error('Erro ao gerar carrossel com IA. Tente novamente.');
    }
  }

  private generateFallbackContent(articles: Article[], style: string, language: 'pt' | 'en' | 'es'): GeneratedCarouselContent[] {
    const templates = {
      pt: {
        subtitle: 'Tendência em destaque',
        titleSuffix: 'em Foco'
      },
      en: {
        subtitle: 'Trending now',
        titleSuffix: 'Spotlight'
      },
      es: {
        subtitle: 'Tendencia destacada',
        titleSuffix: 'en Foco'
      }
    };

    const template = templates[language];

    return articles.map(article => ({
      title: article.title.length > 60 ? article.title.substring(0, 57) + '...' : article.title,
      subtitle: `${article.source} • ${template.subtitle}`,
      description: article.description.length > 150 ? article.description.substring(0, 147) + '...' : article.description,
      colors: this.getDefaultColors(style)
    }));
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