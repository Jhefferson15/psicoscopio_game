import React from 'react';
import { motion } from 'framer-motion';
import { Users, Shield, Loader2, Play, Copy, X } from 'lucide-react';
import { useGame } from '../state/useGame';
import { useAuth } from '../../../auth/presentation/state/useAuth';
import './Lobby.css';

const Lobby = () => {
  const { roomId, roomParticipants, ownerId, startOnlineGame, goToMenu, players } = useGame();
  const { user } = useAuth();
  
  const isOwner = ownerId === user?.id;
  
  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    alert("Código da sala copiado!");
  };

  return (
    <div className="lobby-overlay">
      <motion.div 
        className="lobby-card"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="lobby-header">
          <div className="room-info">
            <h1>Sala de Espera</h1>
            <div className="room-code" onClick={copyRoomId}>
              <span>Código: {roomId}</span>
              <Copy size={16} />
            </div>
          </div>
          <button className="close-lobby" onClick={goToMenu}>
            <X size={20} />
          </button>
        </div>

        <div className="lobby-body">
          <div className="participants-list">
            <h3>Jogadores na Sala ({Object.keys(roomParticipants).length}/4)</h3>
            <div className="participants-grid">
              {Object.values(roomParticipants).map((p, index) => (
                <motion.div 
                  key={p.id}
                  className="participant-item"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="participant-avatar" style={{ backgroundColor: players[index]?.color || '#64748b' }}>
                    {p.photoURL ? (
                      <img src={p.photoURL} alt={p.name} className="avatar-img" />
                    ) : (
                      <Users size={20} color="white" />
                    )}
                  </div>
                  <div className="participant-name">
                    <span>{p.id === user?.id ? 'Você' : p.name}</span>
                    {p.id === ownerId && <Shield size={14} className="owner-badge" />}
                  </div>
                  {p.id === ownerId && <span className="owner-label">Dono</span>}
                </motion.div>
              ))}
              {[...Array(4 - Object.keys(roomParticipants).length)].map((_, i) => (
                <div key={`empty-${i}`} className="participant-item empty">
                  <div className="participant-avatar">?</div>
                  <div className="participant-name">Aguardando...</div>
                </div>
              ))}
            </div>
          </div>

          <div className="lobby-status">
            {isOwner ? (
              <div className="owner-controls">
                <p>Todos os jogadores entraram?</p>
                <button 
                  className="btn-start-game" 
                  onClick={startOnlineGame}
                  disabled={Object.keys(roomParticipants).length < 2}
                >
                  <Play size={20} />
                  <span>Iniciar Partida</span>
                </button>
                {Object.keys(roomParticipants).length < 2 && <p className="hint">Mínimo de 2 jogadores para iniciar.</p>}
              </div>
            ) : (
              <div className="waiting-status">
                <Loader2 size={24} className="spinner" />
                <p>Aguardando o dono iniciar a partida...</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Lobby;
