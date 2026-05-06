import { motion, useMotionValue, animate, AnimatePresence } from 'framer-motion';
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

  // Combined rotation (board + player position)
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  useEffect(() => {
    const unsubscribe = boardRotation.on("change", (latestBoardRot) => {
      const currentAngle = visualAngle.get();
      const totalDeg = (latestBoardRot + currentAngle + slotOffset) % 360;
      const rad = totalDeg * Math.PI / 180;
      
      const finalR = r + radialOffset;
      x.set(finalR * Math.cos(rad));
      y.set(finalR * Math.sin(rad));
    });
    
    // Also update on visualAngle changes
    const unsubscribeAngle = visualAngle.on("change", (latestAngle) => {
      const currentBoardRot = boardRotation.get();
      const totalDeg = (currentBoardRot + latestAngle + slotOffset) % 360;
      const rad = totalDeg * Math.PI / 180;
      
      const finalR = r + radialOffset;
      x.set(finalR * Math.cos(rad));
      y.set(finalR * Math.sin(rad));
    });

    return () => {
      unsubscribe();
      unsubscribeAngle();
    };
  }, [boardRotation, visualAngle, r, slotOffset, radialOffset, x, y]);

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
