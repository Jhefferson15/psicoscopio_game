import { motion, useMotionValue } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import { useGame } from '../state/useGame';
import { 
  Info,
  Brush
} from 'lucide-react';
import './BoardView.css';
import { BOARD_LAYOUT, SPECIAL_ICONS, TILE_ICONS } from './board_constants';
import PlayerMarker from './PlayerMarker';
import SpecialTile from './SpecialTile';

/**
 * BoardView component renders the interactive game board.
 * It handles rotation, tile layout, and player positioning.
 */
const BoardView = ({ 
  boardRotation: propRotation, 
  onRotationChange,
  isReadOnly = false, 
  isMiniature = false,
  activeBoardConfig: propConfig,
  players: propPlayers,
  selectedTileIndex: propSelectedTileIndex,
  onTileClick,
  showInitialPositions = false
}) => {
  const { 
    setBoardRotation: contextSetRotation, 
    players: contextPlayers, 
    activeBoardConfig: contextConfig, 
    showDetailPopup, 
    selectedTileIndex: contextSelectedTileIndex, 
    jumpToTile, 
    myPlayerIndex, 
    isOnline 
  } = useGame();

  const activeBoardConfig = propConfig || contextConfig;
  const players = propPlayers || contextPlayers;
  const selectedTileIndex = propSelectedTileIndex !== undefined ? propSelectedTileIndex : contextSelectedTileIndex;
  const boardData = activeBoardConfig.tiles;
  const boardRotation = propRotation !== undefined ? propRotation : 0; // Se não houver prop, usa 0 ou o valor do contexto se estivéssemos usando useGame diretamente

  const [showNameId, setShowNameId] = useState(null);
  
  // Responsive Scaling Logic
  const wrapperRef = useRef(null);
  const [boardScale, setBoardScale] = useState(1);
  
  useEffect(() => {
    if (!wrapperRef.current || isMiniature) return;
    
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        const scale = Math.min(width / 820, height / 820) * 1.02;
        setBoardScale(scale);
      }
    });
    
    observer.observe(wrapperRef.current);
    return () => observer.disconnect();
  }, [isMiniature]);

  const isDragging = useRef(false);
  const lastAngle = useRef(0);
  const dragStartPos = useRef(null);

  const rotMotion = useMotionValue(boardRotation);

  // Update motion value when external rotation changes
  useEffect(() => { 
    rotMotion.set(boardRotation); 
  }, [boardRotation, rotMotion]);

  const onPointerDown = (e) => {
    if (isReadOnly || isMiniature) return;
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
    if (!isDragging.current || isMiniature) return;
    
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
    
    if (onRotationChange) {
      onRotationChange(newRot);
    } else if (!propConfig) {
      // Só atualiza o contexto global se NÃO estivermos usando um config customizado (modo editor)
      contextSetRotation(newRot);
    }
  };

  const onPointerUp = (e) => {
    if (isDragging.current) {
      e.currentTarget.releasePointerCapture(e.pointerId);
      isDragging.current = false;
      dragStartPos.current = null;
    }
  };

  const handleTileClick = (tile, index) => (e) => {
    if (onTileClick) {
      onTileClick(tile, index, e);
      return;
    }

    if (isReadOnly || isMiniature) return;
    e.stopPropagation();

    // Se estiver no modo de teste dev, teletransporta o jogador para testar a mecânica
    if (activeBoardConfig.id === 'teste_dev') {
      jumpToTile(index, isOnline ? myPlayerIndex : null);
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
      className={`board-wrapper-html ${isMiniature ? 'miniature' : ''}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
      style={{ cursor: (isReadOnly || isMiniature) ? 'default' : 'grab' }}
    >
      <div 
        className="board-main-container"
        style={{ 
          transform: isMiniature ? 'none' : `scale(${boardScale})`,
          transformOrigin: 'center'
        }}
      >
        {/* Background Decorative Dashed Circles */}
        <svg className="board-bg-circles" viewBox="0 0 820 820" style={{ width: '100%', height: '100%' }}>
          <circle cx="410" cy="410" r="106" fill="none" stroke="#cbd5e1" strokeWidth="5" strokeDasharray="8,10" opacity="0.6" />
          <circle cx="410" cy="410" r="200" fill="none" stroke="#cbd5e1" strokeWidth="5" strokeDasharray="8,10" opacity="0.6" />
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
            if (isReadOnly || isMiniature) return;
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
          style={{ rotate: rotMotion }}
        >
          {/* Main Tiles (Inner, Middle, Outer) */}
          {boardData.filter(t => t.ring !== 'special' && t.ring !== 'center').map((tile) => {
            const actualIdx = boardData.indexOf(tile);
            const r = BOARD_LAYOUT.radii[tile.ring];
            const ringSize = BOARD_LAYOUT.sizes[tile.ring];
            const ringClass = `tile-${tile.ring}`;
            const Icon = SPECIAL_ICONS[tile.action] || TILE_ICONS[tile.type] || Info;
            const isCustom = tile.isCustom || (tile.type && tile.type.startsWith('custom_'));
            const hasPlayer = !isMiniature && players?.some(p => p.position === actualIdx);
            const isInitialPos = showInitialPositions && activeBoardConfig.mechanics?.initialPositions?.includes(actualIdx);
            const playerInitialIdx = isInitialPos ? activeBoardConfig.mechanics.initialPositions.indexOf(actualIdx) : -1;

            return (
              <div 
                key={tile.id} 
                className={`html-tile ${ringClass} ${selectedTileIndex === actualIdx ? 'selected' : ''} ${
                  tile.color?.toLowerCase() === '#ffffff' || tile.color?.toLowerCase() === 'white' ? 'white-tile' : ''
                }`}
                style={{ 
                  backgroundColor: tile.color,
                  width: ringSize.w,
                  height: ringSize.h,
                  transform: `translate(-50%, -50%) rotate(${tile.angle}deg) translateY(-${r}px)`
                }}
                onClick={handleTileClick(tile, actualIdx)}
              >
                <div className="tile-content">
                  {isInitialPos && (
                    <div 
                      className="initial-pos-indicator"
                      style={{ 
                        position: 'absolute',
                        top: -10,
                        right: -10,
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        backgroundColor: ['#D84B42', '#4885CE', '#7B4BB1', '#F59E0B'][playerInitialIdx],
                        color: 'white',
                        fontSize: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        border: '2px solid white',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                        zIndex: 10
                      }}
                    >
                      P{playerInitialIdx + 1}
                    </div>
                  )}
                  <motion.div 
                    initial={false}
                    animate={{ 
                      x: hasPlayer ? -22 : 0, 
                      scale: hasPlayer ? 0.85 : 1
                    }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Icon 
                      size={tile.ring === 'inner' ? 22 : 26} 
                      strokeWidth={2.2} 
                      color={['#000000', '#111827', '#64748B', 'black'].includes(tile.color) ? 'white' : undefined} 
                    />
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
            boardRotation={rotMotion}
            onClick={handleTileClick(tile, boardData.indexOf(tile))}
            isReadOnly={isReadOnly || isMiniature}
          />
        ))}

        {/* Players */}
        {!isMiniature && (() => {
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
            
            const siblings = playersByTile[player.position] || [];
            const idxInTile = siblings.findIndex(s => s.id === player.id);
            const totalOnTile = siblings.length;
            
            // Convert 22px shift to degrees based on the radius of the current ring
            const iconOffsetDeg = r > 0 ? (22 / (2 * Math.PI * r)) * 360 : 0;
            
            // Distância em pixels entre os centros dos jogadores para gerar sobreposição
            const playerGapPx = 14; 
            const playerGapDeg = r > 0 ? (playerGapPx / (2 * Math.PI * r)) * 360 : 6;
            
            const slotOffset = totalOnTile > 1 
              ? (idxInTile - (totalOnTile - 1) / 2) * playerGapDeg + iconOffsetDeg
              : iconOffsetDeg;
            
            const radialOffset = 0;

            return (
              <PlayerMarker
                key={player.id}
                player={player}
                angle={finalAngle}
                r={r}
                boardRotation={rotMotion}
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
