import React, { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue } from 'framer-motion';
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
  HelpCircle,
  Brain,
  Sparkles,
  Zap,
  Info,
  Brush,
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
  Sliders
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
  'MOVE_OUTER': ArrowDownCircle,
  'MOVE_INNER': ArrowUpCircle
};

const TILE_ICONS = {
  brain: Brain,
  reflexao: HelpCircle,
  desafio: Zap,
  memoria: Brain,
  especial: Zap,
  bulb: Lightbulb,
  eye: Eye,
  cycle: RefreshCw,
  target: Target,
  puzzle: Puzzle,
  chat: MessageCircle,
  slider: Sliders,
  center: Info,
  experiencia: Sparkles,
  sorte: Sparkles,
  ...SPECIAL_ICONS
};

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
  const [zoom, setZoom] = useState(1);
  const [autoScale, setAutoScale] = useState(true);
  const containerRef = useRef(null);

  // Simplified Fixed Scaling Logic
  useEffect(() => {
    if (!autoScale || !containerRef.current) return;
    
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        const baseSize = 820;
        const scale = Math.min(width / baseSize, height / baseSize);
        setZoom(scale);
      }
    });
    
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [autoScale]);

  // Use motion values for panning
  const panX = useMotionValue(0);
  const panY = useMotionValue(0);

  if (!editingConfig) return null;

  const handleZoomIn = () => {
    setAutoScale(false);
    setZoom(prev => Math.min(prev + 0.1, 3));
  };
  const handleZoomOut = () => {
    setAutoScale(false);
    setZoom(prev => Math.max(prev - 0.1, 0.2));
  };
  const handleReset = () => {
    setAutoScale(true);
    panX.set(0);
    panY.set(0);
  };

  const boardData = editingConfig.tiles;

  return (
    <div className={`preview-svg-wrapper ${isLarge ? 'large' : ''}`} ref={containerRef} style={{ overflow: 'hidden', position: 'relative', cursor: 'grab' }}>

      <motion.div
        className="board-ring-container"
        drag
        dragConstraints={containerRef}
        style={{
          x: panX,
          y: panY,
          scale: zoom,
          width: 820,
          height: 820,
          position: 'absolute',
          top: '50%',
          left: '50%',
          marginTop: -410,
          marginLeft: -410,
          transformStyle: 'preserve-3d'
        }}
        onDragStart={() => {
          if (containerRef.current) containerRef.current.style.cursor = 'grabbing';
        }}
        onDragEnd={() => {
          if (containerRef.current) containerRef.current.style.cursor = 'grab';
        }}
      >
        {/* Background Decorative Dashed Circles - Centered between the 3 integrated layers */}
        <svg className="board-bg-circles" viewBox="0 0 820 820" style={{ width: '100%', height: '100%' }}>
          {/* Gap 1 */}
          <circle cx="410" cy="410" r="106" fill="none" stroke="#cbd5e1" strokeWidth="5" strokeDasharray="8,10" opacity="0.6" />
          {/* Gap 2 */}
          <circle cx="410" cy="410" r="200" fill="none" stroke="#cbd5e1" strokeWidth="5" strokeDasharray="8,10" opacity="0.6" />
          {/* Gap 3 */}
          <circle cx="410" cy="410" r="291" fill="none" stroke="#cbd5e1" strokeWidth="5" strokeDasharray="8,10" opacity="0.6" />
        </svg>
        {/* Arrivals Center Piece */}
        <div className="center-arrival" style={{ width: BOARD_LAYOUT.centerSize, height: BOARD_LAYOUT.centerSize, pointerEvents: 'none' }}>
          <div className="center-text" style={{ fontSize: '12px' }}>CENTRO</div>
        </div>

        {/* Tiles */}
        {boardData.filter(t => t.ring !== 'center').map((tile) => {
          const actualIdx = boardData.findIndex(t => t.id === tile.id);
          const isSpecial = tile.ring === 'special';
          const isSelected = selectedTileIndex === actualIdx;

          let r;
          let transform;

          if (isSpecial) {
            let tx = 0, ty = 0;
            const radius = BOARD_LAYOUT.radii.special;
            if (tile.id === 's4') ty = -radius;
            else if (tile.id === 's1') tx = radius;
            else if (tile.id === 's2') ty = radius;
            else if (tile.id === 's3') tx = -radius;
            transform = `translate(-50%, -50%) translate(${tx}px, ${ty}px)`;
          } else {
            r = BOARD_LAYOUT.radii[tile.ring];
            transform = `translate(-50%, -50%) rotate(${tile.angle}deg) translateY(-${r}px)`;
          }

          return (
            <div
              key={tile.id}
              className={`${isSpecial ? 'special-card-html' : 'html-tile'} tile-${tile.ring} ${isSelected ? 'selected' : ''}`}
              style={{
                backgroundColor: tile.color,
                transform,
                width: isSpecial ? BOARD_LAYOUT.specialSize : BOARD_LAYOUT.sizes[tile.ring].w,
                height: isSpecial ? BOARD_LAYOUT.specialSize : BOARD_LAYOUT.sizes[tile.ring].h,
                zIndex: isSelected ? 10 : (isSpecial ? 4 : 1)
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (selectedPlayerIdx !== null) {
                  handleInitialPositionChange(selectedPlayerIdx, actualIdx);
                  setSelectedPlayerIdx(null);
                } else {
                  setSelectedTileIndex(actualIdx);
                }
              }}
            >
              <div className={isSpecial ? "special-card-text" : "tile-content"}>
                {isSpecial ? (
                  <>
                    <div className="special-card-icon-container" style={{ transform: 'scale(0.7)' }}>
                      {React.createElement(SPECIAL_ICONS[tile.action] || HelpCircle, { size: 24, strokeWidth: 2.5, color: "#4885CE" })}
                    </div>
                    <span className="special-card-text" style={{ fontSize: '10px', display: 'block', textAlign: 'center' }}>
                      {tile.label}
                    </span>
                  </>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {React.createElement(SPECIAL_ICONS[tile.action] || TILE_ICONS[tile.type.split('_')[1] || tile.type] || (tile.label ? 'span' : 'div'), { 
                      size: tile.ring === 'inner' ? 22 : 26, 
                      strokeWidth: 2.2,
                      style: { opacity: 0.9 },
                    })}
                    {/* Custom Card Indicator - Synchronized with BoardView */}
                    {(tile.isCustom || (tile.type && tile.type.startsWith('custom_'))) && (
                      <div style={{
                        position: 'absolute',
                        bottom: '-4px',
                        right: '-6px',
                        backgroundColor: '#FFF',
                        borderRadius: '50%',
                        padding: '2px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 2,
                        border: '1px solid #EEE'
                      }}>
                        <Brush size={12} color={tile.color} strokeWidth={2.5} />
                      </div>
                    )}
                    {!TILE_ICONS[tile.type] && !tile.label && (
                       <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.5)' }} />
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Initial Positions Visualizer (Non-overlapping) */}
        {editingConfig.mechanics?.initialPositions?.map((pos, playerIdx) => {
          const tile = boardData[pos];
          if (!tile) return null;

          // Non-overlapping logic for preview
          const playersAtSameTile = editingConfig.mechanics.initialPositions
            .map((p, i) => p === pos ? i : -1)
            .filter(i => i !== -1);
          
          const slotIndex = playersAtSameTile.indexOf(playerIdx);
          const totalAtTile = playersAtSameTile.length;
          
          // Calculate offsets (same as BoardView) - Side-by-side with icon
          const slotOffset = totalAtTile > 1 ? (slotIndex - (totalAtTile - 1) / 2) * 18 + 12 : 18;
          const radialOffset = 0;

          let r;
          switch (tile.ring) {
            case 'inner': r = BOARD_LAYOUT.radii.inner; break;
            case 'middle': r = BOARD_LAYOUT.radii.middle; break;
            case 'outer': r = BOARD_LAYOUT.radii.outer; break;
            case 'special': r = BOARD_LAYOUT.radii.special; break;
            default: r = 0;
          }

          const playerColors = ['#D84B42', '#4885CE', '#7B4BB1', '#F59E0B'];

          return (
            <div
              key={playerIdx}
              className="player-marker-html"
              style={{
                width: 20,
                height: 20,
                backgroundColor: playerColors[playerIdx],
                transform: `translate(-50%, -50%) rotate(${tile.angle}deg) translateY(-${r - radialOffset}px) translateX(${slotOffset}px)`,
                border: '2px solid white',
                zIndex: 100 + playerIdx,
                pointerEvents: 'none',
                transition: 'all 0.3s ease'
              }}
            >
              <User size={10} />
            </div>
          );
        })}
      </motion.div>

      <div className="zoom-controls">
        <button className="btn-zoom" onClick={handleZoomIn} title="Aumentar Zoom">
          <ZoomIn size={20} />
        </button>
        <button className="btn-zoom" onClick={handleReset} title="Resetar Visualização">
          <RotateCcw size={16} />
        </button>
        <div className="zoom-level">{Math.round(zoom * 100)}%</div>
        <button className="btn-zoom" onClick={handleZoomOut} title="Diminuir Zoom">
          <ZoomOut size={20} />
        </button>
      </div>

      {!isLarge && onOpenFullScreen && (
        <button
          className="btn-open-fullscreen"
          onClick={(e) => {
            e.stopPropagation();
            onOpenFullScreen();
          }}
          title="Ver em Tela Cheia"
        >
          <Maximize size={16} />
        </button>
      )}
    </div>
  );
};

export default BoardPreview;
