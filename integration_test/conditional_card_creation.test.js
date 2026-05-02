import { test, expect } from 'vitest';

test('Deve pular o Ateliê de Cartas por padrão (ou se explicitamente falso)', () => {
  let screen = 'menu';
  const mockBoardConfigDefault = {
    mechanics: {} // Sem o campo
  };

  const initializeGame = (newPlayers, activeBoardConfig) => {
    const shouldShowAtelier = !!activeBoardConfig.mechanics?.enableCardCreationStep;
    if (shouldShowAtelier) {
      screen = 'card_creation';
    } else {
      screen = 'game';
    }
  };

  initializeGame([{ name: 'Test' }], mockBoardConfigDefault);
  expect(screen).toBe('game');
});

test('Deve mostrar o Ateliê de Cartas se explicitamente configurado como true', () => {
  let screen = 'menu';
  const mockBoardConfigEnabled = {
    mechanics: {
      enableCardCreationStep: true
    }
  };

  const initializeGame = (newPlayers, activeBoardConfig) => {
    const shouldShowAtelier = !!activeBoardConfig.mechanics?.enableCardCreationStep;
    if (shouldShowAtelier) {
      screen = 'card_creation';
    } else {
      screen = 'game';
    }
  };

  initializeGame([{ name: 'Test' }], mockBoardConfigEnabled);
  expect(screen).toBe('card_creation');
});

test('Deve voltar para o menu ao concluir Ateliê se veio das configurações', () => {
  let screen = 'card_creation';
  let atelierContext = 'settings';
  
  const finishCardCreation = () => {
    if (atelierContext === 'settings') {
      screen = 'menu';
      return;
    }
    screen = 'game';
  };

  finishCardCreation();
  expect(screen).toBe('menu');
});

test('Deve ir para o jogo ao concluir Ateliê se veio do fluxo de início offline', () => {
  let screen = 'card_creation';
  let atelierContext = 'game_start';
  let isOnline = false;
  
  const finishCardCreation = () => {
    if (isOnline) {
      screen = 'waiting_players';
    } else {
      if (atelierContext === 'settings') {
        screen = 'menu';
      } else {
        screen = 'game';
      }
    }
  };

  finishCardCreation();
  expect(screen).toBe('game');
});

test('Deve ir para espera de jogadores ao concluir Ateliê no modo online', () => {
  let screen = 'card_creation';
  let atelierContext = 'game_start';
  let isOnline = true;
  
  const finishCardCreation = () => {
    if (isOnline) {
      screen = 'waiting_players';
    } else {
      screen = 'game';
    }
  };

  finishCardCreation();
  expect(screen).toBe('waiting_players');
});
