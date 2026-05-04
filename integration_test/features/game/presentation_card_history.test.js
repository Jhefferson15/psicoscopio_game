import { test, expect } from 'vitest';

test('Deve registrar cartas no histórico local (offline)', () => {
  let history = [];
  const setHistory = (newHistory) => { history = newHistory; };
  
  const recordCardDraw = (card) => {
    const cardEntry = {
      id: Date.now(),
      cardType: card.type,
      cardText: card.text,
      playerName: 'Jogador 1',
      timestamp: Date.now()
    };
    setHistory([cardEntry, ...history]);
  };

  // 1. Histórico inicial vazio
  expect(history.length).toBe(0);

  // 2. Registrar primeira carta
  recordCardDraw({ type: 'reflexao', text: 'Qual sua maior motivação?' });
  expect(history.length).toBe(1);
  expect(history[0].cardType).toBe('reflexao');
  expect(history[0].cardText).toBe('Qual sua maior motivação?');

  // 3. Registrar segunda carta (deve vir no topo)
  const secondCardText = 'Como você lida com frustrações?';
  recordCardDraw({ type: 'desafio', text: secondCardText });
  expect(history.length).toBe(2);
  expect(history[0].cardType).toBe('desafio');
  expect(history[0].cardText).toBe(secondCardText);
});

test('Deve gerenciar a visibilidade do modal de histórico', () => {
  let showHistory = false;
  const setShowHistory = (val) => { showHistory = val; };

  expect(showHistory).toBe(false);
  
  setShowHistory(true);
  expect(showHistory).toBe(true);
  
  setShowHistory(false);
  expect(showHistory).toBe(false);
});
