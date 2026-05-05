import { motion } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { STANDARD_TILE_CONFIG } from '../../domain/gameConstants';

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
  );
};

export default TileEditorPopup;
