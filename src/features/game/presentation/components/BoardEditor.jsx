import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  Save, 
  Trash2, 
  Plus, 
  Check, 
  Clock, 
  Dice5, 
  Edit3,
  X,
  Zap,
  Sparkles,
  Search,
  MessageSquare,
  Settings,
  PlusCircle,
  BookOpen,
  Users,
  Download,
  Upload,
  Image as ImageIcon
} from 'lucide-react';
import { useGame } from '../state/useGame';
import { GenerateRandomBoardConfig } from '../../domain/usecases/GenerateRandomBoardConfig';
import { BoardConfigRepository } from '../../data/repositories/BoardConfigRepository';
import './BoardEditor.css';

const TILE_TYPES = [
  { id: 'brain', label: 'Cérebro', color: '#D84B42', icon: Zap },
  { id: 'reflexao', label: 'Reflexão', color: '#7B4BB1', icon: Sparkles },
  { id: 'desafio', label: 'Desafio', color: '#D84B42', icon: Zap },
  { id: 'memoria', label: 'Memória', color: '#4885CE', icon: Search },
  { id: 'especial', label: 'Especial', color: '#FFFFFF', icon: Sparkles },
  { id: 'bulb', label: 'Lâmpada', color: '#F4C746', icon: Zap },
  { id: 'eye', label: 'Olho', color: '#4885CE', icon: Search },
  { id: 'cycle', label: 'Ciclo', color: '#6FB05E', icon: Settings },
  { id: 'target', label: 'Alvo', color: '#D84B42', icon: Zap },
  { id: 'puzzle', label: 'Puzzle', color: '#6FB05E', icon: Settings },
  { id: 'chat', label: 'Chat', color: '#6FB05E', icon: MessageSquare },
  { id: 'slider', label: 'Controle', color: '#F4C746', icon: Settings }
];

const TILE_ACTIONS = [
  { id: null, label: 'Nenhuma', icon: X },
  { id: 'MOVE_2', label: 'Avançar 2', icon: Zap },
  { id: 'BACK_2', label: 'Voltar 2', icon: ChevronLeft },
  { id: 'SWAP_PLACE', label: 'Trocar Lugar', icon: Settings },
  { id: 'MOVE_INNER', label: 'Para Interno', icon: Sparkles },
  { id: 'MOVE_OUTER', label: 'Para Externo', icon: Sparkles },
  { id: 'SKIP_TURN', label: 'Pular Vez', icon: Clock },
  { id: 'DRAW_2', label: 'Pegar 2 Cartas', icon: Plus },
  { id: 'TEAM_CHALLENGE', label: 'Desafio Equipe', icon: Users },
  { id: 'SHARE_CARD', label: 'Mostrar Carta', icon: MessageSquare },
  { id: 'CREATE_CARD', label: 'Criar Carta', icon: PlusCircle },
  { id: 'WRITE_DIARY', label: 'No Diário', icon: BookOpen }
];

const COLORS = [
  '#D84B42', '#4885CE', '#7B4BB1', '#F59E0B', '#10B981', '#6366F1', '#F4C746', '#6FB05E', '#FFFFFF',
  '#EC4899', '#F97316', '#8B5CF6', '#06B6D4', '#84CC16', '#3B82F6', '#EF4444', '#14B8A6', '#FACC15',
  '#A855F7', '#64748B', '#000000', '#FFD700', '#C0C0C0', '#CD7F32', '#FF69B4', '#40E0D0', '#9FE2BF'
];

