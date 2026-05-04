import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FirebaseGameSyncRepository } from '../../../src/features/game/data/repositories/FirebaseGameSyncRepository';

// Mock do Firebase
vi.mock('firebase/database', () => ({
  ref: vi.fn((db, path) => ({ path })),
  set: vi.fn(() => Promise.resolve()),
  onValue: vi.fn(),
  onDisconnect: vi.fn(() => ({ set: vi.fn() })),
  serverTimestamp: vi.fn(() => Date.now()),
}));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn((db, name) => ({ name })),
  doc: vi.fn((db, name, id) => ({ name, id })),
  setDoc: vi.fn(() => Promise.resolve()),
  updateDoc: vi.fn(() => Promise.resolve()),
  onSnapshot: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  serverTimestamp: vi.fn(() => Date.now()),
}));

vi.mock('firebase/functions', () => ({
  httpsCallable: vi.fn(() => {
    return (data) => Promise.resolve({ data: { success: true, ...data } });
  }),
}));

vi.mock('../../../src/config/firebase.js', () => ({
  database: {},
  firestore: {},
  functions: {},
  isFirebaseConfigured: true
}));

describe('Fix Host Assignment Issue', () => {
  let syncRepo;
  const observerId = 'observer-123';


  beforeEach(() => {
    syncRepo = new FirebaseGameSyncRepository();
    vi.clearAllMocks();
  });

  it('deve manter o ownerId original do observador ao criar uma sala', async () => {
    const gameData = { metadata: { title: 'Teste' } };
    const roomId = await syncRepo.createRoom(gameData, observerId);
    
    expect(roomId).toBeDefined();
    
    // Verifica se o ownerId foi passado corretamente para o Firestore e RTDB
    const { setDoc } = await import('firebase/firestore');
    const { set } = await import('firebase/database');
    
    // No RTDB
    expect(set).toHaveBeenCalledWith(
      expect.objectContaining({ path: `rooms/${roomId}` }),
      expect.objectContaining({ ownerId: observerId })
    );
    
    // No Firestore
    expect(setDoc).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'rooms', id: roomId }),
      expect.objectContaining({ ownerId: observerId })
    );
  });

  it('deve manter o ownerId original do observador ao criar uma sala via createRoom', async () => {
    const gameData = { metadata: { hostRole: 'observer' } };
    const roomId = await syncRepo.createRoom(gameData, observerId);
    
    // Verifica se os participantes estão vazios para observador (não deve se auto-adicionar como jogador)
    const { set } = await import('firebase/database');
    const callArgs = set.mock.calls.find(call => call[0].path === `rooms/${roomId}`)[1];
    expect(callArgs.participants).toEqual({});
    expect(callArgs.ownerId).toBe(observerId);
  });
});
