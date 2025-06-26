import { create } from 'zustand';

export interface SelectedArticle {
  title: string;
  text: string;
  images: string[];
  videos: string[];
  url?: string;
  extractedAt?: string;
}

export interface CarouselSlide {
  id: string;
  title: string;
  content: string;
  image?: string;
  backgroundColor: string;
  textColor: string;
  order: number;
}

export interface GenerationOptions {
  tone?: string;
  mandatoryKeywords?: string;
  slideCount?: number;
  extraInstructions?: string;
}

interface IAGeneratorState {
  selectedArticle: SelectedArticle | null;
  generatedCarousel: CarouselSlide[];
  isGenerating: boolean;
  generationError: string | null;
  
  // Actions
  setSelectedArticle: (article: SelectedArticle) => void;
  generateCarouselFromArticle: (params: { text: string; title: string; options?: GenerationOptions }) => Promise<void>;
  clearCarousel: () => void;
  updateSlide: (slideId: string, updates: Partial<CarouselSlide>) => void;
}

export const useIAGeneratorStore = create<IAGeneratorState>((set, get) => ({
  selectedArticle: null,
  generatedCarousel: [],
  isGenerating: false,
  generationError: null,

  setSelectedArticle: (article) => set({ selectedArticle: article }),

  generateCarouselFromArticle: async ({ text, title, options = {} }) => {
    set({ isGenerating: true, generationError: null });

    try {
      console.log('🧠 Gerando carrossel com IA...', { title, options });
      
      // Simular delay de processamento da IA
      await new Promise(resolve => setTimeout(resolve, 3000 + Math.random() * 2000));

      const slideCount = options.slideCount || 5;
      const tone = options.tone || 'inspirador';
      const keywords = options.mandatoryKeywords?.split(',').map(k => k.trim()) || [];

      // Gerar slides baseado no conteúdo
      const slides: CarouselSlide[] = [];
      
      // Slide 1: Título/Introdução
      slides.push({
        id: `slide-1-${Date.now()}`,
        title: title.length > 50 ? title.substring(0, 47) + '...' : title,
        content: generateIntroContent(title, tone),
        backgroundColor: getRandomColor('primary'),
        textColor: '#FFFFFF',
        order: 1
      });

      // Slides 2-N: Conteúdo baseado no texto
      const contentSections = extractContentSections(text, slideCount - 2);
      
      contentSections.forEach((section, index) => {
        slides.push({
          id: `slide-${index + 2}-${Date.now()}`,
          title: generateSectionTitle(section, keywords, tone, index + 2),
          content: generateSectionContent(section, tone, keywords),
          backgroundColor: getRandomColor('secondary'),
          textColor: index % 2 === 0 ? '#FFFFFF' : '#000000',
          order: index + 2
        });
      });

      // Slide final: CTA/Conclusão
      if (slideCount > 2) {
        slides.push({
          id: `slide-final-${Date.now()}`,
          title: generateCTATitle(tone),
          content: generateCTAContent(title, tone, keywords),
          backgroundColor: getRandomColor('accent'),
          textColor: '#FFFFFF',
          order: slideCount
        });
      }

      console.log(`✅ Carrossel gerado com ${slides.length} slides`);
      set({ generatedCarousel: slides, isGenerating: false });

    } catch (error) {
      console.error('❌ Erro na geração:', error);
      set({ 
        generationError: 'Erro ao gerar carrossel. Tente novamente.',
        isGenerating: false 
      });
    }
  },

  clearCarousel: () => set({ generatedCarousel: [], generationError: null }),

  updateSlide: (slideId, updates) => {
    const { generatedCarousel } = get();
    const updatedCarousel = generatedCarousel.map(slide =>
      slide.id === slideId ? { ...slide, ...updates } : slide
    );
    set({ generatedCarousel: updatedCarousel });
  }
}));

// Funções auxiliares para geração de conteúdo

function generateIntroContent(title: string, tone: string): string {
  const templates = {
    inspirador: [
      'Prepare-se para descobrir insights transformadores!',
      'Uma jornada de conhecimento está prestes a começar.',
      'Desvende os segredos por trás desta tendência.',
      'Transforme sua perspectiva com estas descobertas.'
    ],
    técnico: [
      'Análise detalhada dos principais conceitos.',
      'Fundamentos técnicos explicados de forma clara.',
      'Metodologia e implementação prática.',
      'Especificações e requisitos técnicos.'
    ],
    emocional: [
      'Uma história que vai tocar seu coração.',
      'Conecte-se com experiências reais.',
      'Emoções e aprendizados profundos.',
      'Histórias que inspiram mudanças.'
    ],
    provocador: [
      'Questione tudo que você pensava saber.',
      'Desafie suas crenças e paradigmas.',
      'A verdade pode ser mais complexa.',
      'Prepare-se para repensar conceitos.'
    ]
  };

  const toneTemplates = templates[tone as keyof typeof templates] || templates.inspirador;
  return toneTemplates[Math.floor(Math.random() * toneTemplates.length)];
}

