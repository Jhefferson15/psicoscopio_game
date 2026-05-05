import React from 'react';
import './TabletopLayout.css';
import './TabletopHeader.css';
import './TabletopSidebar.css';
import './TabletopBoard.css';
import './TabletopResponsive.css';
import './GameFeatures.css';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../state/useGame';
import { useUser } from '../../../user/presentation/state/useUser';
import BoardView from './BoardView';
import GameCard from './GameCard';
import PlayerCard from './PlayerCard';
import Dice from './Dice';
import ProfileGallery from './ProfileGallery';
import { 
  Maximize2, 
  BookOpen, 
  Layers, 
  Users,
  RotateCw,
  MessageSquare,
  Clock,
  History,
} from 'lucide-react';
import Hourglass from './Hourglass';
import { GAME_CARDS } from '../../domain/gameConstants';
import { CustomCardsModal } from './MenuModals';
import DiaryModal from './DiaryModal';
import DetailPopup from './DetailPopup';

const TabletopView = () => {
  const { 
    boardRotation,
    rotateBoard,
    followActivePlayer,
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
    roomId,
    detailPopup,
    closeDetailPopup
  } = useGame();

  const [showHourglassDetails, setShowHourglassDetails] = React.useState(false);
  const [showCollection, setShowCollection] = React.useState(false);
  const [showProfileGallery, setShowProfileGallery] = React.useState(false);
  const [quickDiaryText, setQuickDiaryText] = React.useState('');
  
  const { addDiaryEntry } = useUser();

  const handleQuickDiarySubmit = (e) => {
    if (e.key === 'Enter' && quickDiaryText.trim()) {
      addDiaryEntry(quickDiaryText, 'nota-rapida', 'neutral');
      setQuickDiaryText('');
    }
  };


  const currentPlayer = players[currentPlayerIndex];
  const gameTime = currentPlayer.timeLeft;

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
          <button 
            className={`btn-rotate-modern ${followActivePlayer ? 'active' : ''}`} 
            onClick={rotateBoard} 
            title={followActivePlayer ? "Desativar Acompanhar Jogador" : "Acompanhar Jogador"}
          >
            <RotateCw size={18} style={{ 
              color: followActivePlayer ? 'var(--secondary)' : 'inherit',
              transform: followActivePlayer ? 'rotate(180deg)' : 'none', 
              transition: 'all 0.3s ease' 
            }} />
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
        {/* Left Side Panels: Independent Components */}
        <aside className="dashboard-sidebar left">
          <div className="sidebar-section-title">
            <Users size={16} className="text-purple" />
            <span>Jogadores em Campo</span>
          </div>

          <div className="info-panel-modern glass-light players-panel">
            <div className="players-scroll-area">
              {players.map((p, i) => (
                <PlayerCard key={p.id} player={p} isActive={i === currentPlayerIndex} onClick={() => setShowProfileGallery(true)} />
              ))}
            </div>
          </div>

          <div className="sidebar-section-title" style={{ marginTop: '5px' }}>
            <MessageSquare size={16} className="text-purple" />
            <span>Diário de Bordo</span>
          </div>

          <div className="narrative-journal glass-light sidebar-journal">
            <div className="panel-header">
              <div className="header-with-action">
                <span className="journal-subtitle">Registros da Jornada</span>
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
                   <span className="entry-time">{entry.timestamp || new Date(entry.id).toLocaleTimeString()}</span>
                   <p>{entry.text}</p>
                 </motion.div>
               ))}
               {diaryEntries.length === 0 && (
                 <div className="empty-journal-msg">Nenhum registro ainda...</div>
               )}
            </div>
            
            <div className="quick-diary-input-area">
              <input 
                type="text" 
                placeholder="Nota rápida (Enter para salvar)..." 
                value={quickDiaryText}
                onChange={(e) => setQuickDiaryText(e.target.value)}
                onKeyDown={handleQuickDiarySubmit}
                className="journal-quick-input"
              />
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
        </section>

        {/* Right Side Panels */}
        <aside className="dashboard-sidebar right">
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
                      isStacked={true}
                    />
                  </div>
                ))}
            </div>

            <div className="card-history-preview" style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-muted)', letterSpacing: '1px' }}>ÚLTIMA CARTA ABERTA</span>
              </div>
              
              {cardHistory && cardHistory.length > 0 ? (
                <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '14px', marginBottom: '12px', borderLeft: '4px solid var(--primary)' }}>
                  <p style={{ margin: '0 0 8px 0', fontSize: '14px', lineHeight: '1.5', fontStyle: 'italic', color: 'var(--text)' }}>
                    "{cardHistory[0].cardText}"
                  </p>
                  <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)' }}>
                    por {cardHistory[0].playerName}
                  </span>
                </div>
              ) : (
                <div style={{ padding: '15px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
                  Nenhuma carta foi sorteada.
                </div>
              )}

              <button 
                className="btn-primary" 
                onClick={() => setShowCardHistory(true)} 
                style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '10px', padding: '13px', fontSize: '14px', background: 'white', color: 'var(--text)', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '12px' }}
              >
                <History size={16} />
                <span>Ver Histórico Completo</span>
              </button>
            </div>
          </div>

          <div className="info-panel-modern glass-light action-area-modern">
            <Dice />
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

      <DetailPopup 
        isOpen={!!detailPopup} 
        onClose={closeDetailPopup} 
        data={detailPopup} 
      />
    </motion.div>

  );
};

export default TabletopView;
