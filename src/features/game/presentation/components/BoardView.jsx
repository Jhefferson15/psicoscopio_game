import { useMotionValue, useSpring } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import { useGame } from '../state/useGame';
import { boardData } from '../../data/repositories/boardRepository';
import './BoardView.css';

const BoardView = ({ boardRotation = 0 }) => {
  const { setBoardRotation, players } = useGame();
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
  }, []);

  // Cards brancos orbitam em sincronia com o spring
  useEffect(() => {
    const cx = 400, cy = 400;
    const cards = [
      { ref: cardTopRef,    rx: 0,    ry: -325 },
      { ref: cardRightRef,  rx: 330,  ry: 0    },
      { ref: cardBottomRef, rx: 0,    ry: 340  },
      { ref: cardLeftRef,   rx: -330, ry: 50   },
    ];
    const update = (r) => {
      const rad = r * Math.PI / 180;
      const cos = Math.cos(rad), sin = Math.sin(rad);
      cards.forEach(({ ref, rx, ry }) => {
        if (!ref.current) return;
        const x = cx + rx * cos - ry * sin;
        const y = cy + rx * sin + ry * cos;
        // Cards fora do grupo rotacionado ja sao estaticos em tela;
        // apenas orbitar a posicao — sem rotate adicional
        ref.current.setAttribute('transform', `translate(${x}, ${y})`);
      });
    };
    update(springRot.get());
    return springRot.on('change', update);
  }, []);

  // Sincroniza botao externo com motion value
  useEffect(() => { rotMotion.set(boardRotation); }, [boardRotation]);

  const onPointerDown = (e) => {
    isDragging.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = e.clientX - centerX;
    const dy = e.clientY - centerY;
    
    lastAngle.current = Math.atan2(dy, dx) * (180 / Math.PI);
  };

  const onPointerMove = (e) => {
    if (!isDragging.current) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = e.clientX - centerX;
    const dy = e.clientY - centerY;
    
    const currentAngle = Math.atan2(dy, dx) * (180 / Math.PI);
    let deltaAngle = currentAngle - lastAngle.current;
    
    // Normaliza a passagem pelo limite de 180 / -180 graus
    if (deltaAngle > 180) deltaAngle -= 360;
    if (deltaAngle < -180) deltaAngle += 360;
    
    lastAngle.current = currentAngle;
    
    const newRot = rotMotion.get() + deltaAngle;
    rotMotion.set(newRot);
    setBoardRotation(newRot);
  };
  const onPointerUp = () => { isDragging.current = false; };

  // Flip de 180 quando o texto esta na parte inferior do circulo
  const flip = (baseAngle, yOffset) => {
    const total = ((baseAngle + boardRotation) % 360 + 360) % 360;
    return total > 95 && total < 265 ? `rotate(180, 0, ${yOffset})` : '';
  };

  const arc = (fill, icon, angle, ring, r) => (
    <g transform={`rotate(${angle})`} style={{ pointerEvents: 'none' }}>
      <use href={`#arc-${ring}`} fill={fill} stroke={fill} strokeWidth="16" strokeLinejoin="round" filter="url(#shadow)" />
      <use href={`#${icon}`} transform={`translate(0, -${r}) rotate(0)`} />
    </g>
  );

  const arcText = (fill, label, angle, ring, yOff, fontSize = 13) => (
    <g transform={`rotate(${angle})`} style={{ pointerEvents: 'none' }}>
      <use href={`#arc-${ring}`} fill={fill} stroke={fill} strokeWidth="16" strokeLinejoin="round" filter="url(#shadow)" />
      <text x="0" y={yOff} transform={flip(angle, yOff)} textAnchor="middle" fill="#FFF" fontSize={fontSize} fontWeight="600" letterSpacing="0.5">{label}</text>
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
      <svg viewBox="0 0 800 800" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"
        style={{ backgroundColor: '#f4f7f8', fontFamily: "'Segoe UI', Roboto, sans-serif", display: 'block' }}>
        <defs>
          <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="2" dy="4" stdDeviation="4" floodColor="#000" floodOpacity="0.15" />
          </filter>
          <path id="arc-inner" d="M -28 -133 L 28 -133 L 36 -167 L -36 -167 Z" />
          <path id="arc-middle" d="M -34 -208 L 34 -208 L 40 -242 L -40 -242 Z" />
          <path id="arc-outer" d="M -37 -283 L 37 -283 L 43 -317 L -43 -317 Z" />
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
          <g id="icon-star">
            <path d="M0 -11 L3.2 -3.5 L11 -2.5 L5 3 L6.5 10.5 L0 6.5 L-6.5 10.5 L-5 3 L-11 -2.5 L-3.2 -3.5 Z" fill="#1f2937" />
          </g>
          <g id="icon-user">
            <path d="M-8 8 Q-8 1, 0 1 Q 8 1, 8 8" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="0" cy="-5" r="5" fill="currentColor" />
          </g>
        </defs>

        {/* GRUPO ROTACIONADO: controlado via setAttribute direto no DOM */}
        <g ref={rotGRef}>
          {/* Fundo decorativo */}
          <g stroke="#cfdadd" strokeWidth="2.5" fill="none" opacity="0.8">
            <path d="M -50 400 Q 150 200 400 -50" />
            <path d="M 200 -50 C 350 250, 600 150, 850 300" />
            <path d="M -50 600 C 200 750, 300 500, 500 850" />
            <path d="M 850 500 Q 650 700 400 850" />
            <path d="M 100 850 C 150 500, 700 700, 850 100" />
            <g fill="#cfdadd" stroke="none">
              <path d="M 150 270 Q 160 260 170 270 Q 160 280 150 270 Z" />
              <path d="M 280 120 Q 290 110 300 120 Q 290 130 280 120 Z" />
              <path d="M 650 240 Q 660 230 670 240 Q 660 250 650 240 Z" />
              <path d="M 300 680 Q 310 670 320 680 Q 310 690 300 680 Z" />
              <path d="M 700 590 Q 710 580 720 590 Q 710 600 700 590 Z" />
              <path d="M 180 580 Q 190 570 200 580 Q 190 590 180 580 Z" />
            </g>
          </g>

          {/* Linhas pontilhadas */}
          <circle cx="400" cy="400" r="195" fill="none" stroke="#aab5b9" strokeWidth="1.5" strokeDasharray="4,6" />
          <circle cx="400" cy="400" r="270" fill="none" stroke="#aab5b9" strokeWidth="1.5" strokeDasharray="4,6" />

          {/* Aneis - todos relativos ao centro (400,400) */}
          <g transform="translate(400, 400)">

            {/* JOGADORES - Renderizados antes para ficarem "atrás" das casas */}
            {players.map((player, idx) => {
              const tile = boardData[player.position];
              if (!tile) return null;
              
              const samePosCount = players.filter(p => p.position === player.position).length;
              const samePosIdx = players.filter((p, i) => p.position === player.position && i < idx).length;
              
              // Tamanho dinâmico para evitar sobreposição excessiva
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

              // Offset de ângulo baseado no tamanho atual para manter a separação (reduzido para ficarem mais juntos)
              const angleOffset = samePosCount > 1 ? (samePosIdx - (samePosCount - 1) / 2) * (markerSize * 0.25) : 0;

              return (
                <g key={player.id} transform={`rotate(${tile.angle + angleOffset})`} 
                   style={{ cursor: 'pointer', pointerEvents: 'auto' }}
                   onClick={(e) => {
                     e.stopPropagation();
                     setShowNameId(showNameId === player.id ? null : player.id);
                   }}>
                  {/* Marcador Base */}
                  <circle cx="0" cy={-r} r={markerSize} fill={player.color} stroke="#FFF" strokeWidth="3" filter="url(#shadow)" />
                  
                  {/* Ícone do Jogador */}
                  <g transform={`translate(0, ${-r}) scale(${markerSize / 15})`} style={{ pointerEvents: 'none', color: '#FFF' }}>
                    <use href="#icon-user" />
                  </g>
                  
                  {showNameId === player.id && (
                    <g transform={`translate(0, ${-r - markerSize - 15}) rotate(${- (tile.angle + angleOffset + boardRotation)})`}>
                      <rect x="-50" y="-14" width="100" height="28" rx="14" fill="#FFF" filter="url(#shadow)" />
                      <text y="5" textAnchor="middle" fill="#333" fontSize="13" fontWeight="bold">{player.name}</text>
                      <path d="M -6 14 L 0 20 L 6 14 Z" fill="#FFF" />
                    </g>
                  )}
                </g>
              );
            })}

            {/* ANEL INTERIOR */}
            {arc('#D84B42','icon-brain', 18,'inner',150)}
            {arcText('#4885CE','MEMÓRIA',  54,'inner',-145,12)}
            {arc('#6FB05E','icon-puzzle',90,'inner',150)}
            {arc('#F4C746','icon-bulb', 126,'inner',150)}
            {arc('#7B4BB1','icon-mag',  162,'inner',150)}
            {arc('#D84B42','icon-target',198,'inner',150)}
            {arc('#6FB05E','icon-chat', 234,'inner',150)}
            {arc('#F4C746','icon-slider',270,'inner',150)}
            {arcText('#7B4BB1','REFLEXÃO',306,'inner',-145,12)}
            {arc('#F4C746','icon-mag',  342,'inner',150)}

            {/* ANEL MEDIO */}
            {arcText('#7B4BB1','REFLEXÃO', 12.8,'middle',-220)}
            {arc('#F4C746','icon-bulb',   38.5,'middle',225)}
            {arc('#6FB05E','icon-target', 64.2,'middle',225)}
            {arc('#4885CE','icon-eye',    90,  'middle',225)}
            {arc('#D84B42','icon-puzzle',115.7,'middle',225)}
            {arc('#6FB05E','icon-brain', 141.4,'middle',225)}
            {arc('#F4C746','icon-slider',167.1,'middle',225)}
            {arcText('#D84B42','DESAFIO', 192.8,'middle',-220)}
            {arc('#4885CE','icon-mag',   218.5,'middle',225)}
            {arcText('#7B4BB1','REFLEXÃO',244.2,'middle',-220)}
            {arc('#6FB05E','icon-puzzle',270,  'middle',225)}
            {arc('#D84B42','icon-target',295.7,'middle',225)}
            {arcText('#4885CE', 'MEMÓRIA', 321.4, 'middle', -220)}
            {arc('#D84B42', 'icon-brain', 347.1, 'middle', 225)}

            {/* ANEL EXTERIOR - omite 0,90,180,270 para cards brancos */}
            {arc('#D84B42', 'icon-brain', 18, 'outer', 300)}
            {arcText('#7B4BB1', 'REFLEXÃO', 36, 'outer', -295, 14)}
            {arc('#EEDCC0', 'icon-star', 54, 'outer', 300)}
            {arc('#4885CE', 'icon-mag', 72, 'outer', 300)}
            {arc('#6FB05E', 'icon-cycle', 108, 'outer', 300)}
            {arcText('#7B4BB1', 'REFLEXÃO', 126, 'outer', -295, 14)}
            {arc('#F4C746', 'icon-bulb', 144, 'outer', 300)}
            {arc('#4885CE', 'icon-eye', 162, 'outer', 300)}
            {arcText('#D84B42', 'DESAFIO', 198, 'outer', -295, 14)}
            {arc('#7B4BB1', 'icon-mag', 216, 'outer', 300)}
            {arc('#6FB05E', 'icon-brain', 234, 'outer', 300)}
            {arcText('#4885CE', 'MEMÓRIA', 252, 'outer', -295, 14)}
            {arcText('#7B4BB1', 'REFLEXÃO', 288, 'outer', -295, 14)}
            {arc('#D84B42', 'icon-target', 306, 'outer', 300)}
            {arc('#4885CE', 'icon-eye', 324, 'outer', 300)}
            {arc('#D84B42', 'icon-brain', 342, 'outer', 300)}
          </g>
        </g>

        {/* CARDS BRANCOS - camada estatica, posicionados via DOM */}
        <g ref={cardTopRef} filter="url(#shadow)" style={{ pointerEvents: 'none' }}>
          <rect x="-60" y="-35" width="120" height="70" rx="8" fill="#FFFFFF" stroke="#e0e0e0" strokeWidth="1" />
          <text y="-4" textAnchor="middle" fill="#333" fontSize="14" fontWeight="700">VOLTE</text>
          <text y="16" textAnchor="middle" fill="#333" fontSize="14" fontWeight="700">2 CASAS</text>
        </g>
        <g ref={cardRightRef} filter="url(#shadow)" style={{ pointerEvents: 'none' }}>
          <rect x="-55" y="-45" width="110" height="90" rx="8" fill="#FFFFFF" stroke="#e0e0e0" strokeWidth="1" />
          <text y="-5" textAnchor="middle" fill="#333" fontSize="14" fontWeight="700">AVANCE</text>
          <text y="15" textAnchor="middle" fill="#333" fontSize="14" fontWeight="700">2 CASAS</text>
        </g>
        <g ref={cardBottomRef} filter="url(#shadow)" style={{ pointerEvents: 'none' }}>
          <rect x="-70" y="-35" width="140" height="70" rx="8" fill="#FFFFFF" stroke="#e0e0e0" strokeWidth="1" />
          <text y="-4" textAnchor="middle" fill="#333" fontSize="14" fontWeight="700">DESAFIO EM</text>
          <text y="16" textAnchor="middle" fill="#333" fontSize="14" fontWeight="700">EQUIPA</text>
        </g>
        <g ref={cardLeftRef} filter="url(#shadow)" style={{ pointerEvents: 'none' }}>
          <rect x="-55" y="-50" width="110" height="100" rx="8" fill="#FFFFFF" stroke="#e0e0e0" strokeWidth="1" />
          <text y="-12" textAnchor="middle" fill="#333" fontSize="14" fontWeight="700">TROQUE</text>
          <text y="8" textAnchor="middle" fill="#333" fontSize="14" fontWeight="700">DE</text>
          <text y="28" textAnchor="middle" fill="#333" fontSize="14" fontWeight="700">LUGAR</text>
        </g>

        {/* CENTRO - estatico */}
        <g transform="translate(400, 400)" style={{ pointerEvents: 'none' }}>
          <circle cx="0" cy="0" r="115" fill="#FFFFFF" filter="url(#shadow)" />
          <g fill="#aab5b9" opacity="0.6">
            <path d="M -20 -80 Q -10 -90 0 -80 Q -10 -70 -20 -80 Z" />
            <path d="M 60 -40 Q 70 -50 80 -40 Q 70 -30 60 -40 Z" />
            <path d="M -70 30 Q -60 20 -50 30 Q -60 40 -70 30 Z" />
            <path d="M 30 70 Q 40 60 50 70 Q 40 80 30 70 Z" />
          </g>
          <text y="-20" textAnchor="middle" fill="#333" fontSize="15" fontWeight="700" letterSpacing="0.2">A APRENDIZAGEM</text>
          <text y="3"   textAnchor="middle" fill="#333" fontSize="15" fontWeight="700" letterSpacing="0.2">E UM CICLO,</text>
          <text y="26"  textAnchor="middle" fill="#333" fontSize="15" fontWeight="700" letterSpacing="0.2">NAO UMA LINHA</text>
          <text y="49"  textAnchor="middle" fill="#333" fontSize="15" fontWeight="700" letterSpacing="0.2">DE CHEGADA.</text>
          <path d="M -90 -20 Q -40 20 -10 -60" fill="none" stroke="#cfdadd" strokeWidth="2" />
          <path d="M 10 50 Q 50 20 80 50" fill="none" stroke="#cfdadd" strokeWidth="2" />
          <path d="M -40 70 Q 0 90 40 60" fill="none" stroke="#cfdadd" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
};

export default BoardView;
