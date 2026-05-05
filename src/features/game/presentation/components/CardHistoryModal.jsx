import { motion } from 'framer-motion';
import { X, History, Brain, Zap, Sparkles, HelpCircle, Puzzle, Award, Brush } from 'lucide-react';
import { useGame } from '../state/useGame';
import './CardHistoryModal.css';

const cardTypes = {
  reflexao: { icon: Brain, color: '#7B4BB1', label: 'Reflexão' },
  desafio: { icon: Zap, color: '#D84B42', label: 'Desafio' },
  sorte: { icon: Sparkles, color: '#F4C746', label: 'Sorte' },
  memoria: { icon: Puzzle, color: '#4885CE', label: 'Memória' },
  experiencia: { icon: Award, color: '#6FB05E', label: 'Experiência' },
  default: { icon: HelpCircle, color: '#94a3b8', label: 'Info' }
};

const CardHistoryModal = ({ onClose }) => {
  const { cardHistory } = useGame();

  return (
    <motion.div 
      className="modal-overlay history-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div 
        className="history-modal glass-light"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={e => e.stopPropagation()}
      >
        <header className="history-header">
          <div className="header-title">
            <History className="text-purple" size={24} />
            <h2>Histórico de Cartas</h2>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </header>

        <div className="history-content-scroll">
          {cardHistory.length > 0 ? (
            <div className="history-list">
              {cardHistory.map((card, index) => {
                const config = cardTypes[card.cardType] || cardTypes.default;
                const Icon = config.icon;
                const isCustom = !!card.isCustom;
                const displayLabel = isCustom ? `CUSTOM ${config.label.toUpperCase()}` : config.label;
                
                return (
                  <motion.div 
                    key={card.id || index}
                    className="history-item-card"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div className="item-header">
                      <div className="type-badge" style={{ backgroundColor: config.color }}>
                        <div className="badge-icons" style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                          <Icon size={14} />
                          {isCustom && <Brush size={10} style={{ opacity: 0.8 }} />}
                        </div>
                        <span>{displayLabel}</span>
                      </div>
                      <span className="item-time">
                        {new Date(card.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="item-player-info">
                      Sorteada por <strong>{card.playerName || 'Jogador'}</strong>
                    </div>
                    <p className="item-text">"{card.cardText}"</p>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="history-empty">
              <History size={48} opacity={0.2} />
              <p>Nenhuma carta foi sorteada nesta partida ainda.</p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CardHistoryModal;
