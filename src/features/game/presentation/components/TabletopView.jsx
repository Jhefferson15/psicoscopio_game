import React from 'react';
import './TabletopView.css';
import './GameFeatures.css';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../state/useGame';
import BoardView from './BoardView';
import GameCard from './GameCard';
import PlayerCard from './PlayerCard';
import Dice from './Dice';
import ProfileGallery from './ProfileGallery';
import { 
  Maximize2, 
  BookOpen, 
  Layers, 
  PlayCircle,
  ArrowRight,
  ArrowLeft,
  Shuffle,
  Users,
  RotateCw,
  TrendingUp,
  MessageSquare,
  Clock,
  History,
} from 'lucide-react';
import Hourglass from './Hourglass';
import { GAME_RULES, GAME_CARDS } from '../../domain/gameConstants';
import { CustomCardsModal } from './MenuModals';
import DiaryModal from './DiaryModal';

const TabletopView = () => {
  const { 
    boardRotation,
    rotateBoard,
    playerAttributes,
    diaryEntries,
    activeCardSet,
    players,
    currentPlayerIndex,
    toggleFullScreen,
    isBoardFullScreen,
    showDiary,
    setShowDiary,
    setShowCardHistory,
    cardHistory,
    activeBoardConfig,
    isOnline,
    roomId
  } = useGame();

  const [showHourglassDetails, setShowHourglassDetails] = React.useState(false);
  const [showCollection, setShowCollection] = React.useState(false);
  const [showProfileGallery, setShowProfileGallery] = React.useState(false);


  const currentPlayer = players[currentPlayerIndex];
  const gameTime = currentPlayer.timeLeft;

  const activePlayerAttr = playerAttributes[players[currentPlayerIndex].id] || { memory: 0, reflection: 0, challenge: 0 };

  return (
    <motion.div 
      className="tabletop-container modern-light"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Light modern background */}
      <div className="table-surface-modern">
        <div className="ambient-glow-1"></div>
        <div className="ambient-glow-2"></div>
      </div>

      {/* Header */}
      <header className="tabletop-header-modern">
        <div className="game-logo-modern">
          <h1>PSICOSCÓPIO</h1>
          <span className="slogan-minimal">COMO VOCÊ APRENDE, LEMBRA E TRANSFORMA</span>
        </div>
        <div className="header-actions">
          <button className="btn-rotate-modern" onClick={rotateBoard} title="Rotacionar Tabuleiro">
            <RotateCw size={18} />
          </button>
          <button className="btn-fullscreen-modern" onClick={() => setShowCollection(true)} title="Minha Coleção">
            <BookOpen size={18} />
            <span>Coleção</span>
          </button>
          <button className="btn-fullscreen-modern" onClick={toggleFullScreen}>
            <Maximize2 size={18} />
            <span>Ver Tabuleiro</span>
          </button>
        </div>
      </header>

      <main className="tabletop-dashboard-grid">
        {/* Left Side Panels */}
        <aside className="dashboard-sidebar left">
          <div className="info-panel-modern glass-light players-panel">
            <div className="panel-header">
              <Users size={18} className="text-purple" />
              <h3>JOGADORES EM CAMPO</h3>
            </div>
            <div className="players-scroll-area">
              {players.map((p, i) => (
                <PlayerCard key={p.id} player={p} isActive={i === currentPlayerIndex} onClick={() => setShowProfileGallery(true)} />
              ))}
            </div>
          </div>
        </aside>

        {/* Center Piece: The Board */}
        <section className={`dashboard-center ${isBoardFullScreen ? 'is-fullscreen' : ''}`}>
          <motion.div 
            className="board-hero-wrapper"
          >
            <div className="board-reflection"></div>
            <BoardView boardRotation={boardRotation} />
          </motion.div>

          <div className="bottom-dashboard-row-large">
              <div className="narrative-journal glass-light">
                <div className="panel-header">
                  <div className="header-with-action">
                    <MessageSquare size={18} className="text-purple" />
                    <h3>DIÁRIO DE BORDO</h3>
                  </div>
                  <button className="btn-expand-journal" onClick={() => setShowDiary(true)} title="Expandir Diário">
                    <Maximize2 size={14} />
                  </button>
                </div>

                <div className="journal-content-scroll">
                   {diaryEntries.map(entry => (
                     <motion.div 
                       key={entry.id} 
                       initial={{ x: -20, opacity: 0 }}
                       animate={{ x: 0, opacity: 1 }}
                       className={`journal-entry-card ${entry.type}`}
                     >
                       <span className="entry-time">{entry.timestamp}</span>
                       <p>{entry.text}</p>
                     </motion.div>
                   ))}
                </div>
              </div>

              <div className="evolution-sheet glass-light">
                <div className="panel-header">
                  <TrendingUp size={18} className="text-gold" />
                  <h3>FICHA DE EVOLUÇÃO</h3>
                </div>
                <div className="attributes-grid-visual">
                   <div className="attr-visual-item">
                      <div className="attr-label-row">
                        <span>MEMÓRIA</span>
                        <span>{activePlayerAttr.memory}%</span>
                      </div>
                      <div className="attr-bar-bg"><motion.div className="attr-bar-fill memory" initial={{ width: 0 }} animate={{ width: `${activePlayerAttr.memory}%` }} /></div>
                   </div>
                   <div className="attr-visual-item">
                      <div className="attr-label-row">
                        <span>REFLEXÃO</span>
                        <span>{activePlayerAttr.reflection}%</span>
                      </div>
                      <div className="attr-bar-bg"><motion.div className="attr-bar-fill reflection" initial={{ width: 0 }} animate={{ width: `${activePlayerAttr.reflection}%` }} /></div>
                   </div>
                   <div className="attr-visual-item">
                      <div className="attr-label-row">
                        <span>DESAFIO</span>
                        <span>{activePlayerAttr.challenge}%</span>
                      </div>
                      <div className="attr-bar-bg"><motion.div className="attr-bar-fill challenge" initial={{ width: 0 }} animate={{ width: `${activePlayerAttr.challenge}%` }} /></div>
                   </div>
                </div>
              </div>
          </div>
        </section>

        {/* Right Side Panels */}
        <aside className="dashboard-sidebar right">
          <div className="info-panel-modern glass-light">
            <div className="panel-header">
              <PlayCircle size={18} className="text-green" />
              <h3>COMO JOGAR</h3>
            </div>
            <ul className="steps-list-modern">
              {GAME_RULES.steps.slice(0, 4).map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>

          <div className="info-panel-modern glass-light">
            <div className="panel-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Layers size={18} className="text-blue" />
                <h3>CARTAS</h3>
              </div>
            </div>
            
            <div className="cards-stack-modern">
                {GAME_CARDS.map((c, i) => (
                  <div key={i} className="card-stack-item">
                    <GameCard 
                      key={`${activeCardSet.id}-${activeCardSet.updatedAt}-${i}`}
                      type={c.type.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")} 
                      index={i} 
                    />
                  </div>
                ))}
            </div>

            <div className="card-history-preview" style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', letterSpacing: '1px' }}>ÚLTIMA CARTA ABERTA</span>
              </div>
              
              {cardHistory && cardHistory.length > 0 ? (
                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '12px', marginBottom: '10px', borderLeft: '3px solid var(--primary)' }}>
                  <p style={{ margin: '0 0 5px 0', fontSize: '12px', lineHeight: '1.4', fontStyle: 'italic', color: 'var(--text)' }}>
                    "{cardHistory[0].cardText}"
                  </p>
                  <span style={{ fontSize: '10px', fontWeight: '600', color: 'var(--text-muted)' }}>
                    por {cardHistory[0].playerName}
                  </span>
                </div>
              ) : (
                <div style={{ padding: '10px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
                  Nenhuma carta foi sorteada.
                </div>
              )}

              <button 
                className="btn-primary" 
                onClick={() => setShowCardHistory(true)} 
                style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '8px', padding: '10px', fontSize: '12px', background: 'white', color: 'var(--text)', border: '1px solid rgba(0,0,0,0.1)' }}
              >
                <History size={14} />
                <span>Ver Histórico Completo</span>
              </button>
            </div>
          </div>

          <div className="action-area-modern glass-light">
            <Dice />
          </div>

          <div className="special-tiles-panel glass-light">
            <div className="panel-header">
              <Shuffle size={16} />
              <h3>CASAS ESPECIAIS</h3>
            </div>
            <div className="tiles-icons-row">
               <ArrowRight size={16} />
               <ArrowLeft size={16} />
               <Shuffle size={16} />
               <Users size={16} />
            </div>
          </div>
        </aside>
      </main>

      <footer className="dashboard-footer-modern">
        <div className="status-bar">
          <span className="status-dot green"></span>
          <span className="status-text">O aprendizado é um ciclo, não uma linha de chegada.</span>
        </div>
        
        <div className="footer-right-area">
          {isOnline && roomId && (
            <div className="room-info-display">
               <span className="room-label">SALA:</span>
               <span className="room-id">{roomId.substring(0, 8)}</span>
            </div>
          )}
          
          <div className={`timer-atmosphere ${gameTime < 20 ? 'critical' : ''}`}>
            <Hourglass 
              progress={gameTime / (activeBoardConfig.mechanics?.turnTime || 120)} 
              isCritical={gameTime < 20}
              onClick={() => setShowHourglassDetails(true)} 
              activePlayerIndex={currentPlayerIndex}
            />
            <div className="time-remaining">
              <Clock size={14} />
              <span>{Math.floor(gameTime / 60)}:{(gameTime % 60).toString().padStart(2, '0')}</span>
            </div>
          </div>
        </div>
      </footer>

      <AnimatePresence>
        {showHourglassDetails && (
          <motion.div 
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowHourglassDetails(false)}
            style={{ zIndex: 10000 }}
          >
            <motion.div 
              className="modal-content glass-light"
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              onClick={e => e.stopPropagation()}
              style={{ padding: '60px 40px', maxWidth: '500px' }}
            >
              <div className="hourglass-detail-header">
                <div style={{ transform: 'scale(2.5)', marginBottom: '60px' }}>
                  <Hourglass 
                    progress={gameTime / (activeBoardConfig.mechanics?.turnTime || 120)} 
                    activePlayerIndex={currentPlayerIndex}
                  />
                </div>
                <h2 style={{ fontSize: '32px', fontWeight: '900', color: 'var(--text)', marginBottom: '10px' }}>
                  Tempo de Reflexão
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '16px', marginBottom: '30px' }}>
                  O tempo é seu aliado na jornada do autoconhecimento.
                </p>
              </div>

              <div className="time-stats-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '40px' }}>
                <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '20px' }}>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Restante</span>
                  <div style={{ fontSize: '24px', fontWeight: '900', color: 'var(--primary)' }}>
                    {Math.floor(gameTime / 60)}:{(gameTime % 60).toString().padStart(2, '0')}
                  </div>
                </div>
                <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '20px' }}>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total da Rodada</span>
                  <div style={{ fontSize: '24px', fontWeight: '900', color: 'var(--secondary)' }}>
                    {Math.floor((activeBoardConfig.mechanics?.turnTime || 120) / 60).toString().padStart(2, '0')}:
                    {((activeBoardConfig.mechanics?.turnTime || 120) % 60).toString().padStart(2, '0')}
                  </div>
                </div>
              </div>

              <button 
                className="btn-primary" 
                onClick={() => setShowHourglassDetails(false)}
                style={{ width: '100%' }}
              >
                Voltar ao Jogo
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCollection && (
          <CustomCardsModal onClose={() => setShowCollection(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDiary && (
          <DiaryModal onClose={() => setShowDiary(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showProfileGallery && (
          <ProfileGallery onClose={() => setShowProfileGallery(false)} />
        )}
      </AnimatePresence>
    </motion.div>

  );
};

export default TabletopView;
