import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, Users, Activity, ArrowLeft, RefreshCw, Eye } from 'lucide-react';
import { useGame } from '../state/useGame';
import { useAuth } from '../../../auth/presentation/state/useAuth';
import { FirebaseGameSyncRepository } from '../../data/repositories/FirebaseGameSyncRepository';
import RoomMonitor from './RoomMonitor';

const syncRepository = new FirebaseGameSyncRepository();

const ObserverDashboard = () => {
  const { setCurrentScreen } = useGame();
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [selectedBatch, setSelectedBatch] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setCurrentScreen('menu');
      return;
    }

    const unsubscribe = syncRepository.listenToOwnerRooms(user.id, (ownerRooms) => {
      setRooms(ownerRooms.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)));
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, setCurrentScreen]);

  if (selectedRoomId) {
    return <RoomMonitor roomId={selectedRoomId} onBack={() => setSelectedRoomId(null)} />;
  }

  const batches = ['all', ...new Set(rooms.map(r => r.metadata?.batchName || 'Sem Nome'))];
  const filteredRooms = selectedBatch === 'all' 
    ? rooms 
    : rooms.filter(r => (r.metadata?.batchName || 'Sem Nome') === selectedBatch);

  // Agrupa salas por batch para visualização organizada
  const groupedRooms = filteredRooms.reduce((acc, room) => {
    const batchName = room.metadata?.batchName || 'Sem Nome';
    if (!acc[batchName]) acc[batchName] = [];
    acc[batchName].push(room);
    return acc;
  }, {});

  return (
    <motion.div 
      className="dashboard-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="bg-pattern"></div>
      <div className="bg-glow"></div>

      <header className="dashboard-header">
        <div className="header-left">
          <button className="back-btn" onClick={() => setCurrentScreen('menu')}>
            <ArrowLeft size={20} />
          </button>
          <div className="header-titles">
            <h1>Painel do Observador</h1>
            <p>{rooms.length} salas sob sua supervisão</p>
          </div>
        </div>
        <div className="header-actions">
          {batches.length > 2 && (
            <select 
              className="batch-filter"
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
            >
              <option value="all">Todas as Turmas</option>
              {batches.filter(b => b !== 'all').map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          )}
          <button className="refresh-btn" onClick={() => setLoading(true)}>
            <RefreshCw size={18} className={loading ? 'spinning' : ''} />
          </button>
          <div className="user-badge">
            <img src={user?.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=teacher'} alt="User" />
            <span>{user?.displayName || 'Professor'}</span>
          </div>
        </div>
      </header>

      <main className="dashboard-content">
        {loading ? (
          <div className="loading-state">
            <div className="loader"></div>
            <p>Carregando suas salas...</p>
          </div>
        ) : rooms.length === 0 ? (
          <div className="empty-state">
            <LayoutDashboard size={64} opacity={0.2} />
            <h2>Nenhuma sala ativa</h2>
            <p>Crie novas salas no menu inicial para começar o monitoramento.</p>
            <button className="btn-primary" onClick={() => setCurrentScreen('menu')}>Voltar ao Menu</button>
          </div>
        ) : (
          <div className="groups-container">
            {Object.entries(groupedRooms).map(([batchName, batchRooms]) => (
              <section key={batchName} className="batch-section">
                <div className="section-header">
                  <div className="section-dot"></div>
                  <h2>{batchName}</h2>
                  <span className="room-count">{batchRooms.length} {batchRooms.length === 1 ? 'sala' : 'salas'}</span>
                </div>
                <div className="rooms-grid">
                  {batchRooms.map((room) => (
                    <RoomCard 
                      key={room.id} 
                      room={room} 
                      onClick={() => setSelectedRoomId(room.id)} 
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>

      <style>{`
        .dashboard-container {
          height: 100vh;
          background: #f8fafc;
          color: #1e293b;
          padding: 30px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          font-family: 'Outfit', sans-serif;
          position: relative;
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
        .dashboard-header {
          position: relative;
          z-index: 10;
          flex-shrink: 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
        }
        .header-left {
          display: flex;
          align-items: center;
          gap: 20px;
        }
        .back-btn {
          background: white;
          border: 1px solid rgba(0, 0, 0, 0.05);
          color: #1e293b;
          width: 40px;
          height: 40px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.02);
          transition: all 0.2s;
        }
        .back-btn:hover {
          background: #f1f5f9;
          transform: translateX(-3px);
        }
        .header-titles h1 {
          font-size: 1.5rem;
          margin: 0;
          font-weight: 800;
          background: linear-gradient(135deg, #1e293b 0%, #4885CE 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .header-titles p {
          color: #64748b;
          font-size: 0.9rem;
          margin: 5px 0 0;
          font-weight: 500;
        }
        .header-actions {
          display: flex;
          align-items: center;
          gap: 15px;
        }
        .batch-filter {
          background: white;
          border: 1px solid rgba(0, 0, 0, 0.05);
          color: #1e293b;
          padding: 8px 12px;
          border-radius: 8px;
          outline: none;
          cursor: pointer;
          font-weight: 600;
          box-shadow: 0 2px 4px rgba(0,0,0,0.02);
        }
        .refresh-btn {
          background: white;
          border: 1px solid rgba(0, 0, 0, 0.05);
          color: #64748b;
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }
        .refresh-btn:hover {
          background: #f1f5f9;
          color: #4885CE;
        }
        .user-badge {
          display: flex;
          align-items: center;
          gap: 10px;
          background: white;
          padding: 5px 15px 5px 5px;
          border-radius: 20px;
          border: 1px solid rgba(0, 0, 0, 0.05);
          box-shadow: 0 2px 4px rgba(0,0,0,0.02);
        }
        .user-badge img {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          border: 2px solid #7B4BB1;
        }
        .user-badge span {
          font-weight: 700;
          font-size: 0.9rem;
          color: #1e293b;
        }
        .dashboard-content {
          position: relative;
          z-index: 10;
          flex: 1;
          overflow-y: auto;
          padding-right: 10px;
        }
        .groups-container {
          display: flex;
          flex-direction: column;
          gap: 40px;
          padding-bottom: 50px;
        }
        .batch-section {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .section-header {
          display: flex;
          align-items: center;
          gap: 12px;
          border-left: 4px solid #7B4BB1;
          padding-left: 15px;
        }
        .section-header h2 {
          font-size: 1.1rem;
          margin: 0;
          color: #1e293b;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .room-count {
          font-size: 0.75rem;
          color: #64748b;
          background: #f1f5f9;
          padding: 4px 10px;
          border-radius: 100px;
          font-weight: 700;
        }
        .rooms-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 25px;
        }
        .loading-state, .empty-state {
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 20px;
          color: #94a3b8;
        }
        .loader {
          width: 40px;
          height: 40px;
          border: 3px solid #f1f5f9;
          border-top-color: #7B4BB1;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .spinning { animation: spin 1s linear infinite; }
        
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}</style>
    </motion.div>
  );
};

const RoomCard = ({ room, onClick }) => {
  const participantCount = room.participantCount || 0;
  const participantsSummary = room.participantsSummary || [];
  const status = room.status || 'waiting';
  const turns = room.gameState?.totalTurns || 0;

  const copyCode = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(room.id);
    // Poderíamos adicionar um toast aqui, mas vamos manter simples por enquanto
    alert(`Código ${room.id} copiado!`);
  };

  return (
    <motion.div 
      className="room-card"
      whileHover={{ y: -5, scale: 1.02 }}
      onClick={onClick}
    >
      <div className="card-header">
        <div className="room-id-badge" onClick={copyCode} title="Clique para copiar">
          <span className="label">CÓDIGO:</span>
          <span className="code">{room.id}</span>
          <RefreshCw size={12} style={{ marginLeft: '5px', opacity: 0.5 }} />
        </div>
        <div className={`status-badge ${status}`}>
          {status === 'playing' ? 'Em Jogo' : status === 'waiting' ? 'Aguardando' : 'Setup'}
        </div>
      </div>
      
      <div className="batch-name">
        {room.metadata?.batchName || 'Turma Sem Nome'}
      </div>

      <div className="card-stats">
        <div className="stat">
          <Users size={16} />
          <span>{participantCount}/4 Jogadores</span>
        </div>
        <div className="stat">
          <Activity size={16} />
          <span>{turns} Turnos</span>
        </div>
      </div>

      <div className="participants-avatars">
        {participantsSummary.slice(0, 4).map((p, i) => (
          <div 
            key={p.id} 
            className="avatar-mini" 
            style={{ 
              zIndex: 5 - i, 
              borderColor: '#10b981' // Simplificado para o Dashboard
            }}
            title={p.name}
          >
            <img src={p.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.id}`} alt={p.name} />
          </div>
        ))}
        {participantsSummary.length === 0 && <span className="no-players">Ninguém entrou ainda</span>}
      </div>

      <div className="card-footer">
        <span>Criada em {new Date(room.createdAt).toLocaleTimeString()}</span>
        <Eye size={18} />
      </div>

      <style jsx>{`
        .room-card {
          background: white;
          border: 1px solid rgba(0, 0, 0, 0.05);
          border-radius: 24px;
          padding: 24px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.02);
        }
        .room-card:hover {
          transform: translateY(-5px);
          border-color: #7B4BB1;
          box-shadow: 0 15px 35px rgba(123, 75, 177, 0.08);
        }
        .card-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
        }
        .room-id-badge {
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          padding: 6px 12px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: copy;
          transition: all 0.2s;
        }
        .room-id-badge:hover {
          background: #e2e8f0;
          border-color: #cbd5e1;
        }
        .room-id-badge .label {
          font-size: 0.65rem;
          font-weight: 800;
          color: #64748b;
          letter-spacing: 0.5px;
        }
        .room-id-badge .code {
          font-family: 'JetBrains Mono', monospace;
          font-weight: 800;
          color: #7B4BB1;
          letter-spacing: 1px;
          font-size: 0.9rem;
        }
        .status-badge {
          font-size: 0.7rem;
          padding: 4px 12px;
          border-radius: 100px;
          text-transform: uppercase;
          font-weight: 800;
          letter-spacing: 0.5px;
        }
        .status-badge.playing { background: #dcfce7; color: #166534; }
        .status-badge.waiting { background: #fef3c7; color: #92400e; }
        .status-badge.setup { background: #f1f5f9; color: #475569; }
        
        .batch-name {
          font-weight: 800;
          margin-bottom: 20px;
          font-size: 1.1rem;
          color: #1e293b;
        }
        .card-stats {
          display: flex;
          gap: 20px;
          margin-bottom: 24px;
        }
        .stat {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #64748b;
          font-size: 0.85rem;
          font-weight: 600;
        }
        .participants-avatars {
          display: flex;
          margin-bottom: 24px;
          align-items: center;
        }
        .avatar-mini {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 3px solid white;
          margin-right: -12px;
          overflow: hidden;
          background: #f1f5f9;
          box-shadow: 0 4px 10px rgba(0,0,0,0.05);
        }
        .avatar-mini img { width: 100%; height: 100%; object-fit: cover; }
        .no-players { color: #94a3b8; font-size: 0.85rem; font-style: italic; }
        .card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: #94a3b8;
          font-size: 0.75rem;
          font-weight: 600;
          border-top: 1px solid #f1f5f9;
          padding-top: 20px;
        }
      `}</style>
    </motion.div>
  );
};

export default ObserverDashboard;
