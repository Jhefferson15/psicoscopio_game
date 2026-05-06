import { 
  FastForward, 
  Undo, 
  Users, 
  ArrowLeftRight, 
  Book, 
  PlusCircle, 
  Gift, 
  Layers, 
  UserX, 
  ArrowUpCircle, 
  ArrowDownCircle,
  Brain,
  HelpCircle,
  Zap,
  Lightbulb,
  Eye,
  RefreshCw,
  Target,
  Puzzle,
  MessageCircle,
  Sliders,
  Info,
  Sparkles
} from 'lucide-react';

export const SPECIAL_ICONS = {
  'MOVE_2': FastForward,
  'BACK_2': Undo,
  'TEAM_CHALLENGE': Users,
  'SWAP_PLACE': ArrowLeftRight,
  'WRITE_DIARY': Book,
  'CREATE_CARD': PlusCircle,
  'SHARE_CARD': Gift,
  'DRAW_2': Layers,
  'SKIP_TURN': UserX,
  'MOVE_OUTER': ArrowUpCircle,
  'MOVE_INNER': ArrowDownCircle
};

export const TILE_ICONS = {
  brain: Brain,
  reflexao: HelpCircle,
  desafio: Zap,
  memoria: Brain,
  especial: Zap,
  bulb: Lightbulb,
  eye: Eye,
  cycle: RefreshCw,
  target: Target,
  puzzle: Puzzle,
  chat: MessageCircle,
  slider: Sliders,
  center: Info,
  experiencia: Sparkles,
  sorte: Sparkles,
  custom_memoria: Brain,
  custom_reflexao: HelpCircle,
  custom_desafio: Zap,
  custom_experiencia: Sparkles,
  custom_sorte: Sparkles,
  custom_card: Sparkles,
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
