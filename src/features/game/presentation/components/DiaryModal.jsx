import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  Smile, 
  Meh, 
  Frown, 
  Book, 
  Filter,
  Check,
  ChevronRight
} from 'lucide-react';
import { useGame } from '../state/useGame';
import './DiaryModal.css';

const MOODS = [
  { id: 'happy', icon: Smile, color: '#10B981', label: 'Feliz' },
  { id: 'neutral', icon: Meh, color: '#6366F1', label: 'Neutro' },
  { id: 'sad', icon: Frown, color: '#F59E0B', label: 'Desafiado' },
];

const TYPES = [
  { id: 'reflexao', label: 'Reflexão', color: '#7B4BB1' },
  { id: 'desafio', label: 'Desafio', color: '#D84B42' },
  { id: 'aprendizado', label: 'Aprendizado', color: '#4885CE' },
];

const DiaryModal = ({ onClose }) => {
  const { diaryEntries, addDiaryEntry, removeDiaryEntry, updateDiaryEntry } = useGame();
  const [isAdding, setIsAdding] = useState(false);
  const [newText, setNewText] = useState('');
  const [selectedMood, setSelectedMood] = useState('neutral');
  const [selectedType, setSelectedType] = useState('reflexao');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');

  const handleAdd = () => {
    if (newText.trim()) {
      addDiaryEntry(newText, selectedType, selectedMood);
      setNewText('');
      setIsAdding(false);
    }
  };

  const startEditing = (entry) => {
    setEditingId(entry.id);
    setEditText(entry.text);
  };

  const handleUpdate = (id) => {
    if (editText.trim()) {
      updateDiaryEntry(id, editText);
      setEditingId(null);
    }
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: 'short', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <motion.div 
      className="diary-modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div 
        className="diary-modal-container glass-light"
        initial={{ scale: 0.9, y: 50, rotateX: -10 }}
        animate={{ scale: 1, y: 0, rotateX: 0 }}
        exit={{ scale: 0.9, y: 50, rotateX: -10 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="diary-header">
          <div className="diary-title">
            <div className="diary-icon-wrapper">
              <Book size={24} />
            </div>
            <div>
              <h2>Diário de Bordo</h2>
              <p>Registre sua jornada de autoconhecimento</p>
            </div>
          </div>
          <button className="diary-close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="diary-content">
          <div className="diary-actions">
            <button 
              className={`btn-add-entry ${isAdding ? 'active' : ''}`}
              onClick={() => setIsAdding(!isAdding)}
            >
              <Plus size={20} />
              <span>{isAdding ? 'Cancelar' : 'Nova Entrada'}</span>
            </button>
            <div className="diary-stats">
              <span className="stat-item">
                <strong>{diaryEntries.length}</strong> Entradas
              </span>
            </div>
          </div>

          <AnimatePresence>
            {isAdding && (
              <motion.div 
                className="new-entry-form glass-light"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
              >
                <textarea 
                  placeholder="O que você está sentindo ou aprendeu agora?"
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  autoFocus
                />
                <div className="form-footer">
                  <div className="selectors">
                    <div className="mood-selector">
                      {MOODS.map(mood => (
                        <button 
                          key={mood.id}
                          className={`mood-btn ${selectedMood === mood.id ? 'active' : ''}`}
                          onClick={() => setSelectedMood(mood.id)}
                          title={mood.label}
                          style={{ '--mood-color': mood.color }}
                        >
                          <mood.icon size={20} />
                        </button>
                      ))}
                    </div>
                    <div className="type-selector">
                      {TYPES.map(type => (
                        <button 
                          key={type.id}
                          className={`type-tag ${selectedType === type.id ? 'active' : ''}`}
                          onClick={() => setSelectedType(type.id)}
                          style={{ '--type-color': type.color }}
                        >
                          {type.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button className="btn-save-entry" onClick={handleAdd} disabled={!newText.trim()}>
                    <Save size={18} />
                    <span>Salvar</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="entries-list">
            {diaryEntries.length === 0 ? (
              <div className="empty-diary">
                <Book size={48} opacity={0.2} />
                <p>Seu diário ainda está vazio. Comece a escrever!</p>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {diaryEntries.map((entry) => (
                  <motion.div 
                    key={entry.id}
                    className={`diary-entry-item ${entry.type}`}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                  >
                    <div className="entry-header">
                      <div className="entry-meta">
                        <span className="entry-date">{formatDate(entry.timestamp)}</span>
                        <span className="entry-type-tag" style={{ '--type-color': TYPES.find(t => t.id === entry.type)?.color }}>
                          {TYPES.find(t => t.id === entry.type)?.label}
                        </span>
                      </div>
                      <div className="entry-mood" style={{ color: MOODS.find(m => m.id === entry.mood)?.color }}>
                        {React.createElement(MOODS.find(m => m.id === entry.mood)?.icon || Meh, { size: 18 })}
                      </div>
                    </div>

                    <div className="entry-body">
                      {editingId === entry.id ? (
                        <div className="edit-area">
                          <textarea 
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            autoFocus
                          />
                          <div className="edit-actions">
                            <button className="btn-icon-save" onClick={() => handleUpdate(entry.id)}>
                              <Check size={18} />
                            </button>
                            <button className="btn-icon-cancel" onClick={() => setEditingId(null)}>
                              <X size={18} />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p>{entry.text}</p>
                      )}
                    </div>

                    <div className="entry-footer">
                      <div className="entry-actions-row">
                        <button className="entry-action-btn" onClick={() => startEditing(entry)}>
                          <Edit3 size={14} />
                          <span>Editar</span>
                        </button>
                        <button className="entry-action-btn danger" onClick={() => removeDiaryEntry(entry.id)}>
                          <Trash2 size={14} />
                          <span>Excluir</span>
                        </button>
                      </div>
                      <ChevronRight size={16} className="entry-chevron" />
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default DiaryModal;
