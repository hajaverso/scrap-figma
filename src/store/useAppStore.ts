import { create } from 'zustand';
import { apifyService } from '../services/apifyService';
import { openAIService } from '../services/openAIService';

export interface Article {
  id: string;
  title: string;
  description: string;
  url: string;
  imageUrl: string;
  publishDate: string;
  source: string;
  keywords: string[];
  fullContent?: string; // Novo campo para conteúdo completo
  engagement?: number; // Métricas de engajamento
  sentiment?: number; // Análise de sentimento (0-1)
}

export interface CarouselCard {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  imageUrl: string;
  style: 'modern' | 'minimal' | 'bold' | 'elegant';
  colors: {
    primary: string;
    secondary: string;
    text: string;
    background: string;
  };
}

interface AppState {
  // Scraping State
  searchKeyword: string;
  articles: Article[];
  selectedArticles: Article[];
  isScrapingLoading: boolean;
  scrapingError: string | null;
  
  // Carousel State
  carouselCards: CarouselCard[];
  generatedCarousels: CarouselCard[][];
  currentEditingCarousel: CarouselCard[] | null;
  isGeneratingCarousel: boolean;
  generationError: string | null;
  
  // UI State
  activeTab: 'dashboard' | 'scraping' | 'carousel' | 'editor' | 'preview';
  sidebarOpen: boolean;
  
  // Actions
  setSearchKeyword: (keyword: string) => void;
  setArticles: (articles: Article[]) => void;
  toggleArticleSelection: (article: Article) => void;
  clearSelectedArticles: () => void;
  startScraping: () => Promise<void>;
  setScrapingError: (error: string | null) => void;
  
  generateCarousel: (prompt: string, style?: 'modern' | 'minimal' | 'bold' | 'elegant', useAI?: boolean, cardCount?: number, language?: 'pt' | 'en' | 'es') => Promise<void>;
  setCarouselCards: (cards: CarouselCard[]) => void;
  addGeneratedCarousel: (carousel: CarouselCard[]) => void;
  setCurrentEditingCarousel: (carousel: CarouselCard[] | null) => void;
  updateCarouselCard: (index: number, updatedCard: CarouselCard) => void;
  
  setActiveTab: (tab: 'dashboard' | 'scraping' | 'carousel' | 'editor' | 'preview') => void;
  toggleSidebar: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial State
  searchKeyword: '',
  articles: [],
  selectedArticles: [],
  isScrapingLoading: false,
  scrapingError: null,
  
  carouselCards: [],
  generatedCarousels: [],
  currentEditingCarousel: null,
  isGeneratingCarousel: false,
  generationError: null,
  
  activeTab: 'dashboard',
  sidebarOpen: true,
  
  // Actions
  setSearchKeyword: (keyword) => set({ searchKeyword: keyword }),
  
  setArticles: (articles) => set({ articles }),
  
  toggleArticleSelection: (article) => {
    const { selectedArticles } = get();
    const isSelected = selectedArticles.some(a => a.id === article.id);
    
    if (isSelected) {
      set({
        selectedArticles: selectedArticles.filter(a => a.id !== article.id)
      });
    } else {
      set({
        selectedArticles: [...selectedArticles, article]
      });
    }
  },
  
  clearSelectedArticles: () => set({ selectedArticles: [] }),
  
  startScraping: async () => {
    const { searchKeyword } = get();
    if (!searchKeyword.trim()) return;
    
    set({ isScrapingLoading: true, scrapingError: null, articles: [] });
    
    try {
      console.log(`🔍 Iniciando scraping avançado com Apify para: "${searchKeyword}"`);
      
      // Configuração padrão para scraping básico
      const config = {
        keywords: [searchKeyword],
        timeRange: '7d' as const,
        analysisDepth: 'detailed' as const,
        includeFullContent: true,
        sourcePriority: 'all' as const,
        minEngagement: 10,
        maxArticlesPerSource: 20
      };
      
      const trends = await apifyService.scrapeAdvancedTrends(config);
      const scrapedArticles = trends.flatMap(trend => trend.articles);
      
      if (scrapedArticles.length === 0) {
        throw new Error('Nenhum artigo encontrado para esta palavra-chave');
      }
      
      console.log(`✅ Encontrados ${scrapedArticles.length} artigos com análise avançada`);
      set({ 
        articles: scrapedArticles, 
        isScrapingLoading: false,
        scrapingError: null 
      });
      
    } catch (error) {
      console.error('❌ Erro no scraping:', error);
      set({ 
        scrapingError: error instanceof Error 
          ? error.message 
          : 'Erro no scraping avançado. Verifique sua conexão e tente novamente.',
        isScrapingLoading: false,
        articles: []
      });
    }
  },
  
  setScrapingError: (error) => set({ scrapingError: error }),
  
