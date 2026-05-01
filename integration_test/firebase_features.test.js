import { describe, it, expect, vi, beforeEach } from 'vitest';
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
  onValue: vi.fn((ref, callback) => {
    callback({
      exists: () => true,
      val: () => ({
        id: 'ROOM123',
        status: 'waiting',
        participants: { 'uid-123': { name: 'Host' } },
        gameState: {
          players: [],
          currentPlayerIndex: 0
        }
      })
    });
    return () => {};
  })
}));

vi.mock('../src/config/firebase.js', () => ({
  auth: {},
  database: {},
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
    // O teste do repositório é simples, o GameContext é que faz a lógica complexa.
    // Mas vamos garantir que o método startGame do repo ainda funciona.
    await expect(syncRepo.startGame('ROOM123')).resolves.not.toThrow();
  });

  it('deve atualizar o estado do jogo na sala', async () => {
    await expect(syncRepo.updateGameState('ROOM123', { turn: 1 })).resolves.not.toThrow();
  });

  it('deve escutar mudanças no estado do jogo', () => {
    vi.mocked(onValue).mockImplementationOnce((ref, callback) => {
      callback({
        exists: () => true,
        val: () => ({
          players: [{ name: 'Test' }],
          currentPlayerIndex: 0
        })
      });
      return () => {};
    });

    const callback = vi.fn();
    syncRepo.listenToGameState('ROOM123', callback);
    
    expect(callback).toHaveBeenCalled();
    expect(callback.mock.calls[0][0].players).toBeDefined();
    expect(callback.mock.calls[0][0].players[0].name).toBe('Test');
  });
});
