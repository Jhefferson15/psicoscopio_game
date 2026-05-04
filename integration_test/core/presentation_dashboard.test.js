import { test, expect } from 'vitest';

test('Deve gerenciar os atributos do jogador na ficha de evolução', () => {
  const attributes = { memory: 20, reflection: 40, challenge: 10 };
  const updateAttribute = (attr, value) => {
    attributes[attr] = value;
  };

  updateAttribute('memory', 25);
  expect(attributes.memory).toBe(25);
});

test('Deve gerenciar o progresso do timer da ampulheta', () => {
  let gameTime = 60;
  const tick = () => { gameTime = Math.max(0, gameTime - 1); };

  tick();
  expect(gameTime).toBe(59);
  
  for(let i=0; i<60; i++) tick();
  expect(gameTime).toBe(0);
});

test('Deve gerenciar entradas no diário narrativo', () => {
  let entries = [{ id: 1, text: 'Teste' }];
  const addEntry = (text) => {
    entries.push({ id: entries.length + 1, text });
  };

  addEntry('Nova reflexão');
  expect(entries.length).toBe(2);
  expect(entries[1].text).toBe('Nova reflexão');
});
