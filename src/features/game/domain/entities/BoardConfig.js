import { Tile } from './Tile';

export class BoardConfig {
  constructor(id, name, tiles, mechanics, createdAt = Date.now(), updatedAt = Date.now()) {
    this.id = id;
    this.name = name;
    this.tiles = tiles; // Array of Tile objects
    this.mechanics = {
      turnTime: mechanics.turnTime || 120,
      diceMin: mechanics.diceMin || 1,
      diceMax: mechanics.diceMax || 6,
      enableCardCreationStep: mechanics.enableCardCreationStep || false,
      showBoardLabels: mechanics.showBoardLabels !== false,
      showCardLabels: mechanics.showCardLabels !== false,
      maxTurns: mechanics.maxTurns || 0,
      centerText: mechanics.centerText || ["A APRENDIZAGEM", "É UM CICLO,", "NÃO UMA LINHA", "DE CHEGADA."],
      initialPositions: mechanics.initialPositions || [0, 0, 0, 0, 0, 0],
      randomStart: mechanics.randomStart || false
    };
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static getRandomOuterPositions(tiles, playerCount) {
    const outerTileIndices = (tiles || [])
      .map((tile, idx) => (tile.ring === 'outer' || tile.ring === 'special') ? idx : -1)
      .filter(idx => idx !== -1);
    
    if (outerTileIndices.length === 0) return Array(playerCount).fill(0);

    const shuffled = [...outerTileIndices].sort(() => Math.random() - 0.5);
    return Array(playerCount).fill(0).map((_, i) => shuffled[i % shuffled.length]);
  }

  static fromJSON(json) {
    return new BoardConfig(
      json.id,
      json.name,
      (json.tiles || []).map(t => Tile.fromJSON(t)),
      json.mechanics || {},
      json.createdAt,
      json.updatedAt
    );
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      tiles: this.tiles.map(t => (typeof t.toJSON === 'function' ? t.toJSON() : t)),
      mechanics: this.mechanics,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

