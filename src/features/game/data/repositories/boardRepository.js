import { Tile } from '../../domain/entities/Tile';
import { BoardConfig } from '../../domain/entities/BoardConfig';
import { ACTION_METADATA, STANDARD_TILE_CONFIG } from '../../domain/gameConstants';

export const getTileDescription = (type, action) => {
  if (action && ACTION_METADATA[action]) return ACTION_METADATA[action].description;
  if (type && STANDARD_TILE_CONFIG[type]) return STANDARD_TILE_CONFIG[type].description;
  return '';
};

export const getTileColor = (type, action) => {
  if (action && ACTION_METADATA[action]) return ACTION_METADATA[action].color;
  if (type && STANDARD_TILE_CONFIG[type]) return STANDARD_TILE_CONFIG[type].color;
  return '#FFFFFF';
};

export const getTileLabel = (type, action) => {
  if (action && ACTION_METADATA[action]) return ACTION_METADATA[action].label;
  if (type && STANDARD_TILE_CONFIG[type]) return STANDARD_TILE_CONFIG[type].label;
  return '';
};

export const getTileDefaults = (type, action) => {
  return {
    color: getTileColor(type, action),
    label: getTileLabel(type, action),
    description: getTileDescription(type, action)
  };
};

const OUTER_RADIUS = 300;
const MIDDLE_RADIUS = 225;
const INNER_RADIUS = 150;


