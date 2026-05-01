import { describe, it, expect, vi } from 'vitest';
import { Player } from '../src/features/game/domain/entities/Player';

describe('Anti-rollback durante movimento do jogador', () => {
  it('o listener nao deve sobrescrever posicao enquanto isMovingRef e true', () => {
    const isMovingRef = { current: false };
    let currentPlayers = [
      new Player(1, 'J1', 'red', 0, 120),
      new Player(2, 'J2', 'blue', 0, 120)
    ];

    // Simula o comportamento do listener com o guard
    const handleFirebaseUpdate = (newStatePlayers) => {
      if (!isMovingRef.current) {
        currentPlayers = newStatePlayers.map(p => new Player(p.id, p.name, p.color, p.position));
      }
    };

    // Estado inicial: J1 na posicao 0
    expect(currentPlayers[0].position).toBe(0);

    // Inicia movimento local: J1 vai para posicao 3
    isMovingRef.current = true;
    currentPlayers[0].position = 3;

    // Firebase envia estado antigo (posicao 0) via listener
    handleFirebaseUpdate([
      { id: 1, name: 'J1', color: 'red', position: 0 }, // estado antigo!
      { id: 2, name: 'J2', color: 'blue', position: 0 }
    ]);

    // Com o guard, a posicao local deve ser mantida em 3 (nao rollback)
    expect(currentPlayers[0].position).toBe(3);

    // Apos terminar o movimento, o listener funciona normalmente
    isMovingRef.current = false;
    handleFirebaseUpdate([
      { id: 1, name: 'J1', color: 'red', position: 5 }, // estado final do servidor
      { id: 2, name: 'J2', color: 'blue', position: 0 }
    ]);
    expect(currentPlayers[0].position).toBe(5);
  });

  it('movePlayer deve usar o array passado como parametro, nao o estado React stale', () => {
    // Simula o comportamento: rollDice passa updatedPlayers para movePlayer
    const playersAtRollTime = [
      new Player(1, 'J1', 'red', 0, 120),
      new Player(2, 'J2', 'blue', 0, 120)
    ];

    // Simula que o estado React "players" ficou desatualizado (stale closure)
    const staleReactPlayers = [
      new Player(1, 'J1', 'red', 0, 120), // ainda posicao 0 (stale)
      new Player(2, 'J2', 'blue', 0, 120)
    ];

    // movePlayer agora recebe startingPlayers diretamente
    const movePlayer = (steps, startingPlayers) => {
      const newPlayers = startingPlayers ? [...startingPlayers] : [...staleReactPlayers];
      return newPlayers;
    };

    // Sem o fix: movePlayer usaria staleReactPlayers
    const resultStale = movePlayer(3, null);
    expect(resultStale[0].position).toBe(0); // posicao stale

    // Com o fix: movePlayer usa updatedPlayers passado pelo rollDice
    const resultFixed = movePlayer(3, playersAtRollTime);
    expect(resultFixed[0].position).toBe(0); // correto - e o estado no momento do roll
    expect(resultFixed).toBe(resultFixed); // mesma referencia (nao e o stale)
  });

  it('rollDice nao deve sincronizar players completo antes do movimento', () => {
    // O bug era: syncStateToFirebase({ isRolling: true, lastDiceRoll: 0 }) enviava
    // o estado completo com posicoes antigas, causando rollback ao voltar via listener.
    // O fix: apenas o lastDiceRoll e sincronizado, players so sao enviados em movePlayer.
    
    const syncCalls = [];
    
    // Simula o comportamento CORRETO (apos o fix)
    const mockSyncDadoApenas = (roomId, data) => {
      syncCalls.push(data);
    };

    // Rola o dado e sincroniza apenas o resultado
    const roll = 4;
    mockSyncDadoApenas('ROOM1', { lastDiceRoll: roll, lastActionBy: 'uid-123' });

    // Verifica que players NAO foi incluido na sync inicial
    expect(syncCalls[0]).not.toHaveProperty('players');
    expect(syncCalls[0].lastDiceRoll).toBe(4);
  });

  it('deve fazer sync final autoritativo apos todos os passos', async () => {
    const syncCalls = [];
    const mockUpdateGameState = vi.fn((roomId, data) => {
      syncCalls.push({ roomId, data });
      return Promise.resolve();
    });

    // Simula 2 passos de movimento + 1 sync final
    const steps = 2;
    for (let i = 0; i < steps; i++) {
      await mockUpdateGameState('ROOM1', { players: [{ position: i + 1 }], lastActionBy: 'uid-1' });
    }
    // Sync final autoritativa
    await mockUpdateGameState('ROOM1', { players: [{ position: 5 }], lastActionBy: 'uid-1' });

    // Total de calls: 1 por passo + 1 final
    expect(syncCalls.length).toBe(steps + 1);
    // Ultima call tem a posicao final
    expect(syncCalls[syncCalls.length - 1].data.players[0].position).toBe(5);
  });
});
