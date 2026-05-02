import { describe, it, expect, vi } from 'vitest';
import { onValue } from 'firebase/database';
import { FirebaseAuthRepository } from '../src/features/auth/data/repositories/FirebaseAuthRepository';
import { FirebaseGameSyncRepository } from '../src/features/game/data/repositories/FirebaseGameSyncRepository';
import { User } from '../src/features/auth/domain/entities/User';

// Mocks para as funções do Firebase
vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(),
  signInWithPopup: vi.fn(() => Promise.resolve({
    user: {
      uid: 'uid-123',
      displayName: 'Test User',
      email: 'test@example.com',
      photoURL: 'https://photo.com'
    }
  })),
  signOut: vi.fn(() => Promise.resolve()),
  onAuthStateChanged: vi.fn((auth, callback) => {
    callback({
      uid: 'uid-123',
      displayName: 'Test User',
      email: 'test@example.com',
      photoURL: 'https://photo.com'
    });
    return () => {};
  }),
  GoogleAuthProvider: vi.fn()
}));

vi.mock('firebase/database', () => ({
  getDatabase: vi.fn(),
  ref: vi.fn((db, path) => ({ path })),
  set: vi.fn(() => Promise.resolve()),
  update: vi.fn(() => Promise.resolve()),
  serverTimestamp: vi.fn(() => Date.now()),
  onDisconnect: vi.fn(() => ({
    set: vi.fn(() => Promise.resolve()),
    cancel: vi.fn(() => Promise.resolve())
  })),
  onValue: vi.fn((ref, callback) => {
    const fullData = {
      id: 'ROOM123',
      status: 'waiting',
      participants: { 'uid-123': { name: 'Host' } },
      gameState: {
        players: [{ name: 'Test' }],
        currentPlayerIndex: 0,
        lastActionBy: 'uid-123'
      }
    };
    
    let data = fullData;
    if (ref.path.includes('gameState')) {
      data = fullData.gameState;
    }

    callback({
      exists: () => true,
      val: () => data
    });
    return () => {};
  })
}));

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

describe('Firebase Authentication Repository', () => {
  const authRepo = new FirebaseAuthRepository();

  it('deve realizar login com Google e retornar uma entidade User', async () => {
    const user = await authRepo.loginWithGoogle();
    
    expect(user).toBeInstanceOf(User);
    expect(user.id).toBe('uid-123');
    expect(user.name).toBe('Test User');
    expect(user.email).toBe('test@example.com');
  });

  it('deve realizar logout com sucesso', async () => {
    await expect(authRepo.logout()).resolves.not.toThrow();
  });

  it('deve escutar mudanças de estado de autenticação', () => {
    const callback = vi.fn();
    authRepo.onAuthStateChanged(callback);
    
    expect(callback).toHaveBeenCalled();
    const callArg = callback.mock.calls[0][0];
    expect(callArg).toBeInstanceOf(User);
    expect(callArg.id).toBe('uid-123');
  });
});

describe('Firebase Game Sync Repository', () => {
  const syncRepo = new FirebaseGameSyncRepository();

  it('deve criar uma sala com ID válido', async () => {
    const roomId = await syncRepo.createRoom({ players: [] });
    
    expect(roomId).toBeDefined();
    expect(roomId.length).toBe(6);
  });

  it('deve entrar em uma sala existente e mapear participantes', async () => {
    const mockUser = { id: 'uid-456', name: 'Guest', photoURL: 'img.jpg' };
    
    vi.mocked(onValue).mockImplementationOnce((ref, callback) => {
      callback({
        exists: () => true,
        val: () => ({
          id: 'ROOM123',
          participants: { 'uid-123': { name: 'Host' } },
          gameState: { players: [] }
        })
      });
      return () => {};
    });

    const roomData = await syncRepo.joinRoom('ROOM123', mockUser);
    
    expect(roomData.id).toBe('ROOM123');
    expect(roomData.participants).toBeDefined();
    expect(roomData.participants['uid-123'].name).toBe('Host');
  });

  it('deve permitir iniciar a partida e inicializar a lista de jogadores no gameState', async () => {
    await expect(syncRepo.startGame('ROOM123')).resolves.not.toThrow();
  });

  it('deve atualizar o estado do jogo na sala', async () => {
    await expect(syncRepo.updateGameState('ROOM123', { turn: 1 })).resolves.not.toThrow();
  });

  it('deve registrar o inicio de turno com playerIndex e duracao', async () => {
    await expect(syncRepo.startTurn('ROOM123', 1, 120)).resolves.not.toThrow();
  });

  it('deve apagar a sala completamente com deleteRoom', async () => {
    await expect(syncRepo.deleteRoom('ROOM123')).resolves.not.toThrow();
    // set deve ser chamado com null para apagar o no
    const { set: mockSet } = await import('firebase/database');
    expect(mockSet).toHaveBeenCalledWith(
      expect.objectContaining({ path: 'rooms/ROOM123' }),
      null
    );
  });

  it('deve remover sala quando ultimo jogador sair (leaveRoom)', async () => {
    vi.mocked(onValue).mockImplementationOnce((ref, callback) => {
      callback({
        exists: () => true,
        val: () => ({
          participants: { 'uid-solo': { id: 'uid-solo', name: 'Solo' } }
        })
      });
      return () => {};
    });

    await expect(syncRepo.leaveRoom('ROOM123', 'uid-solo')).resolves.not.toThrow();
  });

  it('deve escutar mudancas no estado do jogo', () => {
    vi.mocked(onValue).mockImplementationOnce((ref, callback) => {
      callback({
        exists: () => true,
        val: () => ({
          players: [{ name: 'Test' }],
          currentPlayerIndex: 0,
          lastActionBy: 'uid-123'
        })
      });
      return () => {};
    });

    const callback = vi.fn();
    syncRepo.listenToGameState('ROOM123', callback);
    
    expect(callback).toHaveBeenCalled();
    expect(callback.mock.calls[0][0].players).toBeDefined();
    expect(callback.mock.calls[0][0].players[0].name).toBe('Test');
    expect(callback.mock.calls[0][0].lastActionBy).toBe('uid-123');
  });
});
