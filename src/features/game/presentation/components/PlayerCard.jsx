import React from 'react';
import { motion } from 'framer-motion';
import { User, Award, TrendingUp, Clock } from 'lucide-react';

const PlayerCard = ({ player, isActive }) => {
  return (
    <motion.div 
      className={`player-card ${isActive ? 'active' : ''}`}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ scale: 1.05 }}
    >
      <div className="player-avatar" style={{ backgroundColor: player.color }}>
        <User size={32} color="white" />
        {isActive && (
          <motion.div 
            className="active-indicator"
            layoutId="active-indicator"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        )}
      </div>
      
      <div className="player-details">
        <h4 className="player-name">{player.name}</h4>
        <div className="player-stats">
          <div className="stat-item">
            <Award size={14} />
            <span>Pos: {player.position}</span>
          </div>
          <div className={`stat-item ${player.timeLeft < 20 ? 'text-critical' : ''}`}>
            <Clock size={14} />
            <span>{Math.floor(player.timeLeft / 60)}:{(player.timeLeft % 60).toString().padStart(2, '0')}</span>
          </div>
          <div className="stat-item">
            <TrendingUp size={14} />
            <span>Nível: {Math.floor(player.position / 5) + 1}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PlayerCard;
