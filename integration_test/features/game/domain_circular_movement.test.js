import { test, expect } from 'vitest';
import { MovePlayerUseCase } from '../../../src/features/game/domain/usecases/MovePlayerUseCase';

/**
 * Testes de integração para a lógica de movimentação circular.
 * Valida se o MovePlayerUseCase respeita o comportamento de wrap-around.
 */

test('MovePlayerUseCase: Deve retornar ao início (casa 0) ao passar da última casa', () => {
  const boardSize = 60;
  const currentPos = 59; // Última casa
  const steps = 1;
  
  const nextPos = MovePlayerUseCase.execute(currentPos, steps, boardSize);
  expect(nextPos).toBe(0);
});

test('MovePlayerUseCase: Deve lidar com múltiplos passos cruzando o limite', () => {
  const boardSize = 60;
  const currentPos = 58;
  const steps = 4; // 58 -> 59 -> 0 -> 1 -> 2
  
  const nextPos = MovePlayerUseCase.execute(currentPos, steps, boardSize);
  expect(nextPos).toBe(2);
});

test('MovePlayerUseCase: Deve lidar com passos negativos (voltar casas)', () => {
  const boardSize = 60;
  const currentPos = 1;
  const steps = -2; // 1 -> 0 -> 59
  
  const nextPos = MovePlayerUseCase.execute(currentPos, steps, boardSize);
  expect(nextPos).toBe(59);
});

test('MovePlayerUseCase: Deve manter a posição se steps for 0', () => {
  const boardSize = 60;
  const currentPos = 30;
  const steps = 0;
  
  const nextPos = MovePlayerUseCase.execute(currentPos, steps, boardSize);
  expect(nextPos).toBe(30);
});
