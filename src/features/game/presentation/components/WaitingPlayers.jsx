import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, CheckCircle, Loader2, Play } from 'lucide-react';
import { useGame } from '../state/useGame';
import { useAuth } from '../../../auth/presentation/state/useAuth';
import './WaitingPlayers.css';

const WaitingPlayers = () => {
  const { roomId, roomParticipants, readyPlayers, ownerId, players, startPlayingGame } = useGame();
  const { user } = useAuth();
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutos
  
  const isOwner = ownerId === user?.id;
  const participantList = Object.values(roomParticipants);
  const allReady = participantList.length > 0 && participantList.every(p => readyPlayers[p.id]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          if (isOwner) startPlayingGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOwner, startPlayingGame]);

  useEffect(() => {
    if (allReady && isOwner) {
      startPlayingGame();
    }
  }, [allReady, isOwner, startPlayingGame]);

  const handleForceStart = async () => {
    await startPlayingGame();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="waiting-players-overlay">
      <motion.div 
        className="waiting-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="waiting-header">
          <Clock className="timer-icon" size={32} />
          <div className="timer-display">
            <h2>Aguardando Jogadores</h2>
            <div className="countdown">{formatTime(timeLeft)}</div>
          </div>
        </div>

        <div className="waiting-body">
          <p>Os jogadores estão finalizando suas cartas no Ateliê.</p>
          
          <div className="ready-list">
            {participantList.map((p, index) => (
              <div key={p.id} className={`ready-item ${readyPlayers[p.id] ? 'is-ready' : ''}`}>
                <div className="player-avatar-small" style={{ backgroundColor: players[index]?.color || '#64748b' }}>
                   {p.photoURL ? (
                     <img src={p.photoURL} alt={p.name} className="avatar-img-small" />
                   ) : (
                     readyPlayers[p.id] ? <CheckCircle size={16} /> : <Loader2 size={16} className="spin" />
                   )}
                </div>
                <span>{p.id === user?.id ? 'Você' : (p.name || `Jogador ${index + 1}`)}</span>
                <span className="ready-status">
                  {readyPlayers[p.id] ? 'Pronto' : 'Criando cartas...'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {isOwner && (
          <div className="waiting-footer">
            <button 
              className="btn-force-start" 
              onClick={handleForceStart}
              disabled={participantList.length < 2}
            >
              <Play size={18} />
              <span>Iniciar agora com quem está pronto</span>
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default WaitingPlayers;
