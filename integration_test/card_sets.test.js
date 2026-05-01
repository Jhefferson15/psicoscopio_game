import { test, expect, beforeEach, vi, describe } from 'vitest';
import { CardSet } from '../src/features/game/domain/entities/CardSet';
import { CardSetRepository } from '../src/features/game/data/repositories/CardSetRepository';

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

describe('Gerenciamento de Conjuntos de Cartas (Card Sets)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('Deve retornar o conjunto padrão corretamente', () => {
    const defaultSet = CardSetRepository.getDefaultSet();
    expect(defaultSet.id).toBe('default');
    expect(defaultSet.name).toBe('Padrão Psicoscópio');
    expect(defaultSet.content).toHaveProperty('reflexao');
  });

  test('Deve salvar e recuperar conjuntos personalizados', () => {
    const customContent = {
      reflexao: ['Frase 1'],
      desafio: [],
      sorte: [],
      memoria: [],
      experiencia: []
    };
    const newSet = new CardSet('custom-1', 'Meu Conjunto', customContent);
    
    CardSetRepository.saveSet(newSet);
    
    const savedSets = CardSetRepository.getSavedSets();
    expect(savedSets.length).toBe(1);
    expect(savedSets[0].name).toBe('Meu Conjunto');
    expect(savedSets[0].content.reflexao).toContain('Frase 1');
  });

  test('Deve definir e recuperar o conjunto ativo', () => {
    CardSetRepository.setActiveSetId('custom-1');
    expect(CardSetRepository.getActiveSetId()).toBe('custom-1');
  });

  test('Deve excluir um conjunto corretamente', () => {
    const set1 = new CardSet('1', 'S1', {});
    const set2 = new CardSet('2', 'S2', {});
    
    CardSetRepository.saveSet(set1);
    CardSetRepository.saveSet(set2);
    
    expect(CardSetRepository.getSavedSets().length).toBe(2);
    
    CardSetRepository.deleteSet('1');
    expect(CardSetRepository.getSavedSets().length).toBe(1);
    expect(CardSetRepository.getSavedSets()[0].id).toBe('2');
  });

  test('Ao excluir o conjunto ativo, deve voltar para o padrão', () => {
    const set1 = new CardSet('1', 'S1', {});
    CardSetRepository.saveSet(set1);
    CardSetRepository.setActiveSetId('1');
    
    CardSetRepository.deleteSet('1');
    expect(CardSetRepository.getActiveSetId()).toBe('default');
  });
});
