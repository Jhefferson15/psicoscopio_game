import { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue } from 'framer-motion';
import { 
  Maximize, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw,
  Move
} from 'lucide-react';
import BoardView from './BoardView';

const BoardPreview = ({
  editingConfig,
  selectedTileIndex,
  setSelectedTileIndex,
  selectedPlayerIdx,
  setSelectedPlayerIdx,
  handleInitialPositionChange,
  isLarge = false,
  onOpenFullScreen
}) => {
  const [zoom, setZoom] = useState(0.5);
  const [autoScale, setAutoScale] = useState(true);
  const [localRotation, setLocalRotation] = useState(0);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const containerRef = useRef(null);

  // Auto-ajuste de escala baseado no container (apenas inicial ou reset)
  useEffect(() => {
    if (autoScale && containerRef.current) {
      const containerWidth = containerRef.current.clientWidth;
      const boardWidth = 820; // Tamanho base do BoardView
      const newScale = (containerWidth / boardWidth) * 0.8;
      setZoom(Math.min(newScale, 1));
      x.set(0);
      y.set(0);
    }
  }, [autoScale, editingConfig.id, x, y]);

  const handleZoom = (delta) => {
    setAutoScale(false);
    setZoom(prev => Math.min(Math.max(prev + delta, 0.1), 3));
  };

  const handleReset = () => {
    setAutoScale(true);
    setLocalRotation(0);
  };

  // Funções de apoio para evitar conflito entre drag e click
  const dragStartTime = useRef(0);
  
  const handleInternalTileClick = (tile, index, e) => {
    // Se o clique durou mais de 200ms, provavelmente foi um drag
    if (Date.now() - dragStartTime.current > 200) return;
    
    e.stopPropagation();
    if (selectedPlayerIdx !== null) {
      handleInitialPositionChange(selectedPlayerIdx, index);
      setSelectedPlayerIdx(null);
    } else {
      setSelectedTileIndex(index);
    }
  };

  return (
    <div className={`board-preview-container ${isLarge ? 'large' : ''}`} ref={containerRef}>
      <div className="preview-controls">
        <div className="zoom-controls">
          <button onClick={() => handleZoom(0.1)} title="Aumentar Zoom"><ZoomIn size={16} /></button>
          <button onClick={() => handleZoom(-0.1)} title="Diminuir Zoom"><ZoomOut size={16} /></button>
          <button onClick={handleReset} title="Resetar Visualização"><RotateCcw size={16} /></button>
        </div>

        {selectedPlayerIdx !== null && (
          <div className="preview-info-badge">
            <span className="selection-tip" style={{ color: '#10b981', fontWeight: 600 }}>Definindo P{selectedPlayerIdx + 1}</span>
          </div>
        )}

        {onOpenFullScreen && (
          <button className="expand-btn" onClick={onOpenFullScreen} title="Ver em tela cheia">
            <Maximize size={16} />
          </button>
        )}
      </div>

      <div className="board-viewport">
        <div className="viewport-grid-bg" />
        <div className="preview-svg-holder">
            <motion.div 
            className="draggable-board-wrapper"
            drag
            dragMomentum={false}
            dragElastic={0}
            onPointerDown={() => dragStartTime.current = Date.now()}
            style={{ x, y, scale: zoom }}
          >
            <BoardView 
              activeBoardConfig={editingConfig}
              isReadOnly={true}
              isMiniature={false}
              boardRotation={localRotation}
              onRotationChange={setLocalRotation}
              selectedTileIndex={selectedTileIndex}
              onTileClick={handleInternalTileClick}
              showInitialPositions={true}
              players={[]} 
            />
          </motion.div>
        </div>
        
        <div className="pan-hint">
          <Move size={12} />
          <span>Arraste para navegar</span>
        </div>
      </div>

      <style>{`
        .board-preview-container {
          width: 100%;
          background: #f8fafc;
          border-radius: 20px;
          border: 1px solid #e2e8f0;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          position: relative;
          box-shadow: inset 0 2px 10px rgba(0,0,0,0.05);
          min-height: 400px;
        }
        .board-preview-container.large {
          height: 100%;
          min-height: 600px;
        }
        .preview-controls {
          padding: 10px 15px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: white;
          border-bottom: 1px solid #e2e8f0;
          z-index: 10;
        }
        .zoom-controls {
          display: flex;
          gap: 6px;
        }
        .zoom-controls button, .expand-btn {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #64748b;
          transition: all 0.2s;
        }
        .zoom-controls button:hover, .expand-btn:hover {
          background: #f1f5f9;
          color: #4885CE;
          border-color: #4885CE;
        }
        .preview-info-badge {
          background: #f0fdf4;
          padding: 4px 12px;
          border-radius: 20px;
          border: 1px solid #bbf7d0;
        }
        .selection-tip {
          font-size: 0.7rem;
          color: #16a34a;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .board-viewport {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          position: relative;
          background: #f1f5f9;
        }
        .viewport-grid-bg {
          position: absolute;
          inset: 0;
          background-image: radial-gradient(#cbd5e1 1px, transparent 1px);
          background-size: 20px 20px;
          opacity: 0.5;
        }
        .preview-svg-holder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: grab;
          touch-action: none;
        }
        .preview-svg-holder:active {
          cursor: grabbing;
        }
        .draggable-board-wrapper {
          width: 820px;
          height: 820px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          will-change: transform;
        }
        
        .pan-hint {
          position: absolute;
          bottom: 12px;
          right: 12px;
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(4px);
          padding: 4px 10px;
          border-radius: 20px;
          border: 1px solid #e2e8f0;
          font-size: 0.65rem;
          color: #94a3b8;
          font-weight: 600;
          text-transform: uppercase;
          pointer-events: none;
        }

        /* Ajustes para o BoardView dentro do preview */
        .draggable-board-wrapper .board-wrapper-html {
          width: 820px;
          height: 820px;
          background: transparent;
          border: none;
          box-shadow: none;
        }
      `}</style>
    </div>
  );
};

export default BoardPreview;
