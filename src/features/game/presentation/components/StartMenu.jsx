import { useState } from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../state/useGame';
import { Play, Settings, Info, Package } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { LoginButton } from '../../../auth/presentation/components/LoginButton.jsx';
import { PlayerSetupModal, SettingsModal, AboutModal } from './MenuModals';


const StartMenu = () => {
  useGame();
  const [activeModal, setActiveModal] = useState(null); // 'playerSetup' | 'settings' | 'about'

  return (
    <motion.div 
      className="menu-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="menu-background">
        <div className="bg-pattern"></div>
        <div className="bg-glow"></div>
      </div>

      <div className="menu-content">
        <motion.div 
          className="menu-card"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="menu-logo">
            <motion.div 
              className="logo-circle"
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              {/* Representação minimalista do tabuleiro no logo */}
              <svg viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="5,5" />
                <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="1" />
              </svg>
            </motion.div>
            <h1>PSICOSCÓPIO</h1>
            <p className="subtitle">A Jornada do Conhecimento</p>
          </div>

          <nav className="menu-actions">
            <LoginButton />
            <div style={{ height: '10px' }}></div>
            <motion.button 
              className="btn-primary"
              onClick={() => setActiveModal('playerSetup')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Play size={20} fill="currentColor" />
               <span>Iniciar Jornada</span>
            </motion.button>

            <div className="menu-grid">
              <button className="btn-secondary" onClick={() => setActiveModal('settings')}>
                <Settings size={20} />
                <span>Configurações</span>
              </button>
              <button className="btn-secondary" onClick={() => setActiveModal('about')}>
                <Info size={20} />
                <span>Sobre o Jogo</span>
              </button>
            </div>
          </nav>


          <footer className="menu-footer">
            <div className="social-links">
              <Package size={18} />
              <span>v2.0 Beta</span>
            </div>
            <p>© 2026 Psicoscópio Team</p>
          </footer>
        </motion.div>
      </div>

      <AnimatePresence>
        {activeModal === 'playerSetup' && (
          <PlayerSetupModal onClose={() => setActiveModal(null)} />
        )}
        {activeModal === 'settings' && (
          <SettingsModal onClose={() => setActiveModal(null)} />
        )}
        {activeModal === 'about' && (
          <AboutModal onClose={() => setActiveModal(null)} />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default StartMenu;
