import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../state/useGame';
import { Dices } from 'lucide-react';

const DiceArea = () => {
  const { rollDice, lastDiceRoll, isMoving, isRolling } = useGame();

  return (
    <div className="dice-area">
      <div className="dice-shaker">
        <AnimatePresence mode="wait">
          {lastDiceRoll > 0 && !isRolling && (
            <motion.div
              key={lastDiceRoll}
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, opacity: 0 }}
              className="dice-result-large"
            >
              {lastDiceRoll}
            </motion.div>
          )}
        </AnimatePresence>
        
        <motion.button
          className={`dice-roll-btn ${isMoving || isRolling ? 'disabled' : ''}`}
          onClick={rollDice}
          disabled={isMoving || isRolling}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          animate={isRolling ? { rotate: [0, -10, 10, -10, 10, 0] } : {}}
          transition={{ repeat: isRolling ? Infinity : 0, duration: 0.5 }}
        >
          <Dices size={32} />
          <span>{isRolling ? 'Rolando...' : 'Lançar Dados'}</span>
        </motion.button>
      </div>
      
      <div className="dice-tray-shadow"></div>
    </div>
  );
};

export default DiceArea;