export const boardData = [
  new Tile('o1', 'reflexao', 'REFLEXÃO', '#7B4BB1', 'outer', 18, null, 'Análise profunda sobre o próprio processo de aprendizagem.'),
  new Tile('o2', 'desafio', 'DESAFIO', '#D84B42', 'outer', 36, null, 'Tarefas de resolução de problemas e ação imediata.'),
  new Tile('o3', 'experiencia', 'EXPERIÊNCIA', '#6FB05E', 'outer', 54, null, 'Relacione o jogo com suas vivências práticas e reais.'),
  new Tile('o4', 'sorte', 'IR P/ BORDA', '#111827', 'outer', 72, 'MOVE_OUTER', 'Retorno para o anel anterior.'),
  new Tile('s1', 'especial', 'AVANCE 2', '#F97316', 'special', 90, 'MOVE_2', 'Acelere seu caminho no anel atual.'),
  new Tile('o5', 'reflexao', 'REFLEXÃO', '#7B4BB1', 'outer', 108, null, 'Análise profunda sobre o próprio processo de aprendizagem.'),
  new Tile('o6', 'desafio', 'DESAFIO', '#D84B42', 'outer', 126, null, 'Tarefas de resolução de problemas e ação imediata.'),
  new Tile('o7', 'experiencia', 'EXPERIÊNCIA', '#6FB05E', 'outer', 144, null, 'Relacione o jogo com suas vivências práticas e reais.'),
  new Tile('o8', 'memoria', 'MEMÓRIA', '#4885CE', 'outer', 162, null, 'Desafios focados na retenção de conceitos e lembranças.'),
  new Tile('s2', 'especial', 'PAUSA', '#78909C', 'special', 180, 'SKIP_TURN', 'Pausa reflexiva, pule uma vez.'),
  new Tile('o9', 'especial', 'IR P/ BORDA', '#111827', 'outer', 198, 'MOVE_OUTER', 'Retorno para o anel anterior.'),
  new Tile('o10', 'sorte', 'SORTE', '#F4C746', 'outer', 216, null, 'Eventos inesperados que mudam o rumo da partida.'),
  new Tile('o11', 'experiencia', 'EXPERIÊNCIA', '#6FB05E', 'outer', 234, null, 'Relacione o jogo com suas vivências práticas e reais.'),
  new Tile('o12', 'memoria', 'MEMÓRIA', '#4885CE', 'outer', 252, null, 'Desafios focados na retenção de conceitos e lembranças.'),
  new Tile('s3', 'especial', 'TROCA', '#D946EF', 'special', 270, 'SWAP_PLACE', 'Interação direta com outro peão.'),
  new Tile('o13', 'reflexao', 'REFLEXÃO', '#7B4BB1', 'outer', 288, null, 'Análise profunda sobre o próprio processo de aprendizagem.'),
  new Tile('o14', 'desafio', 'DESAFIO', '#D84B42', 'outer', 306, null, 'Tarefas de resolução de problemas e ação imediata.'),
  new Tile('o15', 'memoria', 'MEMÓRIA', '#4885CE', 'outer', 324, null, 'Desafios focados na retenção de conceitos e lembranças.'),
  new Tile('o16', 'especial', 'IR P/ BORDA', '#111827', 'outer', 342, 'MOVE_OUTER', 'Retorno para o anel anterior.'),
  new Tile('s4', 'especial', 'VOLTE 2', '#475569', 'special', 0, 'BACK_2', 'Retorne para revisar o caminho.'),
  new Tile('m1', 'reflexao', 'IR P/ BORDA', '#111827', 'middle', 12.8, 'MOVE_OUTER', 'Retorno para o anel anterior.'),
  new Tile('m2', 'custom_experiencia', 'CUSTOM\nEXPERIÊNCIA', '#6FB05E', 'middle', 38.5, null, 'Crie uma atividade personalizada baseada em vivências.'),
  new Tile('m3', 'custom_sorte', 'CUSTOM\nSORTE', '#F4C746', 'middle', 64.2, null, 'Crie um evento inesperado personalizado.'),
  new Tile('m4', 'custom_memoria', 'CUSTOM\nMEMÓRIA', '#4885CE', 'middle', 90, null, 'Crie um desafio personalizado de retenção de conceitos.'),
  new Tile('m5', 'especial', 'VOLTE 2', '#475569', 'middle', 115.7, 'BACK_2', 'Retorne para revisar o caminho.'),
  new Tile('m6', 'brain', 'TROCA', '#D946EF', 'middle', 141.4, 'SWAP_PLACE', 'Interação direta com outro peão.'),
  new Tile('m7', 'custom_memoria', 'CUSTOM\nMEMÓRIA', '#4885CE', 'middle', 167.1, null, 'Crie um desafio personalizado de retenção de conceitos.'),
  new Tile('m8', 'custom_desafio', 'CUSTOM\nDESAFIO', '#D84B42', 'middle', 192.8, null, 'Crie uma tarefa prática personalizada para o grupo.'),
  new Tile('m9', 'custom_sorte', 'CUSTOM\nSORTE', '#F4C746', 'middle', 218.5, null, 'Crie um evento inesperado personalizado.'),
  new Tile('m10', 'custom_reflexao', 'IR P/ CENTRO', '#111827', 'middle', 244.2, 'MOVE_INNER', 'Transição para o próximo anel interno.'),
  new Tile('m11', 'custom_experiencia', 'CUSTOM\nEXPERIÊNCIA', '#6FB05E', 'middle', 270, null, 'Crie uma atividade personalizada baseada em vivências.'),
  new Tile('m12', 'especial', 'IR P/ BORDA', '#111827', 'middle', 295.7, 'MOVE_OUTER', 'Retorno para o anel anterior.'),
  new Tile('m13', 'custom_memoria', 'CUSTOM\nMEMÓRIA', '#4885CE', 'middle', 321.4, null, 'Crie um desafio personalizado de retenção de conceitos.'),
  new Tile('m14', 'custom_desafio', 'CUSTOM\nDESAFIO', '#D84B42', 'middle', 347.1, null, 'Crie uma tarefa prática personalizada para o grupo.'),
  new Tile('i1', 'custom_reflexao', 'CUSTOM\nREFLEXÃO', '#7B4BB1', 'inner', 18, null, 'Crie um questionamento personalizado sobre a aprendizagem.'),
  new Tile('i2', 'custom_card', 'DIÁRIO', '#0D9488', 'inner', 54, 'WRITE_DIARY', 'Momento de registro e escrita.'),
  new Tile('i3', 'custom_desafio', 'TROCA', '#D946EF', 'inner', 90, 'SWAP_PLACE', 'Interação direta com outro peão.'),
  new Tile('i4', 'custom_card', 'IR P/ CENTRO', '#111827', 'inner', 126, 'MOVE_INNER', 'Transição para o próximo anel interno.'),
  new Tile('i5', 'especial', 'PAUSA', '#78909C', 'inner', 162, 'SKIP_TURN', 'Pausa reflexiva, pule uma vez.'),
  new Tile('i6', 'custom_sorte', 'CUSTOM\nSORTE', '#F4C746', 'inner', 198, null, 'Crie um evento inesperado personalizado.'),
  new Tile('i7', 'custom_memoria', 'DIÁRIO', '#0D9488', 'inner', 234, 'WRITE_DIARY', 'Momento de registro e escrita.'),
  new Tile('i8', 'custom_card', 'TROCA', '#D946EF', 'inner', 270, 'SWAP_PLACE', 'Interação direta com outro peão.'),
  new Tile('i9', 'especial', 'COMPRAR 2', '#6366F1', 'inner', 306, 'DRAW_2', 'Compre duas cartas do monte.'),
  new Tile('i10', 'custom_card', 'PAUSA', '#78909C', 'inner', 342, 'SKIP_TURN', 'Pausa reflexiva, pule uma vez.'),
  new Tile('center', 'center', 'IR P/ BORDA', '#111827', 'center', 0, 'MOVE_OUTER', 'Retorno para o anel anterior.')
];

