import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Palette, Droplet, RefreshCw } from 'lucide-react';
import { CarouselCard } from '../../store/useAppStore';

interface ColorPaletteProps {
  card: CarouselCard;
  onUpdate: (updatedCard: CarouselCard) => void;
}

export const ColorPalette: React.FC<ColorPaletteProps> = ({ card, onUpdate }) => {
  const [selectedColorType, setSelectedColorType] = useState<keyof typeof card.colors>('primary');

  const colorPresets = [
    {
      name: 'Azul Moderno',
      colors: {
        primary: '#1500FF',
        secondary: '#6366F1',
        text: '#FFFFFF',
        background: '#111111'
      }
    },
    {
      name: 'Vermelho Ousado',
      colors: {
        primary: '#EF4444',
        secondary: '#F97316',
        text: '#FFFFFF',
        background: '#000000'
      }
    },
    {
      name: 'Verde Natureza',
      colors: {
        primary: '#22C55E',
        secondary: '#10B981',
        text: '#FFFFFF',
        background: '#0F172A'
      }
    },
    {
      name: 'Roxo Elegante',
      colors: {
        primary: '#8B5CF6',
        secondary: '#A855F7',
        text: '#FFFFFF',
        background: '#1F1B2E'
      }
    },
    {
      name: 'Minimalista',
      colors: {
        primary: '#374151',
        secondary: '#6B7280',
        text: '#1F2937',
        background: '#F9FAFB'
      }
    },
    {
      name: 'Dourado Premium',
      colors: {
        primary: '#D4A574',
        secondary: '#F3E8D0',
        text: '#1F2937',
        background: '#FEFEFE'
      }
    }
  ];

  const handleColorChange = (colorType: keyof typeof card.colors, color: string) => {
    onUpdate({
      ...card,
      colors: {
        ...card.colors,
        [colorType]: color
      }
    });
  };

  const applyPreset = (preset: typeof colorPresets[0]) => {
    onUpdate({
      ...card,
      colors: preset.colors
    });
  };

  const generateRandomColors = () => {
    const hue = Math.floor(Math.random() * 360);
    const saturation = 60 + Math.random() * 40; // 60-100%
    const primaryLightness = 45 + Math.random() * 10; // 45-55%
    const secondaryLightness = primaryLightness + 10;

    const newColors = {
      primary: `hsl(${hue}, ${saturation}%, ${primaryLightness}%)`,
      secondary: `hsl(${(hue + 30) % 360}, ${saturation - 10}%, ${secondaryLightness}%)`,
      text: primaryLightness > 50 ? '#000000' : '#FFFFFF',
      background: primaryLightness > 50 ? '#FFFFFF' : '#111111'
    };

    onUpdate({
      ...card,
      colors: newColors
    });
  };

  const colorLabels = {
    primary: 'Cor Primária',
    secondary: 'Cor Secundária',
    text: 'Cor do Texto',
    background: 'Cor de Fundo'
  };

  return (
    <div className="space-y-6">
      {/* Color Type Selector */}
      <div>
        <h5 className="text-white font-inter font-semibold text-base mb-4">
          Paleta de Cores
        </h5>
        
        <div className="grid grid-cols-2 gap-2 mb-4">
          {Object.entries(colorLabels).map(([type, label]) => (
            <motion.button
              key={type}
              onClick={() => setSelectedColorType(type as keyof typeof card.colors)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex items-center gap-2 p-3 rounded-lg font-inter font-medium text-xs transition-all duration-200 ${
                selectedColorType === type
                  ? 'bg-[#1500FF] text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              <div
                className="w-4 h-4 rounded-full border border-gray-600"
                style={{ backgroundColor: card.colors[type as keyof typeof card.colors] }}
              />
              {label}
            </motion.button>
          ))}
        </div>

        {/* Color Picker */}
        <div className="space-y-3">
          <label className="text-gray-300 font-inter font-medium text-sm">
            {colorLabels[selectedColorType]}
          </label>
          
          <div className="flex gap-3">
            <input
              type="color"
              value={card.colors[selectedColorType]}
              onChange={(e) => handleColorChange(selectedColorType, e.target.value)}
              className="w-12 h-12 bg-transparent border-2 border-gray-700 rounded-lg cursor-pointer"
            />
            
            <input
              type="text"
              value={card.colors[selectedColorType]}
              onChange={(e) => handleColorChange(selectedColorType, e.target.value)}
              placeholder="#000000"
              className="flex-1 bg-black border border-gray-700 rounded-lg px-3 py-2 text-white font-inter text-sm focus:outline-none focus:border-[#1500FF] transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2">
        <motion.button
          onClick={generateRandomColors}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex-1 bg-[#1500FF] hover:bg-blue-600 text-white py-2 rounded-lg font-inter font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2"
        >
          <RefreshCw size={14} />
          Aleatório
        </motion.button>
      </div>

      {/* Presets */}
      <div>
        <h6 className="text-gray-300 font-inter font-medium text-sm mb-3">
          Paletas Prontas
        </h6>
        
        <div className="grid grid-cols-1 gap-2">
          {colorPresets.map((preset, index) => (
            <motion.button
              key={index}
              onClick={() => applyPreset(preset)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center justify-between p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-all duration-200"
            >
              <span className="text-white font-inter font-medium text-sm">
                {preset.name}
              </span>
              
              <div className="flex gap-1">
                {Object.values(preset.colors).map((color, colorIndex) => (
                  <div
                    key={colorIndex}
                    className="w-4 h-4 rounded-full border border-gray-600"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Color Preview */}
      <div>
        <h6 className="text-gray-300 font-inter font-medium text-sm mb-3">
          Preview das Cores
        </h6>
        
        <div 
          className="rounded-lg p-4 border border-gray-700"
          style={{ backgroundColor: card.colors.background }}
        >
          <h6 
            className="font-inter font-semibold text-lg mb-2"
            style={{ color: card.colors.primary }}
          >
            Título do Card
          </h6>
          
          <p 
            className="font-inter text-sm mb-3"
            style={{ color: card.colors.secondary }}
          >
            Subtítulo do card com cor secundária
          </p>
          
          <p 
            className="font-inter text-sm"
            style={{ color: card.colors.text }}
          >
            Este é o texto principal do card usando a cor definida para texto.
          </p>
        </div>
      </div>
    </div>
  );
};