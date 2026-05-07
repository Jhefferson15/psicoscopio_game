import { motion, AnimatePresence, useMotionValue } from 'framer-motion';
import { Users, X, ChevronRight, Map as MapIcon, ZoomIn, ZoomOut, Maximize } from 'lucide-react';
import { useRef, useState } from 'react';
import { useGame } from '../state/useGame';
import BoardView from './BoardView';
import './PlayerSelectorModal.css';

const PlayerSelectorModal = () => {
  const { players, currentPlayerIndex, playerSelectionTask, setPlayerSelectionTask } = useGame();
  const [zoom, setZoom] = useState(0.5);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const containerRef = useRef(null);

  if (!playerSelectionTask) return null;

  const { title, message, excludeSelf = true, onSelect, action } = playerSelectionTask;
  
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

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.2, 2.5));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.2));
  const handleReset = () => {
    setZoom(0.5);
    x.set(0);
    y.set(0);
  };

  const isSwapAction = action === 'SWAP_POSITIONS';

  return (
    <AnimatePresence>
      <motion.div 
        className={`player-selector-overlay ${isSwapAction ? 'with-preview' : ''}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
      >
        <motion.div 
          className={`player-selector-content ${isSwapAction ? 'wide-content' : ''}`}
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

          <div className="selector-main-layout">
            {isSwapAction && (
              <div className="board-preview-mini-container">
                <div className="preview-top-bar">
                  <div className="preview-label">
                    <MapIcon size={14} />
                    <span>Mapa de Posições</span>
                  </div>
                  <div className="zoom-controls">
                    <button onClick={handleZoomOut} title="Diminuir Zoom"><ZoomOut size={16} /></button>
                    <button onClick={handleReset} title="Resetar Visualização"><Maximize size={16} /></button>
                    <button onClick={handleZoomIn} title="Aumentar Zoom"><ZoomIn size={16} /></button>
                  </div>
                </div>
                
                <div className="preview-svg-holder" ref={containerRef}>
                  <motion.div 
                    className="draggable-board-wrapper"
                    drag
                    dragMomentum={false}
                    dragElastic={0}
                    style={{ x, y, scale: zoom }}
                  >
                    <BoardView isReadOnly={true} />
                  </motion.div>
                </div>

                <div className="preview-footer-hint">
                  Pressione e arraste para navegar no tabuleiro
                </div>
              </div>
            )}

            <div className="players-list-section">
              <div className="players-grid">
                {selectablePlayers.map((player) => (
                  <motion.button
                    key={player.id}
                    className="player-option-card"
                    whileHover={{ scale: 1.02 }}
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
            </div>
          </div>
          
          <p className="selector-hint">Selecione um jogador para prosseguir com a ação.</p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PlayerSelectorModal;

