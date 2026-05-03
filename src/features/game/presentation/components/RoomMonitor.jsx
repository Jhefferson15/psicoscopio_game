import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Clock, BookOpen, Activity, RefreshCw, Dice5, Trophy, Timer, Star, AlertCircle, Users, Eye, X } from 'lucide-react';
import { FirebaseGameSyncRepository } from '../../data/repositories/FirebaseGameSyncRepository';

const syncRepository = new FirebaseGameSyncRepository();

const RoomMonitor = ({ roomId, onBack }) => {
  const [roomData, setRoomData] = useState(null);
  const [roomConfig, setRoomConfig] = useState(null);
  const [history, setHistory] = useState({ turns: {}, cards: {} });
  const [showDeck, setShowDeck] = useState(false);

  useEffect(() => {
    const unsubRoom = syncRepository.listenToRoomData(roomId, (data) => setRoomData(data));
    const unsubHistory = syncRepository.listenToRoomHistory(roomId, (hist) => setHistory(hist));

    // Busca configuração pesada uma única vez
    syncRepository.getRoomConfig(roomId).then(config => {
      if (config) setRoomConfig(config);
    });

    return () => {
      unsubRoom();
      unsubHistory();
    };
  }, [roomId]);

  if (!roomData) return null;

  const turnsArray = history.turns ? Object.values(history.turns).sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0)) : [];
  const cardsArray = history.cards ? Object.values(history.cards).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)) : [];
  const participants = Object.values(roomData.participants || {});
  const currentPlayer = participants.find((_, i) => i === roomData.gameState?.currentPlayerIndex);

  // Deck de Cartas Ativo (Busca no Firestore, fallback RTDB para salas antigas)
  const activeDeck = roomConfig?.cardSet?.content || roomData.gameState?.cardSet?.content || {};

  // Estatísticas calculadas
  const totalTurns = turnsArray.length;
  const avgTurnTime = totalTurns > 0 ? Math.round(turnsArray.reduce((acc, t) => acc + (t.durationSeconds || 0), 0) / totalTurns) : 0;
  const totalCards = cardsArray.length;

  return (
    <motion.div 
      className="monitor-container"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <div className="bg-pattern"></div>
      <div className="bg-glow"></div>

      <header className="monitor-header">
        <div className="header-left">
          <button className="back-btn" onClick={onBack}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="monitor-id-wrapper" onClick={() => {
              navigator.clipboard.writeText(roomId);
            }}>
              <h1>Monitor da Sala: <span className="highlight">{roomId}</span></h1>
              <RefreshCw size={14} className="spinning-slow" />
            </div>
            <p className="session-name">{roomData.metadata?.batchName || 'Sessão Individual'}</p>
          </div>
        </div>
        
        <div className="header-actions">
          <button className="btn-view-deck" onClick={() => setShowDeck(true)}>
            <Eye size={18} />
            <span>Ver Deck de Cartas</span>
          </button>
          <div className={`room-status-badge ${roomData.status || 'waiting'}`}>
            {roomData.status === 'playing' ? 'Em Partida' : 
             roomData.status === 'finished' ? 'Finalizado' : 'Lobby'}
          </div>
        </div>
      </header>

      {/* Cards de Status Rápido */}
      <div className="quick-stats-row">
        <div className="stat-card accent-purple">
          <div className="stat-icon"><Activity size={20} /></div>
          <div className="stat-info">
            <span className="stat-label">Jogador Atual</span>
            <span className="stat-value">{currentPlayer?.name || 'Aguardando...'}</span>
          </div>
        </div>
        
        <div className="stat-card accent-blue">
          <div className="stat-icon"><Dice5 size={20} /></div>
          <div className="stat-info">
            <span className="stat-label">Último Dado</span>
            <span className="stat-value">{roomData.gameState?.lastDiceRoll || '-'}</span>
          </div>
        </div>

        <div className="stat-card accent-yellow">
          <div className="stat-icon"><Trophy size={20} /></div>
          <div className="stat-info">
            <span className="stat-label">Turno Atual</span>
            <span className="stat-value">#{(roomData.gameState?.turnCount || 0) + 1}</span>
          </div>
        </div>

        <div className="stat-card accent-green">
          <div className="stat-icon"><Timer size={20} /></div>
          <div className="stat-info">
            <span className="stat-label">Média de Turno</span>
            <span className="stat-value">{avgTurnTime}s</span>
          </div>
        </div>
      </div>

      <div className="monitor-grid">
        {/* Coluna de Jogadores e Posições */}
        <div className="monitor-card players-card">
          <div className="card-header">
            <Users size={18} />
            <h2>Posições e Status</h2>
          </div>
          <div className="participants-list">
            {participants.map((p, idx) => (
              <div key={p.id} className={`p-item ${roomData.gameState?.currentPlayerIndex === idx ? 'current' : ''}`}>
                <div className="p-avatar">
                  <img src={p.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.id}`} alt={p.name} />
                  <div className={`p-online-dot ${p.isOnline ? 'online' : 'offline'}`}></div>
                </div>
                <div className="p-info">
                  <div className="p-name-row">
                    <span className="p-name">{p.name}</span>
                    {roomData.gameState?.currentPlayerIndex === idx && <Star size={12} fill="#F4C746" color="#F4C746" />}
                  </div>
                  <span className="p-status">Posição: <strong>{p.position || 0}</strong></span>
                </div>
                <div className="p-badges">
                  {p.isOnline ? <span className="badge-online">ON</span> : <span className="badge-offline">OFF</span>}
                </div>
              </div>
            ))}
            {participants.length === 0 && <p className="empty-msg">Nenhum jogador na sala.</p>}
          </div>
        </div>

        {/* Coluna Central: Métricas e Alertas */}
        <div className="central-column">
          <div className="monitor-card metrics-card">
            <div className="card-header">
              <Clock size={18} />
              <h2>Tempo Real dos Turnos</h2>
            </div>
            <div className="metrics-list">
              {turnsArray.slice(-6).reverse().map((turn, i) => (
                <div key={i} className="metric-row">
                  <span className="m-name">{turn.playerName}</span>
                  <div className="m-bar-wrapper">
                    <motion.div 
                      className="m-bar" 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (turn.durationSeconds / 60) * 100)}%` }}
                      style={{ 
                        backgroundColor: turn.durationSeconds > 45 ? '#ef4444' : '#7B4BB1' 
                      }}
                    ></motion.div>
                  </div>
                  <span className="m-val">{turn.durationSeconds}s</span>
                </div>
              ))}
              {turnsArray.length === 0 && <p className="empty-msg">Aguardando turnos...</p>}
            </div>
          </div>

          <div className="monitor-card summary-card">
             <div className="card-header">
              <AlertCircle size={18} />
              <h2>Resumo da Sessão</h2>
            </div>
            <div className="summary-grid">
              <div className="summary-item">
                <span className="label">Total de Cartas</span>
                <span className="value">{totalCards}</span>
              </div>
              <div className="summary-item">
                <span className="label">Engajamento</span>
                <span className="value">{totalTurns > 0 ? 'ALTO' : '-'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Histórico de Cartas (Timeline) */}
        <div className="monitor-card history-card">
          <div className="card-header">
            <BookOpen size={18} />
            <h2>Timeline de Cartas</h2>
            <span className="card-count-badge">{totalCards}</span>
          </div>
          <div className="timeline-list">
            <AnimatePresence initial={false}>
              {cardsArray.map((card, i) => (
                <motion.div 
                  key={card.timestamp || i} 
                  className="timeline-item"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="t-time">{new Date(card.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  <div className="t-content">
                    <div className="t-header">
                      <span className="t-player">{card.playerName}</span>
                      <span className="t-card-type" style={{ backgroundColor: `${getCardColor(card.cardType)}22`, color: getCardColor(card.cardType) }}>
                        {card.cardType}
                      </span>
                    </div>
                    <p className="t-text">"{card.cardText}"</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {cardsArray.length === 0 && <p className="empty-msg">Aguardando sorteios...</p>}
          </div>
        </div>
      </div>

      {/* Modal de Visualização do Deck */}
      <AnimatePresence>
        {showDeck && (
          <motion.div 
            className="deck-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="deck-modal-content"
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
            >
              <div className="deck-modal-header">
                <h2>Deck Ativo: {roomConfig?.cardSet?.name || roomData.gameState?.cardSet?.name || 'Conjunto de Cartas'}</h2>
                <button className="btn-close-deck" onClick={() => setShowDeck(false)}>
                  <X size={24} />
                </button>
              </div>
              
              <div className="deck-modal-body">
                {Object.entries(activeDeck).map(([category, cards]) => (
                  <div key={category} className="deck-category-section">
                    <div className="category-header" style={{ color: getCardColor(category) }}>
                      <Star size={16} fill={getCardColor(category)} />
                      <h3>{category.toUpperCase()}</h3>
                      <span className="count-badge">{cards?.length || 0}</span>
                    </div>
                    <div className="cards-list">
                      {cards?.map((text, i) => (
                        <div key={i} className="card-item-mini">
                          <p>{text}</p>
                        </div>
                      ))}
                      {(!cards || cards.length === 0) && <p className="no-cards">Nenhuma carta nesta categoria.</p>}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .monitor-container { 
          padding: 0; 
          font-family: 'Outfit', sans-serif; 
          position: relative;
          min-height: calc(100vh - 100px);
        }
        .bg-pattern {
          position: absolute;
          inset: 0;
          background-image: radial-gradient(#4885CE 1px, transparent 1px);
          background-size: 40px 40px;
          opacity: 0.05;
          pointer-events: none;
        }
        .bg-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 800px;
          height: 800px;
          background: radial-gradient(circle, rgba(72, 133, 206, 0.1) 0%, transparent 70%);
          pointer-events: none;
        }
        
        .monitor-header {
          position: relative;
          z-index: 10;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 30px;
        }
        .header-left { display: flex; align-items: center; gap: 20px; }
        .monitor-id-wrapper {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: copy;
        }
        .monitor-id-wrapper h1 {
          font-size: 1.5rem;
          margin: 0;
          color: #1e293b;
          font-weight: 800;
        }
        .monitor-id-wrapper h1 .highlight {
          color: #7B4BB1;
          font-family: 'JetBrains Mono', monospace;
        }
        .session-name { color: #64748b; font-size: 0.9rem; margin-top: 4px; font-weight: 500; }
        .spinning-slow { animation: spin 4s linear infinite; opacity: 0.3; }
        @keyframes spin { to { transform: rotate(360deg); } }

        .header-actions { display: flex; align-items: center; gap: 15px; }
        .btn-view-deck {
          background: white;
          border: 1px solid rgba(123, 75, 177, 0.1);
          color: #7B4BB1;
          padding: 8px 16px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 10px rgba(0,0,0,0.02);
        }
        .btn-view-deck:hover {
          background: #f5f3ff;
          transform: translateY(-2px);
          box-shadow: 0 8px 15px rgba(123, 75, 177, 0.1);
        }

        .room-status-badge {
          padding: 6px 16px;
          border-radius: 100px;
          font-size: 0.7rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .room-status-badge.playing { background: #dcfce7; color: #166534; }
        .room-status-badge.waiting { background: #fef3c7; color: #92400e; }
        .room-status-badge.finished { background: #fee2e2; color: #991b1b; border: 1px solid rgba(153, 27, 27, 0.1); }

        /* QUICK STATS ROW */
        .quick-stats-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-bottom: 30px;
          position: relative;
          z-index: 10;
        }
        .stat-card {
          background: white;
          padding: 20px;
          border-radius: 24px;
          display: flex;
          align-items: center;
          gap: 15px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.02);
          border: 1px solid rgba(0,0,0,0.05);
        }
        .stat-icon {
          width: 44px;
          height: 44px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .accent-purple .stat-icon { background: #f5f3ff; color: #7B4BB1; }
        .accent-blue .stat-icon { background: #eff6ff; color: #4885CE; }
        .accent-yellow .stat-icon { background: #fffbeb; color: #F4C746; }
        .accent-green .stat-icon { background: #f0fdf4; color: #6FB05E; }
        .stat-info { display: flex; flex-direction: column; }
        .stat-label { font-size: 0.7rem; color: #94a3b8; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
        .stat-value { font-size: 1.1rem; color: #1e293b; font-weight: 800; }

        /* GRID LAYOUT */
        .monitor-grid {
          position: relative;
          z-index: 10;
          display: grid;
          grid-template-columns: 320px 1fr 400px;
          gap: 25px;
          height: calc(100vh - 280px);
        }
        .central-column { display: flex; flex-direction: column; gap: 25px; }
        .monitor-card {
          background: white;
          border: 1px solid rgba(0, 0, 0, 0.05);
          border-radius: 24px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.02);
          overflow: hidden;
        }
        .card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
          color: #7B4BB1;
        }
        .card-header h2 { font-size: 0.9rem; margin: 0; color: #1e293b; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; }
        .card-count-badge { background: #f1f5f9; color: #64748b; padding: 2px 10px; border-radius: 10px; font-size: 0.75rem; font-weight: 800; }
        
        .players-card { grid-row: span 1; }
        .metrics-card { flex: 1; }
        .summary-card { height: 140px; }
        .history-card { grid-column: 3; grid-row: 1 / 2; }
        
        .participants-list { display: flex; flex-direction: column; gap: 12px; overflow-y: auto; }
        .p-item { display: flex; align-items: center; gap: 12px; padding: 10px; border-radius: 16px; transition: all 0.2s; }
        .p-item.current { background: #f5f3ff; border: 1px solid rgba(123, 75, 177, 0.1); }
        .p-avatar { position: relative; width: 44px; height: 44px; flex-shrink: 0; }
        .p-avatar img { width: 100%; height: 100%; border-radius: 50%; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
        .p-online-dot { 
          position: absolute; bottom: 0; right: 0; 
          width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;
        }
        .p-online-dot.online { background: #10b981; }
        .p-online-dot.offline { background: #ef4444; }
        .p-name-row { display: flex; align-items: center; gap: 6px; }
        .p-name { font-weight: 700; font-size: 0.95rem; color: #1e293b; }
        .p-status { font-size: 0.75rem; color: #64748b; font-weight: 500; }
        .p-badges { margin-left: auto; display: flex; gap: 5px; }
        .badge-online { font-size: 0.6rem; background: #dcfce7; color: #166534; padding: 2px 6px; border-radius: 4px; font-weight: 900; }
        .badge-offline { font-size: 0.6rem; background: #fee2e2; color: #991b1b; padding: 2px 6px; border-radius: 4px; font-weight: 900; }
        
        .metrics-list { display: flex; flex-direction: column; gap: 15px; overflow-y: auto; }
        .metric-row { display: grid; grid-template-columns: 80px 1fr 40px; align-items: center; gap: 12px; }
        .m-name { font-size: 0.75rem; color: #64748b; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .m-bar-wrapper { background: #f1f5f9; height: 10px; border-radius: 100px; overflow: hidden; }
        .m-bar { height: 100%; border-radius: 100px; }
        .m-val { font-size: 0.75rem; font-weight: 800; text-align: right; color: #1e293b; }
        
        .summary-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
        .summary-item { display: flex; flex-direction: column; gap: 4px; background: #f8fafc; padding: 12px; border-radius: 14px; }
        .summary-item .label { font-size: 0.65rem; color: #94a3b8; font-weight: 700; text-transform: uppercase; }
        .summary-item .value { font-size: 1.2rem; font-weight: 900; color: #1e293b; }

        .timeline-list { overflow-y: auto; display: flex; flex-direction: column; gap: 15px; padding-right: 5px; }
        .timeline-item { display: flex; gap: 12px; }
        .t-time { font-size: 0.7rem; color: #94a3b8; min-width: 50px; padding-top: 4px; font-weight: 700; }
        .t-content { flex: 1; background: #f8fafc; padding: 14px; border-radius: 16px; border: 1px solid #f1f5f9; }
        .t-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
        .t-player { font-weight: 800; font-size: 0.85rem; color: #1e293b; }
        .t-card-type { font-size: 0.6rem; font-weight: 900; letter-spacing: 0.5px; text-transform: uppercase; padding: 2px 8px; border-radius: 6px; }
        .t-text { margin: 0; font-size: 0.85rem; color: #475569; font-style: italic; line-height: 1.4; }
        
        .empty-msg { text-align: center; color: #94a3b8; font-size: 0.8rem; padding: 20px 0; font-weight: 500; border: 2px dashed #f1f5f9; border-radius: 16px; }

        /* DECK MODAL */
        .deck-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.4);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px;
        }
        .deck-modal-content {
          background: white;
          width: 100%;
          max-width: 900px;
          height: 80vh;
          border-radius: 32px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-shadow: 0 50px 100px rgba(0,0,0,0.1);
        }
        .deck-modal-header {
          padding: 30px 40px;
          border-bottom: 1px solid #f1f5f9;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .deck-modal-header h2 { font-size: 1.5rem; margin: 0; color: #1e293b; font-weight: 800; }
        .btn-close-deck {
          background: #f1f5f9;
          border: none;
          color: #64748b;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-close-deck:hover { background: #fee2e2; color: #ef4444; }

        .deck-modal-body {
          flex: 1;
          overflow-y: auto;
          padding: 40px;
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 30px;
          align-content: flex-start;
        }
        .deck-category-section {
          background: #f8fafc;
          border-radius: 20px;
          padding: 20px;
          border: 1px solid #f1f5f9;
        }
        .category-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 20px;
        }
        .category-header h3 { font-size: 0.8rem; margin: 0; font-weight: 900; letter-spacing: 1px; }
        .category-header .count-badge { font-size: 0.7rem; background: rgba(0,0,0,0.05); padding: 2px 8px; border-radius: 6px; font-weight: 800; }
        
        .cards-list { display: flex; flex-direction: column; gap: 10px; }
        .card-item-mini {
          background: white;
          padding: 12px;
          border-radius: 12px;
          border: 1px solid rgba(0,0,0,0.02);
          box-shadow: 0 2px 4px rgba(0,0,0,0.01);
        }
        .card-item-mini p { margin: 0; font-size: 0.85rem; color: #475569; line-height: 1.4; font-weight: 500; }
        .no-cards { font-size: 0.8rem; color: #94a3b8; font-style: italic; }

        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }

        @media (max-width: 1200px) {
          .quick-stats-row { grid-template-columns: 1fr 1fr; }
          .monitor-grid { grid-template-columns: 1fr; height: auto; }
          .history-card { grid-column: 1; }
        }
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
