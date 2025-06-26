import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Settings } from 'lucide-react';

interface APIWarningProps {
  message: string;
  onOpenSettings: () => void;
}

export const APIWarning: React.FC<APIWarningProps> = ({ message, onOpenSettings }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-yellow-900/20 border border-yellow-800 rounded-lg p-4 mb-6"
    >
      <div className="flex items-start gap-3">
        <AlertCircle size={20} className="text-yellow-400 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h4 className="text-yellow-400 font-inter font-semibold text-sm mb-1">
            APIs Não Configuradas
          </h4>
          <p className="text-gray-300 font-inter text-sm mb-3">
            {message}
          </p>
          <motion.button
            onClick={onOpenSettings}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg font-inter font-medium text-sm transition-all duration-200"
          >
            <Settings size={16} />
            Configurar APIs
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};