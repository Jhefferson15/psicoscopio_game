import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Volume2, VolumeX, RotateCcw, Info, Users, Check, ChevronRight } from 'lucide-react';
import { useGame } from '../state/GameContext';

const ModalWrapper = ({ title, onClose, children }) => (
  <motion.div 
    className="menu-modal-overlay"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    onClick={onClose}
  >
    <motion.div 
      className="menu-modal-content"
      initial={{ scale: 0.9, y: 20 }}
      animate={{ scale: 1, y: 0 }}
      exit={{ scale: 0.9, y: 20 }}
      onClick={e => e.stopPropagation()}
    >
      <div className="modal-header">
        <h2>{title}</h2>
        <button className="close-btn" onClick={onClose}><X size={20} /></button>
      </div>
      <div className="modal-body">
        {children}
      </div>
    </motion.div>
  </motion.div>
);

export const PlayerSetupModal = ({ onClose }) => {
  const { initializeGame } = useGame();
  const [playerCount, setPlayerCount] = useState(2);
  const [playerData, setPlayerData] = useState([
    { name: 'Jogador 1', color: '#D84B42' },
    { name: 'Jogador 2', color: '#4885CE' },
    { name: 'Jogador 3', color: '#7B4BB1' },
    { name: 'Jogador 4', color: '#F59E0B' },
  ]);

  const colors = ['#D84B42', '#4885CE', '#7B4BB1', '#F59E0B', '#10B981', '#6366F1'];

  const handleStart = () => {
    initializeGame(playerData.slice(0, playerCount));
  };

  const updatePlayerName = (index, name) => {
    const newPlayers = [...playerData];
    newPlayers[index].name = name;
    setPlayerData(newPlayers);
  };

  const updatePlayerColor = (index, color) => {
    const newPlayers = [...playerData];
    newPlayers[index].color = color;
    setPlayerData(newPlayers);
  };

  return (
    <ModalWrapper title="Configurar Partida" onClose={onClose}>
      <div className="player-count-selection">
        <label>Número de Jogadores</label>
        <div className="count-buttons">
          {[2, 3, 4].map(num => (
            <button 
              key={num} 
              className={playerCount === num ? 'active' : ''} 
              onClick={() => setPlayerCount(num)}
            >
              {num}
            </button>
          ))}
        </div>
      </div>

      <div className="players-config-list">
        {playerData.slice(0, playerCount).map((player, idx) => (
          <div key={idx} className="player-config-item">
            <div className="player-avatar-preview" style={{ backgroundColor: player.color }}>
              <User size={20} color="white" />
            </div>
            <div className="player-inputs">
              <input 
                type="text" 
                value={player.name} 
                onChange={(e) => updatePlayerName(idx, e.target.value)}
                placeholder={`Nome do Jogador ${idx + 1}`}
              />
              <div className="color-picker">
                {colors.map(c => (
                  <button 
                    key={c} 
                    className={`color-dot ${player.color === c ? 'active' : ''}`} 
                    style={{ backgroundColor: c }}
                    onClick={() => updatePlayerColor(idx, c)}
                  />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <button className="btn-primary start-btn" onClick={handleStart}>
        <span>Começar Jogo</span>
        <ChevronRight size={20} />
      </button>
    </ModalWrapper>
  );
};

export const SettingsModal = ({ onClose }) => {
  const { settings, setSettings } = useGame();

  const toggleSound = () => setSettings(prev => ({ ...prev, sound: !prev.sound }));

  return (
    <ModalWrapper title="Configurações" onClose={onClose}>
      <div className="settings-list">
        <div className="setting-item">
          <div className="setting-info">
            <div className="setting-icon">
              {settings.sound ? <Volume2 size={20} /> : <VolumeX size={20} />}
            </div>
            <div className="setting-text">
              <h3>Sons do Jogo</h3>
              <p>Efeitos sonoros e trilha</p>
            </div>
          </div>
          <button 
            className={`toggle-switch ${settings.sound ? 'active' : ''}`} 
            onClick={toggleSound}
          >
            <div className="toggle-handle" />
          </button>
        </div>

        <div className="setting-item danger">
          <div className="setting-info">
            <div className="setting-icon"><RotateCcw size={20} /></div>
            <div className="setting-text">
              <h3>Resetar Progresso</h3>
              <p>Limpa todos os dados salvos</p>
            </div>
          </div>
          <button className="btn-text">Resetar</button>
        </div>
      </div>
    </ModalWrapper>
  );
};

export const AboutModal = ({ onClose }) => (
  <ModalWrapper title="Sobre o Jogo" onClose={onClose}>
    <div className="about-content">
      <div className="about-section">
        <h3>Psicoscópio v2.0</h3>
        <p>
          Um jogo de tabuleiro educativo projetado para estimular o autoconhecimento 
          e o aprendizado através de desafios e reflexões.
        </p>
      </div>
      
      <div className="about-section">
        <h3>Como Jogar</h3>
        <ul className="tutorial-list">
          <li><div className="bullet">1</div> Jogue o dado para avançar no tabuleiro.</li>
          <li><div className="bullet">2</div> Complete desafios para ganhar pontos.</li>
          <li><div className="bullet">3</div> Reflita sobre as perguntas em cada casa.</li>
        </ul>
      </div>

      <div className="about-footer">
        <p>© 2026 Psicoscópio Team</p>
        <div className="credits">
          Desenvolvido com ❤️ para a Jornada do Conhecimento
        </div>
      </div>
    </div>
  </ModalWrapper>
);
