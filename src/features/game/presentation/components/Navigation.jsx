import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../state/GameContext';
import { Home, Settings, Image as ImageIcon, Layout, X, Menu } from 'lucide-react';
import './Navigation.css';

const Navigation = () => {
  const { currentScreen, goToMenu, setCurrentScreen } = useGame();
  const [isOpen, setIsOpen] = useState(false);

  if (currentScreen === 'menu') return null;

  const navItems = [
    { id: 'menu', label: 'Início', icon: <Home size={20} />, action: goToMenu },
    { id: 'card_creation', label: 'Ateliê', icon: <ImageIcon size={20} />, action: () => setCurrentScreen && setCurrentScreen('card_creation') },
    { id: 'game', label: 'Tabuleiro', icon: <Layout size={20} />, action: () => setCurrentScreen && setCurrentScreen('game') },
  ];

  return (
    <div className="global-nav-container">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="nav-expanded-bar glass-panel"
            initial={{ x: -10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -10, opacity: 0 }}
          >
            {navItems.map((item) => (
              <button 
                key={item.id}
                className={`nav-item ${currentScreen === item.id ? 'active' : ''}`}
                onClick={() => {
                  item.action();
                  setIsOpen(false);
                }}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button 
        className={`nav-toggle-btn ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </motion.button>
    </div>
  );
};

export default Navigation;
