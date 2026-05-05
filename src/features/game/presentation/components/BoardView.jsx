import { motion, useMotionValue, useSpring, useTransform, AnimatePresence, animate } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import { useGame } from '../state/useGame';
import { 
  Brain, 
  Sparkles, 
  Zap, 
  Info,
  User,
  RotateCcw, 
  FastForward,
  Undo,
  Users,
  ArrowLeftRight,
  HelpCircle,
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
import './BoardView.css';

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
  custom_memoria: Brain,
  custom_reflexao: HelpCircle,
  custom_desafio: Zap,
  custom_experiencia: Sparkles,
  custom_sorte: Sparkles,
  custom_card: Sparkles,
  ...SPECIAL_ICONS
};

// =================================================================//
// CONFIGURAÇÕES DE AJUSTE FINO DO TABULEIRO (FIXO)                 //
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

/**
 * PlayerMarker component handles the positioning of individual players
 * based on the board rotation and their current tile position.
 */
const PlayerMarker = ({ player, angle, r, boardRotation, isReadOnly, showName, onClick, slotOffset = 0, radialOffset = 0 }) => {
  // Use a motion value for the angle to handle smooth transitions and wrap-around
  const visualAngle = useMotionValue(angle);
  
  // Update visualAngle whenever the target angle changes, handling shortest-path wrap-around
  useEffect(() => {
    const current = visualAngle.get();
    let diff = angle - current;
    
    // Normalize difference to shortest path (-180 to 180 degrees)
    // This prevents the "huge jump backwards" when crossing 0/360 boundary
    while (diff > 180) diff -= 360;
    while (diff < -180) diff += 360;
    
    const controls = animate(visualAngle, current + diff, {
      type: "spring",
      stiffness: 80,
      damping: 20,
      restDelta: 0.01
    });
    
    return () => controls.stop();
  }, [angle, visualAngle]);

  // Synchronize with board rotation using motion transforms
  // rotateVal now uses the animated visualAngle instead of the static angle prop
  const rotateVal = useTransform([boardRotation, visualAngle], ([br, va]) => br + va);
  
  // Calculate base X and Y
  const baseX = useTransform(rotateVal, (a) => Math.sin(a * Math.PI / 180) * r);
  const baseY = useTransform(rotateVal, (a) => -Math.cos(a * Math.PI / 180) * r);

  // Apply slot offset (lateral) and radial offset (towards beginning/inner)
  const x = useTransform([baseX, rotateVal], ([bx, a]) => {
    const rad = a * Math.PI / 180;
    const lateralX = Math.cos(rad) * slotOffset;
    const radialX = -Math.sin(rad) * radialOffset;
    return bx + lateralX + radialX;
  });
  
  const y = useTransform([baseY, rotateVal], ([by, a]) => {
    const rad = a * Math.PI / 180;
    const lateralY = Math.sin(rad) * slotOffset;
    const radialY = Math.cos(rad) * radialOffset;
    return by + lateralY + radialY;
  });

  return (
    <motion.div
      className="player-marker-html"
      style={{
        backgroundColor: player.color,
        x,
        y,
        left: 'calc(50% - 16px)', 
        top: 'calc(50% - 16px)',
        cursor: isReadOnly ? 'default' : 'pointer',
        boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
        border: '2px solid rgba(255,255,255,0.8)'
      }}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      onClick={(e) => {
        if (isReadOnly) return;
        e.stopPropagation();
        onClick();
      }}
    >
      <User size={18} color="white" />
      <AnimatePresence>
        {showName && (
          <motion.div 
            className="player-tooltip"
            initial={{ opacity: 0, y: 10, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 10, x: '-50%' }}
          >
            {player.name}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

/**
 * SpecialTile component for the "white cards" that orbit the board
 */
const SpecialTile = ({ tile, boardRotation, onClick, isReadOnly }) => {
  // Base coordinates at 0 deg rotation (relative to center)
  let rx = 0, ry = 0;
  const radius = BOARD_LAYOUT.radii.special;
  
  if (tile.id === 's4') ry = -radius;      // TOP (0)
  else if (tile.id === 's1') rx = radius;   // RIGHT (90)
  else if (tile.id === 's2') ry = radius;   // BOTTOM (180)
  else if (tile.id === 's3') rx = -radius;  // LEFT (270)

  // Calculate orbiting position based on board rotation
  const x = useTransform(boardRotation, (r) => {
    const rad = r * Math.PI / 180;
    return rx * Math.cos(rad) - ry * Math.sin(rad);
  });
  const y = useTransform(boardRotation, (r) => {
    const rad = r * Math.PI / 180;
    return rx * Math.sin(rad) + ry * Math.cos(rad);
  });

  const EffectIcon = SPECIAL_ICONS[tile.action] || HelpCircle;

  return (
    <motion.div
      className="special-card-html"
      style={{
        x,
        y,
        left: '50%',
        top: '50%',
        width: BOARD_LAYOUT.specialSize,
        height: BOARD_LAYOUT.specialSize,
        translateX: '-50%',
        translateY: '-50%',
        cursor: isReadOnly ? 'default' : 'help'
      }}
      onClick={onClick}
    >
      <div className="special-card-icon-container">
        <EffectIcon size={32} strokeWidth={2.5} color="#4885CE" />
      </div>
      <div className="special-card-text">
        {tile.label.split('\n').map((line, i) => (
          <div key={i}>{line}</div>
        ))}
      </div>
    </motion.div>
  );
};

const BoardView = ({ boardRotation = 0, isReadOnly = false }) => {
  const { setBoardRotation, players, activeBoardConfig, showDetailPopup, selectedTileIndex, jumpToTile } = useGame();
  const boardData = activeBoardConfig.tiles;
  const [showNameId, setShowNameId] = useState(null);
  
  // Responsive Scaling Logic
  const wrapperRef = useRef(null);
  const [boardScale, setBoardScale] = useState(1);
  
  useEffect(() => {
    if (!wrapperRef.current) return;
    
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        const scale = Math.min(width / 820, height / 820) * 1.02;
        setBoardScale(scale);
      }
    });
    
    observer.observe(wrapperRef.current);
    return () => observer.disconnect();
  }, []);

  const isDragging = useRef(false);
  const lastAngle = useRef(0);
  const dragStartPos = useRef(null);

  const rotMotion = useMotionValue(boardRotation);
  const springRot = useSpring(rotMotion, { stiffness: 80, damping: 18 });

  // Update motion value when external rotation changes
  useEffect(() => { 
    rotMotion.set(boardRotation); 
  }, [boardRotation, rotMotion]);

  const onPointerDown = (e) => {
    if (isReadOnly) return;
    isDragging.current = true;
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = e.clientX - centerX;
    const dy = e.clientY - centerY;
    
    lastAngle.current = Math.atan2(dy, dx) * (180 / Math.PI);
  };

  const onPointerMove = (e) => {
    if (!isDragging.current) return;
    
    if (dragStartPos.current) {
      const dist = Math.hypot(e.clientX - dragStartPos.current.x, e.clientY - dragStartPos.current.y);
      if (dist > 5) {
        e.currentTarget.setPointerCapture(e.pointerId);
      }
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = e.clientX - centerX;
    const dy = e.clientY - centerY;
    
    const currentAngle = Math.atan2(dy, dx) * (180 / Math.PI);
    let deltaAngle = currentAngle - lastAngle.current;
    
    if (deltaAngle > 180) deltaAngle -= 360;
    if (deltaAngle < -180) deltaAngle += 360;
    
    lastAngle.current = currentAngle;
    
    const newRot = rotMotion.get() + deltaAngle;
    rotMotion.set(newRot);
    setBoardRotation(newRot);
  };

  const onPointerUp = (e) => {
    if (isDragging.current) {
      e.currentTarget.releasePointerCapture(e.pointerId);
      isDragging.current = false;
      dragStartPos.current = null;
    }
  };

  const handleTileClick = (tile, index) => (e) => {
    if (isReadOnly) return;
    e.stopPropagation();

    // Se estiver no modo de teste dev, teletransporta o jogador para testar a mecânica
    if (activeBoardConfig.id === 'teste_dev') {
      jumpToTile(index);
    } else {
      showDetailPopup({
        title: tile.label || tile.type.toUpperCase(),
        description: tile.description,
        icon: SPECIAL_ICONS[tile.action] || TILE_ICONS[tile.type] || Info,
        color: tile.color
      });
    }
  };


  return (
    <div
      ref={wrapperRef}
      className="board-wrapper-html"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
      style={{ cursor: isReadOnly ? 'default' : 'grab' }}
    >
      <div 
        className="board-main-container"
        style={{ 
          transform: `scale(${boardScale})`,
          transformOrigin: 'center'
        }}
      >
        {/* Background Decorative Dashed Circles - Centered between the 3 integrated layers */}
        <svg className="board-bg-circles" viewBox="0 0 820 820" style={{ width: '100%', height: '100%' }}>
          {/* Gap 1: Center (R=90) and Inner (R_start=123) */}
          <circle cx="410" cy="410" r="106" fill="none" stroke="#cbd5e1" strokeWidth="5" strokeDasharray="8,10" opacity="0.6" />
          {/* Gap 2: Inner (R_end=177) and Middle (R_start=223) */}
          <circle cx="410" cy="410" r="200" fill="none" stroke="#cbd5e1" strokeWidth="5" strokeDasharray="8,10" opacity="0.6" />
          {/* Gap 3: Middle (R_end=277) and Outer/Special (R_start_special=305) */}
          <circle cx="410" cy="410" r="291" fill="none" stroke="#cbd5e1" strokeWidth="5" strokeDasharray="8,10" opacity="0.6" />
        </svg>
        
        {/* Arrivals Center Piece */}
        <div 
          className="center-arrival"
          style={{ 
            width: BOARD_LAYOUT.centerSize, 
            height: BOARD_LAYOUT.centerSize,
            borderWidth: '4px'
          }}
          onClick={() => {
            if (isReadOnly) return;
            showDetailPopup({ 
              id: 'center', 
              type: 'center', 
              label: 'CHEGADA', 
              description: 'O Ápice da Jornada: Você chegou ao centro do Psicoscópio, onde o aprendizado se torna sabedoria.' 
            });
          }}
        >
          <div className="center-text">
            {(activeBoardConfig.mechanics?.centerText || ["A APRENDIZAGEM", "É UM CICLO,", "NÃO UMA LINHA", "DE CHEGADA."]).map((line, i) => (
              <div key={i}>{line}</div>
            ))}
          </div>
        </div>

        {/* Rotatable Rings Container */}
        <motion.div 
          className="board-ring-container"
          style={{ rotate: springRot }}
        >
          {/* Main Tiles (Inner, Middle, Outer) */}
          {boardData.filter(t => t.ring !== 'special' && t.ring !== 'center').map((tile) => {
            const actualIdx = boardData.indexOf(tile);
            const r = BOARD_LAYOUT.radii[tile.ring];
            const ringSize = BOARD_LAYOUT.sizes[tile.ring];
            const ringClass = `tile-${tile.ring}`;
            const Icon = SPECIAL_ICONS[tile.action] || TILE_ICONS[tile.type] || Info;
            const isCustom = tile.isCustom || (tile.type && tile.type.startsWith('custom_'));
            const hasPlayer = players.some(p => p.position === actualIdx);

            return (
              <div 
                key={tile.id} 
                className={`html-tile ${ringClass} ${selectedTileIndex === actualIdx ? 'selected' : ''}`}
                style={{ 
                  backgroundColor: tile.color,
                  width: ringSize.w,
                  height: ringSize.h,
                  transform: `translate(-50%, -50%) rotate(${tile.angle}deg) translateY(-${r}px)`
                }}
                onClick={handleTileClick(tile, actualIdx)}
              >
                <div className="tile-content">
                  <motion.div 
                    initial={false}
                    animate={{ 
                      x: hasPlayer ? -22 : 0, // Move LATERALLY (counter-clockwise) to avoid overlapping player
                      scale: hasPlayer ? 0.85 : 1
                    }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Icon size={tile.ring === 'inner' ? 22 : 26} strokeWidth={2.2} />
                    {/* Custom Card Indicator - Matching GameCard pattern */}
                    {isCustom && (
                      <Brush 
                        size={12} 
                        style={{ 
                          position: 'absolute', 
                          bottom: -4, 
                          right: -6, 
                          backgroundColor: 'white',
                          borderRadius: '50%',
                          padding: '2px',
                          color: tile.color,
                          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                          border: '1px solid #EEE'
                        }} 
                      />
                    )}
                  </motion.div>
                </div>
              </div>
            );
          })}
        </motion.div>

        {/* Orbiting Special Tiles */}
        {boardData.filter(t => t.ring === 'special').map((tile) => (
          <SpecialTile 
            key={tile.id} 
            tile={tile} 
            boardRotation={springRot}
            onClick={handleTileClick(tile, boardData.indexOf(tile))}
            isReadOnly={isReadOnly}
          />
        ))}

        {/* Players */}
        {(() => {
          // Group players by position to handle density/overlap
          const playersByTile = {};
          players.forEach((p) => {
            if (!playersByTile[p.position]) playersByTile[p.position] = [];
            playersByTile[p.position].push(p);
          });

          return players.map((player) => {
            const tile = boardData[player.position];
            if (!tile) return null;
            
            const r = tile.ring === 'special' ? BOARD_LAYOUT.radii.special : (BOARD_LAYOUT.radii[tile.ring] || 0);
            const finalAngle = tile.angle;
            
            // Calculate offsets for non-overlapping
            const siblings = playersByTile[player.position] || [];
            const idxInTile = siblings.findIndex(s => s.id === player.id);
            const totalOnTile = siblings.length;
            
            // Lateral offset factor - Offset by 22 if player is alone to be side-by-side with icon
            // If multiple players, spread them starting from the shifted position
            const slotOffset = totalOnTile > 1 
              ? (idxInTile - (totalOnTile - 1) / 2) * 22 + 15
              : 22;
            
            // Radial offset factor (Keep centered radially now that they are side-by-side)
            const radialOffset = 0;

            return (
              <PlayerMarker
                key={player.id}
                player={player}
                angle={finalAngle}
                r={r}
                boardRotation={springRot}
                isReadOnly={isReadOnly}
                showName={showNameId === player.id}
                onClick={() => setShowNameId(showNameId === player.id ? null : player.id)}
                slotOffset={slotOffset}
                radialOffset={radialOffset}
              />
            );
          });
        })()}

      </div>
    </div>
  );
};

export default BoardView;
