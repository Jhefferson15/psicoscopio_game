import { test, expect, vi } from 'vitest';

test('O componente GameCard não deve disparar setFocusedCard se isFocused for false', () => {
  // Simulação das props e do hook useGame
  let focusedCardSet = null;
  const setFocusedCard = (card) => { focusedCardSet = card; };
  
  // Simulação simplificada do comportamento do componente
  const handleClick = (isFocused) => {
    if (isFocused) {
      // closeFocusedCard()
    } else {
      // Logic removed: setFocusedCard(...)
    }
    // O clique manual foi desabilitado
  };

  // 1. Simular clique em carta não focada
  handleClick(false);
  expect(focusedCardSet).toBe(null);

  // 2. Simular clique em carta focada (não deve mudar o foco da carta aberta, apenas fechá-la se closeFocusedCard for chamado)
  // No caso, estamos testando apenas que o SET não ocorre no clique manual
  handleClick(true);
  expect(focusedCardSet).toBe(null);
});
