import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../state/GameContext';
import { Dices } from 'lucide-react';

const Dice = () => {
  const { rollDice, isMoving, lastDiceRoll } = useGame();

  return (
    <div className="dice-container">
      <motion.button
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
        className={`dice-button ${isMoving ? 'disabled' : ''}`}
        onClick={rollDice}
        disabled={isMoving}
        animate={isMoving ? { 
          x: [0, -2, 2, -2, 2, 0],
          transition: { repeat: Infinity, duration: 0.15 }
        } : {}}
      >
        <motion.div
          animate={isMoving ? { rotate: 360 } : {}}
          transition={{ repeat: Infinity, duration: 0.5, ease: "linear" }}
        >
          <Dices size={32} />
        </motion.div>
        <span>{isMoving ? 'Rolando...' : 'Rolar Dado'}</span>
      </motion.button>
      
      <AnimatePresence mode="wait">
        {lastDiceRoll > 0 && !isMoving && (
          <motion.div 
            key={lastDiceRoll}
            initial={{ scale: 0, rotate: -180, opacity: 0 }}
            animate={{ 
              scale: [0, 1.2, 1], 
              rotate: 0, 
              opacity: 1,
              boxShadow: "0 0 30px rgba(216, 75, 66, 0.4)"
            }}
            exit={{ scale: 0, opacity: 0 }}
            className="dice-result"
          >
            {lastDiceRoll}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dice;
