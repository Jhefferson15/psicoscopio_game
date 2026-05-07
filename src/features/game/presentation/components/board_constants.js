import { 
  Brain,
  Zap,
  Lightbulb,
  Eye,
  RefreshCw,
  Target,
  Puzzle,
  MessageCircle,
  Sliders,
  Info,
  Sparkles,
  Award,
  Palette
} from 'lucide-react';

import {
  ReflexivePauseIcon,
  ShareCardIcon,
  CreateCardIcon,
  TeamChallengeIcon,
  WriteDiaryIcon,
  SwapPlayersIcon,
  DrawCardsIcon,
  MoveInnerIcon,
  MoveOuterIcon,
  Move2Icon,
  Back2Icon
} from './CustomGameIcons';

export const SPECIAL_ICONS = {
  'MOVE_2': Move2Icon,
  'BACK_2': Back2Icon,
  'TEAM_CHALLENGE': TeamChallengeIcon,
  'SWAP_PLACE': SwapPlayersIcon,
  'WRITE_DIARY': WriteDiaryIcon,
  'CREATE_CARD': CreateCardIcon,
  'SHARE_CARD': ShareCardIcon,
  'DRAW_2': DrawCardsIcon,
  'SKIP_TURN': ReflexivePauseIcon,
  'MOVE_INNER': MoveInnerIcon,
  'MOVE_OUTER': MoveOuterIcon
};

export const TILE_ICONS = {
  brain: Brain,
  reflexao: Brain,
  desafio: Zap,
  memoria: Puzzle,
  especial: Zap,
  bulb: Lightbulb,
  eye: Eye,
  cycle: RefreshCw,
  target: Target,
  puzzle: Puzzle,
  chat: MessageCircle,
  slider: Sliders,
  center: Info,
  experiencia: Award,
  sorte: Sparkles,
  custom_memoria: Puzzle,
  custom_reflexao: Brain,
  custom_desafio: Zap,
  custom_experiencia: Award,
  custom_sorte: Sparkles,
  custom_card: Palette,
  ...SPECIAL_ICONS
};

export const BOARD_LAYOUT = {
  radii: {
    inner: 150,
    middle: 250,
    outer: 350,
    special: 350
  },
  sizes: {
    inner:  { w: 109, h: 54 }, 
    middle: { w: 112, h: 54 },
    outer:  { w: 102, h: 54 }
  },
  specialSize: 90,
  centerSize: 180
};
