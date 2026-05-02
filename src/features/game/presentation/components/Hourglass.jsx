import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const STATIC_PARTICLES = Array.from({ length: 6 }).map((_, i) => ({
  id: i,
  delay: i * 0.15,
}));

const Hourglass = ({ progress = 0.5, isCritical = false, onClick, activePlayerIndex }) => {
  const [rotation, setRotation] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const prevPlayerRef = useRef(activePlayerIndex);

  // Detectar mudança de turno para girar a ampulheta 2D (Eixo Z)
  useEffect(() => {
    if (activePlayerIndex !== undefined && activePlayerIndex !== prevPlayerRef.current) {
      setRotation(prev => prev + 180);
      setIsFlipping(true);
      prevPlayerRef.current = activePlayerIndex;

      const timer = setTimeout(() => {
        setIsFlipping(false);
      }, 600); // Duração do flip
      return () => clearTimeout(timer);
    }
  }, [activePlayerIndex]);

  // Garantir que o progresso seja um número válido entre 0 e 1
  const safeProgress = Math.max(0, Math.min(1, Number(progress) || 0));

  // Lógica para manter a areia no mesmo lugar físico durante e após o giro de 180 graus
  const isUpsideDown = Math.round(rotation / 180) % 2 !== 0;
  const visualSafeProgress = isUpsideDown ? (1 - safeProgress) : safeProgress;

  return (
    <motion.div
      className={`hourglass-wrapper ${isCritical && !isFlipping ? 'animate-shake' : ''}`}
      style={{
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'transparent',
      }}
      onClick={onClick}
      animate={{
        rotate: rotation
      }}
      transition={{
        rotate: { duration: 0.6, ease: "easeInOut" }
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>

        {/* Top Extenssion / Base */}
        <div style={{ width: '42px', height: '4px', background: '#1e293b', borderRadius: '2px', zIndex: 10 }} />

        {/* Vidro Superior (Triângulo apontando para baixo) */}
        <div style={{
          width: '40px', height: '31px',
          clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
          overflow: 'hidden',
          position: 'relative',
          background: 'rgba(255,255,255,0.2)', // Vidro Transparente/Fosco
          backdropFilter: 'blur(3px)',
        }}>
          {/* Areia Superior */}
          <motion.div style={{
            position: 'absolute',
            left: 0,
            right: 0,
            ...(isUpsideDown ? { top: 0 } : { bottom: 0 }),
            background: 'linear-gradient(to bottom, #FDE68A, #F59E0B)',
            height: `${visualSafeProgress * 100}%`
          }} transition={{ duration: isFlipping ? 0 : 0.3 }} />
        </div>

        {/* Fio e Partículas - Renderizados quando NÃO está girando */}
        <AnimatePresence>
          {!isFlipping && safeProgress > 0 && safeProgress < 1 && (
            <motion.div
              initial={{ opacity: 0, rotate: isUpsideDown ? 180 : 0 }}
              animate={{ opacity: 1, rotate: isUpsideDown ? 180 : 0 }}
              exit={{ opacity: 0 }}
              style={{ 
                position: 'absolute', 
                top: '50%', 
                left: '50%', 
                x: '-50%', 
                transformOrigin: 'top center',
                zIndex: 0, 
                height: '31px' 
              }}
            >
              {/* Linha contínua do fio */}
              <div style={{
                position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
                width: '2px', height: '100%',
                background: '#F59E0B',
                boxShadow: '0 0 4px #F59E0B',
                opacity: 0.8
              }} />

              {/* Partículas caindo */}
              {STATIC_PARTICLES.map(p => (
                <motion.div
                  key={p.id}
                  style={{
                    position: 'absolute', left: '50%', marginLeft: '-1.5px',
                    width: '3px', height: '3px', borderRadius: '50%',
                    background: '#FDE68A'
                  }}
                  animate={{
                    y: [0, 28],
                    opacity: [0, 1, 0]
                  }}
                  transition={{
                    duration: 0.5,
                    repeat: Infinity,
                    delay: p.delay,
                    ease: "linear"
                  }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Vidro Inferior (Triângulo apontando para cima) */}
        <div style={{
          width: '40px', height: '31px',
          clipPath: 'polygon(50% 0, 100% 100%, 0 100%)',
          overflow: 'hidden',
          position: 'relative',
          background: 'rgba(255,255,255,0.2)', // Vidro Transparente/Fosco
          backdropFilter: 'blur(3px)',
        }}>
          {/* Areia Inferior */}
          <motion.div style={{
            position: 'absolute',
            left: 0,
            right: 0,
            ...(isUpsideDown ? { top: 0 } : { bottom: 0 }),
            background: 'linear-gradient(to bottom, #F59E0B, #D97706)',
            height: `${(1 - visualSafeProgress) * 100}%`
          }} transition={{ duration: isFlipping ? 0 : 0.3 }} />
        </div>

        {/* Bottom Extenssion / Base */}
        <div style={{ width: '42px', height: '4px', background: '#1e293b', borderRadius: '2px', zIndex: 10 }} />

      </div>
    </motion.div>
  );
};

export default Hourglass;
