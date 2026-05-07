import { motion } from 'framer-motion';
import { X, Check, Lock } from 'lucide-react';
import { STANDARD_TILE_CONFIG, ACTION_METADATA } from '../../domain/gameConstants';
import { getTileDefaults } from '../../data/repositories/boardRepository';

const TileEditorPopup = ({
  selectedTileIndex,
  currentTile,
  setSelectedTileIndex,
  handleTileChange,
  TILE_TYPES,
  TILE_ACTIONS,
  COLORS,
  setEditingConfig
}) => {
  if (selectedTileIndex === null || !currentTile) return null;

  const isStandardType = !!STANDARD_TILE_CONFIG[currentTile.type];
  const isStandardAction = currentTile.action && !!ACTION_METADATA[currentTile.action];
  const isFixed = isStandardType || isStandardAction;

  return (
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h3>Editar Casa #{selectedTileIndex + 1}</h3>
            {isFixed && <Lock size={14} color="#64748b" title="Esta casa segue regras fixas" />}
          </div>
          <button className="btn-close-popup" onClick={() => setSelectedTileIndex(null)}>
            <X size={20} />
          </button>
        </div>

        <div className="popup-body">
          <div className="popup-field">
            <label style={{ display: 'flex', justifyContent: 'space-between' }}>
              Rótulo da Casa
              {isFixed && <span style={{ fontSize: '0.65rem', color: '#64748b' }}>FIXO PELO TIPO</span>}
            </label>
            <textarea 
              value={currentTile.label || ''} 
              onChange={(e) => handleTileChange(selectedTileIndex, 'label', e.target.value)}
              className="tile-label-input"
              placeholder="Ex: Ponto de Partida"
              rows={2}
              disabled={isFixed}
            />
          </div>

          <div className="popup-field">
            <label style={{ display: 'flex', justifyContent: 'space-between' }}>
              Descrição da Casa
              {isFixed && <span style={{ fontSize: '0.65rem', color: '#64748b' }}>FIXO PELO TIPO</span>}
            </label>
            <textarea 
              value={currentTile.description || ''} 
              onChange={(e) => handleTileChange(selectedTileIndex, 'description', e.target.value)}
              className="tile-description-input"
              placeholder="Explique o que acontece nesta casa..."
              rows={3}
              disabled={isFixed}
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
                    const defaults = getTileDefaults(type.id, currentTile.action);
                    setEditingConfig(prev => {
                      const newTiles = [...prev.tiles];
                      newTiles[selectedTileIndex] = {
                        ...newTiles[selectedTileIndex],
                        type: type.id,
                        ...defaults
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
                    const defaults = getTileDefaults(currentTile.type, action.id);
                    setEditingConfig(prev => {
                      const newTiles = [...prev.tiles];
                      newTiles[selectedTileIndex] = {
                        ...newTiles[selectedTileIndex],
                        action: action.id,
                        ...defaults
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

          {!isFixed && (
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
  );
};

export default TileEditorPopup;
