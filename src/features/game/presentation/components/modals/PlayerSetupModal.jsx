import { useState } from 'react';
import { Users, Globe, User, ChevronRight, Copy, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { useGame } from '../../state/useGame';
import { useAuth } from '../../../../auth/presentation/state/useAuth';
import ModalWrapper from './ModalWrapper';

const PlayerSetupModal = ({ onClose }) => {
  const { initializeGame, createOnlineGame, joinOnlineGame, roomId, showSystemPopup } = useGame();
  const { user } = useAuth();
  
  const [mode, setMode] = useState('local'); // 'local' | 'online'
  const [joinCode, setJoinCode] = useState('');
  const [playerCount, setPlayerCount] = useState(2);
  const [playerData, setPlayerData] = useState([
    { name: 'Jogador 1', color: '#D84B42' },
    { name: 'Jogador 2', color: '#4885CE' },
    { name: 'Jogador 3', color: '#7B4BB1' },
    { name: 'Jogador 4', color: '#F59E0B' },
    { name: 'Jogador 5', color: '#10B981' },
    { name: 'Jogador 6', color: '#6366F1' },
  ]);

  const colors = ['#D84B42', '#4885CE', '#7B4BB1', '#F59E0B', '#10B981', '#6366F1'];

  const handleStart = () => {
    if (mode === 'local') {
      initializeGame(playerData.slice(0, playerCount));
    } else {
      if (!user) {
        showSystemPopup({
          title: 'Acesso Restrito',
          message: 'Você precisa estar logado para criar uma sala online.',
          type: 'error'
        });
        return;
      }
      createOnlineGame(playerData.slice(0, playerCount));
    }
  };

  const handleJoin = () => {
    if (joinCode.trim().length === 6) {
      joinOnlineGame(joinCode.toUpperCase());
    } else {
      showSystemPopup({
        title: 'Código Inválido',
        message: 'Insira um código válido de 6 caracteres.',
        type: 'error'
      });
    }
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    showSystemPopup({
      title: 'Copiado!',
      message: 'Código da sala copiado para a área de transferência.',
      type: 'success'
    });
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
              {[2, 3, 4, 5, 6].map(num => (
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

export default PlayerSetupModal;
