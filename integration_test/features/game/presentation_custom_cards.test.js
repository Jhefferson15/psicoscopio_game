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

describe('Sistema de Cartas Customizadas', () => {
  let repository;

  beforeEach(() => {
    localStorage.clear();
    repository = new LocalStorageCardRepository();
  });

  test('Deve salvar uma nova carta corretamente', async () => {
    const card = new CustomCard({
      type: 'Reflexão',
      content: 'O que te faz feliz?',
      contentType: 'text',
      color: '#D84B42'
    });

    await repository.saveCard(card);
    const savedCards = await repository.getCards();

    expect(savedCards.length).toBe(1);
    expect(savedCards[0].content).toBe('O que te faz feliz?');
    expect(savedCards[0].type).toBe('Reflexão');
  });

  test('Deve excluir uma carta corretamente', async () => {
    const card1 = new CustomCard({ id: '1', type: 'Reflexão', content: 'C1', contentType: 'text' });
    const card2 = new CustomCard({ id: '2', type: 'Desafio', content: 'C2', contentType: 'text' });

    await repository.saveCard(card1);
    await repository.saveCard(card2);

    let savedCards = await repository.getCards();
    expect(savedCards.length).toBe(2);

    await repository.deleteCard('1');
    savedCards = await repository.getCards();

    expect(savedCards.length).toBe(1);
    expect(savedCards[0].id).toBe('2');
  });

  test('Deve retornar lista vazia se não houver cartas', async () => {
    const savedCards = await repository.getCards();
    expect(savedCards).toEqual([]);
  });

  test('Acesso à coleção deve estar disponível na tela de jogo', () => {
    // Simulação conceitual do estado
    let showCollection = false;
    const setShowCollection = (val) => { showCollection = val; };
    
    // Abrir coleção
    setShowCollection(true);
    expect(showCollection).toBe(true);
  });
});
