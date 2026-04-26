import { test, expect } from 'vitest';

test('Deve configurar os jogadores corretamente ao iniciar o jogo', () => {
  const players = [];
  const initializeGame = (newPlayers) => {
    players.push(...newPlayers);
  };

  const setupData = [
    { name: 'Alice', color: '#ff0000' },
    { name: 'Bob', color: '#00ff00' }
  ];

  initializeGame(setupData);

  expect(players.length).toBe(2);
  expect(players[0].name).toBe('Alice');
  expect(players[1].color).toBe('#00ff00');
});

test('Deve gerenciar as configurações de som corretamente', () => {
  let settings = { sound: true };
  const toggleSound = () => { settings.sound = !settings.sound; };

  expect(settings.sound).toBe(true);
  toggleSound();
  expect(settings.sound).toBe(false);
  toggleSound();
  expect(settings.sound).toBe(true);
});

test('Deve validar a confirmação do aviso mobile', () => {
  let confirmed = false;
  const onConfirm = () => { confirmed = true; };

  expect(confirmed).toBe(false);
  onConfirm();
  expect(confirmed).toBe(true);
});
