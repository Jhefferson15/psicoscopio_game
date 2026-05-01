import { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { Monitor, Tablet, Smartphone, ChevronRight } from 'lucide-react';
import './MobileWarning.css';

const MobileWarning = ({ onConfirm }) => {
  const [isVertical, setIsVertical] = useState(false);
  const x = useMotionValue(0);
  const opacity = useTransform(x, [0, 200], [1, 0]);
  const scale = useTransform(x, [0, 200], [1, 0.8]);

  useEffect(() => {
    const checkOrientation = () => {
      setIsVertical(window.innerHeight > window.innerWidth && window.innerWidth < 768);
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    return () => window.removeEventListener('resize', checkOrientation);
  }, []);

  const handleDragEnd = (_, info) => {
    if (info.offset.x > 150) {
      onConfirm();
    }
  };

  if (!isVertical) return null;

  return (
    <motion.div 
      className="mobile-warning-overlay"
      style={{ opacity, scale }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="warning-content">
        <div className="warning-icons">
          <div className="icon-wrapper desktop">
            <Monitor size={32} />
          </div>
          <div className="icon-wrapper tablet">
            <Tablet size={24} />
          </div>
          <div className="icon-wrapper mobile disabled">
            <Smartphone size={16} />
          </div>
        </div>
        
        <h2>Experiência Otimizada</h2>
        <p>
          O <strong>Psicoscópio</strong> foi planejado para telas maiores. 
          A experiência mobile está sendo preparada.
        </p>

        <div className="slider-container">
          <div className="slider-track">
            <span>Deslize para prosseguir</span>
          </div>
          <motion.div 
            className="slider-handle"
            drag="x"
            dragConstraints={{ left: 0, right: 220 }}
            onDragEnd={handleDragEnd}
            style={{ x }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ChevronRight size={24} />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default MobileWarning;
