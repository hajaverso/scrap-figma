import React from 'react';
import { motion } from 'framer-motion';
import { Download, Copy, Edit3, Trash2, Eye } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

export const CarouselPreview: React.FC = () => {
  const { generatedCarousels } = useAppStore();

  if (generatedCarousels.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12"
      >
        <Eye size={48} className="text-gray-600 mx-auto mb-4" />
        <h3 className="text-white font-inter font-medium text-lg mb-2">
          Nenhum carrossel gerado
        </h3>
        <p className="text-gray-400 font-inter">
          Gere carrosséis na aba "Carrossel IA" para visualizá-los aqui
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-8">
      {generatedCarousels.map((carousel, carouselIndex) => (
        <motion.div
          key={carouselIndex}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: carouselIndex * 0.1 }}
          className="bg-[#111111] rounded-xl border border-gray-800 overflow-hidden"
        >
          {/* Carousel Header */}
          <div className="p-6 border-b border-gray-800 flex items-center justify-between">
            <div>
              <h3 className="text-white font-inter font-semibold text-lg">
                Carrossel #{carouselIndex + 1}
              </h3>
              <p className="text-gray-400 font-inter text-sm">
                {carousel.length} cards • Gerado em {new Date().toLocaleDateString('pt-BR')}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all duration-200"
              >
                <Edit3 size={18} />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all duration-200"
              >
                <Copy size={18} />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 bg-[#1500FF] text-white px-4 py-2 rounded-lg font-inter font-medium text-sm transition-all duration-200 hover:bg-blue-600"
              >
                <Download size={16} />
                Exportar
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-all duration-200"
              >
                <Trash2 size={18} />
              </motion.button>
            </div>
          </div>

          {/* Carousel Cards */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {carousel.map((card, cardIndex) => (
                <motion.div
                  key={card.id}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: cardIndex * 0.05 }}
                  className="group cursor-pointer"
                >
                  <div className="bg-gradient-to-br from-gray-900 to-black rounded-xl overflow-hidden border border-gray-800 hover:border-gray-700 transition-colors">
                    {/* Card Image */}
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={card.imageUrl}
                        alt={card.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      
                      {/* Style Badge */}
                      <div className="absolute top-3 right-3">
                        <span className="bg-[#1500FF] text-white px-2 py-1 rounded text-xs font-inter font-medium">
                          {card.style}
                        </span>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-4">
                      <h4 className="text-white font-inter font-semibold text-lg mb-2 line-clamp-2">
                        {card.title}
                      </h4>
                      
                      <p className="text-gray-400 font-inter text-sm mb-3 line-clamp-2">
                        {card.subtitle}
                      </p>
                      
                      <p className="text-gray-300 font-inter text-sm line-clamp-3">
                        {card.description}
                      </p>

                      {/* Color Palette */}
                      <div className="flex items-center gap-2 mt-4">
                        <span className="text-gray-500 font-inter text-xs">Cores:</span>
                        <div className="flex gap-1">
                          {Object.values(card.colors).map((color, index) => (
                            <div
                              key={index}
                              className="w-4 h-4 rounded-full border border-gray-700"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};