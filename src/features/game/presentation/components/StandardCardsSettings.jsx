import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../state/useGame';
import { 
  Settings as SettingsIcon, 
  Plus, 
  Trash2, 
  Save, 
  RotateCcw, 
  Brain, 
  Zap, 
  Sparkles, 
  Check,
  Edit3,
  X
} from 'lucide-react';
import './StandardCardsSettings.css';

const categoryIcons = {
  memoria: Brain,
  reflexao: Brain,
  desafio: Zap,
  experiencia: Sparkles,
  sorte: Sparkles
};

const categoryColors = {
  memoria: '#4885CE',
  reflexao: '#7B4BB1',
  desafio: '#D84B42',
  experiencia: '#6FB05E',
  sorte: '#F4C746'
};

const StandardCardsSettings = () => {
  const { 
    activeCardSet, 
    availableCardSets, 
    changeActiveCardSet, 
    saveNewCardSet, 
    updateCardSet, 
    deleteCardSet,
    resetToDefault,
    goToMenu
  } = useGame();

  const [editingSet, setEditingSet] = useState(null); // { id, name, content }
  const [activeCategory, setActiveCategory] = useState('reflexao');
  const [newItemText, setNewItemText] = useState('');
  const [setName, setSetName] = useState('');

  const startEditing = (set) => {
    setEditingSet(JSON.parse(JSON.stringify(set)));
    setSetName(set.name);
  };

  const handleSave = () => {
    if (editingSet.id === 'default') {
      // Create new from default
      saveNewCardSet(`${setName} (Cópia)`, editingSet.content);
      setEditingSet(null);
    } else {
      // Update existing
      updateCardSet(editingSet.id, editingSet.content, setName);
      setEditingSet(null);
    }
  };

  const handleCreateNew = () => {
    const defaultContent = availableCardSets.find(s => s.id === 'default').content;
    const newId = saveNewCardSet('Novo Conjunto', JSON.parse(JSON.stringify(defaultContent)));
    const newSet = { id: newId, name: 'Novo Conjunto', content: JSON.parse(JSON.stringify(defaultContent)) };
    startEditing(newSet);
  };

  const addItem = () => {
    if (!newItemText.trim()) return;
    const updatedContent = { ...editingSet.content };
    updatedContent[activeCategory] = [...updatedContent[activeCategory], newItemText.trim()];
    setEditingSet({ ...editingSet, content: updatedContent });
    setNewItemText('');
  };

  const removeItem = (index) => {
    const updatedContent = { ...editingSet.content };
    updatedContent[activeCategory] = updatedContent[activeCategory].filter((_, i) => i !== index);
    setEditingSet({ ...editingSet, content: updatedContent });
  };

  return (
    <div className="settings-screen modern-light">
      <div className="settings-container">
        <header className="settings-header">
          <div className="header-title">
            <SettingsIcon className="text-purple" size={32} />
            <div>
              <h1>Configurações de Cartas</h1>
              <p>Personalize as mensagens e desafios do seu Psicoscópio</p>
            </div>
          </div>
          <button className="btn-close-settings" onClick={goToMenu}>
            <X size={24} />
          </button>
        </header>

        <main className="settings-layout">
          {/* Sidebar: Lista de Conjuntos */}
          <aside className="settings-sidebar">
            <div className="sidebar-section">
              <div className="section-header">
                <h3>MEUS CONJUNTOS</h3>
                <button className="btn-icon-small" onClick={handleCreateNew} title="Novo Conjunto">
                  <Plus size={18} />
                </button>
              </div>
              <div className="sets-list">
                {availableCardSets.map(set => (
                  <div 
                    key={set.id} 
                    className={`set-item ${activeCardSet.id === set.id ? 'active' : ''} ${editingSet?.id === set.id ? 'editing' : ''}`}
                  >
                    <div className="set-info" onClick={() => changeActiveCardSet(set.id)}>
                      <div className="set-status-dot">
                        {activeCardSet.id === set.id && <Check size={12} />}
                      </div>
                      <span className="set-name">{set.name}</span>
                    </div>
                    <div className="set-actions">
                      <button onClick={() => startEditing(set)} title="Editar">
                        <Edit3 size={16} />
                      </button>
                      {set.id !== 'default' && (
                        <button className="text-red" onClick={() => deleteCardSet(set.id)} title="Excluir">
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="sidebar-footer">
               <button className="btn-secondary full-width" onClick={resetToDefault}>
                 <RotateCcw size={18} />
                 <span>Resetar para o Padrão</span>
               </button>
            </div>
          </aside>

          {/* Main Area: Edição */}
          <section className="settings-editor">
            <AnimatePresence mode="wait">
              {editingSet ? (
                <motion.div 
                  key="editor"
                  className="editor-content"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <div className="editor-header">
                    <input 
                      type="text" 
                      className="edit-set-name"
                      value={setName}
                      onChange={(e) => setSetName(e.target.value)}
                      disabled={editingSet.id === 'default'}
                      placeholder="Nome do conjunto..."
                    />
                    <div className="editor-actions">
                       <button className="btn-outline" onClick={() => setEditingSet(null)}>Cancelar</button>
                       <button className="btn-primary" onClick={handleSave}>
                         <Save size={18} />
                         <span>Salvar Alterações</span>
                       </button>
                    </div>
                  </div>

                  {editingSet.id === 'default' && (
                    <div className="alert-info">
                      <p>O conjunto padrão não pode ser modificado. Ao salvar, uma cópia será criada.</p>
                    </div>
                  )}

                  <div className="category-tabs">
                    {Object.keys(editingSet.content).map(cat => {
                      const Icon = categoryIcons[cat];
                      return (
                        <button 
                          key={cat}
                          className={`cat-tab ${activeCategory === cat ? 'active' : ''}`}
                          onClick={() => setActiveCategory(cat)}
                          style={{ '--cat-color': categoryColors[cat] }}
                        >
                          <Icon size={18} />
                          <span>{cat.charAt(0).toUpperCase() + cat.slice(1)}</span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="items-editor">
                    <div className="add-item-row">
                      <input 
                        type="text" 
                        placeholder={`Adicionar nova frase para ${activeCategory}...`}
                        value={newItemText}
                        onChange={(e) => setNewItemText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addItem()}
                      />
                      <button className="btn-add" onClick={addItem}>
                        <Plus size={20} />
                      </button>
                    </div>

                    <div className="items-list">
                      {editingSet.content[activeCategory].map((item, idx) => (
                        <motion.div 
                          key={idx} 
                          className="content-item"
                          layout
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          <p>{item}</p>
                          <button className="btn-remove" onClick={() => removeItem(idx)}>
                            <Trash2 size={16} />
                          </button>
                        </motion.div>
                      ))}
                      {editingSet.content[activeCategory].length === 0 && (
                        <div className="empty-state">
                          <p>Nenhuma frase cadastrada nesta categoria.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="placeholder"
                  className="editor-placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="placeholder-content">
                    <SettingsIcon size={64} className="text-muted" />
                    <h2>Editor de Cartas</h2>
                    <p>Selecione um conjunto na lateral para editar as mensagens ou crie um novo conjunto personalizado.</p>
                    <button className="btn-primary" onClick={handleCreateNew}>
                      <Plus size={18} />
                      <span>Criar Novo Conjunto</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        </main>
      </div>
    </div>
  );
};

export default StandardCardsSettings;
