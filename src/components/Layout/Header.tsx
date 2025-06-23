import React from 'react';
import { motion } from 'framer-motion';
import { Download, Settings, HelpCircle } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-[#111111] border-b border-gray-800 px-6 py-4"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white font-inter font-semibold text-xl">Dashboard</h2>
          <p className="text-gray-400 font-inter text-sm">Gerador de carrosséis com IA</p>
        </div>

        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 bg-[#1500FF] text-white px-4 py-2 rounded-lg font-inter font-medium text-sm transition-all duration-200 hover:bg-blue-600"
          >
            <Download size={16} />
            Exportar para Figma
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all duration-200"
          >
            <Settings size={20} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all duration-200"
          >
            <HelpCircle size={20} />
          </motion.button>
        </div>
      </div>
    </motion.header>
  );
};