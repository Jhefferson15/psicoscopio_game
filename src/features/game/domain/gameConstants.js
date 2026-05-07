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
    { name: 'Sorte', color: '#F4C746', description: 'Eventos inesperados que mudam o rumo da partida.' },
    { name: 'Customizada', color: '#94A3B8', description: 'Cartas criadas no Ateliê com temas e desafios únicos.' }
  ],
  special: [
    { symbol: 'MOVE_2', label: 'Avance 2', desc: 'Acelere seu caminho no anel atual.', color: '#F97316' }, 
    { symbol: 'BACK_2', label: 'Volte 2', desc: 'Retorne para revisar o caminho.', color: '#475569' }, 
    { symbol: 'SWAP_PLACE', label: 'Troca', desc: 'Interação direta com outro peão.', color: '#D946EF' }, 
    { symbol: 'TEAM_CHALLENGE', label: 'Equipe', desc: 'Ação colaborativa entre todos.', color: '#06B6D4' }, 
    { symbol: 'WRITE_DIARY', label: 'Diário', desc: 'Momento de registro e escrita.', color: '#0D9488' }, 
    { symbol: 'MOVE_INNER', label: 'Centro', desc: 'Transição para o próximo anel interno.', color: '#111827' }, 
    { symbol: 'MOVE_OUTER', label: 'Borda', desc: 'Retorno para o anel anterior.', color: '#111827' },
    { symbol: 'SKIP_TURN', label: 'Pausa', desc: 'Pausa reflexiva, pule uma vez.', color: '#64748B' },
    { symbol: 'CREATE_CARD', label: 'Criar', desc: 'O jogador deve criar uma nova carta no Ateliê.', color: '#8B5CF6' },
    { symbol: 'SHARE_CARD', label: 'Presente', desc: 'Escolha um colega e dê uma carta a ele.', color: '#EC4899' }
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
    "Ação da Casa: Execute a ação da casa (Carta ou Símbolo). Use o ícone de Pincel para identificar casas de Ateliê (Criação) e o ícone de Presente para presentear colegas.",
    "Verificação Social: Se cair em uma carta, sua resposta deve ser validada pelos outros jogadores.",
    "Transição: Se parar em uma casa de 'Ir para o Centro' ou 'Ir para a Borda', você pode mudar de anel na próxima rodada."
  ],
  custom_cards: "Casas de Ateliê (ícone Pincel) permitem criar novas cartas personalizadas no 'Ateliê de Cartas' para adaptar o jogo aos seus próprios temas.",
  components: [
    "1 Tabuleiro Circular",
    "Cartas de Categorias",
    "Marcadores de Jogador",
    "Dados",
    "Bloco de Anotações (Digital ou Físico)"
  ]
};

export const STANDARD_TILE_CONFIG = {
  memoria: { color: '#4885CE', label: 'MEMÓRIA', icon: 'puzzle', description: 'Desafios focados na retenção de conceitos e lembranças.' },
  experiencia: { color: '#6FB05E', label: 'EXPERIÊNCIA', icon: 'award', description: 'Relacione o jogo com suas vivências práticas e reais.' },
  desafio: { color: '#D84B42', label: 'DESAFIO', icon: 'zap', description: 'Tarefas de resolução de problemas e ação imediata.' },
  reflexao: { color: '#7B4BB1', label: 'REFLEXÃO', icon: 'brain', description: 'Análise profunda sobre o próprio processo de aprendizagem.' },
  sorte: { color: '#F4C746', label: 'SORTE', icon: 'sparkles', description: 'Eventos inesperados que mudam o rumo da partida.' },
  custom_memoria: { color: '#4885CE', label: 'CUSTOM\nMEMÓRIA', icon: 'puzzle', description: 'Crie um desafio personalizado de retenção de conceitos.' },
  custom_experiencia: { color: '#6FB05E', label: 'CUSTOM\nEXPERIÊNCIA', icon: 'award', description: 'Crie uma atividade personalizada baseada em vivências.' },
  custom_desafio: { color: '#D84B42', label: 'CUSTOM\nDESAFIO', icon: 'zap', description: 'Crie uma tarefa prática personalizada para o grupo.' },
  custom_reflexao: { color: '#7B4BB1', label: 'CUSTOM\nREFLEXÃO', icon: 'brain', description: 'Crie um questionamento personalizado sobre a aprendizagem.' },
  custom_sorte: { color: '#F4C746', label: 'CUSTOM\nSORTE', icon: 'sparkles', description: 'Crie um evento inesperado personalizado.' },
  custom_card: { color: '#F4C746', label: 'CARTA\nCUSTOM', icon: 'palette', description: 'Crie uma carta com tema livre para o tabuleiro.' }
};

export const ACTION_METADATA = {
  'MOVE_2': { color: '#F97316', label: 'AVANCE 2', icon: 'move-2', description: 'Acelere seu caminho no anel atual.' },
  'BACK_2': { color: '#475569', label: 'VOLTE 2', icon: 'back-2', description: 'Retorne para revisar o caminho.' },
  'TEAM_CHALLENGE': { color: '#06B6D4', label: 'EQUIPE', icon: 'team', description: 'Ação colaborativa entre todos.' },
  'SWAP_PLACE': { color: '#D946EF', label: 'TROCA', icon: 'swap', description: 'Interação direta com outro peão.' },
  'WRITE_DIARY': { color: '#0D9488', label: 'DIÁRIO', icon: 'diary', description: 'Momento de registro e escrita.' },
  'MOVE_INNER': { color: '#111827', label: 'IR P/ CENTRO', icon: 'circle-arrow-up', description: 'Transição para o próximo anel interno.' },
  'MOVE_OUTER': { color: '#111827', label: 'IR P/ BORDA', icon: 'circle-arrow-down', description: 'Retorno para o anel anterior.' },
  'CREATE_CARD': { color: '#8B5CF6', label: 'CRIAR CARTA', icon: 'create-card', description: 'Crie uma nova carta para o jogo.' },
  'SHARE_CARD': { color: '#EC4899', label: 'DAR CARTA', icon: 'share-card', description: 'Compartilhe uma carta com outro jogador.' },
  'DRAW_2': { color: '#6366F1', label: 'COMPRAR 2', icon: 'draw-2', description: 'Compre duas cartas do monte.' },
  'SKIP_TURN': { color: '#78909C', label: 'PAUSA', icon: 'pause', description: 'Pausa reflexiva, pule uma vez.' }
};

export const GAME_CARDS = [
  { id: 'memoria', type: 'MEMÓRIA', color: '#4885CE', icon: 'puzzle' },
  { id: 'experiencia', type: 'EXPERIÊNCIA', color: '#6FB05E', icon: 'award' },
  { id: 'desafio', type: 'DESAFIO', color: '#D84B42', icon: 'zap' },
  { id: 'reflexao', type: 'REFLEXÃO', color: '#7B4BB1', icon: 'brain' },
  { id: 'sorte', type: 'SORTE', color: '#F4C746', icon: 'sparkles' }
];



