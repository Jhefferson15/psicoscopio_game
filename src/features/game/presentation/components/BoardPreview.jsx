import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Maximize, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  User,
  FastForward,
  Undo,
  Users,
  ArrowLeftRight,
  Brain,
  Sparkles,
  Zap,
  Info,
  Book,
  PlusCircle,
  Gift,
  Layers,
  UserX,
  ArrowUpCircle,
  ArrowDownCircle,
  Lightbulb,
  Eye,
  RefreshCw,
  Target,
  Puzzle,
  MessageCircle,
  Sliders,
  Award
} from 'lucide-react';

// =================================================================//
// CONFIGURAÇÕES DE AJUSTE FINO DO TABULEIRO (BASE)                 //
// =================================================================//
const BOARD_LAYOUT = {
  radii: {
    inner: 150,
    middle: 250,
    outer: 350,
    special: 350
  },
  sizes: {
    // Altura aumentada 1.6x (34 * 1.6 = 54) e larguras recalculadas para evitar sobreposição lateral
    inner:  { w: 109, h: 54 }, 
    middle: { w: 112, h: 54 },
    outer:  { w: 102, h: 54 }
  },
  specialSize: 90,
  centerSize: 180
};

const SPECIAL_ICONS = {
  'MOVE_2': FastForward,
  'BACK_2': Undo,
  'TEAM_CHALLENGE': Users,
  'SWAP_PLACE': ArrowLeftRight,
  'WRITE_DIARY': Book,
  'CREATE_CARD': PlusCircle,
  'SHARE_CARD': Gift,
  'DRAW_2': Layers,
  'SKIP_TURN': UserX,
  'MOVE_INNER': ArrowUpCircle,
  'MOVE_OUTER': ArrowDownCircle
};

const TILE_ICONS = {
  brain: Brain,
  reflexao: Brain,
  desafio: Zap,
  memoria: Puzzle,
  especial: Zap,
  bulb: Lightbulb,
  eye: Eye,
  cycle: RefreshCw,
  target: Target,
  puzzle: Puzzle,
  chat: MessageCircle,
  slider: Sliders,
  center: Info,
  experiencia: Award,
  sorte: Sparkles,
  ...SPECIAL_ICONS
};

