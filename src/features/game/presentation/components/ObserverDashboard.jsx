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
    if (!user) return;

    const unsubscribe = syncRepository.listenToOwnerRooms(user.id, (ownerRooms) => {
      setRooms(ownerRooms.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)));
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

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
          background: #0f172a;
          color: white;
          padding: 30px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .dashboard-header {
          flex-shrink: 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        .header-left {
          display: flex;
          align-items: center;
          gap: 20px;
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
        .header-titles h1 {
          font-size: 1.5rem;
          margin: 0;
        }
        .header-titles p {
          color: #94a3b8;
          font-size: 0.9rem;
          margin: 5px 0 0;
        }
        .header-actions {
          display: flex;
          align-items: center;
          gap: 15px;
        }
        .batch-filter {
          background: #1e293b;
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: white;
          padding: 8px 12px;
          border-radius: 8px;
          outline: none;
          cursor: pointer;
        }
        .user-badge {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(255, 255, 255, 0.05);
          padding: 5px 15px 5px 5px;
          border-radius: 20px;
        }
        .user-badge img {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          border: 2px solid #7B4BB1;
        }
        .dashboard-content {
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
          border-left: 3px solid #7B4BB1;
          padding-left: 15px;
        }
        .section-header h2 {
          font-size: 1.1rem;
          margin: 0;
          color: #f1f5f9;
        }
        .room-count {
          font-size: 0.75rem;
          color: #64748b;
          background: rgba(255, 255, 255, 0.05);
          padding: 2px 8px;
          border-radius: 10px;
        }
        .rooms-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
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
          border: 3px solid rgba(255, 255, 255, 0.1);
          border-top-color: #7B4BB1;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .spinning { animation: spin 1s linear infinite; }
        
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.2); }
      `}</style>
    </motion.div>
  );
};

const RoomCard = ({ room, onClick }) => {
  const participants = Object.values(room.participants || {});
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
          <span>{participants.length}/4 Jogadores</span>
        </div>
        <div className="stat">
          <Activity size={16} />
          <span>{turns} Turnos</span>
        </div>
      </div>

      <div className="participants-avatars">
        {participants.slice(0, 4).map((p, i) => (
          <div 
            key={p.id} 
            className="avatar-mini" 
            style={{ 
              zIndex: 5 - i, 
              borderColor: p.isOnline ? '#10b981' : '#ef4444' 
            }}
            title={p.name}
          >
            <img src={p.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.id}`} alt={p.name} />
          </div>
        ))}
        {participants.length === 0 && <span className="no-players">Ninguém entrou ainda</span>}
      </div>

      <div className="card-footer">
        <span>Criada em {new Date(room.createdAt).toLocaleTimeString()}</span>
        <Eye size={18} />
      </div>

      <style jsx>{`
        .room-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          padding: 20px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .room-card:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: #7B4BB1;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }
        .card-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 15px;
        }
        .room-id-badge {
          background: rgba(123, 75, 177, 0.15);
          border: 1px solid rgba(123, 75, 177, 0.3);
          padding: 4px 10px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: copy;
          transition: all 0.2s;
        }
        .room-id-badge:hover {
          background: rgba(123, 75, 177, 0.25);
          border-color: #7B4BB1;
        }
        .room-id-badge .label {
          font-size: 0.65rem;
          font-weight: bold;
          color: #94a3b8;
        }
        .room-id-badge .code {
          font-family: 'JetBrains Mono', monospace;
          font-weight: bold;
          color: #7B4BB1;
          letter-spacing: 1px;
        }
        .status-badge {
          font-size: 0.7rem;
          padding: 3px 10px;
          border-radius: 10px;
          text-transform: uppercase;
          font-weight: bold;
        }
        .status-badge.playing { background: rgba(16, 185, 129, 0.2); color: #10b981; }
        .status-badge.waiting { background: rgba(245, 158, 11, 0.2); color: #f59e0b; }
        .batch-name {
          font-weight: 500;
          margin-bottom: 20px;
          font-size: 1rem;
        }
        .card-stats {
          display: flex;
          gap: 15px;
          margin-bottom: 20px;
        }
        .stat {
          display: flex;
          align-items: center;
          gap: 5px;
          color: #94a3b8;
          font-size: 0.8rem;
        }
        .participants-avatars {
          display: flex;
          margin-bottom: 20px;
        }
        .avatar-mini {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          border: 2px solid #0f172a;
          margin-right: -10px;
          overflow: hidden;
          background: #1e293b;
        }
        .avatar-mini img { width: 100%; height: 100%; object-fit: cover; }
        .no-players { color: #475569; font-size: 0.8rem; font-style: italic; }
        .card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: #475569;
          font-size: 0.75rem;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          padding-top: 15px;
        }
      `}</style>
    </motion.div>
  );
};

export default ObserverDashboard;
