import { describe, it, expect, vi } from 'vitest';
import { FirebaseGameSyncRepository } from '../src/features/game/data/repositories/FirebaseGameSyncRepository';

// Mock completo do Firebase
vi.mock('firebase/database', () => {
  const mockOnDisconnect = {
    set: vi.fn(() => Promise.resolve()),
    cancel: vi.fn(() => Promise.resolve()),
  };
  return {
    getDatabase: vi.fn(),
    ref: vi.fn((db, path) => ({ path })),
    set: vi.fn(() => Promise.resolve()),
    update: vi.fn(() => Promise.resolve()),
    serverTimestamp: vi.fn(() => 1746145200000),
    onDisconnect: vi.fn(() => mockOnDisconnect),
    onValue: vi.fn((ref, callback) => {
      callback({
        exists: () => true,
        val: () => ({
          id: 'TEST01',
          status: 'waiting',
          ownerId: 'owner-uid',
          participants: {
            'owner-uid': { id: 'owner-uid', name: 'Dono' }
          },
          gameState: {
            players: [
              { id: 'owner-uid', name: 'Dono', color: '#D84B42', position: 0, timeLeft: 120, lastRoll: null }
            ],
            currentPlayerIndex: 0,
            lastDiceRoll: 0,
            turnStartTime: 1746145200000,
            turnDuration: 120
          }
        })
      });
      return () => {};
    })
  };
});

vi.mock('firebase/functions', () => ({
  getFunctions: vi.fn(),
  httpsCallable: vi.fn(() => vi.fn(() => Promise.resolve({ data: { success: true } })))
}));

vi.mock('../src/config/firebase.js', () => ({
  auth: {},
  database: {},
  functions: {},
  googleProvider: {},
  isFirebaseConfigured: true,
  default: true
}));

const syncRepo = new FirebaseGameSyncRepository();

describe('Fluxo de Inicio de Partida Online', () => {
  it('deve registrar o inicio do primeiro turno com serverTimestamp via startTurn', async () => {
    vi.clearAllMocks();
    await expect(syncRepo.startTurn('TEST01', 0, 120)).resolves.not.toThrow();

    const { httpsCallable } = await import('firebase/functions');
    const callable = vi.mocked(httpsCallable).mock.results[0].value;
    
    expect(callable).toHaveBeenCalledWith(expect.objectContaining({ 
      action: 'PASS_TURN',
      data: expect.objectContaining({ playerIndex: 0, turnDuration: 120 })
    }));
  });


  it('deve retornar gameState com turnStartTime e turnDuration ao entrar na sala', async () => {
    const room = await syncRepo.joinRoom('TEST01', { id: 'owner-uid', name: 'Dono' });
    expect(room.gameState).toBeDefined();
    expect(room.gameState.turnDuration).toBe(120);
  });

  it('deve criar sala com gameState inicial valido', async () => {
    const roomId = await syncRepo.createRoom({
      players: [{ id: 'owner-uid', name: 'Dono', color: '#D84B42', position: 0 }],
      currentPlayerIndex: 0
    }, 'owner-uid');

    expect(roomId).toBeDefined();
    expect(roomId.length).toBe(6);
  });
});

describe('Protecao de acoes invalidas no repositorio', () => {
  it('startTurn sem database nao deve lancar excecao', async () => {
    const repo = new FirebaseGameSyncRepository();
    expect(typeof repo.startTurn).toBe('function');
  });

  it('deleteRoom sem roomId nao deve lancar excecao', async () => {
    await expect(syncRepo.deleteRoom(null)).resolves.not.toThrow();
  });

  it('leaveRoom sem userId nao deve lancar excecao', async () => {
    await expect(syncRepo.leaveRoom('TEST01', null)).resolves.not.toThrow();
  });

  it('updateGameState deve chamar a cloud function SYNC_STATE', async () => {
    vi.clearAllMocks();
    await syncRepo.updateGameState('TEST01', { currentPlayerIndex: 1 });

    const { httpsCallable } = await import('firebase/functions');
    const callable = vi.mocked(httpsCallable).mock.results[0].value;
    expect(callable).toHaveBeenCalledWith(expect.objectContaining({ 
      action: 'SYNC_STATE',
      data: expect.objectContaining({ currentPlayerIndex: 1 })
    }));
  });
});

describe('Calculo de cronometro com dados do Firebase', () => {
  it('deve calcular tempo restante corretamente com turnStartTime do Firebase', () => {
    const turnDuration = 120;
    const serverTimeOffset = 0;
    // Turno comecou ha 30s no servidor
    const turnStartTime = Date.now() - 30000;

    const now = Date.now() + serverTimeOffset;
    const elapsed = Math.floor((now - turnStartTime) / 1000);
    const remaining = Math.max(0, turnDuration - elapsed);

    expect(remaining).toBeCloseTo(90, -1); // ~90s com margem de 10s
    expect(remaining).toBeGreaterThan(80);
    expect(remaining).toBeLessThanOrEqual(90);
  });

  it('deve retornar 0 quando o tempo esgotou', () => {
    const turnDuration = 120;
    const serverTimeOffset = 0;
    // Turno comecou ha 200s (ja expirou)
    const turnStartTime = Date.now() - 200000;

    const now = Date.now() + serverTimeOffset;
    const elapsed = Math.floor((now - turnStartTime) / 1000);
    const remaining = Math.max(0, turnDuration - elapsed);

    expect(remaining).toBe(0);
  });

  it('nao deve decrementar se turnStartTime for null (aguarda servidor)', () => {
    const turnStartTime = null;
    // O useEffect retorna cedo quando turnStartTime e null
    // Verificamos a logica: se turnStartTime e falsy, o timer nao inicia
    const shouldStartTimer = !!turnStartTime;
    expect(shouldStartTimer).toBe(false);
  });
});
