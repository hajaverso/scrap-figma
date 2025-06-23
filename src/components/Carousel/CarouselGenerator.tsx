import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Wand2, Loader, AlertCircle, Sparkles, Settings, Brain, Check, Globe, Hash, Download, ExternalLink, Grid, Eye } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { openAIService } from '../../services/openAIService';
import { APIKeyModal } from './APIKeyModal';
import { CarouselPreview1080x1440 } from './CarouselPreview1080x1440';

export const CarouselGenerator: React.FC = () => {
  const {
    selectedArticles,
    generateCarousel,
    isGeneratingCarousel,
    generationError,
    generatedCarousels
  } = useAppStore();

  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<'modern' | 'minimal' | 'bold' | 'elegant'>('modern');
  const [selectedLanguage, setSelectedLanguage] = useState<'pt' | 'en' | 'es'>('pt');
  const [cardCount, setCardCount] = useState(5);
  const [showAPIModal, setShowAPIModal] = useState(false);
  const [isAIEnabled, setIsAIEnabled] = useState(false);
  const [lastGeneratedCarousel, setLastGeneratedCarousel] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'preview' | 'grid'>('grid');

  React.useEffect(() => {
    setIsAIEnabled(openAIService.isConfigured());
  }, []);

  React.useEffect(() => {
    if (generatedCarousels.length > 0) {
      setLastGeneratedCarousel(generatedCarousels[generatedCarousels.length - 1]);
    }
  }, [generatedCarousels]);

  const languages = [
    { code: 'pt', name: 'Português', flag: '🇧🇷' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' }
  ];

  const styles = [
    { 
      id: 'modern', 
      name: 'Moderno', 
      description: 'Design clean com gradientes',
      preview: 'linear-gradient(135deg, #1500FF, #6366F1)'
    },
    { 
      id: 'minimal', 
      name: 'Minimalista', 
      description: 'Foco na tipografia',
      preview: 'linear-gradient(135deg, #000000, #374151)'
    },
    { 
      id: 'bold', 
      name: 'Ousado', 
      description: 'Cores vibrantes e impacto',
      preview: 'linear-gradient(135deg, #EF4444, #F97316)'
    },
    { 
      id: 'elegant', 
      name: 'Elegante', 
      description: 'Sofisticado e refinado',
      preview: 'linear-gradient(135deg, #1F2937, #D4A574)'
    }
  ];

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAIEnabled) {
      setShowAPIModal(true);
      return;
    }

    const fullPrompt = `${prompt} | Estilo: ${selectedStyle} | Idioma: ${selectedLanguage} | Cards: ${cardCount}`;
    generateCarousel(fullPrompt, selectedStyle, isAIEnabled, cardCount, selectedLanguage);
  };

  const handleAPIKeySaved = () => {
    setIsAIEnabled(openAIService.isConfigured());
  };

  const handleExportToFigma = () => {
    // Simular exportação para Figma
    const figmaUrl = 'https://www.figma.com/files/recent?fuid_redirect=1';
    window.open(figmaUrl, '_blank');
  };

  const handleExportToCanva = () => {
    // Simular exportação para Canva
    const canvaUrl = 'https://www.canva.com/create/instagram-stories/';
    window.open(canvaUrl, '_blank');
  };

  if (selectedArticles.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12"
      >
        <Wand2 size={48} className="text-gray-600 mx-auto mb-4" />
        <h3 className="text-white font-inter font-medium text-lg mb-2">
          Selecione artigos primeiro
        </h3>
        <p className="text-gray-400 font-inter">
          Vá para a aba de Scraping e selecione os artigos que deseja usar no carrossel
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* AI Status Banner */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`${
          isAIEnabled 
            ? 'bg-green-900/20 border-green-800' 
            : 'bg-yellow-900/20 border-yellow-800'
        } rounded-xl p-4 border flex items-center justify-between`}
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${
            isAIEnabled ? 'bg-green-500/20' : 'bg-yellow-500/20'
          }`}>
            <Brain size={20} className={isAIEnabled ? 'text-green-400' : 'text-yellow-400'} />
          </div>
          <div>
            <h3 className={`font-inter font-medium text-sm ${
              isAIEnabled ? 'text-green-400' : 'text-yellow-400'
            }`}>
              {isAIEnabled ? 'IA Configurada' : 'IA Não Configurada'}
            </h3>
            <p className="text-gray-400 font-inter text-xs">
              {isAIEnabled 
                ? 'OpenAI conectada - Carrosséis inteligentes habilitados' 
                : 'Configure sua API key da OpenAI para usar geração inteligente'
              }
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAPIModal(true)}
          className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-inter font-medium text-sm transition-all duration-200"
        >
          <Settings size={16} />
          {isAIEnabled ? 'Gerenciar' : 'Configurar'}
        </button>
      </motion.div>

      {/* Selected Articles Summary */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-[#111111] rounded-xl p-6 border border-gray-800"
      >
        <h3 className="text-white font-inter font-semibold text-lg mb-4">
          Artigos Selecionados ({selectedArticles.length})
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {selectedArticles.slice(0, 6).map((article) => (
            <div
              key={article.id}
              className="flex items-center gap-3 bg-gray-900 rounded-lg p-3"
            >
              <img
                src={article.imageUrl}
                alt={article.title}
                className="w-10 h-10 rounded object-cover"
              />
              <div className="flex-1 min-w-0">
                <h4 className="text-white font-inter font-medium text-sm truncate">
                  {article.title}
                </h4>
                <p className="text-gray-400 font-inter text-xs">
                  {article.source}
                </p>
              </div>
            </div>
          ))}
          {selectedArticles.length > 6 && (
            <div className="flex items-center justify-center bg-gray-900 rounded-lg p-3">
              <p className="text-gray-400 font-inter text-sm">
                +{selectedArticles.length - 6} artigos
              </p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Generation Form */}
      <motion.form
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        onSubmit={handleGenerate}
        className="bg-[#111111] rounded-xl p-6 border border-gray-800"
      >
        <h3 className="text-white font-inter font-semibold text-lg mb-6">
          Configurar Geração de Carrossel
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Language Selection */}
          <div>
            <label className="block text-gray-300 font-inter font-medium text-sm mb-3">
              <Globe size={16} className="inline mr-2" />
              Idioma do Carrossel
            </label>
            
            <div className="grid grid-cols-3 gap-2">
              {languages.map((lang) => (
                <motion.button
                  key={lang.code}
                  type="button"
                  onClick={() => setSelectedLanguage(lang.code as any)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-3 rounded-lg border text-center transition-all duration-200 ${
                    selectedLanguage === lang.code
                      ? 'border-[#1500FF] bg-[#1500FF]/10'
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <div className="text-2xl mb-1">{lang.flag}</div>
                  <div className={`font-inter font-medium text-xs ${
                    selectedLanguage === lang.code ? 'text-[#1500FF]' : 'text-white'
                  }`}>
                    {lang.name}
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Card Count Selection */}
          <div>
            <label className="block text-gray-300 font-inter font-medium text-sm mb-3">
              <Hash size={16} className="inline mr-2" />
              Quantidade de Cards (máx. 10)
            </label>
            
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="1"
                max="10"
                value={cardCount}
                onChange={(e) => setCardCount(parseInt(e.target.value))}
                className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #1500FF 0%, #1500FF ${(cardCount / 10) * 100}%, #374151 ${(cardCount / 10) * 100}%, #374151 100%)`
                }}
              />
              
              <div className="bg-[#1500FF] text-white px-3 py-2 rounded-lg font-inter font-semibold text-sm min-w-[3rem] text-center">
                {cardCount}
              </div>
            </div>
            
            <p className="text-gray-500 font-inter text-xs mt-2">
              Recomendamos 5-7 cards para melhor engajamento
            </p>
          </div>
        </div>

        {/* Style Selection */}
        <div className="mb-6">
          <label className="block text-gray-300 font-inter font-medium text-sm mb-3">
            Estilo Visual
          </label>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {styles.map((style) => (
              <motion.button
                key={style.id}
                type="button"
                onClick={() => setSelectedStyle(style.id as any)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`relative p-4 rounded-lg border text-left transition-all duration-200 overflow-hidden ${
                  selectedStyle === style.id
                    ? 'border-[#1500FF] bg-[#1500FF]/10'
                    : 'border-gray-700 hover:border-gray-600'
                }`}
              >
                {/* Style Preview */}
                <div 
                  className="absolute inset-0 opacity-10"
                  style={{ background: style.preview }}
                />
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className={`font-inter font-medium text-sm ${
                      selectedStyle === style.id ? 'text-[#1500FF]' : 'text-white'
                    }`}>
                      {style.name}
                    </h4>
                    {selectedStyle === style.id && (
                      <Check size={16} className="text-[#1500FF]" />
                    )}
                  </div>
                  <p className="text-gray-400 font-inter text-xs">
                    {style.description}
                  </p>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Prompt Input */}
        <div className="mb-6">
          <label className="block text-gray-300 font-inter font-medium text-sm mb-3">
            Prompt Personalizado {isAIEnabled && <span className="text-[#1500FF]">(IA Habilitada)</span>}
          </label>
          
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={isAIEnabled 
              ? "Descreva como deseja que seja o carrossel... (ex: foco em CTAs, tom profissional, cores corporativas, público jovem...)"
              : "Descreva como deseja que seja o carrossel... (configuração básica sem IA)"
            }
            rows={4}
            className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white font-inter placeholder-gray-500 focus:outline-none focus:border-[#1500FF] transition-colors resize-none"
            disabled={isGeneratingCarousel}
          />
          
          {isAIEnabled && (
            <p className="text-gray-500 font-inter text-xs mt-2">
              💡 A IA irá otimizar títulos, descrições e cores baseado no seu prompt
            </p>
          )}
        </div>

        {/* Generate Button */}
        <motion.button
          type="submit"
          disabled={isGeneratingCarousel}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-[#1500FF] text-white py-4 rounded-lg font-inter font-semibold flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:bg-blue-600"
        >
          {isGeneratingCarousel ? (
            <>
              <Loader size={20} className="animate-spin" />
              {isAIEnabled ? 'Gerando com IA...' : 'Gerando Carrossel...'}
            </>
          ) : (
            <>
              {isAIEnabled ? <Brain size={20} /> : <Sparkles size={20} />}
              Gerar Carrossel ({cardCount} cards)
            </>
          )}
        </motion.button>

        {generationError && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 flex items-center gap-2 text-red-400 font-inter text-sm"
          >
            <AlertCircle size={16} />
            {generationError}
          </motion.div>
        )}
      </motion.form>

      {/* Carousel Preview */}
      {lastGeneratedCarousel && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-[#111111] rounded-xl p-6 border border-gray-800"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-white font-inter font-semibold text-lg">
                Carrossel Gerado ({lastGeneratedCarousel.length} cards)
              </h3>
              <p className="text-gray-400 font-inter text-sm">
                Estilo: {selectedStyle} • Idioma: {selectedLanguage} • {isAIEnabled ? 'IA Habilitada' : 'Geração Básica'}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* View Mode Toggle */}
              <div className="flex items-center gap-1 bg-gray-800 rounded-lg p-1">
                <motion.button
                  onClick={() => setViewMode('grid')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    viewMode === 'grid' ? 'bg-[#1500FF] text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Grid size={16} />
                </motion.button>
                
                <motion.button
                  onClick={() => setViewMode('preview')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    viewMode === 'preview' ? 'bg-[#1500FF] text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Eye size={16} />
                </motion.button>
              </div>

              <motion.button
                onClick={handleExportToFigma}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-inter font-medium text-sm transition-all duration-200"
              >
                <ExternalLink size={16} />
                Abrir no Figma
              </motion.button>

              <motion.button
                onClick={handleExportToCanva}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-inter font-medium text-sm transition-all duration-200"
              >
                <ExternalLink size={16} />
                Abrir no Canva
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 bg-[#1500FF] hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-inter font-medium text-sm transition-all duration-200"
              >
                <Download size={16} />
                Download
              </motion.button>
            </div>
          </div>

          {/* Conditional Rendering based on view mode */}
          {viewMode === 'grid' ? (
            /* Grid View - Show all cards */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {lastGeneratedCarousel.map((card, index) => (
                <motion.div
                  key={card.id}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="group cursor-pointer"
                >
                  <div className="bg-gradient-to-br from-gray-900 to-black rounded-xl overflow-hidden border border-gray-800 hover:border-gray-700 transition-colors">
                    {/* Card Preview - Instagram Story Format */}
                    <div 
                      className="relative aspect-[9/16] overflow-hidden"
                      style={{ backgroundColor: card.colors.background }}
                    >
                      {/* Image Section */}
                      <div className="relative h-2/3 overflow-hidden">
                        <img
                          src={card.imageUrl}
                          alt={card.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        
                        {/* Gradient Overlay */}
                        <div 
                          className="absolute inset-0"
                          style={{
                            background: `linear-gradient(to bottom, transparent 0%, ${card.colors.background}99 70%, ${card.colors.background} 100%)`
                          }}
                        />

                        {/* Card Number */}
                        <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded-full font-inter text-xs">
                          {index + 1}/{lastGeneratedCarousel.length}
                        </div>
                      </div>

                      {/* Content Section */}
                      <div className="h-1/3 p-3 flex flex-col justify-center">
                        <h2
                          className="font-inter font-bold text-sm mb-1 leading-tight line-clamp-2"
                          style={{ color: card.colors.primary }}
                        >
                          {card.title}
                        </h2>
                        
                        <p
                          className="font-inter font-medium text-xs mb-2 opacity-80 line-clamp-1"
                          style={{ color: card.colors.secondary }}
                        >
                          {card.subtitle}
                        </p>
                        
                        <p
                          className="font-inter text-xs leading-relaxed line-clamp-2"
                          style={{ color: card.colors.text }}
                        >
                          {card.description}
                        </p>

                        {/* Progress Bar */}
                        <div className="mt-2">
                          <div className="flex gap-1">
                            {lastGeneratedCarousel.map((_, cardIndex) => (
                              <div
                                key={cardIndex}
                                className={`h-1 rounded-full transition-all duration-300 ${
                                  cardIndex === index ? 'bg-white flex-1' : 'bg-white/30 w-2'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card Info */}
                    <div className="p-3 bg-gray-900/50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-inter font-medium text-xs">
                          Card {index + 1} - {card.style}
                        </span>
                        <div className="flex gap-1">
                          {Object.values(card.colors).slice(0, 3).map((color, colorIndex) => (
                            <div
                              key={colorIndex}
                              className="w-3 h-3 rounded-full border border-gray-600"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </div>
                      
                      <div className="text-xs font-inter text-gray-400">
                        Título: {card.title.length}/60 • Desc: {card.description.length}/150
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            /* Preview Mode - Interactive carousel */
            <CarouselPreview1080x1440 carousel={lastGeneratedCarousel} />
          )}

          {/* Generation Summary */}
          <div className="mt-6 bg-gray-900/50 rounded-lg p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-[#1500FF] font-inter font-bold text-lg">
                  {lastGeneratedCarousel.length}
                </div>
                <div className="text-gray-400 font-inter text-xs">
                  Cards Gerados
                </div>
              </div>
              
              <div>
                <div className="text-green-400 font-inter font-bold text-lg">
                  {selectedStyle}
                </div>
                <div className="text-gray-400 font-inter text-xs">
                  Estilo Aplicado
                </div>
              </div>
              
              <div>
                <div className="text-blue-400 font-inter font-bold text-lg">
                  {isAIEnabled ? 'IA' : 'Básico'}
                </div>
                <div className="text-gray-400 font-inter text-xs">
                  Modo de Geração
                </div>
              </div>
              
              <div>
                <div className="text-purple-400 font-inter font-bold text-lg">
                  {selectedLanguage.toUpperCase()}
                </div>
                <div className="text-gray-400 font-inter text-xs">
                  Idioma
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* API Key Modal */}
      <APIKeyModal
        isOpen={showAPIModal}
        onClose={() => setShowAPIModal(false)}
        onSave={handleAPIKeySaved}
      />
    </div>
  );
};