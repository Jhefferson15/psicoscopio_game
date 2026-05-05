import { motion, useMotionValue, useSpring } from 'framer-motion';

import { useRef, useEffect, useState } from 'react';
import { useGame } from '../state/useGame';
import { 
  Brain, 
  Sparkles, 
  Zap, 
  Search, 
  MessageSquare, 
  Eye, 
  RotateCw, 
  Target, 
  Puzzle, 
  Sliders,
  Star,
  Info
} from 'lucide-react';
import './BoardView.css';

const TILE_ICONS = {
  memoria: Brain,
  reflexao: Brain,
  desafio: Zap,
  experiencia: Sparkles,
  sorte: Sparkles,
  custom_memoria: Brain,
  custom_reflexao: Brain,
  custom_desafio: Zap,
  custom_experiencia: Sparkles,
  custom_sorte: Sparkles,
  custom_card: Sparkles,
  especial: Zap,
  center: Info

};



const BoardView = ({ boardRotation = 0, isReadOnly = false }) => {
  const { setBoardRotation, players, activeBoardConfig, showDetailPopup } = useGame();
  const boardData = activeBoardConfig.tiles;
  const [showNameId, setShowNameId] = useState(null);
  const isDragging = useRef(false);
  const lastAngle = useRef(0);
  const rotGRef = useRef(null);
  const cardTopRef = useRef(null);
  const cardRightRef = useRef(null);
  const cardBottomRef = useRef(null);
  const cardLeftRef = useRef(null);

  const rotMotion = useMotionValue(boardRotation);
  const springRot = useSpring(rotMotion, { stiffness: 80, damping: 18 });

  // Rotacao do anel principal via atributo SVG nativo rotate(N, cx, cy)
  useEffect(() => {
    const updateRing = (r) => {
      rotGRef.current?.setAttribute('transform', `rotate(${r}, 400, 400)`);
    };
    updateRing(springRot.get());
    return springRot.on('change', updateRing);
  }, [springRot]);

  // Cards brancos orbitam em sincronia com o spring
  useEffect(() => {
    const cx = 400, cy = 400;
    const cards = [
      { ref: cardTopRef,    rx: 0,    ry: -305 },
      { ref: cardRightRef,  rx: 310,  ry: 0    },
      { ref: cardBottomRef, rx: 0,    ry: 320  },
      { ref: cardLeftRef,   rx: -310, ry: 50   },
    ];
    const update = (r) => {
      const rad = r * Math.PI / 180;
      const cos = Math.cos(rad), sin = Math.sin(rad);
      cards.forEach(({ ref, rx, ry }) => {
        if (!ref.current) return;
        const x = cx + rx * cos - ry * sin;
        const y = cy + rx * sin + ry * cos;
        ref.current.setAttribute('transform', `translate(${x}, ${y})`);
      });
    };
    update(springRot.get());
    return springRot.on('change', update);
  }, [springRot]);

  // Sincroniza botao externo com motion value
  useEffect(() => { rotMotion.set(boardRotation); }, [boardRotation, rotMotion]);

  const dragStartPos = useRef(null);

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
    
    // Captura o ponteiro apenas se houver movimento real para não bloquear cliques simples
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

  const flip = (baseAngle, yOffset) => {
    const total = ((baseAngle + boardRotation) % 360 + 360) % 360;
    return total > 95 && total < 265 ? `rotate(180, 0, ${yOffset})` : '';
  };

  const arc = (fill, icon, angle, ring, r, onClick, action) => (
    <g transform={`rotate(${angle})`} style={{ pointerEvents: isReadOnly ? 'none' : 'auto', cursor: isReadOnly ? 'default' : 'help' }} onClick={isReadOnly ? null : onClick}>
      <use href={`#arc-${ring}`} fill={fill} stroke={fill} strokeWidth="16" strokeLinejoin="round" filter="url(#shadow)" />
      <use href={`#${icon}`} transform={`translate(0, -${r}) rotate(0)`} style={{ pointerEvents: 'none' }} />
      {action === 'MOVE_INNER' && <use href="#arrow-inner" transform={`translate(22, -${r})`} style={{ pointerEvents: 'none' }} />}
      {action === 'MOVE_OUTER' && <use href="#arrow-outer" transform={`translate(22, -${r})`} style={{ pointerEvents: 'none' }} />}
    </g>
  );

  const arcText = (fill, label, angle, ring, yOff, fontSize = 13, onClick, action) => (
    <g transform={`rotate(${angle})`} style={{ pointerEvents: isReadOnly ? 'none' : 'auto', cursor: isReadOnly ? 'default' : 'help' }} onClick={isReadOnly ? null : onClick}>
      <use href={`#arc-${ring}`} fill={fill} stroke={fill} strokeWidth="16" strokeLinejoin="round" filter="url(#shadow)" />
      <text x="0" y={yOff} transform={flip(angle, yOff)} textAnchor="middle" fill="#FFF" fontSize={fontSize} fontWeight="600" letterSpacing="0.5" style={{ pointerEvents: 'none' }}>{label}</text>
      {action === 'MOVE_INNER' && <use href="#arrow-inner" transform={`translate(22, ${yOff - 5})`} style={{ pointerEvents: 'none' }} />}
      {action === 'MOVE_OUTER' && <use href="#arrow-outer" transform={`translate(22, ${yOff - 5})`} style={{ pointerEvents: 'none' }} />}
    </g>
  );

  return (
    <div
      style={{ width: '100%', height: '100%', cursor: 'grab', userSelect: 'none' }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
    >
      <svg viewBox="30 30 740 740" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"
        style={{ backgroundColor: 'transparent', fontFamily: "'Segoe UI', Roboto, sans-serif", display: 'block', overflow: 'visible' }}>
        <defs>
          <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="2" dy="4" stdDeviation="4" floodColor="#000" floodOpacity="0.15" />
          </filter>
          <path id="arc-inner" d="M -28 -133 L 28 -133 L 36 -167 L -36 -167 Z" />
          <path id="arc-middle" d="M -34 -208 L 34 -208 L 40 -242 L -40 -242 Z" />
          <path id="arc-outer" d="M -37 -283 L 37 -283 L 43 -317 L -43 -317 Z" />
          {/* Icons definitions */}
          <g id="icon-brain">
            <path d="M0 -10 C-8 -10 -12 -5 -10 2 C-14 2 -16 8 -12 12 C-10 16 -4 16 -1 14 C0 18 6 18 9 14 C12 16 18 12 14 6 C16 2 14 -4 10 -2 C8 -8 4 -10 0 -10 Z" fill="none" stroke="#1f2937" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
            <path d="M-5 -2 Q0 -6 5 -2 M-8 5 Q-4 1 0 5 M8 3 Q4 -1 0 5" fill="none" stroke="#1f2937" strokeWidth="2.5" strokeLinecap="round" />
          </g>
          <g id="icon-eye">
            <path d="M-14 0 Q0 -12 14 0 Q0 12 -14 0 Z" fill="none" stroke="#1f2937" strokeWidth="2.5" strokeLinejoin="round" />
            <circle cx="0" cy="0" r="4" fill="#1f2937" />
          </g>
          <g id="icon-mag">
            <circle cx="-3" cy="-3" r="6" fill="none" stroke="#1f2937" strokeWidth="2.5" />
            <line x1="1.5" y1="1.5" x2="9" y2="9" stroke="#1f2937" strokeWidth="3" strokeLinecap="round" />
          </g>
          <g id="icon-bulb">
            <path d="M-6 -6 A8 8 0 1 1 6 -6 L4 3 L-4 3 Z" fill="none" stroke="#1f2937" strokeWidth="2.5" strokeLinejoin="round" />
            <line x1="-3" y1="7" x2="3" y2="7" stroke="#1f2937" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="-2" y1="10" x2="2" y2="10" stroke="#1f2937" strokeWidth="2.5" strokeLinecap="round" />
          </g>
          <g id="icon-puzzle">
            <path d="M-8 -8 L-2 -8 A 3 3 0 1 1 2 -8 L8 -8 L8 -2 A 3 3 0 1 0 8 2 L8 8 L2 8 A 3 3 0 1 1 -2 8 L-8 8 L-8 2 A 3 3 0 1 0 -8 -2 Z" fill="none" stroke="#1f2937" strokeWidth="2.5" strokeLinejoin="round" />
          </g>
          <g id="icon-target">
            <circle cx="0" cy="0" r="10" fill="none" stroke="#1f2937" strokeWidth="2.5" />
            <circle cx="0" cy="0" r="3" fill="#1f2937" />
            <path d="M-14 0 L-6 0 M14 0 L6 0 M0 -14 L0 -6 M0 14 L0 6" stroke="#1f2937" strokeWidth="2.5" strokeLinecap="round" />
          </g>
          <g id="icon-chat">
            <path d="M-10 -10 L10 -10 C12.2 -10 14 -8.2 14 -6 L14 4 C14 6.2 12.2 8 10 8 L4 8 L-2 14 L-2 8 L-10 8 C-12.2 8 -14 6.2 -14 4 L-14 -6 C-14 -8.2 -12.2 -10 -10 -10 Z" fill="none" stroke="#1f2937" strokeWidth="2.5" strokeLinejoin="round" />
            <path d="M-5 -1 L5 -1 M-3 -4 L3 -4 M-3 2 L3 2" fill="none" stroke="#1f2937" strokeWidth="2" strokeLinecap="round" />
          </g>
          <g id="icon-slider">
            <line x1="-10" y1="-3" x2="10" y2="-3" stroke="#1f2937" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="-4" cy="-3" r="3" fill="#1f2937" />
            <line x1="-10" y1="5" x2="10" y2="5" stroke="#1f2937" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="4" cy="5" r="3" fill="#1f2937" />
          </g>
          <g id="icon-cycle">
            <path d="M-6 -8 C2 -12 10 -6 10 2 M10 2 L14 -2 M10 2 L6 -2" fill="none" stroke="#1f2937" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M10 8 C2 12 -6 6 -6 -2 M-6 -2 L-10 2 M-6 -2 L-2 2" fill="none" stroke="#1f2937" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </g>
          <g id="icon-zap">
            <path d="M5 -10 L-5 2 L2 2 L-2 10 L8 -2 L1 -2 Z" fill="none" stroke="#1f2937" strokeWidth="2.5" strokeLinejoin="round" />
          </g>
          <g id="icon-sparkles">
            <path d="M0 -10 L2 -2 L10 0 L2 2 L0 10 L-2 2 L-10 0 L-2 -2 Z" fill="none" stroke="#1f2937" strokeWidth="2.5" strokeLinejoin="round" />
          </g>
          <g id="icon-memoria">
             <use href="#icon-brain" />
          </g>
          <g id="icon-reflexao">
             <use href="#icon-brain" />
          </g>
          <g id="icon-desafio">
             <use href="#icon-zap" />
          </g>
          <g id="icon-experiencia">
             <use href="#icon-sparkles" />
          </g>
          <g id="icon-custom_card">
             <use href="#icon-sparkles" />
          </g>
          <g id="icon-star">
            <path d="M0 -11 L3.2 -3.5 L11 -2.5 L5 3 L6.5 10.5 L0 6.5 L-6.5 10.5 L-5 3 L-11 -2.5 L-3.2 -3.5 Z" fill="#1f2937" />
          </g>


          <g id="icon-user">
            <path d="M-8 8 Q-8 1, 0 1 Q 8 1, 8 8" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="0" cy="-5" r="5" fill="currentColor" />
          </g>
          <g id="arrow-inner">
            <line x1="0" y1="-12" x2="0" y2="12" stroke="#FFF" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M -7 5 L 0 12 L 7 5" fill="none" stroke="#FFF" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
          </g>
          <g id="arrow-outer">
            <line x1="0" y1="12" x2="0" y2="-12" stroke="#FFF" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M -7 -5 L 0 -12 L 7 -5" fill="none" stroke="#FFF" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        </defs>

        <g ref={rotGRef}>
          <circle cx="400" cy="400" r="195" fill="none" stroke="#aab5b9" strokeWidth="1.5" strokeDasharray="4,6" />
          <circle cx="400" cy="400" r="270" fill="none" stroke="#aab5b9" strokeWidth="1.5" strokeDasharray="4,6" />

          <g transform="translate(400, 400)">
            {/* JOGADORES */}
            {players.map((player, idx) => {
              const tile = boardData[player.position];
              if (!tile) return null;
              
              const samePosCount = players.filter(p => p.position === player.position).length;
              const samePosIdx = players.filter((p, i) => p.position === player.position && i < idx).length;
              const baseMarkerSize = 25;
              const markerSize = samePosCount > 1 ? Math.max(18, baseMarkerSize - (samePosCount - 1) * 3) : baseMarkerSize;
              
              let r;
              switch (tile.ring) {
                case 'inner': r = 180 + (baseMarkerSize - markerSize); break;
                case 'middle': r = 255 + (baseMarkerSize - markerSize); break;
                case 'outer': r = 330 + (baseMarkerSize - markerSize); break;
                case 'special': r = 375 + (baseMarkerSize - markerSize); break;
                case 'center': r = 0; break;
                default: r = 0;
              }
              const angleOffset = samePosCount > 1 ? (samePosIdx - (samePosCount - 1) / 2) * (markerSize * 0.25) : 0;

              const validAngle = (tile.angle || 0) + (angleOffset || 0);
              const validR = typeof r === 'number' ? r : 0;
              const safeBoardRotation = boardRotation || 0;

              return (
                <g 
                   key={player.id} 
                   transform={`rotate(${validAngle}) translate(0, ${-validR})`}
                   style={{ cursor: isReadOnly ? 'default' : 'pointer', pointerEvents: isReadOnly ? 'none' : 'auto', transition: 'transform 0.3s ease-out' }}
                   onClick={(e) => {
                     if (isReadOnly) return;
                     e.stopPropagation();
                     setShowNameId(showNameId === player.id ? null : player.id);
                   }}>
                  <circle 
                    cx="0" 
                    cy="0" 
                    r={markerSize || 20} 
                    fill={player.color} 
                    stroke="#FFF" 
                    strokeWidth="3" 
                    filter="url(#shadow)" 
                  />
                  <g 
                    transform={`scale(${(markerSize || 25) / 15})`}
                    style={{ pointerEvents: 'none', color: '#FFF' }}
                  >
                    <use href="#icon-user" />
                  </g>

                  {showNameId === player.id && (
                    <g transform={`translate(0, ${-(markerSize || 25) - 15}) rotate(${- (validAngle + safeBoardRotation)})`}>
                      <rect x="-50" y="-14" width="100" height="28" rx="14" fill="#FFF" filter="url(#shadow)" />
                      <text y="5" textAnchor="middle" fill="#333" fontSize="13" fontWeight="bold">{player.name}</text>
                      <path d="M -6 14 L 0 20 L 6 14 Z" fill="#FFF" />
                    </g>
                  )}
                </g>
              );



            })}

            {/* RENDERIZAÇÃO DINÂMICA DAS CASAS */}
            {boardData.filter(t => t.ring !== 'special' && t.ring !== 'center').map((tile, idx) => {
               const handleTileClick = (e) => {
                 e.stopPropagation();
                 showDetailPopup({
                   title: tile.label || tile.type.toUpperCase(),
                   description: tile.description,
                   icon: TILE_ICONS[tile.type] || Info,
                   color: tile.color
                 });
               };

               const showLabels = activeBoardConfig.mechanics?.showBoardLabels !== false;

               if (showLabels && tile.label && tile.label.trim().length > 0) {
                 const yOff = tile.ring === 'inner' ? -145 : (tile.ring === 'middle' ? -220 : -295);
                 const fSize = tile.ring === 'inner' ? 12 : 14;
                 return <g key={tile.id || idx}>{arcText(tile.color, tile.label, tile.angle, tile.ring, yOff, fSize, handleTileClick, tile.action)}</g>;
               } else {
                 const r = tile.ring === 'inner' ? 150 : (tile.ring === 'middle' ? 225 : 300);
                 return <g key={tile.id || idx}>{arc(tile.color, `icon-${tile.type}`, tile.angle, tile.ring, r, handleTileClick, tile.action)}</g>;
               }
            })}
          </g>
        </g>

        {/* CARDS BRANCOS (CASAS ESPECIAIS) */}
        {boardData.filter(t => t.ring === 'special').map((tile) => {
           const handleSpecialClick = (e) => {
             e.stopPropagation();
             showDetailPopup({
               title: tile.label,
               description: tile.description,
               icon: TILE_ICONS[tile.type] || Zap,
               color: tile.color
             });
           };

           // Mapeamento manual dos cards brancos baseados nos IDs definidos no boardRepository
           if (tile.id === 's4') { // VOLTE 2 CASAS (TOP)
             return (
               <g key={tile.id} ref={cardTopRef} filter="url(#shadow)" style={{ pointerEvents: 'auto', cursor: 'help' }} onClick={handleSpecialClick}>
                 <rect x="-60" y="-35" width="120" height="70" rx="8" fill="#FFFFFF" stroke="#e0e0e0" strokeWidth="1" />
                 {tile.label.split('\n').map((line, i) => (
                   <text key={i} y={-4 + (i * 20)} textAnchor="middle" fill="#333" fontSize="14" fontWeight="700" style={{ pointerEvents: 'none' }}>{line}</text>
                 ))}
               </g>
             );
           }
           if (tile.id === 's1') { // AVANCE 2 CASAS (RIGHT)
             return (
               <g key={tile.id} ref={cardRightRef} filter="url(#shadow)" style={{ pointerEvents: 'auto', cursor: 'help' }} onClick={handleSpecialClick}>
                 <rect x="-55" y="-45" width="110" height="90" rx="8" fill="#FFFFFF" stroke="#e0e0e0" strokeWidth="1" />
                 {tile.label.split('\n').map((line, i) => (
                   <text key={i} y={-5 + (i * 20)} textAnchor="middle" fill="#333" fontSize="14" fontWeight="700" style={{ pointerEvents: 'none' }}>{line}</text>
                 ))}
               </g>
             );
           }
           if (tile.id === 's2') { // DESAFIO EM EQUIPA (BOTTOM)
             return (
               <g key={tile.id} ref={cardBottomRef} filter="url(#shadow)" style={{ pointerEvents: 'auto', cursor: 'help' }} onClick={handleSpecialClick}>
                 <rect x="-70" y="-35" width="140" height="70" rx="8" fill="#FFFFFF" stroke="#e0e0e0" strokeWidth="1" />
                 {tile.label.split('\n').map((line, i) => (
                   <text key={i} y={-4 + (i * 20)} textAnchor="middle" fill="#333" fontSize="14" fontWeight="700" style={{ pointerEvents: 'none' }}>{line}</text>
                 ))}
               </g>
             );
           }
           if (tile.id === 's3') { // TROQUE DE LUGAR (LEFT)
             return (
               <g key={tile.id} ref={cardLeftRef} filter="url(#shadow)" style={{ pointerEvents: 'auto', cursor: 'help' }} onClick={handleSpecialClick}>
                 <rect x="-55" y="-50" width="110" height="100" rx="8" fill="#FFFFFF" stroke="#e0e0e0" strokeWidth="1" />
                 {tile.label.split('\n').map((line, i) => (
                   <text key={i} y={-12 + (i * 20)} textAnchor="middle" fill="#333" fontSize="14" fontWeight="700" style={{ pointerEvents: 'none' }}>{line}</text>
                 ))}
               </g>
             );
           }
           return null;
        })}

        {/* CENTRO */}
        <g transform="translate(400, 400)" style={{ pointerEvents: isReadOnly ? 'none' : 'auto', cursor: isReadOnly ? 'default' : 'help' }} onClick={() => {
          if (isReadOnly) return;
          const centerTile = boardData.find(t => t.id === 'center');
          showDetailPopup({
            title: 'CHEGADA',
            description: centerTile?.description || 'O centro do Psicoscópio.',
            icon: Info,
            color: '#1e293b'
          });
        }}>
          <circle cx="0" cy="0" r="115" fill="#FFFFFF" filter="url(#shadow)" />
          {(activeBoardConfig.mechanics?.centerText || ["A APRENDIZAGEM", "É UM CICLO,", "NÃO UMA LINHA", "DE CHEGADA."]).map((line, i, arr) => (
            <text 
              key={i} 
              y={-((arr.length - 1) * 11.5) + (i * 23)} 
              textAnchor="middle" 
              fill="#333" 
              fontSize="15" 
              fontWeight="700" 
              letterSpacing="0.2" 
              style={{ pointerEvents: 'none' }}
            >
              {line}
            </text>
          ))}
        </g>
      </svg>
    </div>
  );
};

export default BoardView;
