import { describe, it, expect, vi } from 'vitest';
import { onValue, onDisconnect } from 'firebase/database';
import { FirebaseGameSyncRepository } from '../src/features/game/data/repositories/FirebaseGameSyncRepository';

// Mocks para as funções do Firebase
vi.mock('firebase/database', () => {
  const mockOnDisconnect = {
    set: vi.fn(() => Promise.resolve()),
    cancel: vi.fn(() => Promise.resolve())
  };

  return {
    getDatabase: vi.fn(),
    ref: vi.fn((db, path) => ({ path })),
    set: vi.fn(() => Promise.resolve()),
    update: vi.fn(() => Promise.resolve()),
    serverTimestamp: vi.fn(() => 'mock-timestamp'),
    onDisconnect: vi.fn(() => mockOnDisconnect),
    onValue: vi.fn((ref, callback) => {
      if (ref.path === ".info/connected") {
        callback({ val: () => true });
      }
      return () => {};
    })
  };
});

vi.mock('../src/config/firebase.js', () => ({
  database: {},
  isFirebaseConfigured: true,
  default: true
}));

describe('Presence System Integration', () => {
  const syncRepo = new FirebaseGameSyncRepository();

  it('deve configurar o monitoramento de presença corretamente', () => {
    const roomId = 'ROOM123';
    const userId = 'USER123';

    syncRepo.updatePlayerPresence(roomId, userId);

    // Verifica se escutou a conexão
    expect(onValue).toHaveBeenCalled();
    
    // Verifica se configurou o onDisconnect
    expect(onDisconnect).toHaveBeenCalled();
    
    // O onDisconnect deve ter sido chamado para o status de online
    const calls = vi.mocked(onDisconnect).mock.calls;
    expect(calls.length).toBeGreaterThan(0);
  });
});
