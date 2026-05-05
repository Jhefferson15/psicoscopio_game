import { useState, useEffect } from 'react';
import { Clock, CheckCircle, Loader2, Play } from 'lucide-react';
import { useGame } from '../state/useGame';
import { useAuth } from '../../../auth/presentation/state/useAuth';
import './WaitingPlayers.css';

const WaitingPlayers = () => {
  const { roomParticipants, readyPlayers, ownerId, players, startPlayingGame } = useGame();
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
    <div className="waiting-screen-wrapper">
      <div className="waiting-background">
        <div className="bg-pattern"></div>
        <div className="bg-glow-waiting"></div>
      </div>
      <div className="waiting-card">
        <div className="waiting-header">
          <div className="timer-section">
            <div className="timer-ring">
              <Clock size={32} className="timer-icon-modern" />
            </div>
            <div className="timer-text">
              <span className="timer-label">TEMPO ESTIMADO</span>
              <div className="countdown-modern">{formatTime(timeLeft)}</div>
            </div>
          </div>
          <div className="header-status-badge">
            SALA EM PREPARAÇÃO
          </div>
        </div>

        <div className="waiting-body">
          <div className="preparation-context">
            <div className="context-icon">🎨</div>
            <div className="context-text">
              <h3>O Ateliê está fervendo!</h3>
              <p>Os outros jogadores estão personalizando suas cartas. A jornada começa em breve.</p>
            </div>
          </div>
          
          <div className="progress-bar-container">
            <div className="progress-bar-label">
              <span>Status dos Jogadores</span>
              <span>{Object.values(readyPlayers).filter(Boolean).length} / {participantList.length} PRONTOS</span>
            </div>
            <div className="progress-bar-track">
              <div 
                className="progress-bar-fill"
                style={{ width: `${(Object.values(readyPlayers).filter(Boolean).length / participantList.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="ready-grid-premium">
            {participantList.map((p, index) => (
              <div 
                key={p.id} 
                className={`ready-item-premium ${readyPlayers[p.id] ? 'is-ready' : ''}`}
              >
                <div className="player-avatar-wrapper" style={{ borderColor: players[index]?.color || '#64748b' }}>
                   <div className="avatar-placeholder-premium" style={{ backgroundColor: players[index]?.color || '#64748b' }}>
                      {p.name?.charAt(0).toUpperCase() || '?'}
                   </div>
                   {/* Indicador de Presença */}
                   <div className={`presence-indicator-modern ${p.isOnline ? 'is-online' : 'is-offline'}`} 
                        title={p.isOnline ? 'Online' : 'Offline'}>
                   </div>
                   {readyPlayers[p.id] && (
                     <div className="ready-badge-mini">
                       <CheckCircle size={12} />
                     </div>
                   )}
                </div>
                <div className="player-meta">
                  <span className="player-name-text">{p.id === user?.id ? 'Você' : (p.name || `Jogador ${index + 1}`)}</span>
                  <span className="player-status-tag">
                    {readyPlayers[p.id] ? 'CONCLUÍDO' : 'NO ATELIÊ...'}
                  </span>
                </div>
                {!readyPlayers[p.id] && (
                  <Loader2 size={16} className="spin-slow" />
                )}
              </div>
            ))}
          </div>
        </div>

        {isOwner && (
          <div className="waiting-footer-premium">
            <button 
              className="btn-premium-action" 
              onClick={handleForceStart}
              disabled={participantList.length < 2}
            >
              <Play size={18} fill="currentColor" />
              <span>INICIAR COM QUEM ESTÁ PRONTO</span>
            </button>
            <p className="footer-hint">Você pode aguardar os outros ou iniciar agora.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WaitingPlayers;
