import { test, expect } from 'vitest';

/**
 * Teste de Integração para Mecânicas Dinâmicas do Editor de Tabuleiro.
 */

test('Deve respeitar a restrição de anel na movimentação circular', () => {
  // Simulação simplificada da nova lógica do GameContext
  const tiles = [
    { id: 'o1', ring: 'outer' }, { id: 'o2', ring: 'outer' },
    { id: 's1', ring: 'special' }, // special pertence ao level 1
    { id: 'm1', ring: 'middle' }, { id: 'm2', ring: 'middle' }
  ];

  const getLevel = (r) => (r === 'outer' || r === 'special') ? 1 : (r === 'middle' ? 2 : 3);
  
  const getNextPos = (currentIdx, steps) => {
    const currentRing = tiles[currentIdx].ring;
    const level = getLevel(currentRing);
    const ringIndices = tiles.map((t, idx) => getLevel(t.ring) === level ? idx : -1).filter(i => i !== -1);
    
    const relPos = ringIndices.indexOf(currentIdx);
    const newRelPos = (relPos + steps) % ringIndices.length;
    return ringIndices[newRelPos];
  };

  // Se estou na última casa do nível 1 (index 2 - s1) e ando 1, devo voltar para index 0 (o1)
  // e não ir para index 3 (m1)
  expect(getNextPos(2, 1)).toBe(0);
  
  // Se estou na última casa do nível 2 (index 4 - m2) e ando 1, devo voltar para index 3 (m1)
  expect(getNextPos(4, 1)).toBe(3);
});

test('Lógica de DRAW_2 deve sinalizar segunda compra', () => {
  const handleTileAction = (tile, setFocusedCard) => {
    if (tile.action === 'DRAW_2') {
      setFocusedCard({ 
        type: 'desafio', 
        fromTileAction: true,
        nextDraw: true 
      });
      return true;
    }
    return false;
  };

  let focusedCard = null;
  const setFocusedCard = (card) => { focusedCard = card; };

  const tile = { action: 'DRAW_2' };
  handleTileAction(tile, setFocusedCard);

  expect(focusedCard.nextDraw).toBe(true);
});

test('Ação de SKIP_TURN deve marcar o jogador para pular a vez', () => {
  const player = { name: 'Player 1', skipNextTurn: false };
  const tile = { action: 'SKIP_TURN' };

  const handleAction = (t, p) => {
    if (t.action === 'SKIP_TURN') {
      p.skipNextTurn = true;
    }
  };

  handleAction(tile, player);
  expect(player.skipNextTurn).toBe(true);
});

test('Passagem de turno deve consumir o SKIP_TURN e ir para o próximo', () => {
  const players = [
    { name: 'P1', skipNextTurn: false },
    { name: 'P2', skipNextTurn: true },
    { name: 'P3', skipNextTurn: false }
  ];
  let currentPlayerIndex = 0;

  const passTurn = () => {
    let nextIndex = (currentPlayerIndex + 1) % players.length;
    if (players[nextIndex].skipNextTurn) {
      players[nextIndex].skipNextTurn = false;
      nextIndex = (nextIndex + 1) % players.length;
    }
    currentPlayerIndex = nextIndex;
  };

  passTurn(); // De P1 para P2 (P2 pula) -> P3
  expect(currentPlayerIndex).toBe(2);
  expect(players[1].skipNextTurn).toBe(false);
});
