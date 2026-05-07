import { useState } from 'react';
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
  ChevronLeft,
  X,
  Download,
  Upload,
  Info,
  Puzzle,
  Award
} from 'lucide-react';
import './StandardCardsLayout.css';
import './StandardCardsSidebar.css';
import './StandardCardsEditor.css';
import './StandardCardsResponsive.css';

const categoryIcons = {
  memoria: Puzzle,
  reflexao: Brain,
  desafio: Zap,
  experiencia: Award,
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
    importCardSet,
    resetToDefault,
    handleGoToMenu,
    showSystemPopup
  } = useGame();

  const [editingSet, setEditingSet] = useState(null); // { id, name, content }
  const [activeCategory, setActiveCategory] = useState('reflexao');
  const [newItemText, setNewItemText] = useState('');
  const [setName, setSetName] = useState('');
  const [editingItemIndex, setEditingItemIndex] = useState(null);
  const [editingItemText, setEditingItemText] = useState('');

  const startEditing = (set) => {
    setEditingSet(JSON.parse(JSON.stringify(set)));
    setSetName(set.name);
  };

  const handleSave = () => {
    if (editingSet.id === 'default') {
      saveNewCardSet(`${setName} (Cópia)`, editingSet.content);
    } else {
      updateCardSet(editingSet.id, editingSet.content, setName);
    }
    setEditingSet(null);
    showSystemPopup({
      title: 'Salvo!',
      message: 'Coleção de cartas salva com sucesso.',
      type: 'success'
    });
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

  const startEditItem = (index, text) => {
    setEditingItemIndex(index);
    setEditingItemText(text);
  };

  const saveEditItem = () => {
    if (!editingItemText.trim() || editingItemIndex === null) return;
    const updatedContent = { ...editingSet.content };
    updatedContent[activeCategory][editingItemIndex] = editingItemText.trim();
    setEditingSet({ ...editingSet, content: updatedContent });
    setEditingItemIndex(null);
    setEditingItemText('');
  };

  const cancelEditItem = () => {
    setEditingItemIndex(null);
    setEditingItemText('');
  };

  const handleExport = (set) => {
    const data = JSON.stringify(set, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${set.name.toLowerCase().replace(/\s+/g, '_')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result);
        const newId = importCardSet(json);
        if (newId) {
          showSystemPopup({
            title: 'Importado!',
            message: 'Coleção de cartas importada com sucesso.',
            type: 'success'
          });
        }
      } catch {
        showSystemPopup({
          title: 'Erro',
          message: 'Falha ao ler o arquivo JSON.',
          type: 'error'
        });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="settings-wrapper">
      <div className="settings-ambient-bg"></div>
      
      <div className="settings-layout">
        <header className="settings-header">
          <button className="btn-back-settings" onClick={handleGoToMenu} title="Voltar ao Menu">
            <ChevronLeft size={24} />
          </button>
          <div className="settings-title-group">
            <SettingsIcon className="title-icon-settings" size={24} />
            <div>
              <h1>Ateliê de Configurações</h1>
              <p className="settings-subtitle">Personalize a experiência e as mensagens do jogo</p>
            </div>
          </div>
          <div className="settings-version-tag">v1.2.0</div>
        </header>

        <main className="settings-main-grid">
          {/* Sidebar: Lista de Conjuntos */}
          <aside className="settings-sidebar-premium">
            <div className="sidebar-header-premium">
              <h3>COLEÇÕES</h3>
              <button 
                className="btn-add-set" 
                onClick={handleCreateNew} 
                title="Novo Conjunto"
              >
                <Plus size={18} />
              </button>
              <label className="btn-import-set" title="Importar Coleção">
                <Upload size={18} />
                <input type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
              </label>
            </div>
            
            <div className="sets-list-premium">
              {availableCardSets.map(set => (
                <div 
                  key={set.id} 
                  className={`set-item-premium ${activeCardSet.id === set.id ? 'active' : ''} ${editingSet?.id === set.id ? 'editing' : ''}`}
                >
                  <div className="set-click-area" onClick={() => changeActiveCardSet(set.id)}>
                    <div className="set-active-indicator">
                      {activeCardSet.id === set.id && <Check size={12} />}
                    </div>
                    <div className="set-meta">
                      <span className="set-name-text">{set.name}</span>
                      <span className="set-count-text">{set.content?.reflexao?.length || 0} cartas</span>
                    </div>
                  </div>
                  <div className="set-actions-premium">
                    <button onClick={() => startEditing(set)} className="btn-edit-set" title="Editar Coleção">
                      <Edit3 size={16} />
                    </button>
                    <button onClick={() => handleExport(set)} className="btn-export-set" title="Exportar JSON">
                      <Download size={16} />
                    </button>
                    {set.id !== 'default' && (
                      <button className="btn-delete-set" onClick={() => {
                        showSystemPopup({
                          title: 'Excluir Coleção?',
                          message: `Deseja excluir a coleção "${set.name}"?`,
                          type: 'confirm',
                          onConfirm: () => deleteCardSet(set.id)
                        });
                      }} title="Excluir Coleção">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="sidebar-footer-premium">
               <button className="btn-reset-standard" onClick={resetToDefault}>
                 <RotateCcw size={18} />
                 <span>RESTAURAR ORIGINAIS</span>
               </button>
            </div>
          </aside>

          {/* Main Area: Edição */}
          <section className="settings-editor-premium">
            {editingSet ? (
              <div className="editor-container-premium">
                <div className="editor-top-bar">
                  <div className="editor-title-input">
                    <Edit3 size={18} className="text-muted" />
                    <input 
                      type="text" 
                      className="input-set-name"
                      value={setName}
                      onChange={(e) => setSetName(e.target.value)}
                      disabled={editingSet.id === 'default'}
                      placeholder="Nome do conjunto..."
                    />
                  </div>
                  <div className="editor-top-actions">
                     <button className="btn-cancel-edit" onClick={() => setEditingSet(null)}>DESCARTE</button>
                      <button className="btn-save-edit" onClick={handleSave}>
                        <Save size={18} />
                        <span>SALVAR COLEÇÃO</span>
                      </button>
                      <button className="btn-export-set-large" onClick={() => handleExport(editingSet)}>
                        <Download size={18} />
                      </button>
                  </div>
                </div>

                {editingSet.id === 'default' && (
                  <div className="readonly-notice">
                    <Sparkles size={16} />
                    <p>Esta é uma coleção do sistema. Suas alterações criarão uma nova cópia personalizada.</p>
                  </div>
                )}

                <div className="category-navigation">
                  {Object.keys(editingSet.content).map(cat => {
                    const Icon = categoryIcons[cat];
                    return (
                      <button 
                        key={cat}
                        className={`cat-nav-item ${activeCategory === cat ? 'active' : ''}`}
                        onClick={() => setActiveCategory(cat)}
                        style={{ '--cat-color': categoryColors[cat] }}
                      >
                        <div className="cat-icon-circle">
                          <Icon size={18} />
                        </div>
                        <span>{cat.toUpperCase()}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="category-description-editor">
                  <div className="desc-editor-header">
                    <Info size={16} />
                    <span>DEFINIÇÃO DA CATEGORIA</span>
                  </div>
                  <textarea 
                    value={editingSet.categoryDescriptions?.[activeCategory] || ''}
                    onChange={(e) => {
                      const updatedDesc = { ...editingSet.categoryDescriptions };
                      updatedDesc[activeCategory] = e.target.value;
                      setEditingSet({ ...editingSet, categoryDescriptions: updatedDesc });
                    }}
                    placeholder={`Descreva o propósito da categoria ${activeCategory}...`}
                    className="category-desc-input"
                  />
                </div>

                <div className="editor-workspace">
                  <div className="add-content-row">
                    <div className="input-glow-wrapper">
                      <input 
                        type="text" 
                        placeholder={`O que escrever em ${activeCategory}?`}
                        value={newItemText}
                        onChange={(e) => setNewItemText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addItem()}
                      />
                    </div>
                    <button className="btn-add-item-premium" onClick={addItem}>
                      <Plus size={20} />
                      <span>ADICIONAR</span>
                    </button>
                  </div>

                  <div className="content-items-list">
                    {editingSet.content[activeCategory].map((item, idx) => (
                      <div 
                        key={`${activeCategory}-${idx}`} 
                        className="premium-content-card"
                      >
                        {editingItemIndex === idx ? (
                          <>
                            <input 
                              type="text"
                              className="edit-item-input"
                              value={editingItemText}
                              onChange={(e) => setEditingItemText(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && saveEditItem()}
                              autoFocus
                            />
                            <div className="edit-actions">
                              <button className="btn-confirm-edit" onClick={saveEditItem}>
                                <Check size={16} />
                              </button>
                              <button className="btn-remove-item" onClick={cancelEditItem}>
                                <X size={16} />
                              </button>
                            </div>
                          </>
                        ) : (
                          <>
                            <p>{item}</p>
                            <div className="edit-actions">
                              <button className="btn-edit-item-inline" onClick={() => startEditItem(idx, item)}>
                                <Edit3 size={16} />
                              </button>
                              <button className="btn-remove-item" onClick={() => removeItem(idx)}>
                                <X size={16} />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                    {editingSet.content[activeCategory].length === 0 && (
                      <div className="editor-empty-state">
                        <Brain size={48} />
                        <p>Nenhuma frase nesta categoria ainda.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="editor-placeholder-premium">
                <div className="placeholder-visual">
                  <div className="blob-animation"></div>
                  <SettingsIcon size={80} className="floating-icon" />
                </div>
                <h2>Seu Ateliê Criativo</h2>
                <p>Selecione uma coleção à esquerda para editar ou comece uma do zero.</p>
                <button className="btn-create-large" onClick={handleCreateNew}>
                  <Plus size={24} />
                  <span>CRIAR NOVA COLEÇÃO</span>
                </button>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
};

export default StandardCardsSettings;
