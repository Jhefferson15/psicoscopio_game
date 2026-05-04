export const LEARNING_PROFILES = [
  {
    id: 'memorialista',
    title: 'MEMORIALISTA',
    description: 'Aprende melhor lembrando e repetindo.',
    color: '#4885CE',
    icon: 'brain'
  },
  {
    id: 'experienciador',
    title: 'EXPERIENCIADOR',
    description: 'Aprende melhor fazendo e testando.',
    color: '#6FB05E',
    icon: 'plant'
  },
  {
    id: 'reflexivo',
    title: 'REFLEXIVO',
    description: 'Aprende melhor pensando e analisando.',
    color: '#7B4BB1',
    icon: 'cycle'
  },
  {
    id: 'estrategico',
    title: 'ESTRATÉGICO',
    description: 'Aprende melhor planejando e decidindo.',
    color: '#F4C746',
    icon: 'gears'
  }
];

export const SPECIAL_TILES = [
  {
    type: 'AVANCE 2 CASAS',
    description: 'Você fez uma boa escolha!',
    icon: 'arrow-right'
  },
  {
    type: 'VOLTE 2 CASAS',
    description: 'Reflita e tente outra estratégia.',
    icon: 'arrow-left'
  },
  {
    type: 'TROQUE DE LUGAR',
    description: 'Troque de posição com outro jogador.',
    icon: 'shuffle'
  },
  {
    type: 'DESAFIO EM EQUIPE',
    description: 'Todos jogam juntos para superar o desafio.',
    icon: 'users'
  }
];

export const GAME_CARDS = [
  { id: 'memoria', type: 'MEMÓRIA', color: '#4885CE', icon: 'brain' },
  { id: 'experiencia', type: 'EXPERIÊNCIA', color: '#6FB05E', icon: 'sparkles' },
  { id: 'desafio', type: 'DESAFIO', color: '#D84B42', icon: 'zap' },
  { id: 'reflexao', type: 'REFLEXÃO', color: '#7B4BB1', icon: 'brain' },
  { id: 'sorte', type: 'SORTE', color: '#F4C746', icon: 'sparkles' }
];


export const GAME_RULES = {
  about: "Psicoscópio é um jogo de tabuleiro que investiga os processos de aprendizagem por meio da memória, da experiência e da reflexão. A cada escolha, o jogador se torna protagonista do próprio caminho e descobre novas formas de aprender.",
  objective: "Viver experiências, superar desafios e refletir sobre o próprio jeito de aprender.",
  components: [
    "1 tabuleiro circular",
    "120 cartas (4 categorias)",
    "1 ampulheta (1 minuto)",
    "Fichas de jogador",
    "1 marcador de cada cor",
    "1 bloco de anotações",
    "1 guia de avaliação"
  ],
  steps: [
    "Escolha um ponto do tabuleiro para começar.",
    "Na sua vez, compre uma carta e siga as instruções.",
    "Use a ampulheta quando solicitado.",
    "Avance (ou volte) de acordo com o resultado da ação.",
    "Ao cair em uma casa especial, siga a orientação dela.",
    "Reflita, anote e continue o ciclo!"
  ]
};

export const STANDARD_TILE_CONFIG = {
  memoria: { color: '#4885CE', label: 'MEMÓRIA' },
  experiencia: { color: '#6FB05E', label: 'EXPERIÊNCIA' },
  desafio: { color: '#D84B42', label: 'DESAFIO' },
  reflexao: { color: '#7B4BB1', label: 'REFLEXÃO' },
  sorte: { color: '#F4C746', label: 'SORTE' },
  custom_memoria: { color: '#4885CE', label: 'CUSTOM\nMEM' },
  custom_experiencia: { color: '#6FB05E', label: 'CUSTOM\nEXP' },
  custom_desafio: { color: '#D84B42', label: 'CUSTOM\nDES' },
  custom_reflexao: { color: '#7B4BB1', label: 'CUSTOM\nREFL' },
  custom_sorte: { color: '#F4C746', label: 'CUSTOM\nSORTE' },
  custom_card: { color: '#F4C746', label: 'CARTA\nCUSTOM' }
};



