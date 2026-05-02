import { describe, it, expect, vi } from 'vitest';
import { FirebaseGameSyncRepository } from '../src/features/game/data/repositories/FirebaseGameSyncRepository';

// Mock completo do Firebase
vi.mock('firebase/database', () => {
  return {
    getDatabase: vi.fn(),
    ref: vi.fn((db, path) => ({ path })),
    set: vi.fn(() => Promise.resolve()),
    query: vi.fn((ref) => ref),
    orderByChild: vi.fn(),
    equalTo: vi.fn(),
    onValue: vi.fn((queryRef, callback) => {
      if (queryRef.path === 'rooms') {
        const allRooms = {
          'ROOM1': { id: 'ROOM1', ownerId: 'owner1', status: 'waiting' },
          'ROOM2': { id: 'ROOM2', ownerId: 'owner2', status: 'playing' },
          'ROOM3': { id: 'ROOM3', ownerId: 'owner1', status: 'playing' }
        };
        
        // Simula o filtro do Firebase (se for owner1, retorna 2 salas)
        const filtered = Object.values(allRooms).filter(r => r.ownerId === 'owner1');
        
        callback({
          val: () => {
            // Se o teste está pedindo owner1, retornamos as filtradas como objeto para manter compatibilidade com Object.values no repo
            const result = {};
            filtered.forEach(r => result[r.id] = r);
            return result;
          }
        });
      }
      return () => {};
    }),
    serverTimestamp: vi.fn(() => Date.now()),
  };
});

vi.mock('firebase/firestore', () => {
  return {
    getFirestore: vi.fn(),
    collection: vi.fn((db, name) => ({ name })),
    doc: vi.fn((db, name, id) => ({ name, id })),
    setDoc: vi.fn(() => Promise.resolve()),
    onSnapshot: vi.fn((queryRef, callback) => {
      if (queryRef.name === 'rooms') {
        const docs = [
          { id: 'ROOM1', data: () => ({ id: 'ROOM1', ownerId: 'owner1', status: 'waiting' }) },
          { id: 'ROOM3', data: () => ({ id: 'ROOM3', ownerId: 'owner1', status: 'playing' }) }
        ];
        callback({ docs });
      }
      if (queryRef.collection?.name === 'roomHistory') {
         callback({ docs: [] });
      }
      return () => {};
    }),
    query: vi.fn((ref) => ref),
    where: vi.fn(),
    orderBy: vi.fn(),
    serverTimestamp: vi.fn(() => ({ toMillis: () => Date.now() }))
  };
});

vi.mock('firebase/functions', () => ({
  getFunctions: vi.fn(),
  httpsCallable: vi.fn((functions, name) => {
    return (data) => {
      if (name === 'createRoomBatch') {
        return Promise.resolve({ data: { success: true, count: data.count } });
      }
      if (name === 'gameAction') {
        return Promise.resolve({ data: { success: true } });
      }
      return Promise.resolve({ data: {} });
    };
  })
}));

vi.mock('../src/config/firebase.js', () => ({
  database: {},
  firestore: {},
  functions: {},
  isFirebaseConfigured: true
}));

const syncRepo = new FirebaseGameSyncRepository();

describe('Observer Features Repository', () => {
  it('deve criar um lote de salas com createRoomBatch', async () => {
    const result = await syncRepo.createRoomBatch(3, { tiles: [] }, { cards: [] }, 'Turma Teste');
    expect(result.success).toBe(true);
    expect(result.count).toBe(3);
  });

  it('deve registrar ação de carta com recordCardAction', async () => {
    await expect(syncRepo.recordCardAction('ROOM1', { cardId: '1', cardType: 'reflexao' })).resolves.not.toThrow();
  });

  it('deve listar apenas as salas do proprietário com listenToOwnerRooms', () => {
    const callback = vi.fn();
    syncRepo.listenToOwnerRooms('owner1', callback);
    
    expect(callback).toHaveBeenCalledWith(expect.arrayContaining([
      expect.objectContaining({ id: 'ROOM1' }),
      expect.objectContaining({ id: 'ROOM3' })
    ]));
    
    const calls = callback.mock.calls[0][0];
    expect(calls.length).toBe(2);
    expect(calls.every(r => r.ownerId === 'owner1')).toBe(true);
  });

  it('deve atualizar o status da sala corretamente', async () => {
    await expect(syncRepo.updateRoomStatus('ROOM1', 'playing')).resolves.not.toThrow();
  });
});
