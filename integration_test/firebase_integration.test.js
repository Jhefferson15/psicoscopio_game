import { test, expect } from 'vitest';
import { User } from '../src/features/auth/domain/entities/User';

// Mock dos Repositórios para testes de integração de lógica
class MockAuthRepository {
  async loginWithGoogle() {
    return new User('test-123', 'Test User', 'test@example.com', null);
  }
  async logout() { return true; }
  onAuthStateChanged(cb) {
    cb(new User('test-123', 'Test User', 'test@example.com', null));
    return () => {};
  }
}

class MockGameSyncRepository {
  async createRoom() { return 'ABC123'; }
  async updateGameState() { return true; }
  listenToGameState(_id, cb) {
    cb({ players: [{ id: 1, name: 'P1', position: 5 }] });
    return () => {};
  }
}

test('Deve processar login e retornar entidade User corretamente', async () => {
  const repo = new MockAuthRepository();
  const user = await repo.loginWithGoogle();
  
  expect(user).toBeInstanceOf(User);
  expect(user.id).toBe('test-123');
  expect(user.name).toBe('Test User');
});

test('Deve simular criação de sala online e retorno de código', async () => {
  const repo = new MockGameSyncRepository();
  const roomId = await repo.createRoom({ players: [] });
  
  expect(roomId).toBe('ABC123');
  expect(roomId.length).toBe(6);
});

test('Deve simular escuta de mudanças no estado do jogo', async () => {
  const repo = new MockGameSyncRepository();
  let receivedState = null;
  
  repo.listenToGameState('ABC123', (state) => {
    receivedState = state;
  });
  
  expect(receivedState).not.toBeNull();
  expect(receivedState.players[0].position).toBe(5);
});
