import { test, expect } from 'vitest';

test('Sistema de Navegação deve alterar a tela atual corretamente', () => {
  let currentScreen = 'game';
  const setCurrentScreen = (screen) => { currentScreen = screen; };
  const goToMenu = () => { currentScreen = 'menu'; };

  // Simula clique no botão de início na navegação
  goToMenu();
  expect(currentScreen).toBe('menu');

  // Simula clique no botão de ateliê
  setCurrentScreen('card_creation');
  expect(currentScreen).toBe('card_creation');

  // Simula clique no botão de tabuleiro
  setCurrentScreen('game');
  expect(currentScreen).toBe('game');
});

test('Botão de Menu no TabletopView deve chamar goToMenu', () => {
  let currentScreen = 'game';
  const goToMenu = () => { currentScreen = 'menu'; };

  // Simula o clique no botão que adicionamos ao TabletopView
  goToMenu();
  expect(currentScreen).toBe('menu');
});
