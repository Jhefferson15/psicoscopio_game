export class Tile {
  constructor(id, type, label, color, ring, angle, action = null, description = '') {
    this.id = id;
    this.type = type; // 'normal', 'reflexao', 'desafio', 'memoria', 'especial'
    this.label = label;
    this.color = color;
    this.ring = ring; // 'outer', 'middle', 'inner', 'center'
    this.angle = angle; // Angle in degrees for SVG positioning
    this.action = action; // Function or type of special action
    this.description = description;
  }

  static fromJSON(json) {
    return new Tile(
      json.id,
      json.type,
      json.label,
      json.color,
      json.ring,
      json.angle,
      json.action,
      json.description || ''
    );
  }

  toJSON() {
    return {
      id: this.id,
      type: this.type,
      label: this.label,
      color: this.color,
      ring: this.ring,
      angle: this.angle,
      action: this.action,
      description: this.description
    };
  }
}
