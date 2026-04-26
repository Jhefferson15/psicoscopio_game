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
  {
    type: 'MEMÓRIA',
    color: '#4885CE',
    icon: 'brain',
    instruction: 'Observe atentamente por 15 segundos.',
    action: 'Vire esta carta e escreva tudo o que conseguir lembrar.'
  },
  {
    type: 'EXPERIÊNCIA',
    color: '#6FB05E',
    icon: 'plant',
    instruction: 'Você recebeu R$ 100 para montar um projeto que ajude sua comunidade.',
    action: 'O que você faria? Explique.'
  },
  {
    type: 'DESAFIO',
    color: '#D84B42',
    icon: 'puzzle',
    instruction: 'Explique com suas palavras o que é empatia.',
    timer: '1 minuto'
  },
  {
    type: 'REFLEXÃO',
    color: '#7B4BB1',
    icon: 'cycle',
    instruction: 'O que você aprendeu nesta rodada?',
    action: 'O que te ajudou mais: memória, experiência, intuição ou estratégia? Registre no seu diário.'
  }
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
