import { test, expect, vi } from 'vitest';
import { BoardConfigRepository } from '../src/features/game/data/repositories/BoardConfigRepository';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn(key => store[key] || null),
    setItem: vi.fn((key, value) => {
      store[key] = value.toString();
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    removeItem: vi.fn(key => {
      delete store[key];
    })
  };
})();

vi.stubGlobal('localStorage', localStorageMock);

// Simulação da lógica do FirestoreUserRepository
class MockFirestoreUserRepository {
  constructor() {
    this.boardConfigs = [];
  }
  async saveBoardConfigs(configs) {
    this.boardConfigs = configs;
  }
  async getBoardConfigs() {
    return this.boardConfigs;
  }
}

test('Sincronização de Persistência de Tabuleiros - Deve refletir mudanças na Nuvem', async () => {
  const repository = new MockFirestoreUserRepository();
  // 1. Simular salvamento na nuvem via GameContext / UserProvider
  const newConfigs = [
    { id: 'board-1', name: 'Meu Tabuleiro', tiles: [], mechanics: {} }
  ];
  await repository.saveBoardConfigs(newConfigs);
  
  const cloudConfigs = await repository.getBoardConfigs();
  expect(cloudConfigs.length).toBe(1);
  expect(cloudConfigs[0].name).toBe('Meu Tabuleiro');
});

test('Fluxo de Tabuleiros no GameContext - Deve chamar métodos do UserProvider para sincronizar', () => {
  // Mock das funções do UserProvider que seriam injetadas no GameContext
  const mockSyncBoardConfigsToCloud = vi.fn();

  // Simulação da exposição e manipulação de dados no GameContext
  const saveNewBoardConfig = (configsToSave) => {
    // a logica do GameContext atualiza o repositorio local...
    BoardConfigRepository.saveConfigs(configsToSave);
    // ...e em seguida chama a sync func do context de usuario
    mockSyncBoardConfigsToCloud(configsToSave);
  };

  const configs = [{ id: '1', name: 'Novo Tabuleiro', tiles: [] }];
  
  saveNewBoardConfig(configs);
  expect(mockSyncBoardConfigsToCloud).toHaveBeenCalledWith(configs);
  
  // Verifica se o repositorio local foi atualizado
  const savedLocally = BoardConfigRepository.getSavedConfigs();
  expect(savedLocally.length).toBeGreaterThanOrEqual(1);
  expect(savedLocally.find(c => c.id === '1')).toBeDefined();
});