function extractContentSections(text: string, sectionCount: number): string[] {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
  const sectionsPerSlide = Math.ceil(sentences.length / sectionCount);
  
  const sections: string[] = [];
  for (let i = 0; i < sectionCount; i++) {
    const start = i * sectionsPerSlide;
    const end = Math.min(start + sectionsPerSlide, sentences.length);
    const section = sentences.slice(start, end).join('. ').trim();
    if (section) {
      sections.push(section + '.');
    }
  }
  
  return sections;
}

function generateSectionTitle(section: string, keywords: string[], tone: string, slideNumber: number): string {
  const firstSentence = section.split('.')[0];
  const words = firstSentence.split(' ').slice(0, 6);
  
  // Tentar incluir palavras-chave obrigatórias
  if (keywords.length > 0) {
    const keyword = keywords[Math.floor(Math.random() * keywords.length)];
    if (!words.join(' ').toLowerCase().includes(keyword.toLowerCase())) {
      words.splice(2, 0, keyword);
    }
  }
  
  const baseTitle = words.join(' ');
  
  const prefixes = {
    inspirador: ['✨', '🚀', '💡', '🌟'],
    técnico: ['⚙️', '🔧', '📊', '🔍'],
    emocional: ['❤️', '🤝', '💭', '🌈'],
    provocador: ['⚡', '🔥', '💥', '🎯']
  };
  
  const tonePrefix = prefixes[tone as keyof typeof prefixes] || prefixes.inspirador;
  const prefix = tonePrefix[Math.floor(Math.random() * tonePrefix.length)];
  
  return `${prefix} ${baseTitle}`;
}

function generateSectionContent(section: string, tone: string, keywords: string[]): string {
  let content = section.length > 120 ? section.substring(0, 117) + '...' : section;
  
  // Ajustar tom do conteúdo
  const toneAdjustments = {
    inspirador: (text: string) => text.replace(/\./g, '! ').replace(/,/g, ', '),
    técnico: (text: string) => text,
    emocional: (text: string) => text.replace(/\b(importante|relevante|significativo)\b/gi, 'emocionante'),
    provocador: (text: string) => text.replace(/\b(pode|talvez|possivelmente)\b/gi, 'definitivamente')
  };
  
  const adjustment = toneAdjustments[tone as keyof typeof toneAdjustments];
  if (adjustment) {
    content = adjustment(content);
  }
  
  return content;
}

function generateCTATitle(tone: string): string {
  const titles = {
    inspirador: ['🎯 Sua Jornada Começa Agora!', '🚀 Próximos Passos', '✨ Transforme Seu Futuro'],
    técnico: ['📋 Implementação Prática', '⚙️ Próximas Etapas', '🔧 Aplicação Real'],
    emocional: ['❤️ Conecte-se Conosco', '🤝 Junte-se à Comunidade', '💭 Compartilhe Sua História'],
    provocador: ['⚡ Aceite o Desafio', '🔥 Mude Agora', '💥 Rompa os Limites']
  };
  
  const toneOptions = titles[tone as keyof typeof titles] || titles.inspirador;
  return toneOptions[Math.floor(Math.random() * toneOptions.length)];
}

function generateCTAContent(title: string, tone: string, keywords: string[]): string {
  const keywordText = keywords.length > 0 ? ` sobre ${keywords.join(', ')}` : '';
  
  const templates = {
    inspirador: `Pronto para aplicar esses insights${keywordText}? Comece sua transformação hoje mesmo!`,
    técnico: `Implemente essas soluções${keywordText} em seus projetos. Documentação completa disponível.`,
    emocional: `Compartilhe suas experiências${keywordText} conosco. Juntos somos mais fortes!`,
    provocador: `Não espere mais! Revolucione sua abordagem${keywordText} agora mesmo.`
  };
  
  return templates[tone as keyof typeof templates] || templates.inspirador;
}

function getRandomColor(type: 'primary' | 'secondary' | 'accent'): string {
  const colors = {
    primary: ['#1500FF', '#6366F1', '#8B5CF6', '#A855F7', '#EC4899'],
    secondary: ['#0891B2', '#059669', '#DC2626', '#EA580C', '#CA8A04'],
    accent: ['#1F2937', '#374151', '#4B5563', '#6B7280', '#9CA3AF']
  };
  
  const colorArray = colors[type];
  return colorArray[Math.floor(Math.random() * colorArray.length)];
}