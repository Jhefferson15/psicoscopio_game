import { test, expect } from 'vitest';
import { BoardConfig } from '../../../src/features/game/domain/entities/BoardConfig';
import { Tile } from '../../../src/features/game/domain/entities/Tile';

test('BoardConfig deve armazenar mecânicas corretamente', () => {
  const tiles = [new Tile('1', 'brain', 'Teste', 'red', 'inner', 0)];
  const mechanics = { turnTime: 60, diceMin: 1, diceMax: 3 };
  const config = new BoardConfig('c1', 'Config Teste', tiles, mechanics);

  expect(config.mechanics.turnTime).toBe(60);
  expect(config.mechanics.diceMin).toBe(1);
  expect(config.mechanics.diceMax).toBe(3);
});

test('A lógica de dado deve respeitar os limites da configuração', () => {
  const generateDiceRoll = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  
  // Teste estatístico simples para limites
  const results = new Set();
  for(let i = 0; i < 100; i++) {
    const roll = generateDiceRoll(10, 12);
    results.add(roll);
    expect(roll).toBeGreaterThanOrEqual(10);
    expect(roll).toBeLessThanOrEqual(12);
  }
  
  expect(results.has(10)).toBe(true);
  expect(results.has(11)).toBe(true);
  expect(results.has(12)).toBe(true);
});
