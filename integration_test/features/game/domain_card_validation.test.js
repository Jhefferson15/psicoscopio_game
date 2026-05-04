import { test, expect, beforeEach, vi, describe } from 'vitest';
import { CustomCard } from '../../../src/features/game/domain/entities/CustomCard';
import { LocalStorageCardRepository } from '../../../src/features/game/data/repositories/LocalStorageCardRepository';

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

describe('Validação de Cartas Vazias', () => {
  let repository;

  beforeEach(() => {
    localStorage.clear();
    repository = new LocalStorageCardRepository();
  });

  test('Não deve permitir salvar carta com conteúdo de texto vazio', async () => {
    const emptyCard = new CustomCard({
      type: 'Reflexão',
      content: '',
      contentType: 'text',
      color: '#D84B42'
    });

    // Se a entidade tiver isValid(), podemos testar aqui
    if (emptyCard.isValid) {
        expect(emptyCard.isValid()).toBe(false);
    }

    await repository.saveCard(emptyCard);
    const savedCards = await repository.getCards();

    // Este teste deve FALHAR inicialmente se o bug existir (ou seja, savedCards.length será 1)
    // Depois de corrigir, deve ser 0
    expect(savedCards.length).toBe(0);
  });

  test('Não deve permitir salvar carta com apenas espaços em branco', async () => {
    const spaceCard = new CustomCard({
      type: 'Reflexão',
      content: '   ',
      contentType: 'text',
      color: '#D84B42'
    });

    await repository.saveCard(spaceCard);
    const savedCards = await repository.getCards();
    expect(savedCards.length).toBe(0);
  });
});
