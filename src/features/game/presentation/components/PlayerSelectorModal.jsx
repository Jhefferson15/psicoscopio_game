import { motion, AnimatePresence } from 'framer-motion';
import { Users, X, ChevronRight } from 'lucide-react';
import { useGame } from '../state/useGame';
import './PlayerSelectorModal.css';

const PlayerSelectorModal = () => {
  const { players, currentPlayerIndex, playerSelectionTask, setPlayerSelectionTask } = useGame();

  if (!playerSelectionTask) return null;

  const { title, message, excludeSelf = true, onSelect } = playerSelectionTask;
  
  const selectablePlayers = players.filter((_, index) => {
    if (excludeSelf && index === currentPlayerIndex) return false;
    return true;
  });

  const handleSelect = (playerId) => {
    if (onSelect) onSelect(playerId);
  };

  const handleClose = () => {
    setPlayerSelectionTask(null);
  };

  return (
    <AnimatePresence>
      <motion.div 
        className="player-selector-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
      >
        <motion.div 
          className="player-selector-content"
          initial={{ scale: 0.9, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 20, opacity: 0 }}
          onClick={e => e.stopPropagation()}
        >
          <div className="selector-header">
            <div className="header-icon-wrapper">
              <Users size={24} />
            </div>
            <div className="header-text">
              <h3>{title}</h3>
              <p>{message}</p>
            </div>
            <button className="close-selector-btn" onClick={handleClose}>
              <X size={20} />
            </button>
          </div>

          <div className="players-grid">
            {selectablePlayers.map((player) => (
              <motion.button
                key={player.id}
                className="player-option-card"
                whileHover={{ scale: 1.02, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSelect(player.id)}
                style={{ '--player-color': player.color }}
              >
                <div className="player-option-avatar" style={{ backgroundColor: player.color }}>
                  {player.name.charAt(0).toUpperCase()}
                </div>
                <div className="player-option-info">
                  <span className="player-option-name">{player.name}</span>
                  <span className="player-option-status">Pronto para trocar</span>
                </div>
                <ChevronRight className="option-chevron" size={20} />
              </motion.button>
            ))}
          </div>
          
          <p className="selector-hint">Selecione um jogador para prosseguir com a ação.</p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PlayerSelectorModal;
