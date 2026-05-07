
import { 
  UserRound, 
  Brain, 
  ArrowLeftRight, 
  Share2, 
  Plus, 
  Zap, 
  Users2, 
  Book, 
  PenTool,
  CircleArrowUp,
  CircleArrowDown,
  FastForward,
  Rewind
} from 'lucide-react';

/**
 * Base for vertical cards to ensure consistency.
 * Added internal lines to make it look like a physical card even at small sizes.
 */
const CardBase = ({ size, color, children, rotation = 0, style = {} }) => {
  const cardW = size * 0.7;
  const cardH = size * 0.95;
  
  return (
    <div style={{ 
      width: cardW, 
      height: cardH, 
      border: `1.5px solid ${color}`, 
      borderRadius: 2,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      transform: `rotate(${rotation}deg)`,
      position: 'relative',
      background: 'transparent',
      ...style
    }}>
      {/* Decorative lines representing card content/header */}
      <div style={{ position: 'absolute', top: '20%', width: '60%', height: '1.2px', background: color, opacity: 0.6 }} />
      <div style={{ position: 'absolute', top: '40%', width: '75%', height: '0.8px', background: color, opacity: 0.4 }} />
      <div style={{ position: 'absolute', top: '55%', width: '75%', height: '0.8px', background: color, opacity: 0.4 }} />
      {children}
    </div>
  );
};

export const DrawCardsIcon = ({ size = 24, color = 'currentColor' }) => (
  <div style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    {/* Bottom card */}
    <CardBase size={size * 0.9} color={color} rotation={0} style={{ position: 'absolute', transform: 'translate(-12%, -5%) rotate(0deg)' }} />
    {/* Top card - 30 degrees tilt relative to the first (if first is 0, this is 30) */}
    <CardBase size={size * 0.9} color={color} rotation={30} style={{ position: 'absolute', transform: 'translate(12%, 5%) rotate(30deg)' }} />
  </div>
);

export const ShareCardIcon = ({ size = 24, color = 'currentColor' }) => (
  <div style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <CardBase size={size} color={color} />
    <div style={{ position: 'absolute', bottom: -1, right: -2 }}>
      <Share2 size={size * 0.5} color={color} strokeWidth={3} />
    </div>
  </div>
);

export const CreateCardIcon = ({ size = 24, color = 'currentColor' }) => (
  <div style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <CardBase size={size} color={color} />
    <div style={{ position: 'absolute', bottom: -1, right: -2 }}>
      <Plus size={size * 0.6} color={color} strokeWidth={4} />
    </div>
  </div>
);

export const TeamChallengeIcon = ({ size = 24, color = 'currentColor' }) => (
  <div style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <Users2 size={size * 0.95} color={color} strokeWidth={2} />
    <div style={{ position: 'absolute', bottom: -3, right: 0 }}>
      <Zap size={size * 0.55} color={color} fill={color === 'white' ? color : 'currentColor'} strokeWidth={1} />
    </div>
  </div>
);

export const WriteDiaryIcon = ({ size = 24, color = 'currentColor' }) => (
  <div style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <Book size={size * 0.9} color={color} />
    <div style={{ position: 'absolute', bottom: -1, right: -1 }}>
      <PenTool size={size * 0.45} color={color} />
    </div>
  </div>
);

export const SwapPlayersIcon = ({ size = 24, color = 'currentColor' }) => {
  const subSize = size * 0.4;
  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <ArrowLeftRight size={size} color={color} strokeWidth={2.5} />
      {/* Player silhouette on one side of the exchange */}
      <div style={{ position: 'absolute', top: -1, left: -1 }}>
        <UserRound size={subSize} color={color} strokeWidth={3} />
      </div>
      {/* Player silhouette on the other side of the exchange */}
      <div style={{ position: 'absolute', bottom: -1, right: -1 }}>
        <UserRound size={subSize} color={color} strokeWidth={3} />
      </div>
    </div>
  );
};

export const ReflexivePauseIcon = ({ size = 24, color = 'currentColor' }) => (
  <div style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <UserRound size={size} color={color} strokeWidth={2} />
    <div style={{ position: 'absolute', bottom: 0, right: 0 }}>
      <Brain size={size * 0.5} color={color} strokeWidth={2.5} />
    </div>
  </div>
);

export const Move2Icon = ({ size = 24, color = 'currentColor', ...props }) => (
  <FastForward size={size} color={color} strokeWidth={3} {...props} />
);

export const Back2Icon = ({ size = 24, color = 'currentColor', ...props }) => (
  <Rewind size={size} color={color} strokeWidth={3} {...props} />
);

export const MoveInnerIcon = ({ size = 24, color = 'currentColor', ...props }) => (
  <CircleArrowUp size={size} color={color} strokeWidth={2.5} {...props} />
);

export const MoveOuterIcon = ({ size = 24, color = 'currentColor', ...props }) => (
  <CircleArrowDown size={size} color={color} strokeWidth={2.5} {...props} />
);

