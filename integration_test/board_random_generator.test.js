import { test, expect } from 'vitest';
import { GenerateRandomBoardConfig } from '../src/features/game/domain/usecases/GenerateRandomBoardConfig';

/**
 * Teste de integração para o Gerador Aleatório de Tabuleiro.
 * Valida a lógica de negócio e restrições de ações.
 */

const mockTiles = [
  { id: '1', ring: 'outer', angle: 0, type: 'brain', color: '#fff', action: null },
  { id: '2', ring: 'outer', angle: 30, type: 'especial', color: '#fff', action: 'MOVE_2' }
];

const mockTypes = [
  { id: 'brain', label: 'Cérebro' },
  { id: 'especial', label: 'Especial' }
];

const mockActions = [
  { id: null, label: 'Nenhuma' },
  { id: 'MOVE_2', label: 'Avançar 2' }
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

test('Deve respeitar a regra de uma ação por casa (Tipos de Carta)', () => {
  // Forçamos o tipo para 'brain' (tipo de carta)
  const typesOnlyCards = [{ id: 'brain', label: 'Cérebro' }];
  const result = GenerateRandomBoardConfig.execute(mockTiles, typesOnlyCards, mockActions, mockColors);
  
  result.tiles.forEach(tile => {
    // Se for tipo de carta (brain), a ação deve ser obrigatoriamente nula
    expect(tile.action).toBeNull();
  });
});

test('Deve atribuir ações para tipos não-carta quando apropriado', () => {
  // Forçamos o tipo para 'especial' (não é carta)
  const typesOnlySpecial = [{ id: 'especial', label: 'Especial' }];
  // Forçamos ações para terem apenas uma opção válida
  const actionsWithOneOption = [{ id: 'MOVE_2', label: 'Avançar 2' }];
  
  const result = GenerateRandomBoardConfig.execute(mockTiles, typesOnlySpecial, actionsWithOneOption, mockColors);
  
  result.tiles.forEach(tile => {
    // Para o tipo especial no nosso Use Case atual, ele sorteia das ações passadas
    expect(tile.action).toBe('MOVE_2');
  });
});

test('Deve preservar propriedades estruturais das casas (id, ring, angle)', () => {
  const result = GenerateRandomBoardConfig.execute(mockTiles, mockTypes, mockActions, mockColors);
  
  expect(result.tiles.length).toBe(mockTiles.length);
  expect(result.tiles[0].id).toBe(mockTiles[0].id);
  expect(result.tiles[0].ring).toBe(mockTiles[0].ring);
  expect(result.tiles[0].angle).toBe(mockTiles[0].angle);
});