const BoardEditor = () => {
  const { 
    activeBoardConfig, 
    availableBoardConfigs, 
    changeActiveBoardConfig, 
    saveNewBoardConfig, 
    updateBoardConfig, 
    deleteBoardConfig,
    importBoardConfig,
    handleGoToMenu,
    showSystemPopup
  } = useGame();

  const [editingConfig, setEditingConfig] = useState(() => activeBoardConfig ? JSON.parse(JSON.stringify(activeBoardConfig)) : null);
  const [configName, setConfigName] = useState(activeBoardConfig?.name || '');
  const [selectedTileIndex, setSelectedTileIndex] = useState(null);

  const handleSave = () => {
    const isNew = editingConfig.id === 'default' || editingConfig.id.startsWith('temp-');
    
    if (isNew) {
      const nameToSave = editingConfig.id === 'default' ? `${configName} (Cópia)` : configName;
      const newId = saveNewBoardConfig(nameToSave, editingConfig.tiles, editingConfig.mechanics);
      
      // Atualiza o estado local com o novo ID real
      setEditingConfig(prev => ({ ...prev, id: newId, name: nameToSave }));
      setConfigName(nameToSave);
      changeActiveBoardConfig(newId);
    } else {
      updateBoardConfig(editingConfig.id, editingConfig.tiles, editingConfig.mechanics, configName);
      changeActiveBoardConfig(editingConfig.id);
    }

    showSystemPopup({
      title: 'Sucesso!',
      message: 'Configuração de tabuleiro salva com sucesso.',
      type: 'success'
    });
  };

  const handleTileChange = (index, field, value) => {
    const newTiles = [...editingConfig.tiles];
    newTiles[index] = { ...newTiles[index], [field]: value };
    setEditingConfig({ ...editingConfig, tiles: newTiles });
  };

  const handleMechanicChange = (field, value) => {
    setEditingConfig({
      ...editingConfig,
      mechanics: { ...editingConfig.mechanics, [field]: parseInt(value) || 0 }
    });
  };

  const handleRandomize = () => {
    const randomBoard = GenerateRandomBoardConfig.execute(
      editingConfig.tiles, 
      TILE_TYPES, 
      TILE_ACTIONS, 
      COLORS
    );
    
    setEditingConfig({
      ...editingConfig,
      name: randomBoard.name,
      mechanics: randomBoard.mechanics,
      tiles: randomBoard.tiles
    });
    setConfigName(randomBoard.name);

    showSystemPopup({
      title: 'Aleatorizado!',
      message: 'Novo tabuleiro gerado com sucesso.',
      type: 'success'
    });
  };

  const startNewBoard = () => {
    const defaultConfig = availableBoardConfigs.find(c => c.id === 'default') || BoardConfigRepository.getDefaultConfig();
    const newConfig = JSON.parse(JSON.stringify(defaultConfig));
    newConfig.id = 'temp-' + Date.now();
    newConfig.name = 'Novo Tabuleiro';
    setEditingConfig(newConfig);
    setConfigName('Novo Tabuleiro');
    setSelectedTileIndex(null);

    showSystemPopup({
      title: 'Novo Tabuleiro',
      message: 'Um novo rascunho de tabuleiro foi criado.',
      type: 'success'
    });
  };

  const handleExport = (config) => {
    const data = JSON.stringify(config, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${config.name.toLowerCase().replace(/\s+/g, '_')}.json`;
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
        const newId = importBoardConfig(json);
        if (newId) {
          showSystemPopup({
            title: 'Importado!',
            message: 'Configuração de tabuleiro importada com sucesso.',
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

  if (!editingConfig) return null;

  const currentTile = selectedTileIndex !== null ? editingConfig.tiles[selectedTileIndex] : null;

  return (
    <div className="board-editor-wrapper">
      <motion.div 
        className="board-editor-layout"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <header className="board-editor-header">
          <button className="btn-back-editor" onClick={handleGoToMenu}>
            <ChevronLeft size={24} />
          </button>
          <div className="header-title">
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e293b' }}>Editor de Tabuleiro</h1>
            <p style={{ fontSize: '0.875rem', color: '#64748b' }}>Visualize e edite clicando no tabuleiro</p>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '1rem' }}>
              <button className="btn-export-board" onClick={() => handleExport(editingConfig)} title="Exportar JSON">
                <Download size={18} />
              </button>
              <button className="btn-save-board" onClick={handleSave}>
                <Save size={18} />
                <span>Salvar Alterações</span>
              </button>
          </div>
        </header>

        <main className="board-editor-main">
          <aside className="editor-sidebar">
            <div className="sidebar-section">
              <h3>COLEÇÕES</h3>
              <button className="btn-add-set" onClick={startNewBoard} style={{ width: '100%', marginTop: '0.5rem', padding: '0.75rem', borderRadius: '10px', background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#1e293b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <Plus size={16} />
                <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>CRIAR NOVO</span>
              </button>
              <label className="btn-add-set" style={{ width: '100%', marginTop: '0.5rem', padding: '0.75rem', borderRadius: '10px', background: '#f1f5f9', border: '1px dashed #cbd5e1', color: '#1e293b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }} title="Importar Tabuleiro">
                <Upload size={16} />
                <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>IMPORTAR</span>
                <input type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
              </label>
              <button 
                className="btn-add-set" 
                onClick={handleRandomize} 
                style={{ width: '100%', marginTop: '1rem', padding: '0.75rem', borderRadius: '10px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
              >
                <Sparkles size={16} />
                <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>GERAR ALEATÓRIO</span>
              </button>
            </div>
            
            <div className="config-list">
              {availableBoardConfigs.map(config => (
                <div 
                  key={config.id} 
                  className={`config-item ${editingConfig.id === config.id ? 'active' : ''}`}
                  onClick={() => {
                    setEditingConfig(JSON.parse(JSON.stringify(config)));
                    setConfigName(config.name);
                    setSelectedTileIndex(null);
                    changeActiveBoardConfig(config.id);
                  }}
                >
                  <div className="config-info">
                    <span className="config-name">{config.name}</span>
                    <span className="config-meta">{config.tiles.length} casas</span>
                  </div>
                  {config.id === activeBoardConfig.id && <Check size={16} color="#10B981" />}
                </div>
              ))}
            </div>

            <div style={{ padding: '1.5rem', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
               <button 
                className="btn-delete-set" 
                onClick={() => {
                  if (editingConfig.id !== 'default') {
                    showSystemPopup({
                      title: 'Excluir Tabuleiro?',
                      message: `Tem certeza que deseja excluir "${editingConfig.name}"? Esta ação não pode ser desfeita.`,
                      type: 'confirm',
                      onConfirm: () => {
                        deleteBoardConfig(editingConfig.id);
                        setEditingConfig(null);
                      }
                    });
                  }
                }}
                disabled={editingConfig.id === 'default'}
                className="btn-delete-board-styled"
                style={{ width: '100%', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem', borderRadius: '10px', background: 'transparent', border: '1px solid #fee2e2', cursor: editingConfig.id === 'default' ? 'not-allowed' : 'pointer' }}
               >
                 <Trash2 size={16} />
                 <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>EXCLUIR TABULEIRO</span>
               </button>
            </div>
          </aside>

          <section className="editor-content">
            <div className="editor-top-grid">
              <div className="editor-left-pane">
                <div className="editor-section">
                  <div className="section-header">
                    <h2>Informações Básicas</h2>
                  </div>
                  <div className="mechanic-card">
                    <h4><Edit3 size={16} /> Nome do Tabuleiro</h4>
                    <input 
                      type="text" 
                      value={configName} 
                      onChange={(e) => setConfigName(e.target.value)}
                      className="tile-label-input"
                      placeholder="Ex: Tabuleiro de Verão"
                      style={{ width: '100%', fontSize: '1.1rem', padding: '0.75rem' }}
                    />
                  </div>
                </div>

                <div className="editor-section">
                  <div className="section-header">
                    <h2>Mecânicas</h2>
                  </div>
                  <div className="mechanics-grid">
                    <div className="mechanic-card">
                      <h4><Clock size={16} /> Turno</h4>
                      <div className="mechanic-input-group">
                        <input 
                          type="number" 
                          value={editingConfig.mechanics.turnTime} 
                          onChange={(e) => handleMechanicChange('turnTime', e.target.value)}
                        />
                        <span>s</span>
                      </div>
                    </div>
                    <div className="mechanic-card">
                      <h4><Dice5 size={16} /> Dado</h4>
                      <div className="mechanic-input-group">
                        <input 
                          type="number" 
                          value={editingConfig.mechanics.diceMin} 
                          onChange={(e) => handleMechanicChange('diceMin', e.target.value)}
                          style={{ width: '50px' }}
                        />
                        <span>-</span>
                        <input 
                          type="number" 
                          value={editingConfig.mechanics.diceMax} 
                          onChange={(e) => handleMechanicChange('diceMax', e.target.value)}
                          style={{ width: '50px' }}
                        />
                      </div>
                    </div>
                    <div className="mechanic-card" style={{ gridColumn: 'span 2' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <ImageIcon size={16} color="#6366f1" />
                          <h4 style={{ margin: 0 }}>Ateliê de Cartas no Início</h4>
                        </div>
                        <label className="switch-premium">
                          <input 
                            type="checkbox" 
                            checked={!!editingConfig.mechanics.enableCardCreationStep} 
                            onChange={(e) => {
                              setEditingConfig({
                                ...editingConfig,
                                mechanics: { ...editingConfig.mechanics, enableCardCreationStep: e.target.checked }
                              });
                            }}
                          />
                          <span className="slider-premium round"></span>
                        </label>
                      </div>
                      <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem' }}>
                        Se habilitado, os jogadores passarão pelo ateliê de criação antes da partida.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="board-preview-container">
                <div className="section-header">
                  <h2>Preview Interativo</h2>
                </div>
                <div className="preview-svg-wrapper">
                  <svg viewBox="0 0 800 800" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <filter id="shadow-preview" x="-10%" y="-10%" width="120%" height="120%">
                        <feDropShadow dx="1" dy="2" stdDeviation="2" floodOpacity="0.1" />
                      </filter>
                      <path id="arc-inner-p" d="M -28 -133 L 28 -133 L 36 -167 L -36 -167 Z" />
                      <path id="arc-middle-p" d="M -34 -208 L 34 -208 L 40 -242 L -40 -242 Z" />
                      <path id="arc-outer-p" d="M -37 -283 L 37 -283 L 43 -317 L -43 -317 Z" />
                    </defs>
                    <g transform="translate(400, 400)">
                      <circle r="115" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1" />
                      <text textAnchor="middle" y="5" fill="#94a3b8" fontSize="12" fontWeight="700">CENTRO</text>
                      
                      {editingConfig.tiles.filter(t => t.ring !== 'special' && t.ring !== 'center').map((tile) => {
                        const actualIdx = editingConfig.tiles.findIndex(t => t.id === tile.id);
                        return (
                          <g 
                            key={tile.id} 
                            transform={`rotate(${tile.angle})`} 
                            className={`preview-tile-group ${selectedTileIndex === actualIdx ? 'selected' : ''}`}
                            onClick={() => setSelectedTileIndex(actualIdx)}
                          >
                            <use 
                              href={`#arc-${tile.ring}-p`} 
                              fill={tile.color} 
                              stroke={tile.color} 
                              strokeWidth="8" 
                              strokeLinejoin="round" 
                              filter="url(#shadow-preview)" 
                            />
                            {tile.label ? (
                              <text 
                                x="0" 
                                y={tile.ring === 'inner' ? -145 : (tile.ring === 'middle' ? -220 : -295)} 
                                textAnchor="middle" 
                                fill="#FFF" 
                                fontSize="8" 
                                fontWeight="bold"
                                style={{ pointerEvents: 'none' }}
                              >
                                {tile.label.substring(0, 5)}
                              </text>
                            ) : (
                              <circle 
                                cx="0" 
                                cy={tile.ring === 'inner' ? -150 : (tile.ring === 'middle' ? -225 : -300)} 
                                r="5" 
                                fill="#FFF" 
                                opacity="0.5" 
                                style={{ pointerEvents: 'none' }} 
                              />
                            )}
                          </g>
                        );
                      })}
                    </g>
                  </svg>
                </div>
                <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '1rem', textAlign: 'center' }}>
                  Clique em uma casa para editar rapidamente
                </p>
              </div>
            </div>

            <div className="editor-section" style={{ marginTop: '2rem' }}>
              <div className="section-header">
                <h2>Lista de Casas</h2>
              </div>
              <div className="tiles-editor-list">
                {editingConfig.tiles.map((tile, idx) => (
                  <div 
                    key={tile.id} 
                    className={`tile-edit-row ${selectedTileIndex === idx ? 'selected-row' : ''}`}
                    onClick={() => setSelectedTileIndex(idx)}
                  >
                    <span className="tile-id-badge">{tile.id}</span>
                    <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{tile.type.toUpperCase()}</span>
                    <span className="tile-label-text" style={{ color: tile.label ? '#1e293b' : '#94a3b8' }}>{tile.label || '(Sem rótulo)'}</span>
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: tile.color, border: '1px solid rgba(0,0,0,0.1)' }} />
                    <Edit3 size={14} color="#64748b" />
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>

        <AnimatePresence>
          {selectedTileIndex !== null && currentTile && (
            <motion.div 
              className="tile-popup-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTileIndex(null)}
            >
              <motion.div 
                className="tile-popup-content"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={e => e.stopPropagation()}
              >
                <div className="popup-header">
                  <h3>Editar Casa {currentTile.id}</h3>
                  <button className="btn-close-popup" onClick={() => setSelectedTileIndex(null)}>
                    <X size={18} />
                  </button>
                </div>

                <div className="popup-body">
                  <div className="popup-field">
                    <label>Rótulo da Casa</label>
                    <input 
                      type="text" 
                      value={currentTile.label} 
                      onChange={(e) => handleTileChange(selectedTileIndex, 'label', e.target.value)}
                      className="tile-label-input"
                      placeholder="Ex: Pule 1 casa"
                      autoFocus
                    />
                  </div>

                  <div className="popup-field">
                    <label>Descrição da Casa</label>
                    <textarea 
                      value={currentTile.description || ''} 
                      onChange={(e) => handleTileChange(selectedTileIndex, 'description', e.target.value)}
                      className="tile-description-input"
                      placeholder="Explique o que acontece nesta casa..."
                      rows={3}
                      style={{ 
                        width: '100%', 
                        padding: '12px', 
                        borderRadius: '12px', 
                        border: '1px solid #e2e8f0',
                        fontSize: '0.9rem',
                        fontFamily: 'inherit',
                        resize: 'vertical'
                      }}
                    />
                  </div>

                  <div className="popup-field">
                    <label>Tipo de Casa</label>
                    <div className="type-grid-quick">
                      {TILE_TYPES.map(type => (
                        <button 
                          key={type.id}
                          className={`type-btn-quick ${currentTile.type === type.id ? 'active' : ''}`}
                          onClick={() => handleTileChange(selectedTileIndex, 'type', type.id)}
                        >
                          <type.icon size={16} />
                          <span>{type.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="popup-field">
                    <label>Ação Especial</label>
                    <div className="action-grid-quick">
                      {TILE_ACTIONS.map(action => (
                        <button 
                          key={action.id || 'none'}
                          className={`action-btn-quick ${currentTile.action === action.id ? 'active' : ''}`}
                          onClick={() => handleTileChange(selectedTileIndex, 'action', action.id)}
                        >
                          <action.icon size={14} />
                          <span>{action.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="popup-field">
                    <label>Cor da Casa</label>
                    <div className="color-grid-quick">
                      {COLORS.map(color => (
                        <div 
                          key={color}
                          className={`color-dot-quick ${currentTile.color === color ? 'active' : ''}`}
                          style={{ background: color }}
                          onClick={() => handleTileChange(selectedTileIndex, 'color', color)}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                  <button className="btn-save-board" onClick={() => setSelectedTileIndex(null)}>
                    <Check size={18} />
                    <span>Concluir</span>
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default BoardEditor;
