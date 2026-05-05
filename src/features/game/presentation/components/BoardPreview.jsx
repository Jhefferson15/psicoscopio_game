import React, { useState, useRef } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { Maximize, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

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
  const [zoom, setZoom] = useState(isLarge ? 1 : 0.8);
  const containerRef = useRef(null);
  
  // Use motion values for better performance
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  if (!editingConfig) return null;

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.2, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.4));
  const handleReset = () => {
    setZoom(isLarge ? 1 : 0.8);
    x.set(0);
    y.set(0);
  };

  return (
    <div className={`preview-svg-wrapper ${isLarge ? 'large' : ''}`} ref={containerRef}>
      <svg 
        viewBox="0 0 800 800" 
        width="100%" 
        height="100%" 
        xmlns="http://www.w3.org/2000/svg"
        style={{ overflow: 'hidden', cursor: 'grab' }}
      >
        <defs>
          <filter id="shadow-preview" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="1" dy="2" stdDeviation="2" floodOpacity="0.1" />
          </filter>
          <path id="arc-inner-p" d="M -28 -133 L 28 -133 L 36 -167 L -36 -167 Z" />
          <path id="arc-middle-p" d="M -34 -208 L 34 -208 L 40 -242 L -40 -242 Z" />
          <path id="arc-outer-p" d="M -37 -283 L 37 -283 L 43 -317 L -43 -317 Z" />
          <rect id="arc-special-p" x="-50" y="-15" width="100" height="30" rx="4" />
        </defs>
        
        <g transform="translate(400, 400)">
          <motion.g 
            drag 
            dragElastic={0.05}
            dragMomentum={true}
            style={{ x, y, scale: zoom }}
            onDragStart={() => {
              if (containerRef.current) containerRef.current.style.cursor = 'grabbing';
            }}
            onDragEnd={() => {
              if (containerRef.current) containerRef.current.style.cursor = 'grab';
            }}
            className="preview-svg-content"
          >
            {/* Center Circle */}
            <circle r="115" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1" />
            <text textAnchor="middle" y="5" fill="#94a3b8" fontSize="12" fontWeight="700" style={{ pointerEvents: 'none' }}>CENTRO</text>
            
            {/* Board Tiles */}
            {editingConfig.tiles.filter(t => t.ring !== 'center').map((tile) => {
              const actualIdx = editingConfig.tiles.findIndex(t => t.id === tile.id);
              const isSpecial = tile.ring === 'special';
              
              let tileTransform = `rotate(${tile.angle})`;
              if (isSpecial) {
                 let tx = 0, ty = 0;
                 if (tile.id === 's4') ty = -305;
                 if (tile.id === 's1') tx = 310;
                 if (tile.id === 's2') ty = 320;
                 if (tile.id === 's3') tx = -310;
                 tileTransform = `translate(${tx}, ${ty})`;
              }

              return (
                <g 
                  key={tile.id} 
                  transform={tileTransform} 
                  className={`preview-tile-group ${selectedTileIndex === actualIdx ? 'selected' : ''} ${isSpecial ? 'special-preview' : ''}`}
                  style={{ cursor: 'pointer' }}
                  onClick={(e) => {
                    // Click only fires if drag distance was minimal
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
                    stroke={selectedTileIndex === actualIdx ? '#6366f1' : 'rgba(0,0,0,0.05)'} 
                    strokeWidth={selectedTileIndex === actualIdx ? "3" : "1"} 
                    strokeLinejoin="round" 
                    filter="url(#shadow-preview)" 
                  />
                  {tile.label ? (
                    <g style={{ pointerEvents: 'none' }}>
                      {tile.label.split('\n').map((line, i, arr) => (
                        <text 
                          key={i}
                          x="0" 
                          y={isSpecial ? (-(arr.length-1)*5 + i*10) : (tile.ring === 'inner' ? -145 : (tile.ring === 'middle' ? -220 : -295)) + (i*8)} 
                          textAnchor="middle" 
                          fill={isSpecial ? "#333" : "#FFF"} 
                          fontSize={isSpecial ? "10" : "8"} 
                          fontWeight="bold"
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
                </g>
              );
            })}
          </motion.g>
        </g>
      </svg>
      
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
