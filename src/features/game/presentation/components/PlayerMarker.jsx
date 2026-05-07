import { motion, useMotionValue, useTransform, animate, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import { User } from 'lucide-react';

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

  const x = useTransform(
    [boardRotation, visualAngle],
    ([latestBoardRot, latestAngle]) => {
      const totalDeg = (latestBoardRot + latestAngle + slotOffset - 90) % 360;
      const rad = totalDeg * Math.PI / 180;
      return (r + radialOffset) * Math.cos(rad);
    }
  );

  const y = useTransform(
    [boardRotation, visualAngle],
    ([latestBoardRot, latestAngle]) => {
      const totalDeg = (latestBoardRot + latestAngle + slotOffset - 90) % 360;
      const rad = totalDeg * Math.PI / 180;
      return (r + radialOffset) * Math.sin(rad);
    }
  );

  return (
    <motion.div
      className="player-marker"
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

export default PlayerMarker;
