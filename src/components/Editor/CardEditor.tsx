import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Edit2, Check, X } from 'lucide-react';
import { CarouselCard } from '../../store/useAppStore';

interface CardEditorProps {
  card: CarouselCard;
  onUpdate: (updatedCard: CarouselCard) => void;
}

export const CardEditor: React.FC<CardEditorProps> = ({ card, onUpdate }) => {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValues, setTempValues] = useState({
    title: card.title,
    subtitle: card.subtitle,
    description: card.description
  });

  const handleStartEdit = (field: string) => {
    setEditingField(field);
    setTempValues({
      title: card.title,
      subtitle: card.subtitle,
      description: card.description
    });
  };

  const handleSaveEdit = () => {
    if (editingField) {
      onUpdate({
        ...card,
        [editingField]: tempValues[editingField as keyof typeof tempValues]
      });
      setEditingField(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingField(null);
    setTempValues({
      title: card.title,
      subtitle: card.subtitle,
      description: card.description
    });
  };

  const renderEditableField = (
    field: keyof typeof tempValues,
    label: string,
    placeholder: string,
    isTextarea = false
  ) => {
    const isEditing = editingField === field;
    const InputComponent = isTextarea ? 'textarea' : 'input';

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-gray-300 font-inter font-medium text-sm">
            {label}
          </label>
          
          {!isEditing && (
            <motion.button
              onClick={() => handleStartEdit(field)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-1 text-gray-400 hover:text-white transition-colors"
            >
              <Edit2 size={14} />
            </motion.button>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-2">
            <InputComponent
              value={tempValues[field]}
              onChange={(e) => setTempValues(prev => ({
                ...prev,
                [field]: e.target.value
              }))}
              placeholder={placeholder}
              className="w-full bg-black border border-gray-700 rounded-lg px-3 py-2 text-white font-inter text-sm focus:outline-none focus:border-[#1500FF] transition-colors resize-none"
              rows={isTextarea ? 3 : undefined}
              autoFocus
            />
            
            <div className="flex gap-2">
              <motion.button
                onClick={handleSaveEdit}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-inter font-medium text-sm transition-all duration-200 flex items-center justify-center gap-1"
              >
                <Check size={14} />
                Salvar
              </motion.button>
              
              <motion.button
                onClick={handleCancelEdit}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg font-inter font-medium text-sm transition-all duration-200 flex items-center justify-center gap-1"
              >
                <X size={14} />
                Cancelar
              </motion.button>
            </div>
          </div>
        ) : (
          <div className="bg-gray-900 rounded-lg p-3 border border-gray-800">
            <p className="text-white font-inter text-sm">
              {card[field] || placeholder}
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h5 className="text-white font-inter font-semibold text-base mb-4">
          Editar Conteúdo
        </h5>
        
        <div className="space-y-4">
          {renderEditableField('title', 'Título', 'Digite o título do card')}
          {renderEditableField('subtitle', 'Subtítulo', 'Digite o subtítulo')}
          {renderEditableField('description', 'Descrição', 'Digite a descrição', true)}
        </div>
      </div>

      {/* Style Preview */}
      <div>
        <h6 className="text-gray-300 font-inter font-medium text-sm mb-2">
          Estilo Atual
        </h6>
        
        <div className="bg-gray-900 rounded-lg p-3 border border-gray-800">
          <div className="flex items-center justify-between">
            <span className="text-white font-inter text-sm capitalize">
              {card.style}
            </span>
            
            <div className="flex gap-1">
              {Object.values(card.colors).slice(0, 3).map((color, index) => (
                <div
                  key={index}
                  className="w-4 h-4 rounded-full border border-gray-600"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Character Limits */}
      <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-800">
        <h6 className="text-gray-300 font-inter font-medium text-xs mb-2">
          Limites de Caracteres
        </h6>
        
        <div className="space-y-1 text-xs font-inter">
          <div className="flex justify-between text-gray-400">
            <span>Título:</span>
            <span className={card.title.length > 60 ? 'text-red-400' : 'text-green-400'}>
              {card.title.length}/60
            </span>
          </div>
          
          <div className="flex justify-between text-gray-400">
            <span>Subtítulo:</span>
            <span className={card.subtitle.length > 80 ? 'text-red-400' : 'text-green-400'}>
              {card.subtitle.length}/80
            </span>
          </div>
          
          <div className="flex justify-between text-gray-400">
            <span>Descrição:</span>
            <span className={card.description.length > 150 ? 'text-red-400' : 'text-green-400'}>
              {card.description.length}/150
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};