import React from 'react';
import { motion } from 'framer-motion';
import { Search, Layers, Eye, Edit3, Menu, X, BarChart3 } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, sidebarOpen, toggleSidebar, generatedCarousels } = useAppStore();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'scraping', label: 'Scraping', icon: Search },
    { id: 'carousel', label: 'Carrossel IA', icon: Layers },
    { id: 'editor', label: 'Editor Visual', icon: Edit3, disabled: generatedCarousels.length === 0 },
    { id: 'preview', label: 'Preview', icon: Eye }
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
            <h1 className="text-white font-inter font-semibold text-lg">Analytics Pro</h1>
          </div>

          <nav className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              const isDisabled = item.disabled;
              
              return (
                <motion.button
                  key={item.id}
                  onClick={() => !isDisabled && setActiveTab(item.id as any)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-inter font-medium transition-all duration-200 ${
                    isDisabled
                      ? 'text-gray-600 cursor-not-allowed'
                      : isActive 
                        ? 'bg-[#1500FF] text-white' 
                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                  whileHover={{ x: isActive || isDisabled ? 0 : 4 }}
                  whileTap={{ scale: isDisabled ? 1 : 0.98 }}
                >
                  <Icon size={20} />
                  {item.label}
                  {item.id === 'editor' && generatedCarousels.length > 0 && (
                    <div className="ml-auto w-2 h-2 bg-green-500 rounded-full"></div>
                  )}
                  {item.id === 'dashboard' && (
                    <div className="ml-auto w-2 h-2 bg-[#1500FF] rounded-full animate-pulse"></div>
                  )}
                </motion.button>
              );
            })}
          </nav>
        </div>

        <div className="absolute bottom-6 left-6 right-6">
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-white font-inter font-medium text-sm mb-2">Status Apify</h3>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-gray-400 text-xs font-inter">Conectado e operacional</span>
            </div>
            <div className="mt-2 text-xs font-inter text-gray-500">
              API Rate: 98/100
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