  generateCarousel: async (prompt, style = 'modern', useAI = false, cardCount = 5, language = 'pt') => {
    const { selectedArticles } = get();
    if (selectedArticles.length === 0) {
      set({ generationError: 'Nenhum artigo selecionado' });
      return;
    }
    
    set({ isGeneratingCarousel: true, generationError: null });
    
    try {
      // Garantir que não tentamos gerar mais cards do que artigos disponíveis
      const actualCardCount = Math.min(cardCount, selectedArticles.length);
      
      console.log(`🎨 Gerando carrossel com ${actualCardCount} cards`);
      console.log(`🎯 Estilo: ${style}, IA: ${useAI ? 'Habilitada' : 'Desabilitada'}, Idioma: ${language}`);
      console.log(`📚 Artigos selecionados: ${selectedArticles.length}`);
      
      let generatedCards: CarouselCard[];

      if (useAI && openAIService.isConfigured()) {
        // Geração com IA
        console.log('🧠 Usando OpenAI para geração inteligente...');
        generatedCards = await openAIService.generateCarouselCards({
          articles: selectedArticles.slice(0, actualCardCount),
          style,
          customPrompt: prompt,
          cardCount: actualCardCount,
          language
        });
      } else {
        // Geração básica melhorada
        console.log('⚡ Usando geração básica...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const colorPalettes = {
          modern: [
            { primary: '#1500FF', secondary: '#6366F1', text: '#FFFFFF', background: '#111111' },
            { primary: '#8B5CF6', secondary: '#A855F7', text: '#FFFFFF', background: '#1F1B2E' },
            { primary: '#06B6D4', secondary: '#0891B2', text: '#FFFFFF', background: '#0C4A6E' },
            { primary: '#EC4899', secondary: '#DB2777', text: '#FFFFFF', background: '#831843' },
            { primary: '#F59E0B', secondary: '#D97706', text: '#FFFFFF', background: '#451A03' }
          ],
          minimal: [
            { primary: '#000000', secondary: '#374151', text: '#1F2937', background: '#FFFFFF' },
            { primary: '#374151', secondary: '#6B7280', text: '#1F2937', background: '#F9FAFB' },
            { primary: '#1F2937', secondary: '#4B5563', text: '#111827', background: '#F3F4F6' },
            { primary: '#6B7280', secondary: '#9CA3AF', text: '#374151', background: '#FFFFFF' },
            { primary: '#111827', secondary: '#1F2937', text: '#374151', background: '#F9FAFB' }
          ],
          bold: [
            { primary: '#EF4444', secondary: '#F97316', text: '#FFFFFF', background: '#000000' },
            { primary: '#DC2626', secondary: '#EA580C', text: '#FFFFFF', background: '#1A1A1A' },
            { primary: '#B91C1C', secondary: '#C2410C', text: '#FFFFFF', background: '#0A0A0A' },
            { primary: '#991B1B', secondary: '#9A3412', text: '#FFFFFF', background: '#1F1F1F' },
            { primary: '#7F1D1D', secondary: '#7C2D12', text: '#FFFFFF', background: '#111111' }
          ],
          elegant: [
            { primary: '#1F2937', secondary: '#D4A574', text: '#374151', background: '#F9FAFB' },
            { primary: '#374151', secondary: '#F3E8D0', text: '#1F2937', background: '#FEFEFE' },
            { primary: '#4B5563', secondary: '#E5D5B7', text: '#1F2937', background: '#F8F9FA' },
            { primary: '#6B7280', secondary: '#D6C7A8', text: '#374151', background: '#FFFFFF' },
            { primary: '#9CA3AF', secondary: '#C8B99C', text: '#4B5563', background: '#F9FAFB' }
          ]
        };

        const stylePalettes = colorPalettes[style];
        
        // Gerar títulos e descrições personalizados baseados no prompt e idioma
        const generateContent = (article: Article, index: number) => {
          const templates = {
            pt: {
              titles: [
                `${article.title.split(' ').slice(0, 4).join(' ')}`,
                `Descubra: ${article.title.split(' ').slice(0, 3).join(' ')}`,
                `Tendência: ${article.title.split(' ').slice(0, 3).join(' ')}`,
                `Novidade: ${article.title.split(' ').slice(0, 3).join(' ')}`,
                `${article.title.split(' ').slice(0, 4).join(' ')} em Foco`
              ],
              subtitles: [
                `${article.source} • Tendência`,
                `Análise Exclusiva • ${article.source}`,
                `Insights • ${new Date(article.publishDate).toLocaleDateString('pt-BR')}`,
                `${article.source} • Destaque`,
                `Reportagem • ${article.source}`
              ],
              descriptions: [
                `Análise completa sobre ${article.keywords[0] || 'esta tendência'} e seu impacto no mercado atual.`,
                `Descubra as principais insights e oportunidades desta nova tendência em destaque.`,
                `Entenda como ${article.keywords[0] || 'esta inovação'} está transformando o setor.`,
                `Guia completo com tudo que você precisa saber sobre esta tendência emergente.`,
                `Análise detalhada dos fatores que tornam esta tendência tão relevante hoje.`
              ]
            },
            en: {
              titles: [
                `${article.title.split(' ').slice(0, 4).join(' ')}`,
                `Discover: ${article.title.split(' ').slice(0, 3).join(' ')}`,
                `Trending: ${article.title.split(' ').slice(0, 3).join(' ')}`,
                `Breaking: ${article.title.split(' ').slice(0, 3).join(' ')}`,
                `${article.title.split(' ').slice(0, 4).join(' ')} Spotlight`
              ],
              subtitles: [
                `${article.source} • Trending`,
                `Exclusive Analysis • ${article.source}`,
                `Insights • ${new Date(article.publishDate).toLocaleDateString('en-US')}`,
                `${article.source} • Featured`,
                `Report • ${article.source}`
              ],
              descriptions: [
                `Complete analysis of ${article.keywords[0] || 'this trend'} and its market impact.`,
                `Discover key insights and opportunities from this trending topic.`,
                `Understand how ${article.keywords[0] || 'this innovation'} is transforming the industry.`,
                `Complete guide with everything you need to know about this emerging trend.`,
                `Detailed analysis of factors making this trend so relevant today.`
              ]
            },
            es: {
              titles: [
                `${article.title.split(' ').slice(0, 4).join(' ')}`,
                `Descubre: ${article.title.split(' ').slice(0, 3).join(' ')}`,
                `Tendencia: ${article.title.split(' ').slice(0, 3).join(' ')}`,
                `Novedad: ${article.title.split(' ').slice(0, 3).join(' ')}`,
                `${article.title.split(' ').slice(0, 4).join(' ')} en Foco`
              ],
              subtitles: [
                `${article.source} • Tendencia`,
                `Análisis Exclusivo • ${article.source}`,
                `Insights • ${new Date(article.publishDate).toLocaleDateString('es-ES')}`,
                `${article.source} • Destacado`,
                `Reportaje • ${article.source}`
              ],
              descriptions: [
                `Análisis completo sobre ${article.keywords[0] || 'esta tendencia'} y su impacto en el mercado.`,
                `Descubre las principales insights y oportunidades de esta tendencia destacada.`,
                `Entiende cómo ${article.keywords[0] || 'esta innovación'} está transformando el sector.`,
                `Guía completa con todo lo que necesitas saber sobre esta tendencia emergente.`,
                `Análisis detallado de los factores que hacen esta tendencia tan relevante hoy.`
              ]
            }
          };

          const langTemplates = templates[language];
          
          return {
            title: langTemplates.titles[index % langTemplates.titles.length],
            subtitle: langTemplates.subtitles[index % langTemplates.subtitles.length],
            description: langTemplates.descriptions[index % langTemplates.descriptions.length]
          };
        };
        
        generatedCards = selectedArticles.slice(0, actualCardCount).map((article, index) => {
          const palette = stylePalettes[index % stylePalettes.length];
          const content = generateContent(article, index);
          const cardId = `card-${Date.now()}-${index}`;
          
          return {
            id: cardId,
            title: content.title.length > 60 ? content.title.substring(0, 57) + '...' : content.title,
            subtitle: content.subtitle,
            description: content.description.length > 150 ? content.description.substring(0, 147) + '...' : content.description,
            imageUrl: article.imageUrl,
            style: style,
            colors: palette
          };
        });
      }
      
      console.log(`✅ Carrossel gerado com ${generatedCards.length} cards!`);
      
      get().addGeneratedCarousel(generatedCards);
      set({ 
        isGeneratingCarousel: false,
        currentEditingCarousel: generatedCards,
        generationError: null
      });
      
    } catch (error) {
      console.error('❌ Erro na geração:', error);
      set({ 
        generationError: error instanceof Error 
          ? error.message 
          : 'Erro ao gerar carrossel. Tente novamente.',
        isGeneratingCarousel: false 
      });
    }
  },
  
