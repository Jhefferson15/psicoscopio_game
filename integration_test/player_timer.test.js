import { test, expect, vi } from 'vitest';
import { Player } from '../src/features/game/domain/entities/Player';

test('O tempo do jogador deve diminuir e o turno deve passar quando chegar a zero', () => {
  // Simulação simplificada do comportamento do GameContext
  let players = [
    new Player(1, 'J1', 'red', 0, 120),
    new Player(2, 'J2', 'blue', 0, 120)
  ];
  let currentPlayerIndex = 0;

  const passTurn = () => {
    currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
    players[currentPlayerIndex].timeLeft = 120;
  };

  const tick = () => {
    if (players[currentPlayerIndex].timeLeft > 0) {
      players[currentPlayerIndex].timeLeft -= 1;
    } else {
      passTurn();
    }
  };

  // Simula 1 segundo
  tick();
  expect(players[0].timeLeft).toBe(119);
  expect(currentPlayerIndex).toBe(0);

  // Simula chegar a zero
  players[0].timeLeft = 0;
  tick();
  expect(currentPlayerIndex).toBe(1);
  expect(players[1].timeLeft).toBe(120);
});

test('O tempo deve ser resetado ao passar o turno manualmente', () => {
    let players = [
        new Player(1, 'J1', 'red', 0, 120),
        new Player(2, 'J2', 'blue', 0, 120)
      ];
      let currentPlayerIndex = 0;
    
      const passTurn = () => {
        currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
        players[currentPlayerIndex].timeLeft = 120;
      };

      players[0].timeLeft = 50;
      passTurn();
      
      expect(currentPlayerIndex).toBe(1);
      expect(players[1].timeLeft).toBe(120);
});
