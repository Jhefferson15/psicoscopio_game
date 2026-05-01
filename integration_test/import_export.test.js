import { test, expect, beforeEach, vi, describe } from 'vitest';
import { CardSetRepository } from '../src/features/game/data/repositories/CardSetRepository';
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

describe('Importação/Exportação de Dados (Lógica)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('Deve validar a estrutura de uma Coleção de Cartas para exportação', () => {
    const defaultSet = CardSetRepository.getDefaultSet();
    const exported = JSON.parse(JSON.stringify(defaultSet));
    
    expect(exported).toHaveProperty('name');
    expect(exported).toHaveProperty('content');
    expect(exported.content).toHaveProperty('reflexao');
  });

  test('Deve simular o fluxo de importação de uma Coleção de Cartas', () => {
    const jsonToImport = {
      name: "Coleção Estrangeira",
      content: {
        reflexao: ["Mensagem Importada"],
        desafio: [],
        sorte: [],
        memoria: [],
        experiencia: []
      }
    };

    // Lógica similar à implementada no GameContext
    const newName = `${jsonToImport.name} (Importado)`;
    const newId = "imported-" + Date.now();
    
    const savedSets = CardSetRepository.getSavedSets();
    savedSets.push({ ...jsonToImport, id: newId, name: newName });
    CardSetRepository.saveSets(savedSets);

    const result = CardSetRepository.getSavedSets();
    expect(result.length).toBe(1);
    expect(result[0].name).toBe("Coleção Estrangeira (Importado)");
    expect(result[0].content.reflexao).toContain("Mensagem Importada");
  });

  test('Deve validar a estrutura de um Tabuleiro para exportação', () => {
    const defaultConfig = BoardConfigRepository.getDefaultConfig();
    const exported = JSON.parse(JSON.stringify(defaultConfig));
    
    expect(exported).toHaveProperty('name');
    expect(exported).toHaveProperty('tiles');
    expect(exported).toHaveProperty('mechanics');
  });

  test('Deve simular o fluxo de importação de um Tabuleiro', () => {
    const jsonToImport = {
      name: "Tabuleiro Estrangeiro",
      tiles: [{ id: "T1", type: "reflexao", color: "#7B4BB1", ring: "outer", angle: 0 }],
      mechanics: { turnTime: 90, diceMin: 1, diceMax: 10 }
    };

    // Lógica similar à implementada no GameContext
    const newName = `${jsonToImport.name} (Importado)`;
    const newId = "imported-board-" + Date.now();
    
    const savedConfigs = BoardConfigRepository.getSavedConfigs();
    savedConfigs.push({ ...jsonToImport, id: newId, name: newName });
    BoardConfigRepository.saveConfigs(savedConfigs);

    const result = BoardConfigRepository.getSavedConfigs();
    expect(result.length).toBe(1);
    expect(result[0].name).toBe("Tabuleiro Estrangeiro (Importado)");
    expect(result[0].mechanics.turnTime).toBe(90);
  });
});
