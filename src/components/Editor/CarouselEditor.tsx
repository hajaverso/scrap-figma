import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit3, Palette, Image, Type, Save, Undo, Redo, Eye, EyeOff, Download, ExternalLink, Grid, Layers, Maximize } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { CardEditor } from './CardEditor';
import { ColorPalette } from './ColorPalette';
import { ImageLibrary } from './ImageLibrary';
import { CanvasView } from './CanvasView';

export const CarouselEditor: React.FC = () => {
  const { generatedCarousels, currentEditingCarousel, setCurrentEditingCarousel, updateCarouselCard } = useAppStore();
  const [activeTab, setActiveTab] = useState<'edit' | 'colors' | 'images' | 'typography'>('edit');
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'canvas'>('canvas');
  const [isExporting, setIsExporting] = useState(false);
  const [exportLinks, setExportLinks] = useState<{canva?: string, figma?: string} | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  if (generatedCarousels.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12"
      >
        <Edit3 size={48} className="text-gray-600 mx-auto mb-4" />
        <h3 className="text-white font-inter font-medium text-lg mb-2">
          Nenhum carrossel para editar
        </h3>
        <p className="text-gray-400 font-inter">
          Gere um carrossel primeiro para começar a editar
        </p>
      </motion.div>
    );
  }

  const currentCarousel = currentEditingCarousel || generatedCarousels[0];
  const editorTabs = [
    { id: 'edit', label: 'Editar', icon: Edit3 },
    { id: 'colors', label: 'Cores', icon: Palette },
    { id: 'images', label: 'Imagens', icon: Image },
    { id: 'typography', label: 'Texto', icon: Type }
  ];

  const handleCardSelect = (index: number) => {
    setSelectedCardIndex(selectedCardIndex === index ? null : index);
  };

  const saveToHistory = (carousel: any) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(carousel)));
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setCurrentEditingCarousel(history[historyIndex - 1]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setCurrentEditingCarousel(history[historyIndex + 1]);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      // Simular geração de templates
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Gerar IDs únicos para os templates
      const timestamp = Date.now();
      const carouselId = `carousel-${timestamp}`;
      
      const links = {
        canva: `https://www.canva.com/design/template-${carouselId}`,
        figma: `https://www.figma.com/file/template-${carouselId}/Carousel-Template`
      };
      
      setExportLinks(links);
    } catch (error) {
      console.error('Erro na exportação:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadTemplate = (platform: 'canva' | 'figma') => {
    const link = exportLinks?.[platform];
    if (link) {
      window.open(link, '_blank');
    }
  };

  return (
    <div className="space-y-6">
      {/* Editor Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-[#111111] rounded-xl p-6 border border-gray-800"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-white font-inter font-semibold text-xl">
              Editor Visual Profissional
            </h3>
            <p className="text-gray-400 font-inter text-sm">
              Canvas profissional para edição de carrosséis
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 bg-gray-800 rounded-lg p-1">
              <motion.button
                onClick={() => setViewMode('canvas')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  viewMode === 'canvas' ? 'bg-[#1500FF] text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Maximize size={16} />
              </motion.button>
              
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
            </div>

            {/* History Controls */}
            <div className="flex items-center gap-1 bg-gray-800 rounded-lg p-1">
              <motion.button
                onClick={undo}
                disabled={historyIndex <= 0}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all duration-200"
              >
                <Undo size={16} />
              </motion.button>
              
              <motion.button
                onClick={redo}
                disabled={historyIndex >= history.length - 1}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all duration-200"
              >
                <Redo size={16} />
              </motion.button>
            </div>

            {/* Export Button */}
            <motion.button
              onClick={handleExport}
              disabled={isExporting}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 bg-[#1500FF] hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-inter font-medium text-sm transition-all duration-200 disabled:opacity-50"
            >
              {isExporting ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  Gerando Templates...
                </>
              ) : (
                <>
                  <Download size={16} />
                  Gerar Templates
                </>
              )}
            </motion.button>
          </div>
        </div>

        {/* Editor Tabs - Only show in grid mode */}
        {viewMode === 'grid' && selectedCardIndex !== null && (
          <div className="flex gap-2">
            {editorTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-inter font-medium text-sm transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-[#1500FF] text-white'
                      : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                </motion.button>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Export Links */}
      {exportLinks && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-green-900/20 border border-green-800 rounded-xl p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <Download size={20} className="text-green-400" />
            </div>
            <div>
              <h3 className="text-green-400 font-inter font-semibold text-lg">
                Templates Prontos!
              </h3>
              <p className="text-gray-400 font-inter text-sm">
                Seus templates foram gerados e estão prontos para download
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <motion.button
              onClick={() => handleDownloadTemplate('canva')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-inter font-medium transition-all duration-200"
            >
              <ExternalLink size={18} />
              Abrir no Canva
            </motion.button>

            <motion.button
              onClick={() => handleDownloadTemplate('figma')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-inter font-medium transition-all duration-200"
            >
              <ExternalLink size={18} />
              Abrir no Figma
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Main Content */}
      <div className={viewMode === 'canvas' ? 'grid grid-cols-1' : 'grid grid-cols-1 lg:grid-cols-3 gap-6'}>
        {/* Canvas/Cards View */}
        <div className={viewMode === 'canvas' ? 'col-span-1' : 'lg:col-span-2'}>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-[#111111] rounded-xl border border-gray-800 overflow-hidden"
          >
            {viewMode === 'canvas' ? (
              <CanvasView 
                cards={currentCarousel}
                selectedIndex={selectedCardIndex}
                onCardSelect={handleCardSelect}
                onCardUpdate={(index, card) => {
                  updateCarouselCard(index, card);
                  saveToHistory(currentCarousel);
                }}
              />
            ) : (
              <div className="p-6">
                <h4 className="text-white font-inter font-semibold text-lg mb-4">
                  Cards do Carrossel ({currentCarousel.length})
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentCarousel.map((card, index) => (
                    <motion.div
                      key={card.id}
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleCardSelect(index)}
                      className={`group cursor-pointer transition-all duration-200 ${
                        selectedCardIndex === index
                          ? 'ring-2 ring-[#1500FF] ring-offset-2 ring-offset-black'
                          : ''
                      }`}
                    >
                      <div className="bg-gradient-to-br from-gray-900 to-black rounded-xl overflow-hidden border border-gray-800 hover:border-gray-700">
                        {/* Card Image */}
                        <div className="relative h-32 overflow-hidden">
                          <img
                            src={card.imageUrl}
                            alt={card.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                          
                          {/* Edit Overlay */}
                          {selectedCardIndex === index && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="absolute inset-0 bg-[#1500FF]/20 flex items-center justify-center"
                            >
                              <div className="bg-[#1500FF] text-white px-3 py-1 rounded-full font-inter font-medium text-sm">
                                Editando
                              </div>
                            </motion.div>
                          )}
                        </div>

                        {/* Card Content */}
                        <div className="p-4" style={{ backgroundColor: card.colors.background }}>
                          <h5 
                            className="font-inter font-semibold text-sm mb-2 line-clamp-2"
                            style={{ color: card.colors.text }}
                          >
                            {card.title}
                          </h5>
                          
                          <p 
                            className="font-inter text-xs mb-2 opacity-80"
                            style={{ color: card.colors.text }}
                          >
                            {card.subtitle}
                          </p>
                          
                          <p 
                            className="font-inter text-xs line-clamp-2 opacity-60"
                            style={{ color: card.colors.text }}
                          >
                            {card.description}
                          </p>

                          {/* Color Palette Preview */}
                          <div className="flex items-center gap-1 mt-3">
                            {Object.values(card.colors).slice(0, 3).map((color, colorIndex) => (
                              <div
                                key={colorIndex}
                                className="w-3 h-3 rounded-full border border-gray-600"
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Editor Panel - Only show in grid mode */}
        {viewMode === 'grid' && (
          <div className="lg:col-span-1">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-[#111111] rounded-xl border border-gray-800 sticky top-6"
            >
              <div className="p-6">
                <h4 className="text-white font-inter font-semibold text-lg mb-4">
                  Ferramentas de Edição
                </h4>

                {selectedCardIndex === null ? (
                  <div className="text-center py-8">
                    <Edit3 size={32} className="text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400 font-inter text-sm">
                      Selecione um card para editar
                    </p>
                  </div>
                ) : (
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                    >
                      {activeTab === 'edit' && (
                        <CardEditor
                          card={currentCarousel[selectedCardIndex]}
                          onUpdate={(updatedCard) => {
                            updateCarouselCard(selectedCardIndex, updatedCard);
                            saveToHistory(currentCarousel);
                          }}
                        />
                      )}

                      {activeTab === 'colors' && (
                        <ColorPalette
                          card={currentCarousel[selectedCardIndex]}
                          onUpdate={(updatedCard) => {
                            updateCarouselCard(selectedCardIndex, updatedCard);
                            saveToHistory(currentCarousel);
                          }}
                        />
                      )}

                      {activeTab === 'images' && (
                        <ImageLibrary
                          card={currentCarousel[selectedCardIndex]}
                          onUpdate={(updatedCard) => {
                            updateCarouselCard(selectedCardIndex, updatedCard);
                            saveToHistory(currentCarousel);
                          }}
                        />
                      )}

                      {activeTab === 'typography' && (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-gray-300 font-inter font-medium text-sm mb-2">
                              Tamanho do Título
                            </label>
                            <input
                              type="range"
                              min="12"
                              max="24"
                              className="w-full"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-gray-300 font-inter font-medium text-sm mb-2">
                              Peso da Fonte
                            </label>
                            <select className="w-full bg-black border border-gray-700 rounded-lg px-3 py-2 text-white font-inter text-sm">
                              <option value="300">Light</option>
                              <option value="400">Regular</option>
                              <option value="500">Medium</option>
                              <option value="600">Semibold</option>
                              <option value="700">Bold</option>
                            </select>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};