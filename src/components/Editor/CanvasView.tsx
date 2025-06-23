import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ZoomIn, ZoomOut, Move, RotateCcw, Layers, Eye, EyeOff, Copy, Trash2 } from 'lucide-react';
import { CarouselCard } from '../../store/useAppStore';

interface CanvasViewProps {
  cards: CarouselCard[];
  selectedIndex: number | null;
  onCardSelect: (index: number) => void;
  onCardUpdate: (index: number, card: CarouselCard) => void;
}

export const CanvasView: React.FC<CanvasViewProps> = ({ 
  cards, 
  selectedIndex, 
  onCardSelect, 
  onCardUpdate 
}) => {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showGrid, setShowGrid] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.1, 2));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.5));
  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const currentCard = cards[currentSlide];

  return (
    <div className="h-[80vh] relative bg-gray-900 overflow-hidden">
      {/* Canvas Toolbar */}
      <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between">
        <div className="flex items-center gap-2 bg-black/80 backdrop-blur rounded-lg p-2">
          <motion.button
            onClick={handleZoomOut}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 text-gray-400 hover:text-white rounded-lg transition-colors"
          >
            <ZoomOut size={16} />
          </motion.button>
          
          <span className="text-white font-inter text-sm px-2">
            {Math.round(zoom * 100)}%
          </span>
          
          <motion.button
            onClick={handleZoomIn}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 text-gray-400 hover:text-white rounded-lg transition-colors"
          >
            <ZoomIn size={16} />
          </motion.button>
          
          <div className="w-px h-6 bg-gray-700 mx-1" />
          
          <motion.button
            onClick={handleResetView}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 text-gray-400 hover:text-white rounded-lg transition-colors"
          >
            <RotateCcw size={16} />
          </motion.button>
          
          <motion.button
            onClick={() => setShowGrid(!showGrid)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={`p-2 rounded-lg transition-colors ${
              showGrid ? 'text-[#1500FF]' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Layers size={16} />
          </motion.button>
        </div>

        <div className="flex items-center gap-2 bg-black/80 backdrop-blur rounded-lg p-2">
          <span className="text-gray-400 font-inter text-sm">
            {currentSlide + 1} / {cards.length}
          </span>
        </div>
      </div>

      {/* Canvas */}
      <div
        ref={canvasRef}
        className="w-full h-full relative cursor-move select-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Grid Background */}
        {showGrid && (
          <div 
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `
                linear-gradient(to right, #374151 1px, transparent 1px),
                linear-gradient(to bottom, #374151 1px, transparent 1px)
              `,
              backgroundSize: '20px 20px',
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`
            }}
          />
        )}

        {/* Canvas Content */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`
          }}
        >
          {/* Main Card Display - Instagram Story Format */}
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="relative bg-white rounded-2xl shadow-2xl overflow-hidden"
            style={{ 
              width: '324px', 
              height: '576px', // 1080x1920 scaled down (1080/1920 = 0.5625, 324*1.77 = 576)
              aspectRatio: '9/16'
            }}
          >
            {/* Card Content */}
            <div 
              className="w-full h-full relative"
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
                <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full font-inter text-xs">
                  {currentSlide + 1}/{cards.length}
                </div>
              </div>

              {/* Content Section */}
              <div className="h-1/3 p-6 flex flex-col justify-center">
                <h2
                  className="font-inter font-bold text-xl mb-2 leading-tight"
                  style={{ color: currentCard.colors.primary }}
                >
                  {currentCard.title}
                </h2>
                
                <p
                  className="font-inter font-medium text-sm mb-3 opacity-80"
                  style={{ color: currentCard.colors.secondary }}
                >
                  {currentCard.subtitle}
                </p>
                
                <p
                  className="font-inter text-xs leading-relaxed"
                  style={{ color: currentCard.colors.text }}
                >
                  {currentCard.description}
                </p>

                {/* Progress Indicators */}
                <div className="mt-4 flex gap-1">
                  {cards.map((_, index) => (
                    <div
                      key={index}
                      className={`h-1 rounded-full transition-all duration-300 ${
                        index === currentSlide ? 'bg-white flex-1' : 'bg-white/30 w-6'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Selection Indicator */}
            {selectedIndex === currentSlide && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 border-2 border-[#1500FF] rounded-2xl pointer-events-none"
              />
            )}
          </motion.div>
        </div>
      </div>

      {/* Card Navigation */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
        <div className="bg-black/80 backdrop-blur rounded-lg p-2 flex items-center gap-2">
          {cards.map((card, index) => (
            <motion.button
              key={card.id}
              onClick={() => {
                setCurrentSlide(index);
                onCardSelect(index);
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                currentSlide === index 
                  ? 'border-[#1500FF]' 
                  : 'border-gray-600 hover:border-gray-500'
              }`}
            >
              <img
                src={card.imageUrl}
                alt={card.title}
                className="w-full h-full object-cover"
              />
            </motion.button>
          ))}
        </div>
      </div>

      {/* Card Info Panel */}
      <div className="absolute top-20 right-4 w-80 bg-black/80 backdrop-blur rounded-lg p-4 z-10">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-white font-inter font-semibold text-sm">
            Card {currentSlide + 1} - {currentCard.style}
          </h4>
          <div className="flex gap-1">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-1 text-gray-400 hover:text-white rounded transition-colors"
            >
              <Copy size={14} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-1 text-gray-400 hover:text-red-400 rounded transition-colors"
            >
              <Trash2 size={14} />
            </motion.button>
          </div>
        </div>

        <div className="space-y-2 text-xs font-inter">
          <div className="flex justify-between">
            <span className="text-gray-400">Título:</span>
            <span className="text-white">{currentCard.title.length}/60</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Subtítulo:</span>
            <span className="text-white">{currentCard.subtitle.length}/80</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Descrição:</span>
            <span className="text-white">{currentCard.description.length}/150</span>
          </div>
        </div>

        {/* Color Palette */}
        <div className="mt-3">
          <span className="text-gray-400 font-inter text-xs">Paleta:</span>
          <div className="flex gap-1 mt-1">
            {Object.values(currentCard.colors).map((color, index) => (
              <div
                key={index}
                className="w-4 h-4 rounded border border-gray-600"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};