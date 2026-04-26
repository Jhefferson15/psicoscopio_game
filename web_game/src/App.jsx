import React from 'react';
import Board from './features/game/presentation/components/Board';
import Dice from './features/game/presentation/components/Dice';
import TabletopView from './features/game/presentation/components/TabletopView';
import StartMenu from './features/game/presentation/components/StartMenu';
import Dashboard from './features/game/presentation/components/Dashboard';
import GameCard from './features/game/presentation/components/GameCard';
import { GameProvider, useGame } from './features/game/presentation/state/GameContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Minimize2, X } from 'lucide-react';
import MobileWarning from './features/game/presentation/components/MobileWarning';

const GameContent = () => {
  const { players, currentPlayerIndex, showModal, setShowModal, isBoardFullScreen, toggleFullScreen, currentScreen, focusedCard, setFocusedCard, confirmedMobileWarning, setConfirmedMobileWarning } = useGame();

  return (
    <div className="game-wrapper">
      {!confirmedMobileWarning && (
        <MobileWarning onConfirm={() => setConfirmedMobileWarning(true)} />
      )}
      {currentScreen === 'menu' ? (
        <StartMenu />
      ) : !isBoardFullScreen ? (
        <TabletopView />
      ) : (
        <div className="app-container">
          <div className="player-info">
            <h3>Jogadores</h3>
            {players.map((p, i) => (
              <div key={p.id} className={`player-item ${i === currentPlayerIndex ? 'active-player' : ''}`}>
                <div className="player-dot" style={{ backgroundColor: p.color }}></div>
                {p.name} {i === currentPlayerIndex ? '(Sua vez)' : ''}
              </div>
            ))}
          </div>

          <div className="board-wrapper">
            <Board />
            <div className="controls-overlay">
              <button className="dice-button exit-fs" onClick={toggleFullScreen}>
                <Minimize2 size={20} />
                Sair Full Screen
              </button>
              <Dice />
            </div>
          </div>
        </div>
      )}

      <AnimatePresence>
        {showModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay"
            onClick={() => setShowModal(null)}
          >
            <motion.div 
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="modal-content"
              onClick={e => e.stopPropagation()}
            >
              <h2 className="modal-title" style={{ color: showModal.tile.color }}>
                {showModal.type}
              </h2>
              <p>Você caiu em uma casa de <strong>{showModal.type}</strong>!</p>
              <p style={{ fontStyle: 'italic', marginTop: '20px' }}>
                "O aprendizado é um ciclo, não uma linha de chegada."
              </p>
              <button 
                className="dice-button modal-btn" 
                onClick={() => setShowModal(null)}
              >
                Continuar a Jornada
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {focusedCard && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="focused-card-overlay"
            onClick={() => setFocusedCard(null)}
          >
            <div className="focused-card-container">
              <GameCard 
                type={focusedCard.type} 
                index={focusedCard.index} 
                isFocused={true} 
              />
              <motion.button 
                className="close-focused-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setFocusedCard(null)}
              >
                <X size={24} />
                <span>Fechar</span>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

function App() {
  return (
    <GameProvider>
      <GameContent />
    </GameProvider>
  );
}

export default App;
