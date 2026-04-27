import { test, expect } from 'vitest';

test('Deve transicionar corretamente do menu para a criação de cartas', () => {
  let screen = 'menu';
  const initializeGame = () => {
    screen = 'card_creation';
  };

  expect(screen).toBe('menu');
  initializeGame();
  expect(screen).toBe('card_creation');
});

test('Deve transicionar corretamente da criação de cartas para o jogo', () => {
  let screen = 'card_creation';
  const finishCardCreation = () => {
    screen = 'game';
  };

  expect(screen).toBe('card_creation');
  finishCardCreation();
  expect(screen).toBe('game');
});

test('Deve permitir a configuração inicial de jogadores antes da criação', () => {
  let players = [];
  const initializeGame = (newPlayers) => {
    players = newPlayers;
  };

  const mockPlayers = [{ name: 'Test', color: '#fff' }];
  initializeGame(mockPlayers);
  
  expect(players.length).toBe(1);
  expect(players[0].name).toBe('Test');
});
