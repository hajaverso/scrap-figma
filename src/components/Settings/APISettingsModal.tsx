import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Settings, Eye, EyeOff, Check, AlertCircle, Loader, Key, Shield, ExternalLink, Info, Brain, Zap } from 'lucide-react';
import { apiConfigService } from '../../services/apiConfigService';

interface APISettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface APIField {
  key: 'apifyKey' | 'serpApiKey' | 'openaiKey' | 'geminiKey' | 'openRouterKey' | 'simpleScraperKey';
  label: string;
  description: string;
  placeholder: string;
  required: boolean;
  helpUrl: string;
  icon: React.ReactNode;
  category: 'scraping' | 'ai' | 'optional';
}

interface TestResult {
  isValid: boolean;
  message: string;
  status: 'success' | 'error' | 'warning';
}

export const APISettingsModal: React.FC<APISettingsModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    apifyKey: '',
    serpApiKey: '',
    openaiKey: '',
    geminiKey: '',
    openRouterKey: '',
    simpleScraperKey: ''
  });

  const [showPasswords, setShowPasswords] = useState({
    apifyKey: false,
    serpApiKey: false,
    openaiKey: false,
    geminiKey: false,
    openRouterKey: false,
    simpleScraperKey: false
  });

  const [testResults, setTestResults] = useState<{ [key: string]: TestResult | null }>({});
  const [testingStates, setTestingStates] = useState<{ [key: string]: boolean }>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const apiFields: APIField[] = [
    // Scraping APIs
    {
      key: 'apifyKey',
      label: 'Apify API Key',
      description: 'Para scraping profissional de dados web',
      placeholder: 'apify_api_...',
      required: true,
      helpUrl: 'https://docs.apify.com/api/v2#/introduction/authentication',
      icon: <Key size={16} className="text-blue-400" />,
      category: 'scraping'
    },
    {
      key: 'serpApiKey',
      label: 'SerpAPI Key',
      description: 'Para enriquecimento de dados de busca',
      placeholder: 'serpapi_key_...',
      required: true,
      helpUrl: 'https://serpapi.com/manage-api-key',
      icon: <Key size={16} className="text-green-400" />,
      category: 'scraping'
    },
    
    // AI APIs
    {
      key: 'openaiKey',
      label: 'OpenAI API Key',
      description: 'Para geração inteligente com GPT-4, GPT-3.5',
      placeholder: 'sk-...',
      required: true,
      helpUrl: 'https://platform.openai.com/api-keys',
      icon: <Brain size={16} className="text-purple-400" />,
      category: 'ai'
    },
    {
      key: 'geminiKey',
      label: 'Gemini API Key (Google)',
      description: 'Para geração com modelos Gemini Pro e Ultra',
      placeholder: 'AIza...',
      required: false,
      helpUrl: 'https://makersuite.google.com/app/apikey',
      icon: <Brain size={16} className="text-orange-400" />,
      category: 'ai'
    },
    {
      key: 'openRouterKey',
      label: 'OpenRouter API Key',
      description: 'Acesso a múltiplos modelos de IA (Claude, Llama, etc)',
      placeholder: 'sk-or-...',
      required: false,
      helpUrl: 'https://openrouter.ai/keys',
      icon: <Zap size={16} className="text-cyan-400" />,
      category: 'ai'
    },
    
    // Optional APIs
    {
      key: 'simpleScraperKey',
      label: 'SimpleScraper Key',
      description: 'Para scraping adicional (opcional)',
      placeholder: 'ss_key_...',
      required: false,
      helpUrl: 'https://simplescraper.io/api',
      icon: <Key size={16} className="text-yellow-400" />,
      category: 'optional'
    }
  ];

  const categories = [
    {
      id: 'scraping',
      title: 'APIs de Scraping',
      description: 'Para coleta e análise de dados web',
      icon: <Key size={20} className="text-blue-400" />,
      color: 'border-blue-800 bg-blue-900/20'
    },
    {
      id: 'ai',
      title: 'APIs de Inteligência Artificial',
      description: 'Para geração inteligente de conteúdo',
      icon: <Brain size={20} className="text-purple-400" />,
      color: 'border-purple-800 bg-purple-900/20'
    },
    {
      id: 'optional',
      title: 'APIs Opcionais',
      description: 'Funcionalidades extras e experimentais',
      icon: <Zap size={20} className="text-yellow-400" />,
      color: 'border-yellow-800 bg-yellow-900/20'
    }
  ];

  useEffect(() => {
    if (isOpen) {
      // Carregar configurações existentes
      const config = apiConfigService.getAllConfig();
      setFormData({
        apifyKey: config.apifyKey || '',
        serpApiKey: config.serpApiKey || '',
        openaiKey: config.openaiKey || '',
        geminiKey: config.geminiKey || '',
        openRouterKey: config.openRouterKey || '',
        simpleScraperKey: config.simpleScraperKey || ''
      });
      
      // Limpar estados
      setTestResults({});
      setTestingStates({});
      setSaveSuccess(false);
    }
  }, [isOpen]);

  const handleInputChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    // Limpar resultado do teste quando o valor muda
    setTestResults(prev => ({ ...prev, [key]: null }));
  };

  const togglePasswordVisibility = (key: string) => {
    setShowPasswords(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const testAPI = async (field: APIField) => {
    const apiKey = formData[field.key];
    if (!apiKey.trim()) return;

    setTestingStates(prev => ({ ...prev, [field.key]: true }));
    setTestResults(prev => ({ ...prev, [field.key]: null }));

    try {
      const result = await apiConfigService.testAPI(field.key, apiKey);
      setTestResults(prev => ({ ...prev, [field.key]: result }));
    } catch (error) {
      setTestResults(prev => ({ 
        ...prev, 
        [field.key]: {
          isValid: false,
          message: 'Erro ao testar API',
          status: 'error'
        }
      }));
    } finally {
      setTestingStates(prev => ({ ...prev, [field.key]: false }));
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      // Filtrar apenas chaves não vazias
      const configToSave = Object.entries(formData).reduce((acc, [key, value]) => {
        if (value.trim()) {
          acc[key as keyof typeof formData] = value.trim();
        }
        return acc;
      }, {} as any);

      apiConfigService.saveConfig(configToSave);
      setSaveSuccess(true);

      // Fechar modal após 2 segundos
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusIcon = (result: TestResult | null, isLoading: boolean) => {
    if (isLoading) {
      return <Loader size={16} className="animate-spin text-blue-400" />;
    }
    
    if (!result) return null;
    
    switch (result.status) {
      case 'success':
        return <Check size={16} className="text-green-400" />;
      case 'error':
        return <AlertCircle size={16} className="text-red-400" />;
      case 'warning':
        return <AlertCircle size={16} className="text-yellow-400" />;
      default:
        return null;
    }
  };

  const getStatusText = (result: TestResult | null, isLoading: boolean) => {
    if (isLoading) return 'Testando...';
    if (!result) return '';
    
    const prefix = result.isValid ? '✅ Conectado' : '❌ Inválido';
    return `${prefix}: ${result.message}`;
  };

  const getStatusColor = (result: TestResult | null) => {
    if (!result) return '';
    
    switch (result.status) {
      case 'success':
        return 'text-green-400 bg-green-900/20 border-green-800';
      case 'error':
        return 'text-red-400 bg-red-900/20 border-red-800';
      case 'warning':
        return 'text-yellow-400 bg-yellow-900/20 border-yellow-800';
      default:
        return '';
    }
  };

  const getFieldsByCategory = (categoryId: string) => {
    return apiFields.filter(field => field.category === categoryId);
  };

  const getConfiguredCount = (categoryId: string) => {
    const fields = getFieldsByCategory(categoryId);
    return fields.filter(field => formData[field.key].trim().length > 0).length;
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
            className="bg-[#111111] rounded-xl border border-gray-800 w-full max-w-6xl max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#1500FF]/20 rounded-lg">
                  <Settings size={24} className="text-[#1500FF]" />
                </div>
                <div>
                  <h3 className="text-white font-inter font-semibold text-xl">
                    Configurações de API
                  </h3>
                  <p className="text-gray-400 font-inter text-sm">
                    Configure suas chaves de API para ativar todas as funcionalidades do Haja®Yodea
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
            <div className="p-6">
              {/* Security Notice */}
              <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <Shield size={20} className="text-blue-400 mt-0.5" />
                  <div>
                    <h4 className="text-blue-400 font-inter font-semibold text-sm mb-1">
                      Segurança e Privacidade
                    </h4>
                    <p className="text-gray-300 font-inter text-sm">
                      Suas chaves de API são armazenadas localmente no seu navegador e nunca são enviadas para nossos servidores. 
                      Elas são usadas apenas para comunicação direta com os serviços de API.
                    </p>
                  </div>
                </div>
              </div>

              {/* API Categories */}
              <div className="space-y-8">
                {categories.map((category) => {
                  const fields = getFieldsByCategory(category.id);
                  const configuredCount = getConfiguredCount(category.id);
                  
                  return (
                    <div key={category.id} className={`border rounded-xl p-6 ${category.color}`}>
                      {/* Category Header */}
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          {category.icon}
                          <div>
                            <h4 className="text-white font-inter font-semibold text-lg">
                              {category.title}
                            </h4>
                            <p className="text-gray-400 font-inter text-sm">
                              {category.description}
                            </p>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-white font-inter font-bold text-lg">
                            {configuredCount}/{fields.length}
                          </div>
                          <div className="text-gray-400 font-inter text-xs">
                            Configuradas
                          </div>
                        </div>
                      </div>

                      {/* Category Fields */}
                      <div className="space-y-6">
                        {fields.map((field) => {
                          const isLoading = testingStates[field.key];
                          const result = testResults[field.key];
                          const hasValue = formData[field.key].trim().length > 0;
                          
                          return (
                            <div key={field.key} className="space-y-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  {field.icon}
                                  <label className="text-gray-300 font-inter font-medium text-sm">
                                    {field.label}
                                    {field.required && <span className="text-red-400 ml-1">*</span>}
                                  </label>
                                </div>
                                
                                <a
                                  href={field.helpUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 text-[#1500FF] hover:text-blue-400 font-inter text-xs transition-colors"
                                >
                                  <Info size={12} />
                                  Como obter
                                  <ExternalLink size={10} />
                                </a>
                              </div>

                              <p className="text-gray-400 font-inter text-xs">
                                {field.description}
                              </p>

                              <div className="flex gap-3">
                                <div className="flex-1 relative">
                                  <input
                                    type={showPasswords[field.key] ? 'text' : 'password'}
                                    value={formData[field.key]}
                                    onChange={(e) => handleInputChange(field.key, e.target.value)}
                                    placeholder={field.placeholder}
                                    className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 pr-12 text-white font-inter placeholder-gray-500 focus:outline-none focus:border-[#1500FF] transition-colors"
                                  />
                                  
                                  <button
                                    type="button"
                                    onClick={() => togglePasswordVisibility(field.key)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                                  >
                                    {showPasswords[field.key] ? <EyeOff size={18} /> : <Eye size={18} />}
                                  </button>
                                </div>
                                
                                <motion.button
                                  type="button"
                                  onClick={() => testAPI(field)}
                                  disabled={!hasValue || isLoading}
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-3 rounded-lg font-inter font-medium text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                  {getStatusIcon(result, isLoading)}
                                  Testar
                                </motion.button>
                              </div>

                              {/* Test Result */}
                              {(result || isLoading) && (
                                <motion.div
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className={`p-3 rounded-lg border text-sm font-inter ${getStatusColor(result)}`}
                                >
                                  {getStatusText(result, isLoading)}
                                </motion.div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Quick Setup Guide */}
              <div className="mt-8 bg-gray-900/50 rounded-lg p-6 border border-gray-700">
                <h4 className="text-white font-inter font-semibold text-lg mb-4">
                  🚀 Guia de Configuração Rápida
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm font-inter">
                  <div className="space-y-2">
                    <h5 className="text-blue-400 font-medium">1. Scraping Básico</h5>
                    <p className="text-gray-400">Configure Apify + SerpAPI para análise completa de tendências</p>
                  </div>
                  
                  <div className="space-y-2">
                    <h5 className="text-purple-400 font-medium">2. IA Inteligente</h5>
                    <p className="text-gray-400">Adicione OpenAI, Gemini ou OpenRouter para geração avançada</p>
                  </div>
                  
                  <div className="space-y-2">
                    <h5 className="text-yellow-400 font-medium">3. Extras</h5>
                    <p className="text-gray-400">SimpleScraper para funcionalidades experimentais</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-6 mt-6 border-t border-gray-800">
                <div className="text-gray-500 font-inter text-xs">
                  * Campos obrigatórios para funcionalidade completa
                </div>
                
                <div className="flex gap-3">
                  <motion.button
                    onClick={onClose}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-inter font-medium transition-all duration-200"
                  >
                    Cancelar
                  </motion.button>
                  
                  <motion.button
                    onClick={handleSave}
                    disabled={isSaving}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-[#1500FF] hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-inter font-medium transition-all duration-200 disabled:opacity-50 flex items-center gap-2"
                  >
                    {isSaving ? (
                      <>
                        <Loader size={16} className="animate-spin" />
                        Salvando...
                      </>
                    ) : saveSuccess ? (
                      <>
                        <Check size={16} />
                        Salvo!
                      </>
                    ) : (
                      'Salvar Configurações'
                    )}
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};