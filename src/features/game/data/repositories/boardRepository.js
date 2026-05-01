import { Tile } from '../../domain/entities/Tile';
import { BoardConfig } from '../../domain/entities/BoardConfig';

const OUTER_RADIUS = 300;
const MIDDLE_RADIUS = 225;
const INNER_RADIUS = 150;

export const boardData = [
  // OUTER RING
  new Tile('o1', 'brain', '', '#D84B42', 'outer', 18),
  new Tile('o2', 'reflexao', 'REFLEXÃO', '#7B4BB1', 'outer', 36),
  new Tile('o3', 'star', '', '#EEDCC0', 'outer', 54),
  new Tile('o4', 'mag', '', '#4885CE', 'outer', 72),
  new Tile('s1', 'especial', 'AVANCE 2 CASAS', '#FFFFFF', 'special', 90, 'MOVE_2'),
  new Tile('o5', 'cycle', '', '#6FB05E', 'outer', 108),
  new Tile('o6', 'reflexao', 'REFLEXÃO', '#7B4BB1', 'outer', 126),
  new Tile('o7', 'bulb', '', '#F4C746', 'outer', 144),
  new Tile('o8', 'eye', '', '#4885CE', 'outer', 162),
  new Tile('s2', 'especial', 'DESAFIO EM EQUIPA', '#FFFFFF', 'special', 180, 'TEAM_CHALLENGE'),
  new Tile('o9', 'desafio', 'DESAFIO', '#D84B42', 'outer', 198),
  new Tile('o10', 'mag', '', '#7B4BB1', 'outer', 216),
  new Tile('o11', 'brain', '', '#6FB05E', 'outer', 234),
  new Tile('o12', 'memoria', 'MEMÓRIA', '#4885CE', 'outer', 252),
  new Tile('s3', 'especial', 'TROQUE DE LUGAR', '#FFFFFF', 'special', 270, 'SWAP_PLACE'),
  new Tile('o13', 'reflexao', 'REFLEXÃO', '#7B4BB1', 'outer', 288),
  new Tile('o14', 'target', '', '#D84B42', 'outer', 306),
  new Tile('o15', 'eye', '', '#4885CE', 'outer', 324),
  new Tile('o16', 'brain', '', '#D84B42', 'outer', 342),
  new Tile('s4', 'especial', 'VOLTE 2 CASAS', '#FFFFFF', 'special', 0, 'BACK_2'),

  // MIDDLE RING
  new Tile('m1', 'reflexao', 'REFLEXÃO', '#7B4BB1', 'middle', 12.8),
  new Tile('m2', 'bulb', '', '#F4C746', 'middle', 38.5),
  new Tile('m3', 'target', '', '#6FB05E', 'middle', 64.2),
  new Tile('m4', 'eye', '', '#4885CE', 'middle', 90),
  new Tile('m5', 'puzzle', '', '#D84B42', 'middle', 115.7),
  new Tile('m6', 'brain', '', '#6FB05E', 'middle', 141.4),
  new Tile('m7', 'slider', '', '#F4C746', 'middle', 167.1),
  new Tile('m8', 'desafio', 'DESAFIO', '#D84B42', 'middle', 192.8),
  new Tile('m9', 'mag', '', '#4885CE', 'middle', 218.5),
  new Tile('m10', 'reflexao', 'REFLEXÃO', '#7B4BB1', 'middle', 244.2),
  new Tile('m11', 'puzzle', '', '#6FB05E', 'middle', 270),
  new Tile('m12', 'target', '', '#D84B42', 'middle', 295.7),
  new Tile('m13', 'memoria', 'MEMÓRIA', '#4885CE', 'middle', 321.4),
  new Tile('m14', 'brain', '', '#D84B42', 'middle', 347.1),

  // INNER RING
  new Tile('i1', 'brain', '', '#D84B42', 'inner', 18),
  new Tile('i2', 'memoria', 'MEMÓRIA', '#4885CE', 'inner', 54),
  new Tile('i3', 'puzzle', '', '#6FB05E', 'inner', 90),
  new Tile('i4', 'bulb', '', '#F4C746', 'inner', 126),
  new Tile('i5', 'mag', '', '#7B4BB1', 'inner', 162),
  new Tile('i6', 'target', '', '#D84B42', 'inner', 198),
  new Tile('i7', 'chat', '', '#6FB05E', 'inner', 234),
  new Tile('i8', 'slider', '', '#F4C746', 'inner', 270),
  new Tile('i9', 'reflexao', 'REFLEXÃO', '#7B4BB1', 'inner', 306),
  new Tile('i10', 'mag', '', '#F4C746', 'inner', 342),

  // CENTER
  new Tile('center', 'center', 'CHEGADA', '#FFFFFF', 'center', 0)
];

export const getDefaultBoardConfig = () => {
  return new BoardConfig(
    'default',
    'Tabuleiro Original',
    boardData.map(t => t.toJSON()),
    {
      turnTime: 120,
      diceMin: 1,
      diceMax: 6
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
