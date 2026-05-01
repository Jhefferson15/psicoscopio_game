import './App.css';
import Board from './features/game/presentation/components/Board';
import Dice from './features/game/presentation/components/Dice';
import TabletopView from './features/game/presentation/components/TabletopView';
import StartMenu from './features/game/presentation/components/StartMenu';
import CardCreator from './features/game/presentation/components/CardCreator';
import GameCard from './features/game/presentation/components/GameCard';
import { GameProvider } from './features/game/presentation/state/GameContext';
import { useGame } from './features/game/presentation/state/useGame';
import { motion, AnimatePresence } from 'framer-motion';
import { Minimize2, X } from 'lucide-react';
import Navigation from './features/game/presentation/components/Navigation';
import CustomCardsGallery from './features/game/presentation/components/CustomCardsGallery';
import StandardCardsSettings from './features/game/presentation/components/StandardCardsSettings';
import Lobby from './features/game/presentation/components/Lobby';
import WaitingPlayers from './features/game/presentation/components/WaitingPlayers';
import BoardEditor from './features/game/presentation/components/BoardEditor';
import SystemPopup from './features/game/presentation/components/SystemPopup';
import { AuthProvider } from './features/auth/presentation/state/AuthContext.jsx';
import { UserProvider } from './features/user/presentation/state/UserProvider.jsx';


const GameContent = () => {
  const { players, currentPlayerIndex, showModal, closeModal, closeFocusedCard, isBoardFullScreen, toggleFullScreen, currentScreen, focusedCard, activeCardSet } = useGame();

  return (
    <div className="game-wrapper">
      <Navigation />
      <AnimatePresence mode="wait">
        {currentScreen === 'menu' ? (
          <motion.div
            key="menu"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <StartMenu />
          </motion.div>
        ) : currentScreen === 'card_creation' ? (
          <motion.div
            key="card_creation"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            <CardCreator />
          </motion.div>
        ) : currentScreen === 'custom_cards' ? (
          <motion.div
            key="custom_cards"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <CustomCardsGallery />
          </motion.div>
        ) : currentScreen === 'settings' ? (
          <motion.div
            key="settings"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            <StandardCardsSettings />
          </motion.div>
        ) : currentScreen === 'board_editor' ? (
          <motion.div
            key="board_editor"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            <BoardEditor />
          </motion.div>
        ) : currentScreen === 'lobby' ? (
          <motion.div
            key="lobby"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Lobby />
          </motion.div>
        ) : currentScreen === 'waiting_players' ? (
          <motion.div
            key="waiting_players"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <WaitingPlayers />
          </motion.div>
        ) : !isBoardFullScreen ? (
          <motion.div
            key="tabletop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <TabletopView />
          </motion.div>
        ) : (
          <motion.div
            key="fullscreen-board"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2 }}
            className="app-container"
          >
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
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay"
            onClick={closeModal}
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
                onClick={closeModal}
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
            onClick={closeFocusedCard}
          >
            <div className="focused-card-container">
              <GameCard 
                key={`${activeCardSet.id}-${activeCardSet.updatedAt}-${focusedCard.index}`}
                type={focusedCard.type} 
                index={focusedCard.index} 
                isFocused={true} 
              />
              <motion.button 
                className="close-focused-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={closeFocusedCard}
              >
                <X size={24} />
                <span>Fechar</span>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <SystemPopup />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <UserProvider>
        <GameProvider>
          <GameContent />
        </GameProvider>
      </UserProvider>
    </AuthProvider>
  );
}

export default App;
