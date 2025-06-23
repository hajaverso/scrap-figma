import { create } from 'zustand';
import { scrapingService } from '../services/scrapingService';
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
  activeTab: 'dashboard' | 'scraping' | 'carousel' | 'preview' | 'editor';
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
  
  setActiveTab: (tab: 'dashboard' | 'scraping' | 'carousel' | 'preview' | 'editor') => void;
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
      console.log(`🔍 Iniciando scraping para: "${searchKeyword}"`);
      
      const scrapedArticles = await scrapingService.scrapeTrends(searchKeyword);
      
      if (scrapedArticles.length === 0) {
        throw new Error('Nenhum artigo encontrado para esta palavra-chave');
      }
      
      console.log(`✅ Encontrados ${scrapedArticles.length} artigos`);
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
          : 'Erro ao realizar scraping. Verifique sua conexão e tente novamente.',
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
        
        const styleOptions = ['modern', 'minimal', 'bold', 'elegant'] as const;
        const colorPalettes = [
          { primary: '#1500FF', secondary: '#111111', text: '#FFFFFF', background: '#000000' },
          { primary: '#FF6B6B', secondary: '#4ECDC4', text: '#FFFFFF', background: '#1A1A1A' },
          { primary: '#4ECDC4', secondary: '#45B7D1', text: '#FFFFFF', background: '#0F0F0F' },
          { primary: '#96CEB4', secondary: '#FFEAA7', text: '#2D3436', background: '#FFFFFF' },
          { primary: '#6C5CE7', secondary: '#A29BFE', text: '#FFFFFF', background: '#2D3436' }
        ];
        
        generatedCards = selectedArticles.slice(0, cardCount).map((article, index) => ({
          id: `card-${Date.now()}-${index}`,
          title: article.title,
          subtitle: `${article.source} • ${new Date(article.publishDate).toLocaleDateString(language === 'pt' ? 'pt-BR' : language === 'en' ? 'en-US' : 'es-ES')}`,
          description: article.description,
          imageUrl: article.imageUrl,
          style: style,
          colors: colorPalettes[index % colorPalettes.length]
        }));
      }
      
      get().addGeneratedCarousel(generatedCards);
      set({ 
        isGeneratingCarousel: false,
        currentEditingCarousel: generatedCards,
        activeTab: 'editor' // Automaticamente vai para o editor
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