import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';
import { CarouselCard } from '../../store/useAppStore';

interface CarouselPreview1080x1440Props {
  carousel: CarouselCard[];
}

export const CarouselPreview1080x1440: React.FC<CarouselPreview1080x1440Props> = ({ carousel }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);

  React.useEffect(() => {
    if (isAutoPlaying) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % carousel.length);
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [isAutoPlaying, carousel.length]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % carousel.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + carousel.length) % carousel.length);
  };

  const currentCard = carousel[currentIndex];

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Main Preview */}
      <div className="flex-1">
        <div className="relative bg-gray-900 rounded-xl overflow-hidden" style={{ aspectRatio: '1080/1440' }}>
          {/* Card Preview */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 flex flex-col"
              style={{ backgroundColor: currentCard.colors.background }}
            >
              {/* Image Section */}
              <div className="relative h-2/3 overflow-hidden">
                <img
                  src={currentCard.imageUrl}
                  alt={currentCard.title}
                  className="w-full h-full object-cover"
                />
                
                {/* Gradient Overlay */}
                <div 
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(to bottom, transparent 0%, ${currentCard.colors.background}99 70%, ${currentCard.colors.background} 100%)`
                  }}
                />

                {/* Card Number */}
                <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded-full font-inter text-xs">
                  {currentIndex + 1}/{carousel.length}
                </div>
              </div>

              {/* Content Section */}
              <div className="h-1/3 p-6 flex flex-col justify-center">
                <motion.h2
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="font-inter font-bold text-2xl mb-3 leading-tight"
                  style={{ color: currentCard.colors.primary }}
                >
                  {currentCard.title}
                </motion.h2>
                
                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="font-inter font-medium text-sm mb-4 opacity-80"
                  style={{ color: currentCard.colors.secondary }}
                >
                  {currentCard.subtitle}
                </motion.p>
                
                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="font-inter text-sm leading-relaxed"
                  style={{ color: currentCard.colors.text }}
                >
                  {currentCard.description}
                </motion.p>

                {/* Progress Bar */}
                <div className="mt-6">
                  <div className="flex gap-1">
                    {carousel.map((_, index) => (
                      <div
                        key={index}
                        className={`h-1 rounded-full transition-all duration-300 ${
                          index === currentIndex ? 'bg-white flex-1' : 'bg-white/30 w-8'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Controls */}
          <div className="absolute inset-y-0 left-0 flex items-center">
            <motion.button
              onClick={prevSlide}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="ml-4 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-all duration-200"
            >
              <ChevronLeft size={20} />
            </motion.button>
          </div>

          <div className="absolute inset-y-0 right-0 flex items-center">
            <motion.button
              onClick={nextSlide}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="mr-4 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-all duration-200"
            >
              <ChevronRight size={20} />
            </motion.button>
          </div>

          {/* Play/Pause Button */}
          <div className="absolute bottom-4 left-4">
            <motion.button
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className={`p-2 rounded-full transition-all duration-200 ${
                isAutoPlaying 
                  ? 'bg-red-500 hover:bg-red-600 text-white' 
                  : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
            >
              {isAutoPlaying ? <Pause size={16} /> : <Play size={16} />}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Card Thumbnails */}
      <div className="lg:w-64">
        <h4 className="text-white font-inter font-semibold text-sm mb-4">
          Cards do Carrossel
        </h4>
        
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {carousel.map((card, index) => (
            <motion.button
              key={card.id}
              onClick={() => setCurrentIndex(index)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full p-3 rounded-lg border text-left transition-all duration-200 ${
                currentIndex === index
                  ? 'border-[#1500FF] bg-[#1500FF]/10'
                  : 'border-gray-700 hover:border-gray-600'
              }`}
            >
              <div className="flex items-center gap-3">
                <img
                  src={card.imageUrl}
                  alt={card.title}
                  className="w-12 h-12 rounded object-cover"
                />
                
                <div className="flex-1 min-w-0">
                  <h5 className={`font-inter font-medium text-sm truncate ${
                    currentIndex === index ? 'text-[#1500FF]' : 'text-white'
                  }`}>
                    {card.title}
                  </h5>
                  <p className="text-gray-400 font-inter text-xs truncate">
                    {card.subtitle}
                  </p>
                </div>

                <div className="text-gray-400 font-inter text-xs">
                  {index + 1}
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
};