import React, { useMemo, useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const Hourglass = ({ progress = 0.5, isCritical = false, onClick }) => {
  const [rotation, setRotation] = useState(0);
  const prevProgressRef = useRef(progress);
  
  // Detectar reset de tempo (quando o progresso aumenta subitamente)
  useEffect(() => {
    if (progress > prevProgressRef.current + 0.5) {
      // O tempo foi reiniciado, hora de girar!
      setRotation(prev => prev + 180);
    }
    prevProgressRef.current = progress;
  }, [progress]);

  // Garantir que o progresso seja um número válido entre 0 e 1
  const safeProgress = Math.max(0, Math.min(1, Number(progress) || 0));
  
  // Gerar partículas de areia fixas para o efeito de "fio"
  const particles = useMemo(() => 
    Array.from({ length: 12 }).map((_, i) => ({
      id: i,
      delay: i * 0.1,
      x: 50 + (Math.random() * 4 - 2)
    })), []);

  return (
    <motion.div 
      className={`hourglass-wrapper ${isCritical ? 'animate-shake' : ''}`}
      style={{ 
        cursor: 'pointer', 
        display: 'inline-flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'transparent',
        overflow: 'visible' 
      }}
      onClick={onClick}
      animate={{ 
        rotate: rotation,
        scale: isCritical ? [1, 1.1, 1] : 1
      }}
      transition={{ 
        rotate: { duration: 1.2, ease: "backInOut" },
        scale: { duration: 0.5, repeat: Infinity }
      }}
    >
      <svg 
        viewBox="-10 -10 120 180" 
        width="60" 
        height="90" 
        xmlns="http://www.w3.org/2000/svg" 
        className="hourglass-premium"
        style={{ overflow: 'visible', filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.2))' }}
      >
        <defs>
          <linearGradient id="sand-gradient-v4" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FDE68A" />
            <stop offset="50%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>
          
          <clipPath id="top-glass-v4">
            <path d="M 15 15 L 85 15 L 50 80 Z" />
          </clipPath>
          <clipPath id="bottom-glass-v4">
            <path d="M 50 80 L 15 145 L 85 145 Z" />
          </clipPath>

          <filter id="glow-v4">
            <feGaussianBlur stdDeviation="1.5" result="blur"/>
            <feMerge>
              <feMergeNode in="blur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Vidro de Fundo */}
        <path d="M 15 15 L 85 15 L 50 80 L 15 145 L 85 145 Z" fill="rgba(255,255,255,0.05)" />
        
        {/* Areia Superior - Diminuindo */}
        <motion.rect
          x="15"
          y={15 + (1 - safeProgress) * 65}
          width="70"
          height="65"
          fill="url(#sand-gradient-v4)"
          clipPath="url(#top-glass-v4)"
        />
        
        {/* Areia Inferior - Aumentando */}
        <motion.rect
          x="15"
          y={145 - ((1 - safeProgress) * 65)}
          width="70"
          height="65"
          fill="url(#sand-gradient-v4)"
          clipPath="url(#bottom-glass-v4)"
        />
        
        {/* Partículas de Areia Caindo */}
        {safeProgress > 0 && safeProgress < 1 && particles.map(p => (
          <motion.circle
            key={p.id}
            cx={p.x}
            cy="80"
            r="1.2"
            fill="#F59E0B"
            animate={{ 
              y: [0, 65],
              opacity: [0, 1, 0]
            }}
            transition={{ 
              duration: 0.6, 
              repeat: Infinity, 
              delay: p.delay,
              ease: "linear"
            }}
          />
        ))}

        {/* Fio de Areia */}
        {safeProgress > 0 && safeProgress < 1 && (
          <motion.line 
            x1="50" y1="80" x2="50" y2="145" 
            stroke="#F59E0B" 
            strokeWidth="2" 
            strokeDasharray="4,4"
            filter="url(#glow-v4)"
            animate={{ strokeDashoffset: [0, -20] }}
            transition={{ repeat: Infinity, duration: 0.3, ease: "linear" }}
          />
        )}

        {/* Contorno do Vidro */}
        <path 
          d="M 15 15 L 85 15 L 50 80 L 15 145 L 85 145" 
          fill="none" 
          stroke="rgba(255,255,255,0.3)" 
          strokeWidth="2" 
          strokeLinejoin="round" 
        />
        
        {/* Estrutura Externa */}
        <rect x="5" y="5" width="90" height="10" rx="3" fill="#1e293b" />
        <rect x="5" y="145" width="90" height="10" rx="3" fill="#1e293b" />
        <line x1="12" y1="15" x2="12" y2="145" stroke="#1e293b" strokeWidth="4" strokeLinecap="round" />
        <line x1="88" y1="15" x2="88" y2="145" stroke="#1e293b" strokeWidth="4" strokeLinecap="round" />
      </svg>
    </motion.div>
  );
};

export default Hourglass;
