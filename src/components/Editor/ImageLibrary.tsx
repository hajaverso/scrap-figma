import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Image, Upload, Search, Link, RefreshCw } from 'lucide-react';
import { CarouselCard } from '../../store/useAppStore';

interface ImageLibraryProps {
  card: CarouselCard;
  onUpdate: (updatedCard: CarouselCard) => void;
}

export const ImageLibrary: React.FC<ImageLibraryProps> = ({ card, onUpdate }) => {
  const [imageUrl, setImageUrl] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Biblioteca de imagens stock do Pexels
  const stockImages = [
    {
      category: 'Tecnologia',
      images: [
        'https://images.pexels.com/photos/3184431/pexels-photo-3184431.jpeg?w=400',
        'https://images.pexels.com/photos/577585/pexels-photo-577585.jpeg?w=400',
        'https://images.pexels.com/photos/374918/pexels-photo-374918.jpeg?w=400',
        'https://images.pexels.com/photos/1181359/pexels-photo-1181359.jpeg?w=400'
      ]
    },
    {
      category: 'Business',
      images: [
        'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?w=400',
        'https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg?w=400',
        'https://images.pexels.com/photos/3184436/pexels-photo-3184436.jpeg?w=400',
        'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?w=400'
      ]
    },
    {
      category: 'Design',
      images: [
        'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?w=400',
        'https://images.pexels.com/photos/1779487/pexels-photo-1779487.jpeg?w=400',
        'https://images.pexels.com/photos/159751/book-address-book-learning-learn-159751.jpeg?w=400',
        'https://images.pexels.com/photos/265087/pexels-photo-265087.jpeg?w=400'
      ]
    },
    {
      category: 'Inovação',
      images: [
        'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?w=400',
        'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?w=400',
        'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?w=400',
        'https://images.pexels.com/photos/3183153/pexels-photo-3183153.jpeg?w=400'
      ]
    }
  ];

  const handleImageSelect = (imageUrl: string) => {
    onUpdate({
      ...card,
      imageUrl
    });
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (imageUrl.trim()) {
      handleImageSelect(imageUrl.trim());
      setImageUrl('');
    }
  };

  const generateRandomImage = () => {
    const allImages = stockImages.flatMap(category => category.images);
    const randomImage = allImages[Math.floor(Math.random() * allImages.length)];
    handleImageSelect(randomImage);
  };

  const filteredCategories = stockImages.filter(category =>
    searchTerm === '' || 
    category.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Current Image */}
      <div>
        <h5 className="text-white font-inter font-semibold text-base mb-4">
          Imagem Atual
        </h5>
        
        <div className="relative group">
          <img
            src={card.imageUrl}
            alt="Imagem atual"
            className="w-full h-32 object-cover rounded-lg border border-gray-700"
          />
          
          <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center">
            <motion.button
              onClick={generateRandomImage}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="bg-[#1500FF] text-white p-2 rounded-lg"
            >
              <RefreshCw size={16} />
            </motion.button>
          </div>
        </div>
      </div>

      {/* URL Input */}
      <div>
        <h6 className="text-gray-300 font-inter font-medium text-sm mb-3">
          URL da Imagem
        </h6>
        
        <form onSubmit={handleUrlSubmit} className="flex gap-2">
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://exemplo.com/imagem.jpg"
            className="flex-1 bg-black border border-gray-700 rounded-lg px-3 py-2 text-white font-inter text-sm focus:outline-none focus:border-[#1500FF] transition-colors"
          />
          
          <motion.button
            type="submit"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-[#1500FF] hover:bg-blue-600 text-white p-2 rounded-lg transition-all duration-200"
          >
            <Link size={16} />
          </motion.button>
        </form>
      </div>

      {/* Search */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Search size={16} className="text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por categoria..."
            className="flex-1 bg-black border border-gray-700 rounded-lg px-3 py-2 text-white font-inter text-sm focus:outline-none focus:border-[#1500FF] transition-colors"
          />
        </div>
      </div>

      {/* Stock Images */}
      <div>
        <h6 className="text-gray-300 font-inter font-medium text-sm mb-3">
          Biblioteca de Imagens
        </h6>
        
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {filteredCategories.map((category) => (
            <div key={category.category}>
              <h6 className="text-white font-inter font-medium text-xs mb-2">
                {category.category}
              </h6>
              
              <div className="grid grid-cols-2 gap-2">
                {category.images.map((image, index) => (
                  <motion.button
                    key={index}
                    onClick={() => handleImageSelect(image)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`relative overflow-hidden rounded-lg border-2 transition-all duration-200 ${
                      card.imageUrl === image
                        ? 'border-[#1500FF]'
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${category.category} ${index + 1}`}
                      className="w-full h-20 object-cover"
                    />
                    
                    {card.imageUrl === image && (
                      <div className="absolute inset-0 bg-[#1500FF] bg-opacity-20 flex items-center justify-center">
                        <div className="bg-[#1500FF] text-white px-2 py-1 rounded text-xs font-inter font-medium">
                          Selecionada
                        </div>
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upload Hint */}
      <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800">
        <div className="flex items-start gap-3">
          <Upload size={16} className="text-gray-400 mt-0.5" />
          <div>
            <h6 className="text-gray-300 font-inter font-medium text-sm mb-1">
              Dica de Upload
            </h6>
            <p className="text-gray-400 font-inter text-xs">
              Para melhores resultados, use imagens com pelo menos 400x300 pixels.
              Formatos recomendados: JPG, PNG, WebP.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};