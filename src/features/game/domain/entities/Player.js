export class Player {
  constructor(id, name, color, position = 0, timeLeft = 120, lastRoll = null) {
    this.id = id;
    this.name = name;
    this.color = color;
    this.position = position; // Index of the tile
    this.timeLeft = timeLeft;
    this.lastRoll = lastRoll;
  }
}