const BoardPreview = ({
  editingConfig,
  selectedTileIndex,
  setSelectedTileIndex,
  isLarge = false,
  onOpenFullScreen
}) => {
  const [zoom, setZoom] = useState(1);
  const [autoScale, setAutoScale] = useState(true);
  const containerRef = useRef(null);

  // Auto-ajuste de escala baseado no container
  useEffect(() => {
    if (autoScale && containerRef.current) {
      const containerWidth = containerRef.current.clientWidth;
      const boardWidth = 800; // Tamanho base do SVG
      const newScale = (containerWidth / boardWidth) * 0.95;
      setZoom(Math.min(newScale, 1.2));
    }
  }, [autoScale]);

  const handleZoom = (delta) => {
    setAutoScale(false);
    setZoom(prev => Math.min(Math.max(prev + delta, 0.2), 3));
  };

  const getTileLabel = (tile) => {
    if (tile.type === 'especial' && tile.special) {
      return tile.special.symbol;
    }
    return tile.type;
  };

  return (
    <div className={`board-preview-container ${isLarge ? 'large' : ''}`} ref={containerRef}>
      <div className="preview-controls">
        <div className="zoom-controls">
          <button onClick={() => handleZoom(0.1)} title="Aumentar Zoom"><ZoomIn size={16} /></button>
          <button onClick={() => handleZoom(-0.1)} title="Diminuir Zoom"><ZoomOut size={16} /></button>
          <button onClick={() => { setZoom(1); setAutoScale(true); }} title="Resetar Escala"><RotateCcw size={16} /></button>
        </div>
        {onOpenFullScreen && (
          <button className="expand-btn" onClick={onOpenFullScreen} title="Ver em tela cheia">
            <Maximize size={16} />
          </button>
        )}
      </div>

      <div className="board-viewport">
        <motion.div 
          className="board-svg-container"
          style={{ scale: zoom }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        >
          <svg viewBox="0 0 800 800" width="800" height="800">
            {/* Definições de Gradiantes e Filtros */}
            <defs>
              <filter id="tileShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
                <feOffset dx="0" dy="2" result="offsetblur" />
                <feComponentTransfer>
                  <feFuncA type="linear" slope="0.3" />
                </feComponentTransfer>
                <feMerge>
                  <feMergeNode />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Fundo Central */}
            <circle cx="400" cy="400" r={BOARD_LAYOUT.centerSize/2} fill="#1e293b" opacity="0.05" />
            <circle cx="400" cy="400" r={BOARD_LAYOUT.centerSize/2 - 10} fill="none" stroke="#1e293b" strokeWidth="1" strokeDasharray="5,5" opacity="0.2" />

            {/* Linhas de Conexão (Anéis) */}
            <circle cx="400" cy="400" r={BOARD_LAYOUT.radii.inner} fill="none" stroke="#1e293b" strokeWidth="1" opacity="0.1" />
            <circle cx="400" cy="400" r={BOARD_LAYOUT.radii.middle} fill="none" stroke="#1e293b" strokeWidth="1" opacity="0.1" />
            <circle cx="400" cy="400" r={BOARD_LAYOUT.radii.outer} fill="none" stroke="#1e293b" strokeWidth="1" opacity="0.1" />

            {/* Renderização das Casas */}
            {editingConfig.tiles.map((tile, index) => {
              const radius = BOARD_LAYOUT.radii[tile.ring];
              const angle = tile.angle * (Math.PI / 180);
              const x = 400 + radius * Math.cos(angle);
              const y = 400 + radius * Math.sin(angle);
              
              const isSpecial = tile.ring === 'special';
              const size = isSpecial ? BOARD_LAYOUT.specialSize : (BOARD_LAYOUT.sizes[tile.ring] || BOARD_LAYOUT.sizes.outer);
              const isSelected = selectedTileIndex === index;
              const isMoveAction = tile.special?.symbol === 'MOVE_INNER' || tile.special?.symbol === 'MOVE_OUTER';
              
              const Icon = TILE_ICONS[tile.type] || TILE_ICONS[tile.special?.symbol] || Sparkles;

              return (
                <g 
                  key={index} 
                  transform={`translate(${x}, ${y}) rotate(${tile.angle + 90})`}
                  className={`preview-tile ${isSelected ? 'selected' : ''}`}
                  onClick={() => setSelectedTileIndex(index)}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Sombra da Casa */}
                  {isSelected && (
                    <rect 
                      x={isSpecial ? -size/2 - 4 : -size.w/2 - 4}
                      y={isSpecial ? -size/2 - 4 : -size.h/2 - 4}
                      width={isSpecial ? size + 8 : size.w + 8}
                      height={isSpecial ? size + 8 : size.h + 8}
                      rx={isSpecial ? size/2 : 8}
                      fill="#4885CE"
                      opacity="0.3"
                    />
                  )}

                  {/* Fundo da Casa */}
                  <rect 
                    x={isSpecial ? -size/2 : -size.w/2}
                    y={isSpecial ? -size/2 : -size.h/2}
                    width={isSpecial ? size : size.w}
                    height={isSpecial ? size : size.h}
                    rx={isSpecial ? size/2 : 6}
                    fill={tile.color || (isMoveAction ? '#000000' : (isSpecial ? '#1e293b' : '#cbd5e1'))}
                    stroke={isSelected ? '#3b82f6' : (tile.color === '#ffffff' ? '#e2e8f0' : 'none')}
                    strokeWidth={isSelected ? 3 : 1}
                    filter="url(#tileShadow)"
                  />

                  {/* Ícone da Casa */}
                  <g transform={`translate(0, ${isSpecial ? 0 : -8})`}>
                    <Icon 
                      size={isSpecial ? 32 : 20} 
                      color={tile.color === '#ffffff' ? '#1e293b' : '#ffffff'} 
                      strokeWidth={2.5}
                    />
                  </g>

                  {/* Texto da Casa (Apenas normais) */}
                  {!isSpecial && (
                    <text 
                      y="14" 
                      textAnchor="middle" 
                      fontSize="9" 
                      fontWeight="bold"
                      fill={tile.color === '#ffffff' ? '#64748b' : '#ffffff'}
                      style={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}
                    >
                      {getTileLabel(tile)}
                    </text>
                  )}
                  
                  {/* Indicador de Posição Inicial */}
                  {(editingConfig?.mechanics?.initialPositions || []).includes(index) && (
                    <g transform={`translate(${isSpecial ? size/2 - 5 : size.w/2 - 5}, ${isSpecial ? -size/2 + 5 : -size.h/2 + 5})`}>
                      <circle r="8" fill="#10b981" stroke="white" strokeWidth="2" />
                      <User size={10} color="white" style={{ transform: 'translate(-5px, -5px)' }} />
                    </g>
                  )}
                </g>
              );
            })}

            {/* Centro do Tabuleiro */}
            <g transform="translate(400, 400)">
              <circle r={BOARD_LAYOUT.centerSize/2} fill="white" stroke="#e2e8f0" strokeWidth="2" />
              <circle r={BOARD_LAYOUT.centerSize/2 - 8} fill="#f8fafc" stroke="#f1f5f9" strokeWidth="1" />
              <Brain size={48} color="#4885CE" opacity="0.2" style={{ transform: 'translate(-24px, -24px)' }} />
              <text y="10" textAnchor="middle" fontSize="14" fontWeight="900" fill="#1e293b" style={{ letterSpacing: '2px' }}>CENTRO</text>
            </g>
          </svg>
        </motion.div>
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
        }
        .board-preview-container.large {
          height: 100%;
        }
        .preview-controls {
          padding: 15px;
          display: flex;
          justify-content: space-between;
          background: white;
          border-bottom: 1px solid #e2e8f0;
          z-index: 10;
        }
        .zoom-controls {
          display: flex;
          gap: 10px;
        }
        .zoom-controls button, .expand-btn {
          width: 34px;
          height: 34px;
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
        .board-viewport {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          padding: 40px;
          cursor: grab;
        }
        .board-viewport:active { cursor: grabbing; }
        .board-svg-container {
          transform-origin: center;
        }
        .preview-tile:hover rect {
          stroke: #4885CE;
          stroke-width: 2;
        }
      `}</style>
    </div>
  );
};

export default BoardPreview;
