import { test, expect } from 'vitest';
import { GenerateRandomBoardConfig } from '../../../src/features/game/domain/usecases/GenerateRandomBoardConfig';

/**
 * Teste de integração para o Gerador Aleatório de Tabuleiro.
 * Valida a lógica de negócio e restrições de ações.
 */

const mockTiles = [
  { id: 'o1', ring: 'outer', angle: 0, type: 'brain', color: '#fff', action: null },
  { id: 'o2', ring: 'outer', angle: 30, type: 'brain', color: '#fff', action: null },
  { id: 'm1', ring: 'middle', angle: 60, type: 'brain', color: '#fff', action: null },
  { id: 'm2', ring: 'middle', angle: 90, type: 'brain', color: '#fff', action: null },
  { id: 'i1', ring: 'inner', angle: 120, type: 'brain', color: '#fff', action: null },
  { id: 'center', ring: 'center', angle: 150, type: 'brain', color: '#fff', action: null }
];

const mockTypes = [
  { id: 'memoria', label: 'Memória' },
  { id: 'reflexao', label: 'Reflexão' },
  { id: 'desafio', label: 'Desafio' },
  { id: 'especial', label: 'Especial' }
];


const mockActions = [
  { id: null, label: 'Nenhuma' },
  { id: 'MOVE_2', label: 'Avançar 2' },
  { id: 'MOVE_INNER', label: 'Para Interno' },
  { id: 'MOVE_OUTER', label: 'Para Externo' }
];

const mockColors = ['#FF0000', '#0000FF'];

test('Deve gerar um tabuleiro com nome e mecânicas aleatórias', () => {
  const result = GenerateRandomBoardConfig.execute(mockTiles, mockTypes, mockActions, mockColors);
  
  expect(result.name).toContain('Tabuleiro Aleatório');
  expect(result.mechanics.turnTime).toBeGreaterThanOrEqual(15);
  expect(result.mechanics.turnTime).toBeLessThanOrEqual(60);
  expect(result.mechanics.diceMin).toBeGreaterThanOrEqual(1);
  expect(result.mechanics.diceMax).toBeGreaterThanOrEqual(6);
});

test('Deve garantir conectividade entre todos os anéis', () => {
  const result = GenerateRandomBoardConfig.execute(mockTiles, mockTypes, mockActions, mockColors);
  
  // Outer deve ter MOVE_INNER
  expect(result.tiles.some(t => t.ring === 'outer' && t.action === 'MOVE_INNER')).toBe(true);
  
  // Middle deve ter MOVE_INNER e MOVE_OUTER
  expect(result.tiles.some(t => t.ring === 'middle' && t.action === 'MOVE_INNER')).toBe(true);
  expect(result.tiles.some(t => t.ring === 'middle' && t.action === 'MOVE_OUTER')).toBe(true);
  
  // Inner deve ter MOVE_INNER
  expect(result.tiles.some(t => t.ring === 'inner' && t.action === 'MOVE_INNER')).toBe(true);
  
  // Center deve ter MOVE_OUTER
  expect(result.tiles.some(t => t.ring === 'center' && t.action === 'MOVE_OUTER')).toBe(true);
});

test('Deve converter casas forçadas para tipo especial e cor branca', () => {
  // Usamos apenas tipos de carta para forçar a lógica de conectividade a converter casas
  const typesOnlyCards = [{ id: 'memoria', label: 'Memória' }];
  const result = GenerateRandomBoardConfig.execute(mockTiles, typesOnlyCards, mockActions, mockColors);

  
  const transitionTiles = result.tiles.filter(t => t.action === 'MOVE_INNER' || t.action === 'MOVE_OUTER');
  
  transitionTiles.forEach(tile => {
    expect(tile.type).toBe('especial');
    expect(tile.color).toBe('#FFFFFF');
  });
});

test('Deve preservar propriedades estruturais das casas (id, ring, angle)', () => {
  const result = GenerateRandomBoardConfig.execute(mockTiles, mockTypes, mockActions, mockColors);
  
  expect(result.tiles.length).toBe(mockTiles.length);
  expect(result.tiles[0].id).toBe(mockTiles[0].id);
  expect(result.tiles[0].ring).toBe(mockTiles[0].ring);
  expect(result.tiles[0].angle).toBe(mockTiles[0].angle);
});
