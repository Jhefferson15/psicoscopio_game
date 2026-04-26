export class Tile {
  constructor(id, type, label, color, ring, angle, action = null) {
    this.id = id;
    this.type = type; // 'normal', 'reflexao', 'desafio', 'memoria', 'especial'
    this.label = label;
    this.color = color;
    this.ring = ring; // 'outer', 'middle', 'inner', 'center'
    this.angle = angle; // Angle in degrees for SVG positioning
    this.action = action; // Function or type of special action
  }
}
