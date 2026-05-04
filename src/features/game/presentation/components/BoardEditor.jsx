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
  { id: 'DRAW_2', label: 'Comprar 2', icon: Plus, color: '#8B5CF6' }
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

              <button 
                className="btn-randomize-premium" 
                onClick={handleRandomize} 
              >
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
                      <p className="mechanic-hint">
                        Clique em um jogador abaixo e depois em uma casa no tabuleiro.
                      </p>
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
                      <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem' }}>
                        Se habilitado, os jogadores passarão pelo ateliê de criação antes da partida.
                      </p>
                    </div>

                    <div className="mechanic-card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <BookOpen size={16} color="#7B4BB1" />
                          <h4 style={{ margin: 0 }}>Informações no Tabuleiro</h4>
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
                      <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem' }}>
                        Mostra ou oculta os nomes das casas no tabuleiro.
                      </p>
                    </div>

                    <div className="mechanic-card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Sparkles size={16} color="#6FB05E" />
                          <h4 style={{ margin: 0 }}>Informações nas Cartas</h4>
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
                      <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem' }}>
                        Mostra ou oculta o tipo e o número da carta.
                      </p>
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
                <div className="preview-svg-wrapper">
                  <svg viewBox="0 0 800 800" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <filter id="shadow-preview" x="-10%" y="-10%" width="120%" height="120%">
                        <feDropShadow dx="1" dy="2" stdDeviation="2" floodOpacity="0.1" />
                      </filter>
                      <path id="arc-inner-p" d="M -28 -133 L 28 -133 L 36 -167 L -36 -167 Z" />
                      <path id="arc-middle-p" d="M -34 -208 L 34 -208 L 40 -242 L -40 -242 Z" />
                      <path id="arc-outer-p" d="M -37 -283 L 37 -283 L 43 -317 L -43 -317 Z" />
                      <rect id="arc-special-p" x="-50" y="-15" width="100" height="30" rx="4" />
                      <g id="arrow-inner-p">
                        <line x1="0" y1="-8" x2="0" y2="8" stroke="#FFF" strokeWidth="2.5" strokeLinecap="round" />
                        <path d="M -5 3 L 0 8 L 5 3" fill="none" stroke="#FFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </g>
                      <g id="arrow-outer-p">
                        <line x1="0" y1="8" x2="0" y2="-8" stroke="#FFF" strokeWidth="2.5" strokeLinecap="round" />
                        <path d="M -5 -3 L 0 -8 L 5 -3" fill="none" stroke="#FFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </g>
                    </defs>
                    <g transform="translate(400, 400)">
                      <circle r="115" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1" />
                      <text textAnchor="middle" y="5" fill="#94a3b8" fontSize="12" fontWeight="700">CENTRO</text>
                      {editingConfig.tiles.filter(t => t.ring !== 'center').map((tile) => {
                        const actualIdx = editingConfig.tiles.findIndex(t => t.id === tile.id);
                        const isSpecial = tile.ring === 'special';
                        
                        let transform = `rotate(${tile.angle})`;
                        if (isSpecial) {
                           let tx = 0, ty = 0;
                           if (tile.id === 's4') ty = -305;
                           if (tile.id === 's1') tx = 310;
                           if (tile.id === 's2') ty = 320;
                           if (tile.id === 's3') tx = -310;
                           transform = `translate(${tx}, ${ty})`;
                        }

                        return (
                          <g 
                            key={tile.id} 
                            transform={transform} 
                            className={`preview-tile-group ${selectedTileIndex === actualIdx ? 'selected' : ''} ${isSpecial ? 'special-preview' : ''}`}
                            onClick={() => {
                              if (selectedPlayerIdx !== null) {
                                handleInitialPositionChange(selectedPlayerIdx, actualIdx);
                                setSelectedPlayerIdx(null);
                              } else {
                                setSelectedTileIndex(actualIdx);
                              }
                            }}
                          >
                            <use 
                              href={`#arc-${tile.ring}-p`} 
                              fill={tile.color} 
                              stroke={selectedTileIndex === actualIdx ? '#6366f1' : tile.color} 
                              strokeWidth={isSpecial ? "2" : "8"} 
                              strokeLinejoin="round" 
                              filter="url(#shadow-preview)" 
                            />
                            {tile.label ? (
                              <g transform={isSpecial ? "translate(0, 0)" : ""}>
                                {tile.label.split('\n').map((line, i, arr) => (
                                  <text 
                                    key={i}
                                    x="0" 
                                    y={isSpecial ? (-(arr.length-1)*5 + i*10) : (tile.ring === 'inner' ? -145 : (tile.ring === 'middle' ? -220 : -295)) + (i*8)} 
                                    textAnchor="middle" 
                                    fill={isSpecial ? "#333" : "#FFF"} 
                                    fontSize={isSpecial ? "10" : "8"} 
                                    fontWeight="bold"
                                    style={{ pointerEvents: 'none' }}
                                  >
                                    {line.substring(0, 15)}
                                  </text>
                                ))}
                              </g>
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
                            {tile.action === 'MOVE_INNER' && (
                              <use 
                                href="#arrow-inner-p" 
                                transform={`translate(18, ${tile.ring === 'inner' ? -150 : (tile.ring === 'middle' ? -225 : -300)})`} 
                                style={{ pointerEvents: 'none' }} 
                              />
                            )}
                            {tile.action === 'MOVE_OUTER' && (
                              <use 
                                href="#arrow-outer-p" 
                                transform={`translate(18, ${tile.ring === 'inner' ? -150 : (tile.ring === 'middle' ? -225 : -300)})`} 
                                style={{ pointerEvents: 'none' }} 
                              />
                            )}
                          </g>
                        );
                      })}
                    </g>
                  </svg>
                </div>
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
        {selectedTileIndex !== null && currentTile && (
          <motion.div 
            className="tile-popup-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedTileIndex(null)}
          >
            <motion.div 
              className="tile-popup-content glass-light"
              initial={{ scale: 0.9, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 50, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="popup-header">
                <h3>Editar Casa #{selectedTileIndex + 1}</h3>
                <button className="btn-close-popup" onClick={() => setSelectedTileIndex(null)}>
                  <X size={20} />
                </button>
              </div>

              <div className="popup-body">
                <div className="popup-field">
                  <label>Rótulo da Casa</label>
                  <textarea 
                    value={currentTile.label || ''} 
                    onChange={(e) => handleTileChange(selectedTileIndex, 'label', e.target.value)}
                    className="tile-label-input"
                    placeholder="Ex: Ponto de Partida"
                    rows={2}
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
                  />
                </div>

                <div className="popup-field">
                  <label>Tipo de Casa</label>
                  <div className="type-grid-quick">
                    {TILE_TYPES.map(type => (
                      <button 
                        key={type.id}
                        className={`type-btn-quick ${currentTile.type === type.id ? 'active' : ''}`}
                        style={{ '--cat-color': type.color }}
                        onClick={() => {
                          const tileConfig = STANDARD_TILE_CONFIG[type.id];
                          setEditingConfig(prev => {
                            const newTiles = [...prev.tiles];
                            newTiles[selectedTileIndex] = {
                              ...newTiles[selectedTileIndex],
                              type: type.id,
                              ...(tileConfig ? {
                                color: tileConfig.color,
                                label: tileConfig.label
                              } : {})
                            };
                            return { ...prev, tiles: newTiles };
                          });
                        }}
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
                        onClick={() => {
                          setEditingConfig(prev => {
                            const newTiles = [...prev.tiles];
                            const isStandard = !!STANDARD_TILE_CONFIG[newTiles[selectedTileIndex].type];
                            newTiles[selectedTileIndex] = {
                              ...newTiles[selectedTileIndex],
                              action: action.id,
                              ...(action.id && action.color && !isStandard ? { color: action.color } : {})
                            };
                            return { ...prev, tiles: newTiles };
                          });
                        }}
                      >
                        <action.icon size={14} />
                        <span>{action.label}</span>
                      </button>
                    ))}
                  </div>
                </div>


                {!STANDARD_TILE_CONFIG[currentTile.type] && (
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
                )}
              </div>

              <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn-save-board" onClick={() => setSelectedTileIndex(null)}>
                  <Check size={18} />
                  <span>Concluir</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BoardEditor;
