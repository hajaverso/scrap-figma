import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Key, Eye, EyeOff, ExternalLink, Check, AlertCircle } from 'lucide-react';
import { openAIService } from '../../services/openAIService';

interface APIKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export const APIKeyModal: React.FC<APIKeyModalProps> = ({ isOpen, onClose, onSave }) => {
  const [apiKey, setApiKey] = useState(openAIService.getApiKey() || '');
  const [showKey, setShowKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(false);

  const handleSave = async () => {
    if (!apiKey.trim()) {
      setError('API Key é obrigatória');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      openAIService.setApiKey(apiKey.trim());
      const isValidKey = await openAIService.testConnection();
      
      if (isValidKey) {
        setIsValid(true);
        setTimeout(() => {
          onSave();
          onClose();
        }, 1000);
      } else {
        setError('API Key inválida. Verifique se está correta.');
        openAIService.clearApiKey();
      }
    } catch (error) {
      setError('Erro ao validar API Key. Tente novamente.');
      openAIService.clearApiKey();
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = () => {
    openAIService.clearApiKey();
    setApiKey('');
    setIsValid(false);
    onSave();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-[#111111] rounded-xl border border-gray-800 p-6 w-full max-w-md"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#1500FF]/20 rounded-lg">
                  <Key size={20} className="text-[#1500FF]" />
                </div>
                <div>
                  <h3 className="text-white font-inter font-semibold text-lg">
                    Configurar OpenAI
                  </h3>
                  <p className="text-gray-400 font-inter text-sm">
                    Configure sua API key para usar IA
                  </p>
                </div>
              </div>
              
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all duration-200"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="space-y-4">
              {/* API Key Input */}
              <div>
                <label className="block text-gray-300 font-inter font-medium text-sm mb-2">
                  OpenAI API Key
                </label>
                
                <div className="relative">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="sk-..."
                    className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 pr-12 text-white font-inter placeholder-gray-500 focus:outline-none focus:border-[#1500FF] transition-colors"
                    disabled={isLoading}
                  />
                  
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Info */}
              <div className="bg-gray-900 rounded-lg p-4">
                <h4 className="text-white font-inter font-medium text-sm mb-2">
                  Como obter sua API Key:
                </h4>
                <ol className="text-gray-400 font-inter text-sm space-y-1 list-decimal list-inside">
                  <li>Acesse platform.openai.com</li>
                  <li>Faça login em sua conta</li>
                  <li>Vá em "API Keys" no menu</li>
                  <li>Clique em "Create new secret key"</li>
                  <li>Copie e cole aqui</li>
                </ol>
                
                <a
                  href="https://platform.openai.com/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[#1500FF] hover:text-blue-400 font-inter text-sm mt-2 transition-colors"
                >
                  <ExternalLink size={14} />
                  Abrir OpenAI Platform
                </a>
              </div>

              {/* Status */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 text-red-400 font-inter text-sm bg-red-900/20 p-3 rounded-lg"
                >
                  <AlertCircle size={16} />
                  {error}
                </motion.div>
              )}

              {isValid && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 text-green-400 font-inter text-sm bg-green-900/20 p-3 rounded-lg"
                >
                  <Check size={16} />
                  API Key validada com sucesso!
                </motion.div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                {openAIService.getApiKey() && (
                  <button
                    onClick={handleRemove}
                    disabled={isLoading}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-inter font-medium transition-all duration-200 disabled:opacity-50"
                  >
                    Remover Key
                  </button>
                )}
                
                <button
                  onClick={handleSave}
                  disabled={isLoading || !apiKey.trim() || isValid}
                  className="flex-1 bg-[#1500FF] hover:bg-blue-600 text-white py-3 rounded-lg font-inter font-medium transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                      Validando...
                    </>
                  ) : isValid ? (
                    <>
                      <Check size={16} />
                      Validado
                    </>
                  ) : (
                    'Salvar e Validar'
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};