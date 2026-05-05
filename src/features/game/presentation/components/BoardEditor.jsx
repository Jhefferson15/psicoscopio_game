import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  Save, 
  Download, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  Sparkles, 
  Brain, 
  Zap, 
  MessageSquare, 
  Users, 
  Clock, 
  History, 
  RotateCcw,
  Upload,
  Settings,
  BookOpen,
  Image as ImageIcon
} from 'lucide-react';
import { useGame } from '../state/useGame';
import { useBoardEditor } from '../hooks/useBoardEditor';
import { STANDARD_TILE_CONFIG } from '../../domain/gameConstants';
import BoardPreview from './BoardPreview';
import TileEditorPopup from './TileEditorPopup';
import './BoardEditorLayout.css';
import './BoardEditorSidebar.css';
import './BoardEditorContent.css';
import './BoardEditorPreview.css';
import './BoardEditorResponsive.css';

const COLORS = [
  '#4885CE', '#6FB05E', '#D84B42', '#7B4BB1', '#F4C746', 
  '#1e293b', '#F43F5E', '#EC4899', '#D946EF', '#8B5CF6', 
  '#6366F1', '#3B82F6', '#0EA5E9', '#06B6D4', '#14B8A6', 
  '#84CC16', '#EAB308', '#F97316'
];

const TILE_TYPES = [
  { id: 'memoria', label: 'Memória', color: STANDARD_TILE_CONFIG.memoria.color, icon: Brain },
  { id: 'reflexao', label: 'Reflexão', color: STANDARD_TILE_CONFIG.reflexao.color, icon: Brain },
  { id: 'desafio', label: 'Desafio', color: STANDARD_TILE_CONFIG.desafio.color, icon: Zap },
  { id: 'experiencia', label: 'Experiência', color: STANDARD_TILE_CONFIG.experiencia.color, icon: Sparkles },
  { id: 'sorte', label: 'Sorte', color: STANDARD_TILE_CONFIG.sorte.color, icon: Sparkles },
  { id: 'custom_memoria', label: 'Custom Mem', color: STANDARD_TILE_CONFIG.memoria.color, icon: Brain },
  { id: 'custom_reflexao', label: 'Custom Refl', color: STANDARD_TILE_CONFIG.reflexao.color, icon: Brain },
  { id: 'custom_desafio', label: 'Custom Des', color: STANDARD_TILE_CONFIG.desafio.color, icon: Zap },
  { id: 'custom_experiencia', label: 'Custom Exp', color: STANDARD_TILE_CONFIG.experiencia.color, icon: Sparkles },
  { id: 'custom_sorte', label: 'Custom Sorte', color: STANDARD_TILE_CONFIG.sorte.color, icon: Sparkles },
  { id: 'custom_card', label: 'Custom Geral', color: '#F4C746', icon: Sparkles },
  { id: 'especial', label: 'Especial', color: '#FFFFFF', icon: Settings }
];

const TILE_ACTIONS = [
  { id: null, label: 'Nenhuma', icon: X, color: '#FFFFFF' },
  { id: 'MOVE_2', label: 'Avançar 2', icon: Zap, color: '#10B981' },
  { id: 'BACK_2', label: 'Voltar 2', icon: RotateCcw, color: '#EF4444' },
  { id: 'MOVE_INNER', label: 'Ir p/ Centro', icon: ChevronLeft, color: '#6366F1' },
  { id: 'MOVE_OUTER', label: 'Ir p/ Borda', icon: ChevronLeft, color: '#F59E0B' },
  { id: 'DRAW_2', label: 'Comprar 2', icon: Plus, color: '#8B5CF6' },
  { id: 'SWAP_PLACE', label: 'Trocar de Lugar', icon: Users, color: '#F43F5E' }
];

