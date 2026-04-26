import React from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../state/GameContext';
import BoardView from './BoardView';
import GameCard from './GameCard';
import PlayerCard from './PlayerCard';
import DiceArea from './DiceArea';
import { 
  Maximize2, 
  History, 
  BookOpen, 
  Target, 
  Layers, 
  Award, 
  PlayCircle,
  ClipboardList,
  PenTool,
  Hourglass,
  ArrowRight,
  ArrowLeft,
  Shuffle,
  Users,
  RotateCw
} from 'lucide-react';
import { LEARNING_PROFILES, SPECIAL_TILES, GAME_RULES, GAME_CARDS } from '../../domain/gameConstants';

const TabletopView = () => {
  const { 
    players, 
    currentPlayerIndex, 
    toggleFullScreen,
    boardRotation,
    rotateBoard
  } = useGame();

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
          <button className="btn-fullscreen-modern" onClick={toggleFullScreen}>
            <Maximize2 size={18} />
            <span>Ver Tabuleiro</span>
          </button>
        </div>
      </header>

      <main className="tabletop-dashboard-grid">
        {/* Left Side Panels */}
        <aside className="dashboard-sidebar left">
          <div className="info-panel-modern glass-light">
            <div className="panel-header">
              <BookOpen size={18} className="text-blue" />
              <h3>SOBRE O JOGO</h3>
            </div>
            <p className="panel-text">{GAME_RULES.about}</p>
          </div>

          <div className="info-panel-modern glass-light">
            <div className="panel-header">
              <Award size={18} className="text-gold" />
              <h3>PERFIS</h3>
            </div>
            <div className="profiles-mini-grid">
              {LEARNING_PROFILES.map(p => (
                <div key={p.id} className="profile-tag" style={{ borderLeftColor: p.color }}>
                  <strong>{p.title}</strong>
                </div>
              ))}
            </div>
          </div>

          <div className="info-panel-modern glass-light players-panel">
            <div className="panel-header">
              <Users size={18} className="text-purple" />
              <h3>JOGADORES</h3>
            </div>
            <div className="players-scroll-area">
              {players.map((p, i) => (
                <PlayerCard key={p.id} player={p} isActive={i === currentPlayerIndex} />
              ))}
            </div>
          </div>
        </aside>

        {/* Center Piece: The Board */}
        <section className="dashboard-center">
          <motion.div 
            className="board-hero-wrapper"
          >
            <div className="board-reflection"></div>
            <BoardView boardRotation={boardRotation} />
          </motion.div>

          <div className="bottom-dashboard-row">
             <div className="diary-panel-modern glass-light">
                <div className="panel-header">
                  <PenTool size={16} className="text-purple" />
                  <h3>DIÁRIO</h3>
                </div>
                <div className="diary-lines-modern">
                   <div className="d-line">Hoje aprendi que...</div>
                   <div className="d-line">Me sai melhor quando...</div>
                </div>
             </div>

             <div className="sheet-panel-modern glass-light">
                <div className="panel-header">
                  <ClipboardList size={16} className="text-gold" />
                  <h3>FICHA</h3>
                </div>
                <div className="sheet-mini-table">
                   <div className="s-row"><span>R1</span><div className="s-dot"></div><span>-</span></div>
                   <div className="s-row"><span>R2</span><div className="s-dot"></div><span>-</span></div>
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
              <Layers size={18} className="text-blue" />
              <h3>CARTAS</h3>
            </div>
            <div className="cards-stack-modern">
               {GAME_CARDS.map((c, i) => (
                 <div key={i} className="card-stack-item">
                   <GameCard 
                     type={c.type.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")} 
                     index={i} 
                   />
                 </div>
               ))}
            </div>
          </div>

          <div className="action-area-modern glass-light">
            <DiceArea />
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
        <div className="timer-minimal">
          <Hourglass size={14} />
          <span>01:00</span>
        </div>
      </footer>
    </motion.div>
  );
};

export default TabletopView;
