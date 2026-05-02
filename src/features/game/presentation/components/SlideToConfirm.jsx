import React, { useState, useRef, useEffect } from 'react';
import { motion, useAnimation, useMotionValue, useTransform } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';
import './SlideToConfirm.css';

const SlideToConfirm = ({ onConfirm, label = "Deslize para confirmar", successLabel = "Confirmado" }) => {
  const [isConfirmed, setIsConfirmed] = useState(false);
  const constraintsRef = useRef(null);
  const x = useMotionValue(0);
  const controls = useAnimation();
  
  // Calcula a largura disponível para o slide
  const [containerWidth, setContainerWidth] = useState(0);
  const handleRef = (el) => {
    if (el) {
      setContainerWidth(el.offsetWidth);
    }
  };

  const backgroundOpacity = useTransform(x, [0, containerWidth - 60], [0.1, 1]);
  const iconScale = useTransform(x, [0, containerWidth - 60], [1, 1.2]);

  const handleDragEnd = async (event, info) => {
    const threshold = containerWidth - 70;
    if (info.point.x - constraintsRef.current.getBoundingClientRect().left > threshold) {
      setIsConfirmed(true);
      await controls.start({ x: containerWidth - 64 });
      if (onConfirm) {
        setTimeout(onConfirm, 300);
      }
    } else {
      controls.start({ x: 0 });
    }
  };

  return (
    <div className={`slide-confirm-container ${isConfirmed ? 'confirmed' : ''}`} ref={handleRef}>
      <motion.div 
        className="slide-confirm-bg" 
        style={{ opacity: backgroundOpacity }}
      />
      
      <div className="slide-confirm-label" style={{ opacity: isConfirmed ? 0 : 1 }}>
        {label}
      </div>

      <div className="slide-confirm-track" ref={constraintsRef}>
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: containerWidth - 64 }}
          dragElastic={0.1}
          dragMomentum={false}
          onDragEnd={handleDragEnd}
          animate={controls}
          style={{ x }}
          className="slide-confirm-handle"
        >
          <motion.div style={{ scale: iconScale }} className="handle-icon">
            {isConfirmed ? <Check size={24} /> : <ArrowRight size={24} />}
          </motion.div>
        </motion.div>
      </div>

      {isConfirmed && (
        <motion.div 
          className="slide-confirm-success"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {successLabel}
        </motion.div>
      )}
    </div>
  );
};

export default SlideToConfirm;
