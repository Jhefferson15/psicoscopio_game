import { test, expect } from 'vitest';

test('Deve gerenciar a rotação do tabuleiro corretamente', () => {
  let boardRotation = 0;
  const rotateBoard = () => { boardRotation += 90; };

  // Estado inicial
  expect(boardRotation).toBe(0);

  // Primeira rotação
  rotateBoard();
  expect(boardRotation).toBe(90);

  // Segunda rotação
  rotateBoard();
  expect(boardRotation).toBe(180);

  // Terceira rotação
  rotateBoard();
  expect(boardRotation).toBe(270);

  // Quarta rotação (volta ao ângulo inicial visualmente, mas o estado continua somando)
  rotateBoard();
  expect(boardRotation).toBe(360);
});

test('A aplicação do estilo de rotação deve ser consistente', () => {
  const getRotationStyle = (degrees) => ({ transform: `rotate(${degrees}deg)` });
  
  expect(getRotationStyle(0).transform).toBe('rotate(0deg)');
  expect(getRotationStyle(90).transform).toBe('rotate(90deg)');
  expect(getRotationStyle(360).transform).toBe('rotate(360deg)');
});
