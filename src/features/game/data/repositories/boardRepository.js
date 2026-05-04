import { Tile } from '../../domain/entities/Tile';
import { BoardConfig } from '../../domain/entities/BoardConfig';

const OUTER_RADIUS = 300;
const MIDDLE_RADIUS = 225;
const INNER_RADIUS = 150;

const TILE_DESCRIPTIONS = {
  brain: "Casa do Intelecto: Estimula o raciocínio lógico e a compreensão de conceitos fundamentais.",
  reflexao: "Casa da Pausa: Um momento para olhar para dentro e questionar suas próprias percepções.",
  desafio: "Casa da Ação: Propõe uma tarefa prática ou social para testar suas habilidades em tempo real.",
  memoria: "Casa da Retenção: Desafia você a lembrar de detalhes importantes da jornada até aqui.",
  especial: "Casa do Destino: Aciona uma mecânica única que pode mudar drasticamente sua posição no jogo.",
  bulb: "Casa da Ideia: Representa um estalo de criatividade ou um novo insight sobre o aprendizado.",
  eye: "Casa da Observação: Convida a um olhar mais atento sobre os detalhes do ambiente e do grupo.",
  cycle: "Casa do Ciclo: Lembra que o aprendizado é um processo contínuo de repetição e melhoria.",
  target: "Casa do Foco: Exige concentração total para atingir um objetivo específico na rodada.",
  puzzle: "Casa da Resolução: Propõe um enigma ou problema que requer montagem lógica de ideias.",
  chat: "Casa do Diálogo: Estimula a troca de informações e a construção coletiva de conhecimento.",
  slider: "Casa do Controle: Permite ajustar parâmetros da sua própria jornada ou do ambiente de jogo.",
  center: "O Ápice da Jornada: Você chegou ao centro do Psicoscópio, onde o aprendizado se torna sabedoria."
};

const withDesc = (tile) => {
  if (!tile.description) {
    tile.description = TILE_DESCRIPTIONS[tile.type] || TILE_DESCRIPTIONS[tile.ring] || '';
  }
  return tile;
};

export const boardData = [
  // OUTER RING
  withDesc(new Tile('o1', 'brain', '', '#D84B42', 'outer', 18)),
  withDesc(new Tile('o2', 'reflexao', 'REFLEXÃO', '#7B4BB1', 'outer', 36)),
  withDesc(new Tile('o3', 'star', '', '#EEDCC0', 'outer', 54)),
  withDesc(new Tile('o4', 'mag', '', '#4885CE', 'outer', 72)),
  withDesc(new Tile('s1', 'especial', 'AVANCE 2 CASAS', '#FFFFFF', 'special', 90, 'MOVE_2', 'Vento a favor! Sua compreensão acelerada permite que você avance 2 casas.')),
  withDesc(new Tile('o5', 'cycle', '', '#6FB05E', 'outer', 108)),
  withDesc(new Tile('o6', 'reflexao', 'REFLEXÃO', '#7B4BB1', 'outer', 126)),
  withDesc(new Tile('o7', 'bulb', '', '#F4C746', 'outer', 144)),
  withDesc(new Tile('o8', 'eye', '', '#4885CE', 'outer', 162)),
  withDesc(new Tile('s2', 'especial', 'DESAFIO EM EQUIPA', '#FFFFFF', 'special', 180, 'TEAM_CHALLENGE', 'A união faz a força. Este desafio deve ser resolvido em conjunto com os outros jogadores.')),
  withDesc(new Tile('o9', 'desafio', 'DESAFIO', '#D84B42', 'outer', 198)),
  withDesc(new Tile('o10', 'mag', '', '#7B4BB1', 'outer', 216)),
  withDesc(new Tile('o11', 'brain', '', '#6FB05E', 'outer', 234)),
  withDesc(new Tile('o12', 'memoria', 'MEMÓRIA', '#4885CE', 'outer', 252)),
  withDesc(new Tile('s3', 'especial', 'TROQUE DE LUGAR', '#FFFFFF', 'special', 270, 'SWAP_PLACE', 'Troca de perspectivas. Você pode trocar sua posição no tabuleiro com a de qualquer outro jogador.')),
  withDesc(new Tile('o13', 'reflexao', 'REFLEXÃO', '#7B4BB1', 'outer', 288)),
  withDesc(new Tile('o14', 'target', '', '#D84B42', 'outer', 306)),
  withDesc(new Tile('o15', 'eye', '', '#4885CE', 'outer', 324)),
  withDesc(new Tile('o16', 'brain', '', '#D84B42', 'outer', 342)),
  withDesc(new Tile('s4', 'especial', 'VOLTE 2 CASAS', '#FFFFFF', 'special', 0, 'BACK_2', 'Um momento para revisar. Às vezes é preciso dar alguns passos atrás para consolidar o aprendizado.')),

  // MIDDLE RING
  withDesc(new Tile('m1', 'reflexao', 'REFLEXÃO', '#7B4BB1', 'middle', 12.8)),
  withDesc(new Tile('m2', 'bulb', '', '#F4C746', 'middle', 38.5)),
  withDesc(new Tile('m3', 'target', '', '#6FB05E', 'middle', 64.2)),
  withDesc(new Tile('m4', 'eye', '', '#4885CE', 'middle', 90)),
  withDesc(new Tile('m5', 'puzzle', '', '#D84B42', 'middle', 115.7)),
  withDesc(new Tile('m6', 'brain', '', '#6FB05E', 'middle', 141.4)),
  withDesc(new Tile('m7', 'slider', '', '#F4C746', 'middle', 167.1)),
  withDesc(new Tile('m8', 'desafio', 'DESAFIO', '#D84B42', 'middle', 192.8)),
  withDesc(new Tile('m9', 'mag', '', '#4885CE', 'middle', 218.5)),
  withDesc(new Tile('m10', 'reflexao', 'REFLEXÃO', '#7B4BB1', 'middle', 244.2)),
  withDesc(new Tile('m11', 'puzzle', '', '#6FB05E', 'middle', 270)),
  withDesc(new Tile('m12', 'target', '', '#D84B42', 'middle', 295.7)),
  withDesc(new Tile('m13', 'memoria', 'MEMÓRIA', '#4885CE', 'middle', 321.4)),
  withDesc(new Tile('m14', 'brain', '', '#D84B42', 'middle', 347.1)),

  // INNER RING
  withDesc(new Tile('i1', 'brain', '', '#D84B42', 'inner', 18)),
  withDesc(new Tile('i2', 'memoria', 'MEMÓRIA', '#4885CE', 'inner', 54)),
  withDesc(new Tile('i3', 'puzzle', '', '#6FB05E', 'inner', 90)),
  withDesc(new Tile('i4', 'bulb', '', '#F4C746', 'inner', 126)),
  withDesc(new Tile('i5', 'mag', '', '#7B4BB1', 'inner', 162)),
  withDesc(new Tile('i6', 'target', '', '#D84B42', 'inner', 198)),
  withDesc(new Tile('i7', 'chat', '', '#6FB05E', 'inner', 234)),
  withDesc(new Tile('i8', 'slider', '', '#F4C746', 'inner', 270)),
  withDesc(new Tile('i9', 'reflexao', 'REFLEXÃO', '#7B4BB1', 'inner', 306)),
  withDesc(new Tile('i10', 'mag', '', '#F4C746', 'inner', 342)),

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
