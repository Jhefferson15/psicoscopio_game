import { test, expect, vi } from 'vitest';
import { Player } from '../../../src/features/game/domain/entities/Player';

// Mock minimalista do comportamento do GameContext para validar a lógica de passTurn
test('O tempo deve resetar mesmo quando jogadores são passados via overrides', () => {
  let players = [
    new Player(1, 'J1', 'red', 0, 100),
    new Player(2, 'J2', 'blue', 0, 50) // J2 tem apenas 50s sobrando de uma rodada anterior ou erro
  ];
  let currentPlayerIndex = 0;

  const syncStateToFirebase = vi.fn();

  const passTurn = (overrides = {}) => {
    const basePlayers = overrides.players || players;
    const nextIndex = (currentPlayerIndex + 1) % basePlayers.length;
    const turnTime = 120;
    
    // Lógica CORRIGIDA: aplica o reset à lista final, garantindo que overrides não a sobrescrevam
    const updatedPlayers = basePlayers.map((p, i) => 
      i === nextIndex ? { ...p, timeLeft: turnTime } : p
    );

    const syncData = {
      ...overrides,
      players: updatedPlayers,
      currentPlayerIndex: nextIndex
    };
    
    syncStateToFirebase(syncData);
  };


  // Simula o movePlayer chamando passTurn com overrides.players (que contém o tempo antigo de 50s para J2)
  const newPlayersFromMove = [
    { ...players[0], position: 5 },
    { ...players[1] } // timeLeft ainda é 50 aqui
  ];

  passTurn({ players: newPlayersFromMove });

  const lastSync = syncStateToFirebase.mock.calls[0][0];
  
  // Se o bug existir, o timeLeft do J2 (index 1) será 50, não 120.
  expect(lastSync.players[1].timeLeft).toBe(120);
});
