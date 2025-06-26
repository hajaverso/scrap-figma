import React from 'react';
import { motion } from 'framer-motion';
import { Search, Layers, Eye, Menu, X, BarChart3, Edit3 } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, sidebarOpen, toggleSidebar, generatedCarousels } = useAppStore();

  const menuItems = [
    { id: 'dashboard', label: 'Analytics', icon: BarChart3 },
    { id: 'scraping', label: 'Scraping Pro', icon: Search },
    { id: 'carousel', label: 'Gerador IA', icon: Layers },
    { id: 'editor', label: 'Editor Canvas', icon: Edit3 },
    { id: 'preview', label: 'Preview & Export', icon: Eye }
  ];

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden fixed top-4 left-4 z-50 bg-[#1500FF] text-white p-2 rounded-lg"
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <motion.div
        initial={{ x: -280 }}
        animate={{ x: sidebarOpen ? 0 : -280 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="fixed left-0 top-0 h-full w-70 bg-[#111111] border-r border-gray-800 z-40 lg:relative lg:translate-x-0"
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 bg-[#1500FF] rounded-lg flex items-center justify-center">
              <Layers size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-white font-inter font-semibold text-lg">Scrap Pro</h1>
              <p className="text-gray-400 font-inter text-xs">Sistema Inteligente</p>
            </div>
          </div>

          <nav className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <motion.button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-inter font-medium transition-all duration-200 ${
                    isActive 
                      ? 'bg-[#1500FF] text-white' 
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                  whileHover={{ x: isActive ? 0 : 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Icon size={20} />
                  <span className="flex-1 text-left">{item.label}</span>
                  
                  {/* Status indicators */}
                  {item.id === 'dashboard' && (
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  )}
                  
                  {item.id === 'editor' && generatedCarousels.length > 0 && (
                    <div className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                      {generatedCarousels.length}
                    </div>
                  )}
                  
                  {item.id === 'preview' && generatedCarousels.length > 0 && (
                    <div className="bg-green-500 text-black px-2 py-1 rounded-full text-xs font-bold">
                      {generatedCarousels.length}
                    </div>
                  )}
                </motion.button>
              );
            })}
          </nav>

          {/* Quick Stats */}
          <div className="mt-8 space-y-3">
            <div className="bg-gray-800 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-white font-inter text-sm font-medium">Sistema Status</span>
              </div>
              <p className="text-gray-400 font-inter text-xs">Conectado e operacional</p>
            </div>

            {generatedCarousels.length > 0 && (
              <div className="bg-[#1500FF]/20 border border-[#1500FF]/30 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Edit3 size={14} className="text-[#1500FF]" />
                  <span className="text-[#1500FF] font-inter text-sm font-medium">Carrosséis</span>
                </div>
                <p className="text-gray-300 font-inter text-xs">
                  {generatedCarousels.length} prontos para edição
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-6 left-6 right-6">
          <div className="bg-gray-800 rounded-lg p-4 text-center">
            <div className="text-green-400 font-inter text-lg font-bold mb-1">
              98/100
            </div>
            <div className="text-gray-400 font-inter text-xs">
              API Rate Limit
            </div>
            <div className="w-full bg-gray-700 rounded-full h-1 mt-2">
              <div className="bg-green-500 h-1 rounded-full" style={{ width: '98%' }} />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={toggleSidebar}
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
        />
      )}
    </>
  );
};