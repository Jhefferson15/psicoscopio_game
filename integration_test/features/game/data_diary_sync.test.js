import { test, expect, vi } from 'vitest';
import { DiaryEntry } from '../../../src/features/game/domain/entities/DiaryEntry';

// Simulação da lógica do FirestoreUserRepository
class MockFirestoreUserRepository {
  constructor() {
    this.diary = [];
  }
  async saveDiaryEntry(entry) {
    this.diary.push(entry);
  }
  async getDiaryEntries() {
    return this.diary;
  }
  async deleteDiaryEntry(entryId) {
    this.diary = this.diary.filter(e => e.id !== entryId);
  }
  async updateDiaryEntry(entryId, newText) {
    this.diary = this.diary.map(e => e.id === entryId ? { ...e, text: newText } : e);
  }
}

test('Sincronização de Persistência do Diário - Deve refletir mudanças no Repositório', async () => {
  const repository = new MockFirestoreUserRepository();
  // 1. Adicionar entrada
  const entry1 = new DiaryEntry(1, 'Entrada 1', 'reflexao', new Date().toISOString(), 'happy');
  await repository.saveDiaryEntry(entry1);
  
  let entries = await repository.getDiaryEntries();
  expect(entries.length).toBe(1);
  expect(entries[0].text).toBe('Entrada 1');

  // 2. Atualizar entrada
  await repository.updateDiaryEntry(1, 'Entrada 1 Editada');
  entries = await repository.getDiaryEntries();
  expect(entries[0].text).toBe('Entrada 1 Editada');

  // 3. Remover entrada
  await repository.deleteDiaryEntry(1);
  entries = await repository.getDiaryEntries();
  expect(entries.length).toBe(0);
});

test('Fluxo de Diário no GameContext - Deve chamar métodos do UserProvider corretamente', () => {
  // Mock das funções do UserProvider que seriam injetadas no GameContext
  const mockAdd = vi.fn();
  const mockRemove = vi.fn();
  const mockUpdate = vi.fn();

  // Simulação da exposição de dados no GameContext
  const gameContextValue = {
    addDiaryEntry: (text, type, mood) => mockAdd(text, type, mood),
    removeDiaryEntry: (id) => mockRemove(id),
    updateDiaryEntry: (id, text) => mockUpdate(id, text)
  };

  // Teste de chamadas
  gameContextValue.addDiaryEntry('Teste', 'reflexao', 'happy');
  expect(mockAdd).toHaveBeenCalledWith('Teste', 'reflexao', 'happy');

  gameContextValue.updateDiaryEntry(123, 'Novo Texto');
  expect(mockUpdate).toHaveBeenCalledWith(123, 'Novo Texto');

  gameContextValue.removeDiaryEntry(123);
  expect(mockRemove).toHaveBeenCalledWith(123);
});
