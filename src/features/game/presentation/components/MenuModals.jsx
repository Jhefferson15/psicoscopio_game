import { Globe, ShieldCheck, Copy, X, Users, ChevronRight, User, Volume2, VolumeX, RotateCcw, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import CustomCardsGallery from './CustomCardsGallery';
import { useGame } from '../state/GameContext';
import { useAuth } from '../../../auth/presentation/state/AuthContext.jsx';


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
  const { initializeGame, createOnlineGame, joinOnlineGame, roomId } = useGame();

  const { user } = useAuth();
  const [mode, setMode] = useState('local'); // 'local' | 'online'
  const [joinCode, setJoinCode] = useState('');
  const [playerCount, setPlayerCount] = useState(2);
  const [playerData, setPlayerData] = useState([
    { name: 'Jogador 1', color: '#D84B42' },
    { name: 'Jogador 2', color: '#4885CE' },
    { name: 'Jogador 3', color: '#7B4BB1' },
    { name: 'Jogador 4', color: '#F59E0B' },
  ]);

  const colors = ['#D84B42', '#4885CE', '#7B4BB1', '#F59E0B', '#10B981', '#6366F1'];

  const handleStart = () => {
    if (mode === 'local') {
      initializeGame(playerData.slice(0, playerCount));
    } else {
      if (!user) {
        alert("Você precisa estar logado para criar uma sala online.");
        return;
      }
      createOnlineGame(playerData.slice(0, playerCount));
    }
  };

  const handleJoin = () => {
    if (joinCode.trim().length === 6) {
      joinOnlineGame(joinCode.toUpperCase());
    } else {
      alert("Insira um código válido de 6 caracteres.");
    }
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    alert("Código da sala copiado!");
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
      <div className="modal-tabs">
        <button 
          className={`tab-btn ${mode === 'local' ? 'active' : ''}`} 
          onClick={() => setMode('local')}
        >
          <Users size={18} />
          <span>Local</span>
        </button>
        <button 
          className={`tab-btn ${mode === 'online' ? 'active' : ''}`} 
          onClick={() => setMode('online')}
        >
          <Globe size={18} />
          <span>Online</span>
        </button>
      </div>

      {mode === 'local' ? (
        <>
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
        </>
      ) : (
        <div className="online-mode-container">
          {!user ? (
            <div className="online-auth-warning">
              <ShieldCheck size={40} color="#64748b" />
              <p>Faça login com sua conta Google para jogar online com seus amigos.</p>
            </div>
          ) : (
            <div className="online-actions">
              <div className="online-section">
                <h3>Criar Nova Sala</h3>
                <p>Crie uma sala e convide seus amigos.</p>
                <button className="btn-primary" onClick={handleStart} style={{ width: '100%' }}>
                  <Users size={20} />
                  <span>Gerar Sala Online</span>
                </button>
              </div>

              <div className="divider-text"><span>OU</span></div>

              <div className="online-section">
                <h3>Entrar em Sala</h3>
                <p>Insira o código enviado pelo seu amigo.</p>
                <div className="join-input-group">
                  <input 
                    type="text" 
                    placeholder="Ex: AB12CD" 
                    maxLength={6}
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  />
                  <button className="btn-secondary" onClick={handleJoin}>
                    <span>Entrar</span>
                  </button>
                </div>
              </div>

              {roomId && (
                <motion.div 
                  className="room-code-display"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <label>Sua Sala Criada:</label>
                  <div className="code-box" onClick={copyRoomId}>
                    <span>{roomId}</span>
                    <Copy size={16} />
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </div>
      )}
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

export const CustomCardsModal = ({ onClose }) => (
  <motion.div 
    className="collection-modal-overlay"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    onClick={onClose}
  >
    <motion.div 
      className="collection-modal-content"
      initial={{ scale: 0.9, y: 50 }}
      animate={{ scale: 1, y: 0 }}
      exit={{ scale: 0.9, y: 50 }}
      onClick={e => e.stopPropagation()}
    >
      <CustomCardsGallery isModal={true} onClose={onClose} />
    </motion.div>
  </motion.div>
);
