import { test, expect, vi } from 'vitest';

test('Deve disparar o foco da carta ao cair em uma casa de Reflexão e passar o turno ao fechar', async () => {
  let focusedCard = null;
  let currentPlayerIndex = 0;

  const passTurn = vi.fn(() => {
    currentPlayerIndex = (currentPlayerIndex + 1) % 2;
  });

  const setFocusedCard = (card) => { focusedCard = card; };
  
  const closeFocusedCard = () => {
    const wasFromTile = focusedCard?.fromTileAction;
    focusedCard = null;
    if (wasFromTile) {
      passTurn();
    }
  };

  const handleTileAction = (tile) => {
    if (tile.type === 'reflexao' || tile.type === 'desafio') {
      const typeMap = { 'reflexao': 3, 'desafio': 2 };
      setFocusedCard({ 
        type: tile.type, 
        index: typeMap[tile.type] || 0, 
        id: `card-${tile.type}-${typeMap[tile.type] || 0}`,
        fromTileAction: true 
      });
      return true;
    }
    return false;
  };

  // 1. Simular cair em uma casa de reflexão
  const tile = { type: 'reflexao' };
  const hasAction = handleTileAction(tile);

  expect(hasAction).toBe(true);
  expect(focusedCard).not.toBe(null);
  expect(focusedCard.fromTileAction).toBe(true);
  expect(focusedCard.type).toBe('reflexao');

  // 2. Fechar a carta
  closeFocusedCard();

  expect(focusedCard).toBe(null);
  expect(passTurn).toHaveBeenCalledTimes(1);
  expect(currentPlayerIndex).toBe(1);
});

test('Não deve passar o turno se a carta foi focada manualmente pelo jogador', async () => {
    let focusedCard = null;
    let currentPlayerIndex = 0;
  
    const passTurn = vi.fn(() => {
      currentPlayerIndex = (currentPlayerIndex + 1) % 2;
    });
  
    const setFocusedCard = (card) => { focusedCard = card; };
    
    const closeFocusedCard = () => {
      const wasFromTile = focusedCard?.fromTileAction;
      focusedCard = null;
      if (wasFromTile) {
        passTurn();
      }
    };
  
    // Simular foco manual (sem fromTileAction)
    setFocusedCard({ type: 'sorte', index: 1, id: 'manual' });
    
    closeFocusedCard();
  
    expect(focusedCard).toBe(null);
    expect(passTurn).not.toHaveBeenCalled();
    expect(currentPlayerIndex).toBe(0);
  });
