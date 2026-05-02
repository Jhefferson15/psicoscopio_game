import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, BookOpen, Activity, RefreshCw } from 'lucide-react';
import { FirebaseGameSyncRepository } from '../../data/repositories/FirebaseGameSyncRepository';

const syncRepository = new FirebaseGameSyncRepository();

const RoomMonitor = ({ roomId, onBack }) => {
  const [roomData, setRoomData] = useState(null);
  const [history, setHistory] = useState({ turns: {}, cards: {} });

  useEffect(() => {
    const unsubRoom = syncRepository.listenToRoomData(roomId, (data) => setRoomData(data));
    const unsubHistory = syncRepository.listenToRoomHistory(roomId, (hist) => setHistory(hist));

    return () => {
      unsubRoom();
      unsubHistory();
    };
  }, [roomId]);

  if (!roomData) return null;

  const turnsArray = history.turns ? Object.values(history.turns).sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0)) : [];
  const cardsArray = history.cards ? Object.values(history.cards).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)) : [];
  const participants = Object.values(roomData.participants || {});

  return (
    <motion.div 
      className="monitor-container"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <header className="monitor-header">
        <div className="header-left">
          <button className="back-btn" onClick={onBack}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="monitor-id-wrapper" onClick={() => {
              navigator.clipboard.writeText(roomId);
              alert(`Código ${roomId} copiado!`);
            }}>
              <h1>Monitor da Sala: <span className="highlight">{roomId}</span></h1>
              <RefreshCw size={14} />
            </div>
            <p>{roomData.metadata?.batchName || 'Sessão Individual'}</p>
          </div>
        </div>
        <div className={`room-status-badge ${roomData.status}`}>
          {roomData.status === 'playing' ? 'Em Partida' : 'Lobby'}
        </div>
      </header>

      <div className="monitor-grid">
        {/* Coluna de Jogadores */}
        <div className="monitor-card players-card">
          <div className="card-header">
            <Activity size={18} />
            <h2>Participantes Ativos</h2>
          </div>
          <div className="participants-list">
            {participants.map(p => (
              <div key={p.id} className="p-item">
                <div className="p-avatar">
                  <img src={p.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.id}`} alt={p.name} />
                  <div className={`p-online-dot ${p.isOnline ? 'online' : 'offline'}`}></div>
                </div>
                <div className="p-info">
                  <span className="p-name">{p.name}</span>
                  <span className="p-status">{p.isOnline ? 'Conectado' : 'Desconectado'}</span>
                </div>
              </div>
            ))}
            {participants.length === 0 && <p className="empty-msg">Nenhum jogador na sala.</p>}
          </div>
        </div>

        {/* Coluna de Métricas de Tempo */}
        <div className="monitor-card metrics-card">
          <div className="card-header">
            <Clock size={18} />
            <h2>Desempenho de Tempo</h2>
          </div>
          <div className="metrics-list">
            {turnsArray.slice(-5).reverse().map((turn, i) => (
              <div key={i} className="metric-row">
                <span className="m-name">{turn.playerName}</span>
                <div className="m-bar-wrapper">
                  <div 
                    className="m-bar" 
                    style={{ 
                      width: `${Math.min(100, (turn.durationSeconds / 60) * 100)}%`,
                      backgroundColor: turn.durationSeconds > 45 ? '#ef4444' : '#7B4BB1' 
                    }}
                  ></div>
                </div>
                <span className="m-val">{turn.durationSeconds}s</span>
              </div>
            ))}
            {turnsArray.length === 0 && <p className="empty-msg">Aguardando início dos turnos...</p>}
          </div>
        </div>

        {/* Histórico de Cartas (Timeline) */}
        <div className="monitor-card history-card">
          <div className="card-header">
            <BookOpen size={18} />
            <h2>Histórico de Cartas Sorteada</h2>
          </div>
          <div className="timeline-list">
            {cardsArray.map((card, i) => (
              <div key={i} className="timeline-item">
                <div className="t-time">{new Date(card.timestamp).toLocaleTimeString()}</div>
                <div className="t-content">
                  <span className="t-player">{card.playerName}</span>
                  <span className="t-card-type" style={{ color: getCardColor(card.cardType) }}>
                    {card.cardType.toUpperCase()}
                  </span>
                  <p className="t-text">"{card.cardText}"</p>
                </div>
              </div>
            ))}
            {cardsArray.length === 0 && <p className="empty-msg">Nenhuma carta sorteada ainda.</p>}
          </div>
        </div>
      </div>

      <style>{`
        .monitor-container { padding: 0; }
        .monitor-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }
        .header-left { display: flex; align-items: center; gap: 20px; }
        .monitor-id-wrapper {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: copy;
        }
        .monitor-id-wrapper h1 .highlight {
          color: #7B4BB1;
          font-family: 'JetBrains Mono', monospace;
        }
        .monitor-id-wrapper:hover h1 .highlight {
          text-decoration: underline;
        }
        .back-btn {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: white;
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }
        .room-status-badge {
          padding: 5px 15px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: bold;
        }
        .room-status-badge.playing { background: #10b981; color: white; }
        .room-status-badge.waiting { background: #f59e0b; color: white; }
        
        .monitor-grid {
          display: grid;
          grid-template-columns: 300px 1fr;
          grid-template-rows: auto 1fr;
          gap: 25px;
          height: calc(100vh - 150px);
        }
        .monitor-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          padding: 20px;
          display: flex;
          flex-direction: column;
        }
        .card-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 20px;
          color: #7B4BB1;
        }
        .card-header h2 { font-size: 1rem; margin: 0; color: white; }
        
        .players-card { grid-row: span 1; }
        .metrics-card { grid-row: span 1; }
        .history-card { grid-column: 2; grid-row: 1 / 3; }
        
        .participants-list { display: flex; flex-direction: column; gap: 15px; }
        .p-item { display: flex; align-items: center; gap: 12px; }
        .p-avatar { position: relative; width: 40px; height: 40px; }
        .p-avatar img { width: 100%; height: 100%; border-radius: 50%; }
        .p-online-dot { 
          position: absolute; bottom: 0; right: 0; 
          width: 10px; height: 10px; border-radius: 50%; border: 2px solid #0f172a;
        }
        .p-online-dot.online { background: #10b981; }
        .p-online-dot.offline { background: #ef4444; }
        .p-name { display: block; font-weight: 500; font-size: 0.9rem; }
        .p-status { font-size: 0.7rem; color: #64748b; }
        
        .metrics-list { display: flex; flex-direction: column; gap: 15px; }
        .metric-row { display: grid; grid-template-columns: 80px 1fr 40px; align-items: center; gap: 10px; }
        .m-name { font-size: 0.75rem; color: #94a3b8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .m-bar-wrapper { background: rgba(255, 255, 255, 0.05); height: 8px; border-radius: 4px; overflow: hidden; }
        .m-bar { height: 100%; border-radius: 4px; transition: width 0.5s ease; }
        .m-val { font-size: 0.75rem; font-weight: bold; text-align: right; }
        
        .timeline-list { overflow-y: auto; display: flex; flex-direction: column; gap: 20px; padding-right: 10px; }
        .timeline-item { display: flex; gap: 15px; }
        .t-time { font-size: 0.7rem; color: #475569; min-width: 60px; padding-top: 3px; }
        .t-content { flex: 1; background: rgba(255, 255, 255, 0.02); padding: 10px; border-radius: 8px; border-left: 2px solid #7B4BB1; }
        .t-player { font-weight: bold; font-size: 0.85rem; margin-right: 10px; }
        .t-card-type { font-size: 0.7rem; font-weight: bold; }
        .t-text { margin: 8px 0 0; font-size: 0.85rem; color: #cbd5e1; font-style: italic; }
        
        .empty-msg { text-align: center; color: #475569; font-size: 0.85rem; padding: 20px 0; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
      `}</style>
    </motion.div>
  );
};

const getCardColor = (type) => {
  const colors = {
    reflexao: '#7B4BB1',
    desafio: '#D84B42',
    sorte: '#F4C746',
    memoria: '#4885CE',
    experiencia: '#6FB05E'
  };
  return colors[type] || '#94a3b8';
};

export default RoomMonitor;
