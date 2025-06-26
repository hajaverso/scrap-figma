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
  startScraping: () => void;
  setScrapingError: (error: string | null) => void;
  
  generateCarousel: (prompt: string, style?: 'modern' | 'minimal' | 'bold' | 'elegant', useAI?: boolean, cardCount?: number, language?: 'pt' | 'en' | 'es') => void;
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
      console.log(`🔍 Iniciando scraping profissional com Apify para: "${searchKeyword}"`);
      
      // Usar Apify para scraping profissional
      const trends = await apifyService.scrapeTrends([searchKeyword]);
      const scrapedArticles = trends.flatMap(trend => trend.articles);
      
      if (scrapedArticles.length === 0) {
        throw new Error('Nenhum artigo encontrado para esta palavra-chave');
      }
      
      console.log(`✅ Encontrados ${scrapedArticles.length} artigos via Apify`);
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
          : 'Erro no scraping profissional. Verifique sua conexão e tente novamente.',
        isScrapingLoading: false,
        articles: []
      });
    }
  },
  
  setScrapingError: (error) => set({ scrapingError: error }),
  
  generateCarousel: async (prompt, style = 'modern', useAI = false, cardCount = 5, language = 'pt') => {
    const { selectedArticles } = get();
    if (selectedArticles.length === 0) return;
    
    set({ isGeneratingCarousel: true, generationError: null });
    
    try {
      console.log(`🎨 Gerando carrossel com ${cardCount} cards`);
      console.log(`🎯 Estilo: ${style}, IA: ${useAI ? 'Habilitada' : 'Desabilitada'}, Idioma: ${language}`);
      
      let generatedCards: CarouselCard[];

      if (useAI && openAIService.isConfigured()) {
        // Geração com IA
        console.log('🧠 Usando OpenAI para geração inteligente...');
        generatedCards = await openAIService.generateCarouselCards({
          articles: selectedArticles.slice(0, cardCount),
          style,
          customPrompt: prompt,
          cardCount,
          language
        });
      } else {
        // Geração básica
        console.log('⚡ Usando geração básica...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const colorPalettes = [
          { primary: '#1500FF', secondary: '#6366F1', text: '#FFFFFF', background: '#111111' },
          { primary: '#EF4444', secondary: '#F97316', text: '#FFFFFF', background: '#1A1A1A' },
          { primary: '#22C55E', secondary: '#10B981', text: '#FFFFFF', background: '#0F172A' },
          { primary: '#8B5CF6', secondary: '#A855F7', text: '#FFFFFF', background: '#1F1B2E' },
          { primary: '#F59E0B', secondary: '#D97706', text: '#1F2937', background: '#FEF3C7' },
          { primary: '#06B6D4', secondary: '#0891B2', text: '#FFFFFF', background: '#0C4A6E' },
          { primary: '#EC4899', secondary: '#DB2777', text: '#FFFFFF', background: '#831843' },
          { primary: '#84CC16', secondary: '#65A30D', text: '#1F2937', background: '#F7FEE7' },
          { primary: '#6366F1', secondary: '#4F46E5', text: '#FFFFFF', background: '#1E1B4B' },
          { primary: '#DC2626', secondary: '#B91C1C', text: '#FFFFFF', background: '#450A0A' }
        ];
        
        generatedCards = selectedArticles.slice(0, cardCount).map((article, index) => {
          const palette = colorPalettes[index % colorPalettes.length];
          const cardId = `card-${Date.now()}-${index}`;
          
          return {
            id: cardId,
            title: article.title.length > 60 ? article.title.substring(0, 57) + '...' : article.title,
            subtitle: `${article.source} • ${new Date(article.publishDate).toLocaleDateString(language === 'pt' ? 'pt-BR' : language === 'en' ? 'en-US' : 'es-ES')}`,
            description: article.description.length > 150 ? article.description.substring(0, 147) + '...' : article.description,
            imageUrl: article.imageUrl,
            style: style,
            colors: palette
          };
        });
      }
      
      get().addGeneratedCarousel(generatedCards);
      set({ 
        isGeneratingCarousel: false,
        currentEditingCarousel: generatedCards,
        activeTab: 'editor' // Ir direto para o editor
      });
      
      console.log(`✅ Carrossel gerado com sucesso! (${useAI ? 'com IA' : 'básico'})`);
      
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