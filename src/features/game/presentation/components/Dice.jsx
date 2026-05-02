import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../state/useGame';
import { Dices, User } from 'lucide-react';
import './Dice.css'; // Vamos criar os estilos na próxima etapa

const Dice = () => {
  const { rollDice, isMoving, isRolling, isOnline, currentPlayerIndex, myPlayerIndex, players } = useGame();
  
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [showTooltip, setShowTooltip] = useState(false);

  // Escuta o movimento do mouse no window para o tooltip flutuante
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (showTooltip) {
        setMousePos({ x: e.clientX, y: e.clientY });
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [showTooltip]);

  if (!players || players.length === 0) return null;

  return (
    <div className="dice-container">
      <div className="all-dice-wrapper">
        {players.map((player, index) => {
          const isThisPlayerTurn = currentPlayerIndex === index;
          const isMyTurn = !isOnline || currentPlayerIndex === myPlayerIndex;
          
          const canRollThisDice = isThisPlayerTurn && isMyTurn && !isMoving && !isRolling;

          return (
            <div 
              key={player.id}
              className={`player-dice-wrapper ${isThisPlayerTurn ? 'active-turn' : 'inactive-turn'}`}
              onMouseEnter={() => {
                if (!isMyTurn) setShowTooltip(true);
              }}
              onMouseLeave={() => setShowTooltip(false)}
            >
              <div className="player-dice-badge" style={{ backgroundColor: player.color }}>
                 <User size={12} color="white" />
              </div>

              <motion.button
                whileHover={canRollThisDice ? { scale: 1.05, y: -2 } : {}}
                whileTap={canRollThisDice ? { scale: 0.95 } : {}}
                className={`dice-button-multi ${!isThisPlayerTurn ? 'grayscale' : ''} ${!canRollThisDice ? 'not-allowed' : ''}`}
                onClick={() => {
                  if (canRollThisDice) rollDice();
                }}
                disabled={!canRollThisDice}
                animate={isRolling && isThisPlayerTurn ? { 
                  x: [0, -5, 5, -5, 5, 0],
                  rotate: [0, -5, 5, -5, 5, 0]
                } : { x: 0, rotate: 0 }}
                transition={isRolling && isThisPlayerTurn ? { 
                  repeat: Infinity, 
                  duration: 0.1 
                } : { duration: 0.2 }}
                style={{ 
                  borderColor: isThisPlayerTurn ? player.color : 'rgba(255,255,255,0.2)',
                  filter: !isThisPlayerTurn ? 'grayscale(100%) opacity(0.5)' : 'none'
                }}
              >
                <div className="dice-icon-wrapper">
                  {isRolling && isThisPlayerTurn ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 0.5, ease: "linear" }}
                      style={{ display: 'flex', alignItems: 'center', justifyItems: 'center' }}
                    >
                      <Dices size={isThisPlayerTurn ? 32 : 24} color={player.color} />
                    </motion.div>
                  ) : player.lastRoll ? (
                    <motion.span 
                      initial={{ scale: 0.5, opacity: 0, rotate: -20 }}
                      animate={{ scale: 1, opacity: 1, rotate: 0 }}
                      transition={{ type: "spring", damping: 12 }}
                      className="dice-number-large" 
                      style={{ color: player.color }}
                    >
                      {player.lastRoll}
                    </motion.span>
                  ) : (
                    <Dices size={isThisPlayerTurn ? 32 : 24} color={player.color} />
                  )}
                </div>
              </motion.button>
              
              {/* Nome do jogador abaixo do dado */}
              <span className="dice-player-name" style={{ color: isThisPlayerTurn ? 'white' : '#888' }}>
                {player.name.split(' ')[0]}
              </span>
            </div>
          );
        })}
      </div>

      {/* Tooltip seguindo o mouse */}
      {showTooltip && (
        <div 
          className="dice-mouse-tooltip"
          style={{ left: mousePos.x + 15, top: mousePos.y + 15 }}
        >
          Vez de {players[currentPlayerIndex]?.name}
        </div>
      )}
    </div>
  );
};

export default Dice;
