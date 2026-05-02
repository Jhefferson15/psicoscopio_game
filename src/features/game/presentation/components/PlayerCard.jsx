import { motion } from 'framer-motion';
import { User, Award, TrendingUp, Clock } from 'lucide-react';
import { useGame } from '../state/useGame';

const PlayerCard = ({ player, isActive, onClick }) => {
  const { roomParticipants, isOnline: isGameOnline } = useGame();
  const participant = roomParticipants ? roomParticipants[player.id] : null;
  const isPlayerOnline = participant ? participant.isOnline : true; // Default true para modo offline

  return (
    <motion.div 
      className={`player-card ${isActive ? 'active' : ''}`}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ scale: 1.05 }}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div className="player-avatar-relative">
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
        {isGameOnline && (
          <div className={`presence-indicator-modern ${isPlayerOnline ? 'is-online' : 'is-offline'}`} 
               title={isPlayerOnline ? 'Online' : 'Offline'}>
          </div>
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