  setCarouselCards: (cards) => set({ carouselCards: cards }),
  
  addGeneratedCarousel: (carousel) => {
    const { generatedCarousels } = get();
    set({ generatedCarousels: [...generatedCarousels, carousel] });
  },
  
  setCurrentEditingCarousel: (carousel) => set({ currentEditingCarousel: carousel }),
  
  updateCarouselCard: (index, updatedCard) => {
    const { currentEditingCarousel } = get();
    if (!currentEditingCarousel) return;
    
    const updatedCarousel = [...currentEditingCarousel];
    updatedCarousel[index] = updatedCard;
    
    set({ currentEditingCarousel: updatedCarousel });
    
    // Também atualizar na lista de carrosséis gerados
    const { generatedCarousels } = get();
    const carouselIndex = generatedCarousels.findIndex(carousel => 
      carousel.length === currentEditingCarousel.length &&
      carousel[0]?.id === currentEditingCarousel[0]?.id
    );
    
    if (carouselIndex !== -1) {
      const updatedCarousels = [...generatedCarousels];
      updatedCarousels[carouselIndex] = updatedCarousel;
      set({ generatedCarousels: updatedCarousels });
    }
  },
  
  setActiveTab: (tab) => set({ activeTab: tab }),
  toggleSidebar: () => set(state => ({ sidebarOpen: !state.sidebarOpen }))
}));