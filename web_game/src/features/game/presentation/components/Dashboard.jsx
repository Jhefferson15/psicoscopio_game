import React from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../state/GameContext';
import { 
  BookOpen, 
  Target, 
  Layers, 
  PlayCircle, 
  Award, 
  Users, 
  ArrowRight, 
  ArrowLeft, 
  Shuffle, 
  Brain, 
  Sprout, 
  RefreshCw, 
  Settings,
  PenTool,
  ClipboardList,
  Hourglass,
  Puzzle,
  RotateCcw,
  ArrowRightCircle,
  Home
} from 'lucide-react';
import { LEARNING_PROFILES, SPECIAL_TILES, GAME_RULES, GAME_CARDS } from '../../domain/gameConstants';
import './Dashboard.css';

const Dashboard = () => {
  const { startGame, goToMenu } = useGame();
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <motion.div 
      className="dashboard-overlay"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="dashboard-container">
        <header className="dashboard-header">
          <div className="dashboard-nav">
             <button className="btn-nav-back" onClick={goToMenu}>
                <Home size={18} />
                <span>Menu</span>
             </button>
             <button className="btn-nav-forward" onClick={startGame}>
                <span>Entrar no Tabuleiro</span>
                <ArrowRightCircle size={18} />
             </button>
          </div>
          <div className="logo-section">
            <h1 className="logo-text">PSICOSCÓPIO</h1>
            <p className="slogan">COMO VOCÊ APRENDE, COMO VOCÊ LEMBRA, COMO VOCÊ TRANSFORMA.</p>
          </div>
        </header>

        <div className="dashboard-grid">
          {/* Coluna 1: Sobre e Objetivo */}
          <motion.section className="dashboard-col" variants={itemVariants}>
            <div className="info-card glass">
              <div className="card-header">
                <BookOpen className="icon-blue" />
                <h2>SOBRE O JOGO</h2>
              </div>
              <p>{GAME_RULES.about}</p>
            </div>

            <div className="info-card glass">
              <div className="card-header">
                <Target className="icon-red" />
                <h2>OBJETIVO</h2>
              </div>
              <p>{GAME_RULES.objective}</p>
            </div>

            <div className="info-card glass">
              <div className="card-header">
                <Layers className="icon-green" />
                <h2>COMPONENTES</h2>
              </div>
              <ul className="components-list">
                {GAME_RULES.components.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
              <div className="component-visuals">
                <Hourglass className="pulse-icon" />
                <div className="token-visual" style={{ backgroundColor: '#D84B42' }}></div>
                <div className="token-visual" style={{ backgroundColor: '#4885CE' }}></div>
                <div className="token-visual" style={{ backgroundColor: '#6FB05E' }}></div>
              </div>
            </div>
          </motion.section>

          {/* Coluna 2: Perfis e Casas Especiais */}
          <motion.section className="dashboard-col" variants={itemVariants}>
            <div className="info-card glass">
              <div className="card-header">
                <Award className="icon-gold" />
                <h2>PERFIS DE APRENDIZAGEM</h2>
              </div>
              <div className="profiles-grid">
                {LEARNING_PROFILES.map(profile => (
                  <div key={profile.id} className="profile-item" style={{ borderColor: profile.color }}>
                    <div className="profile-title" style={{ color: profile.color }}>
                      {profile.icon === 'brain' && <Brain size={16} />}
                      {profile.icon === 'plant' && <Sprout size={16} />}
                      {profile.icon === 'cycle' && <RotateCcw size={16} />}
                      {profile.icon === 'gears' && <Settings size={16} />}
                      <span>{profile.title}</span>
                    </div>
                    <p>{profile.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="info-card glass">
              <div className="card-header">
                <Settings className="icon-purple" />
                <h2>TIPOS DE CASAS ESPECIAIS</h2>
              </div>
              <div className="special-tiles-list">
                {SPECIAL_TILES.map((tile, i) => (
                  <div key={i} className="special-tile-item">
                    <div className="tile-icon-wrapper">
                      {tile.icon === 'arrow-right' && <ArrowRight size={18} />}
                      {tile.icon === 'arrow-left' && <ArrowLeft size={18} />}
                      {tile.icon === 'shuffle' && <Shuffle size={18} />}
                      {tile.icon === 'users' && <Users size={18} />}
                    </div>
                    <div className="tile-info">
                      <strong>{tile.type}</strong>
                      <p>{tile.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.section>

          {/* Coluna 3: Como Jogar e Avaliação */}
          <motion.section className="dashboard-col" variants={itemVariants}>
            <div className="info-card glass">
              <div className="card-header">
                <PlayCircle className="icon-blue" />
                <h2>COMO JOGAR</h2>
              </div>
              <ol className="steps-list">
                {GAME_RULES.steps.map((step, i) => (
                  <li key={i}>
                    <span className="step-num">{i + 1}</span>
                    <p>{step}</p>
                  </li>
                ))}
              </ol>
            </div>

            <div className="info-card glass evaluation-card">
              <div className="card-header">
                <ClipboardList className="icon-red" />
                <h2>COMO O JOGO AVALIA?</h2>
              </div>
              <p>O Psicoscópio observa como você aprende:</p>
              <ul className="eval-list">
                <li>Como você lembra</li>
                <li>Como você toma decisões</li>
                <li>Como você lida com desafios</li>
                <li>Como você reflete sobre suas ações</li>
              </ul>
              <div className="quote">
                "No final, você descobre seu perfil de aprendizagem!"
              </div>
            </div>
          </motion.section>
        </div>

        {/* Seção de Cartas do Jogo - Adição Extensa */}
        <motion.section className="dashboard-cards-section" variants={itemVariants}>
          <div className="section-title">
            <Layers className="icon-blue" />
            <h2>CARTAS DO JOGO</h2>
          </div>
          <div className="cards-preview-grid">
            {GAME_CARDS.map((card, i) => (
              <div key={i} className="game-card-preview" style={{ borderTop: `6px solid ${card.color}` }}>
                <div className="card-preview-header">
                  <span className="card-type" style={{ color: card.color }}>{card.type}</span>
                  <div className="card-icon" style={{ backgroundColor: `${card.color}22`, color: card.color }}>
                    {card.icon === 'brain' && <Brain size={20} />}
                    {card.icon === 'plant' && <Sprout size={20} />}
                    {card.icon === 'puzzle' && <Puzzle size={20} />}
                    {card.icon === 'cycle' && <RotateCcw size={20} />}
                  </div>
                </div>
                <div className="card-preview-body">
                  <p className="instruction">{card.instruction}</p>
                  {card.action && <p className="action">{card.action}</p>}
                  {card.timer && (
                    <div className="timer-badge">
                      <Hourglass size={12} />
                      <span>{card.timer}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Rodapé: Ficha e Diário */}
        <motion.footer className="dashboard-footer" variants={itemVariants}>
          <div className="player-sheet-preview glass">
            <div className="card-header">
              <ClipboardList className="icon-gold" />
              <h2>FICHA DO JOGADOR</h2>
            </div>
            <table className="sheet-table">
              <thead>
                <tr>
                  <th>RODADA</th>
                  <th>ACERTOS</th>
                  <th>TEMPO</th>
                  <th>ESTRATÉGIAS</th>
                  <th>REFLEXÕES</th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4, 5].map(r => (
                  <tr key={r}>
                    <td>{r}</td>
                    <td><div className="cell-circle"></div></td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="learning-diary-preview glass">
            <div className="card-header">
              <PenTool className="icon-purple" />
              <h2>DIÁRIO DE APRENDIZAGEM</h2>
            </div>
            <div className="diary-content">
              <p>Hoje eu aprendi que...</p>
              <div className="diary-line"></div>
              <p>Eu me sai melhor quando...</p>
              <div className="diary-line"></div>
              <p>Quero melhorar...</p>
              <div className="diary-line"></div>
              <p>Meu jeito de aprender é...</p>
              <div className="diary-line"></div>
            </div>
          </div>
        </motion.footer>
      </div>
    </motion.div>
  );
};

export default Dashboard;
