import { test, expect } from 'vitest';
import { DiaryEntry } from '../../../src/features/game/domain/entities/DiaryEntry';

test('DiaryEntry Entity - Deve criar e converter para JSON corretamente', () => {
  const entry = new DiaryEntry(123, 'Conteúdo do diário', 'reflexao', '2026-05-01T12:00:00Z', 'happy');
  
  expect(entry.id).toBe(123);
  expect(entry.text).toBe('Conteúdo do diário');
  expect(entry.type).toBe('reflexao');
  expect(entry.mood).toBe('happy');

  const json = entry.toJSON();
  expect(json.id).toBe(123);
  
  const fromJson = DiaryEntry.fromJSON(json);
  expect(fromJson instanceof DiaryEntry).toBe(true);
  expect(fromJson.text).toBe('Conteúdo do diário');
});

test('Diary Management Logic - Deve adicionar, editar e remover entradas', () => {
  let diaryEntries = [
    new DiaryEntry(1, 'Primeira entrada', 'reflexao', '2026-04-30T10:00:00Z', 'neutral')
  ];

  const addEntry = (text, type, mood) => {
    const newEntry = new DiaryEntry(Date.now(), text, type, new Date().toISOString(), mood);
    diaryEntries = [newEntry, ...diaryEntries];
  };

  const removeEntry = (id) => {
    diaryEntries = diaryEntries.filter(e => e.id !== id);
  };

  const updateEntry = (id, text) => {
    diaryEntries = diaryEntries.map(e => e.id === id ? { ...e, text } : e);
  };

  // Teste Adição
  addEntry('Segunda entrada', 'desafio', 'happy');
  expect(diaryEntries.length).toBe(2);
  expect(diaryEntries[0].text).toBe('Segunda entrada');
  expect(diaryEntries[0].mood).toBe('happy');

  // Teste Edição
  const secondId = diaryEntries[0].id;
  updateEntry(secondId, 'Segunda entrada editada');
  expect(diaryEntries.find(e => e.id === secondId).text).toBe('Segunda entrada editada');

  // Teste Remoção
  removeEntry(1);
  expect(diaryEntries.length).toBe(1);
  expect(diaryEntries.find(e => e.id === 1)).toBeUndefined();
});
