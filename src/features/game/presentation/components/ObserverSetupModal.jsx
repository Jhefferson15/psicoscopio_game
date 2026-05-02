import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, X, Plus, Minus, LayoutDashboard, History, RefreshCw } from 'lucide-react';
import { useGame } from '../state/useGame';
import { useAuth } from '../../../auth/presentation/state/useAuth';
import { FirebaseGameSyncRepository } from '../../data/repositories/FirebaseGameSyncRepository';


export const ObserverSetupModal = ({ onClose }) => {
  const { createObserverRooms, setCurrentScreen } = useGame();
  const { user } = useAuth();
  const [count, setCount] = useState(3);
  const [batchName, setBatchName] = useState('');
  const [loading, setLoading] = useState(false);
  const [previousBatches, setPreviousBatches] = useState([]);

  useEffect(() => {
    if (!user) return;
    const syncRepository = new FirebaseGameSyncRepository();
    const unsubscribe = syncRepository.listenToOwnerRooms(user.id, (rooms) => {
      const names = [...new Set(rooms.map(r => r.metadata?.batchName).filter(Boolean))];
      setPreviousBatches(names);
    });
    return () => unsubscribe();
  }, [user]);

  const handleCreate = async () => {
    if (!batchName.trim()) return;
    setLoading(true);
    const result = await createObserverRooms(count, batchName);
    setLoading(false);
    if (result) {
      setCurrentScreen('observer_dashboard');
      onClose();
    }
  };

  return (
    <motion.div 
      className="observer-setup-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        className="observer-setup-card"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
      >
        <button className="close-x-btn" onClick={onClose}><X size={24} /></button>
        
        <div className="setup-header">
          <div className="icon-badge">
            <Users size={32} />
          </div>
          <h2>Modo Observador</h2>
          <p>Prepare o ambiente para sua turma monitorar o progresso em tempo real.</p>
        </div>

        <div className="setup-body">
          <div className="input-section">
            <label>Nome da Turma ou Sessão</label>
            <div className="input-wrapper">
              <input 
                type="text" 
                placeholder="Ex: Psicologia 3º Semestre" 
                value={batchName}
                onChange={(e) => setBatchName(e.target.value)}
              />
            </div>
            
            {previousBatches.length > 0 && (
              <div className="history-section">
                <span className="section-label"><History size={14} /> Seleção Rápida:</span>
                <div className="batch-chips-grid">
                  {previousBatches.map(name => (
                    <button 
                      key={name} 
                      className={`batch-chip ${batchName === name ? 'selected' : ''}`}
                      onClick={() => setBatchName(name)}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="count-section">
            <div className="label-with-hint">
              <label>Quantidade de Salas</label>
              <span className="hint-text">Máx 10</span>
            </div>
            <div className="rooms-counter">
              <button className="counter-btn" onClick={() => setCount(Math.max(1, count - 1))}><Minus size={20} /></button>
              <div className="counter-value">
                <span className="digit">{count}</span>
                <span className="unit">Salas</span>
              </div>
              <button className="counter-btn" onClick={() => setCount(Math.min(10, count + 1))}><Plus size={20} /></button>
            </div>
            <p className="capacity-info">Capacidade total: <strong>{count * 4}</strong> jogadores simultâneos.</p>
          </div>
        </div>

        <div className="setup-actions">
          <button 
            className="action-btn-primary" 
            onClick={handleCreate}
            disabled={loading || !batchName.trim()}
          >
            {loading ? (
              <div className="loading-row">
                <RefreshCw size={20} className="spinning" />
                <span>Configurando salas...</span>
              </div>
            ) : (
              <>
                <LayoutDashboard size={20} />
                <span>Criar Salas e Iniciar Monitoramento</span>
              </>
            )}
          </button>
          
          <button 
            className="action-btn-ghost" 
            onClick={() => {
              setCurrentScreen('observer_dashboard');
              onClose();
            }}
          >
            Acessar Painel de Controle Existente
          </button>
        </div>
      </motion.div>

      <style>{`
        .observer-setup-overlay {
          position: fixed;
          inset: 0;
          background: rgba(255, 255, 255, 0.9);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 5000;
          padding: 20px;
          font-family: 'Outfit', sans-serif;
        }

        .observer-setup-card {
          width: 100%;
          max-width: 520px;
          background: white;
          border-radius: 40px;
          padding: 60px 50px;
          box-shadow: 
            0 30px 60px rgba(0,0,0,0.08),
            0 0 0 1px rgba(0,0,0,0.02);
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 40px;
          border-top: 8px solid #7B4BB1;
        }

        .close-x-btn {
          position: absolute;
          top: 25px;
          right: 25px;
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

        .close-x-btn:hover {
          background: #ef4444;
          color: white;
          transform: rotate(90deg);
        }

        .setup-header {
          text-align: center;
        }

        .icon-badge {
          width: 70px;
          height: 70px;
          background: #f5f3ff;
          color: #7B4BB1;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
          box-shadow: 0 10px 20px rgba(123, 75, 177, 0.1);
        }

        .setup-header h2 {
          font-size: 2.2rem;
          margin: 0 0 10px;
          color: #1e293b;
          font-weight: 800;
          letter-spacing: -1px;
        }

        .setup-header p {
          color: #64748b;
          font-size: 1.1rem;
          margin: 0;
          line-height: 1.6;
          font-weight: 500;
        }

        .setup-body {
          display: flex;
          flex-direction: column;
          gap: 30px;
        }

        .input-section label, .count-section label {
          display: block;
          font-weight: 800;
          color: #1e293b;
          text-transform: uppercase;
          font-size: 0.85rem;
          letter-spacing: 1.5px;
          margin-bottom: 12px;
        }

        .input-wrapper input {
          width: 100%;
          padding: 18px 24px;
          background: #f8fafc;
          border: 2px solid #f1f5f9;
          border-radius: 20px;
          font-size: 1.1rem;
          font-weight: 600;
          color: #1e293b;
          outline: none;
          transition: all 0.2s;
        }

        .input-wrapper input:focus {
          border-color: #7B4BB1;
          background: white;
          box-shadow: 0 0 0 5px rgba(123, 75, 177, 0.08);
        }

        .history-section {
          margin-top: 15px;
        }

        .section-label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.75rem;
          color: #94a3b8;
          font-weight: 700;
          margin-bottom: 10px;
        }

        .batch-chips-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .batch-chip {
          background: #f1f5f9;
          border: 2px solid transparent;
          color: #475569;
          padding: 8px 18px;
          border-radius: 100px;
          font-size: 0.85rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }

        .batch-chip:hover {
          background: #e2e8f0;
          color: #1e293b;
        }

        .batch-chip.selected {
          background: #7B4BB1;
          color: white;
          border-color: #7B4BB1;
          box-shadow: 0 5px 15px rgba(123, 75, 177, 0.3);
        }

        .count-section {
          background: #f8fafc;
          padding: 25px;
          border-radius: 30px;
          border: 2px solid #f1f5f9;
        }

        .label-with-hint {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .hint-text {
          font-size: 0.75rem;
          color: #94a3b8;
          font-weight: 700;
        }

        .rooms-counter {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin: 15px 0;
        }

        .counter-btn {
          width: 50px;
          height: 50px;
          border-radius: 15px;
          border: none;
          background: white;
          color: #1e293b;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 4px 10px rgba(0,0,0,0.05);
          transition: all 0.2s;
        }

        .counter-btn:hover {
          background: #7B4BB1;
          color: white;
          transform: scale(1.1);
        }

        .counter-value {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .counter-value .digit {
          font-size: 2.5rem;
          font-weight: 900;
          color: #7B4BB1;
          line-height: 1;
        }

        .counter-value .unit {
          font-size: 0.75rem;
          font-weight: 800;
          color: #94a3b8;
          text-transform: uppercase;
          margin-top: 5px;
        }

        .capacity-info {
          text-align: center;
          margin: 10px 0 0;
          font-size: 0.85rem;
          color: #64748b;
          font-weight: 500;
        }

        .setup-actions {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .action-btn-primary {
          background: #1e293b;
          color: white;
          border: none;
          padding: 22px;
          border-radius: 24px;
          font-size: 1.1rem;
          font-weight: 800;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 15px;
          box-shadow: 0 15px 30px rgba(30, 41, 59, 0.2);
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .action-btn-primary:hover:not(:disabled) {
          transform: translateY(-5px);
          box-shadow: 0 20px 40px rgba(30, 41, 59, 0.3);
          background: #7B4BB1;
        }

        .action-btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .action-btn-ghost {
          background: transparent;
          border: none;
          color: #64748b;
          font-weight: 700;
          font-size: 0.95rem;
          cursor: pointer;
          padding: 10px;
          transition: all 0.2s;
        }

        .action-btn-ghost:hover {
          color: #7B4BB1;
          text-decoration: underline;
        }

        .loading-row {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .spinning {
          animation: spin 1s linear infinite;
        }

        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        @media (max-width: 600px) {
          .observer-setup-card {
            padding: 40px 30px;
            gap: 30px;
          }
          .setup-header h2 { font-size: 1.8rem; }
          .action-btn-primary { font-size: 1rem; padding: 18px; }
        }
      `}</style>
    </motion.div>
  );
};
