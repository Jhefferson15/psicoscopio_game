import { Shield, Loader2, Play, Copy, X } from 'lucide-react';
import { useGame } from '../state/useGame';
import { useAuth } from '../../../auth/presentation/state/useAuth';
import './Lobby.css';

const Lobby = () => {
  const { roomId, roomParticipants, ownerId, hostRole, startOnlineGame, handleGoToMenu, players, showSystemPopup } = useGame();
  const { user } = useAuth();
  
  const isOwner = ownerId === user?.id;
  
  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    showSystemPopup({
      title: 'Código Copiado',
      message: 'O código da sala foi copiado para sua área de transferência.',
      type: 'info'
    });
  };

  return (
    <div className="lobby-screen-wrapper">
      <div className="lobby-background">
        <div className="bg-pattern"></div>
        <div className="bg-glow"></div>
      </div>
      <div className="lobby-card">
        <div className="lobby-header">
          <div className="room-info">
            <h1>Sala de Espera</h1>
            <div 
              className="room-code" 
              onClick={copyRoomId}
            >
              <span className="code-label">CÓDIGO DA SALA:</span>
              <span className="code-value">{roomId}</span>
              <Copy size={16} />
            </div>
          </div>
          <button className="close-lobby" onClick={handleGoToMenu} title="Sair da Sala">
            <X size={20} />
          </button>
        </div>

        <div className="lobby-body">
          <div className="participants-list">
            <div className="list-header">
              <h3>Participantes</h3>
              <div className="slots-badge">
                {Object.keys(roomParticipants).length} / 4 JOGADORES
              </div>
            </div>
            
            <div className="participants-grid">
              {Object.values(roomParticipants).map((p, index) => (
                <div 
                  key={p.id}
                  className="participant-item"
                >
                  <div className="participant-avatar" style={{ 
                    backgroundColor: players[index]?.color || '#64748b',
                    color: 'white'
                  }}>
                    {p.photoURL ? (
                      <img src={p.photoURL} alt={p.name} className="avatar-img" />
                    ) : (
                      <span>{p.name?.charAt(0).toUpperCase() || '?'}</span>
                    )}
                    {/* Indicador de Presença */}
                    <div className={`presence-indicator-modern ${p.isOnline ? 'is-online' : 'is-offline'}`} 
                         style={{ width: '12px', height: '12px', border: '1.5px solid white' }}>
                    </div>
                  </div>
                  <div className="participant-info">
                    <div className="name-row">
                      <span className="p-name">{p.id === user?.id ? 'Você' : p.name}</span>
                      {p.id === ownerId && <Shield size={14} className="owner-icon" />}
                    </div>
                    {p.id === ownerId ? (
                      <span className="p-role">Anfitrião</span>
                    ) : (
                      hostRole === 'observer' && index === 0 && <span className="p-role leader">Líder</span>
                    )}
                  </div>
                  
                  {p.id === user?.id && <div className="self-indicator" />}
                </div>
              ))}
              
              {[...Array(4 - Object.keys(roomParticipants).length)].map((_, i) => (
                <div 
                  key={`empty-${i}`} 
                  className="participant-item empty"
                  style={{ opacity: 0.5 }}
                >
                  <div className="participant-avatar">?</div>
                  <div className="participant-info">
                    <span className="p-name">Aguardando...</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lobby-status-area">
            {(isOwner || hostRole === 'observer') ? (
              <div className="owner-panel">
                <div className="panel-hint">
                  {Object.keys(roomParticipants).length < 2 
                    ? "Aguardando mais participantes..." 
                    : (isOwner ? "Todos prontos? Vamos começar!" : "Você pode iniciar a partida agora.")}
                </div>
                <button 
                  className="btn-premium-start" 
                  onClick={startOnlineGame}
                  disabled={Object.keys(roomParticipants).length < 2}
                >
                  <Play size={20} fill="currentColor" />
                  <span>INICIAR JORNADA</span>
                </button>
              </div>
            ) : (
              <div className="waiting-panel">
                <div className="loading-animation">
                  <Loader2 size={32} className="spinner-modern" />
                </div>
                <p>O anfitrião está preparando o tabuleiro...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Lobby;