const BoardEditor = () => {
  const { 
    activeBoardConfig, 
    availableBoardConfigs, 
    deleteBoardConfig, 
    showSystemPopup, 
    handleGoToMenu,
    changeActiveBoardConfig,
    saveNewBoardConfig,
    updateBoardConfig,
    importBoardConfig
  } = useGame();

  const {
    editingConfig,
    setEditingConfig,
    configName,
    setConfigName,
    handleSave,
    handleExport,
    handleImport,
    handleMechanicChange,
    handleCenterTextChange,
    handleInitialPositionChange,
    handleTileChange,
    handleRandomize,
    startNewBoard,
    selectConfig,
    selectedTileIndex,
    setSelectedTileIndex,
    selectedPlayerIdx,
    setSelectedPlayerIdx
  } = useBoardEditor({
    activeBoardConfig,
    availableBoardConfigs,
    showSystemPopup,
    changeActiveBoardConfig,
    saveNewBoardConfig,
    updateBoardConfig,
    importBoardConfig,
    TILE_TYPES,
    TILE_ACTIONS,
    COLORS
  });

  const [isPreviewExpanded, setIsPreviewExpanded] = useState(false);
  const [showCollectionsMobile, setShowCollectionsMobile] = useState(false);
  const [isFullScreenPreviewOpen, setIsFullScreenPreviewOpen] = useState(false);

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
            <h1>Editor de Tabuleiro</h1>
            <p>Visualize e edite clicando no tabuleiro</p>
          </div>
          <div className="header-actions">
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
          <aside className={`editor-sidebar ${showCollectionsMobile ? 'mobile-open' : ''}`}>
            <div className="sidebar-section">
              <div className="sidebar-header-mobile" onClick={() => setShowCollectionsMobile(!showCollectionsMobile)}>
                <h3>COLEÇÕES</h3>
                <div className="active-collection-badge">
                  <span>{editingConfig.name}</span>
                  <ChevronLeft size={16} style={{ transform: showCollectionsMobile ? 'rotate(-90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                </div>
              </div>

              <div className="sidebar-actions">
                <button className="btn-add-set" onClick={startNewBoard}>
                  <Plus size={16} />
                  <span>CRIAR NOVO</span>
                </button>
                <label className="btn-add-set import-btn">
                  <Upload size={16} />
                  <span>IMPORTAR</span>
                  <input type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
                </label>
              </div>

              <button className="btn-randomize-premium" onClick={handleRandomize}>
                <Sparkles size={16} />
                <span>GERAR ALEATÓRIO</span>
              </button>
            </div>
            
            <div className="config-list-container">
              <div className="config-list">
                {availableBoardConfigs.map(config => (
                  <div 
                    key={config.id} 
                    className={`config-item ${editingConfig.id === config.id ? 'active' : ''}`}
                    onClick={() => {
                      selectConfig(config);
                      setShowCollectionsMobile(false);
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
            </div>

            <div className="sidebar-footer">
               <button 
                className="btn-delete-board-styled" 
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
               >
                 <Trash2 size={16} />
                 <span>EXCLUIR TABULEIRO</span>
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
                      <h4><Clock size={16} /> Tempo de Turno</h4>
                      <div className="mechanic-input-group">
                        <input 
                          type="number" 
                          value={editingConfig.mechanics.turnTime || 120} 
                          onChange={(e) => handleMechanicChange('turnTime', e.target.value)}
                        />
                        <span style={{ fontSize: '0.7rem' }}>seg</span>
                      </div>
                    </div>

                    <div className="mechanic-card">
                      <h4><RotateCcw size={16} /> Intervalo Dado</h4>
                      <div className="mechanic-input-group dice-range">
                        <input 
                          type="number" 
                          value={editingConfig.mechanics.diceMin || 1} 
                          onChange={(e) => handleMechanicChange('diceMin', e.target.value)}
                          placeholder="Min"
                        />
                        <span>-</span>
                        <input 
                          type="number" 
                          value={editingConfig.mechanics.diceMax || 6} 
                          onChange={(e) => handleMechanicChange('diceMax', e.target.value)}
                          placeholder="Max"
                        />
                      </div>
                    </div>

                    <div className="mechanic-card">
                      <h4><History size={16} /> Turnos Máx</h4>
                      <div className="mechanic-input-group">
                        <input 
                          type="number" 
                          value={editingConfig.mechanics.maxTurns || 0} 
                          onChange={(e) => handleMechanicChange('maxTurns', e.target.value)}
                        />
                        <span style={{ fontSize: '0.7rem' }}>(0=inf)</span>
                      </div>
                    </div>

                    <div className="mechanic-card span-2">
                      <h4><MessageSquare size={16} /> Texto do Centro</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                        {(editingConfig.mechanics.centerText || ["", "", "", ""]).map((line, i) => (
                          <input 
                            key={i}
                            type="text"
                            value={line}
                            onChange={(e) => handleCenterTextChange(i, e.target.value)}
                            placeholder={`Linha ${i + 1}`}
                            style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="mechanic-card span-2">
                      <h4><Users size={16} /> Posições Iniciais</h4>
                      <p className="mechanic-hint">Clique em um jogador abaixo e depois em uma casa no tabuleiro.</p>
                      <div className="initial-positions-grid">
                        {[0, 1, 2, 3].map((playerIdx) => (
                          <button 
                            key={playerIdx} 
                            className={`pos-setup-btn ${selectedPlayerIdx === playerIdx ? 'active' : ''}`}
                            onClick={() => setSelectedPlayerIdx(selectedPlayerIdx === playerIdx ? null : playerIdx)}
                          >
                            <div className="player-dot-icon" style={{ background: ['#D84B42', '#4885CE', '#7B4BB1', '#F59E0B'][playerIdx] }} />
                            <div className="pos-btn-info">
                              <span className="p-label">P{playerIdx + 1}</span>
                              <span className="p-idx">idx: {editingConfig.mechanics.initialPositions?.[playerIdx] || 0}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="mechanic-card span-2">
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
                    </div>

                    <div className="mechanic-card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <BookOpen size={16} color="#7B4BB1" />
                          <h4 style={{ margin: 0 }}>Rótulos Tabuleiro</h4>
                        </div>
                        <label className="switch-premium">
                          <input 
                            type="checkbox" 
                            checked={!!editingConfig.mechanics.showBoardLabels} 
                            onChange={(e) => {
                              setEditingConfig({
                                ...editingConfig,
                                mechanics: { ...editingConfig.mechanics, showBoardLabels: e.target.checked }
                              });
                            }}
                          />
                          <span className="slider-premium round"></span>
                        </label>
                      </div>
                    </div>

                    <div className="mechanic-card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Sparkles size={16} color="#6FB05E" />
                          <h4 style={{ margin: 0 }}>Rótulos Cartas</h4>
                        </div>
                        <label className="switch-premium">
                          <input 
                            type="checkbox" 
                            checked={!!editingConfig.mechanics.showCardLabels} 
                            onChange={(e) => {
                              setEditingConfig({
                                ...editingConfig,
                                mechanics: { ...editingConfig.mechanics, showCardLabels: e.target.checked }
                              });
                            }}
                          />
                          <span className="slider-premium round"></span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className={`board-preview-container ${isPreviewExpanded ? 'expanded' : 'collapsed'}`}>
                <div className="section-header" onClick={() => setIsPreviewExpanded(!isPreviewExpanded)}>
                  <h2>Preview Interativo</h2>
                  <button className="btn-toggle-preview-mobile">
                    {isPreviewExpanded ? 'Recolher' : 'Ver Tabuleiro'}
                  </button>
                </div>
                <BoardPreview 
                  editingConfig={editingConfig}
                  selectedTileIndex={selectedTileIndex}
                  setSelectedTileIndex={setSelectedTileIndex}
                  selectedPlayerIdx={selectedPlayerIdx}
                  setSelectedPlayerIdx={setSelectedPlayerIdx}
                  handleInitialPositionChange={handleInitialPositionChange}
                  onOpenFullScreen={() => setIsFullScreenPreviewOpen(true)}
                />
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
                    <span className="tile-type-badge" style={{ fontWeight: 600, fontSize: '0.85rem' }}>{tile.type.toUpperCase()}</span>
                    <span className="tile-label-text" style={{ color: tile.label ? '#1e293b' : '#94a3b8' }}>{tile.label || '(Sem rótulo)'}</span>
                    <div className="tile-color-dot" style={{ width: '20px', height: '20px', borderRadius: '50%', background: tile.color, border: '1px solid rgba(0,0,0,0.1)' }} />
                    <Edit3 className="tile-edit-icon" size={14} color="#64748b" />
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>
      </motion.div>

      <AnimatePresence>
        <TileEditorPopup 
          selectedTileIndex={selectedTileIndex}
          currentTile={currentTile}
          setSelectedTileIndex={setSelectedTileIndex}
          handleTileChange={handleTileChange}
          TILE_TYPES={TILE_TYPES}
          TILE_ACTIONS={TILE_ACTIONS}
          COLORS={COLORS}
          setEditingConfig={setEditingConfig}
        />
      </AnimatePresence>

      <AnimatePresence>
        {isFullScreenPreviewOpen && (
          <motion.div 
            className="fullscreen-preview-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsFullScreenPreviewOpen(false)}
          >
            <motion.div 
              className="fullscreen-preview-content"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="fullscreen-header">
                <h3>Preview Expandido</h3>
                <button className="btn-close-fullscreen" onClick={() => setIsFullScreenPreviewOpen(false)}>
                  <X size={24} />
                </button>
              </div>
              <div className="fullscreen-body">
                <BoardPreview 
                  editingConfig={editingConfig}
                  selectedTileIndex={selectedTileIndex}
                  setSelectedTileIndex={setSelectedTileIndex}
                  selectedPlayerIdx={selectedPlayerIdx}
                  setSelectedPlayerIdx={setSelectedPlayerIdx}
                  handleInitialPositionChange={handleInitialPositionChange}
                  isLarge={true}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BoardEditor;
