import { test, expect } from 'vitest';

// Simulação simplificada do comportamento do StartMenu e modais
test('Fluxo de Menu: Deve permitir alternar estados de modal sem erro', () => {
  let activeModal = null;
  const setActiveModal = (val) => { activeModal = val; };

  // Simular clique em "Iniciar Jornada"
  setActiveModal('playerSetup');
  expect(activeModal).toBe('playerSetup');

  // Simular fechamento de modal
  setActiveModal(null);
  expect(activeModal).toBe(null);

  // Simular clique em "Configurações"
  setActiveModal('settings');
  expect(activeModal).toBe('settings');
});

test('Fluxo de Jogo: Deve transitar do menu para a criação de cartas ao inicializar', () => {
  let currentScreen = 'menu';
  const players = [];
  
  const initializeGame = (newPlayers) => {
    players.push(...newPlayers);
    currentScreen = 'card_creation';
  };

  const setupData = [
    { name: 'Jogador 1', color: '#D84B42' },
    { name: 'Jogador 2', color: '#4885CE' }
  ];

  initializeGame(setupData);

  expect(players.length).toBe(2);
  expect(currentScreen).toBe('card_creation');
});

test('Fluxo de Coleção: Deve permitir navegar para a galeria de cartas customizadas', () => {
  let currentScreen = 'menu';
  const goToCustomCards = () => { currentScreen = 'custom_cards'; };

  expect(currentScreen).toBe('menu');
  goToCustomCards();
  expect(currentScreen).toBe('custom_cards');
});
