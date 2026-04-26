import { test, expect } from 'vitest'; // Assumindo Vitest para o projeto Web

test('Deve alternar entre visão Full Screen e Tabletop', async () => {
  // Mock do estado do jogo
  let isBoardFullScreen = true;
  const toggleFullScreen = () => { isBoardFullScreen = !isBoardFullScreen; };

  expect(isBoardFullScreen).toBe(true);
  
  toggleFullScreen();
  expect(isBoardFullScreen).toBe(false);
});
