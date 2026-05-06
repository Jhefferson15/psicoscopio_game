import { motion, useTransform } from 'framer-motion';
import { HelpCircle } from 'lucide-react';
import { BOARD_LAYOUT, SPECIAL_ICONS } from './board_constants';

/**
 * SpecialTile component for the "white cards" that orbit the board
 */
const SpecialTile = ({ tile, boardRotation, onClick, isReadOnly }) => {
  // Base coordinates at 0 deg rotation (relative to center)
  let rx = 0, ry = 0;
  const radius = BOARD_LAYOUT.radii.special;
  
  if (tile.id === 's4') ry = -radius;      // TOP (0)
  else if (tile.id === 's1') rx = radius;   // RIGHT (90)
  else if (tile.id === 's2') ry = radius;   // BOTTOM (180)
  else if (tile.id === 's3') rx = -radius;  // LEFT (270)

  // Calculate orbiting position based on board rotation
  // NOTE: boardRotation MUST be a Framer Motion 'MotionValue'
  const x = useTransform(boardRotation, (r) => {
    const rad = r * Math.PI / 180;
    return rx * Math.cos(rad) - ry * Math.sin(rad);
  });
  const y = useTransform(boardRotation, (r) => {
    const rad = r * Math.PI / 180;
    return rx * Math.sin(rad) + ry * Math.cos(rad);
  });

  const EffectIcon = SPECIAL_ICONS[tile.action] || HelpCircle;

  return (
    <motion.div
      className="special-card-html"
      style={{
        x,
        y,
        left: '50%',
        top: '50%',
        width: BOARD_LAYOUT.specialSize,
        height: BOARD_LAYOUT.specialSize,
        translateX: '-50%',
        translateY: '-50%',
        cursor: isReadOnly ? 'default' : 'help'
      }}
      onClick={onClick}
    >
      <div className="special-card-icon-container">
        <EffectIcon size={32} strokeWidth={2.5} color="#4885CE" />
      </div>
      <div className="special-card-text">
        {tile.label.split('\n').map((line, i) => (
          <div key={i}>{line}</div>
        ))}
      </div>
    </motion.div>
  );
};

export default SpecialTile;
