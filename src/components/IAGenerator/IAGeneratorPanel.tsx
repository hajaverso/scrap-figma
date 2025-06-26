import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Settings, 
  Loader, 
  ExternalLink, 
  AlertCircle, 
  Wand2, 
  Palette, 
  Hash, 
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Play,
  Edit3,
  Download,
  Eye
} from 'lucide-react';
import { useIAGeneratorStore } from '../../store/iaGeneratorStore';

export const IAGeneratorPanel: React.FC = () => {
  const {
    selectedArticle,
    generatedCarousel,
    isGenerating,
    generationError,
    generateCarouselFromArticle,
    clearCarousel
  } = useIAGeneratorStore();

  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [options, setOptions] = useState({
    tone: 'inspirador',
    mandatoryKeywords: '',
    slideCount: 5,
    extraInstructions: ''
  });

  const toneOptions = [
    { value: 'inspirador', label: 'Inspirador', emoji: '✨', description: 'Tom motivacional e positivo' },
    { value: 'técnico', label: 'Técnico', emoji: '⚙️', description: 'Foco em detalhes e precisão' },
    { value: 'emocional', label: 'Emocional', emoji: '❤️', description: 'Conecta com sentimentos' },
    { value: 'provocador', label: 'Provocador', emoji: '⚡', description: 'Desafia e questiona' }
  ];

  const handleGenerateCarousel = async () => {
    if (!selectedArticle) return;

    await generateCarouselFromArticle({
      text: selectedArticle.text,
      title: selectedArticle.title,
      options: {
        tone: options.tone,
        mandatoryKeywords: options.mandatoryKeywords,
        slideCount: options.slideCount,
        extraInstructions: options.extraInstructions
      }
    });
  };

  const handleExportToCanva = () => {
    // Placeholder para integração futura com Canva
    window.open('https://www.canva.com/create/presentations/', '_blank');
  };

  if (!selectedArticle) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-16"
      >
        <Brain size={64} className="text-gray-600 mx-auto mb-6" />
        <h3 className="text-white font-inter font-semibold text-xl mb-3">
          Nenhum Artigo Selecionado
        </h3>
        <p className="text-gray-400 font-inter text-lg mb-6">
          Selecione um artigo no painel de Scraping para gerar carrosséis com IA
        </p>
        <div className="text-gray-500 font-inter text-sm space-y-1">
          <p>🔍 Faça scraping de uma URL</p>
          <p>📄 Selecione um artigo extraído</p>
          <p>🧠 Gere carrosséis criativos com IA</p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com Artigo Selecionado */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-[#111111] rounded-xl p-6 border border-gray-800"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-[#1500FF]/20 rounded-lg">
            <Brain size={24} className="text-[#1500FF]" />
          </div>
          <div>
            <h3 className="text-white font-inter font-semibold text-xl">
              Gerador de Carrossel com IA
            </h3>
            <p className="text-gray-400 font-inter text-sm">
              Transforme artigos em carrosséis envolventes automaticamente
            </p>
          </div>
        </div>

        {/* Artigo Selecionado */}
        <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
          <h4 className="text-white font-inter font-semibold text-lg mb-2">
            📄 Artigo Selecionado
          </h4>
          <h5 className="text-[#1500FF] font-inter font-medium text-base mb-2">
            {selectedArticle.title}
          </h5>
          <p className="text-gray-300 font-inter text-sm mb-3">
            {selectedArticle.text.substring(0, 200)}...
          </p>
          
          <div className="flex items-center gap-4 text-xs font-inter text-gray-400">
            <span>📝 {selectedArticle.text.length.toLocaleString()} caracteres</span>
            <span>🖼️ {selectedArticle.images.length} imagens</span>
            <span>🎥 {selectedArticle.videos.length} vídeos</span>
          </div>
        </div>
      </motion.div>

      {/* Controles de Geração */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-[#111111] rounded-xl p-6 border border-gray-800"
      >
        {/* Botão Principal */}
        <div className="flex items-center justify-between mb-6">
          <motion.button
            onClick={handleGenerateCarousel}
            disabled={isGenerating}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-3 bg-[#1500FF] hover:bg-blue-600 text-white px-8 py-4 rounded-lg font-inter font-semibold text-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <Loader size={24} className="animate-spin" />
                Gerando com IA...
              </>
            ) : (
              <>
                <Wand2 size={24} />
                Gerar Carrossel com IA
              </>
            )}
          </motion.button>

          {/* Botão Personalizar */}
          <motion.button
            onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-inter font-medium transition-all duration-200"
          >
            <Settings size={18} />
            🔧 Personalizar
            {showAdvancedOptions ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </motion.button>
        </div>

        {/* Opções Avançadas */}
        <AnimatePresence>
          {showAdvancedOptions && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="border-t border-gray-700 pt-6"
            >
              <h4 className="text-white font-inter font-semibold text-lg mb-4">
                ⚙️ Personalização Avançada
              </h4>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Tom de Voz */}
                <div>
                  <label className="flex items-center gap-2 text-gray-300 font-inter font-medium text-sm mb-3">
                    <Palette size={16} />
                    Tom de Voz
                  </label>
                  
                  <div className="grid grid-cols-2 gap-2">
                    {toneOptions.map((tone) => (
                      <motion.button
                        key={tone.value}
                        onClick={() => setOptions(prev => ({ ...prev, tone: tone.value }))}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`p-3 rounded-lg border text-left transition-all duration-200 ${
                          options.tone === tone.value
                            ? 'border-[#1500FF] bg-[#1500FF]/10'
                            : 'border-gray-700 hover:border-gray-600'
                        }`}
                      >
                        <div className={`font-inter font-medium text-sm mb-1 ${
                          options.tone === tone.value ? 'text-[#1500FF]' : 'text-white'
                        }`}>
                          {tone.emoji} {tone.label}
                        </div>
                        <div className="text-gray-400 font-inter text-xs">
                          {tone.description}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Número de Slides */}
                <div>
                  <label className="flex items-center gap-2 text-gray-300 font-inter font-medium text-sm mb-3">
                    <Hash size={16} />
                    Número de Slides
                  </label>
                  
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="3"
                      max="10"
                      value={options.slideCount}
                      onChange={(e) => setOptions(prev => ({ ...prev, slideCount: parseInt(e.target.value) }))}
                      className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                    
                    <div className="bg-[#1500FF] text-white px-3 py-2 rounded-lg font-inter font-semibold text-sm min-w-[3rem] text-center">
                      {options.slideCount}
                    </div>
                  </div>
                  
                  <p className="text-gray-500 font-inter text-xs mt-2">
                    Recomendado: 5-7 slides para melhor engajamento
                  </p>
                </div>
              </div>

              {/* Palavras-chave Obrigatórias */}
              <div className="mt-6">
                <label className="flex items-center gap-2 text-gray-300 font-inter font-medium text-sm mb-3">
                  <MessageSquare size={16} />
                  Palavras-chave Obrigatórias
                </label>
                
                <input
                  type="text"
                  value={options.mandatoryKeywords}
                  onChange={(e) => setOptions(prev => ({ ...prev, mandatoryKeywords: e.target.value }))}
                  placeholder="Ex: inovação, tecnologia, futuro (separadas por vírgula)"
                  className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white font-inter placeholder-gray-500 focus:outline-none focus:border-[#1500FF] transition-colors"
                />
                
                <p className="text-gray-500 font-inter text-xs mt-2">
                  A IA tentará incluir essas palavras nos slides gerados
                </p>
              </div>

              {/* Instruções Extras */}
              <div className="mt-6">
                <label className="flex items-center gap-2 text-gray-300 font-inter font-medium text-sm mb-3">
                  <Edit3 size={16} />
                  Instruções Extras para o Agente
                </label>
                
                <textarea
                  value={options.extraInstructions}
                  onChange={(e) => setOptions(prev => ({ ...prev, extraInstructions: e.target.value }))}
                  placeholder="Ex: Foque em dados estatísticos, inclua CTAs específicos, use linguagem mais formal..."
                  rows={4}
                  className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white font-inter placeholder-gray-500 focus:outline-none focus:border-[#1500FF] transition-colors resize-none"
                />
                
                <p className="text-gray-500 font-inter text-xs mt-2">
                  Instruções específicas para personalizar ainda mais a geração
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Erro de Geração */}
        {generationError && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 flex items-center gap-2 text-red-400 font-inter text-sm bg-red-900/20 p-4 rounded-lg border border-red-800"
          >
            <AlertCircle size={16} />
            {generationError}
          </motion.div>
        )}
      </motion.div>

      {/* Carrossel Gerado */}
      {generatedCarousel.length > 0 && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-[#111111] rounded-xl p-6 border border-gray-800"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-white font-inter font-semibold text-xl mb-2">
                🎨 Carrossel Gerado ({generatedCarousel.length} slides)
              </h3>
              <p className="text-gray-400 font-inter text-sm">
                Tom: {options.tone} • {generatedCarousel.length} slides • Gerado com IA
              </p>
            </div>

            <div className="flex items-center gap-3">
              <motion.button
                onClick={() => clearCarousel()}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-inter font-medium text-sm transition-all duration-200"
              >
                <Edit3 size={16} />
                Regenerar
              </motion.button>

              <motion.button
                onClick={handleExportToCanva}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-inter font-medium text-sm transition-all duration-200"
              >
                <ExternalLink size={16} />
                Editar no Canva
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

          {/* Grid de Slides */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {generatedCarousel.map((slide, index) => (
              <motion.div
                key={slide.id}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className="group cursor-pointer"
              >
                <div className="bg-gradient-to-br from-gray-900 to-black rounded-xl overflow-hidden border border-gray-800 hover:border-gray-700 transition-all duration-300">
                  {/* Slide Preview */}
                  <div 
                    className="relative aspect-[16/9] p-6 flex flex-col justify-center"
                    style={{ backgroundColor: slide.backgroundColor }}
                  >
                    {/* Slide Number */}
                    <div className="absolute top-3 right-3 bg-black bg-opacity-50 text-white px-2 py-1 rounded-full font-inter text-xs">
                      {slide.order}/{generatedCarousel.length}
                    </div>

                    {/* Content */}
                    <h4 
                      className="font-inter font-bold text-lg mb-3 leading-tight line-clamp-2"
                      style={{ color: slide.textColor }}
                    >
                      {slide.title}
                    </h4>
                    
                    <p 
                      className="font-inter text-sm leading-relaxed line-clamp-4"
                      style={{ color: slide.textColor, opacity: 0.9 }}
                    >
                      {slide.content}
                    </p>

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="bg-white text-black p-2 rounded-full"
                        >
                          <Eye size={16} />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="bg-white text-black p-2 rounded-full"
                        >
                          <Edit3 size={16} />
                        </motion.button>
                      </div>
                    </div>
                  </div>

                  {/* Slide Info */}
                  <div className="p-4 bg-gray-900/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-inter font-medium text-sm">
                        Slide {slide.order}
                      </span>
                      <div 
                        className="w-4 h-4 rounded-full border border-gray-600"
                        style={{ backgroundColor: slide.backgroundColor }}
                      />
                    </div>
                    
                    <div className="text-xs font-inter text-gray-400">
                      Título: {slide.title.length}/50 • Conteúdo: {slide.content.length}/120
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Estatísticas do Carrossel */}
          <div className="mt-6 bg-gray-900/50 rounded-lg p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-[#1500FF] font-inter font-bold text-lg">
                  {generatedCarousel.length}
                </div>
                <div className="text-gray-400 font-inter text-xs">
                  Slides Gerados
                </div>
              </div>
              
              <div>
                <div className="text-green-400 font-inter font-bold text-lg">
                  {options.tone}
                </div>
                <div className="text-gray-400 font-inter text-xs">
                  Tom Aplicado
                </div>
              </div>
              
              <div>
                <div className="text-yellow-400 font-inter font-bold text-lg">
                  IA
                </div>
                <div className="text-gray-400 font-inter text-xs">
                  Geração Inteligente
                </div>
              </div>
              
              <div>
                <div className="text-purple-400 font-inter font-bold text-lg">
                  {Math.round(selectedArticle.text.length / generatedCarousel.length)}
                </div>
                <div className="text-gray-400 font-inter text-xs">
                  Chars por Slide
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Loading State */}
      {isGenerating && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#111111] rounded-xl p-8 border border-gray-800 max-w-md mx-4"
          >
            <div className="text-center">
              <div className="animate-spin w-12 h-12 border-4 border-[#1500FF] border-t-transparent rounded-full mx-auto mb-4" />
              <h3 className="text-white font-inter font-semibold text-lg mb-2">
                🧠 IA Trabalhando...
              </h3>
              <p className="text-gray-400 font-inter text-sm mb-4">
                Analisando conteúdo e gerando slides criativos
              </p>
              <div className="space-y-2 text-xs text-gray-500 font-inter">
                <p>📝 Processando texto ({selectedArticle.text.length} chars)</p>
                <p>🎨 Aplicando tom: {options.tone}</p>
                <p>📊 Gerando {options.slideCount} slides</p>
                <p>✨ Otimizando para engajamento</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};