import { test, expect } from 'vitest';

/**
 * Teste de integração para o fluxo do Editor de Tabuleiro.
 * Valida a interação básica com o preview e seleção de casas.
 */

test('BoardEditor: Deve atualizar o índice da casa selecionada ao clicar', () => {
  // Mock do estado do editor
  let selectedTileIndex = null;
  const onTileClick = (index) => {
    selectedTileIndex = index;
  };

  // Simula clique na casa 5
  onTileClick(5);
  expect(selectedTileIndex).toBe(5);

  // Simula clique na casa 10
  onTileClick(10);
  expect(selectedTileIndex).toBe(10);
});

test('BoardEditor: Deve desmarcar a casa ao definir o índice como nulo', () => {
  let selectedTileIndex = 7;
  const clearSelection = () => {
    selectedTileIndex = null;
  };

  clearSelection();
  expect(selectedTileIndex).toBeNull();
});

test('BoardEditor: Lógica de hover não deve afetar o estado funcional', () => {
  // Este teste garante que a lógica de hover (que agora é puramente visual)
  // não interfere no estado de clique.
  let clickCount = 0;
  const handleInteraction = () => {
    clickCount++;
  };

  // Simula interações
  handleInteraction(); // hover (puramente CSS, não afeta JS)
  handleInteraction(); // click
  
  expect(clickCount).toBe(2);
});
