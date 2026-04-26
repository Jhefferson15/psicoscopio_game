import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../state/GameContext';
import { Dices } from 'lucide-react';

const DiceArea = () => {
  const { rollDice, lastDiceRoll, isMoving } = useGame();

  return (
    <div className="dice-area">
      <div className="dice-shaker">
        <AnimatePresence mode="wait">
          {lastDiceRoll > 0 && !isMoving && (
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
          className={`dice-roll-btn ${isMoving ? 'disabled' : ''}`}
          onClick={rollDice}
          disabled={isMoving}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          animate={isMoving ? { rotate: [0, -10, 10, -10, 10, 0] } : {}}
          transition={{ repeat: isMoving ? Infinity : 0, duration: 0.5 }}
        >
          <Dices size={32} />
          <span>Lançar Dados</span>
        </motion.button>
      </div>
      
      <div className="dice-tray-shadow"></div>
    </div>
  );
};

export default DiceArea;
