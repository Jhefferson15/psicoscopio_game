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
    label: 'Mover para Dentro',
    description: 'Sua compreensão aumentou. Você pode avançar para o anel interno.',
    icon: 'arrow-down'
  },
  {
    type: 'MOVE_OUTER',
    label: 'Mover para Fora',
    description: 'Às vezes é preciso recuar para enxergar melhor. Volte um anel.',
    icon: 'arrow-up'
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
    { symbol: 'MOVE_2', label: 'Avance 2', desc: 'Acelere seu caminho no anel atual.' },
    { symbol: 'BACK_2', label: 'Volte 2', desc: 'Retorne para revisar o caminho.' },
    { symbol: 'SWAP_PLACE', label: 'Troca', desc: 'Interação direta com outro peão.' },
    { symbol: 'TEAM_CHALLENGE', label: 'Equipe', desc: 'Ação colaborativa entre todos.' },
    { symbol: 'WRITE_DIARY', label: 'Diário', desc: 'Momento de registro e escrita.' },
    { symbol: 'MOVE_INNER', label: 'Entrar', desc: 'Transição para o próximo anel interno.' },
    { symbol: 'MOVE_OUTER', label: 'Sair', desc: 'Retorno para o anel anterior.' }
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
    "Transição: Se parar em uma casa de Seta, você pode mudar de anel na próxima rodada."
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
  memoria: { color: '#4885CE', label: 'MEMÓRIA' },
  experiencia: { color: '#6FB05E', label: 'EXPERIÊNCIA' },
  desafio: { color: '#D84B42', label: 'DESAFIO' },
  reflexao: { color: '#7B4BB1', label: 'REFLEXÃO' },
  sorte: { color: '#F4C746', label: 'SORTE' },
  custom_memoria: { color: '#4885CE', label: 'CUSTOM\nMEMÓRIA' },
  custom_experiencia: { color: '#6FB05E', label: 'CUSTOM\nEXPERIÊNCIA' },
  custom_desafio: { color: '#D84B42', label: 'CUSTOM\nDESAFIO' },
  custom_reflexao: { color: '#7B4BB1', label: 'CUSTOM\nREFLEXÃO' },
  custom_sorte: { color: '#F4C746', label: 'CUSTOM\nSORTE' },
  custom_card: { color: '#F4C746', label: 'CARTA\nCUSTOM' }
};



