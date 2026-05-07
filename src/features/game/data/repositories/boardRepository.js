import { Tile } from '../../domain/entities/Tile';
import { BoardConfig } from '../../domain/entities/BoardConfig';
import { ACTION_METADATA, STANDARD_TILE_CONFIG } from '../../domain/gameConstants';

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

const OUTER_RADIUS = 300;
const MIDDLE_RADIUS = 225;
const INNER_RADIUS = 150;

const TILE_DESCRIPTIONS = {
  reflexao: "Casa da Pausa: Um momento para olhar para dentro e questionar suas próprias percepções.",
  desafio: "Casa da Ação: Propõe uma tarefa prática ou social para testar suas habilidades em tempo real.",
  memoria: "Casa da Retenção: Desafia você a lembrar de detalhes importantes da jornada até aqui.",
  experiencia: "Casa da Prática: Relacione o conhecimento com suas vivências e experiências reais.",
  sorte: "Casa do Imprevisto: Um evento inesperado que pode mudar o rumo da sua jornada.",
  especial: "Casa do Destino: Aciona uma mecânica única que pode mudar drasticamente sua posição no jogo.",
  center: "O Ápice da Jornada: Você chegou ao centro do Psicoscópio, onde o aprendizado se torna sabedoria."
};

const withDesc = (tile) => {
  if (!tile.description) {
    tile.description = TILE_DESCRIPTIONS[tile.type] || '';
  }
  return tile;
};

