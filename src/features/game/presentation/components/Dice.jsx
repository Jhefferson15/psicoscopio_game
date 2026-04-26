import React from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../state/GameContext';
import { Dices } from 'lucide-react';

const Dice = () => {
  const { rollDice, isMoving, lastDiceRoll } = useGame();

  return (
    <div className="dice-container">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`dice-button ${isMoving ? 'disabled' : ''}`}
        onClick={rollDice}
        disabled={isMoving}
      >
        <Dices size={32} />
        <span>Rolar Dado</span>
      </motion.button>
      
      {lastDiceRoll > 0 && (
        <motion.div 
          key={lastDiceRoll}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          className="dice-result"
        >
          {lastDiceRoll}
        </motion.div>
      )}
    </div>
  );
};

export default Dice;
