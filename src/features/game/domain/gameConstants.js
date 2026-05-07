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
    icon: 'fast-forward'
  },
  {
    type: 'VOLTE 2 CASAS',
    description: 'Reflita e tente outra estratégia.',
    icon: 'undo'
  },
  {
    type: 'TROQUE DE LUGAR',
    description: 'Troque de posição com outro jogador.',
    icon: 'arrow-left-right'
  },
  {
    type: 'TEAM_CHALLENGE',
    label: 'Desafio em Equipe',
    description: 'Todos jogam juntos! O grupo deve superar um desafio coletivo.',
    icon: 'users'
  },
  {
    type: 'WRITE_DIARY',
    label: 'Diário de Bordo',
    description: 'Registre um insight ou aprendizado da rodada em seu bloco.',
    icon: 'book'
  },
  {
    type: 'MOVE_INNER',
    label: 'Ir para o Centro',
    description: 'Sua compreensão aumentou. Você pode avançar para o anel interno.',
    icon: 'arrow-up-circle'
  },
  {
    type: 'MOVE_OUTER',
    label: 'Ir para a Borda',
    description: 'Às vezes é preciso recuar para enxergar melhor. Volte um anel.',
    icon: 'arrow-down-circle'
  }
];

export const SYMBOL_DEFINITIONS = {
  categories: [
    { name: 'Memória', color: '#4885CE', description: 'Desafios focados na retenção de conceitos e lembranças.' },
    { name: 'Experiência', color: '#6FB05E', description: 'Relacione o jogo com suas vivências práticas e reais.' },
    { name: 'Desafio', color: '#D84B42', description: 'Tarefas de resolução de problemas e ação imediata.' },
    { name: 'Reflexão', color: '#7B4BB1', description: 'Análise profunda sobre o próprio processo de aprendizagem.' },
    { name: 'Sorte', color: '#F4C746', description: 'Eventos inesperados que mudam o rumo da partida.' }
  ],
  special: [
    { symbol: 'MOVE_2', label: 'Avance 2', desc: 'Acelere seu caminho no anel atual.', color: '#F97316' }, 
    { symbol: 'BACK_2', label: 'Volte 2', desc: 'Retorne para revisar o caminho.', color: '#475569' }, 
    { symbol: 'SWAP_PLACE', label: 'Troca', desc: 'Interação direta com outro peão.', color: '#D946EF' }, 
    { symbol: 'TEAM_CHALLENGE', label: 'Equipe', desc: 'Ação colaborativa entre todos.', color: '#06B6D4' }, 
    { symbol: 'WRITE_DIARY', label: 'Diário', desc: 'Momento de registro e escrita.', color: '#0D9488' }, 
    { symbol: 'MOVE_INNER', label: 'Centro', desc: 'Transição para o próximo anel interno.', color: '#111827' }, 
    { symbol: 'MOVE_OUTER', label: 'Borda', desc: 'Retorno para o anel anterior.', color: '#111827' },
    { symbol: 'SKIP_TURN', label: 'Pausa', desc: 'Pausa reflexiva, pule uma vez.', color: '#64748B' }
  ]
};

export const GAME_RULES = {
  about: "Psicoscópio é um jogo de tabuleiro que investiga os processos de aprendizagem por meio da memória, da experiência e da reflexão. A cada escolha, o jogador se torna protagonista do próprio caminho e descobre novas formas de aprender.",
  objective: "O objetivo é atravessar os anéis de conhecimento (Externo, Médio e Interno) até chegar ao Centro (Sabedoria), acumulando reflexões e superando desafios pelo caminho.",
  setup: [
    "Cada jogador escolhe um marcador e uma posição inicial no anel externo.",
    "Embaralhe as cartas por cor e coloque-as nos montes correspondentes.",
    "Defina quem começa (ex: o último que aprendeu algo novo)."
  ],
  round_flow: [
    "Lançar o Dado: O número indica quantas casas você deve avançar.",
    "Ação da Casa: Ao parar em uma casa, execute a ação (Carta ou Símbolo).",
    "Verificação Social: Se cair em uma carta, sua resposta deve ser validada pelos outros jogadores.",
    "Transição: Se parar em uma casa de 'Ir para o Centro' ou 'Ir para a Borda', você pode mudar de anel na próxima rodada."
  ],
  components: [
    "1 Tabuleiro Circular",
    "Cartas de Categorias",
    "Marcadores de Jogador",
    "Dados",
    "Bloco de Anotações (Digital ou Físico)"
  ]
};

export const STANDARD_TILE_CONFIG = {
  memoria: { color: '#4885CE', label: 'MEMÓRIA', icon: 'puzzle' },
  experiencia: { color: '#6FB05E', label: 'EXPERIÊNCIA', icon: 'award' },
  desafio: { color: '#D84B42', label: 'DESAFIO', icon: 'zap' },
  reflexao: { color: '#7B4BB1', label: 'REFLEXÃO', icon: 'brain' },
  sorte: { color: '#F4C746', label: 'SORTE', icon: 'sparkles' },
  custom_memoria: { color: '#4885CE', label: 'CUSTOM\nMEMÓRIA', icon: 'puzzle' },
  custom_experiencia: { color: '#6FB05E', label: 'CUSTOM\nEXPERIÊNCIA', icon: 'award' },
  custom_desafio: { color: '#D84B42', label: 'CUSTOM\nDESAFIO', icon: 'zap' },
  custom_reflexao: { color: '#7B4BB1', label: 'CUSTOM\nREFLEXÃO', icon: 'brain' },
  custom_sorte: { color: '#F4C746', label: 'CUSTOM\nSORTE', icon: 'sparkles' },
  custom_card: { color: '#F4C746', label: 'CARTA\nCUSTOM', icon: 'palette' }
};

export const ACTION_METADATA = {
  'MOVE_2': { color: '#F97316', label: 'AVANCE 2', icon: 'move-2' },
  'BACK_2': { color: '#475569', label: 'VOLTE 2', icon: 'back-2' },
  'TEAM_CHALLENGE': { color: '#06B6D4', label: 'EQUIPE', icon: 'team' },
  'SWAP_PLACE': { color: '#D946EF', label: 'TROCA', icon: 'swap' },
  'WRITE_DIARY': { color: '#0D9488', label: 'DIÁRIO', icon: 'diary' },
  'MOVE_INNER': { color: '#000000', label: 'IR P/ CENTRO', icon: 'circle-arrow-up' },
  'MOVE_OUTER': { color: '#000000', label: 'IR P/ BORDA', icon: 'circle-arrow-down' },
  'CREATE_CARD': { color: '#8B5CF6', label: 'CRIAR CARTA', icon: 'create-card' },
  'SHARE_CARD': { color: '#EC4899', label: 'DAR CARTA', icon: 'share-card' },
  'DRAW_2': { color: '#6366F1', label: 'COMPRAR 2', icon: 'draw-2' },
  'SKIP_TURN': { color: '#78909C', label: 'PAUSA', icon: 'pause' }
};

export const GAME_CARDS = [
  { id: 'memoria', type: 'MEMÓRIA', color: '#4885CE', icon: 'puzzle' },
  { id: 'experiencia', type: 'EXPERIÊNCIA', color: '#6FB05E', icon: 'award' },
  { id: 'desafio', type: 'DESAFIO', color: '#D84B42', icon: 'zap' },
  { id: 'reflexao', type: 'REFLEXÃO', color: '#7B4BB1', icon: 'brain' },
  { id: 'sorte', type: 'SORTE', color: '#F4C746', icon: 'sparkles' }
];



