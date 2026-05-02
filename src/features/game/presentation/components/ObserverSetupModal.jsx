import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, X, Plus, Minus, LayoutDashboard, History } from 'lucide-react';
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
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        className="modal-content observer-setup"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
      >
        <button className="close-button" onClick={onClose}><X size={20} /></button>
        
        <div className="modal-header">
          <Users size={32} color="#7B4BB1" />
          <h2>Modo Observador</h2>
          <p>Crie múltiplas salas para sua turma monitorar o progresso em tempo real.</p>
        </div>

        <div className="setup-fields">
          <div className="field-group">
            <label>Nome da Turma / Sessão</label>
            <input 
              type="text" 
              placeholder="Ex: Psicologia 3º Semestre" 
              value={batchName}
              onChange={(e) => setBatchName(e.target.value)}
            />
            {previousBatches.length > 0 && (
              <div className="previous-batches">
                <span className="hint"><History size={12} /> Usar anterior:</span>
                <div className="batch-chips">
                  {previousBatches.map(name => (
                    <button 
                      key={name} 
                      className={`chip ${batchName === name ? 'active' : ''}`}
                      onClick={() => setBatchName(name)}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="field-group">
            <label>Quantidade de Salas</label>
            <div className="counter-control">
              <button onClick={() => setCount(Math.max(1, count - 1))}><Minus size={18} /></button>
              <span className="count-display">{count}</span>
              <button onClick={() => setCount(Math.min(10, count + 1))}><Plus size={18} /></button>
            </div>
            <small>Cada sala suporta até 4 jogadores.</small>
          </div>
        </div>

        <div className="modal-footer">
          <button 
            className="btn-primary" 
            onClick={handleCreate}
            disabled={loading || !batchName.trim()}
          >
            {loading ? 'Criando salas...' : 'Criar Salas e Abrir Painel'}
          </button>
          <button 
            className="btn-secondary" 
            onClick={() => {
              setCurrentScreen('observer_dashboard');
              onClose();
            }}
          >
            <LayoutDashboard size={18} />
            Acessar Painel Existente
          </button>
        </div>
      </motion.div>

      <style>{`
        .observer-setup {
          max-width: 450px;
          padding: 40px;
        }
        .modal-header {
          text-align: center;
          margin-bottom: 30px;
        }
        .modal-header h2 {
          margin: 15px 0 5px;
          color: white;
        }
        .modal-header p {
          color: #94a3b8;
          font-size: 0.9rem;
        }
        .setup-fields {
          display: flex;
          flex-direction: column;
          gap: 20px;
          margin-bottom: 30px;
        }
        .field-group label {
          display: block;
          color: #cbd5e1;
          font-size: 0.85rem;
          margin-bottom: 8px;
        }
        .field-group input {
          width: 100%;
          padding: 12px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: white;
          outline: none;
        }
        .field-group input:focus {
          border-color: #7B4BB1;
          background: rgba(255, 255, 255, 0.08);
        }
        .previous-batches {
          margin-top: 10px;
        }
        .previous-batches .hint {
          font-size: 0.7rem;
          color: #64748b;
          display: flex;
          align-items: center;
          gap: 5px;
          margin-bottom: 5px;
        }
        .batch-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .chip {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #cbd5e1;
          padding: 4px 10px;
          border-radius: 15px;
          font-size: 0.75rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        .chip:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: #7B4BB1;
        }
        .chip.active {
          background: rgba(123, 75, 177, 0.2);
          border-color: #7B4BB1;
          color: white;
        }
        .counter-control {
          display: flex;
          align-items: center;
          gap: 20px;
          background: rgba(0, 0, 0, 0.2);
          padding: 10px;
          border-radius: 12px;
          width: fit-content;
        }
        .counter-control button {
          background: rgba(255, 255, 255, 0.1);
          border: none;
          color: white;
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }
        .count-display {
          font-size: 1.5rem;
          font-weight: bold;
          min-width: 30px;
          text-align: center;
        }
        .modal-footer {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </motion.div>
  );
};