export const getDefaultBoardConfig = () => {
  return new BoardConfig(
    'default',
    'Tabuleiro Original',
    boardData.map(t => t.toJSON()),
    {
      turnTime: 120,
      diceMin: 1,
      diceMax: 6,
      enableCardCreationStep: false,
      showBoardLabels: true,
      showCardLabels: true,
      maxTurns: 0,
      centerText: ["Surpresa!!", "", "", ""],
      initialPositions: [0, 0, 0, 0]
    }
  );
};


export const getDevTestBoardConfig = () => {
  const sequence = [
    { type: 'reflexao', label: getTileLabel('reflexao') },
    { type: 'desafio', label: getTileLabel('desafio') },
    { type: 'memoria', label: getTileLabel('memoria') },
    { type: 'experiencia', label: getTileLabel('experiencia') },
    { type: 'sorte', label: getTileLabel('sorte') },
    { type: 'custom_reflexao', label: 'C. REFLEXÃO' },
    { type: 'custom_desafio', label: 'C. DESAFIO' },
    { type: 'custom_memoria', label: 'C. MEMÓRIA' },
    { type: 'custom_experiencia', label: 'C. EXPERIÊNCIA' },
    { type: 'custom_sorte', label: 'C. SORTE' },
    { type: 'custom_card', label: 'C. GERAL' },
    { type: 'especial', action: 'WRITE_DIARY' },
    { type: 'especial', action: 'CREATE_CARD' },
    { type: 'especial', action: 'SHARE_CARD' },
    { type: 'especial', action: 'MOVE_2' },
    { type: 'especial', action: 'BACK_2' },
    { type: 'especial', action: 'DRAW_2' },
    { type: 'especial', action: 'SWAP_PLACE' },
    { type: 'especial', action: 'SKIP_TURN' },
    { type: 'especial', action: 'TEAM_CHALLENGE' },
    { type: 'especial', action: 'MOVE_OUTER' },
    { type: 'especial', action: 'MOVE_INNER' }
  ];

  const devTiles = boardData.map((t, idx) => {
    if (t.type === 'center') return t.toJSON();
    
    const item = sequence[idx % sequence.length];
    const tileJson = t.toJSON();
    
    const finalLabel = item.label || getTileLabel(item.type, item.action);
    const finalColor = getTileColor(item.type, item.action);

    return {
      ...tileJson,
      type: item.type,
      action: item.action || null,
      label: finalLabel,
      color: finalColor,
      description: item.action ? `Mecânica de teste: ${finalLabel}` : getTileDescription(item.type, item.action)
    };
  });

  return new BoardConfig(
    'teste_dev',
    'Teste Dev Completo (Dado 1-2)',
    devTiles.map(t => Tile.fromJSON(t)),
    {
      turnTime: 120,
      diceMin: 1,
      diceMax: 2,
      enableCardCreationStep: false,
      showBoardLabels: true,
      showCardLabels: true,
      maxTurns: 0,
      centerText: ["TESTE DE", "DESENVOLVIMENTO", "DADO: 1-2", "BOAS ATIVIDADES!"],
      initialPositions: [0, 0, 0, 0]
    }
  );
};

export const getTilePosition = (tile) => {
  let radius = 0;
  switch (tile.ring) {
    case 'outer': radius = OUTER_RADIUS; break;
    case 'middle': radius = MIDDLE_RADIUS; break;
    case 'inner': radius = INNER_RADIUS; break;
    case 'special': radius = 340; break;
    case 'center': radius = 0; break;
  }
  
  // Adjust angle for SVG coordinates (0 degrees is top, but SVG rotation starts from top)
  // The SVG uses rotate(angle) which rotates around center.
  // We need the center of the arc.
  const rad = (tile.angle - 90) * (Math.PI / 180);
  return {
    x: 400 + radius * Math.cos(rad),
    y: 400 + radius * Math.sin(rad)
  };
};