export const boardData = [
  // OUTER RING
  withDesc(new Tile('o1', 'desafio', getTileLabel('desafio'), getTileColor('desafio'), 'outer', 18)),
  withDesc(new Tile('o2', 'reflexao', getTileLabel('reflexao'), getTileColor('reflexao'), 'outer', 36)),
  withDesc(new Tile('o3', 'sorte', getTileLabel('sorte'), getTileColor('sorte'), 'outer', 54)),
  withDesc(new Tile('o4', 'memoria', getTileLabel('memoria'), getTileColor('memoria'), 'outer', 72)),
  withDesc(new Tile('s1', 'especial', getTileLabel(null, 'MOVE_2'), getTileColor(null, 'MOVE_2'), 'special', 90, 'MOVE_2', 'Vento a favor! Sua compreensão acelerada permite que você avance 2 casas.')),
  withDesc(new Tile('o5', 'experiencia', getTileLabel('experiencia'), getTileColor('experiencia'), 'outer', 108)),
  withDesc(new Tile('o6', 'reflexao', getTileLabel('reflexao'), getTileColor('reflexao'), 'outer', 126)),
  withDesc(new Tile('o7', 'sorte', getTileLabel('sorte'), getTileColor('sorte'), 'outer', 144)),
  withDesc(new Tile('o8', 'memoria', getTileLabel('memoria'), getTileColor('memoria'), 'outer', 162)),
  withDesc(new Tile('s2', 'especial', getTileLabel(null, 'TEAM_CHALLENGE'), getTileColor(null, 'TEAM_CHALLENGE'), 'special', 180, 'TEAM_CHALLENGE', 'A união faz a força. Este desafio deve ser resolvido em conjunto com os outros jogadores.')),
  withDesc(new Tile('o9', 'desafio', getTileLabel('desafio'), getTileColor('desafio'), 'outer', 198)),
  withDesc(new Tile('o10', 'reflexao', getTileLabel('reflexao'), getTileColor('reflexao'), 'outer', 216)),
  withDesc(new Tile('o11', 'experiencia', getTileLabel('experiencia'), getTileColor('experiencia'), 'outer', 234)),
  withDesc(new Tile('o12', 'memoria', getTileLabel('memoria'), getTileColor('memoria'), 'outer', 252)),
  withDesc(new Tile('s3', 'especial', getTileLabel(null, 'SWAP_PLACE'), getTileColor(null, 'SWAP_PLACE'), 'special', 270, 'SWAP_PLACE', 'Troca de perspectivas. Você pode trocar sua posição no tabuleiro com a de qualquer outro jogador.')),
  withDesc(new Tile('o13', 'reflexao', getTileLabel('reflexao'), getTileColor('reflexao'), 'outer', 288)),
  withDesc(new Tile('o14', 'desafio', getTileLabel('desafio'), getTileColor('desafio'), 'outer', 306)),
  withDesc(new Tile('o15', 'memoria', getTileLabel('memoria'), getTileColor('memoria'), 'outer', 324)),
  withDesc(new Tile('o16', 'desafio', getTileLabel('desafio'), getTileColor('desafio'), 'outer', 342)),
  withDesc(new Tile('s4', 'especial', getTileLabel(null, 'BACK_2'), getTileColor(null, 'BACK_2'), 'special', 0, 'BACK_2', 'Um momento para revisar. Às vezes é preciso dar alguns passos atrás para consolidar o aprendizado.')),

  // MIDDLE RING
  withDesc(new Tile('m1', 'reflexao', getTileLabel('reflexao'), getTileColor('reflexao'), 'middle', 12.8)),
  withDesc(new Tile('m2', 'sorte', getTileLabel('sorte'), getTileColor('sorte'), 'middle', 38.5)),
  withDesc(new Tile('m3', 'experiencia', getTileLabel('experiencia'), getTileColor('experiencia'), 'middle', 64.2)),
  withDesc(new Tile('m4', 'memoria', getTileLabel('memoria'), getTileColor('memoria'), 'middle', 90)),
  withDesc(new Tile('m5', 'desafio', getTileLabel('desafio'), getTileColor('desafio'), 'middle', 115.7)),
  withDesc(new Tile('m6', 'experiencia', getTileLabel('experiencia'), getTileColor('experiencia'), 'middle', 141.4)),
  withDesc(new Tile('m7', 'sorte', getTileLabel('sorte'), getTileColor('sorte'), 'middle', 167.1)),
  withDesc(new Tile('m8', 'desafio', getTileLabel('desafio'), getTileColor('desafio'), 'middle', 192.8)),
  withDesc(new Tile('m9', 'memoria', getTileLabel('memoria'), getTileColor('memoria'), 'middle', 218.5)),
  withDesc(new Tile('m10', 'reflexao', getTileLabel('reflexao'), getTileColor('reflexao'), 'middle', 244.2)),
  withDesc(new Tile('m11', 'experiencia', getTileLabel('experiencia'), getTileColor('experiencia'), 'middle', 270)),
  withDesc(new Tile('m12', 'desafio', getTileLabel('desafio'), getTileColor('desafio'), 'middle', 295.7)),
  withDesc(new Tile('m13', 'memoria', getTileLabel('memoria'), getTileColor('memoria'), 'middle', 321.4)),
  withDesc(new Tile('m14', 'desafio', getTileLabel('desafio'), getTileColor('desafio'), 'middle', 347.1)),

  // INNER RING
  withDesc(new Tile('i1', 'desafio', getTileLabel('desafio'), getTileColor('desafio'), 'inner', 18)),
  withDesc(new Tile('i2', 'memoria', getTileLabel('memoria'), getTileColor('memoria'), 'inner', 54)),
  withDesc(new Tile('i3', 'experiencia', getTileLabel('experiencia'), getTileColor('experiencia'), 'inner', 90)),
  withDesc(new Tile('i4', 'sorte', getTileLabel('sorte'), getTileColor('sorte'), 'inner', 126)),
  withDesc(new Tile('i5', 'reflexao', getTileLabel('reflexao'), getTileColor('reflexao'), 'inner', 162)),
  withDesc(new Tile('i6', 'desafio', getTileLabel('desafio'), getTileColor('desafio'), 'inner', 198)),
  withDesc(new Tile('i7', 'experiencia', getTileLabel('experiencia'), getTileColor('experiencia'), 'inner', 234)),
  withDesc(new Tile('i8', 'sorte', getTileLabel('sorte'), getTileColor('sorte'), 'inner', 270)),
  withDesc(new Tile('i9', 'reflexao', getTileLabel('reflexao'), getTileColor('reflexao'), 'inner', 306)),
  withDesc(new Tile('i10', 'sorte', getTileLabel('sorte'), getTileColor('sorte'), 'inner', 342)),

  // CENTER
  withDesc(new Tile('center', 'center', 'CHEGADA', '#FFFFFF', 'center', 0))
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
      centerText: ["A APRENDIZAGEM", "É UM CICLO,", "NÃO UMA LINHA", "DE CHEGADA."],
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
      description: item.action ? `Mecânica de teste: ${finalLabel}` : (TILE_DESCRIPTIONS[item.type] || '')
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

