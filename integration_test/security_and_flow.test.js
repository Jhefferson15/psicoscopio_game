import { describe, it, expect, vi, beforeEach } from 'vitest';
import { query } from 'firebase/firestore';
import { FirebaseGameSyncRepository } from '../src/features/game/data/repositories/FirebaseGameSyncRepository';

vi.mock('firebase/firestore', () => ({
  collection: vi.fn((db, ...paths) => ({ paths: paths.join('/') })),
  doc: vi.fn(),
  onSnapshot: vi.fn(() => () => {}),
  query: vi.fn((col, ...args) => ({ col, args })),
  where: vi.fn(),
  orderBy: vi.fn((field, dir) => ({ type: 'orderBy', field, dir })),
  limit: vi.fn((num) => ({ type: 'limit', value: num })),
  serverTimestamp: vi.fn(() => Date.now()),
}));

vi.mock('firebase/database', () => ({
  ref: vi.fn(),
  set: vi.fn(() => Promise.resolve()),
  onValue: vi.fn(),
  onDisconnect: vi.fn(() => ({ set: vi.fn() })),
  serverTimestamp: vi.fn(() => Date.now()),
}));

vi.mock('firebase/functions', () => ({
  httpsCallable: vi.fn((_, name) => {
    return (data) => {
      // Simulação básica da segurança em functions/index.js
      if (name === 'gameAction' && data.action === 'START_GAME') {
        const isObserverRoom = data.data?.gameState?.metadata?.hostRole === 'observer';

        if (!isObserverRoom && data.data?.caller !== 'owner-uid') {
           throw new Error("permission-denied");
        }
        return Promise.resolve({ data: { success: true } });
      }
      return Promise.resolve({ data: { success: true } });
    };
  })
}));

vi.mock('../src/config/firebase.js', () => ({
  database: {},
  firestore: {},
  functions: {},
  isFirebaseConfigured: true
}));

describe('Security and Optimization Flow', () => {
  let syncRepo;

  beforeEach(() => {
    syncRepo = new FirebaseGameSyncRepository();
    vi.clearAllMocks();
  });

  it('deve utilizar limit(100) nas chamadas de histórico para economizar leituras no Firestore', () => {
    const callback = vi.fn();
    syncRepo.listenToRoomHistory('ROOM123', callback);

    expect(query).toHaveBeenCalledTimes(2);

    const calls = query.mock.calls;
    // O argumento de limit(100) deve estar presente na chamada de query
    const hasLimitTurn = calls[0].some(arg => arg?.type === 'limit' && arg?.value === 100);
    const hasLimitCard = calls[1].some(arg => arg?.type === 'limit' && arg?.value === 100);

    expect(hasLimitTurn).toBe(true);
    expect(hasLimitCard).toBe(true);
  });

  it('deve bloquear START_GAME se o usuário não for o dono e não for uma sala de observador', async () => {
    await expect(
      syncRepo._callGameAction('ROOM123', 'START_GAME', { caller: 'hacker-uid' })
    ).rejects.toThrow("permission-denied");
  });

  it('deve permitir START_GAME se for sala de observador (fluxo correto)', async () => {
    const result = await syncRepo._callGameAction('ROOM123', 'START_GAME', { 
      caller: 'player-uid',
      gameState: { metadata: { hostRole: 'observer' } } 
    });
    expect(result.success).toBe(true);
  });
});

