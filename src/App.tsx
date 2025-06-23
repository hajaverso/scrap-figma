import React from 'react';
import { motion } from 'framer-motion';
import { Sidebar } from './components/Layout/Sidebar';
import { Header } from './components/Layout/Header';
import { ScrapingPanel } from './components/Scraping/ScrapingPanel';
import { CarouselGenerator } from './components/Carousel/CarouselGenerator';
import { CarouselPreview } from './components/Preview/CarouselPreview';
import { CarouselEditor } from './components/Editor/CarouselEditor';
import { TrendsDashboard } from './components/Dashboard/TrendsDashboard';
import { useAppStore } from './store/useAppStore';

function App() {
  const { activeTab, sidebarOpen } = useAppStore();

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <TrendsDashboard />;
      case 'scraping':
        return <ScrapingPanel />;
      case 'carousel':
        return <CarouselGenerator />;
      case 'editor':
        return <CarouselEditor />;
      case 'preview':
        return <CarouselPreview />;
      default:
        return <TrendsDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-black font-inter">
      <div className="flex">
        <Sidebar />
        
        <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'lg:ml-0' : 'ml-0'}`}>
          <Header />
          
          <motion.main
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="p-6"
          >
            {renderContent()}
          </motion.main>
        </div>
      </div>
    </div>
  );
}

export default App;